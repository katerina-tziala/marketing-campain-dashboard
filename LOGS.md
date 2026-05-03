# Vibe Coding Log — Marketing Campaign Dashboard

Development log for the project. Every feature built, bug fixed, refactoring done, and architecture decision made is recorded here.


## [#1] Project Setup
**Type:** architecture

**Summary:** Defined the project scope, tech stack, and development workflow. Created foundational documentation files (README, CLAUDE.md, LOGS.md) before scaffolding begins.

**Brainstorming:** Decided to document the full process from the very start — before any code exists — so the MBA submission captures the entire development journey including planning decisions. CLAUDE.md serves as the living spec and progress tracker; LOGS.md captures reasoning and iterations for each step.

**Prompt:** Create CLAUDE.md and LOGS.md based on the README. Set up ongoing workflow rules for every type of interaction (feature, fix, refactor).

**What was built:**
- `CLAUDE.md` — project context, tech stack table, full feature checklist with checkboxes, architecture section (to be filled post-scaffold), workflow rules
- `LOGS.md` — this file; vibe coding log for MBA submission

**Key decisions & why:**
- Separate CLAUDE.md from LOGS.md — CLAUDE.md is the living spec (state of the project at any moment), LOGS.md is the historical record (how we got there)
- Feature checklist in CLAUDE.md — makes it easy to track progress at a glance and check off items as they're built
- Log format distinguishes Full Entry vs Short Entry — keeps the log readable without burying small fixes in the same detail as major features


[Entries 2-600 preserved from original log...]


## [602] Update Budget Optimizer schema with new recommendation and expansion types
**Type:** update

**Summary:** Expanded Budget Optimizer schema to include recommendation types (reallocation | reduction), channel information, nullable impact fields, a new expansions array, and noRecommendationReason field. Updated sample responses and component rendering to support the full schema.

**Brainstorming:** The Budget Optimizer had a simplified schema with only recommendations. The new design separates reallocation (budget movement between campaigns/channels) from reduction (budget cuts), adds channel tracking alongside campaigns, makes impact metrics nullable (since not all impacts can be estimated), introduces growth expansions as a distinct section, and allows communicating why no recommendations exist. This gives the AI more nuance in how it structures optimization suggestions and the UI more flexibility in presenting different recommendation types. Sample data now covers the full spectrum: aggressive reallocation, conservative with expansions, seasonal pivot, no-recommendations with reason, and no-recommendations without reason.

**Prompt:** Update BudgetOptimizerOutput interface to add: type (reallocation | reduction) on recommendations, fromChannel and toChannel (nullable), nullable expectedImpact fields, expansions array (targetCampaign nullable, targetChannel required, additionalBudget, reason, expectedImpact, confidence, executionRisk), and noRecommendationReason (string | null). Update sample responses with 5 realistic scenarios. Update BudgetOptimizationAnalysis.vue to render the full schema inline: separate recommendations and expansions sections, with a no-recommendations info state for null recommendations + expansions with fallback message.

**What changed:**
- `features/ai-tools/ai-analysis/types/output.types.ts` — added `ExpectedImpact` interface with nullable fields; updated `BudgetRecommendation` with `type` union, `fromChannel`, nullable `toCampaign`/`toChannel`, and `ExpectedImpact` type; added `BudgetExpansion` interface; updated `BudgetOptimizerOutput` to add `expansions: BudgetExpansion[]` and `noRecommendationReason: string | null`
- `features/ai-tools/sample-data/budget-optimization.ts` — updated all 5 sample responses: aggressiveReallocation now has full channel/type info; conservativeOptimization includes 1 recommendation + 1 expansion; seasonalPivot has 3 reallocations + no expansions; added noRecommendationsWithReason (reason provided); added noRecommendationsNoReason (null reason, falls back to default); all recommendations include type and channel fields
- `features/ai-tools/ai-analysis/budget-optimization/BudgetOptimizationAnalysis.vue` — completely restructured component: renders summary, then separate Recommendations section (loops recommendations with type badge, flow detail, metrics, confidence/risk badges), then Expansions section (loops expansions with budget badge, channel detail, metrics, badges), then no-recommendations info state when both arrays empty (shows noRecommendationReason or default fallback message); added scoped SCSS for recommendation/expansion item styling, badges, metrics grid, and type-based colors (reallocation=info, reduction=warning, expansion=success)

**Key decisions & why:**
- Separate `fromChannel` and `toChannel` from campaign names — channel info was implicit before; making it explicit clarifies multi-channel reallocations and allows expansions to target specific channels without tied campaigns.
- Nullable impact fields — not all recommendations have estimable revenue/conversion changes; null lets the AI indicate uncertainty without forcing fake zero values.
- `noRecommendationReason: string | null` — allows the AI to explain why no recommendations exist (saturation, risk, lack of signal) or remain silent when obvious; null triggers a sensible app-level fallback.
- Expansions as separate array, not just recommendations with null from — expansions are structurally different (target-outward vs reallocate-inward) and deserve their own collection and rendering section for clarity.
- All rendering inline in BudgetOptimizationAnalysis — user requested dumping everything in one component for now; component refactoring deferred to later.
- Type badge colors: info for reallocation (neutral move), warning for reduction (caution), success for expansion (growth).
- Metrics grid: responsive layout (auto-fit minmax 150px) so small screens stack, larger screens show 2-3 per row.


## [603] Update Executive Summary schema with new output structure
**Type:** update

**Summary:** Replaced the Executive Summary output schema with a richer structure: added scope, overview, and growthOutlook fields; renamed insights to executiveInsights and priorityActions to keyPriorities (with new shape); replaced correlations with keyRisks. Updated types, sub-components, orchestrator, sample data, and prompt schema to match.

