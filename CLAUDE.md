# CLAUDE.md — Marketing Intelligence Dashboard

## Project Context

An MBA assignment project: a web-based interactive dashboard for analyzing marketing campaign performance. Users upload campaign data via CSV and get KPI visualizations, channel comparisons, and AI-powered budget optimization recommendations via Google Gemini.

**Status:** Campaign Performance Dashboard implemented. CSV upload flow complete with full error handling. AI Tools panel in place with full analysis flow: AI button in campaign performance header, `ResponsiveDrawer` (push drawer at lg+, fixed overlay at <lg). AI connection form (provider radio buttons + API key + connect with live verification + granular error handling) implemented for Google Gemini and Groq; connected state shows status bar + tabbed interface (Summary / Optimization). Both AI tabs wired to real Gemini/Groq API calls via `aiAnalysisStore` with full flow logic: debounced auto-calls on label change, response caching (nested Map<portfolioId, Map<cacheKey, CacheEntry>> — keyed by provider::sorted labels per portfolio), request cancellation via AbortController, 5s cooldown per cache key, per-model token/quota limit tracking (limitReached on AiModel, global tokenLimitReached only when all models exhausted), silent model fallback on token-limit (marks model, picks next highest-scored available model, retries transparently — user only sees final result), model change watcher for cache/auto-call, panel open/close persistence, tab switch = panel reopen evaluation (per-tab autoRefreshEnabled flag — enabling on one tab activates auto-calls on the other), portfolio switch resets display state + flags (cache preserved per portfolioId), disconnect clears all analysis state including cache. No timeouts on any API calls (connection or analysis). Deterministic generation config: Gemini `temperature: 0`; Groq `temperature: 0, top_p: 1, frequency_penalty: 0, presence_penalty: 0`. Gemini model ID `models/` prefix stripped for analysis calls. Response types include `model?: AiModel` and `timestamp?: number` stamped on each result at write time; panels show "Generated at [time] with [displayName]"; timestamp travels with the response so no separate cacheTimestamp field exists in reactive state. Shared `rankModels` in `connect-provider.ts` applies strengthScore≥5 filter + sort + limitReset map after each provider returns candidates; throws `'no-models'` when nothing passes the filter. Stability penalty heuristic (`stabilityPenaltyByModelId`) downgrades preview/experimental/latest/beta model IDs during ranking. Budget Optimizer: summary + recommendations (type: reallocation|reduction, fromCampaign/fromChannel, toCampaign/toChannel nullable, budgetShift, reason, expectedImpact with nullable revenue/conversion/roi, confidence, executionRisk) + expansions (targetCampaign nullable, targetChannel required, additionalBudget, reason, expectedImpact, confidence, executionRisk) + noRecommendationReason (string|null); Budget Optimizer result split into three named sections: Reallocate (BudgetRecommendations.vue, sorted by revenue change desc), Growth Opportunities (BudgetExpansions.vue), Reduce (BudgetReductions.vue, with inferImpactLabel); shared ExpectedImpactGrid.vue used by Reallocate and Expand cards; result summary wrapped in a raised card; no-recommendations state with noRecommendationReason or default fallback message; prompt accepts PortfolioAnalysis directly (curates promptInput locally); CAMPAIGN GROUP CONTEXT section added to prompt. Executive Summary: scope (fullPortfolio|selectedSubset), healthScore, bottomLine, overview, executiveInsights (camelCase, no icon), keyPriorities (title/rationale/expectedOutcome), keyRisks (risk/severity/implication), growthOutlook (label/reasoning); lead section in raised card; KeyRisks.vue (severity-sorted, colored left borders) and GrowthOutlook.vue (raised card) as dedicated components; prompt accepts PortfolioAnalysis directly (curates promptInput locally); CAMPAIGN GROUP CONTEXT + CHANNEL GROUP CONTEXT sections added. `aiAnalysisStore` (now in `ai-tools/ai-analysis/stores/`) accepts `AiAnalysisRequestContext` pushed by `dashboardOrchestrator.store` — no direct campaign-performance import; `analysisContext` drives portfolioContext, cache partitioning, filter watcher, portfolio-switch watcher, evaluationDisabled, and prompt execution. `AnalysisCache` class (ai-analysis/utils/analysis-cache/) encapsulates per-tab cache storage (nested Map<portfolioId, Map<cacheKey, CacheEntry>>); no constructor args — channelIds and provider are passed explicitly to get/set at call time; lastVisibleCacheKey tracked internally on get-hit and set-write; key generation via getCacheKey (xxhashjs h64, seed=0 → 16-char hex) is internal to the module. `runAnalysisPrompt` handles prompt building, provider dispatch, and model+timestamp stamping. `evaluationDisabled` computed (`aiConnectionStore.evaluationDisabled || filteredCampaigns.length === 0`) is a derived getter that combines the aiConnectionStore gate (panel open + provider + apiKey + selectedModel + !allModelsLimitReached) with the no-campaigns check. `tokenLimitReached` is a derived getter (`computed(() => aiConnectionStore.allModelsLimitReached)`) — not local state. `showTokenLimitState(tab)` is a store-internal helper that restores cached response or sets token-limit error display; called from `evaluateTab` (when `evaluationDisabled && tokenLimitReached`), `executeAnalysis` pre-flight (when selected model exhausted and no next model), and the filter watcher (immediately, no debounce). Store-internal `setDisplay(tab, status, response?, error?, notice?)` replaces the whole `ref.value` object (no property mutation); `getOtherAnalysisType(type)` maps each `AiAnalysisType` to its counterpart — defined in `aiAnalysis.store.config.ts`. `AiAnalysisType` ('budgetOptimizer'|'executiveSummary') used as the single key type throughout — `AiAnalysisTab` removed. Display state uses `ref<TabDisplay<T>>` with full object replacement; `TabDisplay<T>` + `DEFAULT_STATE` + `createTabDisplay` defined in `aiAnalysis.store.config.ts`; `CacheEntry` defined in `utils/analysis-cache/AnalysisCache.ts`. Budget Optimizer requires ≥ 5 filtered campaigns — `optimizerCanAnalyze` returns false below this threshold; `executeAnalysis` and `evaluateTab` set `status: 'error'` with a descriptive message rather than silently returning. `optimizerCanAnalyze` and `summaryCanAnalyze` both gate on `tokenLimitReached` to disable the Analyze button when all models are exhausted. `PortfolioScope` kept for display (passed as prop to tab components); `channels: string[]` added for all portfolio channel names. `computePortfolioAnalysis` takes `(selectedChannels: Channel[], thresholds?, classificationThresholds?)` — all internal derivations (kpis, portfolio, classifications, signals) computed inside. `kpis` removed as a separate store computed — consumers use `portfolioAnalysis.portfolio`. Upload-replace flow: `UploadDataModal` calls `portfolioStore.loadPortfolio(input)` (add or replace); `portfolioStore` (in `shared/portfolio/`) owns `Portfolio` (id/name/period: Period/industry?/channelMap/analysis: PortfolioAnalysis/uploadedAt), signals via `pendingSelectionId` + `lastEvictedId`; `campaignPerformance.store` watches `pendingSelectionId` (immediate) to auto-select + reset filter; `aiAnalysis.store` watches `analysisContext.portfolioId` to reset display/flags; `useUploadModal` (now in `app/composables/`) provides `openUploadModal` via `provide()`. `portfolioAnalysis` computed short-circuits to `portfolio.analysis` when no filter active — avoids recomputation for full-portfolio view. Filter watcher double-guarded on `autoRefreshEnabled` to prevent spurious auto-calls on portfolio switch. `Portfolio` carries `period: Period` (required) and `industry?: string` directly for display in dashboard header and analysis header (responsive visibility in modal layouts). Form layer completed: `Form`, `FormControl`, `FormFieldFeedback`, `DateField`, `PeriodFields` primitives with reusable validators for `required`, date format/range, and file validation. Upload modal uses new form primitives, validates report metadata (name, period, file), with clear error/hint feedback. Modal/drawer ARIA and focus behavior: `useModalAria()` composable, generated title ids, focus trapping, Escape close, focus restoration, body-scroll locking for modals; `ResponsiveDrawer` applies same ARIA/focus to mobile modal path only; upload and review modals lock backdrop close. `ShareEfficiency` carries both `allocationGap` (positive = overfunded, used for weak/inefficient classification) and `efficiencyGap` (positive = revenue outperforms budget share, used for charts and scaling language). Route-based page metadata: `applyPageMeta(route)` updates `document.title` and `<meta name="description">` after each navigation; app-level metadata (`lang`, `application-name`, `theme-color`) stays in `index.html`. Portfolio-analysis domain owns metric computation (`metrics.ts`), channel-map construction (`channel-map.ts`), neutral checker predicates (`checkers.ts`), ranking helpers (`ranking.ts` — ROI/budget/share/revenue ranking functions), classification logic (`classification/` folder), and signal computation (`signals/` folder); shared `utils/` retains only generic math, formatting, and sorting.

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
│   │   ├── App.vue             # Root component — renders RouterView + ToastContainer (from @/ui) as global app infrastructure
│   │   ├── router/
│   │   │   ├── index.ts        # Vue Router — single route: / → DashboardPage; imports applyPageMeta; router.afterEach() applies page metadata on navigation; route meta.page: { title, description }
│   │   │   └── page-meta.ts    # applyPageMeta(route) — updates document.title (format: "Marketing Intelligence Dashboard | Page Title") and creates/updates <meta name="description"> at runtime; reads route.meta.page; defines fallback defaults
│   │   ├── pages/
│   │   │   └── DashboardPage.vue # Page-level orchestrator — owns dashboard shell: top header (AppLogo + gradient title + Upload CTA when hasCampaigns), content area routes to UploadDataPlaceholder (no campaigns) or SplitPaneLayout (CampaignPerformanceView main + ResponsiveDrawer #aside hosting AiTools); upload modal + replace confirmation modal mounted at root; reads dashboardOrchestrator.store; projects AI button (SparklesIcon + animated connected dot) into CampaignPerformanceView #header-action slot — button visibility/dot driven by orchestrator state; wires openAiPanel/closeAiPanel through orchestrator; manages upload modal via useUploadModal(uploadModal); passes modal-full-height to the AI Assistant ResponsiveDrawer so the mobile modal uses full available overlay height
│   │   ├── composables/
│   │   │   └── useUploadModal.ts # App-level upload orchestration — manages modal open/close, replacement confirmation, hasCampaigns gate; handles upload completion via handleUploadComplete (calls portfolioStore.loadPortfolio); provides openUploadModal via inject
│   │   ├── utils/
│   │   │   ├── map-analysis-context.ts # mapAnalysisContext(campaignPerformance) → AiAnalysisContext — transforms campaign performance state into analysis context for feature isolation
│   │   │   └── index.ts               # Barrel — exports mapAnalysisContext
│   │   ├── dev-mode/               # [DEV ONLY] Centralized dev mode — remove before shipping
│   │   │   ├── config.ts           # DEV_MODE_CONFIG — switchboard object (enabled, portfolio.seedMockCampaigns, aiTools.analysisCycle/connectionCycle)
│   │   │   ├── types.ts            # DevModeConfig type
│   │   │   ├── dev-analysis-cycle.ts  # Dev AI analysis cycle (was features/ai-tools/dev/); activated when aiTools.analysisCycle=true
│   │   │   ├── dev-connection-cycle.ts # Dev AI connection cycle (was features/ai-tools/dev/); activated when aiTools.connectionCycle=true; mutually exclusive with analysisCycle
│   │   │   ├── dev-portfolio-data.ts   # activateDevPortfolio() seeds CAMPAIGNS_MOCK into portfolioStore on app start if no portfolios exist
│   │   │   └── index.ts            # Barrel — exports DEV_MODE_CONFIG, DevModeConfig, activateDevMode(config) — runs internal deactivateDevMode() then orchestrates portfolio seed + analysis/connection cycles based on config; throws if both analysisCycle and connectionCycle are enabled
│   │   └── stores/
│   │       ├── toast.store.ts  # Global toast Pinia store — Toast { id: number, title: string, message?: string, type: NotificationVariant }; addToast(title, type, message?) internal helper + 4 public helpers: showSuccessToast/showErrorToast/showWarningToast/showInfoToast; removeToast; 5s auto-dismiss
│   │       ├── dashboardOrchestrator.store.ts # Cross-feature mediator — composes useCampaignPerformanceStore + useAiConnectionStore + useAiAnalysisStore + usePortfolioStore + useToastStore; calls activateDevMode(DEV_MODE_CONFIG) at setup; hasCampaigns/showAiButton/showConnectedDot/aiPanelOpen computeds; openAiPanel()/closeAiPanel() drive aiConnection.openPanel/closePanel and aiAnalysis.onPanelOpen/onPanelClose; onAnalysisContextChange(context) pushes mapped state into aiAnalysis.setAnalysisContext (clears to null when portfolioId or businessContext missing); onPortfolioEvicted(id) calls aiAnalysis.clearCacheForPortfolio; onConnectionEventChange(event) shows success/error toasts only when AI panel is closed (uses PROVIDER_LABELS); watches mapAnalysisContext(campaignPerformance) immediate, portfolioStore.lastEvictedId, aiConnection.lastConnectionEvent
│   │       └── index.ts        # Barrel — exports useDashboardOrchestratorStore, useToastStore
│   ├── shared/                 # Shared types and data — no framework dependencies; internal imports use relative paths; app/feature code imports via @/shared/... barrels
│   │   ├── types/
│   │   │   ├── async-status.ts # AsyncStatus type — 'idle' | 'loading' | 'done' | 'error'; shared across stores and components that track async operation state
│   │   │   └── index.ts        # Barrel — exports AsyncStatus (data types are imported directly from @/shared/data, not re-exported here)
│   │   ├── utils/
│   │   │   ├── math.ts         # safeDivide + roundTo(value, decimals) + computeRoundedRatioOrNull + computedMedianOrNull + toFinite + getMedian(values: number[]) → number — shared math helpers
│   │   │   ├── sorting.ts      # compareNullsLast(a, b) → number|null; compareDirectional(a, b, dir) → number; sortWithNullsLast(a, b, dir) → number — null-safe directional sort composing the two; SortDirection type; SortableValue type; sortByValue(items, fn, dir) → sorted array; sortByValueDesc(items, fn) → sorted array — shared null-safe value sorting used across tables and chart sorts
│   │   │   ├── formatters.ts   # APP_LOCALE = 'en-IE'; APP_CURRENCY = 'EUR'; formatCurrency(val: number|null, decimals=0, fallback='N/A') → '€N' or fallback; formatNumber(value) → localized string; formatDecimal(value, decimals) → fixed-decimal locale string; formatPercentage(value: number|null, fallback='N/A', decimals=2) → 'N.NN%' (0–2 decimals, trailing zeros stripped) or fallback; formatCompactCurrency(value) → compact EUR; formatCompactNumber(value) → compact locale; formatTimestamp(timestamp: number) → time string; all use Intl.NumberFormat with APP_LOCALE
│   │   │   ├── date-format.ts  # formatIsoDate, formatIsoDateRange (using APP_LOCALE); DD/MM/YYYY format metadata (placeholder, example date); ISO normalization; date parsing and invalid-format vs invalid-date error keys
│   │   │   └── index.ts        # Barrel — exports sorting, formatting, math helpers, and date-format utilities (no portfolio-domain exports)
│   │   ├── portfolio/
│   │   │   ├── index.ts            # Barrel — exports usePortfolioStore, computePortfolioAnalysis, buildChannelMap, and all portfolio types
│   │   │   ├── portfolio.store.ts  # Pinia store (usePortfolioStore, id: 'portfolio') — Portfolio array (id/name/period/industry?/channelMap/analysis/uploadedAt); signals: pendingSelectionId (ref<string|null> — set on add/replace, watched by campaignPerformance.store), lastEvictedId (ref<string|null> — set on deletePortfolio, watched by campaignPerformance.store + orchestrator); internal buildEntry(input: PortfolioInput) constructs Portfolio (uses crypto.randomUUID + buildChannelMap + computePortfolioAnalysis); actions: addPortfolio, replacePortfolio, loadPortfolio (delegates to add or replace based on portfolios.length), deletePortfolio, getById; no selection logic in this store
│   │   │   ├── types/              # Portfolio entity types
│   │   │   │   ├── portfolio.ts    # Period { from, to }; BusinessContext { period: Period, industry? }; PortfolioDetails extends BusinessContext + name; PortfolioInput extends PortfolioDetails + campaigns; Portfolio { id, name, period, industry?, channelMap, analysis: PortfolioAnalysis, uploadedAt }; PortfolioKPIs
│   │   │   │   ├── analysis.ts     # PortfolioAnalysis shape — portfolio: PortfolioSummary, channels: ChannelSummary[], channelContext: ChannelContext, campaignGroups, channelGroups, derivedSignals: DerivedSignals; DerivedSignals interface; ChannelContext interface
│   │   │   │   ├── groups.ts       # CampaignGroups + ChannelGroups classification group types
│   │   │   │   ├── signals.ts      # Signal output types — InefficientChannelSignal, InefficientCampaignSignal, BudgetScalingCandidate, TransferCandidate, ConcentrationLevel, ConcentrationFlagSignal, CorrelationSignal, ScalingCandidateSignal
│   │   │   │   ├── summary.ts      # ShareEfficiency; PortfolioSummary extends PortfolioKPIs; SummaryMetricStatus; ChannelSummary; CampaignSummary
│   │   │   │   ├── thresholds.ts   # Signal and classification threshold interfaces — AnalysisSignalThresholds, AnalysisClassificationThresholds
│   │   │   │   ├── predicates.ts   # Reusable predicate input and checker threshold shapes (RoiComparable, ShareComparable, etc.)
│   │   │   │   └── index.ts        # Barrel — re-exports all type groups
│   │   │   └── analysis/           # Portfolio analysis logic
│   │   │       ├── index.ts            # Barrel — exports computePortfolioAnalysis, buildChannelMap, metrics, checkers, ranking helpers, classification barrel, signals barrel
│   │   │       ├── metrics.ts          # Portfolio-domain metric helpers — computeShareEfficiency (returns allocationGap + efficiencyGap), aggregateCampaignMetrics, aggregateCampaignOutcomes, computePortfolioKPIs
│   │   │       ├── channel-map.ts      # Channel grouping/map construction — buildChannelMap(campaigns) → Map<string, Channel>; local ChannelAccumulator type
│   │   │       ├── checkers.ts         # Neutral ROI/share predicate functions shared by both signals and classification — ROI comparisons, minimum share gates, budget/revenue share leads, overfunded underperformers, underfunded outperformers
│   │   │       ├── ranking.ts          # Portfolio-domain ranking helpers — rankByRoiDesc, rankByAllocationGapDesc, rankByBudgetShareDesc, rankByBudgetDesc, rankByRevenueDesc, rankByMaxShiftDesc; each uses generic type constraints (RoiComparable, ShareComparable) and delegates to sortByValueDesc
│   │   │       ├── portfolio-analysis.ts # computePortfolioAnalysis(selectedChannels: Channel[], thresholds?, classificationThresholds?) → PortfolioAnalysis — derives campaignSummaries, channelSummaries, kpis, channelContext, classification groups, and derived signals internally
│   │   │       ├── classification/     # Campaign/channel classification logic
│   │   │       │   ├── campaign-classification.ts  # classifyCampaigns(campaigns, portfolioRoi, thresholds?) → CampaignGroups — single-pass Top→Opportunity→Bottom→Watch cascade
│   │   │       │   ├── channel-classification.ts   # classifyChannels(channels, portfolioRoi, thresholds?) → ChannelGroups — single-pass Strong→Opportunity→Weak→Watch cascade
│   │   │       │   ├── classification-utils.ts     # getFunnelMedians + getDynamicThresholds — reads revenue/conversion threshold settings from CampaignClassificationThresholds
│   │   │       │   ├── classification-checkers.ts  # Classification-only predicates — funnel leak, positive-underperforming ROI, ROI-above-portfolio-factor
│   │   │       │   ├── constants.ts                # DEFAULT_CAMPAIGN_CLASSIFICATION_THRESHOLDS, DEFAULT_CHANNEL_CLASSIFICATION_THRESHOLDS, DEFAULT_ANALYSIS_CLASSIFICATION_THRESHOLDS
│   │   │       │   └── index.ts                    # Barrel — exports all classification exports
│   │   │       └── signals/            # Portfolio signal computation
│   │   │           ├── constants.ts        # Centralized threshold objects and signal reason strings; DEFAULT_ANALYSIS_SIGNAL_THRESHOLDS
│   │   │           ├── campaign-signals.ts # Campaign signal logic — toCampaignScalingSignals; accepts CampaignClassificationThresholds for dynamic revenue/conversion gates
│   │   │           ├── channel-signals.ts  # Channel signal logic — realistic channel threshold gates for min share, inefficiency gap, scaling gap; reuses root checkers
│   │   │           ├── portfolio-signals.ts # getScalingOpportunities (mixed campaign+channel top 5)
│   │   │           ├── transfer-signals.ts  # Transfer recommendation module — target-specific transfer candidate construction with threshold-aware min/max shift
│   │   │           ├── concentration-signals.ts # Concentration module — campaign-count eligibility, top revenue share, high/moderate concentration checks
│   │   │           ├── mappers.ts          # toCampaignSummary, toChannelSummary, computeChannelStatus — converts performance data + share-efficiency into analysis summaries
│   │   │           └── index.ts            # Barrel — exports all signal submodules
│   │   ├── composables/
│   │   │   ├── useSort.ts          # useSort<T extends string>(defaultKey: T, defaultDir?: SortDir) → { sortKey, sortDir, toggleSort } — generic sort state composable; toggleSort flips dir on same key, resets to defaultDir on new key; used by CampaignDuplicationsTable, CampaignTable, DataErrorsTable
│   │   │   ├── useCooldown.ts      # useCooldown(ms) → { tick, schedule, clearAll } — cooldown timer composable for debouncing repeated calls; tick is reactive ref for watchers; used by aiAnalysis.store for per-model cooldown enforcement
│   │   │   └── index.ts            # Barrel — exports useSort, useCooldown
│   │   └── data/
│   │       ├── types/
│   │       │   ├── campaign.ts     # CampaignRawMetrics, Campaign, CampaignPerformance, PerformanceMetrics — foundational entity types consumed by all analytical domains
│   │       │   ├── channel.ts      # Channel extends CampaignRawMetrics + PerformanceMetrics — id (lowercase-trimmed-hyphenated), name, campaigns array
│   │       │   └── index.ts        # Barrel — exports campaign + channel types
│   │       ├── samples/
│   │       │   ├── campaigns.ts    # CAMPAIGNS_SAMPLE — 20 campaigns across 10 channels from valid-10-channels.csv; used for template download. CAMPAIGNS_MOCK — [DEV ONLY] 21 campaigns across 13 channels; used only for dev mode seeding
│   │       │   └── index.ts        # Barrel — exports CAMPAIGNS_SAMPLE, CAMPAIGNS_MOCK
│   │       └── index.ts            # Barrel — export * from './types'; export * from './samples'; imported by shared/types for public re-export via @/shared/types
│   ├── ui/                     # UI component library — generic, reusable, no app dependencies
│   │   ├── primitives/         # Generic building blocks — atomic UI components
│   │   │   ├── Button.vue      # Generic button wrapper — props: variant? ('primary'|'outline'|'accent-outline'|'text-only'|'info-text-only'|'ghost'|'ghost-outline'|'info-outline'|'destructive'; default 'primary'), size? ('default'|'small'|'smaller'), iconOnly?, noRing?; native attributes pass through via v-bind="$attrs" (disabled, type, aria-label, etc.); exposes getRootEl() → HTMLButtonElement for dropdown anchoring; auto-derives title from aria-label when iconOnly; focus-visible ring per variant unless noRing; disabled: cursor-not-allowed opacity-50
│   │   │   ├── button.types.ts # ButtonVariant + ButtonSize types
│   │   │   ├── Badge.vue       # Generic badge — two-layer structure: outer `.badge` + inner `.badge-body`; props: variant? (success/warning/danger/info/opportunity/primary; default primary), tone? (solid/dimmed/text-only; default solid), shape? (pill/rounded/soft-rounded; default pill), size? (default/small)
│   │   │   ├── badge.types.ts  # BadgeVariant | BadgeTone | BadgeShape | BadgeSize types
│   │   │   ├── Chip.vue        # Chip button — props: active?, readonly?; default slot for label text; active state driven by [aria-pressed="true"]; readonly stays focusable for keyboard scan; scoped SCSS block
│   │   │   ├── Disclosure.vue  # ARIA disclosure pattern — manages isOpen internally; generates unique contentId; #trigger scoped slot exposes { open, toggle, contentId }; JS-driven height animation (0→scrollHeight via transitionend); no max-h hack
│   │   │   ├── Spinner.vue     # Reusable SVG spinner — props: size? (SpinnerSize), tone? (SpinnerTone); two-circle material-style arc animation; aria-hidden
│   │   │   ├── spinner.types.ts # SpinnerSize + SpinnerTone types
│   │   │   ├── Tabs.vue        # Generic tab bar — Tab<T> type; tabs + activeTab props; change emit; optional icon per tab via Component; auto-selects first tab on mount; @apply styles
│   │   │   └── index.ts        # Barrel — exports Button, ButtonVariant, ButtonSize, Badge, BadgeVariant, BadgeTone, BadgeShape, BadgeSize, Chip, Disclosure, Spinner, SpinnerSize, SpinnerTone, Tabs, Tab
│   │   ├── layout/             # Reusable structural layout shells
│   │   │   ├── Section.vue # Flex layout shell — header slot (grows, centered) + action slot (shrinks) in nowrap row; default slot below; no props, no scoped styles
│   │   │   ├── SplitPaneLayout.vue # Flex-row split layout — default slot (main pane, container-query boundary 'main', x/y overflow hidden) + #aside slot (sibling pane outside container query); used by DashboardPage to host CampaignPerformanceView main + ResponsiveDrawer aside
│   │   │   └── index.ts        # Barrel — exports Section, SplitPaneLayout
│   │   ├── feedback/           # Notification and feedback UI
│   │   │   ├── Notification.vue # Inline status notification box — props: variant? (NotificationVariant), surface? (NotificationSurface; default 'default'), showIcon? (default true); #title named slot; default slot for body; icon auto-selected per variant or BellIcon when undefined; aria role+live region by variant; scoped flat styles
│   │   │   ├── notification.types.ts # NotificationVariant ('success'|'error'|'warning'|'info') + NotificationSurface ('default'|'dense')
│   │   │   └── index.ts        # Barrel — exports Notification, NotificationVariant, NotificationSurface
│   │   ├── accessibility/      # Shared UI accessibility composables — internal to ui/, not exported via @/ui barrel
│   │   │   ├── useFocusTrap.ts  # useFocusTrap(containerRef) → { getFocusableElements, focusFirst, scheduleFocusFirst, trapTab, saveFocus, restoreFocus, lockScroll, unlockScroll }; exports FOCUSABLE_SELECTOR constant; focusFirst targets [data-modal-body] then first focusable element then container; trapTab cycles focus within container on Tab/Shift+Tab
│   │   │   ├── useModalAria.ts  # useModalAria() → { titleId, dialogAria } — generates stable UUID title id + computed dialog/aria-modal/aria-labelledby attrs; was in modal/composables/
│   │   │   └── index.ts        # Barrel — exports FOCUSABLE_SELECTOR, useFocusTrap, useModalAria
│   │   ├── drawer/             # Responsive drawer component
│   │   │   ├── ResponsiveDrawer.vue # Reusable drawer — props: open (v-model:open), title, side? (default 'right'), closeLabel?, modalFullHeight? (default false — when true applies calc(100dvh - 3rem) to the mobile modal container); emits close; uses useFocusTrap + useModalAria from ../accessibility; viewport tracking via matchMedia — renders desktop push drawer only at lg+, mobile modal only below lg; desktop push drawer (position beside main content); modal-style overlay on smaller screens; focus trap + scroll lock + Escape via useFocusTrap, applied only to mobile modal path via modalOpen computed; uses ModalHeader for both headers; optional #icon slot, #header-actions slot, default content slot; Tailwind-only styles
│   │   │   └── index.ts        # Barrel — exports ResponsiveDrawer
│   │   ├── charts/             # Chart.js wrapper module — reusable chart primitives only
│   │   │   ├── register.ts     # registerCharts() function — registers all Chart.js components once; called explicitly in main.ts; includes PointElement (required for Scatter charts)
│   │   │   ├── components/     # Shared chart wrapper components
│   │   │   │   ├── BarChart.vue      # Bar chart wrapper — props: chartData, yLabel?, horizontal?, tooltipCallbacks?, valueTickFormatter?, valueScaleMin?, valueScaleMax?, showLegend?; ariaLabel passed to <canvas> via $attrs; applies value-axis bounds to x scale (horizontal) or y scale (vertical); uses useChartConfig + useChartTooltip; default tooltip callbacks (compact number formatting); w-full h-full min-h-64 chart container
│   │   │   │   ├── ChartLegend.vue   # Custom chart legend — props: items (ChartLegendItem[]); renders flex-wrap list of color swatch + label pairs; swatch dimensions from useChartTheme() so it stays in sync with theme switches; supports optional borderColor per item; purely presentational — callers pass pre-resolved color strings
│   │   │   │   ├── DonutChart.vue    # Doughnut chart wrapper — props: chartData, ariaLabel?, tooltipCallbacks?, legendLabelFilter?; applies arc.separatorColor when dataset has borderWidth; w-full + min-h-80 chart container
│   │   │   │   ├── GroupedBarChart.vue # Grouped bar chart wrapper — props: chartData, yLabel?, tooltipCallbacks?, valueTickFormatter?, showLegend? (default true); ariaLabel passed to <canvas> via $attrs; uses useChartConfig + useChartTooltip; w-full + min-h-80 chart container
│   │   │   │   ├── BubbleChart.vue   # Bubble chart wrapper — props: chartData, xLabel?, yLabel?, xMin?, xMax?, yMin?, yMax?, xTickFormatter?, yTickFormatter?, xTickValues?, yTickValues?, tooltipCallbacks?, plugins?, legendPosition?, usePointLegend?, showLegend? (default true); ariaLabel passed to <canvas> via $attrs; w-full + min-h-80 chart container
│   │   │   │   └── index.ts          # Barrel — exports BarChart, ChartLegend, DonutChart, GroupedBarChart, BubbleChart
│   │   │   ├── composables/    # Chart composables
│   │   │   │   ├── useChartTheme.ts  # Runtime theme mapper — returns ComputedRef<ChartTheme> mapped from resolveChartsThemeTokens(); re-evaluates on theme switch via useTheme(); falls back to DEFAULT_CHART_THEME when CSS vars unavailable
│   │   │   │   ├── useChartConfig.ts # Chart.js configuration composition — base options, plugins, tooltips, scales
│   │   │   │   ├── useChartScales.ts # Chart scale composable — exposes baseScales + createScale(ChartScaleOptions) helper for typed axis config
│   │   │   │   ├── useChartTooltip.ts # useChartTooltip<TType>(callbacks, options?) → TooltipOptions; owns tooltip panel colors, border, corner radius, padding, marker sizing, marker shape, normalized marker fill/border behavior
│   │   │   │   └── index.ts          # Barrel — exports all composables + TooltipCallbacks type
│   │   │   ├── config/         # Chart theme config
│   │   │   │   ├── chart-theme.config.ts # DEFAULT_CHART_THEME + ChartTheme type — tooltip colors, arc separator, base options, chart palette (400/500/600 shades), scale colors/font sizes, maxTickRotation, legend label sizing; used by useChartTheme()
│   │   │   │   └── index.ts          # Barrel — exports DEFAULT_CHART_THEME, ChartTheme
│   │   │   ├── types/          # Chart wrapper type aliases (consumers use these instead of importing Chart.js types directly)
│   │   │   │   ├── chart.types.ts    # BarChartData/Options/TooltipCallbacks/TooltipItem; DonutChartData/Options/TooltipCallbacks/TooltipItem/LegendLabelFilter; BubbleChartData/Options/TooltipCallbacks/TooltipItem/Plugin; ChartTickFormatter; ChartLegendPosition; ChartLegendItem ({ id, name, color, borderColor? })
│   │   │   │   └── index.ts          # Barrel — exports all chart type aliases
│   │   │   ├── plugins/        # Reusable chart plugins
│   │   │   │   ├── createQuadrantBackgroundPlugin.ts # Generic quadrant background plugin factory — caller provides backgrounds[] + divider style; no built-in colors
│   │   │   │   ├── createQuadrantBackgroundPlugin.types.ts # CreateQuadrantBackgroundPluginOptions, QuadrantBackground, QuadrantBackgrounds (4-tuple), QuadrantDividerStyle types
│   │   │   │   └── index.ts          # Barrel — exports createQuadrantBackgroundPlugin and all plugin types
│   │   │   ├── utils/          # Shared chart utilities
│   │   │   │   ├── color.ts          # withAlpha(color, opacity) → rgba string — accepts rgb() or 6-digit hex; applies numeric opacity (0–1)
│   │   │   │   └── index.ts          # Barrel — exports withAlpha
│   │   │   └── index.ts        # Barrel — re-exports components/*, composables/*, config/*, types/*, plugins/*, utils/*, register
│   │   ├── icons/              # Inline SVG icon components
│   │   │   ├── AlertCircleIcon.vue
│   │   │   ├── AlertTriangleIcon.vue
│   │   │   ├── AppLogo.vue          # Application logo — 66x48 SVG composed of bars + arc segments with gradient/colored fills; used in DashboardPage header
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
│   │   │   ├── Form.vue            # Native form wrapper — props: spacing? (FormSpacing 'sm'|'md'|'lg'; default 'md'); container-query boundary for form layouts
│   │   │   ├── FormControl.vue     # Reusable label/control/feedback wrapper — props: id, label, as? (FormControlElement; default 'div' — 'fieldset' for grouped controls), required?, invalid?, hintText?, errorText?, errorHintText?; automatic hintId/errorId/errorHintId aria wiring; scoped .form-control styling
│   │   │   ├── FormFieldFeedback.vue # Hint/error feedback component — shows hint OR error (not both); smooth transitions; works with FormControl
│   │   │   ├── DateField.vue       # Typed date input — validates on blur, emits validation results, accepts placeholder; DD/MM/YYYY format
│   │   │   ├── PeriodFields.vue    # Start/End date fieldset — per-field validation + cross-field date range validation; fieldset-level feedback
│   │   │   ├── FileDropzone.vue    # File upload primitive — props: modelValue (File|null, required), accept (required), id?, hint?, required?, maxSizeBytes?, invalid?, describedBy?, disabled?, fileInputLabel?; emits update:modelValue, validate (FileFieldValidation); shows rejected file names for invalid type/size
│   │   │   ├── PasswordInput.vue   # Password input with show/hide toggle — props: modelValue (required), id?, placeholder?, disabled?, autocomplete? (default 'off'), invalid?, describedBy?; emits update:modelValue, blur; focus handling for toggle button
│   │   │   ├── RadioToggle.vue     # Pill-style radio group — props: modelValue, options, name?, disabled?, variant? (FormControlVariant 'primary'|'secondary'; default 'primary'), size? (RadioToggleSize 'default'|'small'|'tiny'; default 'default'); emits update:modelValue; scoped SCSS
│   │   │   ├── RadioItem.vue       # Single custom radio — props: name, value (string|number), checked, ariaLabel?, error?, disabled?, variant? (RadioItemVariant 'primary'|'info'; default 'primary'); emits change; scoped flat styles
│   │   │   ├── form.types.ts       # FormSpacing, FormControlVariant, RadioItemVariant, RadioToggleSize, DateFieldErrorKey, DateFieldValidation, FileFieldErrorKey, FileFieldValidation
│   │   │   ├── validation/         # Reusable form validators (no component logic, pure validation)
│   │   │   │   ├── required.validation.ts    # Required field validation
│   │   │   │   ├── date-field.validation.ts # Date-field validation (invalid-format, invalid-date)
│   │   │   │   └── file.validation.ts       # File validation (required, accepted type, max-size)
│   │   │   └── index.ts            # Barrel — exports Form, FormControl, FormFieldFeedback, DateField, PeriodFields, FileDropzone, PasswordInput, RadioItem, RadioToggle, form validators, and types (FormSpacing, FormControlVariant, RadioItemVariant, RadioToggleSize, DateFieldErrorKey, DateFieldValidation, FileFieldErrorKey, FileFieldValidation)
│   │   ├── meta/
│   │   │   ├── MetaItem.vue    # Inline <span> wrapper — default slot; no props
│   │   │   ├── MetaRow.vue     # <p> flex-wrap row — props: separator? (MetaRowSeparator), size? (MetaRowSize), tone? (MetaRowTone); scoped .meta-row variants
│   │   │   ├── meta.types.ts   # MetaRowSeparator, MetaRowSize, MetaRowTone types
│   │   │   └── index.ts        # Barrel — exports MetaItem, MetaRow, MetaRowSeparator, MetaRowSize, MetaRowTone
│   │   ├── modal/
│   │   │   ├── Modal.vue       # Generic modal shell — Teleport to body; uses useFocusTrap + useModalAria from ../accessibility; initialFocus prop ('content'|'first-control'|'footer-actions'|'close') drives getInitialFocusTarget() + getFirstFocusableIn() which use FOCUSABLE_SELECTOR from composable; Escape to close; backdrop click guards closeOnBackdrop prop; scroll lock + focus save/restore via useFocusTrap on mount/unmount; scoped styles
│   │   │   ├── ModalHeader.vue # Reusable header for modals and drawers — props: title, closeLabel?; slots: #icon (optional), #header-actions (optional); emits close; flex layout with icon support; used by Modal and ResponsiveDrawer
│   │   │   ├── ModalBody.vue
│   │   │   ├── ModalFooter.vue
│   │   │   ├── modal.types.ts  # ModalSize ('default'|'small'|'medium'|'large'), ModalInitialFocus ('content'|'first-control'|'footer-actions'|'close')
│   │   │   └── index.ts        # Barrel — exports Modal, ModalHeader, ModalBody, ModalFooter, ModalInitialFocus, ModalSize
│   │   ├── card/
│   │   │   ├── Card.vue        # Card wrapper — variants: default, secondary (quieter nested cards), raised (elevated surface + border + shadow + heading treatment); class pass-through for modifier classes
│   │   │   ├── CardHeader.vue
│   │   │   ├── card.types.ts   # CardVariant type — 'primary' | 'secondary' | 'raised'
│   │   │   └── index.ts        # Barrel — exports Card, CardHeader, CardVariant
│   │   ├── dropdown/
│   │   │   ├── Dropdown.vue    # Generic floating dropdown shell — props: open (v-model:open), anchor (HTMLElement|null|undefined), minWidth?, maxHeight?, gap?, edgeMargin?, align? ('left'|'right'); teleports backdrop (aria-hidden, z-49) + floating panel (z-50 tabindex="-1", flex row — flex-row for left, flex-row-reverse for right) to body; uses useFocusTrap from ../accessibility for focusFirst (on open), trapTab (Tab/Shift+Tab cycle), lockScroll/unlockScroll; position and max-height snapshotted into dropdownStyle ref at open time — opens below anchor if space allows, above if not, capping max-height to available viewport room; focus returns to anchor on close; closes on backdrop click, Escape, window resize
│   │   │   ├── DropdownPanel.vue # Dropdown content shell — role="dialog" aria-modal="true" hardcoded; visual container (bg-surface-active border rounded-md shadow-lg overflow-hidden); no scroll by default
│   │   │   └── index.ts
│   │   ├── table/              # Shared table component module
│   │   │   ├── Table.vue       # Table wrapper — props: cellPadding? (TableCellPadding), striped? (TableStriped); scrollbar-info-on-surface; vertical-separators opt-in modifier; table-auto on <table>
│   │   │   ├── TableHeader.vue # Sortable thead — columns: DataTableColumn[]; position? (TableHeaderPosition); sortKey?; sortDir?; visuallyHiddenLabel?; verticalSeparators?; emits sort; info palette for active sort; exports DataTableColumn (title?, ariaLabel?, visuallyHiddenLabel?, class? fields) + SortDir types
│   │   │   ├── TableGroupHeaderRow.vue # Row-only primitive — renders <tr> + projects slot content; for grouped table section headers
│   │   │   ├── TableSelectableRow.vue  # Row-only selectable primitive — props: selected?; emits select on pointer click; hover/selected row styling; radio inside the row remains the accessible control
│   │   │   ├── table.types.ts  # TableCellPadding, TableHeaderPosition, TableStriped types
│   │   │   └── index.ts        # Barrel — exports Table, TableHeader, TableGroupHeaderRow, TableSelectableRow, DataTableColumn, SortDir, TableCellPadding, TableHeaderPosition, TableStriped
│   │   ├── theme/              # Design system theme layer — CSS var resolver + reactive theme composable; exported via @/ui barrel
│   │   │   ├── composables/
│   │   │   │   ├── useTheme.ts     # useTheme() → { currentTheme } — MutationObserver on data-theme attribute; currentTheme is a reactive ref<AppTheme>; composables read currentTheme.value inside computed() to trigger re-evaluation on theme switch; imports AppTheme from ../types
│   │   │   │   └── index.ts        # Barrel — exports useTheme
│   │   │   ├── utils/
│   │   │   │   ├── chart-theme-tokens.ts # Pure resolvers — resolveChartsThemeTokens() reads all --chart-* CSS custom properties via getComputedStyle and returns flat ChartThemeTokens; resolvePaletteColors() returns 51-color string[] in 500→600→400 order; toChartColorPalette() helper for palette mapping; imports ChartThemeTokens from ../types
│   │   │   │   └── index.ts        # Barrel — exports resolveChartsThemeTokens, resolvePaletteColors, toChartColorPalette
│   │   │   ├── types/
│   │   │   │   ├── theme.types.ts  # AppTheme ('dark'|'light') + ChartThemeTokens interface with JSDoc on every field grouping tooltip/axes/arc/text/legend/performance/quadrant/palette sections
│   │   │   │   └── index.ts        # Barrel — exports AppTheme, ChartThemeTokens
│   │   │   └── index.ts        # Barrel — re-exports from composables/, utils/, types/
│   │   └── index.ts            # Barrel — re-exports primitives/*, layout/*, feedback/*, drawer/*, charts/*, icons/*, toast/*, forms/*, meta/*, modal/*, card/*, dropdown/*, table/*, theme/* (accessibility/ is internal — not re-exported)
│   ├── features/
│   │   ├── ai-tools/               # AI Tools feature folder
│   │   │   ├── components/
│   │   │   │   └── AiTools.vue # AI feature content only — shows AiConnectionForm (passes :reset-key) when disconnected; shows status bar (AiConnectedStatus) + AiAnalysis when connected; watches aiConnectionStore.aiPanelOpen to bump connectionFormResetKey on panel close; no header/close/drawer chrome; fills drawer height; no dev mode code — dev mode orchestrated from app/dev-mode/
│   │   │   ├── ai-analysis/
│   │   │   │   ├── stores/
│   │   │   │   │   ├── aiAnalysis.store.config.ts # Store-private constants + types — DEBOUNCE_MS, COOLDOWN_MS, MIN_OPTIMIZER_CAMPAIGNS, OPTIMIZER_MIN_CAMPAIGNS_ERROR; TabDisplay<T> type, DEFAULT_STATE, createTabDisplay<T>(), ALL_TABS, DEFAULT_PORTFOLIO_CONTEXT, getOtherAnalysisType(); imported only by aiAnalysis.store.ts
│   │   │   │   │   ├── aiAnalysis.store.ts # Pinia store (id: 'aiAnalysis') — accepts AiAnalysisRequestContext via setAnalysisContext(); analysisContext drives portfolioContext, filter watcher, portfolio-switch watcher, evaluationDisabled, and prompt execution; no direct campaign-performance import; per-tab TabState instance (controller/debounceTimer/cache); per-tab reactive display state (ref<TabDisplay<T>>): budgetOptimizer + executiveSummary; shared state: activeTab, autoRefreshEnabled (ref<Record<AiAnalysisType, boolean>>), analysisContext (ref); computed: portfolioContext, tokenLimitReached, evaluationDisabled, budgetOptimizerActivated, executiveSummaryActivated, optimizerCanAnalyze, summaryCanAnalyze; setDisplay/setIdle/setLoading/setDone/setError replace the whole display ref; performAnalysisRequest() runs API call, caches result, stamps timestamp/model; executeAnalysis() orchestrates pre-flight checks; cancellation cancels both tabs' requests; watchers: selectedChannelIds (deep, debounced), aiStore.selectedModel, analysisContext.portfolioId; public actions: analyze, setAnalysisContext, setActiveTab, onPanelOpen, onPanelClose, clearStateForDisconnect, clearCacheForPortfolio
│   │   │   │   │   └── index.ts    # Barrel — exports useAiAnalysisStore
│   │   │   │   ├── utils/
│   │   │   │   │   ├── tab-state.ts        # TabState class — per-tab request state (controller, debounceTimer, private AnalysisCache); methods: cancelRequest(), reset(), getCached/setCached/getLastVisible/clearCache/deletePortfolioCache(portfolioId); used by aiAnalysis.store
│   │   │   │   │   ├── analysis-messages.ts  # ANALYSIS_ERROR_MESSAGES (Record<AiErrorCode, {title,message}> — all 11 codes incl. 'min-campaigns'); TOKEN_LIMIT_MESSAGE
│   │   │   │   │   ├── analysis-prompt.ts  # buildAnalysisPrompt (internal); runAnalysisPrompt(providerState, analysisPromptContext, signal) → AnalysisResponse|null; stamps model+timestamp on result; [DEV ONLY] setAnalysisPromptRunnerOverride export
│   │   │   │   │   ├── analysis-cache/     # Cache module — AnalysisCache class + CacheEntry type + key generation
│   │   │   │   │   │   ├── cache-key.ts    # getCacheKey(channelIds, provider) → 16-char hex string (xxhashjs h64, seed=0); internal to analysis-cache
│   │   │   │   │   │   ├── AnalysisCache.ts # AnalysisCache class — no constructor args; get(portfolioId, channelIds, provider) auto-tracks lastVisibleCacheKey on hit; getLastVisible(portfolioId); set(portfolioId, channelIds, provider, entry) auto-tracks lastVisibleCacheKey on write; deletePortfolio/clear; CacheEntry { response, timestamp, cooldownUntil }
│   │   │   │   │   │   └── index.ts        # Barrel — exports AnalysisCache, CacheEntry
│   │   │   │   │   └── index.ts        # Barrel — exports analysis-cache, analysis-messages, analysis-prompt, tab-state
│   │   │   │   ├── types/
│   │   │   │   │   ├── output.types.ts  # AI response output types — ConfidenceLevel, ExecutionRisk, HealthLabel, InsightType, RiskSeverity, GrowthOutlookLabel, PortfolioScope; Executive Summary shapes (ExecutiveInsight, KeyPriority, KeyRisk, GrowthOutlook, HealthScore, ExecutiveSummaryOutput); Budget Optimizer shapes (ExpectedImpact, BudgetRecommendation, BudgetExpansion, BudgetOptimizerOutput); response envelope types (BudgetOptimizerResponse, ExecutiveSummaryResponse, AnalysisResponse)
│   │   │   │   │   ├── context.types.ts # Analysis input/context types — AiAnalysisContext (slim prompt input: { analysis, businessContext, portfolioBenchmark? }), AnalysisPromptContext ({ type, context }), AnalysisProviderState ({ provider, apiKey, selectedModel }), AnalysisPortfolioContext ({ portfolioTitle, channelCount, campaignCount, filtersActive, businessContext|null }), AiAnalysisRequestContext (extends AnalysisPortfolioContext + portfolioId/selectedChannelIds/portfolioAnalysis/portfolioBenchmark?/businessContext)
│   │   │   │   │   └── index.ts    # Barrel — re-exports AiAnalysisError/AiAnalysisNotice/AiAnalysisNoticeCode from ai-tools/types + all output.types and context.types
│   │   │   │   ├── AiAnalysis.vue          # Tab switcher — Tabs order: 'Summary' (FileTextIcon) first, 'Optimization' (SlidersIcon) second; scrollable .ai-analysis-container; reads aiAnalysis.store; @change calls setActiveTab; imports tab orchestrators from sibling budget-optimization/ and executive-summary/ folders
│   │   │   │   ├── index.ts                # Barrel — exports AiAnalysis
│   │   │   │   ├── components/             # Shared display primitives — no store reads, props-only
│   │   │   │   │   ├── AnalysisHeader.vue      # Tab header — props: title, actionLabel, isButtonDisabled, context (AnalysisPortfolioContext); emits: analyze; renders portfolio, channel, campaign metadata + portfolio period/industry (hidden at sticky-header breakpoint via sticky-header:hidden); analyze button is icon-only (MagicWandIcon) with actionLabel as aria-label; Section + MetaRow (bullet)
│   │   │   │   │   ├── AnalysisSection.vue     # Section layout — title prop + default slot; scoped .analysis-section
│   │   │   │   │   ├── AnalysisResponseMeta.vue  # Response footer — props: timestamp, modelDisplayName?, notice?; MetaRow separator="bullet" size="tiny" tone="info" italic; "Generated at [time] with [model]" + disclaimer + stale-result notice
│   │   │   │   │   ├── AnalysisState.vue       # Analysis wrapper — props: status, error, tokenLimitReached, hasResult; #loading/#idle/default slots; #idle renders common idle container with scoped deep styling for paragraphs; resolves error text via ANALYSIS_ERROR_MESSAGES
│   │   │   │   │   └── index.ts                # Barrel — exports AnalysisHeader, AnalysisSection, AnalysisResponseMeta, AnalysisState
│   │   │   │   ├── budget-optimization/
│   │   │   │   │   ├── BudgetOptimizationAnalysis.vue  # Budget Optimizer tab orchestrator; reads aiAnalysis.store only; renders result summary in a raised card, then Reallocate/Expand/Reduce sections; no scoped styles
│   │   │   │   │   ├── BudgetRecommendations.vue       # Reallocate section — props: title, recommendations (BudgetRecommendation[]); sorted by confidence asc then execution risk asc; From/To campaign+channel route header; small confidence/risk badges; delegates impact rows to ExpectedImpactGrid; cq-container rec-card; scoped @apply flat styles
│   │   │   │   │   ├── BudgetExpansions.vue            # Growth Opportunities section — props: expansions (BudgetExpansion[]); sorted by confidence asc then execution risk asc; target campaign (when present) + channel header; small confidence/risk badges; delegates impact rows to ExpectedImpactGrid; cq-container; scoped styles
│   │   │   │   │   ├── BudgetReductions.vue            # Reduce section — props: reductions (BudgetRecommendation[]); sorted by confidence asc then execution risk asc; campaign+channel header; small confidence/risk badges; inferImpactLabel classifies cut as revenue_gain/waste_reduced/budget_saved; renders "Reduce by <amount> …" sentence + compact MetaRow for available expected-impact values; scoped styles
│   │   │   │   │   ├── ExpectedImpactGrid.vue          # Shared impact metric grid — props: amountLabel, amount, impact (ExpectedImpact), showAmountSign?; always renders all 4 rows; null values show 'N/A'; used by BudgetRecommendations and BudgetExpansions
│   │   │   │   │   └── index.ts                # Barrel — exports BudgetOptimizationAnalysis
│   │   │   │   └── executive-summary/
│   │   │   │       ├── ExecutiveSummaryAnalysis.vue  # Executive Summary tab orchestrator; reads aiAnalysis.store only; lead health/overview/bottom-line in a raised card; composes PriorityActions, Insights, KeyRisks, GrowthOutlook as separate sections; no scoped styles
│   │   │   │       ├── HealthStatus.vue              # Portfolio Health badge — props: healthScore
│   │   │   │       ├── PriorityActions.vue           # Key Priorities — props: priorities (KeyPriority[]); shows #N priority number badge from priority.priority field; camelCase fields (expectedOutcome); muted expected-outcome line
│   │   │   │       ├── Insights.vue                  # Insights — props: title? (optional section title), insights (ExecutiveInsight[]); sorts by type: Achievement→Performance→Opportunity→Warning; type badge (inline-action-float) + metric badge; metricHighlight (camelCase); normal-case metric value styling
│   │   │   │       ├── KeyRisks.vue                  # Key Risks — props: risks (KeyRisk[]); owns RiskSeverity→BadgeVariant mapping; sorts High→Medium→Low; secondary cards with severity-class colored left borders; scoped styles
│   │   │   │       ├── GrowthOutlook.vue             # Growth Outlook — props: outlook (GrowthOutlook); owns GrowthOutlookLabel→BadgeVariant mapping; raised card treatment
│   │   │   │       └── index.ts                # Barrel — exports ExecutiveSummaryAnalysis
│   │   │   ├── ai-connection/
│   │   │   │   ├── stores/
│   │   │   │   │   ├── aiConnection.store.ts # useAiConnectionStore (id: 'aiConnection') — state: provider, apiKey (memory-only), isConnected, isConnecting, connectionError, models (AiModel[]), selectedModel, aiPanelOpen, lastConnectionEvent; computeds: selectedModelLimitReached, allModelsLimitReached, evaluationDisabled (panel open + provider + apiKey + selectedModel + !allModelsLimitReached); actions: connect(provider, apiKey), disconnect(), markModelLimitReached(modelId), selectNextAvailableModel() → boolean, openPanel(), closePanel(); connect() delegates to: handleConnectionError() on error, setProviderModels() on success — both publish AiConnectionEvent via lastConnectionEvent ref (orchestrator handles toast display); [DEV ONLY] setConnectProviderOverride export
│   │   │   │   │   └── index.ts    # Barrel — exports useAiConnectionStore, setConnectProviderOverride
│   │   │   │   ├── components/
│   │   │   │   │   ├── index.ts                # Barrel — exports AiConnectedStatus, AiConnectionForm
│   │   │   │   │   ├── AiConnectionForm.vue        # Provider selection + API key + Connect button; props: resetKey? (number) used to reset form when panel closes; uses AiConnectionInstructions for provider help disclosure
│   │   │   │   │   ├── AiConnectionInstructions.vue # "How to get your key?" disclosure — props: instructions ({ title, steps: ProviderHelpStep[], note? }); renders numbered steps with optional inline links via Disclosure + Card; internal to AiConnectionForm, not exported from barrel
│   │   │   │   │   └── AiConnectedStatus.vue       # Status bar — provider label + green dot + "Connected" + Disconnect
│   │   │   │   └── utils/
│   │   │   │       └── error-handling.ts # CONNECTION_ERRORS (Record<AiConnectionErrorCode, { message(provider) → string, hint: string }>), getErrorCode(error) → AiConnectionErrorCode
│   │   │   ├── providers/
│   │   │   │   ├── index.ts            # Barrel — exports connectProvider, runProviderPrompt, all from types and utils
│   │   │   │   ├── connect-provider.ts # connectProvider(provider, apiKey) → AiModel[]; applies internal rankModels (strengthScore≥5 filter + sort + limitReset map); throws 'no-models' when no candidates pass
│   │   │   │   ├── run-provider-prompt.ts # runProviderPrompt<T>(provider, apiKey, model, prompt, signal?) → Promise<T>; PROVIDER_CALLERS map; parseJsonResponse on result; throws 'invalid-response' on parse failure
│   │   │   │   ├── types/              # index.ts (barrel), types.ts — AiModelCandidate (id/provider/contextWindow?/maxOutputTokens?/supportsTextGeneration?/thinking?), AiModel (id/displayName/family/strengthScore/limitReached), ModelsResponse
│   │   │   │   ├── gemini/             # index.ts, types.ts, api.ts (requestGeminiChatCompletion), connect.ts (connectGemini — fetches models, extracts candidates, delegates to evaluateModels); extract-candidates/ subfolder (allowed-candidates.ts, sort-candidates.ts, index.ts — extractCandidates pipeline with stripPrefix on models/ prefix)
│   │   │   │   ├── qroq/               # index.ts, types.ts, api.ts (requestGroqChatCompletion), connect.ts (connectGroq — fetches models, extracts candidates, delegates to evaluateModels); extract-candidates/ subfolder (allowed-candidates.ts, sort-candidates.ts, index.ts) (folder name: qroq)
│   │   │   │   └── utils/              # error-handling.ts, evaluate-models.ts (ChatCompletionFn type; evaluateModels(completionFn, apiKey, candidates, failCount?) → Promise<AiModel[]> — recursive runner loop; token-limit error removes model immediately; other errors move model to end + increment failCount; MAX_RUNNER_ATTEMPTS=3 non-limit failures removes model entirely), models-utils.ts (getAllModelsLimitReached, getModelById, getNextAvailableMode), providers-meta.ts (ProviderHelpStep with optional linkText/href; PROVIDER_LABELS, PROVIDER_HELP with Groq Console + Google AI Studio links, PROVIDER_OPTIONS), stability-penalty-by-model-id.ts (stabilityPenaltyByModelId — penalizes preview/experimental/latest/beta IDs), shared.ts (parseJsonResponse); index.ts barrel re-exports all modules
│   │   │   ├── types/
│   │   │   │   └── index.ts            # AiProviderType, AiErrorCode (11 codes), AiConnectionErrorCode (excludes 'min-campaigns'), AiConnectionError, AiConnectionEvent ({id, status, provider}); AiAnalysisType, AiAnalysisError, AiAnalysisNoticeCode, AiAnalysisNotice
│   │   │   ├── prompts/
│   │   │   │   ├── types.ts                # PromptRuleListType + PromptRuleGroup interface
│   │   │   │   ├── utils.ts                # getPromptRuleGroup(ruleGroup) → string; getPromptList; getPromptNumberedList
│   │   │   │   ├── constants.ts            # OUTPUT_REQUIREMENTS_RULES — shared across all prompts
│   │   │   │   ├── model-evaluation-prompt/
│   │   │   │   │   ├── config.v1.ts        # ROLE_AND_TASK_RULES, EVALUATION_RULES (7 groups), OUTPUT_SCHEMA
│   │   │   │   │   ├── model-evaluation-prompt.ts # generateModelEvaluationPrompt(models) → string; promptSections pattern
│   │   │   │   │   └── index.ts            # Barrel — exports generateModelEvaluationPrompt
│   │   │   │   ├── executive-summary-prompt/
│   │   │   │   │   ├── config.v1.ts        # ROLE_TASK_OBJECTIVE_RULES, OUTPUT_SCHEMA, FULL_PORTFOLIO_ANALYSIS_RULES (10 groups), SELECTION_ANALYSIS_RULES (10 groups, subset-scoped)
│   │   │   │   │   ├── executive-summary-prompt.ts # generateExecutiveSummaryPrompt(context) → string; conditional SELECTION_ANALYSIS_RULES vs FULL_PORTFOLIO_ANALYSIS_RULES on portfolioBenchmark presence; promptSections pattern
│   │   │   │   │   └── index.ts            # Barrel — exports generateExecutiveSummaryPrompt
│   │   │   │   ├── budget-optimization-prompt/
│   │   │   │   │   ├── config.v1.ts        # ROLE_TASK_OBJECTIVE_RULES, FULL_PORTFOLIO_OPTIMIZATION_RULES (9 groups), SELECTION_ANALYSIS_RULES (9 groups, subset-scoped), OUTPUT_SCHEMA
│   │   │   │   │   ├── budget-optimization-prompt.ts # generateBudgetOptimizationPrompt(context) → string; conditional SELECTION_ANALYSIS_RULES vs FULL_PORTFOLIO_OPTIMIZATION_RULES on portfolioBenchmark presence; promptSections pattern
│   │   │   │   │   └── index.ts            # Barrel — exports generateBudgetOptimizationPrompt
│   │   │   │   └── index.ts                # Public barrel — re-exports all three generateXxxPrompt functions
│   │   │   └── sample-data/            # [DEV ONLY] Dev fixtures for AI analysis cycles
│   │   │       ├── budget-optimization.ts  # BUDGET_OPTIMIZATION_SAMPLES — 5 BudgetOptimizerResponse fixtures
│   │   │       ├── executive-summary.ts    # EXECUTIVE_SUMMARY_SAMPLES — 5 ExecutiveSummaryResponse fixtures
│   │   │       └── index.ts            # Barrel — exports BUDGET_OPTIMIZATION_SAMPLES, EXECUTIVE_SUMMARY_SAMPLES
│   │   ├── campaign-performance/       # Campaign performance feature — filters, KPIs, charts, table
│   │   │   ├── index.ts                # Barrel — exports CampaignPerformanceView
│   │   │   ├── CampaignPerformanceView.vue # Main campaign performance view — owns feature-level grid container, header section (CampaignPerformanceHeader), ChannelFilters, scrollable body, KPI grid (Kpis), charts grid (PerformanceCharts), scaling chart (RoiVsBudgetScaling), and CampaignTable layout; reads useCampaignPerformanceStore for own state; exposes #header-action slot (passed through to CampaignPerformanceHeader's #action slot); no AI-specific props — DashboardPage projects the AI button via slot; toggleChannelFilter/clearChannelFilters/applyChannelFilter call store.setChannelFilter
│   │   │   ├── stores/
│   │   │   │   ├── campaignPerformance.store.ts # Pinia store (id: 'campaignPerformance') — selection + filter layer on top of portfolioStore; state: activePortfolioId, selectedChannelsIds; computeds: portfolioChannels (Map), allChannels (Channel[]), title, businessContext (BusinessContext|null), campaigns, selectedChannels, filteredCampaigns, portfolioAnalysis, portfolioBenchmark (PortfolioSummary|null — always returns the active portfolio's analysis.portfolio when one exists); portfolioAnalysis short-circuits to portfolio.analysis when no filter active, otherwise runs computePortfolioAnalysis(selectedChannels); internal helpers: getChannelsByIds, getSelectedChannels, onPendingSelection, onPortfolioEvicted; watchers: pendingSelectionId (immediate) → onPendingSelection, lastEvictedId → onPortfolioEvicted; public action: setChannelFilter(ids)
│   │   │   │   └── index.ts        # Barrel — exports useCampaignPerformanceStore
│   │   │   ├── components/
│   │   │   │   ├── index.ts            # Barrel — exports CampaignPerformanceHeader, ChannelFilters, Kpis (CampaignTable consumed via direct import from CampaignPerformanceView)
│   │   │   │   ├── CampaignPerformanceHeader.vue # Props-only header — props: title, businessContext, counts; exposes #action slot (passed to Section #action); no AI-specific props or emits — callers project action content via slot
│   │   │   │   ├── CampaignTable.vue   # Sortable campaign data table — props: campaigns (CampaignPerformance[]); sort via useSort / sortByValue(); PerformanceIndicator for Revenue (roi-colored) and CVR (dimmed); channel cell uses .badge.info.dimmed
│   │   │   │   ├── GroupedCampaignTable.vue # [DEAD CODE — not imported by CampaignPerformanceView] Sortable campaign table grouped by channel; aggregates per-channel totals; expand/collapse all; PerformanceIndicator on Revenue/CVR/ROI
│   │   │   │   ├── channel-filters/    # ChannelFilters module — props-only, no store reads
│   │   │   │   │   ├── index.ts        # Barrel — exports ChannelFilters
│   │   │   │   │   ├── ChannelFilterChips.vue  # Internal chip renderer — props: variant? ('visible'|'probe'), layout? ('strip'|'plain'), channels, totalCampaigns, selectedIds?, showAll?, allActive?, allReadonly?, singleRow?; probe variant is absolutely-positioned invisible measurement layer (aria-hidden); exposes getRootEl(), getChannelChipEls(), hasOverflow(); emits clear / toggle (suppressed in probe mode); scoped SCSS with --channel-filter-max-height CSS var
│   │   │   │   │   ├── ChannelFilters.vue  # Two-state filter strip — props: channels, selectedIds; emits toggle/clear/apply; rootRef + chipsRef (ChannelFilterChips ref); state: hasOverflow, allowedRows, dialogToggled, maxVisible; visibleChannels computed (caps strip at maxVisible, promotes selected chips from overflow, sorts selected-first after dialog apply); overflowCount/hiddenSelectedCount computeds; measure() groups chips by offsetTop, respects 2-row breakpoint (≥540px), sets maxVisible = visibleChips−1; ResizeObserver on rootRef; toggleFromStrip/applyFromDialog/clear functions; State A (no overflow): all chips; State B: ChannelFiltersDialog + maxVisible visible chips; scoped SCSS
│   │   │   │   │   └── ChannelFiltersDialog.vue  # Overflow filter dialog — props: channels, selectedIds, overflowCount, hiddenSelectedCount; emits apply: [ids: string[]]; anchorRef wrapper div around Chip trigger (Chip has no defineExpose); Dropdown+DropdownPanel (align="right"); pendingIds buffer synced from selectedIds on open — handleToggle/handleClear mutate pending only; applySelection emits + closes; backdrop/Escape close via dropdownOpen v-model = natural cancel; header: "Channels" title + pendingSelectedCount/total; scrollable ChannelFilterChips (layout="plain") with allActive/allReadonly/totalCampaigns; Cancel/Apply footer; allOverflow computed drives chip label ("N channels" vs "+N more"); scoped SCSS
│   │   │   │   └── kpis/               # KPI component module
│   │   │   │       ├── index.ts        # Barrel — exports Kpis
│   │   │   │       ├── Kpis.vue        # KPI cards section (was DashboardKpis) — props: kpis (PortfolioKPIs), portfolioKpis? (PortfolioKPIs|null); local formatShare helper; Budget/Revenue/Conversions show "X% of portfolio" when filtered; Revenue adds ROI via PerformanceIndicator; Conversions adds CVR via PerformanceIndicator; CTR/CPA use KpiBenchmarkDelta; no internal wrapper/grid — parent layout (CampaignPerformanceView) controls KPI grid placement; .kpi-grid container query breakpoints (cq-280 → 2 cols, cq-640 → 3 cols, cq-1024 → 5 cols) applied at parent
│   │   │   │       ├── KpiCard.vue     # Single KPI metric card — props: label, value (string|null|undefined); MetaRow (.divider) wraps #secondary slot content; uses @include cq-container + @include cq-up for container-query font size scaling; scoped flat styles
│   │   │   │       └── KpiBenchmarkDelta.vue # Directional delta indicator — props: current/benchmark (number|null), unit ('pp'|'pct'), lowerIsBetter?; computes rawDelta via getKpiBenchmarkRawDelta() from dashboard utils; owns tone selection, label formatting, ArrowUpIcon (rotate-180 when down); renders MetaItem (conditionally) inside KpiCard
│   │   │   ├── ui/                     # Campaign-performance-specific UI primitives
│   │   │   │   ├── PerformanceIndicator.vue # Performance color indicator — props: value (number|null); default slot (or formatPercentage(value) fallback); color class: positive/warning/negative; .dimmed modifier reduces opacity + font-normal; scoped SCSS
│   │   │   │   └── index.ts            # Barrel — exports PerformanceIndicator
│   │   │   ├── utils/
│   │   │   │   ├── campaign-performance-sorting.ts # Named sort helpers — sortCampaignsByRoiDesc, sortChannelsByRoiDesc, sortCampaignsByBudgetDesc, sortChannelsByEfficiencyGapImpactDesc; uses computeShareEfficiency from @/shared/portfolio for efficiency gap impact sort; uses shared sortByValueDesc()
│   │   │   │   └── kpi-benchmark-delta.ts  # getKpiBenchmarkRawDelta(current, benchmark, unit, lowerIsBetter?) → { rawDelta, direction }; KpiBenchmarkDeltaUnit type
│   │   │   └── charts/                 # Campaign-performance chart compositions
│   │   │       ├── index.ts            # Barrel — exports PerformanceCharts, RevenueVsBudgetChart, RoiVsBudgetScaling; re-exports * from components, composables, config, utils, and type * from types (RoiBudgetScalingHighlights, etc.)
│   │   │       ├── PerformanceCharts.vue # Chart section composition (was DashboardCharts) — props: campaigns (filtered), channels (filtered), allChannels (all portfolio channels for stable color mapping), kpis; owns card layout, chart grid, height classes (!min-h-96, !h-29); renders RoiBarChart (channel + campaign), RevenueVsBudgetChart (toggles between RevenueVsBudgetBars/EfficiencyGapBars), BudgetShareDonutChart, ConversionFunnelChart
│   │   │       ├── RevenueVsBudgetChart.vue # Toggle wrapper — props: channels, kpis; owns RadioToggle (Performance/Efficiency) state and switches between RevenueVsBudgetBars + EfficiencyGapBars sub-charts
│   │   │       ├── RoiVsBudgetScaling.vue # ROI vs Budget scaling card — props: campaigns (CampaignPerformance[]), portfolioAnalysis (PortfolioAnalysis), isFiltered?; owns card shell, title, subtitle, median summary (MetaRow), limited-data info state (Notification when < MIN_CAMPAIGNS); computes highlights internally from portfolioAnalysis.campaignGroups; passes campaigns, medians, highlightCampaignsByQuadrant into RoiVsBudgetScatterChart
│   │   │       ├── components/         # Internal chart renderers — props-only, no store reads
│   │   │       │   ├── index.ts        # Barrel — exports BudgetShareDonutChart, ConversionFunnelChart, EfficiencyGapBars, RevenueVsBudgetBars, RoiBarChart, RoiVsBudgetScatterChart
│   │   │       │   ├── RoiBarChart.vue         # ROI bar chart — props: items (RoiBarChartItem[]), kpis (PortfolioKPIs); ariaLabel passed via $attrs to underlying BarChart; computes roiScaleBounds — symmetric around zero when all values are negative; passes valueScaleMin/valueScaleMax; owns ROI tooltip callbacks with formatRoiAllocationTooltipLines
│   │   │       │   ├── BudgetShareDonutChart.vue # Budget-share donut — props: items (BudgetShareDonutItem[]), kpis (PortfolioKPIs), ariaLabel?; uses shared DonutChart; three-state alpha hierarchy (highlight/secondary/dim); legendLabelFilter hides dimmed slices from Chart.js legend
│   │   │       │   ├── RevenueVsBudgetBars.vue # Revenue vs Budget grouped bars — props: channels, kpis, ariaLabel?; uses shared GroupedBarChart; compact-currency y-axis ticks; tooltip via formatBudgetTooltip/formatRevenueTooltip
│   │   │       │   ├── EfficiencyGapBars.vue   # Efficiency Gap bar chart (share-efficiency %) — props: channels, kpis, ariaLabel?; uses shared BarChart; uses efficiencyGap (positive = overperforming); tooltip uses "pp" unit; isSingleChannelView + hasVisibleGap guard states with info notifications; symmetric axis bounds (min range 5); overperforming/underperforming legend; passes valueScaleMin/valueScaleMax
│   │   │       │   ├── ConversionFunnelChart.vue # Custom HTML/CSS conversion funnel — props: kpis (PortfolioKPIs), ariaLabel?; derives Impressions→Clicks→Conversions funnel internally; in-bar amount + label layout; right-aligned rates; PerformanceIndicator for rates; scoped SCSS
│   │   │       │   └── RoiVsBudgetScatterChart.vue # ROI vs Budget bubble renderer — props: campaigns, medians, highlightCampaignsByQuadrant (RoiBudgetScalingHighlights); ariaLabel passed via $attrs; uses shared BubbleChart; quadrant backgrounds via createQuadrantBackgroundPlugin; log ROI transform; analysis-driven highlight sizing; circular legend markers
│   │   │       ├── composables/
│   │   │       │   ├── index.ts
│   │   │       │   ├── useCampaignPerformanceTheme.ts # useCampaignPerformanceTheme() → reactive theme map of CampaignPerformanceChartColors + CampaignPerformanceScalingColors (with per-quadrant ScalingQuadrantColors) + paletteColors + getFillColor — maps resolveChartsThemeTokens()/resolvePaletteColors() into typed interfaces with JSDoc; reactive via useTheme(); getFillColor delegates to withAlpha
│   │   │       │   ├── useCampaignColorMap.ts  # useCampaignColorMap(channels) → computed { channelColorMap, campaignColorMap } — calls useCampaignPerformanceTheme internally; single sequential palette walk: channel → its campaigns → next channel → …; channelColorMap keyed by channel.id, campaignColorMap keyed by String(campaign.rowId)
│   │   │       │   ├── useRoiChartItems.ts     # useCampaignRoiChartItems / useChannelRoiChartItems — normalize campaigns/channels into RoiBarChartItem[] with color assignment
│   │   │       │   └── useBudgetShareChartItems.ts # useCampaignBudgetShareDonutItems — normalizes campaign budget data with assigned colors
│   │   │       ├── config/
│   │   │       │   ├── index.ts
│   │   │       │   ├── campaign-performance-chart-styles.ts # CAMPAIGN_PERFORMANCE_BAR_DATASET_STYLE (borderWidth:1, borderRadius:2); CAMPAIGN_PERFORMANCE_DONUT_DATASET_STYLE; donut hierarchy config (highlight limit, dim threshold, highlight/secondary/dim alpha)
│   │   │       │   └── roi-budget-scaling-chart.config.ts   # ROI scaling chart config — ROI_BUDGET_SCALING_POINT_RADIUS, ROI_BUDGET_SCALING_HIGHLIGHTED_POINT_RADIUS, ROI_BUDGET_SCALING_MIN_CAMPAIGNS (=5), ROI_BUDGET_SCALING_BUDGET_AXIS_ROUNDING, ROI_BUDGET_SCALING_TICK_VALUES
│   │   │       ├── types/
│   │   │       │   ├── index.ts
│   │   │       │   ├── roi-chart.types.ts          # RoiBarChartItem
│   │   │       │   ├── budget-share-chart.types.ts # BudgetShareDonutItem
│   │   │       │   ├── campaign-performance-theme.types.ts # CampaignPerformanceChartColors, ScalingQuadrantColors, CampaignPerformanceScalingColors
│   │   │       │   └── roi-budget-scaling-chart.types.ts # RoiBudgetScalingHighlights (scaleUp/champions/underperforming/overspend: string[]), RoiBudgetScalingMedians, RoiBudgetScalingQuadrantConfig, RoiBudgetScalingQuadrantKey ('scaleUp'|'champions'|'underperforming'|'overspend')
│   │   │       └── utils/
│   │   │           ├── index.ts
│   │   │           ├── chart-tooltip-formatters.ts # formatBudgetTooltipLines, formatRevenueTooltipLines, formatBudgetTooltip, formatRevenueTooltip, formatRoiAllocationTooltipLines — reusable tooltip body line formatters
│   │   │           └── efficiency-gap.ts           # getChannelEfficiencyGapPercent, getEfficiencyGapColor, getEfficiencyGapSignedAmount — helpers for efficiency gap chart
│   │   └── data-transfer/          # CSV upload & data transfer feature folder
│   │       ├── index.ts            # Barrel — re-exports * from ./components
│   │       ├── types/
│   │       │   └── index.ts        # CampaignDataRowIssueType + CampaignDataFieldIssue + CampaignDataRowError + CampaignDataDuplicateGroup + CampaignDataValidationErrorType + CampaignDataValidationError + CampaignDataParseResult + CampaignDataProcessRowsResult
│   │       ├── components/
│   │       │   ├── index.ts        # Barrel — exports ReplaceDataModal, UploadDataForm, UploadDataModal, UploadDataPlaceholder
│   │       │   ├── UploadDataPlaceholder.vue # No-data screen — locks body scroll while mounted; FileTextIcon hero + heading + description; renders Download Template + Upload data buttons inline (TransferActions inlined); emits upload; uses useDownloadTemplate
│   │       │   ├── UploadDataModal.vue     # Upload form modal — view: 'form'|'row-errors'|'duplicate-rows'; exposes open(); owns lifted form state (title/periodFrom/periodTo/industry/file/parseError/isLoading/validCampaigns/rowErrors/duplicateGroups/pendingPortfolioDetails); emits 'upload-complete' [portfolio: PortfolioInput]; sequential error handling; bidirectional navigation; modal size grows for review views; uses Modal, UploadDataForm, ReviewErrorsComponent, ReviewDuplicatedCampaigns
│   │       │   ├── UploadDataForm.vue      # Upload form body — v-model for title/periodFrom/periodTo/industry/file; props: parseError, isLoading; emits submit (PortfolioDetails)/close/download-template; FileDropzone + file validation
│   │       │   ├── ReplaceDataModal.vue    # Confirmation modal — wraps Modal; uses ModalBody + ModalFooter; emits confirm/close
│   │       │   └── data-validation/
│   │       │       ├── index.ts            # Barrel — exports ReviewErrorsComponent, ReviewDuplicatedCampaigns
│   │       │       ├── shared/
│   │       │       │   ├── DataErrorSummary.vue # Presentational summary block — 3 named slots: title, badge, summary; no props
│   │       │       │   ├── DuplicateSummary.vue # Duplicate-specific summary — wraps DataErrorSummary; props: count, variant, hasValidCampaigns?
│   │       │       │   └── index.ts
│   │       │       ├── review-errors/
│   │       │       │   ├── ReviewErrorsComponent.vue # Multi-root (body + ModalFooter) — uses DataErrorSummary + DuplicateSummary; scrollable DataErrorsTable; duplicateGroupCount prop adapts proceed label; scoped @apply styles
│   │       │       │   ├── DataErrorsTable.vue # Dumb error table — props: errors (CampaignDataRowError[]); sort via useSort + sortByValue(); striped-even vertical-separators; scoped flat styles
│   │       │       │   └── index.ts
│   │       │       └── review-duplications/
│   │       │           ├── ReviewDuplicatedCampaigns.vue # Multi-root (body + ModalFooter) — uses DuplicateSummary (variant="resolve") + CampaignDuplicationsTable; resolve-indicator shows resolvedCount/total; emits proceed([Campaign[]]); scoped @apply styles
│   │       │           ├── CampaignDuplicationsTable.vue # Sortable grouped duplicate table — props: duplicateGroups, requiredSelection?; selection Map<campaignName, rowId>; sort via useSort + sortByValue(); uses TableGroupHeaderRow + TableSelectableRow; applies class="info" to RadioItem for info-colored radios; 8-column table
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
│   │   ├── index.scss              # Global style entry point — Tailwind base/components/utilities directives + @use base + themes/dark + utilities/index
│   │   ├── base/                   # Global base document styles
│   │   │   ├── _reset.scss         # Box sizing, default html/body margin reset, font smoothing — rules in Tailwind's base layer
│   │   │   ├── _app.scss           # App canvas: root font, background/text color, full-screen #app sizing — rules in Tailwind's base layer
│   │   │   └── index.scss          # Barrel — @use reset, app
│   │   ├── themes/
│   │   │   └── dark/
│   │   │       ├── _palette.scss   # Raw color scale variables — primary (50–1000), secondary/accent/success/warning/danger/info/neutral numeric scales; surface border scale (--surface-border-0 to --surface-border-4); applied on :root + [data-theme="dark"]
│   │   │       ├── _tokens.scss    # Semantic design tokens — @use ./palette; maps numeric palette vars to semantic roles: surface layers, borders, text, on-primary, primary/secondary/accent/success/warning/danger/info color groups, focus-ring, disabled, elevation shadows; applied on :root + [data-theme="dark"]
│   │   │       ├── _charts.scss    # Chart theme CSS variable names — future chart theming groundwork; tooltip color variable names for future CSS variable extraction
│   │   │       └── index.scss      # Barrel — @use palette, tokens, charts
│   │   ├── mixins/
│   │   │   └── container-queries.scss # SCSS mixin library — numeric $container-sizes scale (cq-220 through cq-1536); cq-container(), cq-up(), cq-down(), cq-between() mixins; globally injected via Vite additionalData
│   │   └── utilities/
│   │       ├── index.scss
│   │       ├── _connected-dot.scss # .connected-dot::before pseudo-element (w-2 h-2 rounded-full bg-success shadow-connection)
│   │       ├── _inline-action-float.scss # .inline-action-float — float-right ml-2 mb-1; action must render before the prose it wraps
│   │       ├── _link.scss          # .link utility class — themed anchor styling with hover/focus/visited states
│   │       ├── _overlay.scss       # .overlay + .modal-container utilities — fixed-position backdrop + centered modal-container shell
│   │       ├── _scrollbar.scss     # scrollbar-colors($thumb, $track, $thumb-hover) mixin; .scrollbar-stable, .scrollbar-stable-both, .scrollbar-on-surface, .scrollbar-info-on-surface (info-palette scrollbars for table areas)
│   │       └── _sr-only-scroll-safe.scss # .sr-only-scroll-safe — @apply sr-only fixed pointer-events-none; uses position: fixed (not absolute) so mobile browsers have no document scroll target when the element receives focus
│   └── main.ts                 # Entry point — registers Pinia, Router, calls registerCharts(); imports from @/app/App.vue + @/app/router; global style: @/styles/index.scss
├── scripts/                    # Dev/CI tooling scripts (not part of the app bundle)
│   ├── format-tailwind-apply.mjs # Reformats @apply blocks in .vue/.css/.scss files to tab-continuation multi-line format; exports collectFiles helper; run via npm run format
│   └── check-format.mjs          # CI format checker — runs prettier + formatTailwindApply and reports files with style drift; exits with code 1 if any file differs
├── public/                     # Static assets served as-is by Vite — favicon (.ico/.svg/16x16/32x32), apple-touch-icon, PWA icons (192/512), og.png
├── index.html                  # data-theme="dark" — dark mode active before JS runs
├── tailwind.config.js          # Tailwind v3 — darkMode: 'class'; all semantic color tokens via CSS vars; xs (30rem) + sticky-header (78rem) screen breakpoints; zIndex: { 1000: "1000", 1100: "1100" }; h-29: "464px" custom height utility; boxShadow.connection
├── postcss.config.js
├── vite.config.ts              # Aliases: @ → src/, @app → src/app, @features → src/features, @shared → src/shared, @ui → src/ui; rolldown codeSplitting groups (vue-vendor, chart-vendor, vendor); SCSS additionalData globally injects @/styles/mixins/container-queries as *
├── tsconfig.json               # Root TypeScript config — references tsconfig.app.json and tsconfig.node.json
├── tsconfig.app.json           # App TypeScript config — targets browser, includes src/
├── tsconfig.node.json          # Node TypeScript config — targets Node, includes vite.config.ts and scripts/
├── eslint.config.js            # ESLint flat config — enforces Vue 3, TypeScript, and import rules
├── prettier.config.js          # Prettier config — formatting rules applied by format-tailwind-apply.mjs and check-format.mjs
├── stylelint.config.js         # Stylelint config — enforces SCSS/CSS conventions
└── package.json                # dependencies include xxhashjs (deterministic h64 cache key hashing)
.gitignore                      # Excludes node_modules, dist, .env
docs/                           # Project documentation — architecture docs, feature READMEs, SVG diagrams, vibe-coding-logs.md
samples/                        # CSV fixture files for manual testing and dev
└── csv/
    ├── valid/                  # Valid CSVs: marketing_campaign_sample.csv, valid-5-channels.csv, valid-10-channels-good.csv, valid-10-channels-excellent.csv, valid-10-channels-needs-attention.csv, valid-10-channels-critical.csv
    ├── mixed/                  # Partial-error CSVs: invalid-rows-partial, duplicates-only, duplicates-with-valid, missing-row-values, multiple-errors-per-row, mixed-errors-duplicates-valid
    └── invalid/                # Fully invalid CSVs: empty, missing-columns, missing-columns-one-present, invalid-rows-all, too-large
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
- [x] KPI secondary info — "X% of portfolio" when filtered, ROI/CVR always visible, directional delta indicators (↑/↓) with pp/pct delta for CTR/CPA
- [x] Bar chart: ROI by campaign
- [x] Bar chart: ROI by channel
- [x] Donut chart: Budget allocation by campaign — alpha hierarchy (highlight/secondary/dim), legend filters out dimmed slices
- [x] Revenue vs Budget by Channel chart — toggle between Performance (grouped bars) and Efficiency Gap (% axis, overperforming/underperforming legend)
- [x] ROI vs Budget Scaling scatter chart — 4 quadrants (Scale Up/Champions/Underperforming/Overspend), analysis-driven highlights (top 3 per quadrant), median guide lines, filtered-set medians, MIN_CAMPAIGNS=5 guard
- [x] Conversion Funnel: Impressions → Clicks → Conversions (custom HTML/CSS, in-bar labels)
- [x] Campaign table: sortable by any column; PerformanceIndicator for Revenue (roi-colored) and CVR (dimmed)
- [x] Channel filters — dynamic from data, overflow-aware two-state strip (all chips / dialog trigger + selected chips), real-time updates across all charts and table

