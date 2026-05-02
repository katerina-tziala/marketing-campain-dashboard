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


## [590] Type UI variant APIs across shared components
**Type:** refactor

**Summary:** Converted the shared UI library away from class-string variant APIs and toward typed component props. Buttons, badges, cards, notifications, tables, table headers, meta rows, radio controls, and spinners now expose explicit typed props for supported visual states, while one-off layout and positioning classes remain local at the callsite.

**Brainstorming:** After several UI polish passes, many shared components had effectively become a design system but still exposed visual states through raw classes like `class="outline small"`, `class="secondary"`, `class="danger dimmed"`, `class="sticky-header vertical-separators"`, and `class="tiny bullet"`. That worked while iterating quickly, but it made the component API harder to discover and easier to mistype. The better design-system boundary is: if a class represents a supported reusable component behavior or visual state, make it a typed prop; if it is one-off positioning, spacing, or local emphasis, keep it as a normal class. During the refactor, the naming convention was tightened: prop names stay camelCase in TypeScript, Vue templates use kebab-case attributes, and generated CSS/style classes and string variant values use kebab-case.

**Prompt:** Audit the UI library and type the public variant APIs that currently exist in the app. Start with Card, Notification, Table, TableHeader, MetaRow, form controls, Badge, Spinner, and finally Button. Migrate all existing callsites from raw variant classes to typed props, preserve unrelated layout classes, keep one-off styles local, normalize generated style classes to kebab-case, and verify with a build.

**What changed:**
- `ui/card/card.types.ts` — added `CardVariant` with `primary` and `secondary`.
- `ui/card/Card.vue` — added a typed `variant` prop, defaulting to `primary`; card variant class is now generated by the component.
- `features/ai-tools/*` card callsites — replaced `class="secondary"` with `variant="secondary"` while preserving local classes like `rec-card`.
- `ui/feedback/notification.types.ts` — added `NotificationSurface` with `default` and `dense`.
- `ui/feedback/Notification.vue` — added typed `surface` support and replaced the old `dense-bg` class API with `surface="dense"`.
- `ui/feedback/Notification.vue` — adjusted notification title/icon top padding so it only applies when an action slot exists, keeping simple notifications tighter.
- `ui/toast/ToastNotification.vue` — replaced `class="dense-bg"` with `surface="dense"`.
- `ui/table/table.types.ts` — added `TableStriped` and `TableHeaderPosition`.
- `ui/table/Table.vue` — added typed `striped` and `verticalSeparators` props.
- `ui/table/TableHeader.vue` — added typed `position` and `verticalSeparators` props.
- `ui/table/TableHeader.vue` — renamed the internal sticky class from `.sticky` to `.is-sticky` to avoid Tailwind `@apply sticky` circular-dependency errors.
- `features/data-transfer/components/data-validation/review-errors/DataErrorsTable.vue` — replaced table/header styling classes with `striped="even"`, `vertical-separators`, and `position="sticky"`.
- `features/data-transfer/components/data-validation/review-duplications/CampainDuplicationsTable.vue` and `features/campaign-performance/components/CampaignTable.vue` — replaced `class="sticky-header"` with `position="sticky"`.
- `ui/meta/meta.types.ts` — added typed `MetaRowSeparator`, `MetaRowSize`, and `MetaRowTone`.
- `ui/meta/MetaRow.vue` — added typed `separator`, `size`, and `tone` props; `size` now owns text size directly with `small` as the default and `tiny` as the compact option.
- `features/*` MetaRow callsites — replaced raw `bullet`, `divider`, `tiny`, `info`, and `primary-lighter` classes with typed props while preserving normal utility classes.
- `ui/forms/form.types.ts` — added `FormControlVariant`, `RadioItemVariant`, and `RadioToggleSize`.
- `ui/forms/RadioToggle.vue` — added typed `variant` and `size` props and renamed the old `timy` style to `tiny`.
- `ui/forms/RadioItem.vue` — added a typed `variant` prop for the existing `primary` and `info` radio styles.
- `features/campaign-performance/charts/PerformanceCharts.vue` — replaced `class="timy secondary"` with `variant="secondary"` and `size="tiny"`.
- `features/data-transfer/components/data-validation/review-duplications/CampainDuplicationsTable.vue` — replaced `RadioItem class="info"` with `variant="info"`.
- `ui/primitives/badge.types.ts` — expanded badge typing with `BadgeVariant`, `BadgeTone`, `BadgeShape`, and `BadgeSize`.
- `ui/primitives/Badge.vue` — added typed `variant`, `tone`, `shape`, and `size` props.
- `features/*` Badge callsites — replaced raw classes like `success`, `warning`, `danger`, `info`, `dimmed`, `rounded-rectangle`, `rounded-rectangle-sm`, and `text-only` with typed props.
- `features/campaign-performance/components/channel-filters/ChannelFiltersDialog.vue` — kept the selected-filter badge’s one-off bold styling local in `.selected-filters-badge` instead of adding a generic `bold` prop to `Badge`.
- `ui/primitives/spinner.types.ts` — added `SpinnerSize` and `SpinnerTone`.
- `ui/primitives/Spinner.vue` — added typed `size` and `tone` props and formalized the existing `xxl` loading size.
- `features/ai-tools/ai-analysis/ui/AnalysisState.vue` and `features/ai-tools/ai-connection/components/AiConnectionForm.vue` — replaced spinner class variants with `size="xxl"` and `size="sm" tone="inverse"`.
- `ui/primitives/button.types.ts` — added typed `ButtonVariant` and `ButtonSize`.
- `ui/primitives/Button.vue` — added typed `variant`, `size`, `iconOnly`, and `noRing` props.
- `ui/primitives/Button.vue` — generates kebab-case style classes (`icon-only`, `no-ring`, `text-only`, `info-text-only`, `info-outline`) from camelCase props and kebab-case variant values.
- All current Button callsites — replaced raw button variant classes with typed props, including primary, outline, text-only, info-text-only, ghost, info-outline, destructive, small, icon-only, and no-ring states.
- `features/ai-tools/ai-connection/components/AiConnectedStatus.vue` — removed the accidental undefined `text` class from the destructive disconnect button.
- `ui/*/index.ts` barrels — exported the new UI variant types where useful.

**Key decisions & why:**
- Type reusable states, not incidental layout — component-supported states became props; local spacing/positioning classes like `grow`, `w-full`, `min-w-24`, `xs:order-*`, `inline-action-float`, and `selected-filters-badge` stayed at the callsite.
- Use camelCase for internal prop names — TypeScript stays idiomatic with names like `iconOnly`, `noRing`, `verticalSeparators`, and `showIcon`.
- Use kebab-case in templates — Vue callsites remain idiomatic with `icon-only`, `no-ring`, `vertical-separators`, and `show-icon`.
- Use kebab-case for generated style classes and string variant values — CSS-facing classes and prop string values are now consistent (`text-only`, `info-outline`, `soft-rounded`, `primary-lighter`) instead of mixing camelCase and kebab-case.
- Keep `Badge` smaller by removing `bold` — only one badge needed bold text, so that emphasis belongs in the local channel-filter badge class rather than the shared Badge API.
- Keep `FileDropzone` and `PasswordInput` mostly internal — their current classes describe internal state/structure, not reusable public variants.
- Keep `Chip`, `Tabs`, `Disclosure`, dropdowns, modal body/footer/header, table row helpers, layouts, icons, and chart components unchanged — they are already prop-driven enough or do not currently expose repeated class-based variants.
- Move Button class generation into a computed — Vue template parsing did not like an inline class object with quoted kebab-case keys, and the computed keeps class generation easier to read.
- Build verification still stops on existing unrelated TypeScript errors in `app/utils/map-analysis-context.ts` (`AiAnalysisContext` and `CampaignPerformanceStore` export/type mismatches); the UI variant refactor itself passed the targeted scans for leftover old class-based variant APIs.


## [591] Tighten analysis typing and refine campaign performance chart layout
**Type:** refactor