**Brainstorming:** The previous schema was functional but thin — priorityActions carried urgency and successMetric which pushed too much tactical detail into the AI output, and correlations were a weak section that rarely produced useful patterns. The new schema separates strategic priorities (title/rationale/expectedOutcome) from execution detail, replaces correlations with keyRisks (which are more decision-relevant at the executive level), and adds overview (narrative context) and growthOutlook (forward-looking label + reasoning). scope is added as a machine-readable field so the UI or prompt can reflect whether the analysis covers the full portfolio or a filtered subset. The sub-component changes were minimal by design: Correlations.vue was repurposed for keyRisks (same card pattern, added severity badge), PriorityActions.vue updated to the new keyPriority shape, Insights.vue got a title prop for flexibility, and ExecutiveSummaryAnalysis.vue wires all new fields inline.

**Prompt:** Update Executive Summary output schema to add scope, overview, growthOutlook; rename insights to executiveInsights; rename priorityActions to keyPriorities with new shape (title/rationale/expectedOutcome); replace correlations with keyRisks (risk/severity/implication). Update interfaces, sub-components, sample data, and prompt schema. No component deletions.

**What changed:**
- `features/ai-tools/ai-analysis/types/output.types.ts` — added RiskSeverity, GrowthOutlookLabel, PortfolioScope types; added KeyPriority, KeyRisk, GrowthOutlook interfaces; removed PriorityAction, ExecutiveCorrelation, ActionUrgency; updated ExecutiveSummaryOutput with scope, overview, executiveInsights, keyPriorities, keyRisks, growthOutlook
- `features/ai-tools/ai-analysis/executive-summary/Insights.vue` — added optional title prop with computed sectionTitle; template uses :title binding instead of hardcoded string
- `features/ai-tools/ai-analysis/executive-summary/PriorityActions.vue` — complete rewrite to KeyPriority shape: prop renamed to priorities, renders title/rationale/expectedOutcome; urgency badge and successMetric removed; CardHeader now shows priority number + strategic title
- `features/ai-tools/ai-analysis/executive-summary/Correlations.vue` — repurposed as key risks renderer: prop renamed to risks (KeyRisk[]), imports RiskSeverity, adds severity badge (info/warning/danger) in CardHeader, renders risk title + implication
- `features/ai-tools/ai-analysis/executive-summary/ExecutiveSummaryAnalysis.vue` — wires renamed props (:priorities, :insights, :risks), adds overview paragraph below bottomLine, adds growthOutlook section inline below risks
- `features/ai-tools/sample-data/executive-summary.ts` — all 5 samples rewritten to new schema: scope added, overview added, insights → executiveInsights, priorityActions → keyPriorities (title/rationale/expectedOutcome), correlations → keyRisks with severity, growthOutlook added; removed strength/reason fields from AiModel mocks to match current type
- `features/ai-tools/prompts/executive-summary-prompt2.ts` — OUTPUT_SCHEMA updated to new shape; INSIGHT RULES renamed to EXECUTIVE INSIGHT RULES; PRIORITY ACTION RULES replaced with KEY PRIORITY RULES (title/rationale/expectedOutcome); CORRELATION RULES replaced with KEY RISK RULES + GROWTH OUTLOOK RULES; OUTPUT SHAPE updated to list all 8 fields; noise-control deduplication rule updated to reference new field names

**Key decisions & why:**
- keyPriorities drops urgency and successMetric — these are execution-level details that belong in project management, not an executive AI summary; title/rationale/expectedOutcome is a cleaner strategic frame.
- keyRisks replaces correlations — correlations rarely passed the quality bar (required multi-entity patterns, often empty); risks are more universally useful and directly decision-relevant at executive level.
- growthOutlook as a structured field (label + reasoning) rather than prose — gives the UI a discrete label to render distinctly (e.g. colored badge) while the reasoning provides the narrative.
- scope as a top-level field — allows the response itself to declare whether it covers the full portfolio or a subset, which is more reliable than inferring it from the UI state at render time.
- Correlations.vue repurposed rather than replaced — same card layout pattern works for risks with a severity badge added; avoids creating a new file for a structurally equivalent component.


## [604] Raise Budget Optimizer minimum campaign threshold from 2 to 5
**Type:** update

**Summary:** Increased `MIN_OPTIMIZER_CAMPAIGNS` from 2 to 5 so the Budget Optimizer only runs when there is enough campaign variety to produce meaningful reallocation recommendations.

**Brainstorming:** A 2-campaign minimum was too permissive — the optimizer's value comes from cross-campaign and cross-channel reallocation analysis, which requires enough data points to identify meaningful patterns. With only 2–4 campaigns the output would likely be thin or low-confidence. 5 aligns with the ROI vs Budget Scaling chart's own minimum (also `MIN_CAMPAIGNS=5`) and reflects the same reasoning: statistical patterns require a meaningful sample.

**Prompt:** Adjust the budget optimization constraint to 5 campaigns. Update any related text.

**What changed:**
- `features/ai-tools/ai-analysis/stores/aiAnalysis.store.config.ts` — `MIN_OPTIMIZER_CAMPAIGNS` changed from `2` to `5`
- `features/ai-tools/ai-analysis/utils/analysis-messages.ts` — error message title updated from "at least 2 campaigns" to "at least 5 campaigns"
- `CLAUDE.md` — status section updated to reflect ≥ 5 threshold

**Key decisions & why:**
- 5 chosen to match the ROI vs Budget Scaling chart's `MIN_CAMPAIGNS` constant — consistent reasoning across features (need sufficient sample for pattern detection) and avoids introducing a new arbitrary number.



## [#605] Refactor AI prompt system into folder-per-prompt architecture with typed rule groups
**Type:** refactor

