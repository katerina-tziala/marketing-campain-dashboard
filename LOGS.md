# Vibe Coding Log — Marketing Campaign Dashboard

Development log for the MBA assignment. Every feature built, bug fixed, refactoring done, and architecture decision made is recorded here.

---

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

**Challenges / iterations:**
- None at this stage — documentation-only step

**What could be improved:**
- Architecture section in CLAUDE.md is a placeholder; will be fleshed out once the Vue project is scaffolded and folder structure is decided

**Lessons learned:**
- Starting documentation before code forces clarity on scope and decisions. Having a checklist of all features upfront means nothing gets forgotten once we're deep in implementation.

---

## [#2] Vue App Scaffold
**Type:** architecture
**Summary:** Scaffolded the Vue 3 + TypeScript app inside the `app/` folder with Tailwind CSS v3 (indigo custom theme), SCSS, and a single `AppShell` layout component. Set up dependency locking and a monorepo `.gitignore`.

**Brainstorming:** Key decisions discussed before building: folder name (`app/`), package manager (`npm` with `package-lock.json` for locked installs), TypeScript vs plain JS (TypeScript chosen), and Tailwind theme color (indigo). Tailwind v3 was chosen over v4 for stability — v4 is still in flux. SCSS is added via the `sass` package; Vite supports it natively with no extra plugin config.

**Prompt:** Scaffold Vue app in `app/` folder — basic app with one component, locked packages, `.gitignore` for monorepo, SCSS, Tailwind with indigo custom theme, README install/run instructions.

**What was built:**
- `app/` — Vite + Vue 3 + TypeScript project, scaffolded via `npm create vite@latest`
- `app/package-lock.json` — dependency lock file (all installs are reproducible)
- `app/tailwind.config.js` — Tailwind v3 with `primary` color scale mapped to indigo (`#eef2ff` → `#1e1b4b`) and system font stack as sans
- `app/postcss.config.js` — PostCSS with Tailwind + Autoprefixer
- `app/src/style.scss` — replaces `style.css`; includes `@tailwind` directives and base body/app resets using `theme()` helper
- `app/src/components/AppShell.vue` — layout wrapper with indigo header and main content slot; uses BEM + scoped SCSS + Tailwind `theme()` for values
- `app/src/App.vue` — root component, mounts `AppShell`
- `app/index.html` — updated title to "Marketing Campaign Dashboard"
- `.gitignore` — at repo root, excludes `node_modules/`, `dist/`, `.env*`, editor and OS files
- `README.md` — added "Getting Started" section with `npm install`, `npm run dev`, `npm run build`, `npm run preview`

**Key decisions & why:**
- `app/` subfolder instead of root scaffold — keeps the repo root clean for docs, LICENSE, and future additions (e.g. a backend service)
- `npm` + `package-lock.json` — simple, built-in locking; no extra tooling like `pnpm` needed at this stage
- TypeScript — type safety will pay off when building composables for CSV parsing and chart data transformations
- Indigo theme mapped to `primary` — abstracted color name means we can swap the palette later without touching component classes
- `theme()` in SCSS — keeps component styles tied to the Tailwind config as the single source of truth for tokens
- Boilerplate removed — `HelloWorld.vue`, demo assets, and default `style.css` all deleted to start from a clean slate

**Challenges / iterations:**
- `style.css` → `style.scss` rename required updating the import in `main.ts`
- Tailwind init placed config files correctly inside `app/` since the shell was already in that directory

**What could be improved:**
- `AppShell` header is static text for now; will need a nav slot as routing is added

**Lessons learned:**
- Vite's native SCSS support (no plugin needed, just install `sass`) keeps the config surface area small. Tailwind's `theme()` helper inside SCSS files is a clean way to share design tokens without duplicating values.

---

## [#3] Campaign Performance Dashboard
**Type:** feature
**Summary:** Built the full campaign performance dashboard as a new `/dashboard` route. Includes Pinia store, a Chart.js wrapper module, dark theme (WCAG AA), and 21 mock campaigns across 13 real-world channels.

**Brainstorming:** Discussed Angular-style architecture for Vue — concluded Pinia is the correct Vue 3 equivalent of an Angular service (singleton, injectable, devtools support). Discussed whether to hardcode a channel list — decided to extract channels dynamically from data so the app works with any CSV. Discussed realistic channel count — expanded from 7 to 13 channels to reflect real-world digital marketing stacks.

