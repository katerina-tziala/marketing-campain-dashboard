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