**Summary:** Extracted all inline prompt strings into typed `PromptRuleGroup` constants organized in `config.ts` files, one per prompt folder; each prompt now lives in its own subfolder (`prompt-name/`) with `config.ts`, `prompt.v1.ts`, and `index.ts` barrel; all three prompts (model evaluation, executive summary, budget optimization) build their output via a `promptSections` array with `.join('\n\n').trim()` instead of template literals; both analysis prompts conditionally select full-portfolio vs subset rule arrays based on `portfolioBenchmark` presence.

**Brainstorming:** The original prompt files mixed string-building logic with prose content, making them hard to read, diff, and extend. The goal was to separate concerns: `config.ts` owns all content as structured typed constants, `prompt.v1.ts` owns only assembly logic (input curation + rule selection + section ordering), and the `index.ts` barrel provides the stable public API. The `PromptRuleGroup` interface (`title`, `preamble?`, `list`, `type`, `notes?`) was already in place — the refactor applied it consistently to all prompts. The `promptSections` array pattern was modelled after the already-refactored model evaluation prompt and applied to executive summary and budget optimization. For subset analysis, a dedicated `SELECTION_ANALYSIS_RULES` array mirrors the full-portfolio rules with "within the selected subset" scoping throughout, plus benchmark-comparison language; the conditional `const analysisRules = portfolioBenchmark ? SELECTION_ANALYSIS_RULES : FULL_PORTFOLIO_ANALYSIS_RULES` is the only branching point in each prompt function.

**Prompt:** Refactor the executive summary and budget optimization prompts to match the folder-per-prompt pattern already in place for model evaluation. For each prompt: create a `prompt-name/` folder; move the prompt file into it as `prompt-name.v1.ts` with updated relative imports; create `config.ts` exporting all rule group constants and `OUTPUT_SCHEMA`; create `index.ts` barrel; update `prompts/index.ts` to import from folder barrels. For executive summary: create `FULL_PORTFOLIO_ANALYSIS_RULES` (10 groups: SCOPE, CRITICAL RULES, ANALYSIS FOCUS, HEALTH SCORE GUIDANCE, EXECUTIVE INSIGHT RULES, KEY PRIORITY RULES, KEY RISK RULES, GROWTH OUTLOOK RULES, NOISE CONTROL, FINAL QUALITY CHECK) and `SELECTION_ANALYSIS_RULES` (same 10 groups, subset-scoped). For budget optimization: create `FULL_PORTFOLIO_OPTIMIZATION_RULES` (9 groups: SCOPE, CRITICAL RULES, DERIVED SIGNAL PRIORITY, RECOMMENDATION RULES, BUDGET CONSTRAINTS, EXPANSION LOGIC, EXPECTED IMPACT, NOISE CONTROL, FINAL QUALITY CHECK) and `SELECTION_ANALYSIS_RULES` (same 9 groups, subset-scoped). In both prompts apply `const analysisRules = portfolioBenchmark ? SELECTION_ANALYSIS_RULES : FULL_PORTFOLIO_ANALYSIS_RULES` and build output via `promptSections` array. Move `OUTPUT_SCHEMA` string out of the prompt function and into `config.ts`. Reformat prompt function body to `promptSections` array pattern.

**What changed:**
- `features/ai-tools/prompts/executive-summary-prompt/config.ts` — created; exports `ROLE_TASK_OBJECTIVE_RULES` (ROLE/TASK/OBJECTIVE), `OUTPUT_SCHEMA` string, `FULL_PORTFOLIO_ANALYSIS_RULES` (10 groups, full portfolio scope), `SELECTION_ANALYSIS_RULES` (10 groups, subset-scoped with benchark comparison language)
- `features/ai-tools/prompts/executive-summary-prompt/executive-summary-prompt.v1.ts` — moved from flat `prompts/` folder; imports updated to `../utils`, `../constants`, `./config`; curates `promptInput` (portfolio, portfolioBenchmark, campaignGroups, channels, channelGroups, subset of derivedSignals); conditional rule selection; `promptSections` array pattern
- `features/ai-tools/prompts/executive-summary-prompt/index.ts` — created; barrel re-exporting `generateExecutiveSummaryPrompt`
- `features/ai-tools/prompts/budget-optimization-prompt/config.ts` — created; exports `ROLE_TASK_OBJECTIVE_RULES` (ROLE/TASK with ordered preamble/OBJECTIVE), `FULL_PORTFOLIO_OPTIMIZATION_RULES` (9 groups), `SELECTION_ANALYSIS_RULES` (9 groups, subset-scoped), `OUTPUT_SCHEMA` string
- `features/ai-tools/prompts/budget-optimization-prompt/budget-optimization-prompt.v1.ts` — moved from flat `prompts/` folder; imports updated to `../utils`, `../constants`, `./config`; curates `promptInput` (portfolio, channels, channelContext, campaignGroups, channelGroups, derivedSignals, portfolioBenchmark); conditional rule selection; `promptSections` array pattern
- `features/ai-tools/prompts/budget-optimization-prompt/index.ts` — created; barrel re-exporting `generateBudgetOptimizationPrompt`
- `features/ai-tools/prompts/index.ts` — updated to import all three generators from folder barrels instead of flat files
- `CLAUDE.md` — architecture section updated: prompts folder now documents all three subfolders with their contents and responsibilities

**Key decisions & why:**
- `config.ts` per folder, not a shared mega-config — each prompt's rules are domain-specific and grow independently; co-locating them with the prompt file makes the relationship explicit and avoids cross-prompt coupling.
- `SELECTION_ANALYSIS_RULES` as a full parallel array rather than a diff/override — merging two nearly-identical arrays at runtime adds complexity for no gain; having two named arrays makes the full content of each mode explicit and readable.
- Conditional rule selection as a single `const` before `promptSections` — keeps the function body clean; all complexity is in naming (FULL vs SELECTION), not in conditionally building the sections array.
- `OUTPUT_SCHEMA` moved to `config.ts` — it is static prose, not logic; co-locating it with the rule groups makes `config.ts` the single file to open when changing either the rules or the expected response shape.
- `promptSections` array pattern (no template literals) — each section is independently readable and reorderable; joining with `\n\n` is explicit and consistent across all three prompts.