**Summary:** Added explicit return types to portfolio-analysis helper functions, explored an insights card for campaign performance, then removed it after deciding the campaign scatterplot already owns that story better. The chart grid now avoids the empty slot by letting the conversion funnel span the full chart width at desktop sizes, with a reduced funnel height. KPI and campaign-table acronym labels plus icon-only buttons also gained title text for better discoverability.

**Brainstorming:** The analysis layer had two private helpers whose return types were inferred even though they define important analysis structure: classification groups and derived signals. Rather than duplicating object shapes, the return types should reference the canonical `PortfolioAnalysis` interface so the helper contracts stay in sync with the public analysis type. Separately, we explored whether a new insight card should sit near the charts. The first version used channel and campaign groups, but narrow filters could create duplicate "Opportunity" entries because group classifiers must bucket items even when there is only one channel or one campaign. We then tried campaign-level derived signals only, but that still overlapped with the ROI/budget scatterplot, which already highlights scale-up candidates, champions, underperformers, and overspend. The cleaner decision was to remove the standalone insights card for now and make the existing chart grid feel intentional by spanning the conversion funnel across both columns.

**Prompt:** Add explicit return types to `getDerivedSignals` and `getClassificationGroups`. Then experiment with an insights component for campaign performance: first try one item from each channel/campaign group, then switch to derived signals, then restrict to campaign-level derived signals only. If the insights card feels redundant with the campaign scatterplot, remove it and fix the empty chart-grid space. Finally, add hover titles for icon-only buttons and KPI acronyms (`CPA`, `CVR`, `CTR`, `ROI`) inside KPI cards, then extend the same acronym title behavior to campaign table headers because users can encounter the table away from the KPI cards.

**What changed:**
- `shared/portfolio-analysis/portfolio-analysis.ts` — added `PortfolioAnalysis['derivedSignals']` as the explicit return type for `getDerivedSignals`.
- `shared/portfolio-analysis/portfolio-analysis.ts` — added `Pick<PortfolioAnalysis, 'campaignGroups' | 'channelGroups'>` as the explicit return type for `getClassificationGroups`.
- `features/campaign-performance/components/PerformanceInsights.vue` — created during exploration as a campaign-performance insight component, first using channel/campaign groups and later derived signals.
- `features/campaign-performance/components/PerformanceInsights.vue` — removed after deciding the standalone insight card duplicated the campaign scatterplot story.
- `features/campaign-performance/components/index.ts` — briefly exported `PerformanceInsights`, then removed the export when the component was deleted.
- `features/campaign-performance/CampaignPerformanceView.vue` — briefly rendered `PerformanceInsights`, then removed it from the charts grid.
- `features/campaign-performance/charts/PerformanceCharts.vue` — kept `PerformanceCharts` chart-only after removing insight-card responsibilities.
- `features/campaign-performance/charts/PerformanceCharts.vue` — made the conversion funnel card span both chart columns at `cq-1024` and above so the chart grid has no empty slot after removing the insight card.
- `features/campaign-performance/charts/PerformanceCharts.vue` — reduced `ConversionFunnelChart` height from `min-h-60` to `min-h-44` now that the funnel spans a wider area.
- `ui/primitives/Button.vue` — icon-only buttons now derive `title` from `aria-label` when no explicit title is provided.
- `features/campaign-performance/components/channel-filters/ChannelFiltersDialog.vue` — marked the filter trigger button as `icon-only` so it receives a matching hover title from its `aria-label`.
- `ui/forms/PasswordInput.vue` — marked the password visibility toggle as `icon-only`, so its `aria-label` also becomes the hover title.
- `features/campaign-performance/components/kpis/KpiCard.vue` — added an optional `labelTitle` prop and applies it to the KPI label.
- `features/campaign-performance/components/kpis/Kpis.vue` — added KPI-card label titles for `CTR` (`Click-through Rate`) and `CPA` (`Cost per Acquisition`).
- `features/campaign-performance/components/kpis/Kpis.vue` — added inline titles for meta-row acronyms `ROI` (`Return on Investment`) and `CVR` (`Conversion Rate`) inside KPI cards only.
- `ui/table/TableHeader.vue` — added optional `title` support to `DataTableColumn` and applies it to both the header cell and sortable header button.
- `features/campaign-performance/components/CampaignTable.vue` — added campaign-table header titles for `CTR` (`Click-through Rate`), `CVR` (`Conversion Rate`), `CPA` (`Cost per Acquisition`), and `ROI` (`Return on Investment`).

**Key decisions & why:**
- Reuse `PortfolioAnalysis` for helper return types — avoids duplicating analysis shapes and keeps private helpers aligned with the public analysis contract.
- Avoid group-based insight cards for narrow filters — classification groups are mandatory buckets, so they can create redundant or overconfident-looking insights when a filter leaves only one channel or campaign.
- Avoid a campaign-only derived-signal card beside the charts — the ROI/budget scatterplot already visualizes the campaign-level action story more effectively.
- Keep `PerformanceCharts` focused on charts — insight composition belongs in the feature view or in a purpose-built scatterplot companion, not inside the generic chart collection.
- Span the conversion funnel instead of leaving a blank grid cell — removing the insights card should improve the chart layout, not create awkward empty space.
- Reduce funnel height after widening it — a full-width funnel reads better as a shorter horizontal chart block than as a tall card.
- Derive icon-only button titles from `aria-label` — icon buttons already need accessible labels, so reusing that text for `title` avoids duplicated title props and keeps hover hints consistent.
- Add titles where the user may meet acronyms out of context — KPI cards introduce the terminology, but campaign table users can be visually away from the cards, so table headers also expose the same acronym expansions.
- Do not repeat acronym titles everywhere — chart titles and axis labels keep using the product terminology without extra title wiring; KPI cards and dense table headers are the useful glossary surfaces.
- Build verification still stops on existing unrelated TypeScript errors in `app/utils/map-analysis-context.ts` (`AiAnalysisContext` and `CampaignPerformanceStore` export/type mismatches).


## [592] Add upload period and industry business context
**Type:** feature/refactor

**Summary:** Extended the upload-data form so each portfolio now carries required campaign period metadata and optional industry context. The period is entered as localized From/To dates, validated at the fieldset level, normalized into ISO dates, stored on the portfolio, and forwarded into AI analysis context.

**Brainstorming:** The analysis prompts were missing business context that a marketer would naturally expect: what period the uploaded data covers and what industry the campaign belongs to. Period should not live as loose AI-only metadata because it describes the uploaded portfolio itself. Industry is useful but not always known, so it belongs beside the portfolio as optional context. The form needed to accept one date format for now, but hardcoding `DD/MM/YYYY` would make the UI drift from the app formatting conventions. The better approach was to derive the accepted format and example from `APP_LOCALE`, validate both dates together as a period fieldset, and emit normalized ISO dates into the portfolio model.

**Prompt:** In the upload data modal form, add three inputs: From date, To date, and optional Industry. Group From and To under a Period fieldset. Period is required, industry is optional, and From must be less than or equal to To. Use the locale from the formatting file and accept one date format for now. If the range is invalid, show the error at the fieldset level from an accessibility perspective. Then make period and industry reach the analysis calls as business context.