**Prompt:** Build the full campaign performance dashboard. I want a Pinia store for state management with filter support, and a Chart.js wrapper module so chart components are reusable and isolated. Create 21 realistic mock campaigns across 13 real-world marketing channels. Use a dark theme with WCAG AA accessible colours. Charts needed: ROI by campaign bar chart, budget allocation donut, revenue vs budget grouped bar chart, and a conversion funnel. Add KPI cards for Total Budget, Revenue, ROI, CTR, CVR, and CAC. Include a multi-select channel filter that dynamically extracts channels from the data and updates all charts and the table in real time. Add a dark mode toggle and set up light/dark CSS token variables.

**What was built:**
- `src/types/campaign.ts` — `Campaign` and `CampaignKPIs` TypeScript interfaces; `channel` is a plain `string` (no enum — extracted from data)
- `src/data/mockCampaigns.ts` — 21 campaigns across 13 channels: Paid Search, Paid Social, Email, Display, Retargeting, Video, CTV/OTT, Organic Search, Affiliate, Influencer, Push Notifications, Native Ads, Podcast, Referral
- `src/composables/useDarkMode.ts` — singleton composable; reads `prefers-color-scheme` on first load, persists preference to `localStorage`, toggles `html.dark` class for Tailwind
- `src/stores/campaignStore.ts` — Pinia store (Setup Store syntax); state: `campaigns`, `selectedChannels`; getters: `availableChannels`, `filteredCampaigns`, KPI computeds, funnel totals; actions: `toggleChannel`, `clearFilters`
- `src/router/index.ts` — Vue Router 4 with two routes: `/` (HomeView) and `/dashboard` (DashboardView)
- `src/components/charts/` — Chart.js wrapper module:
  - `register.ts` — registers ArcElement, BarElement, CategoryScale, Legend, LinearScale, Title, Tooltip once at app startup
  - `useChartTheme.ts` — reactive `textColor`, `gridColor`, `baseScales`, `basePlugins` based on dark mode state; exports `CHART_COLORS` palette (12 colors)
  - `BarChart.vue`, `DonutChart.vue`, `GroupedBarChart.vue`, `FunnelChart.vue` — each wraps vue-chartjs, accepts typed `ChartData` prop, merges theme options automatically
  - `index.ts` — barrel export
- `src/components/dashboard/KpiCard.vue` — formats currency (EUR), percentage, or plain number; accessible with `role="region"`
- `src/components/dashboard/ChannelFilter.vue` — multi-select pill buttons; "All" clears filters; `aria-pressed` on each button
- `src/components/dashboard/CampaignTable.vue` — sortable by any column including computed fields (ROI, CTR); ROI cell color-coded green/red
- `src/views/HomeView.vue` — landing page with feature cards and "View Dashboard" CTA
- `src/views/DashboardView.vue` — full dashboard: header, channel filter, 6 KPI cards, 2×2 chart grid, campaign table
- Updated `AppShell.vue` — nav links (Home / Dashboard) + dark mode toggle button (sun/moon SVG icons); CSS variables drive header colors for both themes
- Updated `tailwind.config.js` — added `darkMode: 'class'`
- Updated `vite.config.ts` — added `@` path alias for `src/`
- Updated `style.scss` — CSS theme token variables (`:root` / `html.dark`); smooth `transition` on `body` background

**Key decisions & why:**
- **Pinia over singleton composable** — Pinia is the official Vue 3 recommendation; provides devtools integration, SSR safety, and a pattern closer to Angular's `@Injectable` service
- **`channel` as plain string** — no hardcoded enum; available channels are derived from `[...new Set(campaigns.map(c => c.channel))]` so the store works with any CSV data
- **Charts as a module** — `src/components/charts/` has its own `index.ts` barrel; consumers import from `'../components/charts'` without knowing which file each component lives in
- **Dark mode via `html.dark` class** — Tailwind `darkMode: 'class'` strategy; composable applies the class on `document.documentElement` so all `dark:` utilities work without scoping issues
- **CSS variables for SCSS-scoped components** — `AppShell` uses scoped SCSS which can't target parent selectors; CSS variables defined on `:root` / `html.dark` bridge the gap cleanly
- **Chart theme via computed options** — colors and grid styles are `computed` properties that depend on `isDark`, so chart.js re-renders reactively when the theme changes — no forced re-mount needed

**Challenges / iterations:**
- Vue doesn't have services — discussed singleton composable vs Pinia; chose Pinia
- AppShell scoped SCSS can't use `dark:` Tailwind utilities directly — solved with CSS token variables
- Chart.js colors in datasets need to be reactive — solved by including `isDark.value` in the `computed` chart data in `DashboardView`, so a theme change triggers a chart update