## [#606] Add expansions and reduction samples to budget optimizer; create BudgetExpansions component; fix BudgetRecommendations for mixed types
**Type:** update

**Summary:** Populated all budget optimization mock samples with expansions and `reduction` type recommendations to exercise the full schema in UI, created `BudgetExpansions.vue` matching `BudgetRecommendations.vue` in structure and sort logic, fixed `BudgetRecommendations.vue` to handle `reduction` type (null `toCampaign`, null impact metrics, conditional label, type badge), and rewrote `BudgetOptimizationAnalysis.vue` to use both components.

**Brainstorming:** Three problems needed solving together. First, `expansions: []` in most mocks meant the Growth Opportunities section never rendered during dev cycles — added realistic expansion data to mocks 1, 3, and 4. Second, all five mocks used only `reallocation` recommendations — `reduction` type existed in the schema but was never exercised, meaning the UI rendering path for reductions (null `toCampaign`, null impact fields, different budget label) was untested; added `reduction` items to mocks 1 and 3. Third, `BudgetRecommendations.vue` rendered `rec.toCampaign` unconditionally (would show "null"), used `formatPercentage` for ROI (wrong format), and had no null guards on impact metrics — all of which broke with reduction data. The orchestrator also had stale inline raw markup for both sections instead of using the dedicated components.

**Prompt:** Add expansions to all budget optimization sample data (mocks 1, 3, 4 get new expansions; mock 2 already had one; mock 5 stays empty). Add at least one reduction recommendation to mocks 1 and 3 to cover both recommendation types in the UI. Fix BudgetRecommendations.vue to handle reduction type: hide "To" column when toCampaign is null, add null guards on all impact metrics, add a type badge (info for reallocation, warning dimmed for reduction), rename section title from "Reallocation Recommendations" to "Recommendations", conditionalise the budget shift label (Reallocate vs Reduce), fix ROI format from formatPercentage to .toFixed(1)x. Create BudgetExpansions.vue matching BudgetRecommendations.vue structure. Rewrite BudgetOptimizationAnalysis.vue to use both components.

**What changed:**
- `features/ai-tools/sample-data/budget-optimization.ts` — added 1 `reduction` + 2 expansions to `aggressiveReallocation`; added 1 `reduction` to `conservativeOptimization` (CTV Campaign trimmed to holding budget); added 1 `reduction` + 2 expansions to `seasonalPivot`; added 1 expansion to `noRecommendationsWithReason` (Podcast new channel, low confidence); mock 5 unchanged (empty, exercises no-results state); mocks 1, 2, 3 all have at least one reallocation and one reduction
- `features/ai-tools/ai-analysis/budget-optimization/BudgetRecommendations.vue` — section title changed to "Recommendations"; added `typeVariant()` helper + `TYPE_MAP`; added type `Badge` (dimmed) to header badges; "To" column wrapped in `v-if="rec.toCampaign"`; budget label conditionalised (Reallocate/Reduce); ROI format changed to `.toFixed(1)x` with null guard; revenue and conversions wrapped in null-guard `v-if`; removed unused `formatPercentage` import
- `features/ai-tools/ai-analysis/budget-optimization/BudgetExpansions.vue` — created; props: `expansions: BudgetExpansion[]`; sorts by confidence asc then execution risk asc; card: Channel/Campaign header (Campaign column hidden when null), confidence/risk badges, 4-metric grid (Additional Budget, Est. Revenue, Est. ROI, Est. Conversions) with null guards, reason paragraph; `cq-container` + `cq-up(cq-400)` for 2-col metric grid
- `features/ai-tools/ai-analysis/budget-optimization/BudgetOptimizationAnalysis.vue` — rewrote to use `BudgetRecommendations` + `BudgetExpansions`; removed all inline raw markup; extracted `hasNoResults` computed; no logic changes

**Key decisions & why:**
- `reduction` type badge dimmed to distinguish from the primary action without introducing a fourth colour — dimmed warning reads as "caution/downgrade" without competing visually with confidence/risk badges.
- Null impact metrics render `—` rather than hiding the row — keeping all four metric rows present preserves the grid layout and makes it immediately clear that no revenue/conversion estimate was provided.
- Section title changed to "Recommendations" — the section now covers both reallocations and reductions; "Reallocation Recommendations" was no longer accurate.
- `BudgetExpansions.vue` as a separate component — expansion shape (`targetChannel`/`targetCampaign`) differs from recommendation shape (`fromCampaign`/`toCampaign`/`type`); merging would require conditionals throughout both card headers.


## [#607] Split budget optimization UI into Reallocate / Expand / Reduce sections
**Type:** update

**Summary:** Restructured the Budget Optimizer result view to render three named sections in order — Reallocate, Expand, Reduce — instead of a single mixed Recommendations section followed by expansions.

**Brainstorming:** The original layout put all recommendations together and expansions after — ordering was confidence-sorted within a single section. The new requirement separates by intent: reallocations (budget shifts between campaigns) are the primary action and appear first, expansions (new budget opportunities) come next, and reductions (budget cuts) come last. This makes the output easier to scan and act on. The cleanest implementation is to filter in the orchestrator and pass typed subsets to `BudgetRecommendations.vue` with a `title` prop, keeping the card component generic.

**Prompt:** Structure the budget optimization UI as three separate sections in order: Reallocate, Expand, Reduce. Reallocate and Reduce sections reuse BudgetRecommendations.vue filtered by type; Expand stays as BudgetExpansions.vue. Remove the type badge from recommendation cards since the section title makes type redundant.

