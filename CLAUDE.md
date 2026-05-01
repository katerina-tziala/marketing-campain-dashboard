# CLAUDE.md — Marketing Campaign Dashboard

## Project Context

An MBA assignment project: a web-based interactive dashboard for analyzing marketing campaign performance. Users upload campaign data via CSV and get KPI visualizations, channel comparisons, and AI-powered budget optimization recommendations via Google Gemini.

**Status:** Campaign Performance Dashboard implemented. CSV upload flow complete with full error handling. AI Tools panel in place with full analysis flow: AI button in campaign performance header, `ResponsiveDrawer` (push drawer at lg+, fixed overlay at <lg). AI connection form (provider radio buttons + API key + connect with live verification + granular error handling) implemented for Google Gemini and Groq; connected state shows status bar + tabbed interface (Summary / Optimizer). Both AI tabs wired to real Gemini/Groq API calls via `aiAnalysisStore` with full flow logic: debounced auto-calls on label change, response caching (nested Map<portfolioId, Map<cacheKey, CacheEntry>> — keyed by provider::sorted labels per portfolio), request cancellation via AbortController, 5s cooldown per cache key, per-model token/quota limit tracking (limitReached on AiModel, global tokenLimitReached only when all models exhausted), silent model fallback on token-limit (marks model, picks next highest-scored available model, retries transparently — user only sees final result), model change watcher for cache/auto-call, panel open/close persistence, tab switch = panel reopen evaluation (shared analysisActivated flag — analyzing on one tab activates auto-calls on the other), portfolio switch resets display state + flags (cache preserved per portfolioId), disconnect clears all analysis state including cache. No timeouts on any API calls (connection or analysis). Deterministic generation config: Gemini `temperature: 0`; Groq `temperature: 0, top_p: 1, frequency_penalty: 0, presence_penalty: 0`. Gemini model ID `models/` prefix stripped for analysis calls. Model evaluation prompt (`generateModelEvaluationPrompt`) returns up to 20 ranked models (filtered to strength_score >= 6, re-sorted by strength_score desc), default model properties updated if it appears in AI response, failure falls back to optimal model. Response types include `model?: AiModel` and `timestamp?: number` stamped on each result at write time; panels show "Generated at [time] with [display_name]"; timestamp travels with the response so no separate cacheTimestamp field exists in reactive state. Shared `rankModels` in `connect-provider.ts` applies strength_score≥6 filter + sort + limitReset map after each provider returns candidates. Budget Optimizer: summary + recommendations (fromCampaign/toCampaign/budgetShift/reason/expectedImpact/confidence/executionRisk); prompt accepts PortfolioAnalysis directly (curates promptInput locally); CAMPAIGN GROUP CONTEXT section added to prompt. Executive Summary: healthScore, bottomLine, insights (camelCase, no icon), priorityActions, correlations — no key_metrics or channel_summary; prompt accepts PortfolioAnalysis directly (curates promptInput locally); CAMPAIGN GROUP CONTEXT + CHANNEL GROUP CONTEXT sections added. `aiAnalysisStore` (now in `ai-tools/ai-analysis/stores/`) accepts `AiAnalysisContext` pushed by `dashboardOrchestrator.store` — no direct campaign-performance import; `analysisContext` drives portfolioContext, cache partitioning, filter watcher, portfolio-switch watcher, evaluationDisabled, and prompt execution. `getCacheKey` (ai-analysis/utils) normalises and hashes the cache key with xxhashjs h64 (seed=0) → 16-char hex string; `runAnalysisPrompt` handles prompt building, provider dispatch, and model+timestamp stamping. `evaluationDisabled` computed (`aiConnectionStore.evaluationDisabled || filteredCampaigns.length === 0`) is a derived getter that combines the aiConnectionStore gate (panel open + provider + selectedModel + no allModelsLimitReached) with the no-campaigns check. `tokenLimitReached` is a derived getter (`computed(() => aiConnectionStore.allModelsLimitReached)`) — not local state. `showTokenLimitState(tab)` is a store-internal helper that restores cached response or sets token-limit error display; called from `evaluateTab` (when `evaluationDisabled && tokenLimitReached`), `executeAnalysis` pre-flight (when selected model exhausted and no next model), and the filter watcher (immediately, no debounce). Module-level `setDisplay(display: Ref<TabDisplay>, status, response?, error?, notice?)` replaces the whole `ref.value` object (no property mutation); module-level `getOtherAnalysisType(type)` maps each `AiAnalysisType` to its counterpart. `AiAnalysisType` ('budgetOptimizer'|'executiveSummary') used as the single key type throughout — `AiAnalysisTab` removed. Display state uses `ref<TabDisplay<T>>` with full object replacement; `TabDisplay<T>` defined at module level in the store. Budget Optimizer requires ≥ 2 filtered campaigns — `optimizerCanAnalyze` returns false below this threshold; `executeAnalysis` and `evaluateTab` set `status: 'error'` with a descriptive message rather than silently returning. `optimizerCanAnalyze` and `summaryCanAnalyze` both gate on `tokenLimitReached` to disable the Analyze button when all models are exhausted. `PortfolioScope` kept for display (passed as prop to tab components); `channels: string[]` added for all portfolio channel names. `computePortfolioAnalysis` takes only `(selectedChannels, selectedChannelsIds)` — all internal derivations (kpis, scope, portfolio, classifications, signals) computed inside. `kpis` removed as a separate store computed — consumers use `portfolioAnalysis.portfolio`. Upload-replace flow: `UploadDataModal` calls `portfolioData.loadPortfolio(campaigns, title)` (add or replace); `portfolioData.store` (now in `app/stores/`) owns `PortfolioEntry` (id/title/channelMap/fullAnalysis/uploadedAt), signals via `pendingSelectionId` + `lastEvictedId`; `campaignPerformance.store` watches `pendingSelectionId` (immediate) to auto-select + reset filter; `aiAnalysis.store` watches `analysisContext.portfolioId` to reset display/flags; `useUploadModal` (now in `app/composables/`) provides `openUploadModal` via `provide()`. `portfolioAnalysis` computed short-circuits to `portfolio.fullAnalysis` when no filter active — avoids recomputation for full-portfolio view. Filter watcher double-guarded on both `analysisActivated` + `firstAnalyzeCompleted` to prevent spurious auto-calls on portfolio switch. `ShareEfficiency` carries both `allocationGap` (positive = overfunded, used for weak/inefficient classification) and `efficiencyGap` (positive = revenue outperforms budget share, used for charts and scaling language). Route-based page metadata: `applyPageMeta(route)` updates `document.title` and `<meta name="description">` after each navigation; app-level metadata (`lang`, `application-name`, `theme-color`) stays in `index.html`. Portfolio-analysis domain owns metric computation (`metrics.ts`), channel-map construction (`channel-map.ts`), neutral checker predicates (`checkers.ts`), ranking helpers (`ranking.ts` — ROI/budget/share/revenue ranking functions), classification logic (`classification/` folder), and signal computation (`signals/` folder); shared `utils/` retains only generic math, formatting, and sorting.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API) |
| Routing | Vue Router 4 |
| State Management | Pinia |
| Build Tool | Vite |
| Styling | Tailwind CSS v3 + SCSS (dark mode via `data-theme` attribute) |
| Charts | Chart.js + vue-chartjs |
| CSV Parsing | PapaParse (upload direction only) |
| AI | Google Gemini API + Groq API (free tiers) |

---

## Architecture