**What changed:**
- `features/data-transfer/components/UploadDataForm.vue` — added `periodFrom`, `periodTo`, and `industry` props plus matching `update:*` emits.
- `features/data-transfer/components/UploadDataForm.vue` — added a required `Period` fieldset with From and To inputs, a localized date-format hint, and one fieldset-level validation error.
- `features/data-transfer/components/UploadDataForm.vue` — derives the accepted date pattern and example from `APP_LOCALE` through `Intl.DateTimeFormat.formatToParts`.
- `features/data-transfer/components/UploadDataForm.vue` — validates required title, required period, valid localized dates, `from <= to`, and required CSV file before submitting.
- `features/data-transfer/components/UploadDataForm.vue` — normalizes valid dates to ISO `YYYY-MM-DD` strings before emitting `PortfolioDetails`.
- `features/data-transfer/components/UploadDataForm.vue` — added an optional Industry input and emits `industry: undefined` when the field is empty.
- `features/data-transfer/components/UploadDataModal.vue` — lifted period and industry state beside title/file state so values survive row-error and duplicate-review view switches.
- `features/data-transfer/components/UploadDataModal.vue` — resets title, period, industry, file, parsing errors, row errors, valid campaigns, duplicate groups, and pending portfolio details on close.
- `features/data-transfer/components/UploadDataModal.vue` — stores pending `PortfolioDetails` while CSV validation screens are active, then combines those details with valid/selected campaigns into a `PortfolioInput`.
- `app/composables/useUploadModal.ts` — accepts the new `PortfolioInput` shape from the modal and passes it into the portfolio store.
- `shared/portfolio/types/portfolio.ts` — introduced `Period`, `BusinessContext`, `PortfolioDetails`, and `PortfolioInput`.
- `shared/portfolio/types/portfolio.ts` — made `Portfolio` carry `name`, required `period`, optional `industry`, `channelMap`, `analysis`, and `uploadedAt`.
- `shared/portfolio/portfolio.store.ts` — stores period and industry on each portfolio entry and computes portfolio analysis from the uploaded campaigns.
- `features/campaign-performance/stores/campaignPerformance.store.ts` — exposes `businessContext` from the active portfolio so campaign filters and AI analysis can share the same contextual metadata.
- `app/utils/map-analysis-context.ts` and `app/stores/dashboardOrchestrator.store.ts` — include `businessContext` in the mapped analysis context and only set AI analysis context when an active portfolio and business context are both available.
- `features/ai-tools/ai-analysis/stores/aiAnalysis.store.ts` — passes `businessContext` into `runAnalysisPrompt` for both analysis tabs.
- `features/ai-tools/prompts/business-context.ts`, `executive-summary-prompt2.ts`, and `budget-optimization-prompt2.ts` — consume the portfolio `BusinessContext` shape so active prompts can include period and industry context.
- `app/dev-mode/dev-portfolio-data.ts` — supplies a sample period and industry for seeded dev data.

**Key decisions & why:**
- Period belongs to the portfolio — it describes the uploaded dataset, not only an AI prompt request.
- Industry is optional — useful context when available, but it should not block data upload.
- Store dates as ISO strings — UI can accept localized input while the domain model stays stable and easy to serialize.
- Validate the date range at fieldset level — the error concerns the relationship between From and To, so the accessible error belongs to the grouped Period control.
- Derive the date label from `APP_LOCALE` — the form and formatting utilities stay aligned even if the app locale changes.
- Keep `BusinessContext` in shared portfolio types — AI analysis consumes it, but does not own the business metadata model.
- Preserve upload validation flow — row-error and duplicate-review screens keep using the same pending portfolio details instead of dropping the newly entered context.


## [593] Consolidate portfolio domain types and remove remaining type smells
**Type:** refactor

**Summary:** Cleaned up the portfolio and analysis type boundaries after adding business context. The old `portfolioData` store and `shared/portfolio-analysis` folder were consolidated into a shared `portfolio` domain module, confusing analysis context names were made explicit, broad `unknown`/barrel exports were removed, and UI/chart/dev-mode type smells were tightened. The app now builds successfully with only the existing Vite chunk-size warning.

**Brainstorming:** Once period and industry became part of the uploaded portfolio, the older model names started fighting the architecture. `PortfolioEntry`, `portfolioData`, `BusinessContext` inside AI analysis, and a separate `shared/portfolio-analysis` folder made it unclear which layer owned the portfolio model. The cleaner rule is: raw campaign/channel data lives in `shared/data`; portfolio state, portfolio metadata, portfolio analysis, and analysis-derived types live in `shared/portfolio`; AI analysis receives an explicit request context but does not define the portfolio’s business metadata. After that boundary was clarified, the remaining type cleanup was mostly about removing accidental indirection: no broad `unknown` source shape in the mapper, no data re-export from `shared/types`, no AI-side `BusinessContext` re-export, no `TabDisplay` casts, and no loose chart scale option record.

**Prompt:** Clean up confusing portfolio and analysis interfaces step by step. Move portfolio models and portfolio analysis under a shared portfolio domain, rename raw campaign metric types clearly, make period part of the portfolio, remove redundant or AI-owned copies of business context, keep legacy prompt files isolated for future work, then rescan the codebase for type smells excluding prompts and fix the remaining concrete issues.

**What changed:**
- `shared/portfolio/` — introduced the portfolio domain module with `index.ts`, `portfolio.store.ts`, `analysis/`, and `types/`.
- `shared/portfolio-analysis/` — removed the old standalone analysis folder after moving its analysis functions, classification helpers, signals, ranking, metrics, and types into `shared/portfolio`.
- `app/stores/portfolioData.store.ts` — removed the old app-level portfolio data store.
- `shared/portfolio/portfolio.store.ts` — replaced `usePortfolioDataStore` with `usePortfolioStore`.
- `shared/portfolio/types/portfolio.ts` — replaced `PortfolioEntry` with the domain `Portfolio` model and introduced `PortfolioInput`, `PortfolioDetails`, `BusinessContext`, and `Period`.
- `shared/data/types/campaign.ts` — renamed `CampaignMetrics` to `CampaignRawMetrics` so uploaded CSV metrics are clearly distinguished from computed campaign performance.
- `shared/data/types/portfolio.ts` / `shared/portfolio/types/portfolio.ts` — moved `PortfolioKPIs` into the portfolio domain because aggregate KPIs describe the portfolio, not a raw campaign.
- `shared/data/types/index.ts` and `shared/portfolio/types/index.ts` — adjusted exports so raw data types and portfolio-domain types are available from their own modules.
- `shared/portfolio/analysis/portfolio-analysis.ts` — kept analysis output typed from `PortfolioAnalysis`, including explicit return types for classification groups and derived signals.
- `app/stores/index.ts`, `app/composables/useUploadModal.ts`, `app/dev-mode/dev-portfolio-data.ts`, and feature stores — updated imports/usages from the old app store to `usePortfolioStore`.
- `features/campaign-performance/stores/campaignPerformance.store.ts` — now reads active portfolio data from `usePortfolioStore`, recomputes filtered analysis when channel filters are active, and exposes active `businessContext`.
- `app/utils/map-analysis-context.ts` — replaced store-specific return typing and broad `unknown` fields with a structural source interface using concrete `Channel`, `CampaignPerformance`, `PortfolioAnalysis`, and `BusinessContext` types.
- `app/stores/dashboardOrchestrator.store.ts` — maps campaign-performance state into `AiAnalysisRequestContext`, guards against missing portfolio/business context, and keeps AI analysis feature-agnostic.
- `features/ai-tools/ai-analysis/types/context.types.ts` — renamed analysis context types to explicit names: `AnalysisPromptContext`, `AnalysisProviderState`, `AnalysisPortfolioContext`, and `AiAnalysisRequestContext`.
- `features/ai-tools/ai-analysis/types/context.types.ts` — removed the AI-owned `BusinessContext` shape and imports the portfolio-owned `BusinessContext` instead.
- `features/ai-tools/ai-analysis/types/context.types.ts` — made `AiAnalysisRequestContext.businessContext` and `AnalysisPromptContext.businessContext` required for app analysis calls.
- `features/ai-tools/ai-analysis/utils/analysis-prompt.ts` — normalized `PortfolioAnalysis` import to `@/shared/portfolio` and requires business context in the prompt context.
- `features/ai-tools/ai-analysis/stores/aiAnalysis.store.config.ts` — added `createTabDisplay<T>()` to initialize typed tab display state without `as TabDisplay<...>` casts.
- `features/ai-tools/ai-analysis/stores/aiAnalysis.store.ts` — replaced tab-display casts with the typed factory and forwards business context into prompt execution.
- `shared/types/index.ts` — removed the accidental `../data` re-export so `@/shared/types` stays reserved for generic app types like `AsyncStatus`.
- `shared/portfolio/analysis/index.ts` — removed `export * from '../types'` so the analysis barrel exports analysis functions only; portfolio-level barrels still expose both analysis and types intentionally.
- `ui/charts/composables/useChartScales.ts` — replaced `Record<string, unknown>` and open index signatures with Chart.js scale/tick option types.
- `app/dev-mode/config.ts`, `app/dev-mode/types.ts`, `app/dev-mode/index.ts`, and `app/dev-mode/dev-portfolio-data.ts` — renamed `portfolioData` dev-mode config to `portfolio` and renamed the activation helper to `activateDevPortfolio`.
- `features/data-transfer/types/index.ts` and data-transfer validation components/utilities — fixed the non-prompt `Campain` typo in campaign validation/duplication types and component naming.
- Legacy prompt files — left structurally isolated for future prompt work; only imports required for current compilation were adjusted to reference the shared portfolio `BusinessContext`.