**What changed:**
- `features/ai-tools/ai-analysis/budget-optimization/BudgetRecommendations.vue` — added `title` prop; changed `AnalysisSection` to use `:title="title"`; removed `TYPE_MAP`, `typeVariant()`, and type `Badge` from card header (redundant with section title)
- `features/ai-tools/ai-analysis/budget-optimization/BudgetOptimizationAnalysis.vue` — added `reallocations` and `reductions` computed (filter `response.recommendations` by type); renders `BudgetRecommendations` twice with titles "Reallocate" and "Reduce" with `BudgetExpansions` in between

**Key decisions & why:**
- Type badge removed from cards — once recommendations are split into titled sections, the badge repeats information already conveyed by the section heading; removing it reduces visual noise.
- Expand section rendered between Reallocate and Reduce — expansions are additive (new budget spend) while reductions are subtractive; grouping the two "spend more/spend differently" actions before the "spend less" action reflects natural decision priority.


## [#608] Create BudgetReductions component; sort reallocations by revenue change
**Type:** update

**Summary:** Created a dedicated `BudgetReductions.vue` component for the Reduce section (simplified card without impact metrics), and sorted reallocations by estimated revenue change descending with nulls last.

**Brainstorming:** Two separate concerns. First, `BudgetRecommendations.vue` was doing double duty for both reallocations and reductions — reductions always have null impact metrics so the four-metric grid was mostly dashes, and the `v-if`/`v-else` null guards added noise. A dedicated component renders only the fields that matter for a reduction: campaign name, budget reduction amount, confidence/risk badges, and reason. Second, reallocations should surface the highest-revenue-impact moves first — sorting by `revenueChange` descending with nulls pushed to the end gives the most actionable item priority position.

**Prompt:** Sort reallocations by revenueChange descending (nulls last). Create a dedicated BudgetReductions.vue component for the Reduce section — simpler card: campaign name, reduce-by amount, confidence/risk badges, reason; no impact metrics grid. Wire it into the orchestrator replacing the second BudgetRecommendations call.

**What changed:**
- `features/ai-tools/ai-analysis/budget-optimization/BudgetReductions.vue` — created; props: `reductions: BudgetRecommendation[]`; sorts by confidence asc then execution risk asc; card: Campaign header + confidence/risk badges, single "Reduce by" metric row, reason paragraph; no 4-metric grid (reductions have no expected impact data)
- `features/ai-tools/ai-analysis/budget-optimization/BudgetOptimizationAnalysis.vue` — `reallocations` computed now sorts by `revenueChange` desc with explicit null handling (nulls last); imports `BudgetReductions`; replaces second `BudgetRecommendations` call with `<BudgetReductions :reductions="reductions" />`

**Key decisions & why:**
- Revenue sort in orchestrator not in `BudgetRecommendations` — the component is generic (title prop, any recommendations array); sort order is a concern of the caller, not the renderer.
- `BudgetReductions` sorts by confidence/risk (same as expansions) rather than revenue — reductions have no revenue impact so confidence is the right primary sort.
- Dedicated component rather than conditional in `BudgetRecommendations` — eliminates four null-guard rows that are never filled for reductions; the card structure is genuinely different enough to warrant separation.


## [#609] Add inferImpactLabel to BudgetReductions cards
**Type:** update

**Summary:** Added `inferImpactLabel` logic and a dimmed badge to each reduction card showing whether the cut saves budget or eliminates waste.

**Brainstorming:** Reductions always have null impact metrics, so the card only showed a budget amount with no qualitative framing. The `inferImpactLabel` function (provided by the user) classifies each reduction as `budget_saved` or `waste_reduced` based on the impact fields. Rendering this as a small dimmed badge inline with "Reduce by" adds context without cluttering the card.

**Prompt:** Add the inferImpactLabel function and ImpactLabel type to BudgetReductions.vue. Show the resulting label as a dimmed badge next to "Reduce by" in each card. Map budget_saved → info, waste_reduced → warning, revenue_gain → success.

**What changed:**
- `features/ai-tools/ai-analysis/budget-optimization/BudgetReductions.vue` — added `ImpactLabel` type, `IMPACT_LABEL_DISPLAY`, `IMPACT_LABEL_VARIANT` maps, `inferImpactLabel(rec)` function; "Reduce by" row changed from `<p>` to `<div>` with a flex left group (label + dimmed `rounded-rectangle-sm` Badge) and right-aligned currency amount

**Key decisions & why:**
- `rounded-rectangle-sm` badge variant — keeps the impact label visually lighter than the confidence/risk badges in the header; small pill shape reads as a qualifier rather than a status.
- `inferImpactLabel` called twice per card in template (once for `v-if`, once for value) — acceptable given the function is pure and cheap; avoids introducing a per-item computed or pre-mapped array.


## [#610] Polish AI analysis result cards and executive summary sections
**Type:** refactor/ui

**Summary:** Refined the AI analysis result layout by adding a raised card variant, anchoring response metadata to the bottom of result panels, replacing the old risk renderer with dedicated executive-summary sections, and tightening badge/card visual hierarchy across the summary and optimizer views.

**Brainstorming:** The executive summary response needed clearer visual hierarchy. The health/overview/bottom-line block is the lead narrative and should read as a raised surface, while key risks and growth outlook are separate sections with their own badge mapping rules. A shared summary-card abstraction was briefly useful while shaping the risk/outlook layout, but growth outlook now needs a different raised treatment, so keeping risk-card structure directly in `KeyRisks.vue` is simpler. Response metadata should behave consistently across analysis tabs: it should sit at the bottom when the panel has extra vertical space, instead of floating immediately after short responses.

