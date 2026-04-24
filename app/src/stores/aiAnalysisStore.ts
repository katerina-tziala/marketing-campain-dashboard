import { defineStore } from 'pinia'
import { ref, reactive, watch, computed } from 'vue'
import type { AsyncStatus } from '../common/types/async-status'
import type {
  AiAnalysisTab,
  AiAnalysisError,
  AiErrorCode,
  BudgetOptimizerResponse,
  ExecutiveSummaryResponse,
} from '../features/ai-tools/types'
import { useAiStore } from './aiStore'
import { useCampaignStore } from './campaignStore'
import { generateBudgetOptimizationPrompt } from '../features/ai-tools/prompts'
import { generateExecutiveSummaryPrompt } from '../features/ai-tools/prompts'
import { runProviderPrompt } from '../features/ai-tools/providers'
import { ANALYSIS_ERROR_MESSAGES } from '../features/ai-tools/ai-analysis/utils/analysis-error-messages'

// ── Constants ──────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 300
const COOLDOWN_MS = 5_000
const ALL_LABELS_KEY = 'all'

// ── Per-tab state shape ────────────────────────────────────────────────────

type TabResponse = BudgetOptimizerResponse | ExecutiveSummaryResponse

type CacheEntry = {
  response: TabResponse
  timestamp: number
  cooldownUntil: number
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

// ── Store ──────────────────────────────────────────────────────────────────

export const useAiAnalysisStore = defineStore('aiAnalysis', () => {
  const aiStore = useAiStore()
  const campaignStore = useCampaignStore()

  // ── Shared state ──────────────────────────────────────────────────────

  const activeTab = ref<AiAnalysisTab>('summary')
  const tokenLimitReached = ref(false)
  const analysisActivated = ref(false)

  // ── Per-tab internal state ────────────────────────────────────────────

  const tabs = {
    optimizer: createTabState(),
    summary: createTabState(),
  }

  // ── Per-tab reactive display state ────────────────────────────────────

  const optimizer = reactive({
    status: 'idle' as AsyncStatus,
    response: null as BudgetOptimizerResponse | null,
    error: null as AiAnalysisError | null,
    errorFallback: null as string | null,
  })

  const summary = reactive({
    status: 'idle' as AsyncStatus,
    response: null as ExecutiveSummaryResponse | null,
    error: null as AiAnalysisError | null,
    errorFallback: null as string | null,
  })

  // ── Helpers ───────────────────────────────────────────────────────────

  function normalizeLabels(labels: string[]): string[] {
    if (labels.length === 0) return [ALL_LABELS_KEY]
    return [...labels].map((label) => label.trim().toLowerCase()).sort()
  }

  function createCacheKey(labels: string[], provider: string): string {
    return `${provider}::${normalizeLabels(labels).join('|')}`
  }

  function getTabState(tab: AiAnalysisTab) {
    return tabs[tab]
  }

  function getDisplay(tab: AiAnalysisTab) {
    return tab === 'optimizer' ? optimizer : summary
  }

  function getCurrentCacheKey(): string | null {
    if (!aiStore.provider || !aiStore.selectedModel) return null
    return createCacheKey(campaignStore.selectedChannelsIds, aiStore.provider)
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

  function canAnalyze(tab: AiAnalysisTab): boolean {
    void cooldownTick.value // reactive dependency — triggers re-evaluation when cooldown expires
    const tabState = getTabState(tab)
    const cacheKey = getCurrentCacheKey()
    if (!cacheKey) return false
    const entry = tabState.cache.get(cacheKey)
    if (!entry) return true
    return Date.now() >= entry.cooldownUntil
  }

  const optimizerCanAnalyze = computed(() => {
    if (optimizer.status === 'loading') return false
    return canAnalyze('optimizer')
  })

  const summaryCanAnalyze = computed(() => {
    if (summary.status === 'loading') return false
    return canAnalyze('summary')
  })

  // ── Cancel ────────────────────────────────────────────────────────────

  function cancelActiveRequest(tab: AiAnalysisTab): void {
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
    cancelActiveRequest('optimizer')
    cancelActiveRequest('summary')
  }

  // ── Prompt builder ────────────────────────────────────────────────────

  function buildPrompt(tab: AiAnalysisTab): string {
    const analysis = campaignStore.portfolioAnalysis
    const isFiltered = campaignStore.selectedChannelsIds.length > 0
    return tab === 'optimizer'
      ? generateBudgetOptimizationPrompt(analysis, isFiltered)
      : generateExecutiveSummaryPrompt(analysis, isFiltered)
  }

  // ── Error handling ────────────────────────────────────────────────────

  function handleRequestError(tab: AiAnalysisTab, error: unknown, cacheKey: string): void {
    const tabState = getTabState(tab)
    const display = getDisplay(tab)
    const code = error instanceof Error ? (error.message as AiErrorCode) : 'unknown'
    const message = ANALYSIS_ERROR_MESSAGES[code] ?? ANALYSIS_ERROR_MESSAGES.unknown

    if (code === 'token-limit') {
      if (aiStore.selectedModel) {
        aiStore.markModelLimitReached(aiStore.selectedModel.id)
      }

      // Silent fallback: try next available model without showing error
      if (aiStore.selectNextAvailableModel()) {
        executeAnalysis(tab, false)
        return
      }

      // All models exhausted
      tokenLimitReached.value = true
    }

    const entry = tabState.cache.get(cacheKey)
    if (entry) {
      // Case 1: cached response exists — keep showing it
      display.status = 'done'
      display.response = entry.response as unknown as typeof display.response
      display.error = null
      display.errorFallback = 'The latest request failed. Showing the previous generated result.'
    } else {
      // Case 2: no cache — show error
      display.status = 'error'
      display.response = null
      display.error = { code, message }
      display.errorFallback = null
    }
  }

  // ── Core analyze ──────────────────────────────────────────────────────

  async function executeAnalysis(tab: AiAnalysisTab, isAutomatic: boolean): Promise<void> {
    if (!aiStore.provider || !aiStore.selectedModel || !aiStore.apiKey) return
    if (!aiStore.aiPanelOpen) return

    // Empty dataset guard
    if (campaignStore.filteredCampaigns.length === 0) return

    const cacheKey = getCurrentCacheKey()
    if (!cacheKey) return

    const tabState = getTabState(tab)
    const display = getDisplay(tab)

    // Token limit: try next model silently, or show cached if all exhausted
    if (aiStore.selectedModelLimitReached) {
      if (!aiStore.selectNextAvailableModel()) {
        tokenLimitReached.value = true
      }
    }
    if (tokenLimitReached.value) {
      const entry = tabState.cache.get(cacheKey)
      if (entry) {
        display.status = 'done'
        display.response = entry.response as unknown as typeof display.response
        display.error = null
        display.errorFallback = null
      }
      return
    }

    // Check cache for automatic calls
    if (isAutomatic) {
      const entry = tabState.cache.get(cacheKey)
      if (entry) {
        display.status = 'done'
        display.response = entry.response as unknown as typeof display.response
        display.error = null
        display.errorFallback = null
        tabState.lastVisibleCacheKey = cacheKey
        return
      }
    }

    // Cancel any running request on the OTHER tab (global single-request rule)
    const otherTab: AiAnalysisTab = tab === 'optimizer' ? 'summary' : 'optimizer'
    const otherTabState = getTabState(otherTab)
    const otherDisplay = getDisplay(otherTab)
    if (otherTabState.controller) {
      cancelActiveRequest(otherTab)
      // Revert other tab to its last state
      const otherCacheKey = otherTabState.lastVisibleCacheKey
      if (otherCacheKey) {
        const otherEntry = otherTabState.cache.get(otherCacheKey)
        if (otherEntry) {
          otherDisplay.status = 'done'
          otherDisplay.response = otherEntry.response as unknown as typeof otherDisplay.response
        }
      } else {
        otherDisplay.status = 'idle'
      }
      otherDisplay.error = null
      otherDisplay.errorFallback = null
    }

    // Cancel current tab's running request
    cancelActiveRequest(tab)

    // Start loading
    display.status = 'loading'
    display.response = null
    display.error = null
    display.errorFallback = null

    const controller = new AbortController()
    tabState.controller = controller

    try {
      const prompt = buildPrompt(tab)

      const result = await runProviderPrompt<TabResponse>(
        aiStore.provider,
        aiStore.apiKey,
        aiStore.selectedModel.id,
        prompt,
        controller.signal,
      )

      // Check if this request was cancelled (stale)
      if (controller.signal.aborted) return

      // Stamp the model and timestamp onto the response
      const now = Date.now()
      if (aiStore.selectedModel) {
        result.model = { ...aiStore.selectedModel }
      }
      result.timestamp = now

      // Success
      display.status = 'done'
      display.response = result as unknown as typeof display.response
      display.error = null
      display.errorFallback = null
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

  function analyze(tab: AiAnalysisTab): void {
    const display = getDisplay(tab)
    display.errorFallback = null
    analysisActivated.value = true
    executeAnalysis(tab, false)
  }

  function setActiveTab(tab: AiAnalysisTab): void {
    if (activeTab.value === tab) return

    const prevTab = activeTab.value
    activeTab.value = tab

    // Cancel in-flight request on the previous tab
    const prevTabState = getTabState(prevTab)
    const prevDisplay = getDisplay(prevTab)
    if (prevTabState.controller) {
      cancelActiveRequest(prevTab)
      // Revert previous tab
      const prevCacheKey = prevTabState.lastVisibleCacheKey
      if (prevCacheKey) {
        const prevEntry = prevTabState.cache.get(prevCacheKey)
        if (prevEntry) {
          prevDisplay.status = 'done'
          prevDisplay.response = prevEntry.response as unknown as typeof prevDisplay.response
        }
      } else if (prevDisplay.status === 'loading') {
        prevDisplay.status = 'idle'
      }
      prevDisplay.error = null
      prevDisplay.errorFallback = null
    }

    // Reopen evaluation for the new tab
    evaluateTab(tab)
  }

  function evaluateTab(tab: AiAnalysisTab): void {
    if (!aiStore.aiPanelOpen) return
    if (!aiStore.provider || !aiStore.selectedModel) return
    if (campaignStore.filteredCampaigns.length === 0) return

    const tabState = getTabState(tab)
    const display = getDisplay(tab)
    const cacheKey = getCurrentCacheKey()
    if (!cacheKey) return

    // Show last visible result first
    if (tabState.lastVisibleCacheKey && tabState.lastVisibleCacheKey === cacheKey) {
      const entry = tabState.cache.get(cacheKey)
      if (entry) {
        display.status = 'done'
        display.response = entry.response as unknown as typeof display.response
        display.error = null
        display.errorFallback = null
        return
      }
    }

    // Check cache
    const entry = tabState.cache.get(cacheKey)
    if (entry) {
      display.status = 'done'
      display.response = entry.response as unknown as typeof display.response
      display.error = null
      display.errorFallback = null
      tabState.lastVisibleCacheKey = cacheKey
      return
    }

    // Auto-call if user has triggered analysis on any tab and not token-limited
    if (analysisActivated.value && !tokenLimitReached.value) {
      executeAnalysis(tab, true)
    }
  }

  // ── CSV upload reset ──────────────────────────────────────────────────

  function clearStateForNewCSV(): void {
    cancelAllRequests()
    clearCooldownTimers()
    tokenLimitReached.value = false
    analysisActivated.value = false

    for (const tab of ['optimizer', 'summary'] as AiAnalysisTab[]) {
      const tabState = getTabState(tab)
      const display = getDisplay(tab)
      tabState.firstAnalyzeCompleted = false
      tabState.controller = null
      tabState.debounceTimer = null
      tabState.cache.clear()
      tabState.lastVisibleCacheKey = null
      display.status = 'idle'
      display.response = null
      display.error = null
      display.errorFallback = null
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
    for (const tab of ['optimizer', 'summary'] as AiAnalysisTab[]) {
      const tabState = getTabState(tab)
      const display = getDisplay(tab)
      if (display.status === 'loading') {
        const lastKey = tabState.lastVisibleCacheKey
        if (lastKey) {
          const entry = tabState.cache.get(lastKey)
          if (entry) {
            display.status = 'done'
            display.response = entry.response as unknown as typeof display.response
          } else {
            display.status = 'idle'
          }
        } else {
          display.status = 'idle'
        }
        display.error = null
        display.errorFallback = null
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
      const display = getDisplay(tab)

      if (!analysisActivated.value) return
      if (!aiStore.aiPanelOpen) return
      if (!aiStore.provider || !aiStore.selectedModel) return

      // Cancel current request
      cancelActiveRequest(tab)

      // Debounce
      tabState.debounceTimer = setTimeout(() => {
        tabState.debounceTimer = null

        if (!aiStore.aiPanelOpen) return
        if (campaignStore.filteredCampaigns.length === 0) return

        const cacheKey = getCurrentCacheKey()
        if (!cacheKey) return

        // Check cache first
        const entry = tabState.cache.get(cacheKey)
        if (entry) {
          display.status = 'done'
          display.response = entry.response as unknown as typeof display.response
          display.error = null
          display.errorFallback = null
          tabState.lastVisibleCacheKey = cacheKey
          return
        }

        // Token limit: try next model or stop
        if (aiStore.selectedModelLimitReached) {
          if (!aiStore.selectNextAvailableModel()) {
            tokenLimitReached.value = true
          }
        }
        if (tokenLimitReached.value) return

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
      if (!aiStore.aiPanelOpen) return
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
    optimizer,
    summary,
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
