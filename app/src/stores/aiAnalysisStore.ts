import { defineStore } from 'pinia'
import { ref, watch, computed, type Ref } from 'vue'
import type { AsyncStatus } from '../common/types/async-status'
import type { AiAnalysisType, AiAnalysisError, AiErrorCode, AiAnalysisNotice } from '../features/ai-tools/types'
import type {
  AnalysisResponse,
  BudgetOptimizerResponse,
  ExecutiveSummaryResponse,
} from '../features/ai-tools/ai-analysis/types'
import { useAiConnectionStore } from '../features/ai-tools/ai-connection/stores'
import { useCampaignStore } from './campaignStore'
import { runAnalysisPrompt, getCacheKey } from '../features/ai-tools/ai-analysis/utils'

// ── Constants ──────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 350
const COOLDOWN_MS = 5_000
const MIN_OPTIMIZER_CAMPAIGNS = 2

const OPTIMIZER_MIN_CAMPAIGNS_ERROR: AiAnalysisError = {
  code: 'min-campaigns',
}

// ── Per-tab state shape ────────────────────────────────────────────────────

type CacheEntry = {
  response: AnalysisResponse
  timestamp: number
  cooldownUntil: number
}

type TabDisplay<T extends AnalysisResponse = AnalysisResponse> = {
  status: AsyncStatus
  response: T | null
  error: AiAnalysisError | null
  notice: AiAnalysisNotice | null
}

function createTabState() {
  return {
    firstAnalyzeCompleted: false,
    controller: null as AbortController | null,
    debounceTimer: null as ReturnType<typeof setTimeout> | null,
    cache: new Map<string, CacheEntry>(),
    lastVisibleCacheKey: null as string | null,
  }
}

// ── Module-level helpers ───────────────────────────────────────────────────

function getOtherAnalysisType(type: AiAnalysisType): AiAnalysisType {
  return type === 'budgetOptimizer' ? 'executiveSummary' : 'budgetOptimizer'
}

