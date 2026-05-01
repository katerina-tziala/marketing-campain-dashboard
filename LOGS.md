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


## [586] UI polish: drawer motion, channel filters, controls, and upload placeholder rename
**Type:** refactor

**Summary:** Polished several shared UI surfaces after the shell flattening: the AI drawer keeps its desktop width-push behavior while its inner content slides in more smoothly, modal and drawer overlays now share a utility class, buttons/forms/radio controls received visual refinements, channel filters now expose clearer selected-count feedback, and the dashboard’s no-data component was renamed from `EmptyState` to `UploadDataPlaceholder`.

**Brainstorming:** The first drawer idea tried to keep dashboard content visually stable by overlaying or transform-pushing the main content, but that broke the intended product behavior: the drawer should take real horizontal space and the dashboard should shrink beside it. The better fix was more precise: keep the outer drawer slot as a flex sibling that animates from `0` to `30rem`, but make the inner drawer panel a fixed-width surface that fades/slides inside that slot. That preserves the layout contract while making the drawer content feel like it enters as a panel instead of stretching from zero. While reviewing overlays, we also extracted the duplicated fixed backdrop styling into a shared `.overlay` utility used by modal and drawer mobile overlay paths. Separately, the channel filter button and dropdown needed clearer selection feedback: the compact badge should communicate hidden selected filters with `+N`, and the dropdown header should always show how many channels are effectively selected, including the "no explicit filter means all selected" state. Finally, the old `EmptyState` name was too generic for a data-transfer component whose actual role is to prompt CSV upload, so it became `UploadDataPlaceholder`.

**Prompt:** Polish the dashboard UI after the shell refactor. Keep the AI drawer’s outer behavior as a desktop side panel that pushes/shrinks the dashboard content, but make the drawer’s own content feel like it slides in rather than expands. Extract a reusable overlay utility for modal/drawer backdrops. Refine shared button and form control sizing/hover states. Improve channel filter feedback by adding a `+` prefix to the hidden-count badge and showing an effective selected/total channel count in the dropdown header, where no explicit selection displays as all channels selected. Rename the no-data upload component from `EmptyState` to `UploadDataPlaceholder` and update exports/usages. Do not keep temporary UI playground markup in the final EmptyState/placeholder component.

**What changed:**
- `ui/drawer/ResponsiveDrawer.vue` — kept the outer desktop drawer as the flex sibling that transitions width from `0` to `30rem`, preserving the dashboard shrink/push behavior.
- `ui/drawer/ResponsiveDrawer.vue` — made the desktop drawer panel fixed-width inside the animated slot and added `opacity`/`transform` transitions so the panel content slides/fades in instead of visually stretching.
- `ui/drawer/ResponsiveDrawer.vue` — wrapped desktop slot content in `.responsive-drawer-content` and reused the shared `.overlay` class for the mobile overlay path.
- `styles/utilities/_overlay.scss` — added a reusable `.overlay` utility for fixed, centered, backdrop-covered overlays.
- `styles/utilities/index.scss` — registered the new overlay utility.
- `ui/modal/Modal.vue` — replaced local modal backdrop styling with the shared `.overlay` utility and constrained modal max dimensions.
- `ui/modal/ModalHeader.vue` — tightened modal header spacing and content alignment.
- `ui/primitives/Button.vue` — refined base button height, border treatment, icon sizing, active state, small/icon-only sizing, and variant colors for primary, outline, text-only, info-text-only, ghost, info-outline, and destructive.
- `styles/components/_forms.scss` — adjusted base form-control minimum height and hover/focus border color.
- `ui/forms/PasswordInput.vue` — aligned password hover/focus border behavior with the form-control updates and made the visibility toggle fill the input height.
- `ui/forms/RadioItem.vue` — increased radio indicator and checked-dot sizes for better visibility.
- `ui/forms/RadioToggle.vue` — adjusted default/small/tiny sizing, removed the unused info variant, and tuned secondary styling.
- `features/campaign-performance/components/channel-filters/ChannelFiltersDialog.vue` — changed the compact selected-filter badge from `N` to `+N`.
- `features/campaign-performance/components/channel-filters/ChannelFiltersDialog.vue` — added `selectedChannelCount` so the dropdown header shows effective selected channels; when no channels are explicitly selected, it displays all channels as selected.
- `features/campaign-performance/components/channel-filters/ChannelFiltersDialog.vue` — added a no-wrap selection-count label next to `Channels`, renamed the clear action text to `Show all`, and polished the active filter button state.
- `features/campaign-performance/components/CampaignPerformanceHeader.vue` — moved header composition onto `SectionHeaderLayout` and kept the AI action in the layout action slot.
- `features/campaign-performance/CampaignPerformanceView.vue` and `features/campaign-performance/charts/PerformanceCharts.vue` — tuned spacing and switched the revenue/budget toggle to the smaller radio-toggle size.
- `features/ai-tools/*` — tightened AI drawer/form/analysis spacing so content fits better in the drawer surface.
- `features/data-transfer/components/EmptyState.vue` — renamed to `UploadDataPlaceholder.vue`.
- `features/data-transfer/components/index.ts` — replaced the `EmptyState` export with `UploadDataPlaceholder`.
- `app/pages/DashboardPage.vue` — imports and renders `UploadDataPlaceholder`; the upload header button now uses the small outline button style.
- `features/data-transfer/components/UploadDataPlaceholder.vue` — cleaned back down to the real upload placeholder after temporary button/form playground markup was used for visual tuning.