**What could be improved:**
- Chart re-renders on dark toggle could be smoother — a CSS filter transition on the canvas would avoid a full re-draw
- The DonutChart legend wraps on small screens — could be moved below the chart on mobile

**Lessons learned:**
- Pinia's Setup Store syntax (`defineStore('id', () => { ... })`) maps directly to Vue 3 Composition API — all the same `ref`, `computed`, and function patterns, just wrapped in `defineStore`
- Extracting available channels from data rather than hardcoding them makes the store generic enough to work with any future CSV upload without code changes

---

## [#4] Style refactor — @apply and BEM classes
**Type:** refactor
**Summary:** Replaced inline Tailwind utility chains in templates with semantic BEM class names using `@apply` in scoped `<style>` blocks. Added shared component classes (`.card`, `.btn-primary`, `.section-title`) in `style.scss` via `@layer components`.

**Brainstorming:** Templates were getting cluttered with long utility chains that were hard to read and maintain. Discussed two options: keep utilities in templates (the Tailwind-idiomatic approach) vs extract to BEM class names using `@apply` (more readable, consistent with the existing `AppShell` style). Chose `@apply` + BEM because semantic class names make component structure self-documenting — important for an MBA submission where code needs to be readable by reviewers unfamiliar with Tailwind.

**Prompt:** Refactor all component styles — replace inline Tailwind utility chains in templates with semantic BEM class names using `@apply` in scoped `<style>` blocks. Extract shared classes (`.card`, `.btn-primary`, `.section-title`) into `style.scss` via `@layer components` so they can be reused across views without duplication. Templates should read as clean semantic HTML, not long utility strings.

**What changed:**
- `style.scss` — added `@layer components` with `.card`, `.btn-primary`, `.section-title`
- `KpiCard.vue` — `.kpi-card`, `.kpi-card__label`, `.kpi-card__value`
- `ChannelFilter.vue` — `.channel-filter`, `.filter-btn`, `.filter-btn--active`, `.filter-btn--inactive`
- `CampaignTable.vue` — full BEM table structure + `.channel-badge`
- `HomeView.vue` — `.home`, `.home__hero`, `.feature-card` and variants; reuses `.btn-primary` and `.card`
- `DashboardView.vue` — `.dashboard`, `.kpi-grid`, `.charts-grid`, `.chart-card`; reuses `.card` and `.section-title`

**Key decisions & why:**
- Shared classes in `@layer components` — Tailwind purges them correctly; components layer has lower specificity than utilities so `@apply` overrides still work
- BEM in scoped styles — keeps naming consistent with `AppShell.vue` and makes component structure self-documenting
- Templates now read as semantic HTML — `class="chart-card"` vs a 6-attribute utility string

---

## [#5] Remove home route — land directly on dashboard
**Type:** refactor
**Summary:** Removed `HomeView.vue` and the `/home` route. App now lands directly on the dashboard at `/`. Nav links removed from `AppShell` since there is only one page.

**Brainstorming:** The home landing page added navigation overhead with no benefit while mock data is in use — the dashboard is the only meaningful view. Considered keeping it as a placeholder but decided it added complexity without value. The empty state for when no CSV data is loaded will be a component inside the dashboard view, not a separate route, so the home page serves no purpose at this stage.

**Prompt:** Remove the home landing page and the `/home` route — the app should land directly on the dashboard at `/`. Clean up `AppShell` by removing the nav links since there is only one page now. The empty state for when no CSV data is loaded will be handled later as part of the CSV upload feature.

**What changed:**
- `router/index.ts` — single route `/ → DashboardView`; `HomeView` import removed
- `views/HomeView.vue` — deleted
- `AppShell.vue` — removed `<nav>` and `RouterLink` imports; title is now a plain `<span>`; removed nav SCSS

**Key decisions & why:**
- No landing page needed while mock data is in use — the dashboard is the app
- Empty state component (for when no CSV data is loaded) is deferred to the CSV upload feature; at that point the dashboard will conditionally show either the empty state or the charts

---

## [#6] Dark-only theme — remove toggle, fix FOUC
**Type:** refactor
**Summary:** Locked the app to dark theme only. Removed the theme toggle button and all light/dark conditional logic. Fixed the flash of white on page refresh by adding `class="dark"` directly to `<html>` in `index.html`.

**Brainstorming:** Maintaining both themes adds significant complexity — double CSS variables, reactive chart options, and an inherent FOUC risk on every page load. The dashboard is intentionally designed for dark mode only. Considered keeping the toggle for future flexibility but decided that locking to dark-only simplifies the codebase substantially and eliminates FOUC at its root. If a light theme is ever needed it can be re-added as a deliberate feature with its own log entry.