**Prompt:** Create dedicated `KeyRisks` and `GrowthOutlook` components for executive summary output. Keep badge variant mapping inside each section. Use secondary cards for key risks, a raised card for growth outlook, add severity sorting and colored left borders for risks, create a raised card variant for the first executive summary section, keep response meta aligned at the bottom, and preserve existing commented code/import context unless explicitly asked to remove it.

**What changed:**
- `features/ai-tools/ai-analysis/executive-summary/KeyRisks.vue` — created/reworked as the dedicated key-risk section component.
- `features/ai-tools/ai-analysis/executive-summary/KeyRisks.vue` — accepts `KeyRisk[]`, owns `RiskSeverity -> BadgeVariant` mapping, and sorts risks `High -> Medium -> Low`.
- `features/ai-tools/ai-analysis/executive-summary/KeyRisks.vue` — renders secondary cards directly instead of delegating to a shared summary-card component.
- `features/ai-tools/ai-analysis/executive-summary/KeyRisks.vue` — adds severity classes (`high`, `medium`, `low`) on risk cards and maps those to colored left borders in scoped styles.
- `features/ai-tools/ai-analysis/executive-summary/GrowthOutlook.vue` — created/reworked as the dedicated growth-outlook section component.
- `features/ai-tools/ai-analysis/executive-summary/GrowthOutlook.vue` — accepts `GrowthOutlook`, owns `GrowthOutlookLabel -> BadgeVariant` mapping, and renders the outlook in a raised card.
- `features/ai-tools/ai-analysis/executive-summary/Correlations.vue` — removed from the active executive-summary flow; risks now have a correctly named component.
- `features/ai-tools/ai-analysis/executive-summary/ExecutiveSummaryAnalysis.vue` — uses `Card variant="raised"` for the lead health/overview/bottom-line section.
- `features/ai-tools/ai-analysis/executive-summary/ExecutiveSummaryAnalysis.vue` — composes `PriorityActions`, `Insights`, `KeyRisks`, and `GrowthOutlook` as separate sections.
- `features/ai-tools/ai-analysis/executive-summary/ExecutiveSummaryAnalysis.vue` — restored preserved commented exploratory summary markup and its imports.
- `features/ai-tools/ai-analysis/executive-summary/Insights.vue` — restored normal-case styling on the metric value so badge capitalization does not affect metric text.
- `features/ai-tools/ai-analysis/executive-summary/PriorityActions.vue` — simplified priority card copy spacing and muted the expected-outcome line.
- `features/ai-tools/ai-analysis/ui/AnalysisState.vue` — wraps successful result content in a flex column result container.
- `features/ai-tools/ai-analysis/ui/AnalysisResponseMeta.vue` — adds `mt-auto` so generated-at/model metadata stays aligned to the bottom of the available result area.
- `features/ai-tools/ai-analysis/ui/AnalysisHeader.vue` — reduces the analysis title from `text-lg` to `text-base` for tighter panel hierarchy.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetOptimizationAnalysis.vue` — wraps the budget optimizer summary in a raised card to match the new lead-summary treatment.
- `ui/card/card.types.ts` — adds the typed `raised` card variant.
- `ui/card/Card.vue` — implements `Card` `raised` styling with raised surface, border, shadow, and heading treatment.
- `ui/card/Card.vue` — keeps secondary cards visually quieter for nested AI result cards.
- `ui/primitives/Badge.vue` — swaps primary/opportunity visual treatment so opportunity reads with the former primary-style emphasis while primary uses the lighter primary badge treatment.

**Key decisions & why:**
- One component per executive summary section — key risks and growth outlook each own their domain type, badge mapping, section title, and rendering rules.
- Keep risk severity mapping inside `KeyRisks.vue` — risk color semantics are specific to this section and should not leak into shared card or badge primitives.
- Use direct card markup for key risks — once growth outlook diverged to a raised card, the temporary shared `SummaryCard` abstraction no longer removed meaningful duplication.
- Use `raised` only for lead/summary surfaces — the raised variant signals primary narrative content, while secondary cards remain quieter supporting details.
- Sort risks by severity in the UI — the API output remains untouched, but the user sees the highest-risk items first.
- Use scoped risk-card classes for borders — dynamic Tailwind border classes were brittle here; local severity classes make the styling explicit.
- Keep `AnalysisResponseMeta` layout responsibility shared — placing `mt-auto` on the meta component plus a flex result wrapper makes both analysis tabs align consistently.
- Preserve commented code/imports unless asked — exploratory/commented blocks are treated as user-owned context and should not be removed during unrelated refactors.
- Verified with `npm run build` — the app builds successfully with only the existing Vite chunk-size warning.


## [#611] Refine Budget Optimizer result sections and expected impact cards
**Type:** refactor/ui

**Summary:** Split the Budget Optimizer output into clearer Reallocate, Growth Opportunities, and Reduce sections; introduced reusable expected-impact rendering for recommendation and expansion cards; created a dedicated reduction card with plain-language impact copy and compact meta values; kept recommendation channel context visible under each campaign name; and removed the temporary shared header abstraction because projection made it noisier than the markup it replaced.

**Brainstorming:** The Budget Optimizer UI needed to match the shape of the new output schema without turning every card into a conditional renderer. Reallocations, expansions, and reductions are different user decisions, so each section now owns the layout that best explains its decision. Reallocations still show From/To campaign routes, now with channel context under each campaign so the user does not lose channel information. Expansions show target campaign/channel plus expected impact. Reductions are simpler and focus on the campaign, channel, amount reduced, and the reason for cutting spend. A `BudgetActionHeader` abstraction was tested, but once badges and route labels were projected, the component added indirection without enough reuse value, so it was removed and the local header markup was kept in each component.

**Prompt:** Refactor the Budget Optimizer result UI into three explicit sections. Keep `BudgetRecommendations.vue` for Reallocate cards only, and preserve both campaign and channel in the From/To header. Create/use `BudgetExpansions.vue` for Growth Opportunities and `BudgetReductions.vue` for Reduce. Extract only the repeated metric grid into `ExpectedImpactGrid.vue`; do not extract the card header because each section has slightly different semantics. Reductions should say “Reduce by <formatted amount> to increase revenue / to reduce wasted spend / to free up budget / to optimize spend allocation”, then show any available expected impact as a compact `MetaRow` with highlighted values. Keep badges small. Do not remove existing comments/imports. Do not touch unrelated executive-summary code. If trying an abstraction, remove it if the projected slots become more verbose than the original markup.

**What changed:**
- `features/ai-tools/ai-analysis/budget-optimization/BudgetOptimizationAnalysis.vue` — imports and composes the dedicated budget result components instead of rendering all recommendation/expansion markup inline.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetOptimizationAnalysis.vue` — adds `reallocations` computed sorted by expected revenue change descending with nulls last.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetOptimizationAnalysis.vue` — adds `reductions` computed filtered from recommendation type `reduction`.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetOptimizationAnalysis.vue` — adds `hasNoResults` computed for the empty optimization state.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetOptimizationAnalysis.vue` — renders result summary in a raised card before the detailed sections.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetRecommendations.vue` — takes a `title` prop so the parent can render it as the Reallocate section.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetRecommendations.vue` — keeps From/To campaign names in the route header and adds `fromChannel` / `toChannel` underneath each campaign.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetRecommendations.vue` — uses small confidence and execution-risk badges in the header.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetRecommendations.vue` — delegates expected impact rows to `ExpectedImpactGrid.vue`.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetExpansions.vue` — created as the Growth Opportunities renderer.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetExpansions.vue` — sorts expansions by confidence first, then execution risk.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetExpansions.vue` — renders target campaign when present, otherwise target channel, and always keeps target channel visible underneath.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetExpansions.vue` — uses the same small confidence/risk badge pattern as recommendations.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetExpansions.vue` — delegates expected impact rows to `ExpectedImpactGrid.vue`.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetReductions.vue` — created as the dedicated Reduce renderer.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetReductions.vue` — sorts reductions by confidence first, then execution risk.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetReductions.vue` — renders campaign title with channel underneath and small confidence/risk badges.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetReductions.vue` — adds `inferImpactLabel` to classify reduction copy as revenue gain, waste reduction, budget saved, or generic allocation optimization.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetReductions.vue` — renders “Reduce by <amount> …” as a sentence instead of a generic grid row.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetReductions.vue` — uses `MetaRow` and `MetaItem` for available expected-impact values after the reduction sentence.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetReductions.vue` — formats ROI as `Est. ROI 1.5x` and highlights expected impact values.
- `features/ai-tools/ai-analysis/budget-optimization/ExpectedImpactGrid.vue` — created to centralize the repeated four-value grid used by reallocations and expansions.
- `features/ai-tools/ai-analysis/budget-optimization/ExpectedImpactGrid.vue` — accepts `amountLabel`, `amount`, and `ExpectedImpact`.
- `features/ai-tools/ai-analysis/budget-optimization/ExpectedImpactGrid.vue` — formats amount/revenue as currency, ROI as `1.5x`, conversions as plain count, and null estimates as `—`.
- `features/ai-tools/sample-data/budget-optimization.ts` — expanded mock scenarios with realistic reduction items.
- `features/ai-tools/sample-data/budget-optimization.ts` — added expected impact estimates to reductions so the compact reduction meta row can be exercised.
- `features/ai-tools/sample-data/budget-optimization.ts` — added expansion scenarios so Growth Opportunities is visible during dev cycling.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetActionHeader.vue` — removed after review because the projection-based abstraction made the local card headers harder to follow and did not reduce meaningful duplication.

