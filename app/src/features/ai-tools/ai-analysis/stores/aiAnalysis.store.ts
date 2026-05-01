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
import { runAnalysisPrompt, type CacheEntry, TabState } from '../utils'
import { useCooldown } from '@/shared/composables'
import {
  DEBOUNCE_MS,
  COOLDOWN_MS,
  MIN_OPTIMIZER_CAMPAIGNS,
  OPTIMIZER_MIN_CAMPAIGNS_ERROR,
  type TabDisplay,
  DEFAULT_STATE,
  DEFAULT_PORTFOLIO_CONTEXT,
  ALL_TABS,
  getOtherAnalysisType,
} from './aiAnalysis.store.config'

// ── Store ──────────────────────────────────────────────────────────────────

export const useAiAnalysisStore = defineStore('aiAnalysis', () => {
  const aiStore = useAiConnectionStore()

  // ── Shared state ──────────────────────────────────────────────────────
  const activeTab = ref<AiAnalysisType>('executiveSummary')
  const analysisActivated = ref(false)
  const analysisContext = ref<AiAnalysisContext | null>(null)

  // ── Per-tab internal state ────────────────────────────────────────────
  const tabs = {
    budgetOptimizer: new TabState(),
    executiveSummary: new TabState(),
  }

  // ── Per-tab reactive display state ────────────────────────────────────
  const budgetOptimizer = ref<TabDisplay<BudgetOptimizerResponse>>({ ...DEFAULT_STATE } as TabDisplay<BudgetOptimizerResponse>)
  const executiveSummary = ref<TabDisplay<ExecutiveSummaryResponse>>({ ...DEFAULT_STATE } as TabDisplay<ExecutiveSummaryResponse>)

  // ── Derived state ─────────────────────────────────────────────────────
  const tokenLimitReached = computed(() => aiStore.allModelsLimitReached)

  const evaluationDisabled = computed(() =>
    aiStore.evaluationDisabled || !analysisContext.value || analysisContext.value.campaignCount === 0,
  )

  const portfolioContext = computed<PortfolioContext>(() => analysisContext.value ?? DEFAULT_PORTFOLIO_CONTEXT)

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

  function setIdle(tab: AiAnalysisType, error: AiAnalysisError | null = null): void {
    setDisplay(tab, 'idle', null, error)
  }

  function setLoading(tab: AiAnalysisType): void {
    setDisplay(tab, 'loading')
  }

  function setDone(tab: AiAnalysisType, response: AnalysisResponse, notice: AiAnalysisNotice | null = null): void {
    setDisplay(tab, 'done', response, null, notice)
  }

  function setError(tab: AiAnalysisType, code: AiErrorCode, rawMessage?: string): void {
    setDisplay(tab, 'error', null, { code, rawMessage })
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
    setIdle(tab, OPTIMIZER_MIN_CAMPAIGNS_ERROR)
    return true
  }

  function showCachedResult(tab: AiAnalysisType): boolean {
    const entry = getTabState(tab).getCached(getPortfolioId(), getChannelIds(), aiStore.provider ?? '')
    if (!entry) return false
    setDone(tab, entry.response)
    return true
  }

  function showTokenLimitState(tab: AiAnalysisType): void {
    if (showCachedResult(tab)) return
    setError(tab, 'token-limit')
  }

  // ── Cooldown ──────────────────────────────────────────────────────────

  const cooldown = useCooldown(COOLDOWN_MS)

  function canAnalyze(tab: AiAnalysisType): boolean {
    void cooldown.tick.value // reactive dependency — triggers re-evaluation when cooldown expires
    if (!aiStore.provider) return false
    const entry = getTabState(tab).getCached(getPortfolioId(), getChannelIds(), aiStore.provider)
    return !entry || Date.now() >= entry.cooldownUntil
  }

  // ── Cancel ────────────────────────────────────────────────────────────

  function cancelAllRequests(): void {
    for (const tab of ALL_TABS) getTabState(tab).cancelRequest()
  }

  function revertTab(tab: AiAnalysisType): void {
    getTabState(tab).cancelRequest()
    const entry = getTabState(tab).getLastVisible(getPortfolioId())
    if (entry) setDone(tab, entry.response)
    else setIdle(tab)
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
      setDone(tab, entry.response, { code: 'stale-result' })
    } else {
      setError(tab, code, rawMessage)
    }
  }

  // ── Core analyze ──────────────────────────────────────────────────────

  async function performAnalysisRequest(
    tab: AiAnalysisType,
    context: AiAnalysisContext,
    portfolioId: string,
    tabState: TabState,
  ): Promise<void> {
    const provider = aiStore.provider!
    const apiKey = aiStore.apiKey
    const selectedModel = aiStore.selectedModel!

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
      setDone(tab, result)
      tabState.completeFirstAnalysis()
      tabState.setCached(portfolioId, context.selectedChannelIds, provider, { response: result, timestamp: now, cooldownUntil: now + COOLDOWN_MS })
      cooldown.schedule()
      tabState.controller = null
    } catch (error) {
      // Silently ignore cancelled requests
      if (controller.signal.aborted) return

      tabState.controller = null
      handleRequestError(tab, error, tabState.getCached(portfolioId, context.selectedChannelIds, provider))
    }
  }

  async function executeAnalysis(tab: AiAnalysisType, isAutomatic: boolean): Promise<void> {
    if (evaluationDisabled.value) return

    const context = analysisContext.value
    if (!context) return

    if (showOptimizerMinimumError(tab)) return

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

    const tabState = getTabState(tab)
    tabState.cancelRequest()
    setLoading(tab)

    await performAnalysisRequest(tab, context, portfolioId, tabState)
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
    cooldown.clearAll()
    analysisActivated.value = false

    for (const tab of ALL_TABS) {
      getTabState(tab).reset()
      if (!showCachedResult(tab)) setIdle(tab)
    }
  }

  function clearStateForDisconnect(): void {
    cancelAllRequests()
    cooldown.clearAll()
    analysisActivated.value = false

    for (const tab of ALL_TABS) {
      const tabState = getTabState(tab)
      tabState.reset()
      tabState.clearCache()
      setIdle(tab)
    }
  }

  function clearCacheForPortfolio(portfolioId: string): void {
    for (const tab of ALL_TABS) {
      getTabState(tab).deletePortfolioCache(portfolioId)
    }
  }

  // ── Panel open/close ──────────────────────────────────────────────────

  function onPanelOpen(): void {
    evaluateTab(activeTab.value)
  }

  function onPanelClose(): void {
    cancelAllRequests()

    for (const tab of ALL_TABS) {
      if (getDisplay(tab).value.status === 'loading') revertTab(tab)
    }
  }

  // ── Watchers ──────────────────────────────────────────────────────────

  function onChannelFilterChange(): void {
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

    tabState.cancelRequest()

    tabState.debounceTimer = setTimeout(() => {
      tabState.debounceTimer = null

      if (evaluationDisabled.value) return

      if (showOptimizerMinimumError(tab)) return

      if (!showCachedResult(tab)) executeAnalysis(tab, true)
    }, DEBOUNCE_MS)
  }

  function onModelChange(): void {
    if (!analysisActivated.value) return
    if (evaluationDisabled.value) return
    evaluateTab(activeTab.value)
  }

  watch(() => analysisContext.value?.selectedChannelIds ?? [], onChannelFilterChange, { deep: true })
  watch(() => aiStore.selectedModel, onModelChange)
  watch(() => analysisContext.value?.portfolioId, onPortfolioSwitch)

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