**Key decisions & why:**
- Preserve real drawer layout behavior — the drawer should push/shrink dashboard content on desktop, so the outer width transition stays.
- Slide the inner panel, not the whole page — fixing the perceived "expanding content" problem belongs inside the drawer panel, not in the dashboard layout.
- Share overlay styling — modal and drawer overlays need the same fixed backdrop behavior, so a utility avoids duplicating those Tailwind rules.
- Keep `UploadDataPlaceholder` domain-specific — `Placeholder` alone was too vague, and `EmptyState` was too generic; the new name says this component exists to prompt data upload.
- Treat "no channel filter" as "all selected" — this matches the app behavior and avoids showing `0 / N selected` when all channels are effectively visible.
- Use `+N` for the compact filter badge — the plus sign communicates "additional hidden selected filters" better than a bare number.
- Keep temporary UI playground work out of production components — the EmptyState/placeholder component was used as a visual workbench for controls, then cleaned back to its product role.
- Build verification currently still stops on TypeScript errors outside this polish batch: missing `AiAnalysisContext`/`CampaignPerformanceStore` exports in `app/utils/map-analysis-context.ts`, plus an unused `ModalBody` import in `ui/drawer/ResponsiveDrawer.vue`.


## [587] Restore connected status dot and formalize modal size variants
**Type:** fix/refactor

**Summary:** Restored the AI connected status dot on the dashboard header after the `SectionHeaderLayout` refactor, and moved modal width control into `Modal.vue` with explicit `size` variants. The upload validation review screens now use a large modal shell instead of trying to constrain `ModalBody`, and the replace-data confirmation uses the small modal variant.

**Brainstorming:** The connected dot disappeared because the header refactor preserved the `showConnectedDot` prop and CSS but dropped the actual dot markup around the AI button. The fix was to wrap the AI button in a relative container inside the `SectionHeaderLayout` action slot and reinsert the existing dot elements. The modal issue came from trying to apply max-width on `ModalBody` while the parent `.modal` still owned the dialog's intrinsic width. This appeared to work for `ReplaceDataModal` because its content is only text, but the upload review modals contain wide tables that force the `w-fit` modal shell to grow. The better boundary is for `Modal.vue` to own panel width through a typed `size` prop, while `ModalBody` remains responsible for padding, vertical layout, and scrolling.

**Prompt:** Fix the missing connected dot on the dashboard AI button after the header layout refactor. Then repair modal sizing by adding explicit size variants to `Modal.vue`: keep the default modal compact, add small/medium/large panel widths, use the large variant for upload validation review screens, and use the small variant for the replace-data confirmation. Remove body-level max-width hacks from the review components so modal width is controlled by the modal shell.

