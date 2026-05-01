import { defineStore } from 'pinia'
import { ref, watch, computed, type Ref } from 'vue'
import type { AsyncStatus } from '@/shared/types/async-status'
import type { AiAnalysisType, AiAnalysisError, AiErrorCode, AiAnalysisNotice } from '@/features/ai-tools/types'
import type {
  AnalysisResponse,
  BudgetOptimizerResponse,
  ExecutiveSummaryResponse,
} from '@/features/ai-tools/ai-analysis/types'
import { useAiConnectionStore } from '@/features/ai-tools/ai-connection/stores'
import { runAnalysisPrompt } from '@/features/ai-tools/ai-analysis/utils/analysis-prompt'
import { getCacheKey } from '@/features/ai-tools/ai-analysis/utils/utils'
import type { PortfolioAnalysis } from '@/shared/portfolio-analysis'

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

const DEFAULT_STATE: TabDisplay = {
  status: 'idle',
  response: null,
  error: null,
  notice: null,
}

function createTabState() {
  return {
    firstAnalyzeCompleted: false,
    controller: null as AbortController | null,
    debounceTimer: null as ReturnType<typeof setTimeout> | null,
    cache: new Map<string, Map<string, CacheEntry>>(), // portfolioId → cacheKey → entry
    lastVisibleCacheKey: null as string | null,
  }
}

// ── Module-level helpers ───────────────────────────────────────────────────

function getOtherAnalysisType(type: AiAnalysisType): AiAnalysisType {
  return type === 'budgetOptimizer' ? 'executiveSummary' : 'budgetOptimizer'
}

// ── Store ──────────────────────────────────────────────────────────────────

export interface PortfolioContext {
  portfolioTitle: string
  channelCount: number
  campaignCount: number
  filtersActive: boolean
}

export interface AiAnalysisContext extends PortfolioContext {
  portfolioId: string
  selectedChannelIds: string[]
  portfolioAnalysis: PortfolioAnalysis
}

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

  function getCurrentCacheKey(): string {
    if (!aiStore.provider) return ''
    return getCacheKey([...(analysisContext.value?.selectedChannelIds ?? [])], aiStore.provider)
  }

  function getCacheEntry(tab: AiAnalysisType, cacheKey: string): CacheEntry | undefined {
    const portfolioId = analysisContext.value?.portfolioId ?? ''
    return getTabState(tab).cache.get(portfolioId)?.get(cacheKey)
  }

  function setCacheEntry(tab: AiAnalysisType, cacheKey: string, entry: CacheEntry): void {
    const portfolioId = analysisContext.value?.portfolioId ?? ''
    const tabState = getTabState(tab)
    let portfolioCache = tabState.cache.get(portfolioId)
    if (!portfolioCache) {
      portfolioCache = new Map()
      tabState.cache.set(portfolioId, portfolioCache)
    }
    portfolioCache.set(cacheKey, entry)
  }

  function isBelowOptimizerMinimum(): boolean {
    return (analysisContext.value?.campaignCount ?? 0) < MIN_OPTIMIZER_CAMPAIGNS
  }

  function showOptimizerMinimumError(tab: AiAnalysisType): boolean {
    if (tab !== 'budgetOptimizer' || !isBelowOptimizerMinimum()) return false
    setDisplay(tab, 'idle', null, OPTIMIZER_MIN_CAMPAIGNS_ERROR)
    return true
  }

  function showCachedResult(tab: AiAnalysisType, cacheKey: string): boolean {
    const entry = getCacheEntry(tab, cacheKey)
    if (!entry) return false
    setDisplay(tab, 'done', entry.response)
    getTabState(tab).lastVisibleCacheKey = cacheKey
    return true
  }

  function showTokenLimitState(tab: AiAnalysisType): void {
    if (showCachedResult(tab, getCurrentCacheKey())) return
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
    const entry = getCacheEntry(tab, getCurrentCacheKey())
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
    const tabState = getTabState(tab)
    const entry = tabState.lastVisibleCacheKey ? getCacheEntry(tab, tabState.lastVisibleCacheKey) : null
    setDisplay(tab, entry ? 'done' : 'idle', entry?.response ?? null)
  }

  // ── Error handling ────────────────────────────────────────────────────

  function handleRequestError(tab: AiAnalysisType, error: unknown, cacheKey: string): void {
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

    const entry = getCacheEntry(tab, cacheKey)
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

    const cacheKey = getCurrentCacheKey()
    const tabState = getTabState(tab)

    // Token limit pre-flight: if selected model is exhausted, try next; if all exhausted, show cache or error
    if (aiStore.selectedModelLimitReached) {
      if (!aiStore.selectNextAvailableModel()) {
        showTokenLimitState(tab)
        return
      }
    }

    if (isAutomatic && showCachedResult(tab, cacheKey)) return

    // Cancel any running request on the other tab (single-request rule)
    const otherTab = getOtherAnalysisType(tab)
    if (getTabState(otherTab).controller) revertTab(otherTab)

    cancelActiveRequest(tab)
    setDisplay(tab, 'loading')

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
      setCacheEntry(tab, cacheKey, { response: result, timestamp: now, cooldownUntil: now + COOLDOWN_MS })
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

  function setAnalysisContext(context: AiAnalysisContext | null): void {
    analysisContext.value = context
  }

  function evaluateTab(tab: AiAnalysisType): void {
    if (evaluationDisabled.value) {
      if (tokenLimitReached.value) showTokenLimitState(tab)
      return
    }

    if (showOptimizerMinimumError(tab)) return

    if (showCachedResult(tab, getCurrentCacheKey())) return

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
      const tabState = getTabState(tab)
      tabState.firstAnalyzeCompleted = false
      tabState.lastVisibleCacheKey = null
      if (!showCachedResult(tab, getCurrentCacheKey())) setDisplay(tab, 'idle')
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
      tabState.cache.clear()
      tabState.lastVisibleCacheKey = null
      setDisplay(tab, 'idle')
    }
  }

  function clearCacheForPortfolio(portfolioId: string): void {
    for (const tab of ['budgetOptimizer', 'executiveSummary'] as AiAnalysisType[]) {
      getTabState(tab).cache.delete(portfolioId)
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

        if (!showCachedResult(tab, getCurrentCacheKey())) executeAnalysis(tab, true)
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
