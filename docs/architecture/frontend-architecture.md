# Frontend Architecture

The frontend is a Vue single-page application for importing campaign performance data, deriving portfolio analytics, rendering campaign performance views, and coordinating AI-assisted analysis. The client owns browser-side ingestion, validation feedback, derived dashboard state, provider connection state, AI request orchestration, and interactive presentation.

Feature-specific behavior is documented separately:

- [Data Transfer](../features/data-transfer.md)
- [Campaign Performance](../features/campaign-performance.md)
- [AI Connection](../features/ai-connection.md)
- [AI Analysis](../features/ai-analysis.md)
- [AI Prompt Architecture](./ai-prompt-architecture.md)

This document describes frontend organization, ownership boundaries, state movement, and conventions. It does not repeat feature-level business rules.

## Overview

The frontend turns user-supplied campaign data into an interactive analytics workspace. Its main flows are upload/import, portfolio analysis, channel-scoped exploration, AI provider connection, and AI-assisted interpretation.

Client responsibilities include:

- parsing and validating uploaded CSV files before they affect analytics state
- deriving portfolio, channel, campaign, and benchmark views from accepted data
- coordinating page-level state across otherwise independent features
- rendering loading, empty, error, review, success, cache, and stale states
- managing session-scoped provider connection and selected model state
- protecting AI calls through client-side cache, cooldown, cancellation, and fallback behavior
- keeping UI state aligned with active portfolio and channel selection

The client should not become the source of truth for durable credentials, cross-session persistence, billing, provider account setup, or server-owned security boundaries.

## Tech Stack

- Framework: Vue 3 with Single File Components and Composition API
- Build tooling: Vite
- Language: TypeScript with strict compiler settings
- Routing: Vue Router
- State: Pinia setup stores
- Styling: SCSS, Tailwind utility classes, design tokens, shared theme utilities; dark mode is SCSS-driven via a `data-theme` attribute on `<html>` with token files targeting `[data-theme="dark"]`; Tailwind's `darkMode: 'class'` is present in the configuration but is not the primary theming mechanism
- Charts: Chart.js with Vue Chart.js wrappers and local chart primitives
- Tables: shared table primitives plus feature-level sorting logic
- CSV parsing: Papa Parse
- AI providers: Google Gemini SDK plus Groq-compatible provider requests
- Hashing/cache support: xxhashjs
- Tooling: ESLint, Stylelint, Prettier, vue-tsc

The stack favors browser-native execution, typed boundaries, and feature-level ownership. Shared primitives are local to the app rather than imported from a large component framework, which keeps visual behavior and accessibility conventions under project control.

## Project Structure

The source tree is organized by responsibility:

- `app/src/app` contains application shell code, routing, page-level orchestration, app stores, and cross-feature mapping
- `app/src/features` contains product features with their own UI, stores, types, utilities, and service boundaries
- `app/src/shared` contains domain data types, portfolio analysis logic, reusable composables, and generic utilities
- `app/src/ui` contains reusable interface primitives, layout components, forms, modals, tables, charts, icons, and accessibility helpers
- `app/src/styles` contains global styles, theme tokens, mixins, and utility styles
- `docs` contains durable feature and architecture documentation

Feature directories own behavior specific to a single product area. Shared directories own reusable behavior only after the same need appears across feature boundaries or represents a true domain primitive.

## Feature Architecture

Features are organized around product responsibilities rather than technical layers alone. A feature may contain:

- route-level or view-level containers
- local components for feature-specific rendering
- stores for feature-owned state and derived state
- composables for reusable feature workflows
- utilities for local transformations, validation, sorting, or formatting
- types that define the feature contract

Feature code should stay local until there is a stable reuse case. Shared abstractions should be introduced when they reduce real duplication, protect a domain invariant, or provide a consistent UI primitive across multiple features.