**Key decisions & why:**
- Use `shared/portfolio` as the domain boundary — portfolio state, metadata, aggregate KPIs, and portfolio analysis belong together because they represent the uploaded portfolio, not a raw CSV row.
- Keep `shared/data` raw — campaign and channel raw/computed data types remain reusable without knowing about portfolio storage or AI analysis.
- Make naming explicit instead of generic — `AiAnalysisRequestContext` and `AnalysisPromptContext` describe where the data is used, while `BusinessContext` stays domain-owned.
- Prefer structural mapper input over store return types — `mapAnalysisContext` should depend on the shape it needs, not on the concrete Pinia store type.
- Remove broad barrels that hide ownership — `shared/types` should not secretly export data models, and `portfolio/analysis` should not silently export portfolio types.
- Require business context at the app analysis boundary — the upload flow now guarantees period metadata, so analysis calls should not pretend it may be absent.
- Keep prompt fallback optional only inside prompt-specific utilities — legacy and future prompt work can handle fallbacks locally without weakening the app-level contract.
- Replace casts with factories where possible — `createTabDisplay<T>()` preserves generic response typing without asking TypeScript to trust an assertion.
- Type Chart.js wrappers with Chart.js types — the chart scale helper still abstracts theme defaults, but its public options now follow the chart library rather than an arbitrary unknown record.
- Verify by scanning, then building — targeted scans excluding prompts showed no remaining concrete type smells, and `npm run build` passes with only the existing Vite chunk-size warning.


## [594] Move chip counts to channel filters and expose line color utilities
**Type:** refactor

**Summary:** Kept the shared `Chip` primitive generic by removing count-specific behavior, moved the channel count badge markup and styling into `ChannelFilterChips`, and added reusable Tailwind `line` color utilities that mirror the app border scale for backgrounds, text, and rings.

**Brainstorming:** The chip count looked reusable at first, but it was actually feature-specific: the number represents campaign counts inside channel filters, not a generic primitive responsibility. Keeping `count` inside `Chip` would make every chip carry channel-filter assumptions and styling pressure. The better boundary is for `Chip` to own the interactive pill shell and for `ChannelFilterChips` to project its own count badge through the slot. Separately, the existing `borderColor` tokens already exposed `border`, `border-faint`, `border-subtle`, `border-strong`, and `border-darker`, but those values were locked to border utilities. The needed system token was not an `action` color family; it was a neutral line/divider scale that can also be used for backgrounds, text, and rings.

**Prompt:** Remove count from the shared chip primitive and move the count behavior and styling into `ChannelFilterChips`. Then add Tailwind color utilities for the existing border scale so the same values can be used as backgrounds or other color utilities. Avoid misleading names like `action`; use a token name that does not imply buttons or interactions.

**What changed:**
- `ui/primitives/Chip.vue` — removed the `count` prop from the primitive API.
- `ui/primitives/Chip.vue` — removed the internal count badge markup and `.chip-count` styles.
- `ui/primitives/Chip.vue` — kept the primitive focused on chip shell states: default, active, readonly, hover, and focus.
- `features/campaign-performance/components/channel-filters/ChannelFilterChips.vue` — renders the “All” and per-channel campaign counts inside the chip slot.
- `features/campaign-performance/components/channel-filters/ChannelFilterChips.vue` — added local `.channel-chip-count` styling so the feature owns its count badge surface.
- `features/campaign-performance/components/channel-filters/ChannelFilterChips.vue` — added active and hover/focus adjustments for the channel count badge through scoped deep selectors.
- `tailwind.config.js` — added a `line` color family that mirrors the existing border token scale: `DEFAULT`, `faint`, `subtle`, `strong`, and `darker`.
- `tailwind.config.js` — kept the existing `borderColor` aliases unchanged so `border`, `border-faint`, `border-subtle`, `border-strong`, and `border-darker` continue to work.
- `styles/themes/dark/_tokens.scss` — removed the unused experimental `action` token section after deciding the name implied interaction/button semantics.
- `ui/primitives/Button.vue` — reverted the experimental action-token usage so button styles remain unchanged while the new line utilities are introduced independently.

**Key decisions & why:**
- Keep primitives domain-neutral — `Chip` should not know about campaign counts or channel-filter badge treatment.
- Let features own feature data presentation — channel counts belong in `ChannelFilterChips`, where the data and interaction context already live.
- Use slots for composed chip content — the primitive still provides the shell, while feature markup can add badges or other inline details without expanding the primitive API.
- Use `line` instead of `action` — the color scale describes borders/dividers/visual lines, not interaction intent.
- Preserve existing border utilities — adding `line` should extend available utilities (`bg-line-faint`, `ring-line-subtle`, `text-line-strong`) without breaking `border-faint` and related classes.
- Avoid applying new utilities globally in the same pass — Tailwind tokens were added as system capability, while component restyling stays deliberate and local.
- Verified with `npm run build` — the app builds successfully with only the existing Vite chunk-size warning.


## [595] Build reusable upload form controls and improve modal accessibility
**Type:** feature/refactor

**Summary:** Reworked the upload-data form around reusable form primitives, extracted date/file/required validation helpers, improved field feedback and accessible error wiring, cleaned the upload placeholder back to a simple empty state, and upgraded modal ARIA/focus behavior with typed initial-focus targets. Button variants and theme tokens also gained small additions needed by the refreshed form and modal surfaces.

**Brainstorming:** The upload modal had grown from a simple file picker into a real form with report metadata, a required reporting period, optional industry context, file validation, and multiple feedback states. Keeping label, hint, error, and layout behavior inside each field would make the form hard to maintain and inconsistent across future inputs. The better boundary is a small UI form layer: `Form` owns spacing, `FormControl` owns label/control/feedback wiring, `FormFieldFeedback` owns hint/error display and transitions, and specialized inputs like `DateField`, `PeriodFields`, and `FileDropzone` own their validation events. At the same time, modal keyboard behavior belonged in `Modal.vue`, not in feature modals: the upload form wants initial focus on the first form control, confirmation dialogs may want footer actions, and review screens should focus the content. Finally, the temporary upload form preview inside `UploadDataPlaceholder` was useful for styling but needed to be removed so the placeholder stayed a clean empty-state CTA.

**Prompt:** Continue polishing the upload form. Add reusable validation helpers and form primitives, move form-control styles out of global SCSS and into scoped components, make fields show either a hint or an error with accessible `aria-describedby` wiring, validate period dates and file requirements properly, and keep visual feedback smooth. Then fix modal ARIA/focus so upload opens on the form, confirmation dialogs can focus footer actions, and content screens can focus the body. Remove the temporary form from the upload placeholder, inline the over-small `TransferActions` component, add needed button variants/tokens, and verify with a build.

