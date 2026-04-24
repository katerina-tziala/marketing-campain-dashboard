# CLAUDE.md — Marketing Campaign Dashboard

## Project Context

An MBA assignment project: a web-based interactive dashboard for analyzing marketing campaign performance. Users upload campaign data via CSV and get KPI visualizations, channel comparisons, and AI-powered budget optimization recommendations via Google Gemini.

**Status:** Campaign Performance Dashboard implemented. CSV upload flow complete with full error handling. AI Tools panel in place with full analysis flow: AI button in dashboard header, push drawer at lg+ and fixed overlay at <lg (max 90vw/90vh). AI connection form (provider radio buttons + API key + connect with live verification + granular error handling) implemented for Google Gemini and Groq; connected state shows status bar + tabbed interface (Optimizer / Summary). Both AI tabs wired to real Gemini/Groq API calls via `aiAnalysisStore` with full flow logic: debounced auto-calls on label change, response caching (keyed by provider::sorted labels), request cancellation via AbortController, 5s cooldown per cache key, per-model token/quota limit tracking (limitReached on AiModel, global tokenLimitReached only when all models exhausted), silent model fallback on token-limit (marks model, picks next highest-scored available model, retries transparently — user only sees final result), model change watcher for cache/auto-call, panel open/close persistence, tab switch = panel reopen evaluation (shared analysisActivated flag — analyzing on one tab activates auto-calls on the other), CSV upload resets all analysis state, disconnect clears analysis. No timeouts on any API calls (connection or analysis). Deterministic generation config: Gemini `temperature: 0`; Groq `temperature: 0, top_p: 1, frequency_penalty: 0, presence_penalty: 0`. Gemini model ID `models/` prefix stripped for analysis calls. Model evaluation prompt (`generateModelEvaluationPrompt`) returns up to 20 ranked models (filtered to strength_score >= 6, re-sorted by strength_score desc), default model properties updated if it appears in AI response, failure falls back to optimal model. Response types include `model?: AiModel` and `timestamp?: number` stamped on each result at write time; panels show "Generated at [time] with [display_name]"; timestamp travels with the response so no separate cacheTimestamp field exists in reactive state. Shared `rankModels` in `connect-provider.ts` applies strength_score≥6 filter + sort + limitReset map after each provider returns candidates. Budget Optimizer: summary + recommendations (fromCampaign/toCampaign/budgetShift/reason/expectedImpact/confidence/executionRisk); prompt accepts PortfolioAnalysis directly (curates promptInput locally); CAMPAIGN GROUP CONTEXT section added to prompt. Executive Summary: healthScore, bottomLine, insights (camelCase, no icon), priorityActions, correlations — no key_metrics or channel_summary; prompt accepts PortfolioAnalysis directly (curates promptInput locally); CAMPAIGN GROUP CONTEXT + CHANNEL GROUP CONTEXT sections added. `aiAnalysisStore` has no dataCache — Vue computed `campaignStore.portfolioAnalysis` used directly via `runAnalysisPrompt` (ai-analysis/utils); no intermediate analysis types or adapters. `getCacheKey` (ai-analysis/utils) handles cache key normalisation; `runAnalysisPrompt` handles prompt building, provider dispatch, and model+timestamp stamping. `evaluationDisabled` computed (`aiStore.evaluationDisabled || filteredCampaigns.length === 0`) is a derived getter that combines the aiStore gate (panel open + provider + selectedModel + no allModelsLimitReached) with the no-campaigns check. `tokenLimitReached` is a derived getter (`computed(() => aiStore.allModelsLimitReached)`) — not local state. `showTokenLimitState(tab)` is a store-internal helper that restores cached response or sets token-limit error display; called from `evaluateTab` (when `evaluationDisabled && tokenLimitReached`), `executeAnalysis` pre-flight (when selected model exhausted and no next model), and the filter watcher (immediately, no debounce). Module-level `setDisplay(display: Ref<TabDisplay>, status, response?, error?, errorFallback?)` replaces the whole `ref.value` object (no property mutation); module-level `getOtherAnalysisType(type)` maps each `AiAnalysisType` to its counterpart. `AiAnalysisType` ('budgetOptimizer'|'executiveSummary') used as the single key type throughout — `AiAnalysisTab` removed. Display state uses `ref<TabDisplay<T>>` with full object replacement; `TabDisplay<T>` defined at module level in the store. Budget Optimizer requires ≥ 2 filtered campaigns — `optimizerCanAnalyze` returns false below this threshold; `executeAnalysis` and `evaluateTab` set `status: 'error'` with a descriptive message rather than silently returning. `optimizerCanAnalyze` and `summaryCanAnalyze` both gate on `tokenLimitReached` to disable the Analyze button when all models are exhausted. `PortfolioScope` kept for display (passed as prop to tab components); `channels: string[]` added for all portfolio channel names. `computePortfolioAnalysis` takes only `(selectedChannels, selectedChannelsIds)` — all internal derivations (kpis, scope, portfolio, classifications, signals) computed inside. `kpis` removed as a separate store computed — consumers use `portfolioAnalysis.portfolio`. Upload-replace flow complete: header "Upload CSV" button triggers `ReplaceDataModal` confirmation when data exists; confirmed → opens `UploadModal`; `useUploadModal` composable owns `hasCampaigns`, `showReplaceConfirm`, `requestUpload`, `onReplaceConfirm`, `closeReplaceConfirm`; `openUploadModal` provided via `provide()`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API) |
| Routing | Vue Router 4 |
| State Management | Pinia |
| Build Tool | Vite |
| Styling | Tailwind CSS v3 + SCSS (dark mode via `class` strategy) |
| Charts | Chart.js + vue-chartjs |
| CSV Parsing | PapaParse (upload direction only) |
| AI | Google Gemini API + Groq API (free tiers) |

---

## Architecture

