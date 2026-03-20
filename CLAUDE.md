# CLAUDE.md — Marketing Campaign Dashboard

## Project Context

An MBA assignment project: a web-based interactive dashboard for analyzing marketing campaign performance. Users upload campaign data via CSV and get KPI visualizations, channel comparisons, and AI-powered budget optimization recommendations via Google Gemini.

**Status:** Not yet scaffolded — Vue project setup pending.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API) |
| Build Tool | Vite |
| Styling | Tailwind CSS v3 + SCSS |
| Charts | Chart.js + vue-chartjs |
| CSV Parsing | PapaParse |
| AI | Google Gemini API (free tier) |

---

## Architecture

> To be filled in after scaffolding.

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
- [ ] KPI Cards: Total Budget, Revenue, ROI, CTR, CVR, CAC
- [ ] Bar chart: ROI by campaign
- [ ] Donut chart: Budget allocation by channel
- [ ] Grouped bar chart: Revenue vs Budget by channel
- [ ] Conversion Funnel: Impressions → Clicks → Conversions
- [ ] Campaign table: sortable by any column
- [ ] Channel filters (Paid Search, Social, Email, Display, Video, Organic, Affiliate) — real-time updates

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