The application-level orchestrator is the intentional exception to feature isolation. It is allowed to compose feature stores and translate lifecycle events between them so feature stores do not import each other directly. This keeps feature boundaries clearer while still allowing the dashboard page to behave as one coherent workflow.

## Dashboard Orchestrator

`useDashboardOrchestratorStore` (`id: 'dashboardOrchestrator'`, located in `app/src/app/stores/`) is the single coordination point between feature stores. Feature stores do not import each other. The orchestrator composes them and owns the flows that cross feature boundaries: AI panel lifecycle, campaign-to-AI context translation, portfolio eviction cleanup, and connection event notifications.

Its exposed surface is narrow by design. The page receives derived computed state and two actions. Internal feature store references are not returned from the store setup function.

### Responsibilities

- Opening and closing the AI panel, coordinating both the connection store and the analysis store in a single call
- Translating current campaign performance state into an AI analysis context object whenever portfolio selection or channel filters change
- Clearing AI analysis cache when a portfolio is removed from the portfolio store
- Dispatching toast notifications when a connection event occurs while the AI panel is closed

### AI Panel Lifecycle

`openAiPanel()` calls `aiConnection.openPanel()` then `aiAnalysis.onPanelOpen()`. `closeAiPanel()` calls `aiConnection.closePanel()` then `aiAnalysis.onPanelClose()`. Both stores must update on panel transitions: the connection store owns panel visibility state, the analysis store uses it to gate automatic refresh and request cancellation. All panel transitions must go through the orchestrator — no caller should reach the feature stores directly.

### Context Translation

A watcher on `mapAnalysisContext(campaignPerformance)` runs immediately on setup and re-runs on every campaign performance state change. It calls `onAnalysisContextChange`, which forwards the result to `aiAnalysis.setAnalysisContext()`.

`mapAnalysisContext` reads from the campaign performance store and returns a flat object shaped to `AiAnalysisRequestContext`:

| Field | Value |
| --- | --- |
| `portfolioId` | Active portfolio ID, or `null` when no portfolio is loaded |
| `portfolioTitle` | Portfolio name |
| `selectedChannelIds` | Copy of the selected channel IDs array |
| `channelCount` | Number of selected channels when filters are active; total channel count otherwise |
| `campaignCount` | Number of campaigns in the current filtered or unfiltered view |
| `filtersActive` | `true` when at least one channel filter is selected |
| `portfolioAnalysis` | `PortfolioAnalysis` derived from the active channel selection |
| `portfolioBenchmark` | Unfiltered `PortfolioSummary` when filters are active; `undefined` otherwise |
| `businessContext` | Portfolio `BusinessContext` (period + optional industry), or `null` when no portfolio is loaded |

Before forwarding, `onAnalysisContextChange` checks that both `portfolioId` and `businessContext` are non-null. If either is missing, it calls `aiAnalysis.setAnalysisContext(null)`, which clears AI analysis state. This prevents the analysis store from operating on a partial or mismatched context.

### Portfolio Eviction

A watcher on `portfolioStore.lastEvictedId` fires when a portfolio is deleted. If the ID is non-null, the orchestrator calls `aiAnalysis.clearCacheForPortfolio(id)` to remove cached responses for that portfolio. The AI analysis store does not read portfolio store state directly, so this cleanup path is the orchestrator's responsibility.

### Connection Event Notifications

A watcher on `aiConnection.lastConnectionEvent` fires after each connection attempt. If the event is null, or if the AI panel is currently open, no toast is shown — the panel already surfaces connection feedback inline. When the panel is closed, a successful event produces a success toast with the provider name; a failed event produces an error toast with a hint to reopen the panel for details. This prevents duplicate feedback for users who complete a connection with the panel visible.

### Exposed Surface

