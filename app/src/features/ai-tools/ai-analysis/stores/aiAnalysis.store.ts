import { defineStore } from 'pinia'
import { ref, watch, computed, type Ref } from 'vue'
import type { AiAnalysisType, AiAnalysisError, AiErrorCode, AiAnalysisNotice } from '../../types'
import type { AsyncStatus } from '@/shared/types'
import type {
  AnalysisResponse,
  BudgetOptimizerResponse,
  ExecutiveSummaryResponse,
  PortfolioContext,
  AiAnalysisContext,
} from '../types'
import { useAiConnectionStore } from '../../ai-connection/stores'
import { runAnalysisPrompt, AnalysisCache } from '../utils'
import type { CacheEntry } from '../utils'
import { DEBOUNCE_MS, COOLDOWN_MS, MIN_OPTIMIZER_CAMPAIGNS, OPTIMIZER_MIN_CAMPAIGNS_ERROR } from './aiAnalysis.store.config'
import { type TabDisplay, DEFAULT_STATE, createTabState, getOtherAnalysisType } from './aiAnalysis.store.utils'

// ── Store ──────────────────────────────────────────────────────────────────

export const useAiAnalysisStore = defineStore('aiAnalysis', () => {
  const aiStore = useAiConnectionStore()

  // ── Shared state ──────────────────────────────────────────────────────
  const activeTab = ref<AiAnalysisType>('executiveSummary')
  const analysisActivated = ref(false)
  const analysisContext = ref<AiAnalysisContext | null>(null)

  // ── Per-tab internal state ────────────────────────────────────────────
  const tabs = {
    budgetOptimizer: createTabState(),
    executiveSummary: createTabState(),
  }

  // ── Per-tab cache ─────────────────────────────────────────────────────
  const caches = {
    budgetOptimizer: new AnalysisCache(),
    executiveSummary: new AnalysisCache(),
  }

  // ── Per-tab reactive display state ────────────────────────────────────
  const budgetOptimizer = ref<TabDisplay<BudgetOptimizerResponse>>({ ...DEFAULT_STATE } as TabDisplay<BudgetOptimizerResponse>)
  const executiveSummary = ref<TabDisplay<ExecutiveSummaryResponse>>({ ...DEFAULT_STATE } as TabDisplay<ExecutiveSummaryResponse>)

  // ── Derived state ─────────────────────────────────────────────────────
  const tokenLimitReached = computed(() => aiStore.allModelsLimitReached)

  const evaluationDisabled = computed(() =>
    aiStore.evaluationDisabled || !analysisContext.value || analysisContext.value.campaignCount === 0,
  )

  const portfolioContext = computed<PortfolioContext>(() => ({
    portfolioTitle: analysisContext.value?.portfolioTitle ?? '',
    filtersActive: analysisContext.value?.filtersActive ?? false,
    channelCount: analysisContext.value?.channelCount ?? 0,
    campaignCount: analysisContext.value?.campaignCount ?? 0,
  }))

  const optimizerCanAnalyze = computed(() => {
    if (budgetOptimizer.value.status === 'loading') return false
    if (tokenLimitReached.value) return false
    if (isBelowOptimizerMinimum()) return false
    return canAnalyze('budgetOptimizer')
  })

  const summaryCanAnalyze = computed(() => {
    if (executiveSummary.value.status === 'loading') return false
    if (tokenLimitReached.value) return false
    return canAnalyze('executiveSummary')
  })

  // ── Internal helpers ──────────────────────────────────────────────────

  function getTabState(tab: AiAnalysisType) {
    return tabs[tab]
  }

  function getCache(tab: AiAnalysisType): AnalysisCache {
    return caches[tab]
  }

  function getDisplay(tab: AiAnalysisType): Ref<TabDisplay> {
    return (tab === 'budgetOptimizer' ? budgetOptimizer : executiveSummary) as Ref<TabDisplay>
  }

  function setDisplay(
    tab: AiAnalysisType,
    status: AsyncStatus,
    response: AnalysisResponse | null = null,
    error: AiAnalysisError | null = null,
    notice: AiAnalysisNotice | null = null,
  ): void {
    getDisplay(tab).value = { status, response, error, notice }
  }

  function getPortfolioId(): string {
    return analysisContext.value?.portfolioId ?? ''
  }

  function getChannelIds(): string[] {
    return analysisContext.value?.selectedChannelIds ?? []
  }

  function isBelowOptimizerMinimum(): boolean {
    return (analysisContext.value?.campaignCount ?? 0) < MIN_OPTIMIZER_CAMPAIGNS
  }

  function showOptimizerMinimumError(tab: AiAnalysisType): boolean {
    if (tab !== 'budgetOptimizer' || !isBelowOptimizerMinimum()) return false
    setDisplay(tab, 'idle', null, OPTIMIZER_MIN_CAMPAIGNS_ERROR)
    return true
  }

  function showCachedResult(tab: AiAnalysisType): boolean {
    const entry = getCache(tab).get(getPortfolioId(), getChannelIds(), aiStore.provider ?? '')
    if (!entry) return false
    setDisplay(tab, 'done', entry.response)
    return true
  }

  function showTokenLimitState(tab: AiAnalysisType): void {
    if (showCachedResult(tab)) return
    setDisplay(tab, 'error', null, { code: 'token-limit' })
  }

  // ── Cooldown ──────────────────────────────────────────────────────────

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
    const entry = getCache(tab).get(getPortfolioId(), getChannelIds(), aiStore.provider)
    return !entry || Date.now() >= entry.cooldownUntil
  }

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

  function revertTab(tab: AiAnalysisType): void {
    cancelActiveRequest(tab)
    const cache = getCache(tab)
    const entry = cache.lastVisibleCacheKey ? cache.getByKey(getPortfolioId(), cache.lastVisibleCacheKey) : null
    setDisplay(tab, entry ? 'done' : 'idle', entry?.response ?? null)
  }

  // ── Error handling ────────────────────────────────────────────────────

  function handleRequestError(tab: AiAnalysisType, error: unknown, entry: CacheEntry | undefined): void {
    const code = error instanceof Error ? (error.message as AiErrorCode) : 'unknown'
    const rawMessage = error instanceof Error ? error.message : undefined

    if (code === 'token-limit') {
      if (aiStore.selectedModel) aiStore.markModelLimitReached(aiStore.selectedModel.id)

      // Silent fallback: try next available model without showing error
      if (aiStore.selectNextAvailableModel()) {
        executeAnalysis(tab, false)
        return
      }

      // All models exhausted — fall through to show cache or error below
    }

    if (entry) {
      setDisplay(tab, 'done', entry.response, null, { code: 'stale-result' })
    } else {
      setDisplay(tab, 'error', null, { code, rawMessage })
    }
  }

  // ── Core analyze ──────────────────────────────────────────────────────

  async function executeAnalysis(tab: AiAnalysisType, isAutomatic: boolean): Promise<void> {
    if (evaluationDisabled.value) return

    const context = analysisContext.value
    if (!context) return

    const provider = aiStore.provider!
    const apiKey = aiStore.apiKey
    const selectedModel = aiStore.selectedModel!

    if (showOptimizerMinimumError(tab)) return

    const cache = getCache(tab)
    const portfolioId = getPortfolioId()

    // Token limit pre-flight: if selected model is exhausted, try next; if all exhausted, show cache or error
    if (aiStore.selectedModelLimitReached) {
      if (!aiStore.selectNextAvailableModel()) {
        showTokenLimitState(tab)
        return
      }
    }

    if (isAutomatic && showCachedResult(tab)) return

    // Cancel any running request on the other tab (single-request rule)
    const otherTab = getOtherAnalysisType(tab)
    if (getTabState(otherTab).controller) revertTab(otherTab)

    cancelActiveRequest(tab)
    setDisplay(tab, 'loading')

    const tabState = getTabState(tab)
    const controller = new AbortController()
    tabState.controller = controller

    try {
      const result = await runAnalysisPrompt(
        { provider, apiKey, selectedModel },
        { type: tab, analysis: context.portfolioAnalysis, isFiltered: context.filtersActive },
        controller.signal,
      )

      if (!result) return

      const now = result.timestamp!
      setDisplay(tab, 'done', result)
      tabState.firstAnalyzeCompleted = true
      cache.set(portfolioId, context.selectedChannelIds, provider, { response: result, timestamp: now, cooldownUntil: now + COOLDOWN_MS })
      scheduleCooldownExpiry()
      tabState.controller = null
    } catch (error) {
      // Silently ignore cancelled requests
      if (controller.signal.aborted) return

      tabState.controller = null
      handleRequestError(tab, error, cache.get(portfolioId, context.selectedChannelIds, provider))
    }
  }

  // ── Public actions ────────────────────────────────────────────────────

  function analyze(tab: AiAnalysisType): void {
    const display = getDisplay(tab)
    display.value = { ...display.value, notice: null }
    analysisActivated.value = true
    executeAnalysis(tab, false)
  }

  function setAnalysisContext(context: AiAnalysisContext | null): void {
    analysisContext.value = context
  }

  function evaluateTab(tab: AiAnalysisType): void {
    if (evaluationDisabled.value) {
      if (tokenLimitReached.value) showTokenLimitState(tab)
      return
    }

    if (showOptimizerMinimumError(tab)) return

    if (showCachedResult(tab)) return

    if (analysisActivated.value) executeAnalysis(tab, true)
  }

  function setActiveTab(tab: AiAnalysisType): void {
    if (activeTab.value === tab) return

    const prevTab = activeTab.value
    activeTab.value = tab

    if (getTabState(prevTab).controller) revertTab(prevTab)

    evaluateTab(tab)
  }

  // ── Reset ─────────────────────────────────────────────────────────────

  function onPortfolioSwitch(): void {
    cancelAllRequests()
    clearCooldownTimers()
    analysisActivated.value = false

    for (const tab of ['budgetOptimizer', 'executiveSummary'] as AiAnalysisType[]) {
      getTabState(tab).firstAnalyzeCompleted = false
      if (!showCachedResult(tab)) setDisplay(tab, 'idle')
    }
  }

  function clearStateForDisconnect(): void {
    cancelAllRequests()
    clearCooldownTimers()
    analysisActivated.value = false

    for (const tab of ['budgetOptimizer', 'executiveSummary'] as AiAnalysisType[]) {
      const tabState = getTabState(tab)
      tabState.firstAnalyzeCompleted = false
      tabState.controller = null
      tabState.debounceTimer = null
      getCache(tab).clear()
      setDisplay(tab, 'idle')
    }
  }

  function clearCacheForPortfolio(portfolioId: string): void {
    for (const tab of ['budgetOptimizer', 'executiveSummary'] as AiAnalysisType[]) {
      getCache(tab).deletePortfolio(portfolioId)
    }
  }

  // ── Panel open/close ──────────────────────────────────────────────────

  function onPanelOpen(): void {
    evaluateTab(activeTab.value)
  }

  function onPanelClose(): void {
    cancelAllRequests()

    for (const tab of ['budgetOptimizer', 'executiveSummary'] as AiAnalysisType[]) {
      if (getDisplay(tab).value.status === 'loading') revertTab(tab)
    }
  }

  // ── Watchers ──────────────────────────────────────────────────────────

  // Watch channel filter changes — debounced auto-call
  watch(
    () => analysisContext.value?.selectedChannelIds ?? [],
    () => {
      const tab = activeTab.value
      const tabState = getTabState(tab)

      if (!analysisActivated.value) return
      if (!tabState.firstAnalyzeCompleted) return

      // Token-limited: update display for new filter immediately (no API call possible)
      if (tokenLimitReached.value) {
        showTokenLimitState(tab)
        return
      }

      if (evaluationDisabled.value) return

      cancelActiveRequest(tab)

      tabState.debounceTimer = setTimeout(() => {
        tabState.debounceTimer = null

        if (evaluationDisabled.value) return

        if (showOptimizerMinimumError(tab)) return

        if (!showCachedResult(tab)) executeAnalysis(tab, true)
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

  // Watch portfolio switch — reset display state, preserve cache
  watch(
    () => analysisContext.value?.portfolioId,
    () => onPortfolioSwitch(),
  )

  return {
    // Shared
    activeTab,
    tokenLimitReached,
    analysisActivated,
    analysisContext,
    // Per-tab reactive display state
    budgetOptimizer,
    executiveSummary,
    // Computed
    portfolioContext,
    optimizerCanAnalyze,
    summaryCanAnalyze,
    // Actions
    analyze,
    setAnalysisContext,
    setActiveTab,
    onPanelOpen,
    onPanelClose,
    clearStateForDisconnect,
    clearCacheForPortfolio,
  }
})