**Prompt:** Lock the app to dark theme only — remove the toggle button and all the light/dark conditional logic. There is a flash of white on page refresh; fix that by applying the dark class directly in `index.html` before any JavaScript runs. Simplify the chart theme utilities since they no longer need reactive computed wrappers — plain constants are enough.

**What changed:**
- `index.html` — `<html class="dark">` so dark mode is active before any JS runs (eliminates FOUC)
- `AppShell.vue` — removed toggle button, `useDarkMode` import, and `__theme-toggle` SCSS block
- `useChartTheme.ts` — removed reactive `computed` wrappers and `useDarkMode` dependency; replaced with plain constants (`TEXT_COLOR`, `GRID_COLOR`, etc.)
- `BarChart.vue`, `DonutChart.vue`, `GroupedBarChart.vue`, `FunnelChart.vue` — options changed from `computed` to plain objects since values are now static
- `DashboardView.vue` — removed `useDarkMode` import; hardcoded dark chart colors

**Key decisions & why:**
- `class="dark"` on `<html>` in `index.html` is the correct fix for FOUC — the class is present before the browser renders a single pixel, so Tailwind's `dark:` utilities apply from the start
- Removing `computed` from chart options is a correctness improvement — `computed` was only needed when the value could change reactively; with a static theme it adds overhead for no benefit

---

## [#7] KPI card redesign and dark navy color update
**Type:** refactor
**Summary:** Redesigned KPI cards to match target design — left accent border, uppercase labels, compact number formatting, secondary metrics. Updated the color palette from gray-900 to a darker navy slate. Consolidated from 6 to 5 KPI cards (ROI moved inside Revenue card, CVR inside Conversions card).

**Brainstorming:** The existing cards looked generic. Reviewed a target design and identified three improvements: a left accent border per card for visual identity, compact number formatting for large values to save space, and secondary metrics to reduce card count. Debated whether 6 cards or 5 was the right number — decided to consolidate by grouping related metrics (ROI belongs with Revenue, CVR belongs with Conversions) because it reduces visual noise and keeps causally related numbers next to each other.

**Prompt:** Redesign the KPI cards. Each card should have a left accent border in its own colour, an uppercase label with wide letter-spacing, and compact number formatting (€100.0K style, but keep small values like €11.74 precise). Add support for a secondary metric shown below the main value in the accent colour. Update the colour palette to a darker navy — the current gray-900 is too light. Consolidate to 5 cards by moving ROI inside the Revenue card and CVR inside the Conversions card as secondary metrics. Update all components to use CSS variables for colours instead of `dark:` Tailwind prefixes since we're dark-only now.

**What changed:**
- `style.scss` — CSS variables updated to dark navy palette (`--color-bg: #0f172a`, `--color-surface: #1e293b`, `--color-border: #334155`); `.card` now uses CSS variables instead of hardcoded Tailwind dark: classes; `.section-title` uses `var(--color-text-secondary)`
- `KpiCard.vue` — new `accentColor` prop sets a CSS `--accent` variable; left border uses `--accent`; label is uppercase + tracking-widest; value uses compact Intl formatter (€100.0K, 8.5K); new optional `secondaryLabel`/`secondaryValue` props display a sub-metric in the accent color
- `DashboardView.vue` — 5 KPI cards: Budget (indigo), Revenue + ROI (emerald), Conversions + CVR (amber), CTR (cyan), CAC (rose); kpi-grid changed to `lg:grid-cols-5`
- `AppShell.vue` — title color changed to `primary.400` (indigo), font weight increased to match design
- `ChannelFilter.vue` — removed `dark:` Tailwind prefixes; styles now use CSS variables
- `CampaignTable.vue` — removed `dark:` Tailwind prefixes; styles now use CSS variables; channel badge changed to outlined style (transparent bg, border)

**Key decisions & why:**
- CSS variables for colors instead of `dark:` Tailwind utilities — since we're dark-only, hardcoding dark values via variables is cleaner and avoids redundant `dark:` prefix overhead
- Compact number formatting via `Intl.NumberFormat notation: 'compact'` — applied conditionally (only when value ≥ 1000) so small values like €11.74 remain precise
- ROI and CVR as secondary metrics inside Revenue/Conversions cards — reduces card count from 6 to 5, keeps related metrics visually grouped, matches the target design

---

