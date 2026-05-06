
## [#201] DashboardHeader enhancements — channels detail, disabled AI button, connected dot, camelCase emit

**Type:** update

**Summary:** Added a third detail item showing selected/total channel counts, disabled the AI button when the panel is open, added a connected indicator dot on the button when AI is connected and the panel is closed, and renamed the emitted event to camelCase (aiClick).

**Brainstorming:** The channel filter already lives in the dashboard header area, so surfacing the active channel count in the details line gives users immediate context at a glance. Disabling the button when the panel is open is semantically correct — the button stays visible and communicates it is not actionable, relying on the existing `.btn :disabled` rule (cursor-not-allowed, opacity-50). The connected dot is hidden when the panel is open so it only appears when the panel is closed and there is something to signal. Using camelCase for the emit name (aiClick) is the new project convention; Vue auto-converts to/from kebab-case in templates so consumers can use either form.

**Prompt:** Dashboard header output to camelCase and follow this convention from now on. Add third detail item displaying number of selected channels of number of all channels. Disable the AI button if panel open. When AI connected and panel closed show a connected dot on top right of the button.

**What changed:**

- `app/src/features/dashboard/components/DashboardHeader.vue` — imported aiStore; renamed emit from ai-click to aiClick; added selectedChannelCount computed (equals availableChannels.length when no filter active); added third .detail-item for channels; wrapped button in .ai-btn-wrapper (relative positioning context); added `:disabled="aiStore.aiPanelOpen"` on AI button; added showConnectedDot computed (isConnected && !aiPanelOpen); added .connected-dot/.connected-status span (absolute top-right, bg-success)
- `app/src/features/dashboard/DashboardView.vue` — updated event listener from @ai-click to @aiClick
- `CLAUDE.md` — updated DashboardHeader.vue architecture description

**Key decisions & why:**

- selectedChannelCount shows availableChannels.length when nothing is filtered — "13 of 13 channels" is more informative than "0 of 13"; matches the mental model of the channel filter where no selection = all shown
- Native disabled over CSS class — prevents click events at the browser level; exposes correct semantics to assistive technology; no new styles needed since `.btn :disabled` already handles visual treatment
- Connected dot hidden when panel open — the dot signals "click here to open the AI panel"; when the panel is already open the signal is redundant and clutters the disabled button
- camelCase emit convention — going forward all emits in this project use camelCase

## [#202] Data Transfer README documentation

**Type:** documentation

**Summary:** Created and refined `docs/data-transfer.md` into a behavior-focused feature README for the Data Transfer flow. The document now describes system responsibilities, validation guarantees, upload semantics, CSV requirements, duplicate handling, state behavior, constraints, and future improvements without coupling the README to volatile component or function names.

**Brainstorming:** The first draft documented the feature accurately but read partly like QA acceptance criteria and partly like implementation notes. The documentation was progressively reshaped toward system behavior: what the feature guarantees, why validation rules exist, how data integrity is protected, and what operational constraints apply. Implementation-heavy details such as component topology, exact parser configuration, TypeScript payload snippets, function choreography, and duplicate-key code were removed so the README survives future refactors.

**Prompt:** Read all files in the data transfer folder and create `docs/data-transfer.md` documenting the feature. Then polish it by reducing repetition, tightening wording, removing UI-level noise, separating validation from outcomes, adding functional and non-functional requirements, and keeping the README focused on system behavior, business rules, data flow, architectural boundaries, and operational constraints.

**What changed:**

- `docs/data-transfer.md` — added a complete Data Transfer feature README
- Replaced the original click-by-click user flow with stable system sections: Feature Responsibilities, Validation Pipeline, Functional Requirements, Non-Functional Requirements, Upload Flow, CSV Format, Validation Logic, Validation Outcomes, Duplicate Resolution, State Handling, Edge Cases, Limitations, and Future Improvements
- Added CSV ingestion responsibilities and validation boundaries, including browser-side processing, portfolio-store handoff, partial import behavior, replacement semantics, and invalid-row exclusion
- Added validation rules for required campaign fields, positive budget, non-negative revenue, non-negative funnel integers, and funnel hierarchy constraints
- Added functional requirements describing observable behavior and business guarantees
- Added non-functional requirements covering browser-side processing, deterministic import behavior, validation-before-analytics, responsive imports up to 2 MB, and reset behavior on replacement
- Reduced repeated mentions of the downloadable CSV template so it remains a secondary capability rather than the central feature