```
app/                        # Vue 3 + Vite project
├── src/
│   ├── app/                    # Application wiring layer — routing, shell, pages, orchestration
│   │   ├── App.vue             # Root component — AppShell + RouterView
│   │   ├── router/
│   │   │   ├── index.ts        # Vue Router — single route: / → DashboardPage; imports applyPageMeta; router.afterEach() applies page metadata on navigation; route meta.page: { title, description }
│   │   │   └── page-meta.ts    # applyPageMeta(route) — updates document.title (format: "Marketing Campaign Dashboard | Page Title") and creates/updates <meta name="description"> at runtime; reads route.meta.page; defines fallback defaults
│   │   ├── shell/
│   │   │   ├── AppShell.vue    # Top-level layout — header (Upload CSV button in floated action container, gradient title, adjusted padding/min-height), shell-body (main + drawer); provides openUploadModal via provide(); wires panel open/close through dashboardOrchestrator.store; uses useUploadModal from @/app/composables
│   │   │   └── AiToolsDrawer.vue # App-specific drawer adapter — uses ResponsiveDrawer from @/ui; owns AI title, SparklesIcon, close label, open prop, close emit, and AiToolsContent composition
│   │   ├── pages/
│   │   │   └── DashboardPage.vue # Page-level orchestrator — reads dashboardOrchestrator.store; directly switches between EmptyState and CampaignPerformanceView; passes AI button state from orchestrator; wires openAiPanel through orchestrator; leaves room for future overview/period comparison switching
│   │   ├── composables/
│   │   │   └── useUploadModal.ts # App-level upload orchestration — coordinates modal refs, replacement confirmation, hasCampaigns gate; calls provide('openUploadModal')
│   │   ├── dev-mode/               # [DEV ONLY] Centralized dev mode — remove before shipping
│   │   │   ├── config.ts           # DEV_MODE_CONFIG — switchboard object (enabled, portfolioData.seedMockCampaigns, aiTools.analysisCycle/connectionCycle)
│   │   │   ├── types.ts            # DevModeConfig type
│   │   │   ├── dev-analysis-cycle.ts  # Dev AI analysis cycle (was features/ai-tools/dev/); activated when aiTools.analysisCycle=true
│   │   │   ├── dev-connection-cycle.ts # Dev AI connection cycle (was features/ai-tools/dev/); activated when aiTools.connectionCycle=true; mutually exclusive with analysisCycle
│   │   │   ├── dev-portfolio-data.ts   # Seeds mock campaigns into portfolioData store on app start if no portfolios exist
│   │   │   └── index.ts            # Barrel — exports DevModeConfig, DEV_MODE_CONFIG; activateDevMode(config) orchestrates all dev cycles; deactivateDevMode() tears them down
│   │   └── stores/
│   │       ├── toast.store.ts  # Global toast Pinia store — Toast { title: string, message?: string, type: NotificationVariant }; addToast(title, type, message?) internal helper + 4 public helpers: showSuccessToast/showErrorToast/showWarningToast/showInfoToast; removeToast; 5s auto-dismiss
│   │       ├── dashboardOrchestrator.store.ts # Cross-feature mediator — composes useCampaignPerformanceStore + useAiConnectionStore + useAiAnalysisStore + usePortfolioDataStore; hasCampaigns/showAiButton/showConnectedDot/aiPanelOpen computed; openAiPanel()/closeAiPanel() coordinate both AI connection panel state and AI analysis panel lifecycle; watcher maps campaign performance state into plain AiAnalysisContext and pushes via setAnalysisContext(); clears context when no active portfolio; watches portfolioData.lastEvictedId → calls aiAnalysis.clearCacheForPortfolio(id); watches aiConnection.lastConnectionEvent → shows success/error toasts only when AI panel is closed
│   │       ├── portfolioData.store.ts # Pinia store (moved from shared/portfolio-data/) — PortfolioEntry array (id/title/channelMap/fullAnalysis/uploadedAt); signals: pendingSelectionId (ref<string|null> — set on add/replace, watched by campaignPerformance.store to auto-select), lastEvictedId (ref<string|null> — set on deletePortfolio, watched by campaignPerformance.store + aiAnalysis.store); buildChannelMap + computePortfolioAnalysis called at add/replace time; actions: addPortfolio, replacePortfolio, loadPortfolio (delegates to add or replace based on portfolios.length), deletePortfolio, getById; no selection logic in this store
│   │       └── index.ts        # Barrel — exports useDashboardOrchestratorStore, useToastStore, usePortfolioDataStore, PortfolioEntry
│   ├── shared/                 # Shared types and data — no framework dependencies; internal imports use relative paths; app/feature code imports via @/shared/... barrels
│   │   ├── types/
│   │   │   ├── async-status.ts # AsyncStatus type — 'idle' | 'loading' | 'done' | 'error'; shared across stores and components that track async operation state
│   │   │   └── index.ts        # Barrel — exports async-status + re-exports all data types (campaign, channel, PortfolioKPIs, etc.) from shared/data
│   │   ├── utils/
│   │   │   ├── math.ts         # safeDivide + roundTo(value, decimals) + computeRoundedRatioOrNull + computedMedianOrNull + toFinite — shared math helpers
│   │   │   ├── sorting.ts      # compareNullsLast(a, b) → number|null; compareDirectional(a, b, dir) → number; sortWithNullsLast(a, b, dir) → number — null-safe directional sort composing the two; SortDirection type; SortableValue type; sortByValue(items, fn, dir) → sorted array; sortByValueDesc(items, fn) → sorted array — shared null-safe value sorting used across tables and chart sorts
│   │   │   ├── formatters.ts   # APP_LOCALE = 'en-IE'; APP_CURRENCY = 'EUR'; formatCurrency(value) → '€N'; formatNumber(value) → localized string; formatDecimal(value, decimals) → fixed-decimal locale string; formatPercentage(value) → 'N.NN%' (0–2 decimals, trailing zeros stripped); formatCompactCurrency(value) → compact EUR; formatCompactNumber(value) → compact locale; all use Intl.NumberFormat with APP_LOCALE
│   │   │   └── index.ts        # Barrel — exports sorting, formatting, and math helpers (no portfolio-domain exports)
│   │   ├── portfolio-analysis/
│   │   │   ├── index.ts            # Barrel — exports computePortfolioAnalysis, metrics, channel-map, checkers, classification barrel, ranking helpers, and all portfolio-analysis types
│   │   │   ├── metrics.ts          # Portfolio-domain metric helpers (moved from shared/utils/campaign-performance.ts) — percentageClass, computePerformanceMetrics, computeShareEfficiency (returns allocationGap + efficiencyGap), toCampaignPerformance, aggregateCampaignMetrics, aggregateCampaignOutcomes, computePortfolioKPIs
│   │   │   ├── channel-map.ts      # Channel grouping/map construction (moved from shared/utils/campaign-channel.ts) — buildChannelMap(campaigns) → Map<string, Channel>; local ChannelAccumulator type
│   │   │   ├── checkers.ts         # Neutral ROI/share predicate functions shared by both signals and classification — ROI comparisons, minimum share gates, budget/revenue share leads, overfunded underperformers, underfunded outperformers
│   │   │   ├── ranking.ts          # Portfolio-domain ranking helpers — rankByRoiDesc, rankByAllocationGapDesc, rankByBudgetShareDesc, rankByBudgetDesc, rankByRevenueDesc, rankByMaxShiftDesc; each uses generic type constraints (RoiComparable, ShareComparable) and delegates to sortByValueDesc; used by classification, signals, and feature-layer sort utilities
│   │   │   ├── ranking.ts          # Explicit ranking helpers — sortByRoiDesc, rankByAllocationGapDesc (positive overfunded), rankByRevenueDesc, rankByMaxShiftDesc, sortByBudgetSharePriorityDesc; used by classification and signals to apply priority ordering to groups and derived signals
│   │   │   ├── portfolio-analysis.ts # computePortfolioAnalysis(selectedChannels, selectedChannelsIds, classificationThresholds?) → PortfolioAnalysis — 2-param entry point with optional threshold overrides; derives filteredCampaigns, kpis, scope, filteredChannels flag internally; calls classifiers + all signal helpers
│   │   │   ├── types/              # Portfolio-analysis type folder (replaces flat types.ts)
│   │   │   │   ├── analysis.ts     # Final PortfolioAnalysis shape
│   │   │   │   ├── groups.ts       # CampaignGroups + ChannelGroups classification group types
│   │   │   │   ├── signals.ts      # Signal output types — InefficientChannelSignal, InefficientCampaignSignal, BudgetScalingCandidate, TransferCandidate, ConcentrationLevel, ConcentrationFlagSignal, CorrelationSignal, ScalingCandidateSignal
│   │   │   │   ├── summary.ts      # Portfolio/campaign/channel summary types — PortfolioSummary, SummaryMetricStatus, CampaignSummary, ChannelSummary
│   │   │   │   ├── thresholds.ts   # Signal and classification threshold interfaces
│   │   │   │   ├── predicates.ts   # Reusable predicate input and checker threshold shapes (RoiComparable, ShareComparable, etc.)
│   │   │   │   └── index.ts        # Barrel — re-exports all type groups; preserves existing ./types import paths
│   │   │   ├── classification/     # Campaign/channel classification logic
│   │   │   │   ├── campaign-classification.ts  # classifyCampaigns(campaigns, portfolioRoi, thresholds?) → CampaignGroups — single-pass Top→Opportunity→Bottom→Watch cascade; accepts CampaignClassificationThresholds with defaults
│   │   │   │   ├── channel-classification.ts   # classifyChannels(channels, portfolioRoi, thresholds?) → ChannelGroups — single-pass Strong→Opportunity→Weak→Watch cascade; accepts ChannelClassificationThresholds with defaults
│   │   │   │   ├── classification-utils.ts     # getFunnelMedians + getDynamicThresholds — reads revenue/conversion threshold settings from CampaignClassificationThresholds
│   │   │   │   ├── classification-checkers.ts  # Classification-only predicates — funnel leak, positive-underperforming ROI, ROI-above-portfolio-factor
│   │   │   │   ├── constants.ts                # DEFAULT_CAMPAIGN_CLASSIFICATION_THRESHOLDS, DEFAULT_CHANNEL_CLASSIFICATION_THRESHOLDS, DEFAULT_ANALYSIS_CLASSIFICATION_THRESHOLDS
│   │   │   │   └── index.ts                    # Barrel — exports all classification exports
│   │   │   └── signals/            # Portfolio signal computation
│   │   │       ├── constants.ts        # Centralized threshold objects and signal reason strings (grouped by campaign/channel/portfolio)
│   │   │       ├── campaign-signals.ts # Campaign signal logic — toCampaignScalingSignals; accepts CampaignClassificationThresholds for dynamic revenue/conversion gates
│   │   │       ├── channel-signals.ts  # Channel signal logic — realistic channel threshold gates for min share, inefficiency gap, scaling gap; reuses root checkers
│   │   │       ├── portfolio-signals.ts # getScalingOpportunities (mixed campaign+channel top 5); accepts campaign classification + channel signal thresholds
│   │   │       ├── transfer-signals.ts  # Transfer recommendation module — target-specific transfer candidate construction with threshold-aware min/max shift
│   │   │       ├── concentration-signals.ts # Concentration module — campaign-count eligibility, top revenue share, high/moderate concentration checks
│   │   │       ├── mappers.ts          # toCampaignSummary, toChannelSummary, computeChannelStatus — converts performance data + share-efficiency into analysis summaries
│   │   │       └── index.ts            # Barrel — exports all signal submodules
│   │   ├── composables/
│   │   │   ├── useSort.ts          # useSort<T extends string>(defaultKey: T, defaultDir?: SortDir) → { sortKey, sortDir, toggleSort } — generic sort state composable; toggleSort flips dir on same key, resets to defaultDir on new key; used by CampainDuplicationsTable, CampaignTable, DataErrorsTable
│   │   │   └── index.ts            # Barrel — exports useSort
│   │   └── data/
│   │       ├── types/
│   │       │   ├── campaign.ts     # CampaignMetrics, Campaign, CampaignPerformance, PerformanceMetrics, PortfolioKPIs, PortfolioScope, ShareEfficiency — foundational entity types consumed by all analytical domains
│   │       │   ├── channel.ts      # Channel extends CampaignMetrics + PerformanceMetrics — id (lowercase-trimmed-hyphenated), name, campaigns array
│   │       │   └── index.ts        # Barrel — exports campaign + channel types
│   │       ├── samples/
│   │       │   ├── campaigns.ts    # [DEV ONLY] 21 sample campaigns across 13 real-world channels; exported as CAMPAIGNS_SAMPLE; used for template download and dev mode seeding
│   │       │   └── index.ts        # Barrel — exports CAMPAIGNS_SAMPLE
│   │       └── index.ts            # Barrel — export * from './types'; export * from './samples'; imported by shared/types for public re-export via @/shared/types
│   ├── ui/                     # UI component library — generic, reusable, no app dependencies
│   │   ├── primitives/         # Generic building blocks — atomic UI components
│   │   │   ├── Button.vue      # Generic button wrapper — props: disabled?, type? (button/submit/reset); exposes getRootEl() → HTMLButtonElement for dropdown anchoring; class pass-through for scoped modifier classes: .btn.primary, .btn.outline, .btn.text-only, .btn.ghost (neutral text-typography-soft base, hover bg-typography/10 text-typography, focus ring-typography-soft; for close/dismiss chrome buttons), .btn.info-text-only (lightweight inline info actions), .btn.destructive, .btn.info-outline (chip-aligned filter trigger style), .btn.icon-only (8×8 square, p-0), .btn.small (xs text, tight padding), .btn.paddingless (p-0); focus-visible ring on all variants; disabled: cursor-not-allowed opacity-50
│   │   │   ├── Badge.vue       # Generic badge — two-layer structure: outer `.badge` + inner `.badge-body`; variants: success/warning/danger/info/opportunity (class-based only); modifiers: dimmed, rounded-rectangle, rounded-rectangle-sm, text-only, small, bold
│   │   │   ├── badge.types.ts  # BadgeVariant type — 'success' | 'warning' | 'danger' | 'info' | 'opportunity'
│   │   │   ├── Chip.vue        # Chip button — props: active?, readonly?, count?; default slot for label text; count renders inline badge when provided; active state driven by [aria-pressed="true"]; scoped SCSS block
│   │   │   ├── Disclosure.vue  # ARIA disclosure pattern — manages isOpen internally; generates unique contentId; #trigger scoped slot exposes { open, toggle, contentId }; JS-driven height animation (0→scrollHeight via transitionend); no max-h hack
│   │   │   ├── Spinner.vue     # Reusable SVG spinner — no props; size via class, color via text-*; two-circle material-style arc animation; aria-hidden
│   │   │   ├── Tabs.vue        # Generic tab bar — Tab<T> type; tabs + activeTab props; change emit; optional icon per tab via Component; auto-selects first tab on mount; @apply styles
│   │   │   └── index.ts        # Barrel — exports Button, Badge, BadgeVariant, Chip, Disclosure, Spinner, Tabs, Tab
│   │   ├── layout/             # Reusable structural layout shells
│   │   │   ├── SectionHeaderLayout.vue # Flex layout shell — header slot (grows, centered) + action slot (shrinks) in nowrap row; default slot below; no props, no scoped styles
│   │   │   ├── SheetHeader.vue # Layout-only panel/modal header — three optional named slots: #icon + #header share a grow flex row; #action is trailing; gradient applied via :slotted(h1–h6); border-b separator; no props, no store reads
│   │   │   └── index.ts        # Barrel — exports SectionHeaderLayout, SheetHeader
│   │   ├── feedback/           # Notification and feedback UI
│   │   │   ├── Notification.vue # Inline status notification box — variant?: NotificationVariant (optional); showIcon? (default true); #title named slot; default slot for body; icon auto-selected per variant or BellIcon when undefined; aria role+live region by variant; spacing below notification headers; scoped flat styles
│   │   │   ├── notification.types.ts # NotificationVariant type — 'success' | 'error' | 'warning' | 'info'
│   │   │   └── index.ts        # Barrel — exports Notification, NotificationVariant
│   │   ├── drawer/             # Responsive drawer component
│   │   │   ├── ResponsiveDrawer.vue # Reusable drawer — props: open (v-model:open), title, side? (default 'right'), closeLabel?; emits close; Escape key handling; viewport tracking via matchMedia — renders desktop push drawer content only at lg+, mobile modal content only below lg (prevents duplicate mounting and side-effect bugs); desktop push drawer (position beside main content); modal-style overlay on smaller screens; owns SheetHeader, default close button; optional #icon slot, #header-actions slot, default content slot; Tailwind-only styles
│   │   │   └── index.ts        # Barrel — exports ResponsiveDrawer
│   │   ├── charts/             # Chart.js wrapper module — reusable chart primitives only
│   │   │   ├── register.ts     # registerCharts() function — registers all Chart.js components once; called explicitly in main.ts; includes PointElement (required for Scatter charts)
│   │   │   ├── components/     # Shared chart wrapper components
│   │   │   │   ├── BarChart.vue      # Bar chart wrapper — props: chartData, ariaLabel?, horizontal?, valueTickFormatter?, showLegend?, tooltipCallbacks?, valueScaleMin?, valueScaleMax?; applies value-axis bounds to x scale (horizontal) or y scale (vertical); uses useChartConfig + useChartTooltip; default tooltip callbacks (compact number formatting); w-full + min-h-80 chart container
│   │   │   │   ├── DonutChart.vue    # Doughnut chart wrapper — props: chartData, ariaLabel?, tooltipCallbacks?, legendLabelFilter?; applies arc.separatorColor when dataset has borderWidth; w-full + min-h-80 chart container
│   │   │   │   ├── GroupedBarChart.vue # Grouped bar chart wrapper — props: chartData, ariaLabel?, valueTickFormatter?, tooltipCallbacks?; uses useChartConfig + useChartTooltip; w-full + min-h-80 chart container
│   │   │   │   ├── BubbleChart.vue   # Bubble chart wrapper — props: chartData, ariaLabel?, axisLabels?, axisMinMax?, tickFormatters?, tickValues?, tooltipCallbacks?, plugins?, legendPosition?, usePointLegend?; w-full + min-h-80 chart container
│   │   │   │   └── index.ts          # Barrel — exports BarChart, DonutChart, GroupedBarChart, BubbleChart
│   │   │   ├── composables/    # Chart composables
│   │   │   │   ├── useChartTheme.ts  # Runtime chart theme resolution boundary — currently returns DEFAULT_CHART_THEME; prepared for future CSS variable extraction
│   │   │   │   ├── useChartConfig.ts # Chart.js configuration composition — base options, plugins, tooltips, scales
│   │   │   │   ├── useChartScales.ts # Chart scale composable — exposes baseScales + createScale(ChartScaleOptions) helper for typed axis config
│   │   │   │   ├── useChartTooltip.ts # useChartTooltip<TType>(callbacks, options?) → TooltipOptions; owns tooltip panel colors, border, corner radius, padding, marker sizing, marker shape, normalized marker fill/border behavior
│   │   │   │   └── index.ts          # Barrel — exports all composables + TooltipCallbacks type
│   │   │   ├── config/         # Chart theme config
│   │   │   │   ├── chart-theme.config.ts # DEFAULT_CHART_THEME + ChartTheme type — tooltip colors, arc separator, base options, chart palette (400/500/600 shades), scale colors/font sizes, maxTickRotation, legend label sizing; used by useChartTheme()
│   │   │   │   └── index.ts          # Barrel — exports DEFAULT_CHART_THEME, ChartTheme
│   │   │   ├── types/          # Chart wrapper type aliases (consumers use these instead of importing Chart.js types directly)
│   │   │   │   ├── chart.types.ts    # BarChartData/Options/TooltipCallbacks/TooltipItem; DonutChartData/Options/TooltipCallbacks/TooltipItem/LegendLabelFilter; BubbleChartData/Options/TooltipCallbacks/TooltipItem/Plugin; ChartTickFormatter; ChartLegendPosition
│   │   │   │   └── index.ts          # Barrel — exports all chart type aliases
│   │   │   ├── plugins/        # Reusable chart plugins
│   │   │   │   ├── createQuadrantBackgroundPlugin.ts # Generic quadrant background plugin factory — caller provides backgrounds[] + divider style; no built-in colors
│   │   │   │   └── index.ts          # Barrel — exports createQuadrantBackgroundPlugin
│   │   │   ├── utils/          # Shared chart utilities
│   │   │   │   ├── color.ts          # withHexAlpha(hex, alpha) → rgba string — generic hex-to-rgba composer
│   │   │   │   └── index.ts          # Barrel — exports withHexAlpha
│   │   │   └── index.ts        # Barrel — re-exports components/*, composables/*, config/*, types/*, plugins/*, utils/*, register
│   │   ├── icons/              # Inline SVG icon components
│   │   │   ├── AlertCircleIcon.vue
│   │   │   ├── AlertTriangleIcon.vue
│   │   │   ├── ArrowLeftIcon.vue
│   │   │   ├── ArrowRightIcon.vue
│   │   │   ├── ArrowUpIcon.vue     # Up arrow — sort direction indicator; rotate-180 class for down direction
│   │   │   ├── BellIcon.vue
│   │   │   ├── CheckCircleIcon.vue
│   │   │   ├── CheckIcon.vue
│   │   │   ├── ChevronIcon.vue
│   │   │   ├── CircleCheckIcon.vue
│   │   │   ├── ClockIcon.vue
│   │   │   ├── CloseIcon.vue
│   │   │   ├── DownloadIcon.vue
│   │   │   ├── EyeIcon.vue
│   │   │   ├── EyeOffIcon.vue
│   │   │   ├── FileTextIcon.vue
│   │   │   ├── FunnelIcon.vue      # Filter/funnel icon — filled polygon; used as channel filter trigger
│   │   │   ├── InfoIcon.vue
│   │   │   ├── LinkIcon.vue
│   │   │   ├── MagicWandIcon.vue
│   │   │   ├── PlugIcon.vue
│   │   │   ├── SlidersIcon.vue     # Sliders icon — used for Optimizer tab
│   │   │   ├── SparklesIcon.vue
│   │   │   ├── UploadIcon.vue
│   │   │   ├── XPolygonIcon.vue
│   │   │   └── index.ts
│   │   ├── toast/
│   │   │   ├── ToastNotification.vue  # Toast component — props: title (required), message? (optional), variant (NotificationVariant); close button (ghost icon-only Button); role="alert", aria-live; pointer-events-auto; z-toast
│   │   │   ├── ToastContainer.vue     # Renders toast queue; Teleport to body; z-toast
│   │   │   └── index.ts
│   │   ├── forms/
│   │   │   ├── FileDropzone.vue
│   │   │   ├── PasswordInput.vue
│   │   │   ├── RadioToggle.vue     # Pill-style radio group — v-model, options, name?, disabled?; variants: small, info, secondary; scoped SCSS
│   │   │   ├── RadioItem.vue       # Single custom radio — primary (default) or info (class="info") color variant; no variant prop; scoped flat styles
│   │   │   └── index.ts            # Barrel — exports FileDropzone, PasswordInput, RadioItem, RadioToggle
│   │   ├── meta/
│   │   │   ├── MetaItem.vue    # Inline <span> wrapper — default slot; no props
│   │   │   ├── MetaRow.vue     # <p> flex-wrap row — .bullet / .divider / .tiny / .info.bullet / .info.divider / .small variants; scoped .meta-row
│   │   │   └── index.ts
│   │   ├── modal/
│   │   │   ├── Modal.vue       # Generic modal shell — Teleport to body; z-modal (1010); aria-modal/role="dialog"; Escape to close; backdrop opacity bg-surface-backdrop/70; scoped styles
│   │   │   ├── ModalBody.vue
│   │   │   ├── ModalFooter.vue
│   │   │   └── index.ts
│   │   ├── card/
│   │   │   ├── Card.vue
│   │   │   ├── CardHeader.vue
│   │   │   └── index.ts
│   │   ├── dropdown/
│   │   │   ├── Dropdown.vue    # Generic floating dropdown shell — props: open (v-model:open), anchor (HTMLElement|null), minWidth?, maxHeight?, gap?, edgeMargin?; teleports backdrop (aria-hidden, z-49) + floating panel (z-50) to body; boundary-aware fixed positioning; locks body scroll; focus management on open/close; closes on backdrop click, Escape, window resize
│   │   │   ├── DropdownPanel.vue # Dropdown content shell — props: ariaLabel?; role="dialog"; visual container (bg-surface-raised border rounded-md shadow-lg overflow-hidden pb-2); no scroll by default
│   │   │   └── index.ts
│   │   ├── table/              # Shared table component module
│   │   │   ├── Table.vue       # Table wrapper — scrollbar-info-on-surface; striped-odd/striped-even zebra modifiers; vertical-separators opt-in modifier; table-auto on <table>
│   │   │   ├── TableHeader.vue # Sortable thead — columns: DataTableColumn[]; sticky?; sortKey?; sortDir?; emits sort; info palette for active sort; vertical-separators support; exports DataTableColumn + SortDir types
│   │   │   ├── TableGroupHeaderRow.vue # Row-only primitive — renders <tr> + projects slot content; for grouped table section headers
│   │   │   ├── TableSelectableRow.vue  # Row-only selectable primitive — props: selected?; emits select on pointer click; hover/selected row styling; radio inside the row remains the accessible control
│   │   │   └── index.ts        # Barrel — exports Table, TableHeader, TableGroupHeaderRow, TableSelectableRow, DataTableColumn, SortDir
│   │   └── index.ts            # Barrel — re-exports primitives/*, layout/*, feedback/*, drawer/*, charts/*, icons/*, toast/*, forms/*, meta/*, modal/*, card/*, dropdown/*, table/*
│   ├── features/
│   │   ├── ai-tools/               # AI Tools feature folder
│   │   │   ├── components/
│   │   │   │   └── AiToolsContent.vue # AI feature content only — shows AiConnectionForm when disconnected; shows status bar + tabs (AiAnalysis) when connected; no header/close/drawer chrome; fills drawer height; no dev mode code — dev mode orchestrated from app/dev-mode/
│   │   │   ├── ai-analysis/
│   │   │   │   ├── stores/
│   │   │   │   │   ├── aiAnalysis.store.ts # Pinia store (id: 'aiAnalysis') — accepts AiAnalysisContext via setAnalysisContext(); analysisContext drives portfolioContext, filter watcher, portfolio-switch watcher, cache partitioning, evaluationDisabled, and prompt execution; no direct campaign-performance import; clearCacheForPortfolio(portfolioId) called by dashboard orchestrator on portfolio eviction; per-tab internal state (plain object): firstAnalyzeCompleted, controller, debounceTimer, cache (Map<portfolioId, Map<cacheKey, CacheEntry>>), lastVisibleCacheKey; per-tab reactive display state (ref<TabDisplay<T>>): budgetOptimizer + executiveSummary; shared: activeTab, analysisActivated; exports PortfolioContext interface + AiAnalysisContext type; stores-internal helpers: isBelowOptimizerMinimum, showOptimizerMinimumError, showCachedResult, showTokenLimitState, revertTab, onPortfolioSwitch; module-level helpers: getOtherAnalysisType, setDisplay, createTabState, TabDisplay<T> type
│   │   │   │   │   └── index.ts    # Barrel — exports useAiAnalysisStore, AiAnalysisContext, PortfolioContext
│   │   │   │   ├── utils/
│   │   │   │   │   ├── analysis-messages.ts  # ANALYSIS_ERROR_MESSAGES (Record<AiErrorCode, {title,message}> — all 11 codes incl. 'min-campaigns'); TOKEN_LIMIT_MESSAGE
│   │   │   │   │   ├── analysis-prompt.ts  # buildAnalysisPrompt (internal); runAnalysisPrompt(providerState, analysisContext, signal) → AnalysisResponse|null; [DEV ONLY] setDevAnalysisOverride export
│   │   │   │   │   └── utils.ts    # getCacheKey(channelIds, provider) → 16-char hex string (xxhashjs h64, seed=0)
│   │   │   │   ├── types/
│   │   │   │   │   └── index.ts    # All AI analysis types — BusinessContext; response literals; Executive Summary output types; Budget Optimizer output types; response types (BudgetOptimizerResponse, ExecutiveSummaryResponse — each with model?/timestamp?); shared orchestration types (AnalysisResponse, AnalysisContext, AIProviderState)
│   │   │   │   └── components/
│   │   │   │       ├── AiAnalysis.vue          # Tab switcher — Tabs order: Summary first, Optimizer second; scrollable .panel-container; reads aiAnalysis.store activeTab only
│   │   │   │       ├── shared/
│   │   │   │       │   ├── AnalysisHeader.vue      # Shared tab header — props: title, actionLabel, isButtonDisabled, context (PortfolioContext); emits: analyze; SectionHeaderLayout + MetaRow (bullet); fully props-only
│   │   │   │       │   ├── AnalysisSection.vue     # Section layout — title prop + default slot; scoped .analysis-section
│   │   │   │       │   ├── AnalysisResponseMeta.vue  # Response footer — props: timestamp, modelDisplayName?, notice?; MetaRow .divider.tiny.info.italic; "Generated at [time] with [model]" + disclaimer + stale-result notice
│   │   │   │       │   └── AnalysisState.vue       # Analysis wrapper — props: status, error, tokenLimitReached, hasResult; #loading/#state/default slots; resolves error text via ANALYSIS_ERROR_MESSAGES
│   │   │   │       ├── budget-optimization/
│   │   │   │       │   ├── BudgetOptimizationAnalysis.vue  # Budget Optimizer tab orchestrator; reads aiAnalysis.store only; no scoped styles
│   │   │   │       │   └── BudgetRecommendations.vue       # Recommendations — props: recommendations[]; sortedRecommendations (high confidence first, then low execution risk); cq-container rec-card; scoped @apply flat styles
│   │   │   │       └── executive-summary/
│   │   │   │           ├── ExecutiveSummaryAnalysis.vue  # Executive Summary tab orchestrator; reads aiAnalysis.store only; no scoped styles
│   │   │   │           ├── HealthStatus.vue              # Portfolio Health badge — props: healthScore
│   │   │   │           ├── PriorityActions.vue           # Priority Actions — props: actions (PriorityAction[]); camelCase fields (expectedOutcome, successMetric)
│   │   │   │           ├── Insights.vue                  # Insights — props: insights (ExecutiveInsight[]); type badge (inline-action-float) + metric badge; metricHighlight (camelCase)
│   │   │   │           └── Correlations.vue              # Correlations — props: correlations (ExecutiveCorrelation[]); v-if on length
│   │   │   ├── ai-connection/
│   │   │   │   ├── stores/
│   │   │   │   │   ├── aiConnection.store.ts # useAiConnectionStore (id: 'aiConnection') — provider, apiKey (memory-only), isConnected, isConnecting, connectionError, models (AiModel[]), selectedModel; selectedModelLimitReached, allModelsLimitReached, evaluationDisabled (computed); connect(), disconnect(), markModelLimitReached(), selectNextAvailableModel(), openPanel(), closePanel(); connect() publishes AiConnectionEvent via lastConnectionEvent ref (success/error) instead of showing toasts directly — orchestrator handles toast display; [DEV ONLY] setDevConnectOverride export
│   │   │   │   │   └── index.ts    # Barrel — exports useAiConnectionStore, setDevConnectOverride
│   │   │   │   ├── components/
│   │   │   │   │   ├── AiConnectionForm.vue        # Provider selection + API key + Connect button + Disclosure
│   │   │   │   │   ├── AiConnectionInstructions.vue # Instructions card — props: instructions ({ title, steps, note? }); uses <Card class="secondary">
│   │   │   │   │   └── AiConnectedStatus.vue       # Status bar — provider label + green dot + "Connected" + Disconnect
│   │   │   │   └── utils/
│   │   │   │       └── error-handling.ts # ERROR_MESSAGES, ERROR_HINTS, getErrorCode(error) → AiErrorCode
│   │   │   ├── providers/
│   │   │   │   ├── index.ts
│   │   │   │   ├── connect-provider.ts # connectProvider(provider, apiKey) → AiModel[]; applies shared rankModels step
│   │   │   │   ├── run-provider-prompt.ts # runProviderPrompt<T>(provider, apiKey, model, prompt, signal?) → T
│   │   │   │   ├── types/              # index.ts (barrel), types.ts (AiModelCandidate, AiModel, ModelsResponse)
│   │   │   │   ├── gemini/             # index.ts, types.ts, api.ts, connect.ts
│   │   │   │   ├── qroq/               # index.ts, types.ts, api.ts, connect.ts (folder name: qroq)
│   │   │   │   └── utils/              # error-handling.ts, models-utils.ts, providers-meta.ts (PROVIDER_LABELS, PROVIDER_HELP, PROVIDER_OPTIONS, GROQ_PROVIDER_RULES, GEMINI_PROVIDER_RULES), shared.ts, index.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts            # AiProviderType, AiErrorCode (11 codes), AiConnectionError; AiAnalysisType, AiAnalysisError, AiAnalysisNoticeCode, AiAnalysisNotice
│   │   │   ├── prompts/
│   │   │   │   ├── types.ts
│   │   │   │   ├── prompt-utils.ts
│   │   │   │   ├── business-context.ts
│   │   │   │   ├── executive-summary-prompt2.ts
│   │   │   │   ├── executive-summary-prompt.ts  # Legacy — kept compilable
│   │   │   │   ├── budget-optimization-prompt2.ts
│   │   │   │   ├── budget-optimization-prompt.ts  # Legacy — kept compilable
│   │   │   │   ├── model-evaluation-prompt.ts
│   │   │   │   └── index.ts
│   │   │   └── sample-data/            # [DEV ONLY] Dev fixtures for AI analysis cycles
│   │   │       ├── budget-optimization.ts  # BUDGET_OPTIMIZATION_SAMPLES — 5 BudgetOptimizerResponse fixtures
│   │   │       ├── executive-summary.ts    # EXECUTIVE_SUMMARY_SAMPLES — 5 ExecutiveSummaryResponse fixtures
│   │   │       └── index.ts            # Barrel — exports BUDGET_OPTIMIZATION_SAMPLES, EXECUTIVE_SUMMARY_SAMPLES
│   │   ├── campaign-performance/       # Campaign performance feature — filters, KPIs, charts, table
│   │   │   ├── index.ts                # Barrel — exports CampaignPerformanceView
│   │   │   ├── CampaignPerformanceView.vue # Main campaign performance view — owns feature-level grid container, header section, scrollable body, KPI grid, charts grid, scaling chart, and campaign table layout; receives showAiButton/showConnectedDot/aiClick from DashboardPage; dumb toward store (reads via useCampaignPerformanceStore directly for its own feature state)
│   │   │   ├── stores/
│   │   │   │   ├── campaignPerformance.store.ts # Pinia store (id: 'campaignPerformance') — selection + filter layer on top of portfolioData.store; activePortfolioId, selectedChannelsIds; portfolioChannels/title/campaigns/selectedChannels/filteredCampaigns/portfolioScope/portfolioAnalysis computeds; watches pendingSelectionId + lastEvictedId; setChannelFilter(ids) action
│   │   │   │   └── index.ts        # Barrel — exports useCampaignPerformanceStore
│   │   │   ├── components/
│   │   │   │   ├── index.ts            # Barrel — exports CampaignPerformanceHeader, ChannelFilters, Kpis, CampaignTable, EmptyState
│   │   │   │   ├── CampaignPerformanceHeader.vue # Props-only header — props: title, channelCounts, campaignCounts, showAiButton, showConnectedDot; emits aiClick; multi-root (title-row + MetaRow bullet); AI button v-if !showAiButton hidden; connected dot rendered as explicit child element with success color + z-index (not a pseudo-element on an empty span) + dot-pop animation
│   │   │   │   ├── CampaignTable.vue   # Sortable campaign data table — prop: CampaignPerformance[]; sort via useSort / sortByValue(); PerformanceIndicator for Revenue (roi-colored) and CVR (dimmed); channel cell uses .badge.info.dimmed
│   │   │   │   ├── EmptyState.vue      # No-data screen — uses TransferActions for download/upload buttons; softened description text color
│   │   │   │   ├── channel-filters/    # ChannelFilters module — props-only, no store reads
│   │   │   │   │   ├── index.ts        # Barrel — exports ChannelFilters
│   │   │   │   │   ├── ChannelFilterChips.vue  # Internal chip renderer — props: variant? ('visible'|'probe'), layout? ('strip'|'plain'), channels, totalCampaigns, selectedIds?, showAll?, allActive?, allReadonly?, singleRow?; probe variant is absolutely-positioned invisible measurement layer (aria-hidden); exposes getRootEl(), getChannelChipEls(), hasOverflow(); emits clear / toggle (suppressed in probe mode); scoped SCSS with --channel-filter-max-height CSS var
│   │   │   │   │   ├── ChannelFilters.vue  # Two-state filter strip — props: channels, selectedIds; emits toggle/clear; measureRef (probe variant) drives hasOverflow; chipsRef (visible variant) drives hiddenSelectedIds via exposed getChannelChipEls() + offsetTop; State A (no overflow): All chip + all channel chips; State B (overflow): ChannelFiltersDialog trigger + single-row selected chips sorted by name; ResizeObserver on measureRef; measure split into measureOverflow() + measureHidden() (nextTick-deferred); scoped SCSS
│   │   │   │   │   └── ChannelFiltersDialog.vue  # Consolidated overflow dialog — owns dropdownOpen state, trigger Button ref, FunnelIcon trigger, hidden-count Badge (small bold info, hidden while open), Dropdown, DropdownPanel, sticky dropdown header ("Channels" label + "Select all" ghost Button when hasSelection), scrollable ChannelFilterChips (layout="plain"); props: channels, selectedIds, hiddenCount; emits toggle/clear; props-only, no store reads; scoped SCSS
│   │   │   └── kpis/                   # KPI component module
│   │   │       ├── index.ts            # Barrel — exports Kpis
│   │   │       ├── Kpis.vue            # KPI cards section (was DashboardKpis) — props: kpis (PortfolioKPIs), portfolioKpis? (PortfolioKPIs|null); local formatShare helper; Budget/Revenue/Conversions show "X% of total" when filtered; Revenue adds ROI via PerformanceIndicator; Conversions adds CVR via PerformanceIndicator; CTR/CPA use KpiBenchmarkDelta; no internal wrapper/grid — parent layout (CampaignPerformanceView) controls KPI grid placement; .kpi-grid container query breakpoints (cq-280 → 2 cols, cq-640 → 3 cols, cq-1024 → 5 cols) applied at parent
│   │   │       ├── KpiCard.vue         # Single KPI metric card — props: label, value (string|null|undefined); MetaRow (.divider) wraps #secondary slot content; uses @include cq-container + @include cq-up for container-query font size scaling; scoped flat styles
│   │   │       └── KpiBenchmarkDelta.vue # Directional delta indicator — props: current/benchmark (number|null), unit ('pp'|'pct'), lowerIsBetter?; computes rawDelta via getKpiBenchmarkRawDelta() from dashboard utils; owns tone selection, label formatting, ArrowUpIcon (rotate-180 when down); renders as MetaItem fragment inside KpiCard's MetaRow
│   │   ├── ui/                     # Campaign-performance-specific UI primitives
│   │   │   ├── PerformanceIndicator.vue # Performance color indicator — props: value (number|null); default slot (or formatPercentage(value) fallback); color class: positive/warning/negative; .dimmed modifier reduces opacity + font-normal; scoped SCSS
│   │   │   └── index.ts            # Barrel — exports PerformanceIndicator
│   │   ├── utils/
│   │   │   ├── campaign-performance-sorting.ts # Named sort helpers — sortCampaignsByRoiDesc, sortChannelsByRoiDesc, sortCampaignsByBudgetDesc, sortChannelsByEfficiencyGapImpactDesc; uses computeShareEfficiency from @/shared/portfolio-analysis for efficiency gap impact sort; uses shared sortByValueDesc()
│   │   │   └── kpi-benchmark-delta.ts  # getKpiBenchmarkRawDelta(current, benchmark, unit, lowerIsBetter?) → { rawDelta, direction }; KpiBenchmarkDeltaUnit type
│   │   └── charts/                 # Campaign-performance chart compositions
│   │       ├── index.ts            # Barrel — exports PerformanceCharts, RoiVsBudgetScaling, RoiBudgetScalingHighlights
│   │       ├── PerformanceCharts.vue # Chart section composition (was DashboardCharts) — owns card layout, RadioToggle toggle state (Performance/Efficiency), chart grid, height classes (!min-h-96, !h-29); renders RoiBarChart, BudgetShareDonutChart, RevenueVsBudgetBars/EfficiencyGapBars, ConversionFunnelChart; chart height from parent layout classes
│   │       ├── RoiVsBudgetScaling.vue # ROI vs Budget scaling card — owns card shell, title, "Based on selected channels" subtitle, median summary (MetaRow), limited-data info state (Notification when < MIN_CAMPAIGNS); passes data and highlights into RoiVsBudgetScatterChart; default chart height from !h-29
│   │       ├── components/         # Internal chart renderers — props-only, no store reads
│   │       │   ├── index.ts
│   │       │   ├── RoiBarChart.vue         # ROI bar chart — props: items (RoiBarChartItem[]), ariaLabel?; uses shared BarChart; computes roiScaleBounds — symmetric around zero when all values are negative; passes valueScaleMin/valueScaleMax; owns ROI tooltip callbacks with formatRoiAllocationTooltipLines
│   │       │   ├── BudgetShareDonutChart.vue # Budget-share donut — props: items (BudgetShareDonutItem[]), ariaLabel?; uses shared DonutChart; three-state alpha hierarchy (highlight/secondary/dim); legendLabelFilter hides dimmed slices from Chart.js legend
│   │       │   ├── RevenueVsBudgetBars.vue # Revenue vs Budget grouped bars — props: channels, ariaLabel?; uses shared GroupedBarChart; compact-currency y-axis ticks; tooltip via formatBudgetTooltip/formatRevenueTooltip
│   │       │   ├── EfficiencyGapBars.vue   # Efficiency Gap bar chart (share-efficiency %) — props: channels, ariaLabel?; uses shared BarChart; uses efficiencyGap (positive = overperforming); tooltip uses "pp" unit; isSingleChannelView + hasVisibleGap guard states with info notifications; symmetric axis bounds (min range 5); overperforming/underperforming legend; passes valueScaleMin/valueScaleMax
│   │       │   ├── ConversionFunnelChart.vue # Custom HTML/CSS conversion funnel — props: values ([{label, value, rate?}]), ariaLabel?; in-bar amount + label layout; right-aligned rates; PerformanceIndicator for rates; scoped SCSS
│   │       │   └── RoiVsBudgetScatterChart.vue # ROI vs Budget bubble renderer — props: campaigns, medians, highlights (RoiBudgetScalingHighlights), ariaLabel?; uses shared BubbleChart; quadrant backgrounds via createQuadrantBackgroundPlugin; log ROI transform; analysis-driven highlight sizing; circular legend markers
│   │       ├── composables/
│   │       │   ├── index.ts
│   │       │   ├── useRoiChartItems.ts     # useRoiChartItems(items) → RoiBarChartItem[] — normalizes campaigns/channels into shared ROI chart format with color assignment
│   │       │   └── useBudgetShareChartItems.ts # useCampaignBudgetShareDonutItems(campaigns, kpis) → BudgetShareDonutItem[] — normalizes campaign budget data with assigned colors
│   │       ├── config/
│   │       │   ├── index.ts
│   │       │   ├── campaign-performance-chart-colors.ts # CAMPAIGN_PERFORMANCE_CHART_COLORS (budget/revenue/positiveGap/negativeGap + DASHBOARD_ROI_BUDGET_SCALING_COLORS for quadrants); CAMPAIGN_PERFORMANCE_CHART_FILL_ALPHA; getDashboardChartFillColor(hex, alpha) using withHexAlpha
│   │       │   ├── campaign-performance-chart-styles.ts # CAMPAIGN_PERFORMANCE_BAR_DATASET_STYLE (borderWidth:1, borderRadius:2); CAMPAIGN_PERFORMANCE_DONUT_DATASET_STYLE; donut hierarchy config (highlight limit, dim threshold, highlight/secondary/dim alpha)
│   │       │   └── roi-budget-scaling-chart.config.ts   # ROI scaling chart config — QUADRANTS (Scale Up/Champions/Monitor/Overspend), radii, MIN_CAMPAIGNS=5, axis rounding, tick values, divider style, quadrant backgrounds
│   │       ├── types/
│   │       │   ├── index.ts
│   │       │   ├── roi-chart.types.ts          # RoiBarChartItem
│   │       │   ├── budget-share-chart.types.ts # BudgetShareDonutItem
│   │       │   └── roi-budget-scaling-chart.types.ts # RoiBudgetScalingHighlights (scaleUp/champions/monitor/overspend: string[])
│   │       └── utils/
│   │           ├── index.ts
│   │           ├── chart-tooltip-formatters.ts # formatBudgetTooltipLines, formatRevenueTooltipLines, formatBudgetTooltip, formatRevenueTooltip, formatRoiAllocationTooltipLines — reusable tooltip body line formatters
│   │           └── efficiency-gap.ts           # getChannelEfficiencyGapPercent, getEfficiencyGapColor, getEfficiencyGapSignedAmount — helpers for efficiency gap chart
│   │   └── data-transfer/          # CSV upload & data transfer feature folder
│   │       ├── index.ts            # Barrel — exports UploadDataModal, ReplaceDataModal, TransferActions
│   │       ├── types/
│   │       │   └── index.ts        # CampainDataRowIssueType + CampainDataFieldIssue + CampainDataRowError + CampainDataDuplicateGroup + CampainDataValidationErrorType + CampainDataValidationError + CampainDataParseResult + CampainDataProcessRowsResult
│   │       ├── components/
│   │       │   ├── index.ts        # Barrel — exports UploadDataModal, ReplaceDataModal, TransferActions
│   │       │   ├── UploadDataModal.vue     # Self-contained modal (was UploadModal) — view: 'form'|'row-errors'|'duplicate-rows'; open/close/parse/store; exposes only open(); sequential error handling; bidirectional navigation; handleProceedFromDuplicates merges validCampaigns + selected duplicate resolutions; uses usePortfolioDataStore from @/app/stores
│   │       │   ├── UploadDataForm.vue      # Upload form body — FileDropzone + file type/size validation; used inside UploadDataModal
│   │       │   ├── ReplaceDataModal.vue    # Confirmation modal — wraps Modal; uses ModalBody + ModalFooter; emits confirm/close
│   │       │   ├── TransferActions.vue     # Download Template + Upload CSV button pair (was FileActions) — emits upload; uses useDownloadTemplate; responsive stacking at <480px
│   │       │   └── data-validation/
│   │       │       ├── index.ts            # Barrel — exports ReviewErrorsComponent, ReviewDuplicatedCampaigns
│   │       │       ├── shared/
│   │       │       │   ├── DataErrorSummary.vue # Presentational summary block — 3 named slots: title, badge, summary; no props
│   │       │       │   ├── DuplicateSummary.vue # Duplicate-specific summary — wraps DataErrorSummary; props: count, variant, hasValidCampaigns?
│   │       │       │   └── index.ts
│   │       │       ├── review-errors/
│   │       │       │   ├── ReviewErrorsComponent.vue # Multi-root (body + ModalFooter) — uses DataErrorSummary + DuplicateSummary; scrollable DataErrorsTable; duplicateGroupCount prop adapts proceed label; scoped @apply styles
│   │       │       │   ├── DataErrorsTable.vue # Dumb error table — props: errors (CampainDataRowError[]); sort via useSort + sortByValue(); striped-even vertical-separators; scoped flat styles
│   │       │       │   └── index.ts
│   │       │       └── review-duplications/
│   │       │           ├── ReviewDuplicatedCampaigns.vue # Multi-root (body + ModalFooter) — uses DuplicateSummary (variant="resolve") + CampainDuplicationsTable; resolve-indicator shows resolvedCount/total; emits proceed([Campaign[]]); scoped @apply styles
│   │       │           ├── CampainDuplicationsTable.vue # Sortable grouped duplicate table — props: duplicateGroups, requiredSelection?; selection Map<campaignName, rowId>; sort via useSort + sortByValue(); uses TableGroupHeaderRow + TableSelectableRow; applies class="info" to RadioItem for info-colored radios; 8-column table
│   │       │           ├── DuplicationsHeader.vue # Group header content — props: campaignName, rowCount, isSelected, needsAttentionMode; emits clear; Badge states (success "Resolved" / danger "Needs Attention" / warning "Pending"); destructive small Button "Clear selection" when isSelected
│   │       │           └── index.ts
│   │       ├── composables/
│   │       │   ├── index.ts            # Barrel — exports useDownloadTemplate
│   │       │   └── useDownloadTemplate.ts  # Shared composable — downloadCsv + toast error fallback
│   │       └── utils/
│   │           ├── index.ts            # Barrel — exports all utilities (downloadCsv, parseCsv, validateRow, detectCampaignDuplication, getRowErrorMessage, getRowErrorSummaryWords, getValidationErrorMessage, validateCampaignData, isValidCsvFile)
│   │           ├── download-csv.ts
│   │           ├── error-messages.ts
│   │           ├── detect-campaign-duplication.ts
│   │           ├── parse-csv.ts
│   │           ├── validate-campaign-data.ts
│   │           └── validate-row-data.ts
│   ├── styles/
│   │   ├── index.scss              # Global style entry point — Tailwind base/components/utilities directives + @use base + themes/dark + components/index + utilities/index
│   │   ├── base/                   # Global base document styles
│   │   │   ├── _reset.scss         # Box sizing, default html/body margin reset, font smoothing — rules in Tailwind's base layer
│   │   │   ├── _app.scss           # App canvas: root font, background/text color, full-screen #app sizing — rules in Tailwind's base layer
│   │   │   ├── _typography.scss    # Global heading styles (h2, h3, h5) — rules in Tailwind's base layer
│   │   │   └── index.scss          # Barrel — @use reset, app, typography
│   │   ├── themes/
│   │   │   └── dark/
│   │   │       ├── _palette.scss   # Raw color scale variables — primary (50–1000), secondary/accent/success/warning/danger/info/neutral numeric scales; surface border scale (--surface-border-0 to --surface-border-4); applied on :root + [data-theme="dark"]
│   │   │       ├── _tokens.scss    # Semantic design tokens — @use ./palette; maps numeric palette vars to semantic roles: surface layers, borders, text, on-primary, primary/secondary/accent/success/warning/danger/info color groups, focus-ring, disabled, elevation shadows; applied on :root + [data-theme="dark"]
│   │   │       ├── _charts.scss    # Chart theme CSS variable names — future chart theming groundwork; tooltip color variable names for future CSS variable extraction
│   │   │       └── index.scss      # Barrel — @use palette, tokens, charts
│   │   ├── mixins/
│   │   │   └── container-queries.scss # SCSS mixin library — numeric $container-sizes scale (cq-220 through cq-1536); cq-container(), cq-up(), cq-down(), cq-between() mixins; globally injected via Vite additionalData
│   │   ├── components/
│   │   │   ├── index.scss
│   │   │   └── _forms.scss         # @layer components — .form, .field, .field-label, .form-control, .input-error, .field-errors, .field-error, .field-error-hint
│   │   └── utilities/
│   │       ├── index.scss
│   │       ├── _connected-dot.scss # .connected-dot::before pseudo-element (w-2 h-2 rounded-full bg-success shadow-connection)
│   │       ├── _inline-action-float.scss # .inline-action-float — float-right ml-2 mb-1; action must render before the prose it wraps
│   │       └── _scrollbar.scss     # scrollbar-colors($thumb, $track, $thumb-hover) mixin; .scrollbar-stable, .scrollbar-stable-both, .scrollbar-on-surface, .scrollbar-info-on-surface (info-palette scrollbars for table areas)
│   └── main.ts                 # Entry point — registers Pinia, Router, calls registerCharts(); imports from @/app/App.vue + @/app/router; global style: @/styles/index.scss
├── index.html                  # data-theme="dark" — dark mode active before JS runs
├── tailwind.config.js          # Tailwind v3 — darkMode: 'class'; all semantic color tokens via CSS vars; xs screen breakpoint; zIndex: { modal: "1010", toast: "1100" }; h-29: "464px" custom height utility
├── postcss.config.js
├── vite.config.ts              # @ alias → src/; SCSS additionalData globally injects @/styles/mixins/container-queries as *
└── package.json                # dependencies include xxhashjs (deterministic h64 cache key hashing)
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
- [x] KPI Cards: Total Budget, Revenue, ROI, CTR, CVR, CPA
- [x] KPI secondary info — "X% of total" when filtered, ROI/CVR always visible, directional delta indicators (↑/↓) with pp/pct delta for CTR/CPA
- [x] Bar chart: ROI by campaign
- [x] Bar chart: ROI by channel
- [x] Donut chart: Budget allocation by campaign — alpha hierarchy (highlight/secondary/dim), legend filters out dimmed slices
- [x] Revenue vs Budget by Channel chart — toggle between Performance (grouped bars) and Efficiency Gap (% axis, overperforming/underperforming legend)
- [x] ROI vs Budget Scaling scatter chart — 4 quadrants (Scale Up/Champions/Monitor/Overspend), analysis-driven highlights (top 3 per quadrant), median guide lines, filtered-set medians, MIN_CAMPAIGNS=5 guard
- [x] Conversion Funnel: Impressions → Clicks → Conversions (custom HTML/CSS, in-bar labels)
- [x] Campaign table: sortable by any column; PerformanceIndicator for Revenue (roi-colored) and CVR (dimmed)
- [x] Channel filters — dynamic from data, overflow-aware two-state strip (all chips / dialog trigger + selected chips), real-time updates across all charts and table

### AI Tools
- [x] AI button in campaign performance header (SparklesIcon + "AI" label, primary variant, v-if hidden when panel open)
- [x] Push drawer at lg+ (slides in from right, compresses dashboard; 400px wide) via ResponsiveDrawer
- [x] Fixed overlay at <lg (on top of dashboard; max 90vw/90vh; backdrop + slide-in transition) via ResponsiveDrawer
- [x] Escape key or backdrop click closes panel
- [x] Connection form — provider radio buttons (Google Gemini / Groq), API key input with show/hide toggle, Connect button with spinner
- [x] Live connection verification — Gemini: GET /v1beta/models; Groq: GET /openai/v1/models; inline error on failure
- [x] Connected status bar — provider name + green dot + "Connected" + Disconnect link
- [x] Tabbed interface — Optimizer tab (SlidersIcon) + Summary tab (FileTextIcon)
- [x] API key memory-only (not persisted to storage)
- [x] Budget Optimizer tab — full UI for BudgetOptimizerResponse: executive summary, recommendations (confidence badge, reallocation amount, expected impact, timeline, success metrics)
- [x] Executive Summary tab — camelCase ExecutiveSummaryResponse: healthScore badge (Excellent/Good/NeedsAttention/Critical), bottomLine, insights (no icon, metricHighlight), priorityActions (urgency), correlations
- [x] Configure actual AI prompts for Optimizer and Summary (real API calls via runProviderPrompt + aiAnalysis.store)
- [x] Error handling for AI connection — granular error codes with contextual hints; error state in both panels
- [x] Toast notifications with title + optional message; ghost close button; z-toast (1100) always above modals (z-modal 1010)

---

## Workflow Rules

### Language
- **English only** — all communication, code, comments, and documentation files without exception.

### Git
- **Never run git commands** — no git status, git add, git commit, git log, or any other git operation.
- The user handles all git operations. When asked for a commit message, provide the text only — no commands.

### Imports

**🚨 CRITICAL RULE — NEVER USE @/features/ FOR WITHIN-FEATURE IMPORTS 🚨**

**Feature-internal imports use relative paths ONLY.** When a file in a feature (e.g., data-transfer, campaign-performance) imports something else from the same feature, use relative paths: `./something`, `../utils/something`, `../../types`. Never use `@/features/feature-name/...` inside the feature. This keeps features self-contained, refactor-friendly, and improves code scannability.

- **Wrong**: `import { validateRow } from '@/features/data-transfer/utils/validate-row-data'` (inside data-transfer feature)
- **Right**: `import { validateRow } from '../utils/validate-row-data'` (inside data-transfer feature)
- **Right**: `import { UploadDataModal } from '@/features/data-transfer/components'` (outside data-transfer, from app code)

The `@/features/` prefix is **only for cross-feature and cross-layer imports** (app code importing from features, feature A importing from feature B).

**Feature barrel imports:** Features should create `index.ts` barrel files in util/component subfolders to expose a clean public API. Within-feature files import from the barrel (e.g., `import { validateRow } from '../utils'`), not from specific files. Barrels use relative exports (`export { ... } from './file.ts'`).

---

- **Always use the `@/` alias for cross-boundary imports** — never use relative `../` paths that escape your feature. `@` maps to `src/`. Same-directory `./foo` imports and within-feature relative imports are the only exceptions.
- Example of cross-boundary: `import { useCampaignPerformanceStore } from '@/features/campaign-performance/stores/campaignPerformance.store'` not `'../../stores/campaign.store'`.
- **Import ordering** — organize imports in this strict order: (1) Vue/framework; (2) `@/shared/*` barrels; (3) `@/ui` (single barrel); (4) `@/app` (if needed); (5) `@/features/*` **for cross-feature imports only**; (6) Relative imports (./something, ../folder/something) **for within-feature imports**. Types follow their values.
  
  Example (feature file importing from different layers):
  ```ts
  import { ref, computed } from 'vue'
  import type { Campaign } from '@/shared/data'
  import { formatCurrency } from '@/shared/utils'
  import { Button } from '@/ui'
  import { useToastStore } from '@/app/stores'
  import { UploadDataModal } from '@/features/data-transfer/components'  // cross-feature
  import type { CampainDataRowError } from '../types'                   // within-feature relative
  import { validateRow } from '../utils/validate-row-data'              // within-feature relative
  import ErrorBadge from './ErrorBadge.vue'                             // same-folder relative
  ```
- **UI always uses the barrel** — app and feature code imports all UI components from `@/ui` (the single public API), never from specific submodules like `@/ui/primitives` or `@/ui/charts`. UI is a cohesive design system.
- **UI internals use local paths** — files inside `app/src/ui` must not import through the public `@/ui` barrel; they use local sibling/folder imports.
- **Shared submodules use barrels** — import from `@/shared/utils`, `@/shared/composables`, `@/shared/portfolio-analysis`, etc. (the barrel folders), not from specific files like `@/shared/composables/useSort`. Each submodule folder has an `index.ts` barrel that re-exports its contents. This clarifies which layer a module depends on and provides a single, stable import point.
- **Vue component naming in templates** — JS/TS (script block) uses camelCase; HTML/template attributes use kebab-case.
  - Props: defined as `myProp` in script, bound as `:my-prop` in template.
  - Events: emitted as `emit('myEvent')` in script, listened to as `@my-event` in template.

### Constants and default values
- Prop defaults and magic numbers are declared as named `const` above `defineProps`, not inline with `??`. Example: `const MIN_WIDTH = 300` then `props.minWidth ?? MIN_WIDTH`.
- Use SCREAMING_SNAKE_CASE for module-level constants.

### Styling
- **No BEM** — the project does not use BEM class naming. The codebase has been fully cleaned of BEM.
- **New components use Tailwind utility classes directly in the template** — no `<style>` block, no `@apply`, no scoped class names. Only reach for SCSS when a style cannot be expressed as a Tailwind class (e.g. pseudo-elements, `@include` container-query mixins, complex selectors).
- Existing components use flat class names with `@apply` in scoped SCSS — leave them as-is unless the task is specifically to refactor their styles.
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
