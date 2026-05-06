# Software Architecture

Marketing Intelligence Dashboard is a browser-based system for importing campaign data, deriving portfolio performance insights, exploring campaign performance, and adding AI-assisted interpretation on top of deterministic analytics.

The system supports:

- campaign data import
- portfolio analysis
- campaign performance exploration
- AI provider connection
- AI-assisted executive summaries
- AI-assisted budget optimization

The architecture is frontend-centered, with deterministic analytics and AI orchestration executed in the client. The frontend owns CSV ingestion, validation feedback, portfolio analytics state, interactive exploration, session-scoped AI connection state, AI request orchestration, and rendering of fresh, cached, stale, and error states. External AI providers remain outside the application boundary.

## Overview

The application turns uploaded campaign performance reports into a portfolio analysis workspace. Raw campaign rows are accepted only after client-side parsing and validation. Accepted data is converted into domain state, analyzed deterministically, and then rendered through campaign performance views.

AI features operate downstream of deterministic analysis. They receive curated portfolio context and derived signals rather than raw uploads, so AI output assists interpretation instead of replacing application-owned metric calculation.

The system boundary is intentionally explicit:

- deterministic analytics are owned by the application
- AI providers are external dependencies
- provider metadata and responses are normalized before use
- runtime validation decides whether parsed or generated data is accepted
- session state is not durable credential storage

## Architecture Principles

- Feature-based organization: product areas own their UI, state, types, utilities, and workflow-specific behavior
- Normalized domain data: accepted uploads are transformed into stable portfolio, channel, campaign, and analysis contracts before downstream use
- Derived analytics before AI interpretation: metrics, benchmarks, classifications, and optimization signals are computed before prompts are built
- Schema-constrained AI outputs: prompts request predictable response shapes, but runtime validation remains the final acceptance authority
- Provider abstraction: provider-specific APIs, metadata, and response behaviors are normalized behind application-owned contracts
- Client-side validation and safeguards: invalid uploads, invalid AI responses, stale requests, exhausted models, and unsafe state transitions are blocked or downgraded before affecting visible state
- Conservative shared abstractions: code becomes shared only when reuse is stable, ownership is clear, and the abstraction protects a real boundary or invariant

## System Components

- Frontend application: Vue single-page application shell, routing, layout, dashboard orchestration, and global notifications
- Feature modules: product areas for data transfer, campaign performance, AI connection, AI analysis, and prompt-backed AI workflows
- Shared domain analytics layer: portfolio analysis, channel mapping, metric derivation, classification, ranking, and signal generation
- AI provider integration layer: provider connection, model discovery, model normalization, request execution, provider error normalization, and model availability handling
- Prompt generation layer: versioned prompt construction for model selection, executive summaries, and budget optimization
- Validation/parsing layer: CSV parsing, file validation, row validation, duplicate detection, response-shape checks, and identifier integrity rules
- Session cache and request orchestration: AI cache keys, cooldowns, request cancellation, stale-result fallback, and model fallback across ranked candidates

Each component owns a different failure boundary. Parsing failures block import, analytics failures should not be delegated to AI, provider failures should not corrupt deterministic dashboard state, and invalid AI output should not become trusted application data.

## Data Flow

1. User imports campaign CSV data
2. Data is parsed and validated
3. Accepted rows become portfolio input
4. Portfolio analysis derives metrics and benchmarks
5. Campaign performance views render filtered insights
6. AI context is built from derived analytics
7. Provider/model is selected
8. AI prompt executes
9. Response is validated
10. UI renders fresh, cached, stale, or error state

The flow is staged so each downstream layer receives a stronger contract than the layer before it. Raw input becomes validated campaign data, validated campaign data becomes portfolio state, portfolio state becomes derived analytics, and derived analytics becomes prompt context.

## Domain Data and Analytics

Raw uploads are not treated as final analytics state. They are temporary input until parsing, validation, normalization, and duplicate handling complete.

Portfolio analysis creates the stable domain layer used by the rest of the app. It owns derived metrics, channel aggregation, portfolio benchmarks, campaign classifications, allocation signals, concentration signals, and optimization candidates.

Channel and campaign views read from stable domain contracts. Filtering changes the scope of analysis, but it does not change the source portfolio or require raw file data to be reinterpreted.

AI prompts consume derived signals rather than recomputing metrics. This keeps deterministic calculations inside the application and reduces the risk of inconsistent AI-generated math.

## AI System Boundary

AI providers are external dependencies. They can fail, return malformed output, change model availability, enforce provider-specific quotas, or produce inconsistent language even when prompt structure is stable.

Provider payloads are normalized before prompts or analysis workflows consume them. Model selection ranks compatible text-generation candidates based on application needs rather than provider ordering alone.

Prompts produce schema-constrained responses for model selection, executive summaries, and budget optimization. Prompt compliance improves reliability but is not trusted as the final acceptance boundary; runtime validation decides whether responses are accepted.

AI output assists interpretation. It does not replace deterministic analytics, upload validation, portfolio analysis, or business-rule enforcement.

## Reliability and State Management

State changes are guarded by validation boundaries:

- imported rows must validate before entering portfolio state
- duplicate campaign/channel rows must be resolved or skipped before import
- portfolio replacement rebuilds derived analysis state from the accepted payload
- AI analysis waits for provider, model, portfolio context, and tab-specific readiness
- provider responses must match the active request context before they can update UI state
- invalid AI output is rejected rather than partially rendered

AI cache keys are tied to portfolio, provider, selected model context, and channel-selection context. Cached results should not cross portfolio or provider boundaries.

Cooldowns and request cancellation protect the app from request bursts, stale overwrites, and unnecessary token usage. If a refresh fails and a matching prior result exists, the UI may keep the stale result visible rather than replacing useful information with an error-only state.

Provider errors are normalized into application-level states. UI code should render those states instead of branching on raw provider payloads.

## Security and Privacy Boundaries

The client should not own durable credentials. User-supplied API keys are session connection input, not portfolio data, analytics data, or durable application state.

API keys and session credentials should be scoped carefully. They should not be copied into logs, prompt payloads, cache records, portfolio objects, or user-visible analysis output.

Logs should avoid sensitive business data and secrets. Operational logging should focus on event categories, validation outcomes, prompt version, provider/model identifiers, cache behavior, and request lifecycle metadata.

Provider calls should receive only the context needed for the requested AI task. Prompt inputs should prefer derived summaries and signals over unnecessary raw data.

## Documentation Map

- [Frontend Architecture](./frontend-architecture.md)
- [AI Prompt Architecture](./ai-prompt-architecture.md)
- [AI Connection](../features/ai-connection.md)
- [AI Analysis](../features/ai-analysis.md)
- [Data Transfer](../features/data-transfer.md)
- [Campaign Performance](../features/campaign-performance.md)

## Future Improvements

- Add stronger runtime validation for AI response payloads and schema evolution
- Add integration tests for import, portfolio analysis, filtering, AI connection, cache reuse, fallback behavior, and disconnect cleanup
- Add backend-owned credential storage if the product needs durable provider connections
- Add observability for validation outcomes, portfolio recomputation, AI request lifecycle, provider fallback, cache behavior, and user-visible failures
- Add performance profiling for CSV parsing, portfolio analysis, chart rendering, AI context mapping, and prompt payload size
- Add clearer provider fallback strategies for quota exhaustion, unsupported models, preview models, and transient provider failures