**Key decisions & why:**

- Behavior over topology — the README now documents durable guarantees rather than Vue component wiring that may change
- Validation intent over implementation trivia — rules explain analytics integrity, such as positive budget being required for ROI and CPA calculations
- Requirements added after the pipeline — this makes the document useful both as engineering documentation and as a lightweight feature contract
- Duplicate behavior centralized — duplicate semantics are explained once in the Duplicate Resolution section instead of being repeated across flow, states, and edge cases
- Template behavior de-emphasized — Data Transfer is primarily CSV ingestion and validation; template download is helpful but secondary

## [#203] Data Transfer duplicate detection refinement

**Type:** implementation

**Summary:** Refined duplicate detection so campaigns are treated as duplicates only when both campaign name and channel match after normalization. Updated duplicate-review state keys and copy so same-named campaigns in different channels can be imported independently while true duplicate campaign/channel rows still require resolution.

**Brainstorming:** The original duplicate detection grouped rows by campaign name alone. That was too broad because marketing campaigns can legitimately share a name across channels. The implementation needed to match the documentation and domain model: duplicate detection should run only after row validation, use normalized values, and compare campaign plus channel. Updating the grouping key also required adjusting duplicate-review selection state so groups with the same campaign name in different channels do not collide.

**Prompt:** Detect duplicates by same name and same channel. Refine duplication logic and update the document. Simplify `getDuplicateKey` by lowercasing both items and appending them together. Update duplicate messaging from "campaign/channel pairs" back to campaign-focused copy where appropriate.

**What changed:**

- `app/src/features/data-transfer/utils/detect-campaign-duplication.ts` — changed duplicate grouping from normalized campaign name only to normalized campaign name plus channel
- `app/src/features/data-transfer/types/index.ts` — added duplicate-group metadata for a stable group key and channel name
- `app/src/features/data-transfer/components/data-validation/review-duplications/CampaignDuplicationsTable.vue` — changed duplicate selection state to use the stable group key instead of campaign name, preventing collisions across channels
- `app/src/features/data-transfer/components/data-validation/shared/DuplicateSummary.vue` — changed duplicate summary text back to campaign-focused wording
- `app/src/features/data-transfer/utils/error-messages.ts` — changed the duplicate validation message to "Some campaigns appear more than once in the file"
- `docs/data-transfer.md` — aligned duplicate-resolution documentation with campaign/channel matching and normalized duplicate behavior

**Key decisions & why:**

- Campaign plus channel is the duplicate identity — same campaign names can be legitimate across different acquisition channels
- Normalized matching — casing and surrounding whitespace should not produce separate campaign/channel identities
- Stable group key for selection state — avoids UI selection collisions when the same campaign name appears in multiple channels
- User-facing copy stays campaign-focused — the implementation is channel-aware, but concise copy is easier for users to understand in validation summaries
- Invalid rows stay outside duplicate detection — duplicates are only evaluated after row validation so users resolve importable data, not already-rejected rows

## [#204] Campaign Performance README documentation

**Type:** documentation

**Summary:** Added `docs/campaign-performance.md` as a behavior-focused feature README for Campaign Performance. The document explains the feature boundary, responsibilities, analytical rules, channel filtering semantics, visual analysis outputs, table behavior, state transitions, edge cases, limitations, and future improvements without turning the README into a component inventory.

**Brainstorming:** The documentation needed to describe the system guarantees behind the performance dashboard rather than list Vue files or internal method calls. The feature sits downstream of Data Transfer, so the README makes that boundary explicit: Campaign Performance assumes validated campaign data and focuses on analytical derivation, filtering, benchmarking, classification, and presentation. The validation section was renamed to Analytical Rules because the feature does not validate raw input; it defines metric semantics and analytical invariants.

**Prompt:** Write a concise, maintainable README for Campaign Performance as a principal software engineer. Document purpose, responsibilities, logic, behavior, processing rules, flow, requirements, state transitions, edge cases, limitations, and future improvements. Avoid component inventory, framework internals, unnecessary code structure, fluff, and step-by-step UI narration. Also explain the chart types and campaign table sorting behavior.

**What changed:**