```
app/                        # Vue 3 + Vite project
├── src/
│   ├── common/                 # Shared types and data — no framework dependencies
│   │   ├── types/
│   │   │   ├── campaign.ts     # CampaignMetrics interface (budget/revenue/impressions/clicks/conversions: number) + Campaign extends CampaignMetrics (adds rowId: number + campaign/channel: string) + PerformanceMetrics interface (roi/ctr/cvr/cac: number|null) + CampaignPerformance extends Campaign + PerformanceMetrics (empty body) + PortfolioKPIs (total*/aggregated* fields) + PortfolioScope (campaigns/channels/selectedCampaigns/selectedChannels string arrays) + ShareEfficiency (budgetShare/revenueShare/efficiencyGap: number)
│   │   │   ├── channel.ts      # Channel extends CampaignMetrics, PerformanceMetrics — id: string (lowercase-trimmed-hyphenated from name), name: string, campaigns: CampaignPerformance[]; roi/ctr/cvr/cac computed from aggregated channel metrics
│   │   │   └── async-status.ts # AsyncStatus type — 'idle' | 'loading' | 'done' | 'error'; shared across stores and components that track async operation state
│   │   ├── utils/
│   │   │   ├── math.ts         # safeDivide + round2 — shared math helpers
│   │   │   ├── campaign-performance.ts # percentageClass(value: number|null) → string (negative/warning/positive/empty) + computePerformanceMetrics(CampaignMetrics) → PerformanceMetrics (roi/ctr/cvr/cac with null on zero-divisor) + computeShareEfficiency(item: CampaignMetrics, totalBudget, totalRevenue) → ShareEfficiency (budgetShare/revenueShare/efficiencyGap) + aggregateCampaignMetrics(Campaign[]) → CampaignMetrics (sums numeric fields across array) + toCampaignPerformance(Campaign) → CampaignPerformance + computePortfolioKPIs(Channel[]) → PortfolioKPIs; used by portfolio-analysis and dashboard components
│   │   │   ├── sorting.ts          # compareNullsLast(a, b) → number|null; compareDirectional(a, b, dir) → number; sortWithNullsLast(a, b, dir) → number — null-safe directional sort composing the two
│   │   │   ├── campaign-channel.ts # buildChannelMap(campaigns: Campaign[]) → Map<string, Channel>; local ChannelAccumulator type ({ id, name, campaigns }); groupCampaignsByChannel accumulates campaigns only; buildChannelMap calls aggregateCampaignMetrics + computePerformanceMetrics once per channel in the sort/reduce phase; no mutation
│   │   │   └── formatters.ts   # formatCurrency(value) → '€N' (en-US, 0 decimals); formatNumber(value) → localized string; formatPercentage(value) → 'N.NN%'; formatCompactCurrency(value) → compact EUR with 1 decimal for ≥1000, 2 decimals otherwise; formatCompactNumber(value) → compact with 1 decimal for ≥1000, localized otherwise
│   │   ├── portfolio-analysis/
│   │   │   ├── types.ts            # PortfolioAnalysis interface (portfolio/scope/filteredChannels/channels/campaignGroups/channelGroups/derivedSignals); CampaignGroups (top/opportunity/bottom/watch: CampaignSummary[]); ChannelGroups (strong/opportunity/weak/watch: ChannelSummary[]); all signal types: InefficientChannelSignal, InefficientCampaignSignal, BudgetScalingCandidate, TransferCandidate, ConcentrationLevel, ConcentrationFlagSignal, CorrelationSignal; imports only from common/types/campaign
│   │   │   ├── classify-utils.ts   # Shared classification helpers — CLASSIFY_THRESHOLDS (all decision boundaries documented with marketing rationale; single seam for future user configurability); getFunnelMedians(items) → { medianCtr, medianCvr } (shared between both classifiers); getMedian(values) → number; getDynamicThresholds(campaigns) → { minRevenue, minConversions }
│   │   │   ├── classify-campaigns.ts # classifyCampaigns(campaigns, portfolioRoi) → CampaignGroups — single-pass loop with else-if cascade Top→Opportunity→Bottom→Watch; mutually exclusive by construction; isTop (ROI > portfolioROI×1.1 + size gate), isOpportunity (ROI ≥ avg + revenueShare ≥ budgetShare), isBottom (efficiencyGap > threshold + ROI < avg), isWatch (funnel leak: high CTR + low CVR vs median, OR positive underperforming ROI); each bucket sorted by most-actionable-first
│   │   │   ├── classify-channels.ts # classifyChannels(channels, portfolioRoi) → ChannelGroups — single-pass loop with else-if cascade Strong→Opportunity→Weak→Watch; same Watch logic as campaigns but interpreted at channel aggregate level (structural vs campaign-level issue); each bucket sorted by most-actionable-first
│   │   │   ├── utils.ts            # Signal computation and mapping helpers — toCampaignSummary, toChannelSummary, computeChannelStatus, toFinite, getInefficientChannels, getInefficientCampaigns, getScalingOpportunities (mixed campaign+channel top 5), getBudgetScalingCandidates (campaign-only with capacity), getTransferCandidates, getConcentrationFlag, getCorrelations (stub); imports getDynamicThresholds from classify-utils
│   │   │   └── portfolio-analysis.ts # computePortfolioAnalysis(selectedChannels, selectedChannelsIds) → PortfolioAnalysis — 2-param entry point; derives filteredCampaigns, kpis, scope, filteredChannels flag internally; calls classifyCampaigns + classifyChannels + all signal helpers
│   │   └── data/
│   │       └── MOCK_CAMPAIN_DATA.ts # 21 mock campaigns across 13 real-world channels; exported as MOCK_CAMPAINS
│   ├── stores/
│   │   ├── campaignStore.ts    # Pinia store — title, portfolioChannels (Map<string, Channel> — single source of truth, set on init and in loadCampaigns), selectedChannelsIds (string[] of channel IDs); campaigns computed (flatMaps all ch.campaigns from portfolioChannels); selectedChannels computed (Channel[] for selected IDs or all); filteredCampaigns computed (flatMaps ch.campaigns from selectedChannels); portfolioScope computed (campaigns/channels/selectedCampaigns/selectedChannels string arrays — for display purposes); portfolioAnalysis computed (PortfolioAnalysis — calls computePortfolioAnalysis(selectedChannels, selectedChannelsIds)); no kpis computed (dashboard uses portfolioAnalysis.portfolio instead); toggleChannel/clearFilters/loadCampaigns actions
│   │   ├── toastStore.ts       # Pinia store — toast queue; Toast type uses NotificationVariant; addToast(message, type) internal helper + 4 public helpers: showSuccessToast / showErrorToast / showWarningToast / showInfoToast; removeToast; 5s auto-dismiss
│   │   ├── aiStore.ts          # Pinia store — provider, apiKey (memory-only), isConnected, isConnecting, connectionError (AiConnectionError), models (AiModel[] sorted by strength_score desc), selectedModel (AiModel — highest strength_score), aiPanelOpen; selectedModelLimitReached, allModelsLimitReached (computed); connect() calls connectProvider from providers/, catches errors via normalizeConnectionError + ERROR_CODES set → sets connectionError; disconnect(); markModelLimitReached(modelId); selectNextAvailableModel() — picks next highest-scored non-exhausted model, returns false if none left; openPanel(); closePanel()
│   │   └── aiAnalysisStore.ts  # Pinia store — shared AI analysis logic for both tabs; keyed by AiAnalysisType ('budgetOptimizer'|'executiveSummary'); per-tab internal state (plain object): firstAnalyzeCompleted, controller, debounceTimer, cache (Map<string, CacheEntry> — response/timestamp/cooldownUntil), lastVisibleCacheKey; no dataCache — Vue computed on campaignStore.portfolioAnalysis handles memoization; per-tab reactive display state (ref<TabDisplay<T>>): budgetOptimizer { status, response: BudgetOptimizerResponse|null, error, errorFallback } + executiveSummary { same shape, ExecutiveSummaryResponse|null }; shared: activeTab (AiAnalysisType), analysisActivated; derived getters from aiStore: tokenLimitReached (computed from aiStore.allModelsLimitReached), evaluationDisabled (aiStore.evaluationDisabled || filteredCampaigns.length === 0); store-internal showTokenLimitState(tab) shows cached response or sets token-limit error; module-level helpers: getOtherAnalysisType, setDisplay (full ref.value replacement — no property mutation), createTabState, TabDisplay<T> type; debounced label-change auto-calls (350ms), response caching (provider::sorted labels), request cancellation (AbortController), 5s cooldown, silent model fallback on token-limit, stamps response.model + response.timestamp on success, model change watcher, setActiveTab cancels in-flight on previous tab, panel open/close + tab switch evaluation, clearStateForNewCSV, clearStateForDisconnect
│   ├── router/
│   │   └── index.ts            # Vue Router — single route: / → DashboardView
│   ├── ui/                     # UI component library — generic, reusable, no app dependencies
│   │   ├── charts/             # Chart.js wrapper module
│   │   │   ├── register.ts     # Registers all Chart.js components once (imported in main.ts)
│   │   │   ├── useChartTheme.ts# Chart colors, grid, tooltip constants for dark theme
│   │   │   ├── BarChart.vue    # Bar chart wrapper (supports horizontal mode)
│   │   │   ├── DonutChart.vue  # Doughnut chart wrapper
│   │   │   ├── GroupedBarChart.vue # Grouped bar chart wrapper
│   │   │   ├── FunnelChart.vue # Custom HTML/SCSS funnel chart
│   │   │   └── index.ts        # Barrel export for charts
│   │   ├── icons/              # Inline SVG icon components
│   │   │   ├── AlertCircleIcon.vue  # Circle with exclamation — error toast icon
│   │   │   ├── AlertTriangleIcon.vue # Triangle with exclamation — warning toast icon
│   │   │   ├── ArrowLeftIcon.vue
│   │   │   ├── ArrowUpIcon.vue     # Up arrow icon — used for sort direction indicator
│   │   │   ├── CheckCircleIcon.vue  # Circle with checkmark — success toast icon
│   │   │   ├── CloseIcon.vue
│   │   │   ├── DownloadIcon.vue
│   │   │   ├── EyeIcon.vue         # Show password icon
│   │   │   ├── EyeOffIcon.vue      # Hide password icon
│   │   │   ├── FileTextIcon.vue
│   │   │   ├── InfoIcon.vue         # Circle with i — info toast icon
│   │   │   ├── SlidersIcon.vue     # Sliders icon — used for Optimizer tab
│   │   │   ├── SparklesIcon.vue    # AI / sparkles icon
│   │   │   ├── UploadIcon.vue
│   │   │   └── index.ts        # Barrel export for icons
│   │   ├── toast/              # Toast notification module
│   │   │   ├── ToastNotification.vue  # Toast component — props: message, variant (NotificationVariant); icon chosen by variant (AlertCircleIcon/CheckCircleIcon/AlertTriangleIcon/InfoIcon); border + bg + icon color match badge tokens; role="alert", aria-live; flat scoped @apply styles
│   │   │   ├── ToastContainer.vue     # Renders toast queue; Teleport to body; passes variant from toast.type; flat scoped @apply styles
│   │   │   └── index.ts        # Barrel export for toast
│   │   ├── types/
│   │   │   ├── badge-variant.ts    # BadgeVariant type — 'success' | 'warning' | 'danger' | 'info' | 'opportunity'; imported by both AI panel components
│   │   │   └── notification-variant.ts # NotificationVariant type — 'success' | 'error' | 'warning' | 'info'; used by toastStore and ToastNotification
│   │   ├── forms/              # Form input components
│   │   │   ├── FileDropzone.vue    # File drop zone — v-model (File|null), id?, accept?, hint?, disabled? props; button element; hidden input (tabindex="-1"); hintId computed from id prop; hasError() plain function (Comment-node filtering) drives input-error class; disabled guards open/drop/drag handlers; named error slot; scoped @apply styles
│   │   │   ├── PasswordInput.vue   # Password/secret input — v-model, id?, placeholder?, disabled?, autocomplete? props; toggle show/hide via EyeIcon/EyeOffIcon; named error slot drives input-error class via slot content detection (Comment node filtering); scoped non-BEM styles
│   │   │   ├── RadioToggle.vue     # Pill-style radio group — v-model, options ({value,label}[]), name?, disabled? props; grid-template-columns driven by options.length; scoped non-BEM styles
│   │   │   └── index.ts            # Barrel export for forms module
│   │   ├── BaseModal.vue       # Generic modal shell — Teleport to body; backdrop (click-to-close via @click.self, aria-modal/role="dialog"/aria-label); header (title prop + close button using .btn-icon-secondary), single default slot; Escape to close
│   │   ├── Spinner.vue         # Reusable spinner — size (sm/md/lg/xl/xxl) + variant (primary/secondary) props; aria-hidden; colors via tailwind spinner tokens; @apply throughout
│   │   ├── Tabs.vue            # Generic tab bar — Tab<T> type; tabs + activeTab props; change emit; optional icon per tab via Component; auto-selects first tab on mount; @apply styles
│   │   ├── DataTableHeader.vue # Reusable thead — columns: DataTableColumn[] (key, label, sortable?, align?: 'left'|'right', ariaLabel?, class?); sticky?: bool; sortKey?: string; sortDir?: SortDir; emits sort:[key]; non-sortable → data-table-header; sortable → data-table-sortable-header + ArrowUpIcon; right-align via scoped .th-right; exports DataTableColumn + SortDir types
│   │   └── index.ts            # Barrel export for the full ui library; re-exports forms/* via ./forms barrel
│   ├── shell/
│   │   ├── AppShell.vue            # Top-level layout wrapper — flat @apply styles (shell-left/shell-header/shell-title/shell-main); flex col → flex row at lg+; shell-left (header + shell-main slot, flex col, overflow-y auto) + AiToolsDrawer sibling; shell-main has max-width 1280px centered; provides openUploadModal and openAiPanel via provide(); uses aiStore.aiPanelOpen for panel state; wires panel open/close to aiAnalysisStore; header "Upload CSV" button uses .btn-secondary-outline and routes through ReplaceDataModal when data exists; gradient title (indigo→pink)
│   │   └── AiToolsDrawer.vue       # Push drawer at lg+ (width 0→30rem, sticky top-0); fixed overlay at <lg (max 90vw/90vh, backdrop, slide-in transition); Escape to close; flat @apply styles (push-drawer/push-drawer-panel/overlay/overlay-panel, open modifier class)
│   ├── features/
│   │   ├── ai-tools/               # AI Tools feature folder
│   │   │   ├── components/
│   │   │   │   ├── AiToolsContent.vue      # Root content — header (SparklesIcon + title + .btn-icon-secondary close); shows AiConnectionForm when disconnected; AiConnectedStatus + AiAnalysis when connected; grid layout (status bar / tabs / scroll area)
│   │   │   ├── ai-analysis/
│   │   │   │   ├── utils/
│   │   │   │   │   ├── analysis-badge-variants.ts  # Badge variant helpers for AI panels — internal badgeVariant(map, key) generic resolver; exports: healthScoreVariant, channelStatusVariant, urgencyVariant, insightTypeVariant, confidenceVariant, executionRiskVariant, actionVariant, effortVariant
│   │   │   │   │   ├── analysis-error-messages.ts  # ANALYSIS_ERROR_MESSAGES (Record<AiErrorCode, string> — all 10 codes, plain strings); used by aiAnalysisStore to format analysis panel error messages
│   │   │   │   │   ├── analysis-prompt.ts  # buildAnalysisPrompt (internal, maps AiAnalysisType to prompt generator via PROMPT_BUILDERS; PromptBuilder type is internal); runAnalysisPrompt(providerState, analysisContext, signal) → AnalysisResponse|null — builds prompt, calls runProviderPrompt, stamps model+timestamp, returns null on abort
│   │   │   │   │   ├── utils.ts            # getCacheKey(channelIds, provider) → string — normalises channelIds (sort, fallback to 'all') and lowercases provider; used by aiAnalysisStore
│   │   │   │   │   └── index.ts            # Barrel — re-exports analysis-badge-variants, analysis-error-messages, analysis-prompt, utils
│   │   │   │   ├── types/
│   │   │   │   └── index.ts            # AnalysisResponse = BudgetOptimizerResponse | ExecutiveSummaryResponse; AnalysisContext (type/analysis/isFiltered/businessContext?); AIProviderState (provider/apiKey/selectedModel); used by analysis-prompt.ts and aiAnalysisStore
│   │   │   │   └── components/         # AI analysis UI — tab switcher, shared section wrappers, budget-optimization and executive-summary component trees
│   │   │   │       ├── AiAnalysis.vue          # Tab switcher — Tabs (Summary/Optimizer) + scrollable container; reads aiAnalysisStore.activeTab + campaignStore.portfolioScope; passes scope prop to BudgetOptimizationAnalysis and ExecutiveSummaryAnalysis; flat scoped .panel-container style
│   │   │   │       ├── index.ts                # Barrel export — AiAnalysis
│   │   │   │       ├── shared/                 # Shared components used by both tabs — props-only, no store reads
│   │   │   │       │   ├── AnalysisState.vue       # Analysis wrapper — props: title, actionLabel, idleText, loadingText, status (AsyncStatus), error (AiAnalysisError|null), errorFallback, tokenLimitReached, isButtonDisabled, hasResult, cacheTimestamp (string|number|null), modelName?; formats cacheTimestamp internally via computed; emit: analyze; slot: result content; handles header, token-limit notice, idle/loading/error/result states; grouped scoped styles
│   │   │   │       │   ├── AnalysisSummary.vue     # Section header — props: title, period?, scope (CampaignScope); #badge slot (optional right-side content); default slot (body); analysis-details renders period/campaigns/channels as .detail-item spans; bullet separator from global _detail-item.scss; no scoped styles
│   │   │   │       │   └── AnalysisCorrelations.vue # Correlations section — correlations: ExecutiveCorrelation[] prop; v-if on length; no scoped styles (global classes only)
│   │   │   │       ├── budget-optimization/    # Budget Optimizer tab orchestrator + dumb section components — all props-only section components, no store reads, scoped @apply flat styles
│   │   │   │       │   ├── BudgetOptimizationAnalysis.vue        # Budget Optimizer tab — thin orchestrator; receives scope: PortfolioScope prop; wraps AnalysisState; slot content guarded with v-if="response" (null-safe); reads aiAnalysisStore only; no scoped styles
│   │   │   │       │   ├── BudgetOptimizationOverview.vue        # Summary overview — props: summary (string), period?, scope (CampaignScope); wraps AnalysisSummary
│   │   │   │       │   └── BudgetOptimizationRecommendations.vue # Recommendations — props: recommendations[]; fromCampaign→toCampaign header with arrow; confidenceVariant + executionRiskVariant badges; budgetShift/expectedImpact metrics formatted with formatCurrency/formatPercentage from common; v-if on length; rec-card container-type for badge stacking via @container
│   │   │   │       └── executive-summary/      # Executive Summary tab orchestrator + dumb section components — all props-only section components, no store reads, scoped @apply flat styles
│   │   │   │           ├── ExecutiveSummaryAnalysis.vue        # Executive Summary tab — thin orchestrator; receives scope: PortfolioScope prop; wraps AnalysisState; slot content guarded with v-if="response" (null-safe); reads aiAnalysisStore only; no scoped styles
│   │   │   │           ├── ExecutiveSummaryHealth.vue          # Portfolio Health — props: healthScore (healthScore/reasoning/label), bottomLine, scope (CampaignScope); wraps AnalysisSummary with health badge in #badge slot
│   │   │   │           ├── ExecutiveSummaryPriorityActions.vue # Priority Actions — props: actions (priorityActions[]); urgencyVariant badge; camelCase fields (expectedOutcome, successMetric)
│   │   │   │           └── ExecutiveSummaryInsights.vue        # Insights — props: insights[]; insightTypeVariant badge; no icon; metricHighlight (camelCase)
│   │   │   ├── ai-connection/
│   │   │   │   ├── components/         # Connection UI components
│   │   │   │   │   ├── AiConnectionForm.vue    # Provider selection via RadioToggle (PROVIDER_OPTIONS from providers-meta) + API key input via PasswordInput (error passed via #error slot) + collapsible help section (.card-secondary) + Connect button (.btn-primary + Spinner) + inline error (field-error/field-error-hint); clears connectionError + apiKey on provider change; providerHelp computed from PROVIDER_HELP; imports PROVIDER_OPTIONS, PROVIDER_HELP from providers/providers-meta; imports ERROR_MESSAGES, ERROR_HINTS from utils/; flat scoped styles (no BEM)
│   │   │   │   │   ├── AiConnectedStatus.vue   # Status bar — provider label + green dot (::before pseudo-element + shadow-connection) + "Connected" + .btn-destructive-small Disconnect; disconnect clears analysis state via aiAnalysisStore; flat scoped styles (no BEM)
│   │   │   │   │   └── index.ts                # Barrel export — AiConnectionForm, AiConnectedStatus
│   │   │   │   └── utils/              # Connection UI constants
│   │   │   │       ├── error-handling.ts # ERROR_MESSAGES (Record<AiErrorCode, (provider) => string>); ERROR_HINTS (Record<AiErrorCode, string>); getErrorCode(error) → AiErrorCode — normalises via normalizeConnectionError + ERROR_CODES set
│   │   │   │       └── index.ts        # ERROR_MESSAGES (Record<AiErrorCode, (provider) => string> — all 10 codes; provider-aware functions); ERROR_HINTS (Record<AiErrorCode, string> — all 10 codes); imports PROVIDER_LABELS from providers-meta
│   │   │   ├── providers/              # Provider implementations — Gemini and Groq, each broken into api/connect/types; shared utils for error handling and model ranking
│   │   │   │   ├── index.ts            # Barrel — re-exports connectGemini, connectGroq, requestGeminiChatCompletion, requestGroqChatCompletion, runProviderPrompt, connectProvider
│   │   │   │   ├── connect-provider.ts # connectProvider(provider, apiKey) → AiModel[]; thin dispatcher; applies shared rankModels step (strengthScore≥6 filter + byStrengthDesc sort + withLimitReset map + no-models throw) on top of each provider's raw result; errors thrown by providers or rankModels propagate to aiStore
│   │   │   │   ├── run-provider-prompt.ts # runProviderPrompt<T>(provider, apiKey, model, prompt, signal?) → T; dispatches to provider caller, parses JSON, throws 'invalid-response' on parse failure; used by ai-analysis/utils/analysis-prompt for all analysis calls
│   │   │   │   ├── types.ts            # AiModelCandidate (id/contextWindow?/maxOutputTokens?/thinking?) — normalized DTO passed to AI for evaluation; AiModel (id/displayName/family/strength/strengthScore/reason/limitReached) — AI-evaluated model DTO; ModelsResponse ({ models: AiModel[] }); exported via providers/index.ts barrel
│   │   │   │   ├── providers-meta.ts   # PROVIDER_LABELS (Record<AiProviderType, string>), PROVIDER_HELP (Record<AiProviderType, ...>), PROVIDER_OPTIONS; GROQ_PROVIDER_RULES and GEMINI_PROVIDER_RULES as string[] — per-provider instruction lists passed into generateModelEvaluationPrompt
│   │   │   │   ├── gemini/             # Gemini provider module
│   │   │   │   │   ├── types.ts        # GeminiModel, GeminiModelsResponse
│   │   │   │   │   ├── api.ts          # fetchGeminiModels(apiKey, signal?) → GeminiModel[]; requestGeminiChatCompletion(apiKey, model, prompt, signal?) → string; uses assertResponseOk/assertChatResponseOk/normalizeConnectionError from utils
│   │   │   │   │   ├── connect.ts      # connectGemini(apiKey) → AiModel[]; BANNED constant + isAllowed(m) (checks generateContent support + banned name) + filterModels (uses isAllowed reference); flashPriority + getSortedCandidates (flash-first, version desc); stripPrefix helper; buildValidIds (Set of stripped names); toAiModelCandidate(GeminiModel) → AiModelCandidate (stripped id, inputTokenLimit, outputTokenLimit, thinking); tryWithModel maps candidates to AiModelCandidate[], calls generateModelEvaluationPrompt with GEMINI_PROVIDER_RULES; evaluateModels (recursive fallback); throws no-models if all exhausted
│   │   │   │   │   └── index.ts        # Barrel — requestGeminiChatCompletion, connectGemini
│   │   │   │   ├── qroq/               # Groq provider module (folder name: qroq)
│   │   │   │   │   ├── types.ts        # GroqModel, GroqModelsResponse
│   │   │   │   │   ├── api.ts          # fetchGroqModels(apiKey, signal?) → GroqModel[]; requestGroqChatCompletion(apiKey, model, prompt, signal?) → string; uses assertResponseOk/assertChatResponseOk/normalizeConnectionError from utils
│   │   │   │   │   ├── connect.ts      # connectGroq(apiKey) → AiModel[]; BANNED constant + isAllowed(m) (checks active===true + no banned token) + filterModels (uses isAllowed reference); byCreatedDesc + getSortedCandidates; buildValidIds (Set from candidate ids); toAiModelCandidate(GroqModel) → AiModelCandidate (maps id/context_window/max_completion_tokens); tryWithModel maps candidates to AiModelCandidate[], calls generateModelEvaluationPrompt with GROQ_PROVIDER_RULES; evaluateModels (recursive fallback); throws no-models if all exhausted
│   │   │   │   │   └── index.ts        # Barrel — requestGroqChatCompletion, connectGroq
│   │   │   │   └── utils/              # Shared provider utilities
│   │   │   │       ├── error-handling.ts # normalizeConnectionError(error) → Error (TypeError→network, AbortError→timeout, pass-through otherwise); errorCodeFromStatus(status) → AiErrorCode (400/401/403→invalid-key, 429→rate-limit, 500+→server-error); assertResponseOk(response) — throws errorCodeFromStatus if not ok; assertChatResponseOk(response) — throws token-limit or errorCodeFromStatus (reads body for token-limit detection)
│   │   │   │       ├── models-utils.ts # getModelById(models, id) → AiModel|undefined; getNextAvailableMode(models) → AiModel|undefined (first non-limitReached); getAllModelsLimitReached(models) → boolean
│   │   │   │       ├── shared.ts       # parseJsonResponse<T>(text) → T (strips markdown fences, JSON.parse); toValidModels(validIds, parsed) → AiModel[] (filters by validIds.has(m.id), throws no-models if empty)
│   │   │   │       └── index.ts        # Barrel — re-exports error-handling
│   │   │   ├── types/
│   │   │   │   └── index.ts            # Single type hub for the AI feature — provider/connection types (AiProviderType, AiErrorCode, AiConnectionError); analysis types (AiAnalysisType, AiAnalysisError); prompt helper types (PromptList, PromptInstructions, PromptInstructionStep, PromptScopeConfig, BusinessContext, BudgetOptimizerContextInput); AI response literal types (ConfidenceLevel, ExecutionRisk, HealthLabel, InsightType, ActionUrgency); Executive Summary output types (ExecutiveInsight, PriorityAction, ExecutiveCorrelation, ExecutiveSummaryOutput); Budget Optimizer output types (BudgetRecommendation, BudgetOptimizerOutput); response types (BudgetOptimizerResponse, ExecutiveSummaryResponse); legacy data types (BudgetOptimizerData/Campaign/Channel — old prompt files only)
│   │   │   ├── prompts/
│   │   │   │   ├── prompt-utils.ts             # Shared prompt helpers — getPromptList, getPromptInstructions, getAnalysisInstructions, getInterpretationRulesBlock, getOutputRulesBlock, getScopeBlock
│   │   │   │   ├── business-context.ts         # Business context prompt block builder — getBusinessContextLinesForPrompt, getBusinessContextForPrompt, generateBusinessContextForPrompt
│   │   │   │   ├── executive-summary-prompt2.ts # generateExecutiveSummaryPrompt(analysis: PortfolioAnalysis, isFiltered: boolean) — accepts PortfolioAnalysis directly; curates promptInput (portfolio, campaignGroups.top/bottom/watch, channels, channelGroups, derivedSignals.inefficientChannels/scalingOpportunities/concentrationFlag/correlations); adds CAMPAIGN/CHANNEL GROUP CONTEXT sections; camelCase schema
│   │   │   │   ├── budget-optimization-prompt2.ts # generateBudgetOptimizationPrompt(analysis: PortfolioAnalysis, isFiltered: boolean, businessContext?) — accepts PortfolioAnalysis directly; curates promptInput (portfolio, campaignGroups, channels, derivedSignals.inefficientCampaigns/budgetScalingCandidates/transferCandidates); adds CAMPAIGN GROUP CONTEXT section; camelCase OUTPUT_SCHEMA (summary + recommendations[])
│   │   │   │   ├── budget-optimization-prompt.ts  # Legacy — old generateBudgetOptimizationPrompt from BudgetOptimizerData; unused but kept compilable
│   │   │   │   ├── model-evaluation-prompt.ts  # generateModelEvaluationPrompt(models: AiModelCandidate[], providerRules: string[]) → string; renders providerRules as bullet list; OUTPUT_SCHEMA uses camelCase (displayName/family/strengthScore)
│   │   │   │   └── index.ts                    # Barrel export — generateBudgetOptimizationPrompt from budget-optimization-prompt2, generateExecutiveSummaryPrompt from executive-summary-prompt2, generateModelEvaluationPrompt
│   │   │   ├── mocks/
│   │   │   │   ├── budget-optimizer-mocks.ts    # 5 BudgetOptimizerResponse mock objects (aggressive reallocation, conservative, seasonal pivot, channel consolidation, no strong opportunity); camelCase shape matching BudgetOptimizerOutput
│   │   │   │   ├── executive-summary-mocks.ts  # 5 ExecutiveSummaryResponse mock objects (strong portfolio, needs attention, excellent, critical, growth phase); new camelCase shape; no period field
│   │   │   │   └── index.ts                    # Barrel export for mocks
│   │   │   └── index.ts            # Barrel export (empty — AiToolsDrawer moved to shell/)
│   │   ├── dashboard/              # Dashboard feature folder
│   │   │   ├── DashboardView.vue   # Campaign performance dashboard — shows EmptyState or full dashboard; injects openUploadModal and openAiPanel from AppShell; wraps header and channel filter in .dashboard-section; .data-visualization sets container-type: inline-size to enable child container queries; table section uses global `.card` class
│   │   │   └── components/         # Components owned by this view
│   │   │       ├── DashboardHeader.vue # Dashboard header — reads campaignStore (title, campaign/channel counts) + aiStore (isConnected, aiPanelOpen); emits aiClick (camelCase); multi-root (title-row + details); AI button disabled when panel open; connected dot (top-right) shown when AI connected + panel closed; layout wrapper provided by DashboardView
│   │   │       ├── DashboardKpis.vue   # KPI cards section — props: kpis (CampaignKPIs); formats all values internally; renders 5 KpiCards (Budget, Revenue+ROI, Conversions+CVR, CTR, CAC); .kpi-grid uses @container breakpoints (360px → 2 cols, 640px → 3 cols, 1024px → 5 cols)
│   │   │       ├── DashboardCharts.vue # Charts section — props: campaigns (CampaignPerformance[]), channels (Channel[]), kpis (CampaignKPIs); all chart computeds internal (campaignColorMap, roiChartData, budgetCampaignData, revVsBudgetData via channels, funnelValues via kpis); owns .charts-grid scoped style
│   │   │       ├── EmptyState.vue      # No-data screen — uses FileActions for download/upload buttons
│   │   │       ├── KpiCard.vue         # Single KPI metric card — props: label, value (string|null|undefined — pre-formatted by parent, falls back to 'N/A'); optional #secondary slot; uses @include cq-container('kpi-card') + @include cq-up(tiny, 'kpi-card') for container-query-driven font size scaling; flat scoped styles (no BEM)
│   │   │       ├── CampaignTable.vue   # Sortable campaign data table — prop: CampaignPerformance[]; reads pre-calculated roi/ctr/cvr/cac directly; revenue+ROI coloring via percentageClass(c.roi); uses global data-table classes; channel cell uses `.badge.info`
│   │   │       └── ChannelFilter.vue   # Multi-select channel filter pills
│   │   └── data-transfer/          # CSV upload & data transfer feature folder
│   │       ├── index.ts            # Barrel — exports UploadModal, ReplaceDataModal, FileActions, useUploadModal for external consumers
│   │       ├── types/
│   │       │   └── index.ts        # CampainDataRowIssueType + CampainDataFieldIssue (column/issue/details) + CampainDataRowError extends CampainDataFieldIssue (row) + CampainDataDuplicateGroup (campaignName + rows: Campaign[]) + CampainDataValidationErrorType (union incl. duplicate_campaigns) + CampainDataValidationError (type + detail? + missingColumns? + rowErrors? + duplicateGroups?) + CampainDataParseResult (campaigns: Campaign[]) + CampainDataProcessRowsResult (campaigns: Campaign[]); no CsvCampaign — Campaign is used directly
│   │       ├── components/
│   │       │   ├── FileActions.vue         # Download Template + Upload CSV button pair — emits upload; uses useDownloadTemplate; flat @apply scoped styles; responsive stacking at <480px
│   │       │   ├── UploadModal.vue         # Self-contained modal — view: 'form'|'row-errors'|'duplicate-rows'; open/close/parse/store; exposes only open(); sequential error handling: invalid_rows → row-errors view, then duplicate_campaigns → duplicate-rows view (or direct if no row errors)
│   │       │   ├── ReplaceDataModal.vue    # Confirmation modal — wraps BaseModal; uses global .modal-body, .modal-footer, .btn-secondary-outline, .btn-primary; no scoped styles; emits confirm/close; opened by AppShell header button when data exists
│   │       │   ├── UploadCampainData.vue   # Multi-root (body + footer divs) — title input + FileDropzone (hint="CSV", error via #error slot) + Upload/Cancel/Download buttons; v-model title & file; parseError + isLoading props; imports isValidCsvFile from parse-csv; field label has for="csv-file" linking to FileDropzone's hidden input; uses global field/form-control classes; footer stacks vertically at <480px
│   │       │   ├── DisplayUploadErrorsStep.vue # Multi-root (body + footer divs) — uses DataErrorSummary for error blocks (stacked: invalid-only / partial-import) + DuplicateSummary for duplicate notice; scrollable table (CampainDataRowError[]); duplicateGroupCount prop: adapts proceed label ('Proceed with valid rows' or 'Review duplicate campaigns'); proceed visible when validCampaigns > 0 OR duplicateGroupCount > 0
│   │       │   └── validation/
│   │       │       ├── DataErrorSummary.vue # Presentational summary block — 3 named slots: title, badge, summary; no props, no scoped styles
│   │       │       ├── DuplicateSummary.vue # Duplicate-specific summary block — wraps DataErrorSummary; props: count, variant ('notice'|'resolve', default 'notice'), hasValidCampaigns?; notice variant: "will be resolved in next step"; resolve variant: "select one row per group" with danger/warning badge toggle
│   │       │       ├── DataErrorsTable.vue # Dumb table component — props: errors (CampainDataRowError[]); sortable Row column (asc/desc toggle, data-table-sortable-header + data-table-sticky-header); flat @apply styles; no BEM
│   │       │       └── CampainDuplicationsTable.vue # Sortable grouped duplicate table — props: duplicateGroups (CampainDataDuplicateGroup[]); owns sort state (rowId/conversions/revenue), selection Map, CheckIcon group headers; emits change:[Campaign[]] on every selection; 8-column table with DataTableHeader; scoped group-header/cell-select/row-selectable styles
│   │       │   └── ResolveDuplicationsStep.vue # Multi-root (body + footer divs) — uses DuplicateSummary (variant="resolve") + CampainDuplicationsTable; resolve-indicator shows resolvedCount/total (green when allResolved); canProceed: validCampaigns.length > 0 OR selectedCampaigns.length > 0; emits proceed([Campaign[]]) with campaigns from @change; Back/Proceed/Cancel buttons
│   │       ├── composables/
│   │       │   ├── useDownloadTemplate.ts  # Shared composable — downloadCsv + toast error fallback
│   │       │   └── useUploadModal.ts       # Upload modal composable — accepts modalRef (InstanceType<UploadModal>); uses campaignStore internally; hasCampaigns computed; requestUpload (opens modal or shows replace confirm based on hasCampaigns); onReplaceConfirm/closeReplaceConfirm; calls provide('openUploadModal') internally
│   │       └── utils/
│   │           ├── download-csv.ts         # Builds CSV string from Campaign[], triggers browser download
│   │           ├── error-messages.ts       # All data validation display text — VALIDATION_ERROR_MESSAGES const map (incl. duplicate_campaigns) with {placeholder} syntax; getValidationErrorMessage(CampainDataValidationError); getRowErrorMessage(CampainDataFieldIssue); getRowErrorSummaryWords(invalidCount, validCount) → RowErrorSummaryWords; replacePlaceholders helper
│   │           ├── detect-campaign-duplication.ts # detectCampaignDuplication(campaigns: Campaign[]) → { unique: Campaign[], groups: CampainDataDuplicateGroup[] } — case-insensitive name grouping; separates unique from duplicate groups
│   │           ├── parse-csv.ts            # PapaParse wrapper — exports isValidCsvFile(f) → bool; file-level validation (type/size) + parse; delegates to validate-campaign-data; returns CampainDataParseResult
│   │           ├── validate-campaign-data.ts # Campaign data validator — EXPECTED_HEADERS (excludes rowId — system-generated, not a CSV column); column presence check; empty-file check; extractCampaignFields(row, headerMap, rowId) → Campaign; processRows returns CampainDataProcessRowsResult (Campaign[] — no rowNum spread, rowId already set); delegates duplicate detection; returns CampainDataParseResult with both invalid_rows and duplicate_campaigns errors when applicable
│   │           └── validate-row-data.ts    # Per-row field validation — validateRow + three sub-validators (string/numeric/funnel); guard helpers; returns CampainDataRowError[]
│   ├── styles/
│   │   ├── index.scss              # Root barrel — @use themes/dark + components/index + utilities/index; imported by style.scss
│   │   ├── themes/
│   │   │   └── dark.scss           # CSS custom properties for dark theme — primary scale (50–1000), neutral-100, color-background, color-surface, color-typography, color-on-surface-high, color-surface-outline; applied on :root and [data-theme="dark"]
│   │   ├── container-queries.scss  # SCSS mixin library for container queries — $container-sizes scale (tiny/xs/sm/md/lg/xl/2xl); mixins: cq-container($name?, $type?), cq-up($size, $name?), cq-down($size, $name?), cq-between($min, $max, $name?); globally injected via Vite additionalData
│   │   ├── components/
│   │   │   ├── index.scss          # Barrel — @use all component partials
│   │   │   ├── _ai-summary.scss    # @layer components — .ai-panel, .ai-section (with p > strong); flat child classes: .section-title, .section-subtitle, .section-note, .analysis-details
│   │   │   ├── _badge.scss         # @layer components — .badge, .badge-text, .badge-background; variants: success/warning/danger/info/opportunity
│   │   │   ├── _button.scss        # @layer components — .btn base, .btn-primary, .btn-icon-secondary, .btn-secondary-outline (border 1px), .btn-destructive-small, .btn-small (standalone)
│   │   │   ├── _card.scss          # @layer components — .card (border-surface-outline), .card-secondary; flat child classes: .card-head, .card-title, .card-content; .card.card-smaller-spaces modifier
│   │   │   ├── _detail-item.scss   # @layer components — .detail-item (inline-block, pr-1.5); bullet separator via & + &::before pseudo-element (1×1 dot, bg-typography-subtle)
│   │   │   ├── _forms.scss         # @layer components — .form, .field, .field-label, .form-control, .input-error, .field-errors, .field-error, .field-error-hint
│   │   │   ├── _modal.scss         # @layer components — .modal-body, .modal-footer (flat, non-BEM)
│   │   │   └── _table.scss         # @layer components — .data-table, .data-table-header, .data-table-row, .data-table-cell
│   │   └── utilities/
│   │       ├── index.scss          # Barrel — @use all utility partials
│   │       ├── _roi.scss           # @layer utilities — .roi-text with .positive/.warning/.negative modifiers
│   │       └── _scrollbar.scss     # @layer utilities — .scrollbar-stable, .scrollbar-stable-both, .scrollbar-on-surface
│   ├── App.vue                 # Root component — AppShell + RouterView
│   ├── main.ts                 # Entry point — registers Pinia, Router, Chart.js
│   └── style.scss              # Global styles: Tailwind directives, dark mode; imports styles/index (theme tokens now in styles/themes/dark.scss)
├── index.html                  # <html class="dark"> — dark mode active before JS runs
├── tailwind.config.js          # Tailwind v3 — darkMode: 'class', indigo primary theme; background/surface/surface-outline/on-surface-high/typography.DEFAULT via CSS vars; danger (default + -5p), success, warning, surface-border (default/secondary), spinner color tokens (primary/secondary arc + track); connection box-shadow token
├── postcss.config.js
├── vite.config.ts              # @ alias → src/; SCSS additionalData globally injects container-queries.scss as *
└── package.json                # Locked via package-lock.json
.gitignore                      # Excludes node_modules, dist, .env
```