**What changed:**
- `ui/forms/Form.vue` — added a native form wrapper primitive with typed spacing variants and a form container-query boundary.
- `ui/forms/FormControl.vue` — added a reusable control wrapper for label/legend, required indicator, invalid state, scoped `.form-control` styling, and automatic `aria-describedby` ids.
- `ui/forms/FormFieldFeedback.vue` — extracted hint/error/error-hint rendering into a reusable feedback component with one-message-at-a-time behavior and smooth error transitions.
- `ui/forms/DateField.vue` — added a reusable typed date input that validates on blur, emits validation results, accepts a placeholder prop, and defaults to the current shared date-format example.
- `ui/forms/PeriodFields.vue` — added a reusable period fieldset with Start Date and End Date controls, per-field date validation, cross-field `from <= to` validation, fieldset-level feedback, and `DD/MM/YYYY` placeholders.
- `ui/forms/validation/required.validation.ts` — extracted reusable required validation returning an error key.
- `ui/forms/validation/date-field.validation.ts` — extracted reusable date-field validation built on shared locale-date parsing.
- `ui/forms/validation/file.validation.ts` — extracted reusable file validation for required, accepted CSV type, and max-size checks.
- `shared/utils/date-format.ts` — added shared date parsing/format metadata for `DD/MM/YYYY`, ISO normalization, date examples, and strict invalid-format vs invalid-date error keys.
- `shared/utils/index.ts` — exported the new date-format utilities.
- `features/data-transfer/components/UploadDataForm.vue` — rebuilt the upload form with `Form`, `FormControl`, `PeriodFields`, and `FileDropzone` instead of ad hoc field markup.
- `features/data-transfer/components/UploadDataForm.vue` — added field-specific hint/error/error-hint copy for report name, period, and file upload.
- `features/data-transfer/components/UploadDataForm.vue` — validates report name, period, file type, file size, required file, and parser errors through the new validation primitives before submit.
- `features/data-transfer/components/UploadDataForm.vue` — imports `MAX_CSV_FILE_SIZE_BYTES` from the data-transfer parser utilities so the UI and parser share the same file-size limit.
- `features/data-transfer/utils/parse-csv.ts` and `features/data-transfer/utils/index.ts` — exported `MAX_CSV_FILE_SIZE_BYTES` for reuse by the upload form.
- `ui/forms/FileDropzone.vue` — moved to explicit validation events, shows rejected file names for invalid file type/size, clears stale required errors after successful file selection, and only runs required validation after the field has been touched/blurred.
- `ui/forms/FileDropzone.vue` — accepts a required `accept` prop, uses the default “Drag & drop a file here or browse” message when no hint is supplied, and supports `invalid`/`describedBy` from `FormControl`.
- `styles/components/_forms.scss` and `styles/components/index.scss` — removed the old global form-control styles after moving form styling into scoped UI form components.
- `styles/index.scss` — removed the now-empty components style import.
- `ui/forms/PasswordInput.vue` — simplified password input error handling to accept external `invalid` and `describedBy` props, aligning it with the new `FormControl` model.
- `features/ai-tools/ai-connection/components/AiConnectionForm.vue` — migrated from the removed global `.form` class to the new `Form` wrapper.
- `features/data-transfer/components/UploadDataPlaceholder.vue` — removed the temporary embedded `UploadDataForm` preview and restored the empty-state upload CTA.
- `features/data-transfer/components/TransferActions.vue` — deleted the tiny action wrapper after inlining its upload/download buttons into `UploadDataPlaceholder`.
- `features/data-transfer/components/index.ts` — removed the deleted `TransferActions` export.
- `features/data-transfer/components/UploadDataModal.vue` — sets modal initial focus to `first-control` for the upload form and `content` for review screens.
- `features/data-transfer/components/ReplaceDataModal.vue` — sets modal initial focus to `footer-actions` for the confirmation action flow.
- `ui/modal/modal.types.ts` — added typed `ModalSize` and `ModalInitialFocus` definitions.
- `ui/modal/Modal.vue` — added typed `initialFocus` support for `content`, `first-control`, `footer-actions`, and `close`.
- `ui/modal/Modal.vue` — added focus trapping, Escape close handling, focus restoration on close, and scoped focus lookup so first-control only searches inside the modal body.
- `ui/modal/Modal.vue` — switched dialog labeling from `aria-label` to `aria-labelledby` using a generated title id.
- `ui/modal/composables/useModalAria.ts` — extracted reusable modal ARIA id/attribute setup for future dialog-like primitives.
- `ui/modal/ModalHeader.vue` — accepts `titleId`, applies it to the heading, and marks the close button as the close focus target.
- `ui/modal/ModalBody.vue` — marks the body as the content focus target and removes visible outline for programmatic body focus.
- `ui/modal/ModalFooter.vue` — marks the footer as the footer-actions focus target.
- `ui/modal/index.ts` — exports modal types and the new modal composable.
- `ui/primitives/button.types.ts` and `ui/primitives/Button.vue` — added `accent-outline` and `ghost-outline` button variants.
- `styles/themes/dark/_palette.scss`, `styles/themes/dark/_tokens.scss`, and `tailwind.config.js` — added a darker/fainter typography token exposed as `text-typography-faint`.
- `ui/feedback/Notification.vue` and `ui/toast/ToastNotification.vue` — tightened notification spacing and made the toast dismiss button use the small icon-button size.
- `ui/forms/RadioItem.vue` — adjusted radio indicator sizing after the form-control visual pass.
- `ui/meta/MetaRow.vue` — cleaned small SCSS/style details while preserving the typed meta-row API.

**Key decisions & why:**
- Put form layout in UI primitives — upload metadata fields are not unique enough to justify one-off label/error/layout code in the feature component.
- Keep validation reusable but not over-abstracted — `required`, date, and file validators return simple error keys that parents can map to product copy.
- Let parents own error copy — validation helpers identify the problem, while feature forms decide the exact message and tone.
- Use `FormFieldFeedback` for both controls and grouped fields — the same hint/error transition should work for a single input and a period fieldset.
- Show hint OR error, not both — this keeps field feedback calm and avoids stacked helper text that competes with errors.
- Keep period range errors at fieldset level — the range error describes the relationship between two dates, while individual invalid/required dates stay attached to their fields.
- Use `DD/MM/YYYY` as the placeholder — the placeholder communicates the accepted input shape, while error messages can still show an example date.
- Keep rejected file names visible for invalid files — users need to know which dropped/selected file failed validation, especially for wrong type or oversized files.
- Remove global form-control SCSS — scoped form primitives make the UI library easier to reason about and reduce global style coupling.
- Treat modal focus as a primitive concern — feature modals state intent with `initial-focus`; the modal layer handles selectors, focus trap, Escape, and restoration.
- Add `footer-actions` as a first-class focus target — destructive/confirmation dialogs often want the primary decision area focused before content controls.
- Use a modal ARIA composable — id generation and ARIA attributes are reusable dialog mechanics and should not stay embedded directly in the template.
- Inline `TransferActions` — two buttons used by one placeholder did not justify a separate feature component.
- Keep placeholder production-focused — temporary form-preview markup was removed once visual work moved back into the modal form.
- Verified with `npm run build` — the app builds successfully with only the existing Vite chunk-size warning.


## [596] Surface portfolio context and tighten modal/chart accessibility
**Type:** feature/refactor

**Summary:** Added portfolio period and industry metadata to the campaign dashboard header, simplified aria-label handling for root-level UI/chart components, added explicit modal backdrop-close control, and tightened the upload validation review actions so each button label matches the actual next screen.

**Brainstorming:** Once uploaded portfolios started carrying required period data and optional industry, the dashboard header needed to show that business context near the portfolio name rather than hiding it inside analysis prompts. At the same time, several first-level components were carrying `ariaLabel` props even though Vue already forwards attributes to root elements; that made the UI API noisier than necessary. The better rule is to let consumers pass native `aria-label` directly to root-level components, while keeping explicit aria props only when a component needs to place the label on a nested control. Modal behavior needed one additional escape hatch: upload data should not close from an accidental backdrop click during multi-step validation, but Escape and explicit close controls should continue to work. The review screens also needed clearer action copy, because the same back action can return either to the upload form or to the row-error table depending on the validation path.

**Prompt:** Add period and industry to the dashboard header metadata after the portfolio name. Check root components that receive aria labels as props and move labels to native attribute fallthrough where possible. Add a modal option to prevent backdrop close and make the upload-data modal use it. Then fix duplicate-campaign review actions so the primary back button says `Fix file` when it returns to the form and `Review errors` when it returns to the error table.