- `docs/campaign-performance.md` — added a new Campaign Performance feature README
- Documented feature responsibilities, including portfolio performance presentation, KPI derivation, channel-scoped filtering, benchmark preservation, channel grouping, sortable campaign detail, and reset behavior when the active portfolio changes
- Added functional and non-functional requirements for deterministic metric derivation, consistent filtered analysis, safe empty states, stable ordering, benchmark behavior, and separation from ingestion validation
- Added processing flow from validated portfolio records through performance metrics, channel grouping, summaries, classification groups, derived signals, and rendered analytical views
- Added feature flow covering unfiltered analysis, selected-channel analysis, all-channel filter collapse, and portfolio replacement behavior
- Added Visual Analysis Outputs covering ROI by channel, revenue versus budget by channel, ROI by campaign, budget share by campaign, conversion funnel, and scaling opportunities
- Added campaign detail table documentation, including displayed fields and sorting by every displayed column with revenue descending as the default
- Renamed validation-oriented wording to Analytical Rules to better reflect metric semantics and analytical guarantees

**Key decisions & why:**

- Behavior over implementation — the README focuses on stable feature guarantees rather than component names or store method choreography
- Explicit feature boundary — Campaign Performance starts after Data Transfer validation and should not own CSV integrity rules
- Analytical Rules over Validation Logic — the feature defines metric semantics, safe ratio behavior, share efficiency, and allocation gaps rather than raw input validation
- Chart documentation at the outcome level — chart types are described by the questions they answer, not by implementation components
- Table behavior included because it is observable analysis functionality — sorting changes how users inspect campaign performance and is part of the feature contract

## [#205] AI Connection README documentation

**Type:** documentation

**Summary:** Added `docs/ai-connection.md` as a behavior-focused feature README for AI Connection. The document explains supported providers, connection responsibilities, model discovery and selection, provider error handling, connection state transitions, model exhaustion behavior, limitations, and future improvements without documenting component topology or internal method choreography.

**Brainstorming:** AI Connection needed documentation at the system-boundary level because it sits between user-supplied provider credentials and downstream AI analysis features. The important behavior is not which UI component submits the key, but what the feature guarantees: only supported providers can connect, an API key is required, compatible text models are discovered and ranked before analysis is enabled, connection failures remain disconnected, and disconnect clears both provider and analysis state. The model-selection section was kept explicit because provider/model choice directly affects AI output quality and availability.

**Prompt:** Write `ai-connection.md` following the feature documentation prompt. Also explain supported providers and the flow for model selection. Keep the README concise, maintainable, behavior-focused, and free of unnecessary implementation details.

**What changed:**

- `docs/ai-connection.md` — added a new AI Connection feature README
- Documented supported providers: Google Gemini and Groq
- Added feature responsibilities for provider/API key connection, model discovery, compatible model ranking, selected-model readiness, model availability tracking, and safe disconnect behavior
- Added functional and non-functional requirements covering connection readiness, provider errors, model selection, disabled evaluation states, deterministic model selection, and disconnection cleanup
- Added processing flow from provider selection through model discovery, model ranking, selected-model assignment, connected state, and normalized failure handling
- Added a Model Selection Flow section covering compatible text-generation model filtering, analytics-oriented ranking criteria, strongest-model default selection, and fallback when model limits are reached
- Added state handling for disconnected, connecting, connected, connection error, selected-model exhaustion, all-model exhaustion, panel close, and user disconnect states
- Added edge cases, limitations, and future improvements for provider access, model availability, quotas, credential handling, manual model selection, and additional provider support

**Key decisions & why:**

- Supported providers called out explicitly — provider availability is a stable product boundary and affects user setup expectations
- Model selection documented as behavior — ranking and fallback are core system guarantees for AI analysis quality and resilience
- Requirements compressed after review — repeated model discovery, evaluation, ranking, and strongest-model wording was consolidated so the README stays scannable
- Error handling documented by category — normalized provider failures are more maintainable to document than specific request internals
- Credential boundary made explicit — API keys are connection input, not portfolio data or analysis output

## [#206] AI analysis per-tab auto-refresh opt-in

**Type:** implementation

**Summary:** Changed AI analysis auto-refresh behavior so each tab requires its own explicit first run before automatic refresh is allowed. Executive Summary and Budget Optimization now opt into automatic refresh independently, preventing one tab's manual run from enabling automatic execution on the other tab.