---

## CSV Format

| Column | Type | Description |
|---|---|---|
| `campaign` | string | Campaign name |
| `channel` | string | Channel name — any string; channels are extracted dynamically from the data |
| `budget` | number | Cost in EUR |
| `impressions` | number | Total impressions |
| `clicks` | number | Total clicks |
| `conversions` | number | Total conversions |
| `revenue` | number | Revenue in EUR |

---

## Feature Checklist

### CSV Upload & Template
- [x] Download CSV template (mock campaigns)
- [x] Empty state with "Download Template" and "Upload CSV" options
- [x] Drag & drop + file picker upload
- [x] Auto-detection of columns (case-insensitive, 7 expected headers, extra columns ignored)
- [x] Error handling: wrong file type and size shown inline; missing columns listed by name; invalid rows shown in a structured table with option to proceed with valid rows
- [x] Upload again / replace existing data (with confirmation warning)

### Campaign Performance Dashboard
- [x] KPI Cards: Total Budget, Revenue, ROI, CTR, CVR, CAC
- [x] Bar chart: ROI by campaign
- [x] Donut chart: Budget allocation by channel
- [x] Grouped bar chart: Revenue vs Budget by channel
- [x] Conversion Funnel: Impressions → Clicks → Conversions
- [x] Campaign table: sortable by any column
- [x] Channel filters — dynamic from data, real-time updates across all charts and table