**What changed:**
- `features/campaign-performance/CampaignPerformanceView.vue` — passes `store.businessContext` into `CampaignPerformanceHeader`.
- `features/campaign-performance/components/CampaignPerformanceHeader.vue` — accepts `BusinessContext | null` and renders period and optional industry immediately after the portfolio name.
- `features/campaign-performance/components/CampaignPerformanceHeader.vue` — split portfolio metadata and filter metadata into two `MetaRow` instances so business context and filter context read as separate groups.
- `features/campaign-performance/components/CampaignPerformanceHeader.vue` — keeps the AI connected dot next to the AI button while tightening header spacing.
- `shared/utils/date-format.ts` — added `formatIsoDate` and `formatIsoDateRange` using `APP_LOCALE` so stored ISO portfolio dates render as localized dashboard copy.
- `ui/meta/meta.types.ts` — added the `base` meta-row size.
- `ui/meta/MetaRow.vue` — supports the new `base` text size.
- `ui/meta/MetaItem.vue` — removed the forced `leading-none` so multi-row header metadata has healthier line-height.
- `ui/dropdown/DropdownPanel.vue` — removed the root-level `ariaLabel` prop and now relies on native `aria-label` attribute fallthrough.
- `ui/charts/components/BarChart.vue` — removed the `ariaLabel` prop, disabled automatic inheritance, and applies native `$attrs` plus a computed `aria-label` fallback on the chart root.
- `ui/charts/components/GroupedBarChart.vue` — moved chart labeling from `ariaLabel` prop to native `aria-label` fallthrough with a fallback.
- `ui/charts/components/DonutChart.vue` — moved chart labeling from `ariaLabel` prop to native `aria-label` fallthrough with a fallback.
- `ui/charts/components/BubbleChart.vue` — moved chart labeling from `ariaLabel` prop to native `aria-label` fallthrough with a fallback.
- `features/campaign-performance/charts/components/RoiBarChart.vue` — removed the pass-through `ariaLabel` prop so consumers pass `aria-label` directly to the underlying chart component.
- `features/campaign-performance/charts/components/RevenueVsBudgetBars.vue` — removed the pass-through `ariaLabel` prop.
- `features/campaign-performance/charts/components/BudgetShareDonutChart.vue` — removed the pass-through `ariaLabel` prop.
- `features/campaign-performance/charts/components/ConversionFunnelChart.vue` — moved from an `ariaLabel` prop to native `aria-label` fallthrough with a default funnel label.
- `features/campaign-performance/charts/components/EfficiencyGapBars.vue` — separates wrapper attrs from chart labeling so `aria-label` reaches the inner chart while other attrs remain on the wrapper.
- `ui/modal/Modal.vue` — added a typed `closeOnBackdrop` prop with a default of `true`.
- `ui/modal/Modal.vue` — routes backdrop clicks through `handleBackdropClick`, allowing modals to opt out of backdrop close without changing Escape behavior.
- `features/data-transfer/components/UploadDataModal.vue` — sets `:close-on-backdrop="false"` so upload and validation state is not lost by an accidental outside click.
- `features/data-transfer/components/UploadDataModal.vue` — passes a dynamic duplicate-review back label based on whether row errors still exist.
- `features/data-transfer/components/data-validation/review-duplications/ReviewDuplicatedCampaigns.vue` — accepts `backLabel` and renders `Review errors` or `Fix file` according to the actual destination.
- `features/data-transfer/components/data-validation/review-duplications/ReviewDuplicatedCampaigns.vue` — reordered footer actions to keep `Cancel` separated, `Import selected rows` as the secondary action, and the destination-aware back action as primary.
- `features/data-transfer/components/data-validation/review-errors/ReviewErrorsComponent.vue` — simplified footer actions to `Cancel`, `Import N valid rows`, and `Fix file`.
- `features/data-transfer/components/data-validation/review-errors/ReviewErrorsComponent.vue` — removed periods from short validation copy and clarified that valid rows can be imported or the file can be fixed.
- `features/data-transfer/components/data-validation/shared/DuplicateSummary.vue` — clarified duplicate copy so unselected duplicate groups “will not be imported” instead of “skipped.”
- `features/data-transfer/components/data-validation/review-duplications/DuplicationsHeader.vue` — changed the unresolved duplicate badge copy from `Select one` to `Choose one`.
- `features/data-transfer/components/ReplaceDataModal.vue` — softened the destructive copy, reordered footer actions, and keeps cancel visually separated.
- `app/pages/DashboardPage.vue` — updated the empty-dashboard upload CTA from `Upload CSV` to `Upload data`.
- `ui/primitives/Button.vue` — adjusted primary button typography colors, kept `accent-outline`, and removed stale commented-out ghost-outline experimentation.

**Key decisions & why:**
- Show business context in the dashboard header — period and industry describe the active portfolio and should be visible before users ask AI for analysis.
- Format stored ISO dates at the edge — portfolio dates remain stable in the model, while UI copy uses `APP_LOCALE`.
- Keep metadata grouped by meaning — portfolio identity/context and current filter scope are related, but they should not read as one long flat sentence.
- Prefer native attribute fallthrough for root accessibility labels — root-level `ariaLabel` props duplicate Vue behavior and make component APIs heavier.
- Keep explicit aria props only for nested targets — table columns and radio inputs still need explicit labels because the final accessible element is not the component root.
- Disable chart attr inheritance deliberately — chart components need to put attrs on the accessible chart wrapper, not accidentally on an inner Chart.js component.
- Preserve useful chart label fallbacks — consumers can pass `aria-label`, but charts still have sensible labels when they do not.
- Make backdrop close opt-out, not opt-in — most modals can close on backdrop by default, while multi-step upload validation protects user progress.
- Keep Escape close behavior unchanged — the requested guard only concerns backdrop clicks, so keyboard close remains available.
- Make review action labels destination-aware — `Back` or a hard-coded `Fix file` hides whether the user is returning to the form or to row-error review.
- Use clearer import language in validation flows — “Import selected rows” and “Import N valid rows” explain the consequence better than generic proceed labels.
- Verified with `npm run build` — the app builds successfully with only the existing Vite chunk-size warning.


## [597] Polish AI panel forms, idle states, and analysis context metadata
**Type:** feature/refactor

**Summary:** Refined the AI assistant panel experience by adding portfolio period/industry context to analysis headers, making idle analysis states more reusable, improving AI connection form validation/reset behavior, and tightening password-field focus/error interactions. This pass also included small visual consistency updates across analysis cards, badges, and campaign header metadata.

**Brainstorming:** The AI panel had two kinds of state that needed clearer boundaries. Analysis display state should be owned by `AnalysisState`, while each analysis view should still own its exact idle copy and result markup. Connection form state should be local to the form and reset when the panel closes, but it should not disconnect the user or mutate durable connection status. The API key field should behave like a real required form field instead of disabling the primary action before the user can submit. For metadata, period and industry are useful in the AI modal context but noisy in the desktop side panel, so the analysis header needed responsive visibility that matches the drawer behavior.

**Prompt:** Clean up AI analysis idle-state rendering, add period and industry after the analysis header, show that metadata only in the modal layout, make the Connect button stay enabled while the API key field is required, clear field errors on input/change without live revalidation, reset the connection form when the panel closes without affecting connection status, and fix password-toggle focus so active/error states do not get stuck.

