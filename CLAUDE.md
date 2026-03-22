# CLAUDE.md — Marketing Campaign Dashboard

## Project Context

An MBA assignment project: a web-based interactive dashboard for analyzing marketing campaign performance. Users upload campaign data via CSV and get KPI visualizations, channel comparisons, and AI-powered budget optimization recommendations via Google Gemini.

**Status:** Campaign Performance Dashboard implemented — app lands directly on the dashboard, Pinia store, charts module, and dark theme in place. Empty state component planned for when CSV upload is added.

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
| CSV Parsing | PapaParse |
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
│   │   └── campaignStore.ts    # Pinia store — campaigns, filters, KPIs, derived state
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
│   │   └── index.ts            # Barrel export for the full ui library
│   ├── shell/
│   │   └── AppShell.vue            # Top-level layout wrapper — header + main slot
│   ├── features/
│   │   └── dashboard/              # Dashboard feature folder
│   │       ├── DashboardView.vue   # Campaign performance dashboard — loads at /
│   │       └── components/         # Components owned by this view
│   │           ├── KpiCard.vue         # Single KPI metric card
│   │           ├── CampaignTable.vue   # Sortable campaign data table
│   │           └── ChannelFilter.vue   # Multi-select channel filter pills
│   ├── App.vue                 # Root component — AppShell + RouterView
│   ├── main.ts                 # Entry point — registers Pinia, Router, Chart.js
│   └── style.scss              # Global styles: Tailwind directives, CSS theme tokens, dark mode
├── index.html
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
- [ ] Download CSV template (12 demo campaigns)
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

1. **New feature:** Brainstorm → get approval → build → update README + CLAUDE.md + LOGS.md
2. **Bug fix / small update:** Fix → update CLAUDE.md if relevant → update LOGS.md (short entry)
3. **Refactor / architecture change:** Discuss → get approval → change → update CLAUDE.md + README + LOGS.md
4. **Language:** English only in all code and documentation files