### AI Tools
- [x] AI button in dashboard header (SparklesIcon + "AI" label, primary variant)
- [x] Push drawer at lg+ (slides in from right, compresses dashboard; 400px wide)
- [x] Fixed overlay at <lg (on top of dashboard; max 90vw/90vh; backdrop + slide-in transition)
- [x] Escape key or backdrop click closes panel
- [x] Connection form — provider radio buttons (Google Gemini / Groq), API key input with show/hide toggle, Connect button with spinner
- [x] Live connection verification — Gemini: GET /v1beta/models; Groq: GET /openai/v1/models; inline error on failure
- [x] Connected status bar — provider name + green dot + "Connected" + Disconnect link
- [x] Tabbed interface — Optimizer tab (SlidersIcon) + Summary tab (FileTextIcon)
- [x] API key memory-only (not persisted to storage)
- [x] Budget Optimizer tab — full UI for BudgetOptimizerResponse: executive summary, recommendations (confidence badge, reallocation amount, expected impact, timeline, success metrics), top performers (ROI + unlock potential), underperformers (action badge: Reduce/Pause/Restructure), quick wins (effort badge), correlations, risks & mitigations; 5 mock responses cycle on each Analyze click
- [x] Executive Summary tab — refactored to camelCase ExecutiveSummaryResponse: healthScore badge (Excellent/Good/NeedsAttention/Critical), bottomLine, insights (no icon, metricHighlight), priorityActions (urgency: Immediate/ThisQuarter/NextQuarter), correlations; input built via buildExecutiveSummaryInput + getExecutiveSummaryDerivedInputs; prompt2 with derivedSignals-first prioritization
- [x] Configure actual AI prompts for Optimizer and Summary (real API calls via runProviderPrompt + aiAnalysisStore)
- [x] Error handling for AI connection — granular error codes (invalid-key, network, timeout, rate-limit, server-error, unknown) with contextual hints in connection form; error state in both panels with message + hint