## [#8] Campaign table updates
**Type:** update
**Brainstorming:** Impressions is a raw count that adds column width without adding meaningful insight at campaign level — CTR already captures the clicks-to-impressions ratio. CVR and CAC are more actionable efficiency KPIs that align with the existing KPI cards, making the table and the cards read as a consistent set.
**Prompt:** Update the campaign table: remove the Impressions column and add CVR and CAC as computed columns. Make column headers uppercase with wide tracking. Format Clicks with compact notation (9.0K), CAC to 2-decimal EUR, and ROI as a whole-number percentage. Extend the sort system to cover the new columns.
- Removed `Impressions` column; added `CVR` and `CAC` computed columns
- Column headers uppercase with `tracking-wider`
- Clicks use compact notation (`9.0K`); CAC shows 2-decimal EUR; ROI shows whole-number percentage
- Sort system extended to include `cvr` and `cac`

---

## [#9] Table card wrapper + orange ROI tier
**Type:** update
**Brainstorming:** A two-tier ROI system (green/red) doesn't distinguish campaigns that are profitable but underperforming from campaigns that are actively losing money. A three-tier system with orange for 0–50% ROI gives a clearer picture of performance quality — not just positive vs negative, but strong vs weak.
**Prompt:** Wrap the campaign table in a card in DashboardView — the card should own the border and border-radius, so remove them from the table component itself. Update ROI colour coding to three tiers: green above 50%, orange for 0–50%, red at 0 or below. Adjust a few mock campaigns so some land in the orange zone and the colour tiers are visible in the default view.
- Campaign table wrapped in `.card` in `DashboardView`; outer border/radius removed from `CampaignTable` (card owns them)
- ROI now has three colour tiers: green (> 50%), orange (0–50%), red (≤ 0%)
- Mock data: TikTok Awareness → 40% ROI, Podcast Mid-Roll → 35% ROI (join Facebook Awareness 26% and YouTube Pre-Roll 44% in orange zone)

---

## [#10] Visual polish — headings, table padding, funnel chart rewrite
**Type:** update
**Brainstorming:** The Chart.js funnel had a scaling problem — with campaigns reaching 1M+ impressions and only a few hundred conversions, the Conversions bar was practically invisible. Chart.js linear scaling makes this unavoidable. A custom HTML/CSS component gives full control over scaling (cube-root chosen to compress extremes without completely distorting proportions) and allows values to be displayed inside bars, which Chart.js doesn't support natively.
**Prompt:** Polish the visual hierarchy and fix the funnel chart. Upgrade the app title in AppShell to an `<h1>` with gradient text. Demote chart and table card headings to `<h3>`. Add proper padding between the table card edge and the table content. Rewrite the conversion funnel as a custom HTML/CSS component — replace the Chart.js horizontal bar with proportional bars using cube-root scaling so the Conversions bar is always visible even when counts are tiny. Display formatted values inside the bars and show CTR and CVR rates to the right. Reduce some impression counts in the mock data so the funnel proportions look realistic.
- `AppShell.vue` — app title upgraded to `<h1>` with gradient text (`#818cf8 → #38bdf8`); MBA Vibe Coding Project subtitle added below; subtitle later removed, gradient updated to magenta (`#818cf8 → #ec4899`)
- `DashboardView.vue` — "Campaign Performance" changed to `<h2>` with muted secondary color; all chart card and table titles changed from `<h2>` to `<h3>`; table card now has an inner `table-section__body` wrapper for `px-5 pb-5` padding between the card edge and the table
- `CampaignTable.vue` — table header background changed to match surface color (removed `color-mix` dark blending)
- `FunnelChart.vue` — replaced Chart.js horizontal bar with a custom HTML/SCSS component; uses cube-root scaling for proportional bar widths with a minimum width so the Conversions bar is always visible; formatted values displayed inside bars; CTR and CVR conversion rates shown in amber to the right of their respective bars
- `mockCampaigns.ts` — reduced impression counts on Programmatic Display (1.2M → 480K), TikTok Awareness (740K → 320K), YouTube Pre-Roll (620K → 310K), Facebook Awareness (520K → 280K), CTV Campaign (320K → 180K) to improve funnel visual proportionality

---