**Key decisions & why:**
- Keep one renderer per decision type — reallocations, expansions, and reductions are not just visual variants; they answer different user questions.
- Extract the metric grid, not the header — the impact grid is structurally identical across recommendations and expansions, while headers carry different semantics.
- Keep channel context in recommendations — once the user is away from dashboard-level filters, seeing only campaign names is not enough context.
- Do not show a recommendation type badge inside split sections — section titles already communicate Reallocate / Growth Opportunities / Reduce, so repeating type badges adds noise.
- Sort reallocations by estimated revenue change — the highest upside move should be easiest to find.
- Sort reductions and expansions by confidence/risk — these sections are more about action reliability than revenue ranking alone.
- Use compact `MetaRow` for reduction estimates — reduction cards need supporting context without becoming as heavy as the reallocation/expansion metric grid.
- Use `ExpectedImpactGrid` null fallbacks — a dash is clearer than hiding rows and causing inconsistent card rhythm.
- Remove `BudgetActionHeader` — a shared component is not useful when the consumer has to project almost the entire header structure into it.
- Leave the container-query TODO in `ExpectedImpactGrid` commented — the current component likely needs another wrapper to make the query useful, and that was intentionally deferred.

**Prompting note for next time:**
- A better prompt would be: “Refactor only the Budget Optimizer result cards. Preserve the existing visual structure unless I explicitly say to redesign it. Extract only repeated metric rendering into a reusable component. Keep headers local unless the abstraction reduces markup without heavy slots. Reallocations must show From/To campaign and channel; expansions must show target campaign/channel; reductions must show campaign/channel plus a short reduce-by sentence and compact expected-impact meta. Do not touch executive-summary files, logs, comments, or unrelated styles.”


## [#612] Polish Budget Optimizer cards and ExpectedImpactGrid responsive layout
**Type:** refactor/ui

**Summary:** Renamed all abbreviated CSS class names across budget optimization cards to full descriptive names; made ExpectedImpactGrid responsive with container-query-driven grid breakpoints and bordered metric cells; added `showAmountSign` prop to ExpectedImpactGrid for expansion cards; aligned card header layout to stack on narrow containers and flow inline at cq-540+; scoped h5 card styling into Card.vue and removed the global h5 rule; updated Card raised variant background and spacing.

