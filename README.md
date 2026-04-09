# Marketing Campaign Dashboard

A web-based interactive dashboard for analyzing marketing campaign performance. Upload your campaign data via CSV and instantly visualize KPIs, compare channels, and get AI-powered budget optimization recommendations.

## Features

### Campaign Performance Dashboard

- **KPI Cards:** Total Budget, Revenue, ROI, CTR, CVR, CAC
- **Charts:**
  - Bar chart: ROI by campaign
  - Donut chart: Budget allocation by channel
  - Grouped bar chart: Revenue vs Budget by channel
  - Conversion Funnel: Impressions → Clicks → Conversions
- **Campaign Table:** Sortable by any column, all metrics visible at a glance
- **Channel Filters:** Filter by any channel — channels are extracted dynamically from the data, the entire dashboard updates in real-time

### CSV Upload & Template

- **Download CSV Template:** One click to download a ready-made CSV with correct columns and 21 demo campaigns. Use it as-is for a quick demo or replace with your own data.
- **Empty State:** When no data is loaded, the app shows two clear options: "Download Template" and "Upload CSV"
- **Drag & Drop** or file picker upload
- **Auto-detection** of columns (case-insensitive; extra columns are silently ignored)
- **Error Handling:** All errors are surfaced inline — no separate error screens.
  - *Wrong file type:* Caught immediately on file selection or drop — only `.csv` files are accepted
  - *File too large:* Files over 2 MB are rejected with a message under the dropzone
  - *Empty file:* A CSV with headers but no data rows is rejected
  - *Missing columns:* Lists every missing column by name (e.g. `budget, revenue`) and prompts to consult the template
  - *Invalid rows:* A structured table shows the row number, column name, and specific issue for every validation failure. If some rows are valid, the user can choose to **proceed with the valid rows** or go back and fix the file

### AI Budget Optimizer (Gemini / Grok)

- Sends campaign data to AI provider (Google Gemini or Grok) for analysis
- Returns structured results: executive summary, recommendations with confidence badges, top performers, underperformers with action badges (Reduce / Pause / Restructure), quick wins with effort level, correlations, and risks with mitigations
- Each recommendation includes reallocation amount, expected revenue/conversion impact, new ROI estimate, timeline, and success metrics
- Confidence score for each recommendation (High / Medium / Low)
- User enters their own API key in the AI Tools panel — supports Google Gemini and Grok (xAI)
- **Connect** button with live verification before use
- Currently uses mock responses for UI development (5 scenarios cycle on each Analyze click)

### Executive Summary Generator (AI)

- Returns structured results: portfolio health score (0-100 with Excellent/Good/Needs Attention/Critical labels), bottom line summary, key metrics dashboard (8 metrics in grid), typed insights with emoji icons and metric highlights, numbered priority actions with urgency badges, channel summary with status indicators and budget share, and data correlations
- Uses the same AI provider connection as the Budget Optimizer (Gemini or Grok)
- Currently uses mock responses for UI development (5 scenarios cycle on each Summarize click)


## Getting Started

The app lives in the `app/` folder.

### Install dependencies

```bash
cd app
npm install
```

### Run in development mode

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

---

## Tech Stack

- **Vue.js 3** (Composition API): frontend framework
- **Vue Router 4**: client-side routing
- **Pinia**: state management (official Vue 3 store)
- **Chart.js** + **vue-chartjs**: charts & data visualization
- **Tailwind CSS v3** + **SCSS**: styling with custom theme and dark mode
- **PapaParse**: CSV parsing
- **Google Gemini API**: AI-powered recommendations (free tier)
- **Vite**: build tool and dev server


## CSV Format

The CSV file should include the following columns:

| Column | Type | Description |
|---|---|---|
| campaign | string | Campaign name |
| channel | string | Channel (e.g. Paid Search, Social, Email, Display, Video, Organic, Affiliate) |
| budget | number | Cost in EUR |
| impressions | number | Total impressions |
| clicks | number | Total clicks |
| conversions | number | Total conversions |
| revenue | number | Revenue in EUR |