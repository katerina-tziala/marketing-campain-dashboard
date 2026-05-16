# AI Analysis

AI Analysis generates provider-backed insights from the active portfolio analysis context. It owns the execution flow for Executive Summary and Budget Optimization, including prompt execution, per-tab opt-in, caching, automatic refresh rules, request cancellation, model-limit fallback, and error state handling.

The feature depends on AI Connection for provider credentials and selected model readiness. It depends on Campaign Performance for the current portfolio analysis context. It does not own provider connection, model discovery, raw campaign validation, or portfolio metric computation.

## Tabs

The feature presents two tabs: **Summary** and **Optimization**, in that order.

**Summary** (Executive Summary) appears first. It provides a portfolio-level overview — health score, key insights, priorities, risks, and growth outlook — before the user sees any prescriptive recommendations. This order ensures the optimization recommendations in the second tab are evaluated against the context already established by the first.

**Optimization** (Budget Optimizer) appears second. It provides budget reallocation and expansion recommendations derived from the portfolio analysis signals surfaced in the Summary tab.

## Feature Responsibilities

AI Analysis is responsible for:

- generating executive summaries for the current portfolio or selected channel subset
- generating budget optimization recommendations from portfolio analysis signals
- requiring explicit user opt-in before a tab can refresh automatically
- protecting provider calls through cache reuse, debounce, cooldown, cancellation, and model fallback
- clearing analysis state when the AI provider disconnects or portfolio data is removed

## Functional Requirements

- Users must manually trigger each AI analysis tab before that tab can auto-refresh
- Executive Summary and Budget Optimization must maintain independent opt-in state
- The system must generate analysis only when a provider, API key, selected model, portfolio context, and campaign data are available
- Budget Optimization must require at least 5 campaigns before analysis can run
- The system must reuse cached results for matching portfolio, provider, and channel-selection contexts
- The system must auto-refresh only the active opted-in tab when context or model changes require fresh analysis
- The system must protect provider calls with request cancellation, model fallback, and stale-result fallback

## Non-Functional Requirements

- AI calls must be minimized to control token usage, latency, provider cost, and rate-limit exposure
- Automatic refresh must never occur before a user explicitly opts into that specific tab
- Cache lookup must be deterministic for the same portfolio, provider, and selected channel set
- Refresh safeguards must prevent request bursts, stale overwrites, and repeated calls to exhausted models
- Error states must preserve useful prior results whenever possible
- Disconnecting must clear cached analysis state so stale provider/model assumptions do not survive the session

## Processing Flow

1. The dashboard provides the active portfolio analysis context, business context, selected channel IDs, and optional unfiltered portfolio benchmark
2. The user manually runs either Executive Summary or Budget Optimization
3. The selected tab becomes eligible for future automatic refresh
4. The feature checks provider readiness, campaign availability, tab-specific constraints, cache availability, cooldown, and token-limit state
5. If a valid cache exists, the cached response is shown without calling the provider
6. If no valid cache exists, the feature builds the tab-specific prompt from the current analysis context
7. The prompt is sent to the selected provider model
8. Successful responses are timestamped, annotated with model metadata, displayed, and cached
9. Failed responses fall back to stale cache when available; otherwise the tab enters an error state

## Feature Flow

Each tab starts in a manual state. Running Executive Summary does not enable automatic Budget Optimization, and running Budget Optimization does not enable automatic Executive Summary.

After a tab has been manually run once, later revisits follow the automatic refresh rules below. This keeps the first provider call intentional while still allowing the tool to stay current once the user has opted in.

When the AI panel opens, only the active tab is evaluated. Tabs without opt-in or matching cached results remain idle.

When channel filters or selected model change, only the active opted-in tab is eligible for refresh.

When switching tabs, stale in-flight work is cancelled and the newly active tab is evaluated according to its own opt-in and cache state.

## Automatic Refresh Rules

Automatic refresh is allowed only when all of these are true:

- the AI panel is open
- the active tab has been manually run before, or a cached result has been restored for that tab
- a provider, API key, selected model, portfolio context, and campaign data are available
- the selected tab is not already loading
- the tab-specific constraints are satisfied
- the current cache entry is missing or past its cooldown window
- not all ranked models are exhausted

These rules intentionally prevent silent first-time provider calls. They also reduce token usage by preferring cache restoration, debouncing filter changes, and enforcing cooldown windows before repeated calls for the same context.

## Caching and Token Protection

Caching is scoped by portfolio, provider, and selected channel set. The unfiltered portfolio has its own cache entry, and each filtered channel selection has a separate cache entry.

