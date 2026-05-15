---
name: Project Context
description: Marketing Intelligence Dashboard — MBA project, full status, key architecture facts, latest log entries
type: project
originSessionId: 639d9e4c-681f-4f4d-af28-648955043fb7
---
Full project context, architecture, tech stack, feature checklist, and workflow rules are all in `CLAUDE.md` at the project root. Read it at the start of every session.

**Memory location:** All memory files live in `.claude/memory/` inside the project. Read `.claude/memory/MEMORY.md` at session start. Always write new memories here — never to `~/.claude/projects/...`.

**Key facts:**
- MBA assignment — `docs/vibe-coding-logs.md` is the project log; every entry matters
- Vue 3 + TypeScript + Vite + Pinia + Chart.js + Tailwind CSS v3, dark-only theme
- Feature-based `app/src/` architecture: `app/`, `shared/`, `ui/`, `features/`
- All major features fully implemented; documentation phase complete; latest log entry is **#694**
- PapaParse for CSV parsing; Google Gemini + Groq APIs for AI analysis
- Current branch: `chore/documentation-and-polishing`

**What is fully built:**
- CSV upload flow with full error/duplicate handling and metadata form (name, period, industry)
- Campaign Performance dashboard: KPI cards, ROI/Budget/Revenue/Funnel charts, channel filters, sortable campaign table (flat and grouped by channel)
- AI Tools panel: provider connection (Gemini + Groq), Budget Optimizer tab, Executive Summary tab — full request/cache/cooldown/fallback flow
- Toast system, modal ARIA, responsive drawer, theme system
- Full documentation suite: `docs/architecture/` (software-architecture, frontend-architecture, ai-prompt-architecture) and `docs/features/` (data-transfer, campaign-performance, ai-connection, ai-analysis); SVG diagrams in `docs/assets/`

**Portfolio domain at `@/shared/portfolio`:**
- `usePortfolioStore` lives in `shared/portfolio/portfolio.store.ts` (not in `app/stores/`)
- Entity is `Portfolio` with `.name` field (not `title`, not `PortfolioEntry`)
- `Portfolio`, `PortfolioInput`, `BusinessContext`, `PortfolioKPIs`, `PortfolioAnalysis`, `PortfolioSummary` all exported from `@/shared/portfolio`
- `shared/portfolio/analysis/` contains all analysis/classification/signals logic

**Why:** Portfolio domain grew complex enough to warrant its own barrel module that also owns the store.
**How to apply:** Always import portfolio types and `usePortfolioStore` from `@/shared/portfolio`, never from `@/app/stores`.

**AI analysis context types (current):**
- `AiAnalysisContext` — slim prompt-level context: `{ analysis, businessContext, portfolioBenchmark? }`
- `AiAnalysisRequestContext` — full orchestrator context with `portfolioId`, `selectedChannelIds`, `portfolioAnalysis`, `portfolioBenchmark?`, `businessContext`
- `autoRefreshEnabled: ref<Record<AiAnalysisType, boolean>>` — per-tab opt-in flag (replaced global `analysisActivated`; `firstAnalyzeCompleted` removed from TabState)

**Recent changes (entries #681–#694):**
- Entry #681–#692: chart polish — `ChartLegend` custom legend with `borderColor` support; `showLegend` prop on all chart wrappers; `useCampaignPerformanceTheme` wired to all chart components; `RevenueVsBudgetBars` and `EfficiencyGapBars` attrs plumbing cleaned up; `GroupedBarChart` wrapper div restored
- Entry #693: `modalFullHeight?: boolean` prop added to `ResponsiveDrawer` (default false — when true applies `calc(100dvh - 3rem)` to mobile modal); enabled for AI Assistant drawer in `DashboardPage.vue`
- Entry #694: four 10-channel CSV samples added to `samples/csv/valid/` (good/excellent/needs-attention/critical); executive-summary prompt `config.v1.ts` updated with ROI/share decimal ratio semantics and binding health-score calibration rules
