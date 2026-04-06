# CLAUDE.md — Marketing Campaign Dashboard

## Project Context

An MBA assignment project: a web-based interactive dashboard for analyzing marketing campaign performance. Users upload campaign data via CSV and get KPI visualizations, channel comparisons, and AI-powered budget optimization recommendations via Google Gemini.

**Status:** Campaign Performance Dashboard implemented. CSV upload flow complete with full error handling. AI Tools panel in place: AI button in dashboard header, push drawer at lg+ and fixed overlay at <lg (max 90vw/90vh). AI connection form (provider select + API key + connect with live verification) implemented for Google Gemini and Grok; connected state shows status bar + tabbed interface (Optimizer / Summary) with stubbed content. Actual Gemini/Grok API calls and upload-replace flow are next.

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
| AI | Google Gemini API + Grok (xAI) API (free tiers) |

---

## Architecture

```
app/                        # Vue 3 + Vite project
├── src/
│   ├── common/                 # Shared types and data — no framework dependencies
│   │   ├── types/
│   │   │   └── campaign.ts     # Campaign interface + CampaignKPIs interface
│   │   ├── utils/
│   │   │   └── math.ts         # safeDivide + round2 — shared math helpers
│   │   └── data/
│   │       └── MOCK_CAMPAIN_DATA.ts # 21 mock campaigns across 13 real-world channels; exported as MOCK_CAMPAINS
│   ├── stores/
│   │   ├── campaignStore.ts    # Pinia store — campaigns, title, filters, KPIs; loadCampaigns action
│   │   ├── toastStore.ts       # Pinia store — toast queue; addToast / removeToast; 4s auto-dismiss
│   │   └── aiStore.ts          # Pinia store — provider, apiKey (memory-only), isConnected, isConnecting, connectionError; connect() tests key via live API call; disconnect()
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
│   │   │   ├── CloseIcon.vue
│   │   │   ├── DownloadIcon.vue
│   │   │   ├── FileTextIcon.vue
│   │   │   ├── SlidersIcon.vue     # Sliders icon — used for Optimizer tab
│   │   │   ├── SparklesIcon.vue    # AI / sparkles icon
│   │   │   ├── UploadIcon.vue
│   │   │   └── index.ts        # Barrel export for icons
│   │   ├── toast/              # Toast notification module
│   │   │   ├── ToastNotification.vue  # Single error toast — role="alert", aria-live
│   │   │   ├── ToastContainer.vue     # Renders toast queue; Teleport to body
│   │   │   └── index.ts        # Barrel export for toast
│   │   ├── BaseButton.vue      # Generic button — primary / ghost variants; icon slot
│   │   ├── BaseModal.vue       # Generic modal shell — backdrop, header (title prop + close button), single default slot; Escape to close
│   │   └── index.ts            # Barrel export for the full ui library
│   ├── shell/
│   │   └── AppShell.vue            # Top-level layout wrapper — flex row at lg+ for push layout; header + app-shell__content (slot) + AiToolsDrawer; provides openUploadModal and openAiPanel via provide()
│   ├── features/
│   │   ├── ai-tools/               # AI Tools feature folder
│   │   │   ├── components/
│   │   │   │   ├── AiToolsDrawer.vue       # Push drawer at lg+ (width 0→400px); fixed overlay at <lg (max 90vw/90vh, backdrop, slide-in transition); Escape to close
│   │   │   │   ├── AiToolsContent.vue      # Root content — shows AiConnectionForm when disconnected; AiConnectedStatus + AiTabs + panel when connected
│   │   │   │   ├── AiConnectionForm.vue    # Provider select (Gemini/Grok) + API key input (show/hide) + Connect button with spinner + inline error
│   │   │   │   ├── AiConnectedStatus.vue   # Status bar — provider label + green dot + "Connected" + Disconnect link
│   │   │   │   ├── AiTabs.vue              # Tab bar — Optimizer (SlidersIcon) + Summary (FileTextIcon); emits change event
│   │   │   │   ├── AiOptimizerPanel.vue    # Budget Optimizer tab — title + file subtitle + Analyze button (SparklesIcon) + idle/loading/demo-result states; reallocation table + confidence badge
│   │   │   │   └── AiSummaryPanel.vue      # Executive Summary tab — title + file subtitle + Summarize button (SparklesIcon) + idle/loading/demo-result states; top performers + underperformers + insights
│   │   │   ├── types/
│   │   │   │   └── index.ts            # Shared building blocks (AllocationShare, FunnelMetrics, PortfolioCount, CampainSummaryTotals) + ExecutiveSummary and BudgetOptimizer data/response types
│   │   │   ├── prompts/
│   │   │   │   ├── executive-summary-prompt.ts  # Builds executive-summary AI prompt from ExecutiveSummaryData
│   │   │   │   └── index.ts            # Barrel export for prompts
│   │   │   ├── utils/
│   │   │   │   ├── buildExecutiveSummaryData.ts # Transforms Campaign[] into ExecutiveSummaryData — aggregation, ranking, key findings; called on-demand at prompt time with filtered data
│   │   │   │   └── buildBudgetOptimizerData.ts  # Transforms Campaign[] into BudgetOptimizerData — per-campaign metrics, channel aggregation, portfolio totals; called on-demand at prompt time with filtered data
│   │   │   └── index.ts            # Barrel export
│   │   ├── dashboard/              # Dashboard feature folder
│   │   │   ├── DashboardView.vue   # Campaign performance dashboard — shows EmptyState or full dashboard; injects openUploadModal and openAiPanel from AppShell
│   │   │   └── components/         # Components owned by this view
│   │   │       ├── EmptyState.vue      # No-data screen — download template + upload CSV buttons
│   │   │       ├── KpiCard.vue         # Single KPI metric card
│   │   │       ├── CampaignTable.vue   # Sortable campaign data table
│   │   │       └── ChannelFilter.vue   # Multi-select channel filter pills
│   │   └── csv-file/               # CSV feature folder
│   │       ├── types/
│   │       │   └── index.ts        # CsvValidationError, CsvParseResult types
│   │       ├── components/
│   │       │   ├── UploadModal.vue     # Self-contained modal — open/close state, parse logic, store calls, download template; exposes only open()
│   │       │   ├── CsvUploadForm.vue   # Multi-root (body + footer divs) — title input + dropzone + Upload/Cancel/Download buttons; v-model title & file; parseError prop
│   │       │   └── CsvErrorTable.vue    # Multi-root (body + footer divs) — error summary + table + Back/Proceed/Cancel buttons
│   │       ├── composables/
│   │       │   └── useDownloadTemplate.ts  # Shared composable — downloadCsv + toast error fallback
│   │       └── utils/
│   │           ├── downloadCsv.ts  # Builds CSV string from Campaign[], triggers browser download
│   │           └── parseCsv.ts     # PapaParse wrapper — validates columns and rows, returns CsvParseResult
│   ├── App.vue                 # Root component — AppShell + RouterView
│   ├── main.ts                 # Entry point — registers Pinia, Router, Chart.js
│   └── style.scss              # Global styles: Tailwind directives, CSS theme tokens, dark mode
├── index.html                  # <html class="dark"> — dark mode active before JS runs
├── tailwind.config.js          # Tailwind v3 — darkMode: 'class', indigo primary theme
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
- [ ] Upload again / replace existing data (with confirmation warning)
- [ ] Data persistence (memory vs sessionStorage vs localStorage)
- [ ] Data preview before importing

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
- [x] Connection form — provider select (Google Gemini / Grok), API key input with show/hide toggle, Connect button with spinner
- [x] Live connection verification — Gemini: GET /v1beta/models; Grok: GET /v1/models; inline error on failure
- [x] Connected status bar — provider name + green dot + "Connected" + Disconnect link
- [x] Tabbed interface — Optimizer tab (SlidersIcon) + Summary tab (FileTextIcon)
- [x] API key memory-only (not persisted to storage)
- [x] Budget Optimizer tab — title, file subtitle, Analyze button, idle/loading/demo-result states; reallocation table with confidence badge
- [x] Executive Summary tab — title, file subtitle, Summarize button, idle/loading/demo-result states; top performers, underperformers, insights
- [ ] Configure actual AI prompts for Optimizer and Summary (replace demo stubs with real API calls)
- [ ] Error handling for AI API calls — status = 'error', inline message, retry option

---

## Workflow Rules

### Language
- **English only** — all communication, code, comments, and documentation files without exception.

### Git
- **Never run git commands** — no git status, git add, git commit, git log, or any other git operation.
- The user handles all git operations. When asked for a commit message, provide the text only — no commands.

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
