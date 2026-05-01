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


## [585] Flatten shell into DashboardPage and move toasts to App
**Type:** refactor

**Summary:** First moved AiToolsDrawer from AppShell to DashboardPage to scope AI tools UI to the dashboard route only, then completed the refactor by removing the `app/shell` folder for now, moving global toasts to `App.vue`, and placing the current dashboard chrome, upload flow, campaign content, and AI drawer directly in `DashboardPage.vue`. The app now avoids a premature shell abstraction until future routes or auth flows justify shared layouts.

**Brainstorming:** AiToolsDrawer was originally rendered in AppShell (the root layout), making it available app-wide even though it is only used on the dashboard. Moving it to DashboardPage scoped the feature properly: AI tools close/reset with the dashboard route, and the drawer component lives near the content that uses it. That first step improved separation of concerns because AppShell handled app chrome while DashboardPage handled its own layout (main content + drawer). The follow-up discussion exposed a bigger layout boundary question: if auth or future views arrive later, the app may need completely different shells. Keeping a single `AppShell` today would make the current dashboard look more globally permanent than it really is. The better short-term structure is to keep `App.vue` as pure app bootstrap with `RouterView` and global infrastructure like toasts, then let `DashboardPage.vue` own the dashboard-specific header, upload modal flow, content area, and AI drawer. Future shared layouts can be introduced later when there are multiple pages with real shared structure; generic layout primitives can still live in `ui/layout`, while product-specific route layouts should live in `app/layouts` only when needed.

**Prompt:** First, move AiToolsDrawer from `AppShell.vue` to `DashboardPage.vue`; update imports; remove the dashboard orchestrator dependency and unused `provide("openAiPanel")` from AppShell; wrap page content in a flex row so the drawer sits beside dashboard content; update documentation. Then continue the app-folder refactor conservatively: move `ToastContainer` out of the shell and into `App.vue`; remove the current `app/shell` abstraction entirely; inline the dashboard header, upload button, upload/replace modals, campaign content, and AI drawer composition into `DashboardPage.vue`; delete the unused shell files and folder; do not introduce `app/layouts` or `ui/layout` abstractions yet; run the build and report any unrelated failures.

**What changed:**
- `app/shell/AppShell.vue` — intermediate step: removed AiToolsDrawer import and rendering; removed `useDashboardOrchestratorStore` import; removed unused `provide("openAiPanel")`; template temporarily rendered only header + main slot before the shell was deleted in the final step.
- `app/pages/DashboardPage.vue` — intermediate step: added AiToolsDrawer import from `../shell/AiToolsDrawer.vue`; wrapped `EmptyState`, `CampaignPerformanceView`, and AiToolsDrawer in a `.dashboard-page` flex container; changed page layout from grid to flex row to match the drawer-as-sibling model.
- `CLAUDE.md` — intermediate documentation update: AppShell description was adjusted to remove drawer responsibility, and DashboardPage description was adjusted to note that AiToolsDrawer rendered alongside dashboard content.
- `app/App.vue` — removed `AppShell` wrapper; renders `RouterView` directly; imports and renders `ToastContainer` as global app infrastructure.
- `app/pages/DashboardPage.vue` — now owns the dashboard shell structure: header, title, upload CTA, body row, main content, AI drawer, upload modal, and replace confirmation modal.
- `app/pages/DashboardPage.vue` — replaced injected `openUploadModal` usage with local `useUploadModal(uploadModal)` ownership; EmptyState upload action now calls `requestUpload` directly.
- `app/pages/DashboardPage.vue` — inlined the previous AiToolsDrawer wrapper by composing `ResponsiveDrawer`, `SparklesIcon`, and `AiTools` directly in the page.
- `app/shell/AppShell.vue` — deleted; its remaining dashboard-specific responsibilities were moved into DashboardPage, and its global toast responsibility moved into App.
- `app/shell/AiToolsDrawer.vue` — deleted; the wrapper was small enough that keeping it after removing the shell folder added indirection without much value.
- `app/shell/` — removed after deleting the last files in the folder.

**Key decisions & why:**
- Relative import path for the first drawer move — during the intermediate step, DashboardPage imported the drawer from `../shell/AiToolsDrawer.vue` because the component still lived in the shell folder; this kept the first change small before deciding to remove the shell entirely.
- Flex layout for the drawer step — the drawer needed to be a sibling of the main dashboard content so the header stayed full width while `ResponsiveDrawer` could handle push/overlay behavior.
- Removed `provide("openAiPanel")` from AppShell — it was unused; `dashboard.openAiPanel` was already wired directly through DashboardPage props/events to CampaignPerformanceView.
- Toasts belong in `App.vue` — they are global feedback infrastructure and should survive future route/layout changes, including possible auth layouts.
- No shell abstraction for one page — with only the dashboard route, `AppShell` was premature and made dashboard-specific UI look globally shared.
- DashboardPage owns dashboard composition — upload data flow, campaign content, and AI tools all depend on dashboard state, so colocating them makes the route easier to reason about.
- No new `app/layouts` yet — future shared layouts should be introduced when multiple pages actually share structure; until then, flattening is clearer than renaming `AppShell` to a layout.
- Keep `ui/layout` generic — reusable layout primitives can live there, but dashboard/auth/product-aware layouts should not be promoted into the UI library.
- Build verification surfaced unrelated existing TypeScript errors in `app/utils/map-analysis-context.ts` (`AiAnalysisContext` export missing and `CampaignPerformanceStore` type name mismatch); the shell/toast refactor itself left no stale shell imports.