## [#11] Visual tweaks — table revenue color, funnel centering, chart legend, ROI chart orientation
**Type:** update
**Brainstorming:** The Revenue column used plain bold text while ROI had colour coding — inconsistent since both represent performance outcomes the user needs to evaluate at a glance. For the ROI chart, 21 campaign names on a vertical x-axis were unreadable — horizontal bar charts are the standard solution for many-category comparisons and make the labels readable without rotation.
**Prompt:** A few visual tweaks: apply the same three-tier colour coding to the Revenue column in the campaign table. Centre the funnel bars inside their track and increase the row height for better readability. Update chart legend markers to small rounded squares. Add a horizontal mode to BarChart and use it for the ROI by Campaign chart — campaign names are too cramped as x-axis ticks and should be row labels instead.
- `CampaignTable.vue` — Revenue column now uses same 3-color ROI tier styling (green/orange/red) instead of plain strong text
- `AppShell.vue` — removed MBA subtitle; title gradient updated to magenta (`#818cf8 → #ec4899`)
- `FunnelChart.vue` — bars centered inside their track; row height increased to 48px; rate labels given fixed width for consistent alignment
- `useChartTheme.ts` — legend labels changed to rounded squares (`usePointStyle: false`, `borderRadius: 4`, 12×12px box)
- `BarChart.vue` — added `horizontal` prop; when true uses `indexAxis: 'y'` and moves axis label accordingly
- `GroupedBarChart.vue` — converted to `computed` options; added y-axis title support matching BarChart
- `DashboardView.vue` — ROI by Campaign chart now uses `horizontal` prop with height 420px so campaign names read left-to-right as row labels

---

## [#12] UI library — move charts to src/ui/
**Type:** refactor
**Summary:** Introduced `src/ui/` as a UI component library folder within the app. Moved all chart components and utilities out of `src/components/charts/` into `src/ui/charts/`. Added a top-level `src/ui/index.ts` barrel export. Updated all imports.

**Brainstorming:** Chart components had no dependency on app state but lived inside `src/components/` alongside domain-specific components, blurring the boundary between generic UI and app-specific code. Discussed a monorepo package vs a folder-based library — chose a dedicated `src/ui/` folder to make the separation explicit without the overhead of a separate package. The barrel `index.ts` sets up the right pattern for future reusable components (inputs, modals, badges) to follow.

**Prompt:** Extract the chart components into a separate UI library folder at `src/ui/charts/`. Charts are generic wrappers with no dependency on app state — they belong in their own layer separate from feature components. Add a top-level `src/ui/index.ts` barrel so everything in the library is importable from a single path. Update all import paths in the app.

**What changed:**
- `src/ui/charts/` — new location for `BarChart.vue`, `DonutChart.vue`, `GroupedBarChart.vue`, `FunnelChart.vue`, `register.ts`, `useChartTheme.ts`, `index.ts`
- `src/ui/index.ts` — top-level barrel: `export * from './charts'`
- `src/components/charts/` — deleted
- `src/main.ts` — import path updated: `./components/charts/register` → `./ui/charts/register`
- `src/views/DashboardView.vue` — import path updated: `../components/charts` → `../ui/charts`

**Key decisions & why:**
- `src/ui/` within the app src tree — keeps the library visible and co-located with the code that uses it, without monorepo overhead
- Charts go in `ui/` because they are generic wrappers with no dependency on app state (store, types, router) — they accept plain props and emit nothing
- Dashboard-specific components (`KpiCard`, `ChannelFilter`, `CampaignTable`) stay in `src/components/dashboard/` — they are tied to app domain types and patterns
- `src/ui/index.ts` top-level barrel — future components added to the library are available from a single import path (`@/ui`)

---

## [#13] Feature-based architecture refactor
**Type:** refactor
**Summary:** Restructured the entire `src/` tree from a type-based layout (components/, views/, composables/) to a feature-based layout. Each concern now has a single, clearly scoped home.

**Brainstorming:** The type-based layout was already causing friction — finding everything related to the dashboard meant hunting across three separate folders. Discussed Angular-style module pattern vs flat feature folders — chose flat feature folders (`features/dashboard/`) as the Vue 3 idiomatic approach. The key principle: when a feature is added or removed, all its files should move together. `shell/` and `common/` are kept separate because they are genuinely cross-feature, not owned by any single feature slice.

**Prompt:** Restructure the entire `src/` folder from a type-based layout (components/, views/, composables/) to a feature-based architecture. Each feature should be self-contained — view and its components together in one folder. Move dashboard components and `DashboardView` into `src/features/dashboard/`. Move `AppShell` into `src/shell/` since it is layout chrome, not a feature. Move shared types and mock data into `src/common/` since they have no Vue dependency. Delete any composables that are no longer used.