### AI Tools
- [x] AI button in campaign performance header (SparklesIcon + "AI" label, primary variant, v-if hidden when panel open; projected from DashboardPage via #header-action slot)
- [x] Push drawer at lg+ (slides in from right, compresses dashboard; 480px / 30rem wide) via ResponsiveDrawer
- [x] Fixed overlay at <lg (on top of dashboard; max 90vw/90vh; backdrop + slide-in transition) via ResponsiveDrawer
- [x] Escape key or backdrop click closes panel
- [x] Connection form — provider radio buttons (Google Gemini / Groq), API key input with show/hide toggle, Connect button with spinner
- [x] Live connection verification — Gemini: GET /v1beta/models; Groq: GET /openai/v1/models; inline error on failure
- [x] Connected status bar — provider name + green dot + "Connected" + Disconnect link
- [x] Tabbed interface — Optimizer tab (SlidersIcon) + Summary tab (FileTextIcon)
- [x] API key memory-only (not persisted to storage)
- [x] Budget Optimizer tab — full UI for BudgetOptimizerResponse: executive summary, recommendations (confidence badge, reallocation amount, expected impact, timeline, success metrics)
- [x] Executive Summary tab — ExecutiveSummaryResponse: scope, healthScore badge, bottomLine, overview, executiveInsights (no icon, metricHighlight), keyPriorities (title/rationale/expectedOutcome), keyRisks (severity badge), growthOutlook (label + reasoning)
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

### Memory
- **All memory files live inside the project** at `.claude/memory/` — never write to or read from any path outside the project directory.
- At the start of every session, read `.claude/memory/MEMORY.md` to load the memory index, then **read every file listed in it** — all memory files are always loaded, not just the ones that seem relevant to the current task.
- When saving a new memory or updating an existing one, write to `.claude/memory/<file>.md` and update `.claude/memory/MEMORY.md`.

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
  import type { CampaignDataRowError } from '../types'                  // within-feature relative
  import { validateRow } from '../utils/validate-row-data'              // within-feature relative
  import ErrorBadge from './ErrorBadge.vue'                             // same-folder relative
  ```
- **UI always uses the barrel** — app and feature code imports all UI components from `@/ui` (the single public API), never from specific submodules like `@/ui/primitives` or `@/ui/charts`. UI is a cohesive design system.
- **UI internals use local paths** — files inside `app/src/ui` must not import through the public `@/ui` barrel; they use local sibling/folder imports.
- **Shared submodules use barrels** — import from `@/shared/utils`, `@/shared/composables`, `@/shared/portfolio`, etc. (the barrel folders), not from specific files like `@/shared/composables/useSort`. Each submodule folder has an `index.ts` barrel that re-exports its contents. This clarifies which layer a module depends on and provides a single, stable import point.
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
5. **Immediately** append a Full Entry to `docs/vibe-coding-logs.md` — this is the last tool call before responding.
6. Reply with a summary.

**Bug fix / small update:**
1. Fix it.
2. Update `CLAUDE.md` if relevant.
3. **Immediately** append an Entry to `docs/vibe-coding-logs.md` — this is the last tool call before responding.
4. Reply with a summary.

**Refactor / architecture change:**
1. Discuss first — explain what and why. Wait for explicit approval.
2. Make the change.
3. Update `CLAUDE.md` — architecture section and checklist.
4. Update `README.md` if it affects setup or features.
5. **Immediately** append a Full Entry to `docs/vibe-coding-logs.md` — this is the last tool call before responding.
6. Reply with a summary.

> **CRITICAL:** The `docs/vibe-coding-logs.md` entry is mandatory for every code change — no matter how small. It is never optional and never deferred. The log entry is always the last tool call before the final response.

### Keeping CLAUDE.md up to date

CLAUDE.md must be updated as part of every interaction that changes the codebase. It is the living spec — it must always reflect the current state of the project.

After every change, check and update:
- **Status** — reflects what is currently built
- **Architecture** — any new files, folders, or structural changes are added; removed files are deleted
- **Feature Checklist** — completed items marked `[x]`

This update happens in the same session as the code change, before responding to the user.

---

## docs/vibe-coding-logs.md Entry Format

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