| Computed | Source | Purpose |
| --- | --- | --- |
| `hasCampaigns` | `portfolioStore.portfolios.length > 0` | Controls whether the dashboard renders the upload placeholder or the campaign view |
| `aiPanelOpen` | `aiConnection.aiPanelOpen` | Controls the drawer open state on the page |
| `showAiButton` | `!aiConnection.aiPanelOpen` | Hides the AI button in the header while the panel is open |
| `showConnectedDot` | `aiConnection.isConnected && !aiConnection.aiPanelOpen` | Shows the connected indicator on the AI button only when the panel is closed |

Actions: `openAiPanel()`, `closeAiPanel()`.

## Data Flow and State

Data flow is staged so invalid or stale data does not leak into downstream views:

1. CSV input is parsed and validated in the Data Transfer feature
2. Accepted rows become a portfolio input payload
3. The portfolio store creates the active portfolio, channel map, and derived analysis state
4. Campaign Performance reads the active portfolio and derives filtered views from channel selection
5. The dashboard orchestrator maps the current performance context into AI analysis context
6. AI Analysis evaluates cache and readiness before issuing provider requests
7. AI responses are rendered only if they still match the active request context and expected UI state

Portfolio state is shared domain state. Feature stores should read it through stable portfolio and analysis contracts rather than by reaching into upload internals.

Loading and error state should be owned close to the workflow that creates it. Upload parsing errors belong to Data Transfer, campaign empty states belong to Campaign Performance, connection errors belong to AI Connection, and stale AI result states belong to AI Analysis.

Cache state is session-scoped and tied to the context that produced it. AI cache entries should not be reused across different portfolios, providers, or channel selections.

## AI UI Integration

AI UI is split between connection readiness and analysis execution:

- AI Connection owns provider choice, API key readiness, model discovery, selected model state, model exhaustion, and disconnect cleanup
- AI Analysis owns prompt execution, result rendering, cache lookup, stale-result behavior, request cancellation, and tab-level refresh eligibility
- The dashboard orchestrator owns panel open/close coordination and plain context handoff from campaign performance into AI analysis

AI result rendering must distinguish between fresh, cached, stale, loading, blocked, token-limited, and error states. These states should be visible enough for users to understand whether they are seeing new provider output, reused output, or an unavailable analysis path.

Provider errors should be normalized before they reach UI copy. UI code should render stable application states rather than branch on provider-specific response shapes.

Fallback behavior should preserve useful results when safe. If a refresh fails and a matching previous result exists, the UI may keep that result visible with stale context instead of replacing useful information with an error-only state.

## Conventions

Naming should communicate ownership and boundary:

- feature stores use `use<Feature>Store`
- composables use `use<WorkflowOrCapability>`
- shared domain utilities use domain language rather than UI language
- emitted events use camelCase
- exported barrels should support clean feature imports without hiding ownership

Imports should use configured aliases:

- `@app` for app shell, routing, orchestration, and app-level stores
- `@features` for feature modules
- `@shared` for domain logic, domain types, and generic utilities
- `@ui` for design-system primitives and reusable UI infrastructure
- `@` only when a narrower alias does not fit

Component boundaries should stay narrow:

- containers coordinate data and workflow
- presentational components render props and emit intent
- shared UI primitives avoid feature-specific business logic
- feature components may depend on feature types and local stores
- cross-feature communication goes through app-level orchestration or shared domain contracts

TypeScript should model feature boundaries explicitly. Prefer typed domain payloads, discriminated states, and narrow utility functions over untyped objects passed through many layers.

Shared abstractions should be introduced conservatively. A second use case is a signal to consider sharing; a stable contract and clear ownership are required before moving code out of a feature.

## Future Improvements

- Add testing coverage for shared UI primitives, feature workflows, AI state transitions, and upload-to-analysis flows
- Add accessibility validation for modals, navigation, tables, drawers, and chart alternatives
- Add frontend observability for cache behavior, AI lifecycle events, validation outcomes, and user-visible failures
- Add performance profiling for CSV parsing, portfolio recomputation, chart rendering, and AI context mapping
- Add bundle analysis and stronger state-machine coverage around AI orchestration and disconnect cleanup