**What changed:**
- `src/composables/useDarkMode.ts` — deleted (no longer used after dark-only theme)
- `src/types/campaign.ts` + `src/data/MOCK_CAMPAIN_DATA.ts` — moved to `src/common/` (framework-agnostic shared types and data)
- `src/components/charts/` — already moved to `src/ui/charts/` in #12
- `src/components/dashboard/{KpiCard,CampaignTable,ChannelFilter}.vue` — moved into the dashboard feature folder
- `src/views/DashboardView.vue` → `src/features/dashboard/DashboardView.vue`
- Dashboard components → `src/features/dashboard/components/`
- `src/components/AppShell.vue` → `src/shell/AppShell.vue`
- `src/views/` → `src/features/`
- `mockCampaigns` const renamed to `MOCK_CAMPAINS` (SCREAMING_SNAKE_CASE for module-level constants)

**Final src/ structure:**
```
src/
├── common/       ← shared types & data (no framework deps)
├── ui/           ← generic reusable UI (no app state deps)
├── shell/        ← app layout wrapper
├── features/     ← self-contained feature slices (view + components)
│   └── dashboard/
├── stores/
└── router/
```

**Key decisions & why:**
- `features/` over `views/` — each subfolder contains a view AND its components, not just a view file; the name reflects the content
- `shell/` separate from `features/` — AppShell is layout chrome, not a route-bound feature
- `common/` for types and data — these have no Vue dependency; keeping them separate makes the boundary explicit
- Dashboard components co-located in `features/dashboard/components/` — when the feature is deleted or replaced, everything goes with it

---

## [#14] UI polish — colours, charts & components
**Type:** update
**Summary:** Visual polish pass across the full dashboard: new colour palette, chart interaction cleanup, accessible funnel colours, and consistent component styling.

**Brainstorming:** The navy palette was not deep enough — surfaces were still close to a typical dark-gray theme rather than the intended deep navy look. Chart legend click-to-toggle was discovered to be confusing on a read-only dashboard where all data should always be visible. The funnel bar colours had been chosen visually without checking contrast ratios — a WCAG AA audit was overdue. Decided to address all visual consistency issues in one pass rather than accumulating multiple small entries.

**Prompt:** Do a full polish pass on the dashboard. Update the background and surface to a deeper navy — the current colours are not dark enough. Add a dedicated CSS variable for card and section title colour. Update chart text colour so it matches the table content. Disable legend click-to-toggle on all charts — users should not be able to hide datasets. Change the Budget dataset in the Revenue vs Budget chart to coral so it is clearly distinct from Revenue. Update the funnel bar colours to WCAG AA compliant values with white labels. Remove the coloured left border from KPI cards. Tighten rounded corners and spacing so everything feels more compact and consistent.

**What changed:**
- **Colour palette** — new deeper navy: bg `#070a15`, surface `#151b2e`, border `#1e2a4a`; added `--color-title: #a5b4fc` for card/section titles; `--color-text-secondary` (`#94a3b8`) kept for supporting text
- **Chart text** — `TEXT_COLOR` updated to `#cbd5e1` across axis ticks, legend labels, and funnel row labels for consistency with table content
- **Chart legends** — disabled click-to-toggle and hover pointer (`onClick: () => {}`, `onHover: () => {}`) on all charts
- **Revenue vs Budget** — Budget dataset changed from indigo to coral (`#f97066`) for clearer visual distinction from Revenue
- **Conversion Funnel** — bar colours updated to WCAG AA compliant vivid palette with white labels: indigo-600 `#4f46e5` (~6:1), purple-600 `#9333ea` (~5.1:1), orange-700 `#c2410c` (~4.9:1)
- **KPI cards** — removed coloured left border; label colour updated to `var(--color-title)`; `@apply section-title` does not reliably pass colour/size through Vue scoped styles so both are set explicitly
- **Card titles** — `h3` titles use `text-xl font-semibold` and `color: var(--color-title)` set directly in scoped styles (bypasses `@apply section-title` limitation in Vue scoped blocks)
- **Rounded borders** — reduced across all non-pill elements: cards `rounded-xl` → `rounded-md`, chart bars 4px → 2px, funnel bars 6px → 3px
- **Spacing** — dashboard sections `space-y-8` → `space-y-6` to match chart grid `gap-6`; AppShell main x-padding removed, y-padding set to former x value (`spacing.6`)
- **Table content** — cell and campaign name column colour updated to `#cbd5e1` (matches chart text)

---

## [#15] CSV download template + toast notifications
**Type:** feature
**Summary:** Added a "Download Template" button to the dashboard header that generates and downloads the mock campaigns as a CSV file. Introduced a shared toast notification system for error feedback, a generic `BaseButton` component, and SVG icon components — all housed in the UI library.

