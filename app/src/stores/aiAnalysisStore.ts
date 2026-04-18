import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import type {
  AiAnalysisTab,
  AiAnalysisStatus,
  AiAnalysisError,
  AiAnalysisErrorCode,
  BudgetOptimizerResponse,
  BudgetOptimizerData,
  ExecutiveSummaryResponse,
  ExecutiveSummaryData,
} from '../features/ai-tools/types'
import { useAiStore } from './aiStore'
import { useCampaignStore } from './campaignStore'
import { buildBudgetOptimizerData } from '../features/ai-tools/utils/buildBudgetOptimizerData'
import { buildExecutiveSummaryData } from '../features/ai-tools/utils/buildExecutiveSummaryData'
import { generateBudgetOptimizationPrompt } from '../features/ai-tools/prompts'
import { generateExecutiveSummaryPrompt } from '../features/ai-tools/prompts'
import { callProviderForAnalysis } from '../features/ai-tools/ai-analysis'

// ── Constants ──────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 300
const COOLDOWN_MS = 5_000
const ALL_LABELS_KEY = 'all'

// ── Per-tab state shape ────────────────────────────────────────────────────

type TabResponse = BudgetOptimizerResponse | ExecutiveSummaryResponse

function createTabState() {
  return {
    firstAnalyzeCompleted: false,
    status: 'idle' as AiAnalysisStatus,
    response: null as TabResponse | null,
    error: null as AiAnalysisError | null,
    controller: null as AbortController | null,
    debounceTimer: null as ReturnType<typeof setTimeout> | null,
    cache: new Map<string, TabResponse>(),
    cacheTimestamps: new Map<string, number>(),
    dataCache: new Map<string, BudgetOptimizerData | ExecutiveSummaryData>(),
    cooldowns: new Map<string, number>(),
    lastVisibleCacheKey: null as string | null,
    errorFallbackMessage: null as string | null,
  }
}

// ── Error messages ─────────────────────────────────────────────────────────

