# CLAUDE.md — Marketing Campaign Dashboard

## Project Context

An MBA assignment project: a web-based interactive dashboard for analyzing marketing campaign performance. Users upload campaign data via CSV and get KPI visualizations, channel comparisons, and AI-powered budget optimization recommendations via Google Gemini.

**Status:** Campaign Performance Dashboard implemented. CSV upload flow complete with full error handling. AI Tools panel in place with full analysis flow: AI button in dashboard header, push drawer at lg+ and fixed overlay at <lg (max 90vw/90vh). AI connection form (provider radio buttons + API key + connect with live verification + granular error handling) implemented for Google Gemini and Groq; connected state shows status bar + tabbed interface (Optimizer / Summary). Both AI tabs wired to real Gemini/Groq API calls via `aiAnalysisStore` with full flow logic: debounced auto-calls on label change, response caching (keyed by provider::model::sorted labels), data caching (buildBudgetOptimizerData/buildExecutiveSummaryData), request cancellation via AbortController, 5s cooldown per cache key, per-model token/quota limit tracking (limitReached on AiModel, global tokenLimitReached only when all models exhausted), silent model fallback on token-limit (marks model, picks next highest-scored available model, retries transparently — user only sees final result), model change watcher for cache/auto-call, panel open/close persistence, tab switch = panel reopen evaluation (shared analysisActivated flag — analyzing on one tab activates auto-calls on the other), CSV upload resets all analysis state, disconnect clears analysis. No timeouts on any API calls (connection or analysis). Deterministic generation config: Gemini `temperature: 0`; Groq `temperature: 0, top_p: 1, frequency_penalty: 0, presence_penalty: 0`. Gemini model ID `models/` prefix stripped for analysis calls. Model evaluation prompt (`generateModelEvaluationPrompt`) returns up to 20 ranked models (filtered to strength_score >= 6, re-sorted by strength_score desc), default model properties updated if it appears in AI response, failure falls back to optimal model. Response types include `model?: AiModel` stamped with full model properties on each result; panels show "Generated at [time] with [display_name]". Shared `rankModels` util extracts filtering/sorting/init/optimal-update logic used by both providers. Budget Optimizer: executive summary, recommendations, top/underperformers, quick wins, correlations, risks. Executive Summary: health score, bottom line, key metrics, insights, priority actions, channel summary, correlations. Upload-replace flow is next.

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
│   │   │   └── campaign.ts     # Campaign interface + CampaignKPIs interface + CampaignScope interface (campaigns/selectedCampaigns/selectedChannels string arrays)
│   │   ├── utils/
│   │   │   ├── math.ts         # safeDivide + round2 — shared math helpers (CAC uses inline null check instead of safeDivide)
│   │   │   └── roi.ts          # roiValue(revenue, budget) → number; roiClass(roi) → 'positive'|'warning'|'negative'; formatROI(value) → string
│   │   └── data/
│   │       └── MOCK_CAMPAIN_DATA.ts # 21 mock campaigns across 13 real-world channels; exported as MOCK_CAMPAINS
│   ├── stores/
│   │   ├── campaignStore.ts    # Pinia store — campaigns, title, filters, KPIs; campaignScope computed (CampaignScope — campaigns/selectedCampaigns/selectedChannels as string arrays); loadCampaigns action
│   │   ├── toastStore.ts       # Pinia store — toast queue; addToast / removeToast; 4s auto-dismiss
│   │   ├── aiStore.ts          # Pinia store — provider, apiKey (memory-only), isConnected, isConnecting, connectionError (AiConnectionError), models (AiModel[] sorted by strength_score desc), selectedModel (AiModel — highest strength_score), aiPanelOpen; selectedModelLimitReached, allModelsLimitReached (computed); connect() delegates to connectProvider; disconnect(); markModelLimitReached(modelId); selectNextAvailableModel() — picks next highest-scored non-exhausted model, returns false if none left; openPanel(); closePanel()
│   │   └── aiAnalysisStore.ts  # Pinia store — shared AI analysis logic for both tabs (optimizer/summary); per-tab state: firstAnalyzeCompleted, status, response, error, errorFallbackMessage, cache, cacheTimestamps, dataCache, cooldowns, lastVisibleCacheKey; shared: activeTab, tokenLimitReached (global — only when all models exhausted), analysisActivated (cross-tab — analyzing on one tab activates auto-calls on the other); debounced label-change auto-calls (300ms), response caching (provider::model::sorted labels), data caching (labels), request cancellation (AbortController), 5s cooldown, silent model fallback on token-limit (marks model → selectNextAvailableModel → retries transparently, no error shown to user), stamps response.model on success, model change watcher for cache/auto-call, setActiveTab cancels in-flight request on previous tab before switching, panel open/close + tab switch evaluation, clearStateForNewCSV (CSV reset), clearStateForDisconnect (delegates to clearStateForNewCSV)
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
│   │   │   ├── ArrowLeftIcon.vue
│   │   │   ├── ArrowUpIcon.vue     # Up arrow icon — used for sort direction indicator
│   │   │   ├── CloseIcon.vue
│   │   │   ├── DownloadIcon.vue
│   │   │   ├── EyeIcon.vue         # Show password icon
│   │   │   ├── EyeOffIcon.vue      # Hide password icon
│   │   │   ├── FileTextIcon.vue
│   │   │   ├── SlidersIcon.vue     # Sliders icon — used for Optimizer tab
│   │   │   ├── SparklesIcon.vue    # AI / sparkles icon
│   │   │   ├── UploadIcon.vue
│   │   │   └── index.ts        # Barrel export for icons
│   │   ├── toast/              # Toast notification module
│   │   │   ├── ToastNotification.vue  # Single error toast — role="alert", aria-live
│   │   │   ├── ToastContainer.vue     # Renders toast queue; Teleport to body
│   │   │   └── index.ts        # Barrel export for toast
│   │   ├── types/
│   │   │   └── badge-variant.ts    # BadgeVariant type — 'success' | 'warning' | 'danger' | 'info' | 'opportunity'; imported by both AI panel components
│   │   ├── BaseModal.vue       # Generic modal shell — Teleport to body; backdrop (click-to-close via @click.self, aria-modal/role="dialog"/aria-label); header (title prop + close button using .btn-icon-secondary), single default slot; Escape to close
│   │   ├── FileDropzone.vue    # File drop zone — v-model (File|null), id?, accept?, hint? props; button element (not div role="button"); hidden input outside button (tabindex="-1"); hintId computed from id prop; aria-describedby on button when hint visible; hint text: "Drag & drop a {hint} file here or browse" (hint optional, omitted gives generic); browse-link styled as text-button-small (primary-400); hint color matches placeholder (typography-subtle); drag state internal; named error slot drives input-error via Comment-node detection; emits raw file; scoped @apply styles
│   │   ├── PasswordInput.vue   # Password/secret input — v-model, id?, placeholder?, disabled?, autocomplete? props; toggle show/hide via EyeIcon/EyeOffIcon; named error slot drives input-error class via slot content detection (Comment node filtering); scoped non-BEM styles
│   │   ├── RadioToggle.vue     # Pill-style radio group — v-model, options ({value,label}[]), name? props; grid-template-columns driven by options.length; scoped non-BEM styles
│   │   ├── Spinner.vue         # Reusable spinner — size (sm/md/lg/xl/xxl) + variant (primary/secondary) props; aria-hidden; colors via tailwind spinner tokens; @apply throughout
│   │   ├── Tabs.vue            # Generic tab bar — Tab<T> type; tabs + activeTab props; change emit; optional icon per tab via Component; auto-selects first tab on mount; @apply styles
│   │   ├── DataTableHeader.vue # Reusable thead — columns: DataTableColumn[] (key, label, sortable?, align?: 'left'|'right', ariaLabel?, class?); sticky?: bool; sortKey?: string; sortDir?: SortDir; emits sort:[key]; non-sortable → data-table-header; sortable → data-table-sortable-header + ArrowUpIcon; right-align via scoped .th-right; exports DataTableColumn + SortDir types
│   │   └── index.ts            # Barrel export for the full ui library (exports Tabs + Tab type; FileDropzone + PasswordInput + RadioToggle added; DataTableHeader + DataTableColumn + SortDir added)
│   ├── shell/
│   │   ├── AppShell.vue            # Top-level layout wrapper — flat @apply styles (shell-left/shell-header/shell-title/shell-main); flex col → flex row at lg+; shell-left (header + shell-main slot, flex col, overflow-y auto) + AiToolsDrawer sibling; shell-main has max-width 1280px centered; provides openUploadModal and openAiPanel via provide(); uses aiStore.aiPanelOpen for panel state; wires panel open/close to aiAnalysisStore; header "Upload CSV" button uses .btn-secondary-outline and routes through ReplaceDataModal when data exists; gradient title (indigo→pink)
│   │   └── AiToolsDrawer.vue       # Push drawer at lg+ (width 0→30rem, sticky top-0); fixed overlay at <lg (max 90vw/90vh, backdrop, slide-in transition); Escape to close; flat @apply styles (push-drawer/push-drawer-panel/overlay/overlay-panel, open modifier class)
│   ├── features/
│   │   ├── ai-tools/               # AI Tools feature folder
│   │   │   ├── components/
│   │   │   │   ├── AiToolsContent.vue      # Root content — header (SparklesIcon + title + .btn-icon-secondary close); shows AiConnectionForm when disconnected; AiConnectedStatus + AiAnalysis when connected; grid layout (status bar / tabs / scroll area)
│   │   │   ├── ai-analysis/
│   │   │   │   ├── callProvider.ts     # callProviderForAnalysis<T>(provider, apiKey, model, prompt, signal) → T; calls Gemini/Groq with AbortSignal support (no timeout — relies on external signal), token/quota limit detection (429, RESOURCE_EXHAUSTED, rate_limit), strips models/ prefix for Gemini, parses JSON response
│   │   │   │   ├── index.ts            # Barrel export — only callProviderForAnalysis
│   │   │   │   └── components/         # AI analysis UI — tab switcher, shared section wrappers, budget-optimization and executive-summary component trees
│   │   │   │       ├── AiAnalysis.vue          # Tab switcher — Tabs (Summary/Optimizer) + scrollable container; reads aiAnalysisStore.activeTab; renders BudgetOptimizationAnalysis or ExecutiveSummaryAnalysis; flat scoped .panel-container style
│   │   │   │       ├── index.ts                # Barrel export — AiAnalysis
│   │   │   │       ├── shared/                 # Shared components used by both tabs — props-only, no store reads
│   │   │   │       │   ├── AnalysisState.vue       # Analysis wrapper — props: title, actionLabel, idleText, loadingText, status, error, errorFallback, tokenLimitReached, isButtonDisabled, hasResult, cacheTimestamp (string|number|null), modelName?; formats cacheTimestamp internally via computed; emit: analyze; slot: result content; handles header, token-limit notice, idle/loading/error/result states; grouped scoped styles
│   │   │   │       │   ├── AnalysisSummary.vue     # Section header — props: title, period?, scope (CampaignScope); #badge slot (optional right-side content); default slot (body); analysis-details renders period/campaigns/channels as .detail-item spans (inline-block); bullet separators via CSS ::before on & + & rule; scoped styles
│   │   │   │       │   └── AnalysisCorrelations.vue # Correlations section — correlations: Correlation[] prop; v-if on length; no scoped styles (global classes only)
│   │   │   │       ├── budget-optimization/    # Budget Optimizer tab orchestrator + dumb section components — all props-only section components, no store reads, scoped @apply flat styles
│   │   │   │       │   ├── BudgetOptimizationAnalysis.vue        # Budget Optimizer tab — thin orchestrator; wraps AnalysisState; delegates all sections to sibling components; reads campaignStore + aiAnalysisStore; no scoped styles
│   │   │   │       │   ├── BudgetOptimizationOverview.vue        # Executive summary — props: summary, period?, scope (CampaignScope); wraps AnalysisSummary
│   │   │   │       │   ├── BudgetOptimizationRecommendations.vue # Recommendations — props: recommendations[]; confidenceVariant + urgencyVariant badges; formatEuro + formatRoi; rec-card container-type for badge stacking via @container (max-width: 460px)
│   │   │   │       │   ├── BudgetOptimizationTopPerformers.vue   # Top Performers — props: performers[]; ROI in text-success
│   │   │   │       │   ├── BudgetOptimizationUnderperformers.vue # Underperformers — props: underperformers[]; actionVariant badge; ROI in text-danger--5p
│   │   │   │       │   ├── BudgetOptimizationQuickWins.vue       # Quick Wins — props: quickWins[]; effortVariant badge
│   │   │   │       │   └── BudgetOptimizationRisks.vue           # Risks & Mitigations — props: risks[]; v-if on length
│   │   │   │       └── executive-summary/      # Executive Summary tab orchestrator + dumb section components — all props-only section components, no store reads, scoped @apply flat styles
│   │   │   │           ├── ExecutiveSummaryAnalysis.vue        # Executive Summary tab — thin orchestrator; wraps AnalysisState; delegates all sections to sibling components; reads campaignStore + aiAnalysisStore; no scoped styles
│   │   │   │           ├── ExecutiveSummaryHealth.vue          # Portfolio Health — props: healthScore, bottomLine, period?, totalCampaigns, selectedCampaigns; wraps AnalysisSummary with health badge in #badge slot
│   │   │   │           ├── ExecutiveSummaryPriorityActions.vue # Priority Actions — props: actions (priority_actions[]); urgencyVariant badge
│   │   │   │           ├── ExecutiveSummaryMetrics.vue         # Key Metrics grid — props: metrics (key_metrics); formatEuro/formatRoi/formatNumber/classROI; metrics-grid container-type for expandable/full-width breakpoints via @container
│   │   │   │           ├── ExecutiveSummaryInsights.vue        # Insights — props: insights[]; insightTypeVariant badge
│   │   │   │           └── ExecutiveSummaryChannels.vue        # Channel Summary — props: channels[], additionalChannelsNote?; channelStatusVariant badge + border-left color
│   │   │   ├── ai-connection/
│   │   │   │   ├── shared.ts           # errorCodeFromStatus, errorCodeFromException, parseJsonResponse — shared utilities for provider modules (no timeouts)
│   │   │   │   ├── gemini.ts           # connectGemini(apiKey) → AiModel[] (full flow: fetch → filter → optimal model → AI selection prompt → return ranked models; falls back to optimal model on AI prompt failure); callGemini, filterModels, getOptimalModel (flash-first + latest version), buildFallbackModel are internal
│   │   │   │   ├── groq.ts             # connectGroq(apiKey) → AiModel[] (full flow: fetch → filter → optimal model → AI selection prompt → return ranked models; falls back to optimal model on AI prompt failure); callGroq, filterModels, getOptimalModel (most recent created), buildFallbackModel are internal
│   │   │   │   ├── connectProvider.ts  # connectProvider(provider, apiKey) → AiModel[] | AiConnectionError; thin wrapper that delegates to connectGemini/connectGroq; catches errors and maps known error codes from message or falls back to errorCodeFromException
│   │   │   │   ├── index.ts            # Barrel export — only connectProvider
│   │   │   │   ├── components/         # Connection UI components
│   │   │   │   │   ├── AiConnectionForm.vue    # Provider selection via RadioToggle (PROVIDER_OPTIONS from utils) + API key input via PasswordInput (error passed via #error slot) + collapsible help section (.card-secondary) + Connect button (.btn-primary + Spinner) + inline error (field-error/field-error-hint); clears connectionError + apiKey on provider change; providerHelp computed from PROVIDER_HELP; imports PROVIDER_OPTIONS, PROVIDER_HELP, ERROR_MESSAGES, ERROR_HINTS from utils/; flat scoped styles (no BEM)
│   │   │   │   │   ├── AiConnectedStatus.vue   # Status bar — provider label + green dot (::before pseudo-element + shadow-connection) + "Connected" + .btn-destructive-small Disconnect; disconnect clears analysis state via aiAnalysisStore; flat scoped styles (no BEM)
│   │   │   │   │   └── index.ts                # Barrel export — AiConnectionForm, AiConnectedStatus
│   │   │   │   └── utils/              # Connection UI constants
│   │   │   │       └── index.ts        # PROVIDER_LABELS (Record<AiProviderType, string>), PROVIDER_HELP (Record<AiProviderType, ...>), ERROR_MESSAGES, ERROR_HINTS, PROVIDER_OPTIONS
│   │   │   ├── types/
│   │   │   │   └── index.ts            # AiProviderType, AiConnectionErrorCode (incl. no-models), AiConnectionError, AiModel (incl. limitReached), RankedModelsResponse, GeminiModel, GeminiModelsResponse, GroqModel, GroqModelsResponse, AiAnalysisTab, AiAnalysisStatus, AiAnalysisErrorCode, AiAnalysisError (code + message) + shared building blocks (PerformanceDeltas, CampainSummaryTotals, AllocationShare, FunnelMetrics, PortfolioCount, Correlation) + prompt types (PromptList, PromptInstructions, PromptInstructionStep, PromptScopeConfig, BusinessContext, BudgetOptimizerContextInput) + data types (ExecutiveSummaryData, BudgetOptimizerData) + response types (BudgetOptimizerResponse, ExecutiveSummaryResponse with additional_channels_note? and stricter icon union)
│   │   │   ├── prompts/
│   │   │   │   ├── prompt-utils.ts             # Shared prompt helpers — getPromptList, getPromptInstructions, getAnalysisInstructions, getInterpretationRulesBlock, getOutputRulesBlock, getScopeBlock
│   │   │   │   ├── business-context.ts         # Business context prompt block builder — getBusinessContextLinesForPrompt, getBusinessContextForPrompt, generateBusinessContextForPrompt
│   │   │   │   ├── executive-summary-prompt.ts # generateExecutiveSummaryPrompt — assembles executive-summary AI prompt from ExecutiveSummaryData
│   │   │   │   ├── budget-optimization-prompt.ts  # generateBudgetOptimizationPrompt — assembles budget-optimizer AI prompt from BudgetOptimizerData
│   │   │   │   ├── model-evaluation-prompt.ts  # generateModelEvaluationPrompt — evaluates and ranks up to 20 models by strength_score
│   │   │   │   └── index.ts                    # Barrel export for prompts
│   │   │   ├── mocks/
│   │   │   │   ├── budget-optimizer-mocks.ts    # 5 BudgetOptimizerResponse mock objects (aggressive reallocation, conservative, seasonal pivot, channel consolidation, growth expansion)
│   │   │   │   ├── executive-summary-mocks.ts  # 5 ExecutiveSummaryResponse mock objects (strong portfolio, needs attention, excellent, critical, growth phase); each stamped with model (MOCK_GEMINI_FLASH or MOCK_GROQ_LLAMA) and period ('Q1/Q2 2026')
│   │   │   │   └── index.ts                    # Barrel export for mocks
│   │   │   ├── utils/
│   │   │   │   ├── buildExecutiveSummaryData.ts # Transforms Campaign[] into ExecutiveSummaryData — portfolio benchmarks, delta signals (roiDelta/cacDelta/cvrDelta), campaign classification (top: ROI+CAC vs portfolio, underperforming: 2+ signal threshold, no overlap), channel materiality ranking, priority-ordered key findings; min sample threshold, CAC=Infinity for zero conversions
│   │   │   │   ├── buildBudgetOptimizerData.ts  # Transforms Campaign[] into BudgetOptimizerData — per-campaign metrics, channel aggregation, portfolio totals; called on-demand at prompt time with filtered data
│   │   │   │   ├── rankModels.ts                # rankModels(parsed, fallback) — filters out models with strength_score < 6, sorts by strength_score desc, inits limitReached, updates optimal model properties from AI response
│   │   │   │   ├── analysis-badge-variants.ts   # Badge variant helpers for AI panels — internal badgeVariant(map, key) generic resolver; exports: healthScoreVariant, channelStatusVariant, urgencyVariant, insightTypeVariant, confidenceVariant, actionVariant, effortVariant
│   │   │   │   └── panel-formatters.ts          # Display string helpers for AI panels — exports: formatRoi, formatEuro, formatNumber
│   │   │   └── index.ts            # Barrel export (empty — AiToolsDrawer moved to shell/)
│   │   ├── dashboard/              # Dashboard feature folder
│   │   │   ├── DashboardView.vue   # Campaign performance dashboard — shows EmptyState or full dashboard; injects openUploadModal and openAiPanel from AppShell; AI button uses raw `<button class="btn-primary">`; table section uses global `.card` class
│   │   │   └── components/         # Components owned by this view
│   │   │       ├── EmptyState.vue      # No-data screen — uses FileActions for download/upload buttons
│   │   │       ├── KpiCard.vue         # Single KPI metric card
│   │   │       ├── CampaignTable.vue   # Sortable campaign data table; uses global data-table classes; channel cell uses `.badge.info` global CSS class; ROI coloring via scoped modifier classes (--roi-positive/warning/negative)
│   │   │       └── ChannelFilter.vue   # Multi-select channel filter pills
│   │   └── csv-file/               # CSV feature folder
│   │       ├── types/
│   │       │   └── index.ts        # CsvRowError (row/column/issue), CsvCampaign (extends Campaign + rowNum), CsvDuplicateGroup (campaignName + rows: CsvCampaign[]), CsvValidationErrorType (union incl. duplicate_campaigns), CsvValidationError (type + detail? + missingColumns? + rowErrors? + duplicateGroups?), CsvParseResult (campaigns: CsvCampaign[]), ProcessRowsResult (campaigns: CsvCampaign[])
│   │       ├── components/
│   │       │   ├── FileActions.vue         # Download Template + Upload CSV button pair — emits upload; uses useDownloadTemplate; flat @apply scoped styles; responsive stacking at <480px
│   │       │   ├── UploadModal.vue         # Self-contained modal — view: 'form'|'row-errors'|'duplicate-rows'; open/close/parse/store; exposes only open(); sequential error handling: invalid_rows → row-errors view, then duplicate_campaigns → duplicate-rows view (or direct if no row errors)
│   │       │   ├── ReplaceDataModal.vue    # Confirmation modal — wraps BaseModal; uses global .modal-body, .modal-footer, .btn-secondary-outline, .btn-primary; no scoped styles; emits confirm/close; opened by AppShell header button when data exists
│   │       │   ├── CsvUploadForm.vue       # Multi-root (body + footer divs) — title input + FileDropzone (hint="CSV", error via #error slot) + Upload/Cancel/Download buttons; v-model title & file; parseError + isLoading props; CSV validation (isValidCsvFile) in handleFileSelect; field label has for="csv-file" linking to FileDropzone's hidden input; uses global field/form-control classes; footer stacks vertically at <480px
│   │       │   ├── CsvErrorTable.vue       # Multi-root (body + footer divs) — uses DataErrorSummary for error blocks (stacked: invalid-only / partial-import / duplicate-notice conditionally); scrollable table (CsvRowError[]); duplicateGroupCount prop: adapts proceed label ('Proceed with valid rows' or 'Review duplicate campaigns'); proceed visible when validCampaigns > 0 OR duplicateGroupCount > 0
│   │       │   └── validation/
│   │       │       ├── DataErrorSummary.vue # Presentational summary block — 3 named slots: title, badge, summary; no props, no scoped styles; used by CsvErrorTable and CsvDuplicateTable
│   │       │       └── DataErrorsTable.vue # Dumb table component — props: errors (CsvRowError[]); sortable Row column (asc/desc toggle, data-table-sortable-header + data-table-sticky-header); flat @apply styles; no BEM
│   │       │   └── CsvDuplicateTable.vue   # Multi-root (body + footer divs) — uses DataErrorSummary for duplicate header block; shows groups by campaign name; radio selection per row; canProceed: validCampaigns.length > 0 OR at least one selection; emits proceed([Campaign[]]) with user-selected campaigns; Back/Proceed/Cancel buttons; local formatCurrency/formatNumber helpers; horizontal scroll for 8-column table
│   │       ├── composables/
│   │       │   ├── useDownloadTemplate.ts  # Shared composable — downloadCsv + toast error fallback
│   │       │   └── useUploadModal.ts       # Upload modal composable — accepts modalRef (InstanceType<UploadModal>); uses campaignStore internally; hasCampaigns computed; requestUpload (opens modal or shows replace confirm based on hasCampaigns); onReplaceConfirm/closeReplaceConfirm; calls provide('openUploadModal') internally
│   │       └── utils/
│   │           ├── download-csv.ts         # Builds CSV string from Campaign[], triggers browser download
│   │           ├── error-messages.ts       # All CSV validation display text — VALIDATION_ERROR_MESSAGES const map (incl. duplicate_campaigns) with {placeholder} syntax; getValidationErrorMessage(error); getRowErrorMessage(error); getRowErrorSummaryWords(invalidCount, validCount) → RowErrorSummaryWords; replacePlaceholders helper
│   │           ├── detect-campaign-duplication.ts # detectCampaignDuplication(campaigns: CsvCampaign[]) → { unique, groups } — case-insensitive name grouping; separates unique from duplicate groups
│   │           ├── map-campaign.ts         # toCampaign(CsvCampaign) → Campaign; toCampaigns(CsvCampaign[]) → Campaign[] — strips rowNum before store; single mapping boundary in UploadModal
│   │           ├── parse-csv.ts            # PapaParse wrapper — file-level validation (type/size) + parse; delegates to validate-campaign-data
│   │           ├── validate-campaign-data.ts # Campaign data validator — EXPECTED_HEADERS; column presence check; empty-file check; processRows returns CsvCampaign[] (fields + rowNum spread); delegates duplicate detection to detect-campaign-duplication; returns CsvParseResult with both invalid_rows and duplicate_campaigns errors when applicable
│   │           └── validate-row-data.ts    # Per-row field validation — validateRow + three sub-validators (string/numeric/funnel); guard helpers; returns CsvRowError[]
│   ├── styles/
│   │   ├── index.scss              # Root barrel — @use components/index + utilities/index; imported by style.scss
│   │   ├── components/
│   │   │   ├── index.scss          # Barrel — @use all component partials
│   │   │   ├── _ai-summary.scss    # @layer components — .ai-panel, .ai-section (with p > strong); flat child classes: .section-title, .section-subtitle, .section-note, .analysis-details
│   │   │   ├── _badge.scss         # @layer components — .badge, .badge-text, .badge-background; variants: success/warning/danger/info/opportunity
│   │   │   ├── _button.scss        # @layer components — .btn base, .btn-primary, .btn-icon-secondary, .btn-secondary-outline, .btn-destructive-small, .btn-small
│   │   │   ├── _card.scss          # @layer components — .card, .card-secondary; flat child classes: .card-head, .card-title, .card-content
│   │   │   ├── _forms.scss         # @layer components — .form, .field, .field-label, .form-control, .input-error, .field-errors, .field-error, .field-error-hint
│   │   │   ├── _modal.scss         # @layer components — .modal-body, .modal-footer (flat, non-BEM)
│   │   │   └── _table.scss         # @layer components — .data-table, .data-table-header, .data-table-row, .data-table-cell
│   │   └── utilities/
│   │       ├── index.scss          # Barrel — @use all utility partials
│   │       ├── _roi.scss           # @layer utilities — .roi-text with .positive/.warning/.negative modifiers
│   │       └── _scrollbar.scss     # @layer utilities — .scrollbar-stable, .scrollbar-stable-both, .scrollbar-on-surface
│   ├── App.vue                 # Root component — AppShell + RouterView
│   ├── main.ts                 # Entry point — registers Pinia, Router, Chart.js
│   └── style.scss              # Global styles: Tailwind directives, CSS theme tokens, dark mode; imports styles/index
├── index.html                  # <html class="dark"> — dark mode active before JS runs
├── tailwind.config.js          # Tailwind v3 — darkMode: 'class', indigo primary theme; danger (default + -5p), success, warning, typography (default/subtle/intense), surface (default/secondary), surface-border (default/secondary), spinner color tokens (primary/secondary arc + track); connection box-shadow token; badge colors moved to SCSS
├── postcss.config.js
├── vite.config.ts              # @ alias → src/
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
- [x] Executive Summary tab — full UI for ExecutiveSummaryResponse: health score badge (Excellent/Good/Needs Attention/Critical with color + score/100), bottom line, key metrics grid (8 metrics), insights (typed cards with emoji icon + metric highlight), priority actions (numbered with urgency badge), channel summary (status badge + budget share + one-liner), correlations; 5 mock responses cycle on each Summarize click
- [x] Configure actual AI prompts for Optimizer and Summary (real API calls via callProviderForAnalysis + aiAnalysisStore)
- [x] Error handling for AI connection — granular error codes (invalid-key, network, timeout, rate-limit, server-error, unknown) with contextual hints in connection form; error state in both panels with message + hint

---

## Workflow Rules

### Language
- **English only** — all communication, code, comments, and documentation files without exception.

### Git
- **Never run git commands** — no git status, git add, git commit, git log, or any other git operation.
- The user handles all git operations. When asked for a commit message, provide the text only — no commands.

### Styling
- **No BEM** — the project is moving away from BEM class naming.
- When refactoring or creating any component, styles must use flat class names with `@apply` (Tailwind utility composition in SCSS).
- Never introduce new BEM modifier classes (e.g. `__element`, `--modifier`). Replace any encountered during refactor work.

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