---

## Workflow Rules

### Language
- **English only** — all communication, code, comments, and documentation files without exception.

### Git
- **Never run git commands** — no git status, git add, git commit, git log, or any other git operation.
- The user handles all git operations. When asked for a commit message, provide the text only — no commands.

### Styling
- **No BEM** — the project does not use BEM class naming. The codebase has been fully cleaned of BEM.
- All styles use flat class names with `@apply` (Tailwind utility composition in SCSS). No `__element` or `--modifier` suffixes.
- Never introduce BEM in new code. If BEM is encountered anywhere, replace it immediately as part of the current task.

### Per interaction type

**New feature:**
1. Brainstorm first — discuss approach, components needed, options, trade-offs. Wait for explicit approval before writing any code.
2. Build it.
3. Update `README.md` — document the feature.
4. Update `CLAUDE.md` — mark checklist item done, update Architecture if new files were added.
5. **Immediately** append a Full Entry to `LOGS.md` — this is the last tool call before responding.
6. Reply with a summary.

**Bug fix / small update:**
1. Fix it.
2. Update `CLAUDE.md` if relevant.
3. **Immediately** append a Short Entry to `LOGS.md` — this is the last tool call before responding.
4. Reply with a summary.

**Refactor / architecture change:**
1. Discuss first — explain what and why. Wait for explicit approval.
2. Make the change.
3. Update `CLAUDE.md` — architecture section and checklist.
4. Update `README.md` if it affects setup or features.
5. **Immediately** append a Full Entry to `LOGS.md` — this is the last tool call before responding.
6. Reply with a summary.