**What changed:**
- `features/campaign-performance/components/CampaignPerformanceHeader.vue` — restored the connected status dot markup around the AI button inside the `SectionHeaderLayout` action slot.
- `features/campaign-performance/components/CampaignPerformanceHeader.vue` — kept the existing connected-dot CSS and animation; the missing piece was only the template markup.
- `ui/modal/Modal.vue` — added a typed `size` prop with `default`, `small`, `medium`, and `large` options.
- `ui/modal/Modal.vue` — keeps `default` as compact `w-fit`, while named sizes opt into `w-full` with `max-w-2xl`, `max-w-3xl`, or `max-w-5xl`.
- `features/data-transfer/components/UploadDataModal.vue` — uses `default` size for the upload form and `large` size for row-error / duplicate-review screens.
- `features/data-transfer/components/ReplaceDataModal.vue` — uses `size="small"` instead of relying on external classes or `ModalBody` max-width.
- `features/data-transfer/components/data-validation/review-errors/ReviewErrorsComponent.vue` — removed modal body sizing responsibility and wrapped review content in a local `.body-content` grid.
- `features/data-transfer/components/data-validation/review-duplications/ReviewDuplicatedCampaigns.vue` — removed modal body sizing responsibility and wrapped review content in a local `.body-content` grid.

**Key decisions & why:**
- Modal shell owns width — the shell decides dialog dimensions; body components should not fight the parent modal's intrinsic sizing.
- `size` instead of external classes — classes passed to `Modal` do not naturally land on the teleported `.modal` panel, so an explicit prop is clearer and safer.
- Keep default compact — simple text/form modals should not become full-width just because the modal component supports larger variants.
- Use large for validation tables — review screens contain table-heavy content, so they need a wider shell with internal scrolling.
- Use small for replace confirmation — the confirmation modal is text-only and should stay visually compact.
- Restore dot locally in the header — the store and prop flow were already correct; only the header action template lost the dot markup.
- Build verification still stops on existing unrelated TypeScript errors in `app/utils/map-analysis-context.ts` (`AiAnalysisContext` and `CampaignPerformanceStore` export/type mismatches).


## [588] Extract SplitPaneLayout and only mount it for loaded dashboards
**Type:** refactor

**Summary:** Extracted the dashboard’s main-plus-aside structure into a reusable `SplitPaneLayout` UI primitive and updated `DashboardPage` so the split pane only mounts when campaign data exists. The no-data state now renders as a simple centered main area with `UploadDataPlaceholder`, while the loaded dashboard renders `CampaignPerformanceView` beside the AI drawer.

**Brainstorming:** After removing the old shell abstraction, `DashboardPage` still had a local layout pattern that was not really dashboard-specific: a main content area plus an optional side pane. That pattern is generic enough for `ui/layout`, as long as it stays dumb and does not know about AI tools, campaign data, stores, or route state. The important boundary is that `SplitPaneLayout` should only provide the flex row and main slot container; `ResponsiveDrawer` should keep owning drawer open/close, width transition, and mobile overlay behavior. Once the primitive existed, the dashboard conditional could become clearer too: the empty upload placeholder does not need a split pane or mounted drawer, so it gets a plain `<main>`. The split pane is reserved for the loaded dashboard state where the AI drawer actually belongs.

**Prompt:** Create a generic `SplitPaneLayout` in `ui/layout` that projects main content and an aside slot without knowing about dashboard or AI behavior. Export it from the layout barrel. Refactor `DashboardPage` to use the split pane only when campaign data exists; when there is no data, render a plain main area with `UploadDataPlaceholder`. Keep the `ResponsiveDrawer` in the aside slot and leave drawer behavior unchanged.

**What changed:**
- `ui/layout/SplitPaneLayout.vue` — new layout primitive with a default slot rendered inside a main content container and a named `aside` slot rendered as a sibling.
- `ui/layout/SplitPaneLayout.vue` — owns only generic flex-row layout styles: `flex`, `flex-row`, `flex-1`, and overflow containment.
- `ui/layout/index.ts` — exports `SplitPaneLayout` alongside `SectionHeaderLayout`.
- `app/pages/DashboardPage.vue` — imports `SplitPaneLayout` from `@/ui`.
- `app/pages/DashboardPage.vue` — replaces the previous local `.dashboard-body` / `.dashboard-main` split-pane markup with the new layout primitive.
- `app/pages/DashboardPage.vue` — renders `<main class="dashboard-main">` with `UploadDataPlaceholder` when `dashboard.hasCampaigns` is false.
- `app/pages/DashboardPage.vue` — renders `SplitPaneLayout` only when campaign data exists; `CampaignPerformanceView` goes in the default slot and `ResponsiveDrawer` + `AiTools` go in the `aside` slot.
- `app/pages/DashboardPage.vue` — keeps the upload modal and replace confirmation modal outside the split pane so modal lifecycle is independent from the loaded/empty page layout.

