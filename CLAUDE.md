# CLAUDE.md — Marketing Campaign Dashboard

## Project Context

An MBA assignment project: a web-based interactive dashboard for analyzing marketing campaign performance. Users upload campaign data via CSV and get KPI visualizations, channel comparisons, and AI-powered budget optimization recommendations via Google Gemini.

**Status:** Campaign Performance Dashboard implemented — app lands directly on the dashboard, Pinia store, charts module, dark theme, CSV download, toast notification system, and base UI components all in place. CSV upload and AI features are next.

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
| CSV Parsing | PapaParse (planned — for upload direction only) |
| AI | Google Gemini API (free tier) |

---

## Architecture

```
app/                        # Vue 3 + Vite project
├── src/
│   ├── common/                 # Shared types and data — no framework dependencies
│   │   ├── types/
│   │   │   └── campaign.ts     # Campaign interface + CampaignKPIs interface
│   │   └── data/
│   │       └── MOCK_CAMPAIN_DATA.ts # 21 mock campaigns across 13 real-world channels; exported as MOCK_CAMPAINS
│   ├── stores/
│   │   ├── campaignStore.ts    # Pinia store — campaigns, filters, KPIs, derived state
│   │   └── toastStore.ts       # Pinia store — toast queue; addToast / removeToast; 4s auto-dismiss
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
│   │   │   ├── DownloadIcon.vue
│   │   │   ├── CloseIcon.vue
│   │   │   └── index.ts        # Barrel export for icons
│   │   ├── toast/              # Toast notification module
│   │   │   ├── ToastNotification.vue  # Single error toast — role="alert", aria-live
│   │   │   ├── ToastContainer.vue     # Renders toast queue; Teleport to body
│   │   │   └── index.ts        # Barrel export for toast
│   │   ├── BaseButton.vue      # Generic button — primary / ghost variants; icon slot
│   │   └── index.ts            # Barrel export for the full ui library
│   ├── shell/
│   │   └── AppShell.vue            # Top-level layout wrapper — header (title + download button) + main slot + ToastContainer
│   ├── features/
│   │   ├── dashboard/              # Dashboard feature folder
│   │   │   ├── DashboardView.vue   # Campaign performance dashboard — loads at /
│   │   │   └── components/         # Components owned by this view
│   │   │       ├── KpiCard.vue         # Single KPI metric card
│   │   │       ├── CampaignTable.vue   # Sortable campaign data table
│   │   │       └── ChannelFilter.vue   # Multi-select channel filter pills
│   │   └── csv-file/               # CSV feature folder
│   │       └── utils/
│   │           └── downloadCsv.ts  # Builds CSV string from Campaign[], triggers browser download
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
- [ ] Empty state with "Download Template" and "Upload CSV" options
- [ ] Drag & drop + file picker upload
- [ ] Auto-detection of columns
- [ ] Data preview before importing
- [ ] Error handling: wrong file type, empty/oversized file, missing columns, invalid values

### Campaign Performance Dashboard
- [x] KPI Cards: Total Budget, Revenue, ROI, CTR, CVR, CAC
- [x] Bar chart: ROI by campaign
- [x] Donut chart: Budget allocation by channel
- [x] Grouped bar chart: Revenue vs Budget by channel
- [x] Conversion Funnel: Impressions → Clicks → Conversions
- [x] Campaign table: sortable by any column
- [x] Channel filters — dynamic from data, real-time updates across all charts and table

### AI Budget Optimizer (Gemini)
- [ ] Send campaign data to Gemini API
- [ ] Return budget reallocation recommendations in natural language
- [ ] Confidence score per recommendation (High / Medium / Low)
- [ ] Settings page for user Gemini API key input
- [ ] Test Connection button
- [ ] Disabled state + message when no API key provided
- [ ] Link to get a free key from Google AI Studio

### Executive Summary Generator (AI)
- [ ] One-click AI summary in 3–5 bullets
- [ ] Highlight top and underperforming campaigns
- [ ] Uses same Gemini connection as Budget Optimizer

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

### Full entry — feature / refactor / architecture

```
## [#N] Title
**Type:** feature | refactor | architecture
**Summary:** One-sentence description of what changed and why.
**Brainstorming:** Reasoning, options considered, trade-offs, and decisions made before building.
**Prompt:** The actual prompt used — written as if given to the AI.
**What was built:** / **What changed:**
- bullet list of files created or modified and what each does
**Key decisions & why:**
- bullet list of non-obvious choices and their rationale
```

### Short entry — small update / bug fix

```
## [#N] Title
**Type:** update | fix
**Brainstorming:** 1–2 sentences on why this change was made.
**Prompt:** The actual prompt used.
- bullet list of changes
```

Both entry types require **Brainstorming** and **Prompt** — no exceptions.