**Brainstorming:** The previous implementation had a global activation flag for AI analysis. That meant once any AI tab had been manually triggered, the other tab could auto-run on revisit or context change even if the user had never explicitly opted into that feature. The desired behavior is clearer and safer: each AI feature requires one manual run before it can refresh automatically. This keeps user intent local to the feature while preserving useful automatic updates after opt-in.

**Prompt:** Update AI analysis flow so Summary and Optimization both require a manual first run, while later revisits allow auto-refresh. The rule should be: each AI feature requires one explicit opt-in before it becomes automatic.

**What changed:**

- `app/src/features/ai-tools/ai-analysis/stores/aiAnalysis.store.ts` — replaced the global `analysisActivated` flag with per-tab `autoRefreshEnabled` state
- `app/src/features/ai-tools/ai-analysis/stores/aiAnalysis.store.ts` — manual analysis now enables auto-refresh only for the requested tab
- `app/src/features/ai-tools/ai-analysis/stores/aiAnalysis.store.ts` — automatic tab evaluation, channel-filter refresh, and model-change refresh now require the active tab's opt-in flag
- `app/src/features/ai-tools/ai-analysis/stores/aiAnalysis.store.ts` — portfolio switches and disconnects reset both tab opt-in flags
- `app/src/features/ai-tools/ai-analysis/stores/aiAnalysis.store.ts` — restored cached results now re-enable auto-refresh for that specific tab, treating cached visibility as a later revisit
- `app/src/features/ai-tools/ai-analysis/utils/tab-state.ts` — removed the redundant first-analysis completion flag
- `app/src/features/ai-tools/ai-analysis/executive-summary/ExecutiveSummaryAnalysis.vue` — summary action label now depends on the summary tab's opt-in state
- `app/src/features/ai-tools/ai-analysis/budget-optimization/BudgetOptimizationAnalysis.vue` — optimization action label now depends on the optimization tab's opt-in state

**Key decisions & why:**

- Per-tab opt-in over global activation — Summary and Optimization are separate AI features and should not grant automatic behavior to each other
- Manual first run remains required — first execution is an explicit user choice before provider cost, latency, or token usage begins
- Cached results count as later revisits — if a tab already has a valid visible result, refreshing that tab automatically is consistent with revisit behavior
- Portfolio switch resets opt-in — a new dataset changes the analysis context enough to require fresh explicit intent
- Disconnect resets opt-in — provider/model state is no longer valid, so automatic analysis should not survive disconnection

## [#207] AI Analysis README documentation

**Type:** documentation

**Summary:** Added `docs/ai-analysis.md` as a behavior-focused feature README for AI Analysis. The document explains Executive Summary and Budget Optimization responsibilities, per-tab manual opt-in, automatic refresh rules, caching, cooldowns, request cancellation, stale-result fallback, model-limit fallback, state transitions, edge cases, limitations, and future improvements.

**Brainstorming:** AI Analysis needed documentation that explains why the feature is intentionally conservative with provider calls. The important behavior is not the internal store wiring, but the safeguards: first runs are manual, auto-refresh is per-tab, cache is checked before provider calls, filter updates are debounced, matching cached results avoid token usage, stale results are preserved when refresh fails, and exhausted models are skipped before another provider call is attempted. The documentation was then tightened by making Automatic Refresh Rules and Caching and Token Protection the source-of-truth sections to reduce repetition.

**Prompt:** Document the AI Analysis feature. Describe the flow for automatic updates, caching, limitations, and why those safeguards exist so the app does not exhaust tokens when calling AI. Follow the principal-engineer feature documentation prompt and avoid unnecessary implementation detail.

**What changed:**

- `docs/ai-analysis.md` — added a new AI Analysis feature README
- Documented the feature boundary: AI Analysis depends on AI Connection for provider/model readiness and Campaign Performance for portfolio analysis context
- Added feature responsibilities for executive summaries, budget optimization, per-tab opt-in, cache reuse, debounced refreshes, request cancellation, model fallback, stale-result fallback, and disconnect cleanup
- Added functional and non-functional requirements focused on safe provider usage, token protection, cache determinism, per-tab opt-in, and avoiding stale overwrites
- Added processing and feature flows describing manual first runs, later automatic refresh, active-tab-only evaluation, panel open behavior, filter changes, model changes, and tab switches
- Added Automatic Refresh Rules as the source of truth for when automatic provider calls are allowed
- Added Caching and Token Protection as the source of truth for cache scope, cooldowns, stale-result fallback, cancellation, and model exhaustion behavior
- Added validation/readiness rules, state handling, edge cases, limitations, and future improvements
- Reduced repeated invariant statements by consolidating duplicated opt-in, cache-before-provider, active-tab refresh, cancellation, model fallback, and stale-result behavior