The cache exists to:

- avoid paying token and latency cost for repeated identical analysis requests
- keep results available when a refresh fails
- support fast tab revisits
- prevent filter toggles from repeatedly sending equivalent prompts
- preserve the last visible result when cancelling stale requests

Each successful response receives a cooldown window. During that window, matching contexts reuse the cached response instead of calling the provider again. This is intentionally conservative because AI prompts can be large and provider limits may be low for some accounts or models.

If a provider returns a token or quota limit error, the selected model is marked unavailable. The feature attempts to continue with the next available ranked model. If every model is exhausted, the feature shows cached results when possible or enters a token-limit error state.

Only one analysis request should be active across tabs at a time. When a new request would conflict with an existing one, the stale request is cancelled and the prior visible result is preserved when available. Cancelled provider responses are ignored if they return later.

## Validation Logic

AI Analysis validates execution readiness and analysis constraints, not raw campaign input.

- Provider connection must be available before analysis can run
- A selected model must be available before analysis can run
- Portfolio analysis context must exist before analysis can run
- The current context must contain at least one campaign
- Budget Optimization requires at least 5 campaigns because small datasets do not support meaningful reallocation recommendations
- Cached responses must match the active portfolio, provider, and channel-selection context
- Provider responses must belong to the current active request before they can update visible state
- Token-limited models must be excluded from later attempts in the same connection session

These rules protect provider quotas, reduce misleading output, and keep AI responses aligned with the currently visible dashboard context.

## Budget Optimization Output

When Budget Optimization runs successfully, the response always includes a `summary`, a `recommendations` array, an `expansions` array, and a `noRecommendationReason` field.

### No-recommendation state

When both `recommendations` and `expansions` are empty, the portfolio has no actionable optimization opportunities in the current context. This is a valid, expected outcome — not an error.

In this state the UI shows a "No Optimization Opportunities Identified" info notification. The body of that notification comes from `noRecommendationReason`:

- **`noRecommendationReason` is a non-null string**: the model provides an explanation for why no recommendations were generated. This string is shown verbatim as the notification body.
- **`noRecommendationReason` is null**: the model returned no explanation. The UI falls back to: "No optimization opportunities identified at this time."

`noRecommendationReason` is typed as `string | null` on `BudgetOptimizerOutput`. Null is a valid provider response. Both values produce a complete user-facing state.

## State Handling

- Idle: no analysis has been requested for the tab, or the tab has no result for the current context
- Loading: a provider request is in progress for the active tab
- Done: a valid AI response is available for the tab
- Done with stale notice: a previous response is shown because refresh failed
- Error: no valid response is available and the request could not complete
- Token limit: all available models are exhausted and no fresh analysis can run
- Min-campaigns: Budget Optimization is blocked because the selected context has fewer than 5 campaigns
- Panel closed: in-flight analysis requests are cancelled and loading tabs revert to prior visible state
- Portfolio switch: in-flight requests and cooldowns clear; tab opt-in resets for the new dataset
- Disconnect: requests, caches, tab opt-in state, and visible analysis state are cleared

## Edge Cases

- Cached results can make a tab eligible for later automatic refresh without a new first-run request
- If a matching cache exists after a filter change, no provider call is made
- If every model is exhausted, analysis remains disabled until connection state changes
- If portfolio data is deleted, cached analysis for that portfolio is removed

## Limitations

- AI outputs depend on provider availability, model behavior, account quotas, and response quality
- Cached results are session-scoped and are not durable across reloads unless another persistence layer is added
- Cache keys are based on portfolio, provider, and channel selection, not on every possible prompt implementation detail
- Automatic refresh applies only to the active tab
- Budget Optimization is unavailable for contexts with fewer than 5 campaigns
- Model fallback is limited to the ranked model list from the current connection session
- The feature does not estimate token usage before sending a prompt
- The feature does not let users manually choose whether an automatic refresh should use cache or force a provider call

## Future Improvements

- Add visible cache status and last-refresh metadata per tab
- Add manual "refresh anyway" controls when a cached result is still within cooldown
- Persist analysis cache per portfolio with explicit invalidation rules
- Add token usage estimates before sending large prompts
- Add configurable auto-refresh preferences per tab
- Add request observability for provider, model, latency, cache hit, cache miss, and fallback events
- Add retry policies that distinguish transient provider failures from invalid responses
- Add tests covering per-tab opt-in, cache hits, cooldown behavior, stale-result fallback, model fallback, request cancellation, and portfolio cleanup
