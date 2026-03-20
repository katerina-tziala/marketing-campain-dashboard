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
- **Channel Filters:** Filter by channel (Paid Search, Social, Email, Display, Video, Organic, Affiliate) — the entire dashboard updates in real-time

### CSV Upload & Template

- **Download CSV Template:** One click to download a ready-made CSV with correct columns and 12 demo campaigns. Use it as-is for a quick demo or replace with your own data.
- **Empty State:** When no data is loaded, the app shows two clear options: "Download Template" and "Upload CSV"
- **Drag & Drop** or file picker upload
- **Auto-detection** of columns (campaign, channel, budget, clicks, etc.)
- **Data Preview** before importing
- **Error Handling:**
  - Wrong file type (e.g. .xlsx, .pdf instead of .csv)
  - Empty file or file too large (limit 5MB)
  - Missing required columns
  - Non-numeric values in numeric fields or negative values
  - Friendly error messages with link to download the template

### AI Budget Optimizer (Gemini)

- Sends campaign data to Google Gemini API for analysis
- Returns budget reallocation recommendations in natural language
- Explains reasoning (e.g. "Move 20% of Display budget to Email which has 5x better ROI")
- Confidence score for each recommendation (High / Medium / Low)
- User enters their own Gemini API key in Settings
- **Test Connection** button to verify the key works before use
- If no key is provided, AI features appear disabled with a message: "Enter your API key in Settings to enable AI features"
- Instructions and link to get a free Gemini API key from Google AI Studio

### Executive Summary Generator (AI)

- One button generates an AI-powered summary in 3-5 bullets
- Natural language overview for executives (e.g. "Email channel has the best ROI at 2,133% but receives only 4% of total budget")
- Highlights top and underperforming campaigns
- Uses the same Gemini API connection as the Budget Optimizer


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
- **Chart.js** + **vue-chartjs**: charts & data visualization
- **Tailwind CSS v3** + **SCSS**: styling with custom theme configuration
- **PapaParse**: CSV parsing
- **Google Gemini API**: AI-powered recommendations (free tier)
- **Vite**: build tool and dev server