function setDisplay(
  display: Ref<TabDisplay>,
  status: AsyncStatus,
  response: AnalysisResponse | null = null,
  error: AiAnalysisError | null = null,
  notice: AiAnalysisNotice | null = null,
): void {
  display.value = { status, response, error, notice }
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useAiAnalysisStore = defineStore('aiAnalysis', () => {
  const aiStore = useAiConnectionStore()
  const campaignStore = useCampaignStore()

  // ── Shared state ──────────────────────────────────────────────────────

  const activeTab = ref<AiAnalysisType>('executiveSummary')
  const analysisActivated = ref(false)

  // ── Per-tab internal state ────────────────────────────────────────────

  const tabs = {
    budgetOptimizer: createTabState(),
    executiveSummary: createTabState(),
  }

  // ── Per-tab reactive display state ────────────────────────────────────

  const budgetOptimizer = ref<TabDisplay<BudgetOptimizerResponse>>({
    status: 'idle',
    response: null,
    error: null,
    notice: null,
  })

  const executiveSummary = ref<TabDisplay<ExecutiveSummaryResponse>>({
    status: 'idle',
    response: null,
    error: null,
    notice: null,
  })

  // ── Getters derived from aiStore ──────────────────────────────────────

  const tokenLimitReached = computed(() => aiStore.allModelsLimitReached)

  // ── Evaluation guard ──────────────────────────────────────────────────

  const evaluationDisabled = computed(() =>
    aiStore.evaluationDisabled || campaignStore.filteredCampaigns.length === 0,
  )

  // ── Helpers ───────────────────────────────────────────────────────────

  function getTabState(tab: AiAnalysisType) {
    return tabs[tab]
  }

  function getDisplay(tab: AiAnalysisType): Ref<TabDisplay> {
    return (tab === 'budgetOptimizer' ? budgetOptimizer : executiveSummary) as Ref<TabDisplay>
  }

  function getCurrentCacheKey(): string {
    return getCacheKey(campaignStore.selectedChannelsIds, aiStore.provider!)
  }

  function showTokenLimitState(tab: AiAnalysisType): void {
    const cacheKey = getCurrentCacheKey()
    const tabState = getTabState(tab)
    const display = getDisplay(tab)
    const entry = tabState.cache.get(cacheKey)
    if (entry) {
      setDisplay(display, 'done', entry.response)
      tabState.lastVisibleCacheKey = cacheKey
    } else {
      setDisplay(display, 'error', null, { code: 'token-limit' })
    }
  }

  // ── Cooldown check ────────────────────────────────────────────────────

  const cooldownTick = ref(0)
  const cooldownTimers: Set<ReturnType<typeof setTimeout>> = new Set()

  function scheduleCooldownExpiry(): void {
    const timer = setTimeout(() => {
      cooldownTimers.delete(timer)
      cooldownTick.value++
    }, COOLDOWN_MS)
    cooldownTimers.add(timer)
  }

  function clearCooldownTimers(): void {
    for (const timer of cooldownTimers) clearTimeout(timer)
    cooldownTimers.clear()
  }

  function canAnalyze(tab: AiAnalysisType): boolean {
    void cooldownTick.value // reactive dependency — triggers re-evaluation when cooldown expires
    if (!aiStore.provider) return false
    const tabState = getTabState(tab)
    const cacheKey = getCurrentCacheKey()
    const entry = tabState.cache.get(cacheKey)
    if (!entry) return true
    return Date.now() >= entry.cooldownUntil
  }

  const optimizerCanAnalyze = computed(() => {
    if (budgetOptimizer.value.status === 'loading') return false
    if (tokenLimitReached.value) return false
    if (campaignStore.filteredCampaigns.length < MIN_OPTIMIZER_CAMPAIGNS) return false
    return canAnalyze('budgetOptimizer')
  })

  const summaryCanAnalyze = computed(() => {
    if (executiveSummary.value.status === 'loading') return false
    if (tokenLimitReached.value) return false
    return canAnalyze('executiveSummary')
  })

  // ── Cancel ────────────────────────────────────────────────────────────

  function cancelActiveRequest(tab: AiAnalysisType): void {
    const tabState = getTabState(tab)
    if (tabState.controller) {
      tabState.controller.abort()
      tabState.controller = null
    }
    if (tabState.debounceTimer) {
      clearTimeout(tabState.debounceTimer)
      tabState.debounceTimer = null
    }
  }

  function cancelAllRequests(): void {
    cancelActiveRequest('budgetOptimizer')
    cancelActiveRequest('executiveSummary')
  }

  // ── Error handling ────────────────────────────────────────────────────

  function handleRequestError(tab: AiAnalysisType, error: unknown, cacheKey: string): void {
    const tabState = getTabState(tab)
    const display = getDisplay(tab)
    const code = error instanceof Error ? (error.message as AiErrorCode) : 'unknown'
    const rawMessage = error instanceof Error ? error.message : undefined

    if (code === 'token-limit') {
      if (aiStore.selectedModel) {
        aiStore.markModelLimitReached(aiStore.selectedModel.id)
      }

      // Silent fallback: try next available model without showing error
      if (aiStore.selectNextAvailableModel()) {
        executeAnalysis(tab, false)
        return
      }

      // All models exhausted — fall through to show cache or error below
    }

    const entry = tabState.cache.get(cacheKey)
    if (entry) {
      setDisplay(display, 'done', entry.response, null, { code: 'stale-result' })
    } else {
      setDisplay(display, 'error', null, { code, rawMessage })
    }
  }

  // ── Core analyze ──────────────────────────────────────────────────────

  async function executeAnalysis(tab: AiAnalysisType, isAutomatic: boolean): Promise<void> {
    if (evaluationDisabled.value) return
    
    const provider = aiStore.provider!
    const apiKey = aiStore.apiKey
    const selectedModel = aiStore.selectedModel!

    if (tab === 'budgetOptimizer' && campaignStore.filteredCampaigns.length < MIN_OPTIMIZER_CAMPAIGNS) {
      setDisplay(getDisplay(tab), 'error', null, OPTIMIZER_MIN_CAMPAIGNS_ERROR)
      return
    }

    const cacheKey = getCurrentCacheKey()
    const tabState = getTabState(tab)
    const display = getDisplay(tab)

    // Token limit pre-flight: if selected model is exhausted, try next; if all exhausted, show cache or error
    if (aiStore.selectedModelLimitReached) {
      if (!aiStore.selectNextAvailableModel()) {
        showTokenLimitState(tab)
        return
      }
    }

    // Check cache for automatic calls
    if (isAutomatic) {
      const entry = tabState.cache.get(cacheKey)
      if (entry) {
        setDisplay(display, 'done', entry.response)
        tabState.lastVisibleCacheKey = cacheKey
        return
      }
    }

    // Cancel any running request on the OTHER tab (global single-request rule)
    const otherTab = getOtherAnalysisType(tab)
    const otherTabState = getTabState(otherTab)
    if (otherTabState.controller) {
      cancelActiveRequest(otherTab)
      const otherCacheKey = otherTabState.lastVisibleCacheKey
      const otherEntry = otherCacheKey ? otherTabState.cache.get(otherCacheKey) : null
      setDisplay(getDisplay(otherTab), otherEntry ? 'done' : 'idle', otherEntry?.response ?? null)
    }

    // Cancel current tab's running request and start loading
    cancelActiveRequest(tab)
    setDisplay(display, 'loading')

    const controller = new AbortController()
    tabState.controller = controller

    try {
      const result = await runAnalysisPrompt(
        { provider, apiKey, selectedModel },
        { type: tab, analysis: campaignStore.portfolioAnalysis, isFiltered: campaignStore.selectedChannelsIds.length > 0 },
        controller.signal,
      )

      if (!result) return

      // Success
      const now = result.timestamp!
      setDisplay(display, 'done', result)
      tabState.firstAnalyzeCompleted = true
      tabState.cache.set(cacheKey, { response: result, timestamp: now, cooldownUntil: now + COOLDOWN_MS })
      scheduleCooldownExpiry()
      tabState.lastVisibleCacheKey = cacheKey
      tabState.controller = null
    } catch (error) {
      // Silently ignore cancelled requests
      if (controller.signal.aborted) return

      tabState.controller = null
      handleRequestError(tab, error, cacheKey)
    }
  }

  // ── Public actions ────────────────────────────────────────────────────

  function analyze(tab: AiAnalysisType): void {
    const display = getDisplay(tab)
    display.value = { ...display.value, notice: null }
    analysisActivated.value = true
    executeAnalysis(tab, false)
  }

  function setActiveTab(tab: AiAnalysisType): void {
    if (activeTab.value === tab) return

    const prevTab = activeTab.value
    activeTab.value = tab

    // Cancel in-flight request on the previous tab and revert to last known state
    const prevTabState = getTabState(prevTab)
    if (prevTabState.controller) {
      cancelActiveRequest(prevTab)
      const prevCacheKey = prevTabState.lastVisibleCacheKey
      const prevEntry = prevCacheKey ? prevTabState.cache.get(prevCacheKey) : null
      setDisplay(getDisplay(prevTab), prevEntry ? 'done' : 'idle', prevEntry?.response ?? null)
    }

    // Reopen evaluation for the new tab
    evaluateTab(tab)
  }

  function evaluateTab(tab: AiAnalysisType): void {
    if (evaluationDisabled.value) {
      if (tokenLimitReached.value) showTokenLimitState(tab)
      return
    }

    if (tab === 'budgetOptimizer' && campaignStore.filteredCampaigns.length < MIN_OPTIMIZER_CAMPAIGNS) {
      setDisplay(getDisplay(tab), 'error', null, OPTIMIZER_MIN_CAMPAIGNS_ERROR)
      return
    }

    const tabState = getTabState(tab)
    const display = getDisplay(tab)
    const cacheKey = getCurrentCacheKey()

    // Show last visible result first
    if (tabState.lastVisibleCacheKey && tabState.lastVisibleCacheKey === cacheKey) {
      const entry = tabState.cache.get(cacheKey)
      if (entry) {
        setDisplay(display, 'done', entry.response)
        return
      }
    }

    // Check cache
    const entry = tabState.cache.get(cacheKey)
    if (entry) {
      setDisplay(display, 'done', entry.response)
      tabState.lastVisibleCacheKey = cacheKey
      return
    }

    // Auto-call if user has triggered analysis on any tab
    if (analysisActivated.value) {
      executeAnalysis(tab, true)
    }
  }

  // ── CSV upload reset ──────────────────────────────────────────────────

  function clearStateForNewCSV(): void {
    cancelAllRequests()
    clearCooldownTimers()
    analysisActivated.value = false

    for (const tab of ['budgetOptimizer', 'executiveSummary'] as AiAnalysisType[]) {
      const tabState = getTabState(tab)
      tabState.firstAnalyzeCompleted = false
      tabState.controller = null
      tabState.debounceTimer = null
      tabState.cache.clear()
      tabState.lastVisibleCacheKey = null
      setDisplay(getDisplay(tab), 'idle')
    }
  }

  // ── Disconnect reset ──────────────────────────────────────────────────

  function clearStateForDisconnect(): void {
    clearStateForNewCSV()
  }

  // ── Panel open/close handling ─────────────────────────────────────────

  function onPanelOpen(): void {
    evaluateTab(activeTab.value)
  }

  function onPanelClose(): void {
    // Cancel any in-flight requests but keep state
    cancelAllRequests()

    // Revert loading tabs to their last known state
    for (const tab of ['budgetOptimizer', 'executiveSummary'] as AiAnalysisType[]) {
      const display = getDisplay(tab)
      if (display.value.status === 'loading') {
        const tabState = getTabState(tab)
        const lastKey = tabState.lastVisibleCacheKey
        const entry = lastKey ? tabState.cache.get(lastKey) : null
        setDisplay(display, entry ? 'done' : 'idle', entry?.response ?? null)
      }
    }
  }

  // ── Watchers ──────────────────────────────────────────────────────────

  // Watch label (channel filter) changes — debounced auto-call
  watch(
    () => [...campaignStore.selectedChannelsIds],
    () => {
      const tab = activeTab.value
      const tabState = getTabState(tab)

      if (!analysisActivated.value) return

      // Token-limited: update display for new filter immediately (no API call possible)
      if (tokenLimitReached.value) {
        showTokenLimitState(tab)
        return
      }

      if (evaluationDisabled.value) return

      // Cancel current request
      cancelActiveRequest(tab)

      // Debounce
      tabState.debounceTimer = setTimeout(() => {
        tabState.debounceTimer = null

        if (evaluationDisabled.value) return

        if (tab === 'budgetOptimizer' && campaignStore.filteredCampaigns.length < MIN_OPTIMIZER_CAMPAIGNS) {
          setDisplay(getDisplay(tab), 'error', null, OPTIMIZER_MIN_CAMPAIGNS_ERROR)
          return
        }

        const cacheKey = getCurrentCacheKey()

        // Check cache first
        const entry = tabState.cache.get(cacheKey)
        if (entry) {
          setDisplay(getDisplay(tab), 'done', entry.response)
          tabState.lastVisibleCacheKey = cacheKey
          return
        }



        // Auto-call
        executeAnalysis(tab, true)
      }, DEBOUNCE_MS)
    },
    { deep: true },
  )

  // Watch model changes — show cached data or auto-call
  watch(
    () => aiStore.selectedModel,
    () => {
      if (!analysisActivated.value) return
      if (evaluationDisabled.value) return
      evaluateTab(activeTab.value)
    },
  )

  // Watch CSV upload — reset everything
  watch(
    () => campaignStore.campaigns,
    (newVal, oldVal) => {
      // Only trigger on actual campaign data change (not initial load)
      if (oldVal.length > 0 && newVal !== oldVal) {
        clearStateForNewCSV()
      }
    },
  )

  return {
    // Shared
    activeTab,
    tokenLimitReached,
    analysisActivated,
    // Per-tab reactive display state
    budgetOptimizer,
    executiveSummary,
    // Computed
    optimizerCanAnalyze,
    summaryCanAnalyze,
    // Actions
    analyze,
    setActiveTab,
    onPanelOpen,
    onPanelClose,
    clearStateForNewCSV,
    clearStateForDisconnect,
  }
})