const ERROR_MESSAGES: Record<AiAnalysisErrorCode, string> = {
  'network': 'Network error. Check your connection and try again.',
  'timeout': 'The request timed out. Try again.',
  'rate-limit': 'Too many requests. Please wait and try again.',
  'token-limit': 'AI generation is temporarily unavailable due to usage limits.',
  'server-error': 'The AI provider is experiencing issues. Try again later.',
  'parse-error': 'Could not parse the AI response. Try again.',
  'unknown': 'Something went wrong.',
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useAiAnalysisStore = defineStore('aiAnalysis', () => {
  const aiStore = useAiStore()
  const campaignStore = useCampaignStore()

  // ── Shared state ──────────────────────────────────────────────────────

  const activeTab = ref<AiAnalysisTab>('summary')
  const tokenLimitReached = ref(false)
  const analysisActivated = ref(false)

  // ── Per-tab state ─────────────────────────────────────────────────────

  const tabs = {
    optimizer: createTabState(),
    summary: createTabState(),
  }

  // ── Reactive wrappers (Vue needs refs for reactivity) ─────────────────

  const optimizerStatus = ref<AiAnalysisStatus>('idle')
  const optimizerResponse = ref<BudgetOptimizerResponse | null>(null)
  const optimizerError = ref<AiAnalysisError | null>(null)
  const optimizerFirstCompleted = ref(false)
  const optimizerErrorFallback = ref<string | null>(null)
  const optimizerCacheTimestamp = ref<number | null>(null)

  const summaryStatus = ref<AiAnalysisStatus>('idle')
  const summaryResponse = ref<ExecutiveSummaryResponse | null>(null)
  const summaryError = ref<AiAnalysisError | null>(null)
  const summaryFirstCompleted = ref(false)
  const summaryErrorFallback = ref<string | null>(null)
  const summaryCacheTimestamp = ref<number | null>(null)

  // ── Helpers ───────────────────────────────────────────────────────────

  function normalizeLabels(labels: string[]): string[] {
    if (labels.length === 0) return [ALL_LABELS_KEY]
    return [...labels].map((l) => l.trim().toLowerCase()).sort()
  }

  function createCacheKey(labels: string[], provider: string, model: string): string {
    return `${provider}::${model}::${normalizeLabels(labels).join('|')}`
  }

  function createDataCacheKey(labels: string[]): string {
    return normalizeLabels(labels).join('|')
  }

  function getTab(tab: AiAnalysisTab) {
    return tabs[tab]
  }

  function syncRefsFromTab(tab: AiAnalysisTab): void {
    const t = getTab(tab)
    if (tab === 'optimizer') {
      optimizerStatus.value = t.status
      optimizerResponse.value = t.response as BudgetOptimizerResponse | null
      optimizerError.value = t.error
      optimizerFirstCompleted.value = t.firstAnalyzeCompleted
      optimizerErrorFallback.value = t.errorFallbackMessage
    } else {
      summaryStatus.value = t.status
      summaryResponse.value = t.response as ExecutiveSummaryResponse | null
      summaryError.value = t.error
      summaryFirstCompleted.value = t.firstAnalyzeCompleted
      summaryErrorFallback.value = t.errorFallbackMessage
    }
  }

  function syncCacheTimestamp(tab: AiAnalysisTab): void {
    const t = getTab(tab)
    const key = getCurrentCacheKey()
    const ts = key ? t.cacheTimestamps.get(key) ?? null : null
    if (tab === 'optimizer') {
      optimizerCacheTimestamp.value = ts
    } else {
      summaryCacheTimestamp.value = ts
    }
  }

  function getCurrentCacheKey(): string | null {
    if (!aiStore.provider || !aiStore.selectedModel) return null
    return createCacheKey(
      campaignStore.selectedChannels,
      aiStore.provider,
      aiStore.selectedModel.model,
    )
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
    const lastSuccess = t.cooldowns.get(key)
    if (!lastSuccess) return true
    return Date.now() - lastSuccess >= COOLDOWN_MS
  }

  const optimizerCanAnalyze = computed(() => {
    if (optimizerStatus.value === 'loading') return false
    return canAnalyze('optimizer')
  })

  const summaryCanAnalyze = computed(() => {
    if (summaryStatus.value === 'loading') return false
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

  function getOrBuildData(tab: AiAnalysisTab): BudgetOptimizerData | ExecutiveSummaryData {
    const t = getTab(tab)
    const dataKey = createDataCacheKey(campaignStore.selectedChannels)
    const cached = t.dataCache.get(dataKey)
    if (cached) return cached

    const rows = campaignStore.filteredCampaigns
    const data = tab === 'optimizer'
      ? buildBudgetOptimizerData(rows)
      : buildExecutiveSummaryData(rows)

    t.dataCache.set(dataKey, data)
    return data
  }

  // ── Prompt builders ───────────────────────────────────────────────────

  function buildPrompt(tab: AiAnalysisTab): string {
    const data = getOrBuildData(tab)
    const filteredChannels = campaignStore.selectedChannels.length > 0
      ? campaignStore.selectedChannels
      : undefined
    console.log(data)

    if (tab === 'optimizer') {
      return generateBudgetOptimizationPrompt(
        data as BudgetOptimizerData,
        undefined,
        filteredChannels,
      )
    }
    return generateExecutiveSummaryPrompt(
      data as ExecutiveSummaryData,
      undefined,
      filteredChannels,
    )
  }

  // ── Error handling ────────────────────────────────────────────────────

  function handleRequestError(tab: AiAnalysisTab, e: unknown, cacheKey: string): void {
    const t = getTab(tab)
    const code = e instanceof Error ? (e.message as AiAnalysisErrorCode) : 'unknown'
    const message = ERROR_MESSAGES[code] ?? ERROR_MESSAGES.unknown

    if (code === 'token-limit') {
      if (aiStore.selectedModel) {
        aiStore.markModelLimitReached(aiStore.selectedModel.model)
      }

      // Silent fallback: try next available model without showing error
      if (aiStore.selectNextAvailableModel()) {
        executeAnalysis(tab, false)
        return
      }

      // All models exhausted
      tokenLimitReached.value = true
    }

    // Case 1: cached response exists — keep showing it
    const cachedResponse = t.cache.get(cacheKey)
    if (cachedResponse) {
      t.status = 'done'
      t.response = cachedResponse
      t.error = null
      t.errorFallbackMessage = 'The latest request failed. Showing the previous generated result.'
    } else {
      // Case 2: no cache — show error
      t.status = 'error'
      t.response = null
      t.error = { code, message }
      t.errorFallbackMessage = null
    }

    syncRefsFromTab(tab)
    syncCacheTimestamp(tab)
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

    // Token limit: try next model silently, or show cached if all exhausted
    if (aiStore.selectedModelLimitReached) {
      if (!aiStore.selectNextAvailableModel()) {
        tokenLimitReached.value = true
      }
    }
    if (tokenLimitReached.value) {
      const cached = t.cache.get(cacheKey)
      if (cached) {
        t.status = 'done'
        t.response = cached
        t.error = null
        t.errorFallbackMessage = null
        syncRefsFromTab(tab)
        syncCacheTimestamp(tab)
      }
      return
    }

    // Check cache for automatic calls
    if (isAutomatic) {
      const cached = t.cache.get(cacheKey)
      if (cached) {
        t.status = 'done'
        t.response = cached
        t.error = null
        t.errorFallbackMessage = null
        t.lastVisibleCacheKey = cacheKey
        syncRefsFromTab(tab)
        syncCacheTimestamp(tab)
        return
      }
    }

    // Cancel any running request on the OTHER tab (global single-request rule)
    const otherTab: AiAnalysisTab = tab === 'optimizer' ? 'summary' : 'optimizer'
    const otherT = getTab(otherTab)
    if (otherT.controller) {
      cancelActiveRequest(otherTab)
      // Revert other tab to its last state
      const otherCacheKey = otherT.lastVisibleCacheKey
      if (otherCacheKey) {
        const otherCached = otherT.cache.get(otherCacheKey)
        if (otherCached) {
          otherT.status = 'done'
          otherT.response = otherCached
        }
      } else {
        otherT.status = 'idle'
      }
      otherT.error = null
      otherT.errorFallbackMessage = null
      syncRefsFromTab(otherTab)
    }

    // Cancel current tab's running request
    cancelActiveRequest(tab)

    // Start loading
    t.status = 'loading'
    t.response = null
    t.error = null
    t.errorFallbackMessage = null
    syncRefsFromTab(tab)

    const controller = new AbortController()
    t.controller = controller

    try {
      const prompt = buildPrompt(tab)
      console.log(prompt)

      const result = await callProviderForAnalysis<TabResponse>(
        aiStore.provider,
        aiStore.apiKey,
        aiStore.selectedModel.model,
        prompt,
        controller.signal,
      )

      // Check if this request was cancelled (stale)
      if (controller.signal.aborted) return

      // Stamp the model that generated this response
      if (aiStore.selectedModel) {
        result.model = { ...aiStore.selectedModel }
      }

      // Success
      t.status = 'done'
      t.response = result
      t.error = null
      t.errorFallbackMessage = null
      t.firstAnalyzeCompleted = true
      t.cache.set(cacheKey, result)
      t.cacheTimestamps.set(cacheKey, Date.now())
      t.cooldowns.set(cacheKey, Date.now())
      scheduleCooldownExpiry()
      t.lastVisibleCacheKey = cacheKey
      t.controller = null

      syncRefsFromTab(tab)
      syncCacheTimestamp(tab)
    } catch (e) {
      // Silently ignore cancelled requests
      if (controller.signal.aborted) return

      t.controller = null
      handleRequestError(tab, e, cacheKey)
    }
  }

  // ── Public actions ────────────────────────────────────────────────────

  function analyze(tab: AiAnalysisTab): void {
    const t = getTab(tab)
    t.errorFallbackMessage = null
    analysisActivated.value = true
    syncRefsFromTab(tab)
    executeAnalysis(tab, false)
  }

  function setActiveTab(tab: AiAnalysisTab): void {
    if (activeTab.value === tab) return

    const prevTab = activeTab.value
    activeTab.value = tab

    // Cancel in-flight request on the previous tab
    const prevT = getTab(prevTab)
    if (prevT.controller) {
      cancelActiveRequest(prevTab)
      // Revert previous tab
      const prevCacheKey = prevT.lastVisibleCacheKey
      if (prevCacheKey) {
        const prevCached = prevT.cache.get(prevCacheKey)
        if (prevCached) {
          prevT.status = 'done'
          prevT.response = prevCached
        }
      } else if (prevT.status === 'loading') {
        prevT.status = 'idle'
      }
      prevT.error = null
      prevT.errorFallbackMessage = null
      syncRefsFromTab(prevTab)
    }

    // Reopen evaluation for the new tab
    evaluateTab(tab)
  }

  function evaluateTab(tab: AiAnalysisTab): void {
    if (!aiStore.aiPanelOpen) return
    if (!aiStore.provider || !aiStore.selectedModel) return
    if (campaignStore.filteredCampaigns.length === 0) return

    const t = getTab(tab)
    const cacheKey = getCurrentCacheKey()
    if (!cacheKey) return

    // Show last visible result first
    if (t.lastVisibleCacheKey && t.lastVisibleCacheKey === cacheKey) {
      const cached = t.cache.get(cacheKey)
      if (cached) {
        t.status = 'done'
        t.response = cached
        t.error = null
        t.errorFallbackMessage = null
        syncRefsFromTab(tab)
        syncCacheTimestamp(tab)
        return
      }
    }

    // Check cache
    const cached = t.cache.get(cacheKey)
    if (cached) {
      t.status = 'done'
      t.response = cached
      t.error = null
      t.errorFallbackMessage = null
      t.lastVisibleCacheKey = cacheKey
      syncRefsFromTab(tab)
      syncCacheTimestamp(tab)
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
      t.firstAnalyzeCompleted = false
      t.status = 'idle'
      t.response = null
      t.error = null
      t.errorFallbackMessage = null
      t.controller = null
      t.debounceTimer = null
      t.cache.clear()
      t.cacheTimestamps.clear()
      t.dataCache.clear()
      t.cooldowns.clear()
      t.lastVisibleCacheKey = null
      syncRefsFromTab(tab)
    }

    optimizerCacheTimestamp.value = null
    summaryCacheTimestamp.value = null
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
      if (t.status === 'loading') {
        const lastKey = t.lastVisibleCacheKey
        if (lastKey) {
          const cached = t.cache.get(lastKey)
          if (cached) {
            t.status = 'done'
            t.response = cached
          } else {
            t.status = 'idle'
          }
        } else {
          t.status = 'idle'
        }
        t.error = null
        t.errorFallbackMessage = null
        syncRefsFromTab(tab)
      }
    }
  }

  // ── Watchers ──────────────────────────────────────────────────────────

  // Watch label (channel filter) changes — debounced auto-call
  watch(
    () => [...campaignStore.selectedChannels],
    () => {
      const tab = activeTab.value
      const t = getTab(tab)

      if (!analysisActivated.value) return
      if (!aiStore.aiPanelOpen) return
      if (!aiStore.provider || !aiStore.selectedModel) return

      // Clear cooldown restriction for label changes
      // (cooldown only applies to same combination re-analyze)

      // Cancel current request
      cancelActiveRequest(tab)

      // Clear data cache for the active tab (new labels = new data)
      // Actually, we keep data cache — it's keyed by labels, so new labels
      // will just build new data on miss.

      // Debounce
      t.debounceTimer = setTimeout(() => {
        t.debounceTimer = null

        if (!aiStore.aiPanelOpen) return
        if (campaignStore.filteredCampaigns.length === 0) return

        const cacheKey = getCurrentCacheKey()
        if (!cacheKey) return

        // Check cache first
        const cached = t.cache.get(cacheKey)
        if (cached) {
          t.status = 'done'
          t.response = cached
          t.error = null
          t.errorFallbackMessage = null
          t.lastVisibleCacheKey = cacheKey
          syncRefsFromTab(tab)
          syncCacheTimestamp(tab)
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
    // Optimizer refs
    optimizerStatus,
    optimizerResponse,
    optimizerError,
    optimizerFirstCompleted,
    optimizerErrorFallback,
    optimizerCacheTimestamp,
    optimizerCanAnalyze,

    // Summary refs
    summaryStatus,
    summaryResponse,
    summaryError,
    summaryFirstCompleted,
    summaryErrorFallback,
    summaryCacheTimestamp,
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
