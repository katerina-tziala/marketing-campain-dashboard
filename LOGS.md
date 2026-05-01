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


[Entries 2-583 preserved from original log...]


## [584] Extract watcher callbacks and analysis context mapper
**Type:** refactor

**Summary:** Extracted three watcher callbacks into named functions and moved campaign performance → analysis context mapping into a reusable utility. dashboardOrchestrator.store is now cleaner and more maintainable.

**Brainstorming:** The orchestrator had three watchers with inline callbacks: one mapping campaign performance state to analysis context (12 lines), one handling portfolio eviction, and one showing connection toasts. Inline callbacks made the file harder to scan and the mapping logic was tightly coupled to the watcher. Solution: extract each callback as a named function (improves readability and testability) and move the context mapping to a dedicated utility (makes it reusable and tests the transformation in isolation). This reduces store complexity and follows the pattern established in previous refactors.

**Prompt:** Extract three watcher callbacks into named functions: onAnalysisContextChange, onPortfolioEvicted, onConnectionEventChange. Create app/utils/map-analysis-context.ts to map campaignPerformance state to AiAnalysisContext. Update the watcher getter to call mapAnalysisContext() instead of inlining the object. Create app/utils/index.ts barrel.

**What changed:**
- `app/utils/map-analysis-context.ts` — new file; exports mapAnalysisContext(campaignPerformance) function that transforms campaign performance state into AiAnalysisContext shape
- `app/utils/index.ts` — new file; barrel export for mapAnalysisContext
- `app/stores/dashboardOrchestrator.store.ts` — extracted onAnalysisContextChange(context), onPortfolioEvicted(id), onConnectionEventChange(event) as named functions; imported mapAnalysisContext from app/utils; updated campaign performance watcher getter from inline object to mapAnalysisContext(campaignPerformance) call; added AiConnectionEvent type import for proper typing
- `CLAUDE.md` — added app/utils folder with map-analysis-context.ts entry; updated dashboardOrchestrator.store description to list the three extracted callback functions

**Key decisions & why:**
- Named functions replace inline callbacks — improves readability, enables testing individual handlers in isolation, establishes a pattern consistent with previous refactors.
- Dedicated utils mapper — transformations between layers deserve their own function; keeps store logic focused on orchestration, not data shaping.
- mapAnalysisContext takes campaignPerformance store, not individual fields — single dependency, easier to mock for tests, clear input contract.
- Proper typing on onConnectionEventChange — AiConnectionEvent type prevents accidental bugs when accessing event properties, replaces the previous `any` type.