**Brainstorming:** The CSV download is the first step of the upload flow — giving users a correctly formatted template means fewer upload errors later. Discussed using PapaParse to generate the CSV but concluded it is a parser (CSV → JS), not a serialiser — plain string building is the right tool for the download direction. Discussed where to put the download utility — landed on `features/csv-file/utils/` so all CSV-related logic lives in one feature folder as the upload feature is built out. Toast notifications need to be accessible from any route, so they are driven by a Pinia store and the container is mounted once in `AppShell`.

**Prompt:** Create a download template button in the dashboard header. When clicked it should download the mock campaign data as a CSV file named `marketing_campain_sample`. If any error occurs the user should see a toast notification. Toast container and notification should be grouped in a `ui/toast/` folder and available to all routes. The button and toast should live in the UI library. Add SVG icon components for the button. Do not use PapaParse for the download — use plain string building. Place the download utility in `features/csv-file/utils/`.

**What was built:**
- `src/stores/toastStore.ts` — Pinia store managing the toast queue; each toast auto-dismisses after 4s; `addToast(message)` and `removeToast(id)` actions
- `src/features/csv-file/utils/downloadCsv.ts` — builds a CSV string from a `Campaign[]` array (headers + rows, values escaped for commas/quotes), creates a Blob, triggers download via a temporary `<a>` element, and revokes the object URL
- `src/ui/icons/DownloadIcon.vue` — inline SVG download icon
- `src/ui/icons/CloseIcon.vue` — inline SVG close/dismiss icon
- `src/ui/icons/index.ts` — barrel export for icons
- `src/ui/BaseButton.vue` — generic button with `primary` and `ghost` variants; accepts an icon via the default slot; focus-visible ring, disabled state, icon sizing handled in scoped SCSS
- `src/ui/toast/ToastNotification.vue` — single error toast with inline alert icon, message, and dismiss button; `role="alert"` + `aria-live="assertive"` for accessibility
- `src/ui/toast/ToastContainer.vue` — renders the active toast queue via `TransitionGroup`; teleported to `body` so it sits above all content regardless of stacking context; slide-in/slide-out CSS transitions
- `src/ui/toast/index.ts` — barrel export for toast module
- Updated `src/ui/index.ts` — exports icons, toast module, and `BaseButton`
- Updated `src/shell/AppShell.vue` — mounts `ToastContainer` once; available to all routes without re-importing
- Updated `src/features/dashboard/DashboardView.vue` — ghost `BaseButton` with `DownloadIcon` in the dashboard header; calls `downloadCsv(MOCK_CAMPAINS, 'marketing_campain_sample')`; catches errors and dispatches to `toastStore`

**Key decisions & why:**
- **No PapaParse for download** — PapaParse is a parser (CSV → JS objects); generating CSV is plain string manipulation with no dependency needed
- **`features/csv-file/utils/`** — co-locating the download utility with the future upload feature keeps all CSV logic in one folder; when upload is built, the utility sits right next to it
- **Pinia toast store** — makes `addToast` callable from any component or utility function without prop-drilling or event buses; consistent with how the campaign store is used
- **`ToastContainer` in `AppShell`** — mounted exactly once at the layout level; all current and future routes get error feedback for free with no per-route setup
- **`Teleport to="body"`** — removes the container from the stacking context of the app shell so toasts always render above modals, drawers, or other overlays
- **Error toast only, no success toast** — the browser's download API is fire-and-forget; there is no browser event confirming the file was saved to disk, so a success toast would be misleading

---

## [#16] Move download button to app header
**Type:** update
**Brainstorming:** The download button was placed in `DashboardView`'s header section, but the requirement was for it to sit in the `<header>` element of the app shell alongside the title — not inside the page content area. Moving it to `AppShell` is also the more correct architectural decision: the button triggers a global utility (CSV download) unrelated to any specific route, so it belongs in the persistent layout shell rather than a feature view.
**Prompt:** Move the Download Template button from the dashboard header section into the `<header>` element in `AppShell`, on the right side of the project title. Clean up `DashboardView` — remove the button, its imports, the handler, and the flex styles that were added to the dashboard header for it.
- `AppShell.vue` — button, `handleDownloadTemplate` handler, and all related imports moved here; header updated to `display: flex; justify-content: space-between` to align title left and button right
- `DashboardView.vue` — removed `BaseButton`, `DownloadIcon`, `useToastStore`, `downloadCsv`, `MOCK_CAMPAINS` imports; removed `handleDownloadTemplate`; reverted dashboard header to a plain block with title and subtitle
