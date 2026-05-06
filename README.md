<h1>
  <img src="./app/src/assets/logo-long.svg" alt="" width="32" />
  Marketing Intelligence Dashboard
</h1>

Marketing Intelligence Dashboard is a browser-based analytics application for importing campaign performance data, exploring portfolio health, and generating AI-assisted executive summaries and budget optimization recommendations.

The project demonstrates frontend architecture, domain modeling, data validation, chart-heavy analytics UI, and practical LLM integration with provider abstraction, caching, fallback behavior, and schema-constrained outputs.

## Project Snapshot

- Built as a Vue 3 + TypeScript single-page application
- Imports campaign performance CSV files directly in the browser
- Converts validated campaign data into portfolio, channel, and campaign analytics
- Visualizes ROI, budget allocation, revenue efficiency, funnels, and scaling opportunities
- Connects to Google Gemini or Groq with user-provided API keys
- Selects and ranks compatible provider models before enabling AI analysis
- Generates AI-assisted executive summaries and budget optimization recommendations from derived analytics
- Uses session-scoped caching, cooldowns, cancellation, and model fallback to reduce unnecessary AI calls

<!--
## Product Preview
TODO: Add product screenshots or demo captures:
- Empty state with CSV upload entry point
- CSV validation review with row-level issues or duplicate resolution
- Campaign performance dashboard with KPIs, charts, and channel filters
- Campaign detail table with sorting
- AI provider connection panel
- Executive Summary AI result
- Budget Optimization AI result
- Cached or stale AI result state, if useful
-->

## Core Capabilities

### Data Transfer

- CSV import with file, header, row, metric, and duplicate validation
- Partial import support when valid rows can be safely used
- Duplicate detection by normalized campaign and channel
- Replacement flow for refreshing the active portfolio dataset

### Campaign Performance

- Portfolio-level KPI summaries
- Channel-scoped filtering and benchmark-aware analysis
- Chart views for ROI, budget share, revenue allocation, conversion funnel, and scaling opportunities
- Sortable campaign detail table for operational review

### AI Connection

- Google Gemini and Groq provider support
- Session-scoped API key connection
- Compatible text-generation model discovery
- Model ranking for analytical reasoning, summarization, budget optimization, and structured output reliability
- Model exhaustion handling and fallback across ranked candidates

### AI Analysis

- Executive Summary generation for portfolio or selected-channel context
- Budget Optimization recommendations with allocation reasoning and expected impact
- Per-tab manual opt-in before automatic refresh
- Cache-before-provider behavior to reduce token usage
- Stale-result fallback when refresh fails
- Request cancellation to prevent stale AI responses from overwriting current UI state

## Engineering Highlights

- Feature-based architecture with clear ownership boundaries
- Shared domain analytics layer for portfolio metrics, classifications, rankings, and optimization signals
- App-level orchestration that coordinates features without direct feature-to-feature store coupling
- Strict TypeScript settings and typed domain contracts
- Reusable UI primitives for forms, modals, tables, charts, drawers, tabs, badges, and notifications
- Provider abstraction for AI connection, model discovery, prompt execution, and error normalization
- Prompt architecture based on structured rule groups, versioned configs, and schema-constrained responses
- Runtime validation remains the acceptance boundary for imported data and generated AI output

## Tech Stack

- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router
- Tailwind CSS + SCSS
- Chart.js + vue-chartjs
- Papa Parse
- Google Gemini
- Groq

## Architecture Docs

- [Software Architecture](./docs/architecture/software-architecture.md)
- [Frontend Architecture](./docs/architecture/frontend-architecture.md)
- [AI Prompt Architecture](./docs/architecture/ai-prompt-architecture.md)

## Feature Docs

- [Data Transfer](./docs/features/data-transfer.md)
- [Campaign Performance](./docs/features/campaign-performance.md)
- [AI Connection](./docs/features/ai-connection.md)
- [AI Analysis](./docs/features/ai-analysis.md)

## Getting Started

The application lives in the `app/` folder.

### Install

```bash
cd app
npm install
```

### Development

```bash
npm run dev
```

The local development server runs at `http://localhost:5173` by default.

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## CSV Input

Campaign imports use CSV files with campaign, channel, budget, impressions, clicks, conversions, and revenue fields. See [Data Transfer](./docs/features/data-transfer.md) for validation rules, duplicate handling, and import behavior.

## AI Provider Notes

Marketing Intelligence Dashboard supports Google Gemini and Groq through user-provided API keys. Provider connection state is session-scoped, and AI analysis uses cache, cooldown, cancellation, stale-result fallback, and ranked model fallback to avoid unnecessary provider calls.