**Brainstorming:** The abbreviated class names (.exp-*, .red-*, .rec-*) were unreadable in isolation and caused confusion when scanning component styles. Full descriptive names (.expansion-header, .reduction-card, .recommendation-route) communicate purpose without context. The ExpectedImpactGrid was previously a static 2×2 grid with no container awareness — it broke on narrow containers inside the drawer. A cq-container wrapper with three responsive breakpoints (1col→2col→4col) fixes this. The metric cells needed visual separation from the surrounding card text — bordered rounded cells give them a data-table feel that distinguishes them from prose. The global h5 rule was overly broad and affected headings outside cards; scoping it into Card.vue's component stylesheet gives us card-specific typographic treatment without bleed.

**Prompt:** Rename all abbreviated CSS class names in BudgetExpansions.vue, BudgetReductions.vue, and BudgetRecommendations.vue to full descriptive names (e.g. `.exp-header` → `.expansion-header`). Make the card header layout stack vertically on narrow containers and switch to flex-row at cq-540 using the existing `cq-container` + `cq-up` SCSS mixins. Add `tone="dimmed"` to all confidence and risk badges across the three components. Add `whitespace-nowrap` to reduction badges. In ExpectedImpactGrid.vue: add a `showAmountSign` boolean prop (default false) that prepends `+` to the amount; wrap the grid in a `cq-container` element and make it responsive — 1 column at default, 2 columns at cq-400, 2 columns at cq-540 with wider gap, 4 columns at cq-800; style each metric row as a bordered rounded cell with `border border-subtle rounded-md px-2 py-1.5`. Change amount label in BudgetExpansions to "Investment". Remove the global h5 rule from `_typography.scss` and move equivalent card-scoped h5 styling into Card.vue's scoped block. Change Card raised variant background from `bg-surface-raised` to `bg-surface-hover`. Add `cq-368` (23rem) and `cq-800` (50rem) to the container-queries mixin scale. Increase Card base padding and gap from `p-3`/`gap-3` to `p-3.5`/`gap-3.5`.

**What changed:**
- `features/ai-tools/ai-analysis/budget-optimization/BudgetExpansions.vue` — renamed all `.exp-*` class names to `.expansion-*`; added `tone="dimmed"` to confidence and risk badges; card header stacks vertically and switches to flex-row at cq-540; title uses `flex-1 min-w-[50%]`; badges use `flex-nowrap`; channel span gets `inline-block`; amount label changed from "Additional Budget" to "Investment"; `show-amount-sign` prop passed to `ExpectedImpactGrid`
- `features/ai-tools/ai-analysis/budget-optimization/BudgetReductions.vue` — renamed all `.red-*` class names to `.reduction-*`; added `tone="dimmed"` and `whitespace-nowrap` to both badges; card gets `cq-container("reduction-card")`; header stacks vertically and switches to flex-row at cq-540; title uses `flex-1 min-w-[50%]`; channel and impact value spans get `inline-block`; MetaRow top padding increased from `pt-1` to `pt-1.5`; `CardHeader` imported (currently unused — likely staged for an upcoming header refactor)
- `features/ai-tools/ai-analysis/budget-optimization/BudgetRecommendations.vue` — renamed all `.rec-*` class names to `.recommendation-*`; added `tone="dimmed"` to both badges; `.rec-card` cq-container class removed along with the rename (no replacement cq-container added); "To" campaign name upgraded to `font-semibold text-typography-primary-lighter`; removed obsolete `.rec-routes` and `.card-title` classes
- `features/ai-tools/ai-analysis/budget-optimization/BudgetOptimizationAnalysis.vue` — trailing whitespace removed from two template lines (no logic change)
- `features/ai-tools/ai-analysis/budget-optimization/ExpectedImpactGrid.vue` — added `showAmountSign` boolean prop with default `false`; wrapped grid in `.expected-impact-grid-wrapper` as cq-container; grid is now responsive: 1 col default → 2×2 at cq-400 → 2×2 with wider gap at cq-540 → 4×1 at cq-800; null handling simplified to `?? "N/A"` and `?? "N/A"`; each metric row styled as a bordered rounded cell with label on left and value on right; `formatCurrency` called with precision `0`
- `ui/card/Card.vue` — base padding increased from `p-3` to `p-3.5`; base gap increased from `gap-3` to `gap-3.5`; scoped h5 rule updated to `font-semibold text-primary-lighter leading-5 tracking-wide w-full`; raised variant background changed from `bg-surface-raised` to `bg-surface-hover`
- `styles/base/_typography.scss` — global h5 rule removed; h5 styling is now scoped to `Card.vue`
- `styles/mixins/container-queries.scss` — added `cq-368: 23rem` and `cq-800: 50rem` to the `$container-sizes` scale

**Key decisions & why:**
- Full class names over abbreviations — `.exp-header` provides no information when reading a stylesheet in isolation; `.expansion-header` is self-documenting
- cq-container on card wrapper, not on card itself — the card already handles its own visual surface; a wrapper gives the container-query scope without coupling it to Card's layout model
- Bordered metric cells instead of plain flex rows — the impact grid contains structured comparative data, not prose; cell-like styling communicates "these are readings, not sentences"
- `showAmountSign` prop not a computed — the sign is a display decision driven by the parent's intent (expansions = investment, so + is meaningful); the grid itself does not know whether to show it
- Remove global h5 rule — card h5s are the only use site; scoping prevents accidental bleed onto h5s rendered outside cards (e.g., section headings in other features)
- `bg-surface-hover` for raised cards — `bg-surface-raised` was visually indistinct from the surrounding surface in practice; `bg-surface-hover` provides a subtle but readable lift
