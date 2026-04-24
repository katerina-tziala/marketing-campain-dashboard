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
import type { BudgetOptimizerAnalysis } from '../common/analysis/budget-optimization-analysis.types'
import type { SummaryAnalysis } from '../common/analysis/executive-summary-analysis.types'
import { useAiStore } from './aiStore'
import { useCampaignStore } from './campaignStore'
import { computeBudgetOptimizerAnalysis } from '../common/analysis/budget-optimization-analysis'
import { computeSummaryAnalysis } from '../common/analysis/executive-summary-analysis'
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
    dataCache: new Map<string, BudgetOptimizerAnalysis | SummaryAnalysis>(),
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
    return [...labels].map((l) => l.trim().toLowerCase()).sort()
  }

  function createCacheKey(labels: string[], provider: string): string {
    return `${provider}::${normalizeLabels(labels).join('|')}`
  }

  function createDataCacheKey(labels: string[]): string {
    return normalizeLabels(labels).join('|')
  }

  function getTab(tab: AiAnalysisTab) {
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
    const t = getTab(tab)
    const key = getCurrentCacheKey()
    if (!key) return false
    const entry = t.cache.get(key)
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
    const t = getTab(tab)
    if (t.controller) {
      t.controller.abort()
      t.controller = null
    }
    if (t.debounceTimer) {
      clearTimeout(t.debounceTimer)
      t.debounceTimer = null
    }
  }

  function cancelAllRequests(): void {
    cancelActiveRequest('optimizer')
    cancelActiveRequest('summary')
  }

  // ── Data builders ─────────────────────────────────────────────────────

  function getOrBuildData(tab: AiAnalysisTab): BudgetOptimizerAnalysis | SummaryAnalysis {
    const t = getTab(tab)
    const dataKey = createDataCacheKey(campaignStore.selectedChannelsIds)
    const cached = t.dataCache.get(dataKey)
    if (cached) return cached

    const data = tab === 'optimizer'
      ? computeBudgetOptimizerAnalysis(
          campaignStore.filteredCampaigns,
          campaignStore.selectedChannels,
          campaignStore.kpis,
          campaignStore.portfolioScope,
        )
      : computeSummaryAnalysis(
          campaignStore.filteredCampaigns,
          campaignStore.selectedChannels,
          campaignStore.kpis,
          campaignStore.portfolioScope,
        )

    t.dataCache.set(dataKey, data)
    return data
  }

  // ── Prompt builders ───────────────────────────────────────────────────

  function buildPrompt(tab: AiAnalysisTab): string {
    const data = getOrBuildData(tab)
    const isFiltered = campaignStore.selectedChannelsIds.length > 0
    console.log(data)

    if (tab === 'optimizer') {
      return generateBudgetOptimizationPrompt(data as BudgetOptimizerAnalysis, isFiltered)
    }
    return generateExecutiveSummaryPrompt(
      data as SummaryAnalysis,
      isFiltered,
    )
  }

  // ── Error handling ────────────────────────────────────────────────────

  function handleRequestError(tab: AiAnalysisTab, e: unknown, cacheKey: string): void {
    const t = getTab(tab)
    const d = getDisplay(tab)
    const code = e instanceof Error ? (e.message as AiErrorCode) : 'unknown'
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

    const entry = t.cache.get(cacheKey)
    if (entry) {
      // Case 1: cached response exists — keep showing it
      d.status = 'done'
      d.response = entry.response as unknown as typeof d.response
      d.error = null
      d.errorFallback = 'The latest request failed. Showing the previous generated result.'
    } else {
      // Case 2: no cache — show error
      d.status = 'error'
      d.response = null
      d.error = { code, message }
      d.errorFallback = null
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

    const t = getTab(tab)
    const d = getDisplay(tab)

    // Token limit: try next model silently, or show cached if all exhausted
    if (aiStore.selectedModelLimitReached) {
      if (!aiStore.selectNextAvailableModel()) {
        tokenLimitReached.value = true
      }
    }
    if (tokenLimitReached.value) {
      const entry = t.cache.get(cacheKey)
      if (entry) {
        d.status = 'done'
        d.response = entry.response as unknown as typeof d.response
        d.error = null
        d.errorFallback = null
      }
      return
    }

    // Check cache for automatic calls
    if (isAutomatic) {
      const entry = t.cache.get(cacheKey)
      if (entry) {
        d.status = 'done'
        d.response = entry.response as unknown as typeof d.response
        d.error = null
        d.errorFallback = null
        t.lastVisibleCacheKey = cacheKey
        return
      }
    }

    // Cancel any running request on the OTHER tab (global single-request rule)
    const otherTab: AiAnalysisTab = tab === 'optimizer' ? 'summary' : 'optimizer'
    const otherT = getTab(otherTab)
    const otherD = getDisplay(otherTab)
    if (otherT.controller) {
      cancelActiveRequest(otherTab)
      // Revert other tab to its last state
      const otherCacheKey = otherT.lastVisibleCacheKey
      if (otherCacheKey) {
        const otherEntry = otherT.cache.get(otherCacheKey)
        if (otherEntry) {
          otherD.status = 'done'
          otherD.response = otherEntry.response as unknown as typeof otherD.response
        }
      } else {
        otherD.status = 'idle'
      }
      otherD.error = null
      otherD.errorFallback = null
    }

    // Cancel current tab's running request
    cancelActiveRequest(tab)

    // Start loading
    d.status = 'loading'
    d.response = null
    d.error = null
    d.errorFallback = null

    const controller = new AbortController()
    t.controller = controller

    try {
      const prompt = buildPrompt(tab)
      console.log(prompt)

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
      d.status = 'done'
      d.response = result as unknown as typeof d.response
      d.error = null
      d.errorFallback = null
      t.firstAnalyzeCompleted = true
      t.cache.set(cacheKey, { response: result, timestamp: now, cooldownUntil: now + COOLDOWN_MS })
      scheduleCooldownExpiry()
      t.lastVisibleCacheKey = cacheKey
      t.controller = null
    } catch (e) {
      // Silently ignore cancelled requests
      if (controller.signal.aborted) return

      t.controller = null
      handleRequestError(tab, e, cacheKey)
    }
  }

  // ── Public actions ────────────────────────────────────────────────────

  function analyze(tab: AiAnalysisTab): void {
    const d = getDisplay(tab)
    d.errorFallback = null
    analysisActivated.value = true
    executeAnalysis(tab, false)
  }

  function setActiveTab(tab: AiAnalysisTab): void {
    if (activeTab.value === tab) return

    const prevTab = activeTab.value
    activeTab.value = tab

    // Cancel in-flight request on the previous tab
    const prevT = getTab(prevTab)
    const prevD = getDisplay(prevTab)
    if (prevT.controller) {
      cancelActiveRequest(prevTab)
      // Revert previous tab
      const prevCacheKey = prevT.lastVisibleCacheKey
      if (prevCacheKey) {
        const prevEntry = prevT.cache.get(prevCacheKey)
        if (prevEntry) {
          prevD.status = 'done'
          prevD.response = prevEntry.response as unknown as typeof prevD.response
        }
      } else if (prevD.status === 'loading') {
        prevD.status = 'idle'
      }
      prevD.error = null
      prevD.errorFallback = null
    }

    // Reopen evaluation for the new tab
    evaluateTab(tab)
  }

  function evaluateTab(tab: AiAnalysisTab): void {
    if (!aiStore.aiPanelOpen) return
    if (!aiStore.provider || !aiStore.selectedModel) return
    if (campaignStore.filteredCampaigns.length === 0) return

    const t = getTab(tab)
    const d = getDisplay(tab)
    const cacheKey = getCurrentCacheKey()
    if (!cacheKey) return

    // Show last visible result first
    if (t.lastVisibleCacheKey && t.lastVisibleCacheKey === cacheKey) {
      const entry = t.cache.get(cacheKey)
      if (entry) {
        d.status = 'done'
        d.response = entry.response as unknown as typeof d.response
        d.error = null
        d.errorFallback = null
        return
      }
    }

    // Check cache
    const entry = t.cache.get(cacheKey)
    if (entry) {
      d.status = 'done'
      d.response = entry.response as unknown as typeof d.response
      d.error = null
      d.errorFallback = null
      t.lastVisibleCacheKey = cacheKey
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
      const t = getTab(tab)
      const d = getDisplay(tab)
      t.firstAnalyzeCompleted = false
      t.controller = null
      t.debounceTimer = null
      t.cache.clear()
      t.dataCache.clear()
      t.lastVisibleCacheKey = null
      d.status = 'idle'
      d.response = null
      d.error = null
      d.errorFallback = null
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
      const t = getTab(tab)
      const d = getDisplay(tab)
      if (d.status === 'loading') {
        const lastKey = t.lastVisibleCacheKey
        if (lastKey) {
          const entry = t.cache.get(lastKey)
          if (entry) {
            d.status = 'done'
            d.response = entry.response as unknown as typeof d.response
          } else {
            d.status = 'idle'
          }
        } else {
          d.status = 'idle'
        }
        d.error = null
        d.errorFallback = null
      }
    }
  }

  // ── Watchers ──────────────────────────────────────────────────────────

  // Watch label (channel filter) changes — debounced auto-call
  watch(
    () => [...campaignStore.selectedChannelsIds],
    () => {
      const tab = activeTab.value
      const t = getTab(tab)
      const d = getDisplay(tab)

      if (!analysisActivated.value) return
      if (!aiStore.aiPanelOpen) return
      if (!aiStore.provider || !aiStore.selectedModel) return

      // Cancel current request
      cancelActiveRequest(tab)

      // Debounce
      t.debounceTimer = setTimeout(() => {
        t.debounceTimer = null

        if (!aiStore.aiPanelOpen) return
        if (campaignStore.filteredCampaigns.length === 0) return

        const cacheKey = getCurrentCacheKey()
        if (!cacheKey) return

        // Check cache first
        const entry = t.cache.get(cacheKey)
        if (entry) {
          d.status = 'done'
          d.response = entry.response as unknown as typeof d.response
          d.error = null
          d.errorFallback = null
          t.lastVisibleCacheKey = cacheKey
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