**Key decisions & why:**
- Put `SplitPaneLayout` in `ui/layout` — the layout is generic projection of main and aside content, not a dashboard-specific route layout.
- Keep it dumb — it does not receive dashboard state, drawer state, or width props; it just provides stable slots and layout containment.
- Leave drawer behavior in `ResponsiveDrawer` — the drawer already owns desktop width push, inner panel motion, escape handling, and mobile overlay behavior.
- Do not mount the drawer for empty state — no campaign data means no dashboard analysis surface, so the split pane and AI drawer should not exist yet.
- Keep page composition in `DashboardPage` — the page still decides which feature components render for empty vs loaded state.
- Build verification still stops on existing unrelated TypeScript errors in `app/utils/map-analysis-context.ts` (`AiAnalysisContext` and `CampaignPerformanceStore` export/type mismatches).


## [589] Add chart funnel tokens and align chart text theme
**Type:** refactor

**Summary:** Started a chart-specific token layer by adding semantic funnel colors to the dark chart theme, exposing them through Tailwind, and updating the conversion funnel chart to consume chart utilities instead of app palette utilities. Also aligned Chart.js label/title/tooltip text colors with the app typography tokens and updated tooltip border color to better match the dark UI theme.

**Brainstorming:** Chart components sit between two styling worlds: Vue templates can use Tailwind utilities, while Chart.js needs runtime color strings. The long-term direction is a small chart token layer that maps theme variables into chart-specific semantics. For the first step, the conversion funnel is a good candidate because it already has three clear semantic stages: impressions, clicks, and conversions. Those should not reach directly for `primary`, `secondary`, or `warning` palette classes forever; they should consume chart-specific tokens that can later be remapped without changing the component. Separately, Chart.js labels were using hardcoded slate-like colors. Those values should match the app typography system: labels/ticks use muted typography, scale titles use regular typography, and the tooltip border should feel like the app’s dark border treatment rather than a generic white alpha.

**Prompt:** Create chart color tokens for the conversion funnel in the dark chart theme, expose them in Tailwind, update the funnel chart to use the new chart utility classes, and align Chart.js label/title/tooltip colors with the app’s typography and border theme. Keep the change small and focused on the funnel and existing chart theme config.

**What changed:**
- `styles/themes/dark/_charts.scss` — added three semantic funnel CSS variables: `--chart-funnel-impressions`, `--chart-funnel-clicks`, and `--chart-funnel-conversions`.
- `styles/themes/dark/_charts.scss` — mapped the funnel tokens to existing semantic color variables for now: primary dark, secondary darker, and warning darker.
- `tailwind.config.js` — added a `chart.funnel` color namespace that exposes the funnel CSS variables as Tailwind utilities.
- `features/campaign-performance/charts/components/ConversionFunnelChart.vue` — replaced palette classes (`bg-primary-dark`, `bg-secondary-darker`, `bg-warning-darker`) with chart classes (`bg-chart-funnel-impressions`, `bg-chart-funnel-clicks`, `bg-chart-funnel-conversions`).
- `ui/charts/config/chart-theme.config.ts` — introduced named constants for chart typography colors and grid/border color to make the theme intent clearer.
- `ui/charts/config/chart-theme.config.ts` — updated chart text, scale ticks, legend labels, and tooltip body to match `text-typography-muted`.
- `ui/charts/config/chart-theme.config.ts` — updated scale title color to match regular `text-typography`.
- `ui/charts/config/chart-theme.config.ts` — updated tooltip border color to a stronger dark-theme border value.

**Key decisions & why:**
- Use chart-specific tokens — funnel stages are chart semantics, not general UI palette decisions.
- Expose tokens through Tailwind — the Vue funnel chart can keep using utility classes while still depending on chart semantics.
- Keep tokens mapped to existing colors for now — this creates the abstraction without forcing a full chart color redesign.
- Use muted typography for chart labels — legends, ticks, and tooltip body text should visually match secondary UI copy.
- Use regular typography for chart titles — axis/scale titles need slightly stronger hierarchy than labels.
- Do not add tooltip shadow yet — Chart.js built-in tooltips are canvas-rendered, so CSS `box-shadow` is not directly available without an external HTML tooltip or a custom drawing plugin.
- Build verification still stops on existing unrelated TypeScript errors in `app/utils/map-analysis-context.ts` (`AiAnalysisContext` and `CampaignPerformanceStore` export/type mismatches).