**Key decisions & why:**

- Manual first run is explicit opt-in — avoids silent token usage, latency, and provider cost before user intent is clear
- Per-tab opt-in is documented as a core guarantee — Summary and Optimization can have different cost/value expectations
- Cache-before-provider is central — repeated identical contexts should not trigger unnecessary AI calls
- Cooldowns and debounce are documented as token protection — filter changes and revisits can otherwise create request bursts
- Stale results are preserved intentionally — a previous useful answer is better than replacing it with an error when refresh fails
- Model fallback is part of resilience — token or quota limits should try the next ranked model before failing the feature

## [#208] AI Prompt Architecture documentation

**Type:** documentation

**Summary:** Added `docs/ai-prompt-architecture.md` as a high-level technical document for the application's AI prompt pipeline. The document explains model selection, executive summary generation, budget optimization, provider normalization, schema-constrained outputs, runtime validation boundaries, reliability safeguards, and prompt versioning strategy without exposing raw production prompts.

**Brainstorming:** The AI prompt system needed documentation above the feature README level because multiple AI features share the same architectural concerns: provider abstraction, normalized inputs, strict response contracts, derived analytics signals, token efficiency, and runtime validation. The document was written to describe design rationale and operational guarantees rather than prompt text. Later refinements clarified that LLM content is probabilistic even when output structure is constrained, added provider normalization as its own architectural boundary, and made runtime validation the explicit final authority for trusting responses.

**Prompt:** Generate high-level technical documentation for the AI-powered marketing analytics application. Explain the architecture, design rationale, prompt engineering strategy, and system behavior for model selection, executive summary generation, and budget optimization. Do not reproduce exact prompts line-by-line. Include system overview, prompt architecture, model selection strategy, executive summary strategy, budget optimization strategy, reliability and safety mechanisms, and versioning and iteration strategy.

**What changed:**

- `docs/ai-prompt-architecture.md` — added a new AI prompt architecture document
- Added System Overview covering why multiple prompt types exist and how prompts interact with normalized provider/model data and portfolio analysis context
- Added Provider Normalization Strategy explaining why raw provider payloads are normalized before prompt evaluation
- Added Prompt Architecture covering reusable rule groups, scoped reasoning, schema-constrained responses, provider abstraction, modularity, and versioning
- Added AI Model Selection Prompt Strategy covering candidate normalization, text-model filtering, ranking methodology, scoring logic, identifier integrity, metadata derivation, token optimization, unstable-model handling, and machine-validated output
- Added Executive Summary Prompt Strategy covering executive-level summarization, scoped analysis, concise communication, derived-signal grounding, unsupported-inference reduction, and output constraints
- Added Budget Optimization Prompt Strategy covering allocation goals, tradeoff analysis, constrained budget logic, recommendation consistency, explainability, and no-recommendation behavior
- Added Reliability and Safety Mechanisms covering schema validation, identifier validation, duplicate prevention, ranking consistency, provider-agnostic abstractions, token efficiency, authoritative derived analytics signals, and runtime acceptance boundaries
- Added Versioning and Iteration Strategy covering prompt versioning, regression testing, prompt evolution, logging, backward compatibility, and prevention of silent behavioral drift

**Key decisions & why:**

- High-level architecture over raw prompts — the documentation should explain durable system behavior without exposing production prompt text or becoming stale after prompt wording changes
- Provider normalization is a first-class boundary — normalized candidate models reduce provider coupling, prompt branching, and token usage
- Structurally deterministic wording — avoids implying that LLM content is fully reproducible while still documenting stable response-shape guarantees
- Runtime validation as final authority — prompt compliance alone is not trusted; application-side validation owns response acceptance
- Derived analytics signals stay authoritative — LLMs interpret precomputed metrics instead of becoming alternate calculation engines
- Versioning is operational, not cosmetic — versioned prompts make behavior reviewable and reduce silent drift in downstream product features