**What changed:**
- `features/ai-tools/ai-analysis/ui/AnalysisState.vue` — replaced the old `state` slot with an `idle` slot wrapped by a single `.idle` container owned by the state component.
- `features/ai-tools/ai-analysis/ui/AnalysisState.vue` — moved common idle paragraph styling into the idle container using scoped deep styling for direct child paragraphs.
- `features/ai-tools/ai-analysis/executive-summary/ExecutiveSummaryAnalysis.vue` — updated to use the new `#idle` slot and removed repeated idle paragraph utility classes.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetOptimizationAnalysis.vue` — updated to use the new `#idle` slot while preserving the minimum-campaign warning notification.
- `features/ai-tools/ai-analysis/executive-summary/ExecutiveSummaryAnalysis.vue` — grouped the health reasoning, bottom line title, and bottom line copy into a response section for cleaner spacing.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetOptimizationAnalysis.vue` — moved `AnalysisResponseMeta` after the summary/recommendations content to align with the refreshed analysis response flow.
- `features/ai-tools/ai-analysis/ui/AnalysisResponseMeta.vue` — switched metadata separators from divider to bullet and removed extra vertical padding.
- `features/ai-tools/ai-analysis/components/AiAnalysis.vue` — added bottom padding and cleaned panel container spacing so analysis content has breathing room at the bottom of the drawer.
- `features/ai-tools/ai-analysis/types/context.types.ts` — added `businessContext` to `AnalysisPortfolioContext`.
- `features/ai-tools/ai-analysis/stores/aiAnalysis.store.config.ts` — updated `DEFAULT_PORTFOLIO_CONTEXT` with `businessContext: null`.
- `features/ai-tools/ai-analysis/ui/AnalysisHeader.vue` — renders portfolio period and optional industry from `businessContext` alongside portfolio, channel, and campaign metadata.
- `features/ai-tools/ai-analysis/ui/AnalysisHeader.vue` — formats the analysis period with `formatIsoDateRange`.
- `features/ai-tools/ai-analysis/ui/AnalysisHeader.vue` — shows the metadata row only in the mobile/modal drawer layout with `flex lg:hidden`.
- `features/ai-tools/ai-analysis/ui/AnalysisHeader.vue` — keeps the analyze action button from shrinking in tighter header layouts.
- `features/ai-tools/components/AiTools.vue` — accepts `panelOpen` and increments a local reset key when the panel closes.
- `app/pages/DashboardPage.vue` — passes `dashboard.aiPanelOpen` into `AiTools` so AI tools can react to panel close.
- `features/ai-tools/ai-connection/components/AiConnectionForm.vue` — accepts `resetKey` and resets local provider, API key, required error, and transient connection error when the panel closes.
- `features/ai-tools/ai-connection/components/AiConnectionForm.vue` — made API Key a required form field and validates it on blur and submit.
- `features/ai-tools/ai-connection/components/AiConnectionForm.vue` — keeps the Connect button enabled unless a connection request is already running.
- `features/ai-tools/ai-connection/components/AiConnectionForm.vue` — clears required-field and provider connection errors when the user edits the API key or changes provider.
- `features/ai-tools/ai-connection/utils/error-handling.ts` — removed the trailing period from the invalid-key hint to match the app’s form copy style.
- `ui/forms/PasswordInput.vue` — emits `blur` from the real password input so parent forms can validate required state.
- `ui/forms/PasswordInput.vue` — blurs the visibility-toggle button after pointer activation so the wrapper does not remain in a stuck `focus-within` visual state.
- `ui/forms/PasswordInput.vue` — preserves keyboard focus behavior for the visibility toggle while fixing pointer-click active-state behavior.
- `ui/forms/PasswordInput.vue` — applies stronger interactive border/text states when the password input wrapper is hovered or focused.
- `ui/forms/FormControl.vue` — allows invalid controls to still show normal hover/focus interactive colors instead of staying locked in the static danger state.
- `features/data-transfer/components/UploadDataForm.vue` — clears the report-name required error as soon as the user types.
- `ui/forms/PeriodFields.vue` — clears start/end date errors and the cross-field range error when either period field changes, without revalidating until blur or submit.
- `features/ai-tools/ai-connection/components/AiConnectedStatus.vue` — tightened connected-status spacing.
- `features/ai-tools/ai-analysis/budget-optimization/BudgetRecommendations.vue` — adjusted recommendation emphasis colors for destination campaign and positive estimated impact values.
- `features/ai-tools/ai-analysis/executive-summary/PriorityActions.vue` — simplified success-metric row styling by removing the extra tinted background/border treatment.
- `ui/card/Card.vue` — moved card background to `bg-surface-overlay` for the refreshed analysis surfaces.
- `ui/primitives/Badge.vue` — normalized formatting and moved rounded/soft-rounded shape styling to the badge root while keeping body rounding in sync.
- `features/campaign-performance/components/CampaignPerformanceHeader.vue` — tightened header gaps, added stable title height, adjusted metadata spacing, and slightly enlarged/repositioned the connected status dot.

**Key decisions & why:**
- Keep idle layout in `AnalysisState` — the state component owns consistent idle spacing, while feature views own their exact idle copy or warning content.
- Rename the slot to `idle` — the slot now describes the actual state it renders instead of using the generic `state` name.
- Keep result markup in each analysis view — summary and optimizer responses have different structure and should not be over-abstracted into the state wrapper.
- Add business context to `AnalysisPortfolioContext` — the analysis header needs the same portfolio context that prompts already use, without reaching into unrelated stores.
- Show analysis metadata only in modal layout — period and industry help when the AI tool is detached from the main dashboard, but the desktop side panel sits beside the dashboard header that already shows this context.
- Use responsive visibility for the modal-only metadata — the drawer behaves as a modal below `lg`, so `flex lg:hidden` maps directly to the UI behavior.
- Reset form-local state on panel close — closing the panel should clear abandoned input and transient errors, but should not disconnect an established AI connection.
- Keep Connect enabled — a required field should report its own validation error on blur/submit instead of hiding the action behind disabled state.
- Clear errors on edit without live validation — typing should remove stale errors, while blur and submit remain the deliberate validation moments.
- Preserve keyboard accessibility for the password toggle — pointer clicks should not leave a stuck active state, but keyboard users should keep focus where they navigated.
- Let invalid controls still react to interaction — error styling should communicate the problem, not prevent hover/focus affordances.
- Verified with `npm run build` — the app builds successfully with only the existing Vite chunk-size warning.


## [598] Bring modal accessibility behavior to responsive drawer dialogs
**Type:** refactor/accessibility

**Summary:** Updated the responsive drawer’s mobile modal path to use the same core accessibility behavior as the shared `Modal` component: generated title labeling, focus initialization, keyboard focus trapping, focus restoration, body-scroll locking, and Escape close handling. Desktop drawer behavior remains unchanged.

**Brainstorming:** `ResponsiveDrawer` behaves like two different surfaces: a desktop aside and a mobile modal dialog. The desktop aside should stay lightweight and visible in layout, but the mobile overlay is a real dialog and should follow the same accessibility contract as `Modal.vue`. Reusing the modal ARIA composable keeps title labeling consistent, while implementing focus handling inside `ResponsiveDrawer` avoids forcing the drawer through the full modal primitive and risking layout regressions.

**Prompt:** For `ResponsiveDrawer`, when it renders as a modal, implement the same ARIA functionality as the shared modal.

**What changed:**
- `ui/drawer/ResponsiveDrawer.vue` — imports and uses `useModalAria()` for generated `titleId` and dialog ARIA attributes.
- `ui/drawer/ResponsiveDrawer.vue` — replaces the mobile dialog’s `aria-label` with `aria-labelledby` via `v-bind="dialogAria"`.
- `ui/drawer/ResponsiveDrawer.vue` — passes `titleId` into `ModalHeader` so the rendered heading labels the mobile dialog.
- `ui/drawer/ResponsiveDrawer.vue` — adds a mobile dialog ref and `tabindex="-1"` so the drawer modal can receive programmatic focus.
- `ui/drawer/ResponsiveDrawer.vue` — marks drawer content with `data-modal-body` and `tabindex="-1"` as the initial focus target.
- `ui/drawer/ResponsiveDrawer.vue` — stores the previously focused element when the mobile drawer modal opens.
- `ui/drawer/ResponsiveDrawer.vue` — restores focus to the previously focused element when the mobile drawer modal closes.
- `ui/drawer/ResponsiveDrawer.vue` — locks body scrolling while the mobile drawer modal is open and restores body scrolling when it closes.
- `ui/drawer/ResponsiveDrawer.vue` — adds focusable-element lookup scoped to the mobile drawer modal.
- `ui/drawer/ResponsiveDrawer.vue` — traps `Tab` and `Shift+Tab` inside the mobile drawer modal.
- `ui/drawer/ResponsiveDrawer.vue` — keeps Escape close behavior, while limiting the focus trap to the modal/mobile rendering path.
- `ui/drawer/ResponsiveDrawer.vue` — leaves the desktop aside path as an aside with its existing `aria-label` and layout behavior.

**Key decisions & why:**
- Treat only the mobile drawer as a dialog — the desktop drawer is part of the page layout, while the mobile overlay is modal interaction.
- Reuse `useModalAria()` — dialog title wiring should be consistent between `Modal` and drawer modal surfaces.
- Keep implementation local to `ResponsiveDrawer` — the drawer has unique desktop/mobile rendering, so wrapping it in `Modal` would blur responsibilities.
- Focus content first — the drawer’s content is the useful starting point after opening, while the close button remains available in the trap.
- Trap focus only in modal mode — desktop users should not have aside focus constrained like a modal.
- Preserve Escape close — keyboard users should be able to dismiss both desktop and mobile drawer states consistently.
- Restore focus on close — returning focus to the opener keeps keyboard navigation predictable after the mobile dialog disappears.
- Verified with `npm run build` — the app builds successfully with only the existing Vite chunk-size warning.


## [599] Tighten campaign table surface and reusable table controls
**Type:** refactor

**Summary:** Kept the active campaign-performance table experience focused on the simpler campaign details table, moved that surface to the shared `Card` component, refined KPI grid behavior at intermediate widths, and added a reusable `cellPadding` variant to the shared table primitive for advanced table layouts.

**Brainstorming:** While exploring grouped table layouts, two reusable improvements surfaced independently from the experiment. First, the main campaign details surface should use the shared `Card` primitive instead of raw card classes so it stays aligned with the UI system. Second, advanced table rows sometimes need to own their internal padding for animation or richer content, so table cell padding should be a typed primitive variant instead of ad hoc selector overrides. The KPI grid also needed a small layout pass so intermediate widths read as an intentional composition before the full five-column desktop layout.

**Prompt:** Keep the campaign performance view clean while working through the table experiment. Preserve the main campaign details table as the active table, move reusable table concerns into the UI table primitive, and keep the KPI/table surfaces aligned with the rest of the UI system.

**What changed:**
- `features/campaign-performance/CampaignPerformanceView.vue` — keeps the simpler `CampaignTable` as the active campaign details table.
- `features/campaign-performance/CampaignPerformanceView.vue` — removes the active TODO/channel-details rendering path from the dashboard view.
- `features/campaign-performance/CampaignPerformanceView.vue` — wraps the campaign details table in the shared `Card` component instead of raw card classes.
- `features/campaign-performance/CampaignPerformanceView.vue` — adjusts KPI grid spans at intermediate container widths so the KPI row balances better before the five-column desktop layout.
- `ui/table/Table.vue` — added a typed `cellPadding` prop with `default` and `none` variants.
- `ui/table/Table.vue` — added `cell-padding-none` support so complex table rows can own their inner padding.
- `ui/table/Table.vue` — added `scrollbar-stable` to the table container to reduce layout shifts when table scrollbars appear.
- `ui/table/table.types.ts` — added the `TableCellPadding` type.
- `ui/table/index.ts` — exports `TableCellPadding` with the rest of the table primitive types.

**Key decisions & why:**
- Keep the active dashboard table simple — the main view should keep the campaign details table as the primary scanning surface.
- Use `Card` for the table container — the dashboard should lean on shared UI primitives instead of raw style classes when the surface maps to an existing primitive.
- Add table cell padding as a typed variant — advanced rows may need to own internal padding, and a primitive prop is clearer than one-off deep overrides.
- Preserve default table behavior — `cellPadding` defaults to `default`, so existing table consumers keep their current spacing.
- Stabilize table scrollbar behavior — predictable scrollbar space reduces small layout shifts in dense data surfaces.
- Balance KPI cards before desktop width — intermediate container widths should look intentional, not like a temporary broken grid.
- Verified with `npm run build` — the app builds successfully with only the existing Vite chunk-size warning.


## [600] Prototype grouped campaign table and decide against adoption
**Type:** experiment

**Summary:** Built a grouped campaign table prototype that organizes campaign rows under expandable channel total rows, then decided not to keep it in the main campaign performance view because it adds more visual and interaction noise than actionable value.

**Brainstorming:** A channel-grouped campaign table sounded useful because it could combine channel-level totals with campaign-level detail in one table. The first implementation path used nested tables to animate grouped rows, but that broke column alignment because nested tables compute column widths independently. The better table-native direction was a flat table: group header rows remain normal table rows, campaign rows stay in the same table, and collapse/expand animation happens inside cell wrappers rather than on `<tr>` itself. After getting that working smoothly, the product read was still clear: the extra grouping control and repeated channel totals introduce more scanning overhead than the existing campaign table, KPIs, filters, and charts justify.

**Prompt:** Replace the campaign-performance TODO with a new `GroupedCampaignTable`: like `CampaignTable`, but grouped by channel, without a separate Channel column. Put the channel name in the campaign column, make groups expandable/collapsible, calculate channel header totals from campaigns inside each channel, apply sorting to channel groups and then campaigns within each group, start groups expanded, and add an expand/collapse-all control. Then evaluate whether the table should remain in the main view.

**What changed:**
- `features/campaign-performance/components/GroupedCampaignTable.vue` — added a new grouped campaign table prototype.
- `features/campaign-performance/components/GroupedCampaignTable.vue` — groups filtered campaigns by `channel`.
- `features/campaign-performance/components/GroupedCampaignTable.vue` — removes the separate Channel column from the grouped table.
- `features/campaign-performance/components/GroupedCampaignTable.vue` — uses the first column for both channel group names and campaign names.
- `features/campaign-performance/components/GroupedCampaignTable.vue` — computes group totals from campaigns in each channel using `aggregateCampaignMetrics`.
- `features/campaign-performance/components/GroupedCampaignTable.vue` — recalculates grouped `CTR`, `CVR`, `CPA`, and `ROI` from aggregated totals with `computePerformanceMetrics`.
- `features/campaign-performance/components/GroupedCampaignTable.vue` — keeps groups expanded by default.
- `features/campaign-performance/components/GroupedCampaignTable.vue` — adds per-channel expand/collapse controls with `aria-expanded` and `aria-controls`.
- `features/campaign-performance/components/GroupedCampaignTable.vue` — adds one table-level action that shows `Collapse all` when any group is expanded and `Expand all` when all groups are collapsed.
- `features/campaign-performance/components/GroupedCampaignTable.vue` — sorts channel groups by the active column and then sorts campaigns within each channel by the same column/direction.
- `features/campaign-performance/components/GroupedCampaignTable.vue` — moved away from nested tables after discovering column-width drift.
- `features/campaign-performance/components/GroupedCampaignTable.vue` — moved to a flat table structure so group rows and campaign rows share the same native table column layout.
- `features/campaign-performance/components/GroupedCampaignTable.vue` — uses JS enter/leave hooks so campaign rows are inserted collapsed before expanding and removed only after the collapse animation completes.
- `features/campaign-performance/components/GroupedCampaignTable.vue` — animates cell wrappers instead of `<tr>` height because table rows do not animate height/overflow reliably.

**Key decisions & why:**
- Do not adopt the grouped table in the main view — it adds a second way to inspect the same campaign data, but does not add enough decision value to justify the extra UI weight.
- Prefer the existing campaign table for the primary workflow — filters, charts, KPIs, and the flat campaign table already provide the useful scanning path.
- Keep grouped-table work separate from the active dashboard — channel grouping reads nicely in isolation, but in the full page it competes with charts and filters rather than clarifying them.
- Use flat rows for grouped-table behavior — native table layout preserves column alignment; nested tables should be avoided for this use case.
- Animate wrappers, not table rows — `<tr>` height/overflow transitions are unreliable, while inner cell wrappers can animate smoothly.
- Remove rows after collapse — JS transition hooks let rows leave the DOM after animation, avoiding hidden rows that still affect table semantics or spacing.
- Verified with `npm run build` — the app builds successfully with only the existing Vite chunk-size warning.
