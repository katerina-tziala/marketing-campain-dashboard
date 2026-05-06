
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