> **CRITICAL:** The LOGS.md entry is mandatory for every code change — no matter how small. It is never optional and never deferred. The log entry is always the last tool call before the final response.

### Keeping CLAUDE.md up to date

CLAUDE.md must be updated as part of every interaction that changes the codebase. It is the living spec — it must always reflect the current state of the project.

After every change, check and update:
- **Status** — reflects what is currently built
- **Architecture** — any new files, folders, or structural changes are added; removed files are deleted
- **Feature Checklist** — completed items marked `[x]`

This update happens in the same session as the code change, before responding to the user.

---

## LOGS.md Entry Format

All entries use the same format — there is no short entry. Every change, no matter how small, gets a full entry.

```
## [#N] Title
**Type:** feature | refactor | architecture | update | fix

**Summary:** One-sentence description of what changed and why.

**Brainstorming:** Reasoning, options considered, trade-offs, and decisions made.

**Prompt:** The actual prompt used — written as if given to the AI.

**What was built:** / **What changed:**
- bullet list of files created or modified and what each does

**Key decisions & why:**
- bullet list of non-obvious choices and their rationale
```

**Formatting rules — no exceptions:**
- `**Type:**` follows immediately after the `##` heading with no blank line between them
- One blank line between every section
- Two blank lines between entries
- No `---` separators
- No extra sections beyond the six above
- New entries always appended at the end
- All six sections required: **Type**, **Summary**, **Brainstorming**, **Prompt**, **What was built / What changed**, **Key decisions & why**
