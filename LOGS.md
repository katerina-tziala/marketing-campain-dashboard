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


## [#8] Campaign table updates
**Type:** update

**Summary:** Replaced the Impressions column with CVR and CAC computed columns and updated header casing and number formatting.

**Brainstorming:** Impressions is a raw count that adds column width without adding meaningful insight at campaign level — CTR already captures the clicks-to-impressions ratio. CVR and CAC are more actionable efficiency KPIs that align with the existing KPI cards, making the table and the cards read as a consistent set.

**Prompt:** Update the campaign table: remove the Impressions column and add CVR and CAC as computed columns. Make column headers uppercase with wide tracking. Format Clicks with compact notation (9.0K), CAC to 2-decimal EUR, and ROI as a whole-number percentage. Extend the sort system to cover the new columns.

**What changed:**
- Removed `Impressions` column; added `CVR` and `CAC` computed columns
- Column headers uppercase with `tracking-wider`
- Clicks use compact notation (`9.0K`); CAC shows 2-decimal EUR; ROI shows whole-number percentage
- Sort system extended to include `cvr` and `cac`

**Key decisions & why:**
- Impressions removed — CTR (clicks/impressions) already captures the engagement ratio; showing raw impressions alongside CTR adds column width without adding insight
- CVR and CAC added to match KPI cards — the table and cards should form a consistent performance vocabulary so users see the same metrics in both places


## [#9] Table card wrapper + orange ROI tier
**Type:** update

**Summary:** Wrapped the campaign table in a view-owned card and introduced a three-tier ROI colour system.

**Brainstorming:** A two-tier ROI system (green/red) doesn't distinguish campaigns that are profitable but underperforming from campaigns that are actively losing money. A three-tier system with orange for 0–50% ROI gives a clearer picture of performance quality — not just positive vs negative, but strong vs weak.

**Prompt:** Wrap the campaign table in a card in DashboardView — the card should own the border and border-radius, so remove them from the table component itself. Update ROI colour coding to three tiers: green above 50%, orange for 0–50%, red at 0 or below. Adjust a few mock campaigns so some land in the orange zone and the colour tiers are visible in the default view.

**What changed:**
- Campaign table wrapped in `.card` in `DashboardView`; outer border/radius removed from `CampaignTable` (card owns them)
- ROI now has three colour tiers: green (> 50%), orange (0–50%), red (≤ 0%)
- Mock data: TikTok Awareness → 40% ROI, Podcast Mid-Roll → 35% ROI (join Facebook Awareness 26% and YouTube Pre-Roll 44% in orange zone)

**Key decisions & why:**
- Card wraps table in DashboardView, not in CampaignTable — the card (border, radius) is a layout concern owned by the view; keeping CampaignTable purely presentational means it can be reused in any container
- Three ROI tiers over two — green/red alone couldn't distinguish a weak positive (10% ROI) from a strong one; the orange tier surfaces campaigns that are profitable but underperforming


## [#10] Visual polish — headings, table padding, funnel chart rewrite
**Type:** update

**Summary:** Polished visual hierarchy across headings and rewrote the conversion funnel as a custom HTML/CSS component with cube-root scaling.

**Brainstorming:** The Chart.js funnel had a scaling problem — with campaigns reaching 1M+ impressions and only a few hundred conversions, the Conversions bar was practically invisible. Chart.js linear scaling makes this unavoidable. A custom HTML/CSS component gives full control over scaling (cube-root chosen to compress extremes without completely distorting proportions) and allows values to be displayed inside bars, which Chart.js doesn't support natively.

**Prompt:** Polish the visual hierarchy and fix the funnel chart. Upgrade the app title in AppShell to an `<h1>` with gradient text. Demote chart and table card headings to `<h3>`. Add proper padding between the table card edge and the table content. Rewrite the conversion funnel as a custom HTML/CSS component — replace the Chart.js horizontal bar with proportional bars using cube-root scaling so the Conversions bar is always visible even when counts are tiny. Display formatted values inside the bars and show CTR and CVR rates to the right. Reduce some impression counts in the mock data so the funnel proportions look realistic.

**What changed:**
- `AppShell.vue` — app title upgraded to `<h1>` with gradient text (`#818cf8 → #38bdf8`); MBA Vibe Coding Project subtitle added below; subtitle later removed, gradient updated to magenta (`#818cf8 → #ec4899`)
- `DashboardView.vue` — "Campaign Performance" changed to `<h2>` with muted secondary color; all chart card and table titles changed from `<h2>` to `<h3>`; table card now has an inner `table-section__body` wrapper for `px-5 pb-5` padding between the card edge and the table
- `CampaignTable.vue` — table header background changed to match surface color (removed `color-mix` dark blending)
- `FunnelChart.vue` — replaced Chart.js horizontal bar with a custom HTML/SCSS component; uses cube-root scaling for proportional bar widths with a minimum width so the Conversions bar is always visible; formatted values displayed inside bars; CTR and CVR conversion rates shown in amber to the right of their respective bars
- `mockCampaigns.ts` — reduced impression counts on Programmatic Display (1.2M → 480K), TikTok Awareness (740K → 320K), YouTube Pre-Roll (620K → 310K), Facebook Awareness (520K → 280K), CTV Campaign (320K → 180K) to improve funnel visual proportionality

**Key decisions & why:**
- Custom HTML funnel over Chart.js — Chart.js linear scaling made the Conversions bar invisible at real-world ratios (1M impressions vs hundreds of conversions); a custom component gives full control over bar scaling and allows values to render inside bars, which Chart.js does not support natively
- Cube-root scaling — compresses extremes enough to keep all bars visible without completely distorting the relative proportions between stages


## [#11] Visual tweaks — table revenue color, funnel centering, chart legend, ROI chart orientation
**Type:** update

**Summary:** Applied ROI colour tiers to the Revenue column, recentred the funnel, updated chart legend markers, and switched the ROI chart to horizontal orientation.

**Brainstorming:** The Revenue column used plain bold text while ROI had colour coding — inconsistent since both represent performance outcomes the user needs to evaluate at a glance. For the ROI chart, 21 campaign names on a vertical x-axis were unreadable — horizontal bar charts are the standard solution for many-category comparisons and make the labels readable without rotation.

**Prompt:** A few visual tweaks: apply the same three-tier colour coding to the Revenue column in the campaign table. Centre the funnel bars inside their track and increase the row height for better readability. Update chart legend markers to small rounded squares. Add a horizontal mode to BarChart and use it for the ROI by Campaign chart — campaign names are too cramped as x-axis ticks and should be row labels instead.

**What changed:**
- `CampaignTable.vue` — Revenue column now uses same 3-color ROI tier styling (green/orange/red) instead of plain strong text
- `AppShell.vue` — removed MBA subtitle; title gradient updated to magenta (`#818cf8 → #ec4899`)
- `FunnelChart.vue` — bars centered inside their track; row height increased to 48px; rate labels given fixed width for consistent alignment
- `useChartTheme.ts` — legend labels changed to rounded squares (`usePointStyle: false`, `borderRadius: 4`, 12×12px box)
- `BarChart.vue` — added `horizontal` prop; when true uses `indexAxis: 'y'` and moves axis label accordingly
- `GroupedBarChart.vue` — converted to `computed` options; added y-axis title support matching BarChart
- `DashboardView.vue` — ROI by Campaign chart now uses `horizontal` prop with height 420px so campaign names read left-to-right as row labels

**Key decisions & why:**
- Revenue column coloured same as ROI — both represent performance outcomes the user evaluates at a glance; inconsistent styling between causally linked columns would be confusing
- Horizontal BarChart for ROI by Campaign — 21 campaign name labels on a vertical x-axis are unreadable regardless of font size; horizontal bars are the standard solution for many-category comparisons


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

**Key decisions & why:**
- `features/` over `views/` — each subfolder contains a view AND its components, not just a view file; the name reflects the content
- `shell/` separate from `features/` — AppShell is layout chrome, not a route-bound feature
- `common/` for types and data — these have no Vue dependency; keeping them separate makes the boundary explicit
- Dashboard components co-located in `features/dashboard/components/` — when the feature is deleted or replaced, everything goes with it



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

**Key decisions & why:**
- All visual issues addressed in one pass — accumulating multiple small style entries creates log noise; a single polish pass is cleaner and easier to review as a unit
- Legend click-to-toggle disabled — on a read-only dashboard all data should always be visible; allowing users to hide datasets creates confusion about whether the chart is showing complete data


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



## [#16] Move download button to app header
**Type:** update

**Summary:** Moved the Download Template button from DashboardView's header section into the AppShell header element.

**Brainstorming:** The download button was placed in `DashboardView`'s header section, but the requirement was for it to sit in the `<header>` element of the app shell alongside the title — not inside the page content area. Moving it to `AppShell` is also the more correct architectural decision: the button triggers a global utility (CSV download) unrelated to any specific route, so it belongs in the persistent layout shell rather than a feature view.

**Prompt:** Move the Download Template button from the dashboard header section into the `<header>` element in `AppShell`, on the right side of the project title. Clean up `DashboardView` — remove the button, its imports, the handler, and the flex styles that were added to the dashboard header for it.

**What changed:**
- `AppShell.vue` — button, `handleDownloadTemplate` handler, and all related imports moved here; header updated to `display: flex; justify-content: space-between` to align title left and button right
- `DashboardView.vue` — removed `BaseButton`, `DownloadIcon`, `useToastStore`, `downloadCsv`, `MOCK_CAMPAINS` imports; removed `handleDownloadTemplate`; reverted dashboard header to a plain block with title and subtitle

**Key decisions & why:**
- Download button belongs in AppShell, not DashboardView — it triggers a global utility (CSV download) unrelated to any specific route; persistent layout chrome is the correct home for globally available actions

 


## [#17] CSV upload feature — empty state, upload modal, parse & validate
**Type:** feature

**Summary:** Implemented the full CSV upload flow. The app now starts with no data and shows an empty state. Users open an upload modal via a button, enter a campaign title and pick a CSV file (drag & drop or file picker). The file is parsed with PapaParse and validated against the 7 expected columns and row-level rules. On success the store is loaded and the dashboard renders. On error a toast is shown temporarily (error modal is the next step). A generic `BaseModal` shell was added to the UI library for reuse by the error modal.

**Brainstorming:** Discussed where to put the campaign title input — considered inline on the empty state vs inside the modal. Chose the modal so the same component can handle both initial upload and future "upload again" without duplication. Discussed PapaParse vs plain string parsing — PapaParse handles edge cases (quoted commas, line endings, BOM) that manual parsing would miss, so it is the right tool here despite not being needed for download. Agreed that validation should only check the 7 expected columns since we provide the template — extra columns are silently ignored. Validation errors are handed off via an `error` emit so the error modal (next step) can be dropped in without changing `UploadModal`.

**Prompt:** Implement the CSV upload feature. The store should start empty — no mock data on load. Show an empty state screen with "Download Template" and "Upload CSV" buttons. The upload button opens a modal with a required campaign title input and a drag & drop file picker. On submit, parse the CSV with PapaParse and validate: file type (.csv only), file size (max 2MB), presence of all 7 expected headers (case-insensitive, extra columns ignored), and row-level rules (campaign/channel non-empty strings, budget > 0, impressions/clicks/conversions non-negative integers with clicks ≤ impressions and conversions ≤ clicks, revenue ≥ 0). On success call `store.loadCampaigns(title, campaigns)` and close the modal. On error emit the structured errors for the error modal (next step) — use a toast temporarily. Add a generic `BaseModal` to the UI library. The dashboard subtitle should show the campaign title, a comma, and the filtered/total campaign count.

**What was built:**
- `src/features/csv-file/types/index.ts` — `CsvValidationError` (type, message, details[]) and `CsvParseResult` interfaces
- `src/features/csv-file/utils/parseCsv.ts` — PapaParse wrapper; file-level checks (type, size), column validation (case-insensitive header match), row validation (all rules above); returns `CsvParseResult`
- `src/features/csv-file/components/EmptyState.vue` — no-data screen with download template + upload CSV buttons; emits `upload` to parent
- `src/features/csv-file/components/UploadModal.vue` — uses `BaseModal`; campaign title input with required validation; drag & drop + file picker dropzone; calls `parseCsv` on submit; emits `success` or `error` to parent
- `src/ui/BaseModal.vue` — generic modal shell: backdrop, header with title + close button, named `body` and `footer` slots; Teleport to body; closes on Escape key and backdrop click; locks body scroll while open
- `src/ui/icons/UploadIcon.vue` — SVG upload icon
- Updated `src/stores/campaignStore.ts` — removed mock data default; added `title` state and `loadCampaigns(title, campaigns)` action; resets `selectedChannels` on load
- Updated `src/ui/icons/index.ts` — exports `UploadIcon`
- Updated `src/ui/index.ts` — exports `BaseModal`
- Updated `src/features/dashboard/DashboardView.vue` — conditionally renders `EmptyState` or full dashboard; controls `showUploadModal` ref; handles `success` via `store.loadCampaigns`; handles `error` via toast (temporary until error modal); subtitle shows `store.title, N of M campaigns`

**Key decisions & why:**
- **Title in the modal, not the empty state** — the modal is the single entry point for all data uploads; reusing it for "upload again" (next step) means no duplication
- **PapaParse for parsing** — handles quoted commas, varying line endings, and BOM characters that manual string splitting would not; it is the right tool for the parse direction (CSV → JS)
- **`BaseModal` in `src/ui/`** — generic shell with no feature knowledge; the error modal (next step) will reuse it with different slot content
- **`error` emit from `UploadModal`** — structured `CsvValidationError[]` handed off to the parent; swapping the toast for a real error modal next step requires no changes inside `UploadModal`
- **Mock data kept in `MOCK_CAMPAIN_DATA.ts`** — still used for the download template; removed only from the store initialisation
- **`clearFilters` on `loadCampaigns`** — prevents stale channel filters carrying over when new data is loaded


## [#18] Upload modal and empty state tweaks
**Type:** update

**Summary:** Added inline file type validation to the dropzone and centred the empty state vertically in the available viewport.

**Brainstorming:** File type validation was only enforced in `parseCsv` after the user had already clicked Upload — showing the error inline in the dropzone as soon as a wrong file is dropped or selected is faster feedback and consistent with how the title field behaves. The title `trim()` check was already in place. The empty state used fixed padding which left it floating near the top on tall viewports instead of truly centring in the remaining space below the header.

**Prompt:** Add inline file type validation to the upload modal dropzone — show the error message directly below the dropzone when a non-CSV file is selected or dropped, the same way the title field shows errors. Make sure the title validation rejects empty strings and whitespace-only input. Centre the empty state content vertically in the full remaining viewport height below the header.

**What changed:**
- `UploadModal.vue` — added `isValidCsvFile` check inside `setFile`; non-CSV files set `fileError` and clear `file.value` immediately on selection or drop, before the user clicks Upload
- `EmptyState.vue` — replaced fixed `padding: spacing.20` with `min-height: calc(100vh - 73px)` and `padding: spacing.8` so the content centres in the full available space regardless of viewport height

**Key decisions & why:**
- Inline validation on drop/select, not on submit — immediate feedback at the point of interaction is faster and consistent with how the title field behaves; users should never have to click Upload to discover the file type is wrong


## [#19] Prevent empty state scrolling
**Type:** update

**Summary:** Fixed empty state overflow by removing padding from AppShell.__main and moving it into each child view.


**Brainstorming:** The empty state was scrollable because `AppShell.__main` had `padding: spacing.6` added on top of the empty state's `min-height: calc(100vh - 73px)`, pushing the total height just over 100vh. The fix is to remove the padding from `__main` and move it into the dashboard content — that way the empty state fills the viewport exactly with no overflow, while the dashboard view keeps its spacing unchanged.

**Prompt:** Make the empty state screen non-scrollable. The empty state should fill the viewport exactly with no overflow.

**What changed:**
- `AppShell.vue` — removed padding from `__main`; added `overflow: hidden` so no scroll is possible when the empty state is shown
- `DashboardView.vue` — moved the `spacing.6` padding that was on `__main` into the `.dashboard` scoped styles so the dashboard layout is visually unchanged

**Key decisions & why:**
- Padding moved from `__main` into each child — `__main` is a layout container that should not impose spacing on its children; each child (empty state, dashboard) owns its internal spacing contract


## [#20] Fix scrollbar still visible on empty state
**Type:** fix

**Summary:** Fixed the scrollbar remaining visible on the empty state by locking body overflow while EmptyState is mounted.

**Brainstorming:** `overflow: hidden` on `__main` prevents the element itself from scrolling but does not prevent the `body` from scrolling — the scrollbar was coming from the body. The fix is to lock `document.body.style.overflow` while the empty state is mounted, the same pattern `BaseModal` already uses for the same reason.


**Prompt:** The scrollbar is still visible on the empty state screen. Fix it.
**What changed:**
- `EmptyState.vue` — added `onMounted` / `onUnmounted` hooks that set `document.body.style.overflow = 'hidden'` while the component is active and restore it on unmount

**Key decisions & why:**
- Body overflow lock matches the BaseModal pattern — the same problem (scrollbar visible despite content fitting) has the same root cause (body scroll not locked); reusing the same fix keeps the pattern consistent across the app


## [#21] Add download template button to upload modal footer
**Type:** update

**Summary:** Added a Download Template ghost button to the bottom-left of the upload modal footer.

**Brainstorming:** Users may open the upload modal without having downloaded the template yet. Putting the download button in the modal footer means they can get the template without closing the modal first. Placing it on the left keeps it visually separate from the Cancel / Upload action pair on the right — a standard pattern for secondary actions in modal footers.

**Prompt:** Add a Download Template button on the bottom left of the upload modal footer. Cancel and Upload should remain on the right.

**What changed:**
- `UploadModal.vue` — added `handleDownloadTemplate`, `downloadCsv`, `MOCK_CAMPAINS`, `useToastStore`, and `DownloadIcon` imports; Download Template ghost button placed as the first element in the footer slot; Cancel and Upload wrapped in a `footer-actions` div to keep them grouped on the right
- `UploadModal.vue` — added `.footer-actions` scoped style (flex, gap)
- `BaseModal.vue` — footer changed from `justify-content: flex-end` to `justify-content: space-between` so left and right slots spread correctly

**Key decisions & why:**
- Download Template placed on the left — visually separates a secondary utility action from the primary action pair (Cancel / Upload) on the right; a standard modal footer pattern for secondary actions

 
## [#22] Button spacing and equal width tweaks
**Type:** update

**Summary:** Doubled the gap between modal footer buttons and made the two empty state action buttons equal width.

**Brainstorming:** `spacing.3` (12px) between buttons felt too tight — doubling to `spacing.6` (24px) gives the actions more breathing room. Equal-width buttons on the empty state make the pair look intentional and balanced rather than sized by their label length.

**Prompt:** Double the gap between buttons in the upload modal footer. Make the two buttons in the empty state the same width.

**What changed:**
- `UploadModal.vue` — `.footer-actions` gap increased from `spacing.3` to `spacing.6`
- `EmptyState.vue` — `__actions` gap increased from `spacing.3` to `spacing.6`; added `:deep(.base-btn) { flex: 1 }` so both buttons share the available width equally

**Key decisions & why:**
- `flex: 1` for equal-width buttons — avoids hardcoded widths; buttons stay equal regardless of future label length changes


## [#23] Fix equal button widths on empty state
**Type:** fix

**Summary:** Fixed equal-width buttons on the empty state by giving the actions container an explicit width for flex distribution.

**Brainstorming:** `flex: 1` on the buttons requires the container to have a defined width to distribute against — without it, the container sizes to content and the buttons stay at their natural widths. Adding `width: 100%` and `max-width: 380px` (matching the description) gives the flex container a concrete size so both buttons grow equally.

**Prompt:** The Upload CSV button is still not the same width as Download Template. Fix it.

**What changed:**
- `EmptyState.vue` — added `width: 100%` and `max-width: 380px` to `__actions` so the flex container has a defined width for `flex: 1` to distribute against

**Key decisions & why:**
- Container needs an explicit width for `flex: 1` to work — without a defined width the container collapses to content size and `flex: 1` has nothing to distribute against


## [#24] Centre button content in BaseButton
**Type:** fix

**Summary:** Fixed left-aligned content in stretched buttons by adding justify-content: center globally to BaseButton.

**Brainstorming:** `inline-flex` without `justify-content` defaults to `flex-start`, so content stays left-aligned when a button stretches wider than its natural size. Adding `justify-content: center` to `BaseButton` fixes it globally — the correct default for any button regardless of width.

**Prompt:** The text and icon in the Upload CSV button are not centred. Fix it.

**What changed:**
- `BaseButton.vue` — added `justify-content: center` to `.base-btn`

**Key decisions & why:**
- Applied globally to BaseButton — any button that stretches beyond its natural width should center its content; making it the default avoids having to re-apply the rule on every stretched usage


## [#25] Empty state description and button layout tweaks
**Type:** update

**Summary:** Added a line break in the empty state description and introduced vertical button stacking on narrow viewports.

**Brainstorming:** The two description sentences read as one block — a `<br>` makes the second line intentionally separate. Removing `max-width` from the description lets it breathe on wider viewports without being capped. On very small screens (< 480px) horizontal buttons become cramped, stacking them vertically is the standard mobile pattern.

**Prompt:** Remove the max-width limit on the empty state description. Put the second sentence on its own line. Stack the buttons vertically on viewports narrower than 480px.

**What changed:**
- `EmptyState.vue` — added `<br />` between the two description sentences; removed `max-width: 380px` from `__description`; added `@media (max-width: 479px)` breakpoint to `__actions` that switches to `flex-direction: column` and removes the `max-width` cap so buttons span full width

**Key decisions & why:**
- Vertical stacking on mobile — horizontal buttons become cramped below 480px; stacking is the standard responsive pattern for action pairs on narrow viewports


## [#26] EmptyState outside dashboard div, fills available space via flex
**Type:** refactor

**Summary:** Moved EmptyState out of the dashboard div so it fills available space via flex as a true sibling element.

**Brainstorming:** `EmptyState` was rendered inside `<div class="dashboard">` which is semantically wrong — the empty state is not dashboard content. Separating them also allows each to control its own layout independently. Using `flex: 1` instead of `min-height` is the correct approach: the component simply takes all remaining space that the flex parent (`__main`) offers, with no hardcoded pixel calculations.

**Prompt:** The empty state div should not be inside the dashboard element. Remove min-height from the component and make it fill all available space with content centred using flex.

**What changed:**
- `DashboardView.vue` — replaced root `<div class="dashboard">` wrapper with a `<template>` root; `EmptyState` and the dashboard `<div v-else>` are now true siblings; `UploadModal` moved outside the dashboard div
- `AppShell.vue` — added `display: flex; flex-direction: column` to `__main` so it becomes a flex container that child elements can grow into
- `EmptyState.vue` — replaced `min-height: calc(100vh - 73px)` with `flex: 1` so it occupies all remaining space offered by the flex parent, with no hardcoded pixel values

**Key decisions & why:**
- Template root in DashboardView — removes the semantic mismatch of wrapping EmptyState inside the dashboard div; siblings share the same flex parent for clean layout control
- `flex: 1` on EmptyState instead of `min-height` — the component takes whatever space the parent offers without pixel calculations; more resilient to header height changes


## [#27] Maintain button natural width when stacked on small screens
**Type:** fix

**Summary:** Fixed buttons stretching full width on mobile by resetting flex to unset inside the narrow-viewport breakpoint.

**Brainstorming:** On small viewports `flex: 1` was still active when the buttons stacked vertically, stretching them to the full container width. Resetting `flex: unset` inside the mobile breakpoint lets each button size to its content — consistent with how they look in the horizontal layout where they share equal space by content, not by stretching.

**Prompt:** The Upload CSV button should keep its natural width on smaller screens, not stretch full width when stacked.

**What changed:**
- `EmptyState.vue` — added `:deep(.base-btn) { flex: unset }` inside the `@media (max-width: 479px)` block so buttons revert to content-sized width when stacked; removed `max-width: 100%` from the mobile breakpoint since the container's `max-width: 380px` already constrains it correctly

**Key decisions & why:**
- `flex: unset` inside mobile breakpoint — buttons should size to content when stacked, not stretch full width; consistent with how they appear in the horizontal desktop layout


## [#28] CSV validation error handling
**Type:** feature

**Summary:** All CSV validation errors are now surfaced with targeted, user-friendly feedback inside the upload modal — no separate error screens needed.

**Brainstorming:** Identified five error types across two groups. File-level errors (wrong type, too large, empty file) are simple and already had inline `fileError` — they just needed to be wired from `parseCsv` results back to that same field. Missing columns is also inline, but lists the specific column names so the user knows exactly what to fix. Invalid rows needed the most design work: the old approach concatenated errors into strings, which made them impossible to display in a table. The decision was to restructure `CsvRowError` as `{ row, column, issue }` so the table can render one row per field violation. The partial import question — reject all vs import valid rows — was resolved by doing both: reject nothing, surface the errors, and let the user decide with a "Proceed with N valid rows" button. This respects the user's time and keeps the app useful even with imperfect data.

**Prompt:** Implement CSV validation error handling. File-level errors (type, size, empty) shown inline under the dropzone. Missing columns: inline message listing the missing column names — "CSV file headers are missing: budget, revenue. Please consult the template." Invalid rows: switch the modal body to an error view with a scrollable table showing row number, column name, and issue per field error. If some rows are valid, show a "Proceed with N valid rows" primary button so the user can import the clean rows. If all rows are bad, only show Back and Cancel. "Back" returns to the upload form with the file cleared. Also add max-height + scroll to BaseModal so it never overflows the viewport. Update README for accurate error handling description. Generate test files for every error case.

**What was built:**
- `src/features/csv-file/types/index.ts` — added `CsvRowError { row, column, issue }` interface; added `rowErrors?: CsvRowError[]` field to `CsvValidationError`
- `src/features/csv-file/utils/parseCsv.ts` — row errors now produce structured `CsvRowError[]` instead of strings; valid campaigns are collected alongside errors so partial imports are possible; `else if` guards prevent double-reporting on dependent fields (clicks > impressions only checked when both values are individually valid)
- `src/features/csv-file/components/UploadModal.vue` — removed `error` emit; added `view` state (`form | row-errors`); file-level and missing-column errors are set as inline `fileError`; `invalid_rows` switches to error view; error view shows summary message, scrollable error table, and conditional "Proceed" button; "Back" resets to form and clears file; title is preserved across Back navigation
- `src/ui/BaseModal.vue` — added `max-height: calc(100vh - 2rem)` and `overflow: hidden` to `.modal`; added `flex: 1; min-height: 0; overflow-y: auto` to `__body` so the modal never overflows the viewport
- `src/features/dashboard/DashboardView.vue` — removed `onUploadError`, `useToastStore`, and `CsvValidationError` imports; removed `@error` binding from `UploadModal`
- `README.md` — updated CSV Upload & Template section with accurate error handling description
- `CLAUDE.md` — updated Status and Feature Checklist

**Key decisions & why:**
- **Structured `CsvRowError` over strings** — the old `"Row 3: budget must be…"` strings were impossible to split into table cells; structured objects make the table trivial and keep the parser decoupled from the UI format
- **Valid campaigns returned alongside errors** — previously `campaigns: []` was returned on any row error; now valid rows are kept so the partial import path is possible without a second parse
- **`else if` for dependent field checks** — clicks > impressions is only meaningful if both values are themselves valid; guarding with `else if` prevents misleading double errors on the same row
- **Inline errors for file-level and missing-column cases** — these don't need a view switch; the dropzone already has an `fileError` slot and the user just needs to pick a different file
- **"Proceed with N valid rows" wording** — the count is in the button so the user knows exactly what they are importing before clicking; no ambiguity


## [#29] Add test CSV files for edge cases and pretty visuals
**Type:** update

**Summary:** Added four test CSV files covering all parseCsv error branches and a rich valid dataset for visual QA.

**Brainstorming:** Existing test files covered basic cases but lacked: rows with multiple simultaneous errors, missing columns down to just one present, rows with fewer values than headers (column count mismatch), and a rich valid dataset for visual testing. These new files improve manual QA coverage across all error branches of parseCsv.ts.

**Prompt:** Add test file where some rows have multiple errors. Add test file where missing columns are all except one. Add test file where some rows miss values (do not match the number of expected columns). Add test file with prettiest visuals.

**What was built:**
- `test-files/multiple-errors-per-row.csv` — 5 rows with 2–7 errors each (empty fields, negative budget, clicks > impressions, conversions > clicks, non-numeric values, negative revenue); 2 valid rows so the "proceed with valid rows" path is testable
- `test-files/missing-columns-one-present.csv` — only `campaign` column; triggers the missing-columns error listing all 6 absent columns by name
- `test-files/missing-row-values.csv` — header has 7 columns; rows have 1–5 values, causing PapaParse to fill remaining fields with "" which the validator surfaces as multiple per-row errors; 2 valid rows at the end
- `test-files/pretty-visuals.csv` — 20 valid campaigns across 9 channels (Email, Paid Search, Social, Video, Organic, Affiliate, Display, Influencer, Podcast, Referral) with realistic CTR/CVR ratios, wide budget spread, and clear channel winners/losers for visually rich charts

**Key decisions & why:**
- One fixture per error branch — multiple-error rows, near-empty column sets, missing row values, and a clean visual dataset each exercise a distinct code path in `parseCsv`; dedicated files make manual QA faster and reproducible


## [#30] Refactor UploadModal — split into CsvUploadForm + CsvRowErrorTable, lift download template to parent
**Type:** refactor

**Summary:** Split the monolithic UploadModal into three focused components and moved the download template responsibility to DashboardView.

**Brainstorming:** UploadModal was doing too much: form state, file handling, parse orchestration, view switching, error display, and CSV download. The goal was one component per concern. Two natural cut points emerged — the form UI (its own state machine) and the error table (pure presentation). Download template has no business being inside a modal that is about uploading; it belongs to the parent that decides when to show the modal. The tricky part was that the footer buttons live in UploadModal but need the form's title/file after the form component is unmounted on view switch — solved by capturing `pendingTitle` before switching views.

**Prompt:** Split UploadModal into two sub-components: one with the form, one with the error table. Download template should be handled by the upload modal parent. Clean up the logic.

**What changed:**
- `CsvUploadForm.vue` (new) — owns title, file, isDragging, titleError, fileError; exposes `validate()`, `getValues()`, `setFileError()`, `reset()` via `defineExpose`; all form styles moved here
- `CsvRowErrorTable.vue` (new) — purely presentational; receives `rowErrors` and `validCampaigns` as props; computes `invalidRowCount` and `totalRows` locally; all error table styles moved here
- `UploadModal.vue` — reduced to orchestrator: holds `view`, `pendingTitle`, `validCampaigns`, `rowErrors`, `isLoading`; calls form methods via template ref; emits `download-template` instead of handling it; styles reduced to footer layout only
- `DashboardView.vue` — added `handleDownloadTemplate` with toast fallback; wired `@download-template` on `<UploadModal>`

**Key decisions & why:**
- `defineExpose` on CsvUploadForm rather than lifting state — footer buttons live in UploadModal's template; expose is cleaner than v-model or prop drilling for triggering validation from a parent
- `pendingTitle` captured before view switch — CsvUploadForm is destroyed on `v-if` when switching to the error view; capturing the title in UploadModal preserves it for the proceed path
- `download-template` emit rather than prop callback — keeps UploadModal free of any knowledge about CSV data, toast store, or file naming

 
## [#31] Refactor modals — BaseModal single slot, sub-components own body + footer, lift form state to UploadModal
**Type:** refactor

**Summary:** Changed BaseModal to a single default slot, moved body+footer layout into CsvUploadForm and CsvRowErrorTable, and lifted title/file state to UploadModal so form content is preserved across view switches.

**Brainstorming:** The previous design still had footer buttons controlled by UploadModal because BaseModal used separate named slots. Moving footer into sub-components required rethinking how BaseModal works. The cleanest solution: BaseModal provides only the shell (backdrop + header), and a single default slot accepts the full content — sub-components render their own body div and footer div as a multi-root template, which Vue 3 inserts inline into the modal's flex-column container. State preservation across view switches required lifting title and file refs to UploadModal (v-model), otherwise CsvUploadForm would remount fresh. parseError is also owned by UploadModal and cleared by a watcher on file changes.

**Prompt:** We should also move footer within the CsvUploadForm/CsvRowErrorTable component. If necessary we should update the BaseModal. We do not want the form to start fresh when going back.

**What changed:**
- `BaseModal.vue` — removed named `#body` and `#footer` slots; replaced with single default `<slot />`; header gets `flex-shrink: 0` to stay pinned
- `CsvUploadForm.vue` — multi-root template: `form-body` div (flex:1, scroll) + `form-footer` div (border-top, flex row); props: `title`, `file` (v-model), `parseError`, `isLoading`; emits `submit`, `close`, `download-template`, `update:title`, `update:file`; internal state: titleError, fileError, isDragging
- `CsvRowErrorTable.vue` — multi-root template: `error-body` div + `error-footer` div; props: `rowErrors`, `validCampaigns`; emits `back`, `proceed`, `close`, `download-template`; computes invalidRowCount and totalRows locally
- `UploadModal.vue` — minimal: owns `title`, `file`, `parseError`, `isLoading`; watcher on file clears parseError; handles parse result and view switching; template is just BaseModal + CsvUploadForm/CsvRowErrorTable with v-if

**Key decisions & why:**
- Single default slot in BaseModal — sub-components insert multi-root content (body + footer) directly into the modal's flex column; no named slot forwarding needed
- `flex-shrink: 0` on header — prevents header from collapsing when body content is large
- Lifting title/file to UploadModal via v-model — CsvUploadForm remounts on view switch (`v-if`) but state lives in the parent, so Back restores the user's input exactly
- `parseError` watcher on file — clears the parse error as soon as user picks a new file, before they resubmit


## [#32] Move download template handling into UploadModal
**Type:** fix

**Summary:** Moved download template handling from DashboardView into UploadModal so it owns all CSV-related logic.

**Brainstorming:** UploadModal was emitting `download-template` up to DashboardView, which had no reason to know about CSV download logic. UploadModal is the right owner — it already imports csv-related utilities and has the toast store context.

**Prompt:** UploadModal should not emit anything related to download. It should handle downloading the file itself.

**What changed:**
- `UploadModal.vue` — added `handleDownloadTemplate` with `downloadCsv` + toast fallback; wired to `@download-template` on both sub-components; removed `download-template` from `defineEmits`
- `DashboardView.vue` — removed `useToastStore`, `downloadCsv`, `MOCK_CAMPAINS` imports; removed `handleDownloadTemplate` function; removed `@download-template` binding on `<UploadModal>`

**Key decisions & why:**
- Download logic belongs in UploadModal, not DashboardView — UploadModal already imports csv utilities and the toast store; delegating the emit to the parent created unnecessary coupling between DashboardView and csv internals


## [#33] UploadModal fully self-contained — no emits, open via ref
**Type:** refactor

**Summary:** Made UploadModal fully self-contained — it owns its open state, calls the store directly, and resets on close with no external emits.

**Brainstorming:** UploadModal was still emitting `success` and `close` to DashboardView, which then called the store and toggled visibility. Moving that responsibility inside UploadModal makes it a zero-emit component — it owns its open state, calls the store directly, and resets itself on close.

**Prompt:** UploadModal should not emit anything. It should handle success (store load) and close internally.

**What changed:**
- `UploadModal.vue` — added `isOpen` ref; `open()` exposed via `defineExpose`; `close()` resets all state and sets `isOpen = false`; `handleSubmit` and `handleProceed` call `campaignStore.loadCampaigns()` then `close()` directly; removed all `defineEmits`; template uses `v-if="isOpen"` on BaseModal
- `DashboardView.vue` — replaced `showUploadModal` ref and `onUploadSuccess` handler with a single `uploadModal` template ref; EmptyState `@upload` calls `uploadModal?.open()`; `<UploadModal>` rendered unconditionally with just `ref="uploadModal"`

**Key decisions & why:**
- Zero-emit component — UploadModal owns its full lifecycle (open, success, close, reset); callers need only a template ref to open it with no success handler or visibility state to manage externally
- `defineExpose({ open })` minimal surface — the parent can only open the modal, nothing else; all other state is encapsulated


## [#34] Extract useDownloadTemplate composable
**Type:** refactor

**Summary:** Extracted the repeated download template handler into a shared useDownloadTemplate composable.

**Brainstorming:** `handleDownloadTemplate` was duplicated verbatim in both `EmptyState.vue` and `UploadModal.vue`. Since the function uses a Pinia store it belongs in a composable rather than a pure utility.

**Prompt:** Create a single shared function for the repeated download template logic.

**What changed:**
- `composables/useDownloadTemplate.ts` (new) — wraps `downloadCsv` + `useToastStore` error fallback; returns `{ downloadTemplate }`
- `UploadModal.vue` — removed inline `handleDownloadTemplate`, `downloadCsv`, `MOCK_CAMPAINS`, and `useToastStore` imports; uses `downloadTemplate` from composable
- `EmptyState.vue` — same removals; uses `downloadTemplate` from composable

**Key decisions & why:**
- Composable over utility function — the download handler uses a Pinia store (`toastStore`); a composable is the correct wrapper for logic that combines reactive state with a side effect, whereas a plain utility function cannot call `useToastStore()`


## [#35] Add FileTextIcon; update EmptyState and CsvRowErrorTable Back button
**Type:** update

**Summary:** Extracted the empty state icon into a reusable FileTextIcon component and upgraded the error table Back button to primary variant.

**Brainstorming:** The empty state had an inline SVG with no reusable home. Extracting it into a named icon component keeps the icons library complete and EmptyState clean. The Back button in the error table needed stronger weight to signal it's a primary action at that stage. An ArrowLeftIcon was added and then removed as it added visual noise without clarity.

**Prompt:** Create an icon component for the empty state icon. Make the Back button in CsvRowErrorTable primary and add a back arrow icon. Then remove the arrow icon.

**What changed:**
- `ui/icons/FileTextIcon.vue` (new) — file-with-lines SVG extracted from EmptyState; stroke-width 1.5 for large decorative use
- `ui/icons/ArrowLeftIcon.vue` (new) — left arrow SVG; stroke-width 2 consistent with other icons; added to barrel export but not used in templates
- `ui/icons/index.ts` — added exports for both new icons (alphabetical order)
- `EmptyState.vue` — replaced inline SVG with `<FileTextIcon />`
- `CsvRowErrorTable.vue` — Back button changed to `variant="primary"` with text only

**Key decisions & why:**
- Inline SVG extracted to named icon component — keeps EmptyState clean and adds `FileTextIcon` to the ui/icons library where it can be reused across features
- `ArrowLeftIcon` added to barrel but not used in templates — the icon added visual noise without clarity; available for future use without cluttering current UI


## [#36] Update modal close button — larger, purple hover
**Type:** update

**Summary:** Made the modal close button larger and added a light purple hover background to match the app's primary colour.

**Brainstorming:** The close button was too small and had no background feedback on hover, making it feel unresponsive.

**Prompt:** Make the X button bigger with more padding. On hover show a light purple background.

**What changed:**
- `BaseModal.vue` — increased padding from `spacing.1` to `spacing.2`; icon size from `1rem` to `1.1rem`; border-radius from `sm` to `md`; hover now sets light purple background (`rgba(99,102,241,0.12)`) and purple-tinted icon color (`#a5b4fc`); added `background-color` to transition

**Key decisions & why:**
- Purple hover matches the app's primary color — the close button hover state aligns with the indigo/purple palette used across interactive elements for visual consistency


## [#37] Move EmptyState to dashboard feature
**Type:** refactor

**Summary:** Moved EmptyState from csv-file/components to dashboard/components where it semantically belongs.

**Brainstorming:** EmptyState is the no-data state of the dashboard, not a CSV-specific component. It belongs alongside the other dashboard components.

**Prompt:** Move EmptyState to dashboard since it is more logical that this component relates to that feature.

**What changed:**
- `EmptyState.vue` — moved from `csv-file/components/` to `dashboard/components/`; updated composable import path to `../../csv-file/composables/useDownloadTemplate`
- `DashboardView.vue` — updated import to `./components/EmptyState.vue`

**Key decisions & why:**
- EmptyState belongs in `dashboard/components/` — it is the no-data state of the dashboard view, not a CSV-specific component; co-locating it with the other dashboard components is semantically correct


## [#38] Align error table styles to campaign table; extract shared data-table base styles
**Type:** refactor

**Summary:** Aligned the error table styles with the campaign table and extracted shared table base styles into a global @layer components class.

**Brainstorming:** The error table used different background colors, tighter padding, and a solid border between rows, making it look visually disconnected from the campaign table. Once aligned, it became clear both tables shared identical base styles defined separately in each component — extracting them into a global `@layer components` class removes the duplication and establishes a consistent table visual language. The row index column in the error table also used a muted secondary color, making it look like a label; matching it to the campaign name style (bold, `#cbd5e1`) gives it the same visual weight.

**Prompt:** Update the error table to use the same colors as the campaign table. Move common table styles to the layer components. The row index should be the same style as campaign name.

**What changed:**
- `style.scss` — added `.data-table`, `.data-table__th`, `.data-table__tr`, `.data-table__td` to `@layer components` with all shared base styles
- `CampaignTable.vue` — template updated to use shared `data-table` classes; `campaign-table__th` and `campaign-table__td--*` modifiers kept scoped for unique behavior (sort hover, ROI colors, channel badge); removed duplicated scoped base styles
- `CsvRowErrorTable.vue` — header background changed to `var(--color-surface)`; padding increased to match campaign table; cell text color changed to `#cbd5e1`; row border changed to `color-mix(in srgb, var(--color-border) 50%, transparent)` with no border on last child; row hover added; template updated to use shared `data-table` classes; scoped reduced to `error-table__th` (sticky + column widths) and `error-table__td` modifiers; `--row` modifier updated to `font-weight: 600`

**Key decisions & why:**
- Global `@layer components` for shared table styles — Tailwind's components layer has lower specificity than utilities, so scoped modifier classes still override; extracting shared styles here prevents future visual divergence between the two tables

## [#39] Remove download template from error table footer; reposition proceed button
**Type:** update

**Summary:** Removed the redundant Download Template button from the error table footer and repositioned Proceed with valid rows to the left slot.

**Brainstorming:** The download template button in the error table footer was redundant — users are already notified of errors in context and don't need a template shortcut at that stage. Removing it simplifies the footer. With the left slot freed up, "Proceed with valid rows" moves there so the layout stays balanced: action on the left, navigation (Cancel / Back) on the right. The count was dropped from the button label since the summary paragraph already communicates how many valid rows exist.

**Prompt:** Remove the download template button from CsvRowErrorTable. Cancel and Back stay on the right. When valid rows exist, show "Proceed with valid rows" on the left where the download button was.

**What changed:**
- `CsvRowErrorTable.vue` — removed `downloadTemplate` emit and `DownloadIcon` import; footer restructured: "Proceed with valid rows" on the left (v-if valid rows), Cancel + Back on the right; button label simplified to "Proceed with valid rows"
- `UploadModal.vue` — removed `@downloadTemplate` binding from `CsvRowErrorTable`

**Key decisions & why:**
- Download Template removed from error footer — users are already in context of their errors; they don't need a template shortcut at that stage and removing it simplifies the footer
- Proceed moves to the left slot — with the left slot freed up, placing Proceed there keeps the footer balanced and visually separates the forward action from the navigation pair (Cancel / Back)
- Count dropped from button label — the summary paragraph already communicates how many valid rows exist; repeating it in the button adds redundancy


## [#40] Footer mobile layout and proceed variant update for upload and error table
**Type:** update

**Summary:** Switched Proceed with valid rows to ghost variant and added responsive vertical stacking for both modal footers on narrow viewports.

**Brainstorming:** "Proceed with valid rows" reads as a secondary action — it's an escape hatch, not the main CTA — so ghost variant fits better than primary. On small screens the current horizontal footer overflows or wraps awkwardly; a stacked layout with clear visual hierarchy (primary first, secondary second, cancel last) and full-width buttons improves usability. Both footers share the same responsive pattern so both get the same treatment.

**Prompt:** Proceed with valid rows should be a secondary (ghost) button. For both CsvRowErrorTable and CsvUploadForm, on screens narrower than 480px, stack buttons vertically: primary first, secondary second, cancel third — full width, text centred.

**What changed:**
- `CsvRowErrorTable.vue` — Proceed changed to `variant="ghost"`; footer flattened (removed `__actions` wrapper); modifier classes added to each button; Cancel gets `margin-left: auto` for desktop push; `@media (max-width: 479px)` stacks to column with Back order 1, Proceed order 2, Cancel order 3, all `width: 100%`
- `CsvUploadForm.vue` — footer flattened; modifier classes added; Cancel gets `margin-left: auto`; `@media (max-width: 479px)` stacks to column with Upload order 1, Download Template order 2, Cancel order 3, all `width: 100%`

**Key decisions & why:**
- CSS `order` for mobile reordering — avoids duplicating HTML for different viewports; a single DOM structure serves both layouts
- `margin-left: auto` on Cancel for desktop grouping — pushes Cancel and the button after it to the right without a wrapper div; flatter DOM structure than the previous `__actions` group
- Proceed as `ghost` variant — it is an escape hatch for partial imports, not the primary CTA; ghost weight correctly signals secondary importance


## [#41] Rename CsvRowErrorTable to CsvErrorTable
**Type:** update

**Summary:** Renamed the component file and all references from `CsvRowErrorTable` to `CsvErrorTable` for a shorter, cleaner name.

**Brainstorming:** The "Row" part of the name was redundant — the component is the error table for the CSV upload flow, and the context makes "row errors" implicit. `CsvErrorTable` is shorter and reads more naturally alongside `CsvUploadForm`.

**Prompt:** Rename CsvRowErrorTable to CsvErrorTable.

**What changed:**
- `CsvRowErrorTable.vue` — renamed to `CsvErrorTable.vue`
- `UploadModal.vue` — import path and component tag updated from `CsvRowErrorTable` to `CsvErrorTable`

**Key decisions & why:**
- "Row" dropped from the name — the component's purpose is clear without it; shorter names reduce noise in imports and templates


## [#42] Move upload button and UploadModal to AppShell
**Type:** update

**Summary:** Removed the Download Template button from AppShell header; moved UploadModal ownership to AppShell, which now conditionally shows an Upload CSV button in the header when data is loaded.

**Brainstorming:** The Download Template button in the header was removed as requested. The Upload CSV button is a global action that belongs in the persistent layout shell rather than inside the dashboard view — it needs to be accessible from the header regardless of scroll position. UploadModal is self-contained and only needs open() called, so moving it to AppShell is straightforward. DashboardView's EmptyState still needs to trigger the modal, which is solved with Vue's provide/inject: AppShell provides openUploadModal, DashboardView injects it and passes it to EmptyState's @upload handler.

**Prompt:** In the AppShell component remove the download template button. When a file is loaded and dashboard is visible, we should display the upload file button and when user clicks on it the upload modal should be displayed.

**What changed:**
- `shell/AppShell.vue` — removed Download Template button and all related imports (BaseButton, DownloadIcon, downloadCsv, MOCK_CAMPAINS, toastStore); added UploadModal ref; added Upload CSV button (v-if store.campaigns.length > 0); renders UploadModal; provides openUploadModal via provide()
- `features/dashboard/DashboardView.vue` — removed UploadModal import and uploadModal ref; removed <UploadModal> render; injects openUploadModal from AppShell; EmptyState @upload calls openUploadModal?.()

**Key decisions & why:**
- UploadModal moved to AppShell — it is a global action reachable from both the header button and the empty state; AppShell is the correct owner for components that need to be accessible application-wide
- provide/inject for EmptyState access — DashboardView injects openUploadModal from AppShell and passes it to EmptyState's @upload handler; avoids prop drilling or an event bus while keeping UploadModal encapsulated in AppShell


## [#43] AI Assistant structural scaffold — push panel + modal
**Type:** feature

**Summary:** Added the AI Assistant entry point: a sparkles button in the dashboard header that opens a 400px push panel on lg+ screens and a modal on smaller screens, with stubbed Budget Optimizer and Executive Summary sections.

**Brainstorming:** The trigger button belongs in DashboardView next to the "Campaign Performance" title since it is dashboard-specific. The lg breakpoint (1024px) was chosen because the dashboard already uses it as its primary structural breakpoint (charts switch from 1- to 2-column, KPI grid switches to 5-column). Below 1024px the layout is fully stacked, making a side panel impractical. Push layout was preferred over overlay so the dashboard content compresses rather than being covered. The panel is a CSS width transition (0→400px) on an outer wrapper with a sticky inner panel at height 100vh — this keeps the panel visible while the dashboard scrolls. On small screens the same open state drives a Teleport modal with a fade+scale transition, hidden at lg+ via a CSS media query. Body scroll is locked only in modal mode, checked via window.matchMedia. AiAssistantContent was extracted as a shared component used in both panel and modal. AppShell was restructured from a single centered flex column to a flex row at lg+ with app-shell__content (centered slot, max-width 1280px) and the drawer as siblings. overflow: hidden on app-shell__main was removed (replaced with overflow-x: clip on app-shell__content) to allow position: sticky to work on the panel.

**Prompt:** Create the ai-integration feature structure. On the right side of the "Campaign Performance" title add a button with a sparkles icon and the text AI. The button should slide in a push panel from right to left on lg+ screens. On smaller screens it should be a modal. Title: AI Assistant. Panel width 400px. Push layout (dashboard compresses). Basic stub content with Budget Optimizer and Executive Summary sections. No close on backdrop click.

**What was built:**
- `ui/icons/SparklesIcon.vue` — sparkles SVG icon (Lucide-style, 24×24) for the AI button and panel/modal header
- `ui/icons/index.ts` — added SparklesIcon export
- `features/ai-assistant/components/AiAssistantContent.vue` — stub panel body: Budget Optimizer and Executive Summary section cards with disabled action buttons and a "configure API key" notice
- `features/ai-assistant/components/AiAssistantDrawer.vue` — unified component: CSS width-transition push panel at lg+ (sticky, 100vh, border-left); Teleport modal with fade+scale transition at <lg; Escape key closes both; body scroll locked in modal mode only
- `features/ai-assistant/index.ts` — barrel export for AiAssistantDrawer
- `shell/AppShell.vue` — restructured app-shell__main to flex row at lg+; added app-shell__content wrapper (flex:1, max-width 1280px, centered); mounts AiAssistantDrawer as sibling to content; provides openAiPanel via provide()
- `features/dashboard/DashboardView.vue` — added dashboard__title-row (flex row, space-between) wrapping the title and a ghost BaseButton with SparklesIcon + "AI" label; injects openAiPanel

**Key decisions & why:**
- lg (1024px) breakpoint — matches the existing structural breakpoint used throughout the dashboard; below lg the layout is fully stacked, making a side panel impractical
- Push over overlay — user requirement; implemented via CSS width transition on outer wrapper so dashboard content naturally compresses without JS layout recalculation
- position: sticky on inner panel — keeps the AI panel visible in the viewport while the user scrolls the dashboard; align-items: flex-start on the parent flex row is required for sticky to engage
- overflow-x: clip instead of overflow: hidden — overflow: hidden on an ancestor breaks position: sticky; clip achieves horizontal clipping without creating a scroll container, leaving sticky intact
- AiAssistantContent extracted — content is rendered in both panel and modal; extracting avoids duplication and gives a clean place to add real AI UI later
- Modal hidden via CSS media query — the Teleport modal renders in body; a (min-width: 1024px) media query sets display:none, ensuring only the panel is visible on large screens without JS screen-size detection


## [#44] Layout improvements — scrollable left column, non-sticky header, primary AI button
**Type:** update

**Summary:** Made the left column the scroll container at all screen sizes, removed the sticky header so it scrolls with content, and changed the AI button to the primary variant.

**Brainstorming:** The user wanted three specific layout changes: (1) The AI button should visually stand out as a primary action rather than a ghost; since `primary` is the default BaseButton variant, the explicit `variant="ghost"` was simply removed. (2) The scrollable area should always be the left column — previously `height: 100vh; overflow: hidden` on `.app-shell` and `overflow-y: auto` on `.app-shell__left` were only applied at `lg+`; removing the media query wrapper makes the left column the scroll container on all screen sizes. (3) The header should scroll with the content rather than staying sticky — the `position: sticky; top: 0; z-index: 10` block on `.app-shell__header` was removed and `flex-shrink: 0` is no longer needed.

**Prompt:** Improve layouts. AI button should be primary. Scrollable area should be the left side and header should also be scrollable.

**What changed:**
- `features/dashboard/DashboardView.vue` — removed `variant="ghost"` from the AI button (falls back to default primary variant)
- `shell/AppShell.vue` — moved `height: 100vh; overflow: hidden` out of the lg media query to apply at all sizes; moved `overflow-y: auto` on `__left` out of the lg media query; removed `position: sticky; top: 0; z-index: 10` and `flex-shrink: 0` from `__header`

**Key decisions & why:**
- Primary is the default variant — removing the explicit `variant="ghost"` attribute is cleaner than setting `variant="primary"`, avoids redundancy
- Scroll container at all sizes — consistent behavior across breakpoints; the drawer already uses Teleport on small screens so the side-by-side overflow model is safe to enable universally
- Non-sticky header — user preference; the header scrolls away so more vertical space is available for dashboard content when scrolled


## [#45] AI Tools — connection form, live verification, connected status, tabbed interface
**Type:** feature

**Summary:** Renamed the AI Assistant feature to AI Tools, introduced a Pinia aiStore for memory-only connection state, and replaced the stub content with a connection form (Google Gemini / Grok), live API key verification, a connected status bar, and a tabbed interface (Optimizer / Summary).

**Brainstorming:** The feature needed four distinct states: (1) disconnected — show a form; (2) connecting — show spinner on the button; (3) connected — show status bar + tabs; (4) error — show inline message. Keeping all connection state in a dedicated Pinia store (aiStore) rather than local component state makes it available across the entire app, which will be needed when the Optimizer and Summary tabs actually call the AI APIs. Memory-only storage was chosen over sessionStorage/localStorage so API keys are never written to disk or browser storage. For provider support, Google Gemini (generativelanguage.googleapis.com) and Grok (api.x.ai, OpenAI-compatible) were chosen as both have free tiers. Connection verification uses a lightweight read-only endpoint on each provider (list models) that confirms the key is valid without consuming quota. The folder was renamed from ai-assistant to ai-tools and all component names updated for consistency. The drawer body padding was removed and moved into each child component so the status bar and tab bar can span the full panel width without negative-margin hacks.

**Prompt:** Rename ai assistant to ai tools, update the title. When no connection is established display a message and a form with provider and api key fields and a Connect button. Connection state in a shared store. On connect, establish and verify the connection. When connected show provider name and green Connected text with green dot on the right under the header. Underneath two tabs: Optimizer and Summary, both with icons. Providers: Google Gemini and Grok (free API keys). Memory-only for security. Rename folders for consistency.

**What was built:**
- `stores/aiStore.ts` — new Pinia store; AiProvider type ('gemini' | 'grok'); PROVIDER_LABELS map; testGemini() and testGrok() async helpers; connect() action with isConnecting/connectionError; disconnect() action; all state memory-only
- `ui/icons/SlidersIcon.vue` — new Lucide-style vertical sliders SVG icon for the Optimizer tab
- `ui/icons/index.ts` — added SlidersIcon export
- `features/ai-tools/components/AiConnectionForm.vue` — provider select (Gemini/Grok), API key input with show/hide toggle, Connect button with CSS spinner, inline error display; calls store.connect()
- `features/ai-tools/components/AiConnectedStatus.vue` — full-width status bar with provider label, green pulsing dot, "Connected" text, and Disconnect link; calls store.disconnect()
- `features/ai-tools/components/AiTabs.vue` — two tabs (Optimizer with SlidersIcon, Summary with FileTextIcon); role="tablist" / role="tab" ARIA; emits change event; active underline indicator
- `features/ai-tools/components/AiToolsContent.vue` — orchestrates connection form vs connected state; manages activeTab ref; stub content for each tab panel
- `features/ai-tools/components/AiToolsDrawer.vue` — renamed from AiAssistantDrawer; title updated to "AI Tools"; uses AiToolsContent; removed &__body padding (content manages its own layout)
- `features/ai-tools/index.ts` — barrel export for AiToolsDrawer
- `shell/AppShell.vue` — updated import from AiAssistantDrawer → AiToolsDrawer
- `features/ai-assistant/` — deleted entire folder

**Key decisions & why:**
- Memory-only API key storage — user requirement; keys are never written to sessionStorage or localStorage, so they cannot be extracted from browser storage
- Live verification on connect — a real API call (list models) confirms the key works before showing the connected state; avoids silent failures later when the AI features are used
- Separate test helpers per provider — Gemini and Grok have different auth mechanisms (query param vs Bearer header) and different error status codes; separate functions keep the logic clean
- Drawer body padding removed — status bar and tab bar need to span full panel width; moving padding into child components avoids negative-margin hacks
- AiToolsContent as orchestrator — connection form, status bar, tabs, and tab panels are all in one component that reads store.isConnected; this keeps AiToolsDrawer unaware of connection state


## [#46] AI Tools tabs — panel layout, demo responses, loader states
**Type:** feature

**Summary:** Replaced the stub tab content in AiToolsContent with two dedicated panel components (AiOptimizerPanel, AiSummaryPanel) each with a title, file subtitle, action button (SparklesIcon + "Analyze"/"Summarize"), idle state, loading spinner, and a structured demo response.

**Brainstorming:** The two panels are similar in structure (head + state machine) but differ in content and eventual AI prompt/response format, so they were extracted into separate components rather than kept in one file. Each panel has three states: idle (dashed-border empty-state message), loading (centered spinner + label), and done (structured demo result). The demo uses a 2–2.5 second setTimeout to simulate AI latency. Button text was chosen as "Analyze" (Optimizer) and "Summarize" (Summary) — both are specific verb forms of what the action does, clearer than "Generate". SparklesIcon was reused for both buttons since it represents AI generation and the tabs already carry their own distinguishing icons. The reallocation table in the Optimizer demo shows channel, current budget, recommended budget, and delta with green/red colouring. The Summary demo shows three sections (Top Performers, Underperformers, Actionable Insights) with colour-coded section headings. TODOs for actual AI prompts and error handling were added to both component files and to the CLAUDE.md checklist.

**Prompt:** Update the tabs. Summary: title "Executive Summary", subtitle with uploaded file name, initial state message, Summarize button (with icon) on right of title, loader on press, demo response. Optimizer: title "Budget Optimizer", subtitle with uploaded file name, initial state message, Analyze button (with icon) on right of title, loader on press, demo response. Add TODOs for configuring prompts and error handling.

**What was built:**
- `features/ai-tools/components/AiSummaryPanel.vue` — new; title + store.title subtitle + Summarize button (SparklesIcon); idle/loading/done state machine; demo result with Top Performers, Underperformers, Actionable Insights sections; TODO comments for real API call and error handling
- `features/ai-tools/components/AiOptimizerPanel.vue` — new; title + store.title subtitle + Analyze button (SparklesIcon); idle/loading/done state machine; demo result with reallocation table (current vs recommended budget, delta coloured green/red), High Confidence badge, and rationale; TODO comments for real API call and error handling
- `features/ai-tools/components/AiToolsContent.vue` — replaced inline stub sections with AiOptimizerPanel / AiSummaryPanel conditionally rendered by activeTab

**Key decisions & why:**
- "Analyze" / "Summarize" over "Generate" — more specific; "Generate" is vague, "Analyze" communicates what the Optimizer does (analyse campaign data), "Summarize" communicates what the Summary does (summarise performance)
- Separate panel components — each tab will have its own AI prompt, response format, and eventually its own loading/error state; keeping them separate avoids a monolithic content component and gives a clean place to add real AI logic
- Demo with realistic structure — the demo result uses the same layout (table, sections, badges) that will be needed for real responses, so switching to actual AI output only requires replacing the hardcoded data, not the template structure
- TODOs in both code and CLAUDE.md — ensures neither prompt configuration nor error handling is forgotten across sessions


## [#47] Replace AI modal with overlay panel; intensify text colors
**Type:** update

**Summary:** Replaced the teleported modal (<lg) with a fixed overlay panel on top of the dashboard; kept the push drawer at lg+; updated all AI panel text colors to #cbd5e1 for stronger contrast.

**Brainstorming:** The previous implementation used a teleported modal at <lg and a push drawer at lg+. The modal was a centered dialog — the user wanted the small-screen version to behave more like the drawer (a panel sitting on top of the dashboard, not a centered dialog). The new overlay is a fixed panel anchored to the right with a semi-transparent backdrop. Clicking the backdrop or pressing Escape closes it. The content container is constrained to max-width 90vw and max-height 90vh. The push drawer at lg+ is preserved as-is. The body scroll lock was removed since the overlay doesn't need it. Text colors across all AI components were bumped from `var(--color-text-secondary)` (#94a3b8) to `#cbd5e1` to match `.data-table__td`, and the "AI Tools" header title was updated to `#cbd5e1` as well.

**Prompt:** Update the side-panel structure: no longer a modal for smaller screens, the panel should overlay on top of the dashboard. Keep the drawer for lg+. Max allowed width and max allowed height of the content container should be 90% of the screen. Use more intense color for the text like the table uses, same for the "AI tools" header.

**What changed:**
- `features/ai-tools/components/AiToolsDrawer.vue` — replaced teleported modal with fixed overlay panel at <lg (right-anchored, backdrop, slide-in transition, 90vw/90vh constraints); push drawer at lg+ preserved; removed body scroll lock; title color set to #cbd5e1
- `features/ai-tools/components/AiConnectionForm.vue` — text colors updated from `var(--color-text-secondary)` to `#cbd5e1`
- `features/ai-tools/components/AiConnectedStatus.vue` — provider label and disconnect link colors updated to `#cbd5e1`
- `features/ai-tools/components/AiTabs.vue` — inactive tab color updated to `#cbd5e1`
- `features/ai-tools/components/AiOptimizerPanel.vue` — all secondary text colors updated to `#cbd5e1`
- `features/ai-tools/components/AiSummaryPanel.vue` — all secondary text colors updated to `#cbd5e1`

**Key decisions & why:**
- Overlay instead of modal at <lg — panel sits on top of dashboard rather than being a centered dialog, maintaining the side-panel feel at all sizes
- 5vh/5vw padding on the overlay wrapper — achieves the 90% max constraint naturally
- `display: none` on drawer at <lg and on overlay at lg+ — ensures only one instance of AiToolsContent is in the DOM at a time per breakpoint, avoiding duplicate state
- `#cbd5e1` for text — matches `.data-table__td` color, giving the AI panel the same visual weight as the campaign table


## [#48] Executive summary data builder + shared math helpers
**Type:** feature

**Summary:** Implemented the calculation logic that transforms Campaign[] into a compact ExecutiveSummaryData payload for AI analysis, with shared math helpers and a reactive computed in the campaign store.

**Brainstorming:** The campaign store already had inline safe-division logic for KPI computation. Rather than duplicating that, `safeDivide` and `round2` were extracted into `common/utils/math.ts` so both the store's existing KPIs and the new summary builder share the same primitives. The builder function itself is pure (no Vue/Pinia dependency) — it takes `Campaign[]` and an optional `period` string, returns `ExecutiveSummaryData`. This makes it deterministic and easy to unit test. The store exposes the result as a computed `executiveSummaryData` that reacts to `campaigns` (unfiltered — the AI gets the full portfolio, not the user's current filter state). Channel aggregation uses a Map for O(n) grouping. Top/underperforming campaign selection uses multi-key sorting (roi → revenue → conversions for top; roi → budget → revenue for underperforming). Key findings are generated programmatically from the aggregated data — disproportionate revenue/budget ratios, negative-ROI high-budget channels, standout campaign ROI, and concentration risk. Optional fields (period, otherChannelsSummary, keyFindings) are only included when they have meaningful content.

**Prompt:** Implement the calculation logic that transforms validated campaign CSV rows into a compact executive-summary payload for AI analysis. Per-campaign metrics, portfolio totals, channel aggregation, top/underperforming selection, key findings. Store in campaignStore. Reuse existing logic where possible.

**What was built:**
- `common/utils/math.ts` — new; `safeDivide(n, d)` returns 0 when d=0; `round2(v)` rounds to 2 decimal places
- `features/ai-tools/utils/buildExecutiveSummaryData.ts` — new; main builder function: derives per-campaign metrics, aggregates channels, splits top/other channels, selects top and underperforming campaigns, generates key findings
- `stores/campaignStore.ts` — refactored KPI computed to use `safeDivide`/`round2`; added `executiveSummaryData` computed that calls the builder on all campaigns
- `features/ai-tools/prompts/index.ts` — fixed barrel export path (was `./executive-summary`, now `./executive-summary-prompt`)

**Key decisions & why:**
- Pure builder function with no Vue dependency — keeps the logic testable and decoupled; called on-demand at prompt time with filtered data
- Not stored as a computed in the store — summary data is built when the AI prompt is triggered, using the current filtered campaigns, so the AI analysis matches what the user sees on the dashboard
- Shared math helpers in `common/utils/` — `safeDivide` and `round2` are generic, not AI-specific; the store's existing KPI logic now uses them too, eliminating duplicated safe-division patterns
- Multi-key sorting for campaign ranking — single-metric sorting would produce arbitrary tiebreaking; the spec's priority ordering (roi → revenue → conversions) gives deterministic, meaningful results
- Optional fields excluded when empty — `period`, `otherChannelsSummary`, and `keyFindings` are omitted from the returned object when they carry no data, keeping the AI prompt payload clean


## [#49] Budget Optimizer data builder
**Type:** feature

**Summary:** Added `buildBudgetOptimizerData` function to transform campaign rows into a structured `BudgetOptimizerData` object with per-campaign metrics, channel aggregation, and portfolio totals for the Budget Optimizer AI prompt.

**Brainstorming:** The Budget Optimizer needs the same campaign data transformed into a different shape than the Executive Summary. Key differences: all campaigns and channels are included (no top-N slicing), campaigns carry full funnel metrics (impressions, clicks), both campaigns and channels are sorted by budget descending (not ROI), and there is no `otherChannelsSummary` split. The builder follows the same pattern as `buildExecutiveSummaryData` — pure function, no Vue dependency, reuses `safeDivide` and `round2` from `common/utils/math.ts`. The `Campaign` type already matches the input shape so no new input type is needed.

**Prompt:** Generate the frontend data formatting logic for the Budget Optimizer AI feature. Transform validated campaign rows into `BudgetOptimizerData` with per-campaign metrics (ctr, cvr, cac, roi, budgetShare, revenueShare), channel-level aggregation, and portfolio totals. Use safe division, round to 2 decimals, sort by budget descending. Reuse existing codebase helpers.

**What was built:**
- `features/ai-tools/utils/buildBudgetOptimizerData.ts` — exports `buildBudgetOptimizerData(rows: Campaign[]): BudgetOptimizerData`; derives per-campaign metrics with budget/revenue shares, aggregates channels with full funnel metrics, computes portfolio totals with safe division

**Key decisions & why:**
- Reuses `Campaign` type as input instead of defining a new `CampaignRow` — the existing `Campaign` interface is structurally identical, avoids redundant types
- All campaigns and channels included — the optimizer needs the full picture to recommend reallocations, unlike the summary which highlights top/bottom performers
- Sorted by budget descending — the optimizer's primary concern is where money is allocated, so budget ordering is the natural default
- Same architecture as executive summary builder — pure function, no store dependency, called on-demand with filtered data; keeps the two builders consistent and testable


## [#50] Extract reusable building-block types for AI tools
**Type:** refactor

**Summary:** Extracted three shared type aliases (AllocationShare, FunnelMetrics, PortfolioCount) from duplicated inline fields across Executive Summary and Budget Optimizer types, improving composability without changing any runtime behavior.

**Brainstorming:** Audited the ai-tools types file and found three patterns repeated across multiple types: budgetShare+revenueShare (4 places), impressions+clicks (2 places), and campaignCount+channelCount (2 places, one inline). Extracting these into named building blocks lets the domain types compose via intersection rather than re-declaring the same fields. The existing `CampainSummaryTotals` was already reused correctly and didn't need changes. The two Response types and BusinessContext were already clean. Renamed `ExecutiveSummaryPortfolio` to the more generic `PortfolioCount` since both Data types use the same shape. Verified no external imports of `ExecutiveSummaryPortfolio` existed before renaming.

**Prompt:** Focus on types in ai tools. Read carefully the file and extend reusable models.

**What changed:**
- `features/ai-tools/types/index.ts` — extracted `AllocationShare` (budgetShare + revenueShare), `FunnelMetrics` (impressions + clicks), `PortfolioCount` (campaignCount + channelCount); composed `ExecutiveSummaryChannel`, `ExecutiveSummaryOtherChannelsSummary`, `BudgetOptimizerCampaign`, `BudgetOptimizerChannel`, and both Data types via intersection with these building blocks; added section comments for clarity

**Key decisions & why:**
- Three building blocks, not more — only extracted patterns that appeared in 2+ types; single-field patterns like `channel: string` were left inline to avoid over-abstraction
- Renamed `ExecutiveSummaryPortfolio` → `PortfolioCount` — the shape is generic (not executive-summary-specific) and both Data types use it; the old name was never imported externally
- Intersection composition (`&`) over interface extension — keeps each building block as a simple type alias that composes naturally with `&`, consistent with the existing pattern in the file


## [#51] Extract ConfidenceLevel type alias
**Type:** refactor

**Summary:** Extracted `ConfidenceLevel = "High" | "Medium" | "Low"` as a shared type alias, replacing three inline string literal unions across the AI response types.

**Brainstorming:** Audited all string literal unions in both Response types. Only the High/Medium/Low pattern was genuinely reused: `recommendations[].confidence` (capitalized), `quick_wins[].effort` (subset — Low | Medium), and `BudgetOptimizerCampaign.spendTier` (lowercase). The two timeline unions look similar but differ ("This Month" vs "This Quarter"), so they stay inline. Used `Lowercase<ConfidenceLevel>` for spendTier and `Exclude<ConfidenceLevel, "High">` for effort to derive from the single source of truth.

**Prompt:** "High" | "Medium" | "Low" is repeated with small case types can we extract one type?

**What changed:**
- `features/ai-tools/types/index.ts` — added `ConfidenceLevel` type alias; `recommendations[].confidence` uses `ConfidenceLevel`, `quick_wins[].effort` uses `Exclude<ConfidenceLevel, "High">`, `BudgetOptimizerCampaign.spendTier` uses `Lowercase<ConfidenceLevel>`

**Key decisions & why:**
- Single extraction, not multiple — only the High/Medium/Low pattern was truly duplicated; other unions are unique or differ in values
- `Lowercase<ConfidenceLevel>` for spendTier — derives from the same source instead of maintaining a separate lowercase union, keeping the two in sync
- `Exclude<ConfidenceLevel, "High">` for effort — expresses the subset relationship explicitly; if ConfidenceLevel gains a value, effort stays intentionally constrained


## [#52] Prompt builders — bug fixes, typo corrections, and architecture cleanup
**Type:** refactor

**Summary:** Fixed bugs in prompt output (stray quote, trailing braces, missing letter), corrected naming typos across all prompt files, extracted a shared scope builder into prompt-utils, and replaced indented template literals with clean section-array assembly.

**Brainstorming:** A thorough review of the prompts folder revealed three categories of issues: (1) Bugs — a literal `'` leaked into the ANALYSIS INSTRUCTIONS header from `getAnalysisInstructions`, both `buildExecutiveSummaryPrompt` and `buildBudgetOptimizerPrompt` had an extra `}` from `getPromptList(...).join("\n")}}`where the template expression's closing brace was followed by a stray brace, and 'pportunities' was missing its leading 'o'. (2) Naming — `PromptIntructions` (missing 's'), `SUMMMARY_INSTRUCTIONS` (triple M), `getBExecutiveSummaryScopeByFilteredChannels` (stray B prefix), `busonessContext` (misspelled), and a double space in an interpretation rule string. (3) Architecture — the two scope functions were structurally identical (header + filtered/unfiltered branching + channel list + constraints), differing only in labels and wording. Extracted a `PromptScopeConfig` type and a shared `getScopeBlock` function parameterized by config. Both builders now declare a static config constant instead of a private function. Additionally, the template literal approach (`\`  ${block}\``) was injecting leading whitespace into every line of the prompt. Replaced with a sections array joined by `"\n\n"`, which produces clean output with no accidental indentation. Also fixed `let` → `const` in `getBusinessContextLinesForPrompt` by switching from spread reassignment to `push(...)`.

**Prompt:** Read everything in prompts folder in ai-tools. Check for code improvements and better architecture. These are the functions that will generate our prompts.

**What changed:**
- `features/ai-tools/types/index.ts` — renamed `PromptIntructions` → `PromptInstructions`; added `PromptScopeConfig` type (label, filteredDescription, unfilteredDescription, filteredConstraints)
- `features/ai-tools/prompts/prompt-utils.ts` — fixed stray quote in `getAnalysisInstructions`; removed unused `PromptList` import; added `getScopeBlock(config, channels)` shared scope builder; fixed double space in interpretation rules
- `features/ai-tools/prompts/executive-summary-prompt.ts` — renamed `SUMMMARY_INSTRUCTIONS` → `SUMMARY_INSTRUCTIONS`; renamed `getBExecutiveSummaryScopeByFilteredChannels` → replaced with `SUMMARY_SCOPE_CONFIG` + `getScopeBlock`; fixed trailing `}` in health score list; replaced template literal with sections array join; updated all imports
- `features/ai-tools/prompts/budget-optimizer-prompt.ts` — fixed 'pportunities' typo; renamed `busonessContext` → `businessContext`; replaced `getBudgetOptimizerScopeByFilteredChannels` with `OPTIMIZER_SCOPE_CONFIG` + `getScopeBlock`; fixed trailing `}` in array size list; folded loose "if fewer items" lines into the array size list; replaced template literal with sections array join; updated all imports
- `features/ai-tools/prompts/business-context.ts` — changed `let lines` → `const lines` with `push(...)` instead of spread reassignment

**Key decisions & why:**
- `PromptScopeConfig` as a type — makes the scope builder's contract explicit; each prompt declares its config as a static constant, which is easier to read and review than a function body
- Sections array instead of template literal — eliminates accidental indentation that was baked into every prompt line; `sections.join("\n\n")` gives consistent double-newline separation with zero leading whitespace
- Shared `getScopeBlock` with config object — the two scope functions had identical structure with different strings; parameterizing by config eliminates the duplication while keeping each prompt's wording independently configurable
- Folded loose lines into `ARRAY_SIZE_LIST` spread — the "if fewer items" / "do not fabricate" lines were free-floating strings in the template; moving them into the list array keeps them formatted consistently with the other items


## [#53] Prompt files — formatting cleanup, array-size notes separation, rename build → generate
**Type:** refactor

**Summary:** Cleaned up formatting and whitespace across all prompt files, separated array-size notes from the list items in the budget optimizer prompt, and renamed `build*Prompt` → `generate*Prompt` for both prompt builders.

**Brainstorming:** Three issues addressed: (1) Inconsistent formatting — mixed indentation (2-space vs 4-space), trailing whitespace, extra blank lines, missing trailing commas on array items, inconsistent semicolons. All four prompt files were rewritten with consistent 2-space indentation, trailing commas, and clean spacing. (2) In `buildBudgetOptimizerPrompt`, the three lines about array-size behaviour ("If fewer items exist…", "These are upper limits…", "Do not fabricate…") were merged into the `ARRAY_SIZE_LIST` as bullet items in the previous refactor, but they're actually notes *about* the list, not list items themselves. Extracted them into a separate `ARRAY_SIZE_NOTES` constant and assembled the block with the list followed by a blank line then the notes — preserving the semantic distinction. (3) The `build*Prompt` naming was discussed — `generate` better describes what these functions do (they generate a prompt string for AI consumption), while `build` is appropriate for the data builders in `utils/` which construct structured data from raw rows. Renaming keeps the two concerns distinct. The folder stays as `prompts/` — it's concise and clear. Moving into `utils/` would blur the separation between data transformation and prompt assembly.

**Prompt:** Fix structure of files (spaces etc) in prompt files. In buildBudgetOptimizerPrompt you unified arraySizeItems but the array size list is part of a list and the 3 lines you added are notes — do not merge the lists. Also rename build → generate for prompt functions.

**What changed:**
- `features/ai-tools/prompts/prompt-utils.ts` — reformatted: consistent 2-space indentation, removed extra blank lines, added missing semicolons
- `features/ai-tools/prompts/business-context.ts` — reformatted: removed leading blank line, consistent semicolons and trailing commas
- `features/ai-tools/prompts/executive-summary-prompt.ts` — reformatted: multi-line imports, consistent trailing commas on all array items; renamed `buildExecutiveSummaryPrompt` → `generateExecutiveSummaryPrompt`
- `features/ai-tools/prompts/budget-optimizer-prompt.ts` — reformatted: multi-line imports, consistent trailing commas; separated `ARRAY_SIZE_NOTES` from `ARRAY_SIZE_LIST`; assembled block with list then blank line then notes; renamed `buildBudgetOptimizerPrompt` → `generateBudgetOptimizerPrompt`
- `features/ai-tools/prompts/index.ts` — updated barrel exports to use `generate*` names

**Key decisions & why:**
- `ARRAY_SIZE_NOTES` as a separate constant — the three lines are behavioural notes about the list, not list items; merging them would cause the AI to see "If fewer items exist" as an array-size guideline bullet, which misrepresents the intent
- `build` → `generate` only for prompt functions — data builders (`buildExecutiveSummaryData`, `buildBudgetOptimizerData`) keep `build` since they construct structured payloads; prompt functions `generate` a string for AI consumption; the naming distinction mirrors the responsibility split
- Keep `prompts/` folder name and location — `prompts/` is concise and clear; `prompt-generations/` is verbose; moving into `utils/` would blur the data-transformation vs prompt-assembly boundary


## [#16] Budget Optimizer — mock responses and full UI
**Type:** feature

**Summary:** Created 5 mock BudgetOptimizerResponse objects and built the full result UI for the Budget Optimizer panel, replacing the hardcoded demo stub with structured rendering of all response sections.

**Brainstorming:** The BudgetOptimizerResponse type has 7 distinct sections (executive_summary, recommendations, top_performers, underperformers, quick_wins, correlations, risks). Options considered: (1) extract each section into its own component — rejected because the sections are tightly coupled to this panel and not reused elsewhere; (2) render everything inside AiOptimizerPanel.vue — chosen for simplicity and consistency with the existing pattern; (3) create a generic "result renderer" — rejected as premature abstraction. For mock data, 5 scenarios were designed to cover different optimization strategies: aggressive reallocation, conservative tweaks, seasonal pivot, channel consolidation, and growth expansion. This variety ensures the UI handles diverse data shapes (different array lengths, different badge types, optional fields).

**Prompt:** Based on the BudgetOptimizerResponse create 5 mock responses. Place mock data in a folder mocks in ai-tools. When clicking on analyze iterate through the 5 responses and show one each time. The plan is to identify and create all the components required for the UI.

**What was built:**
- `features/ai-tools/mocks/budget-optimizer-mocks.ts` — 5 BudgetOptimizerResponse mock objects covering aggressive reallocation, conservative optimization, seasonal pivot, channel consolidation, and growth expansion scenarios
- `features/ai-tools/mocks/index.ts` — barrel export for the mocks folder
- `features/ai-tools/components/AiOptimizerPanel.vue` — complete rewrite: replaced hardcoded demo table with full structured rendering of all 7 BudgetOptimizerResponse sections; added mock cycling logic (mockIndex increments mod 5 on each Analyze click); button label changes to "Re-Analyze" after first result; new CSS for recommendation cards, performer cards, quick-win cards, correlation cards, risk cards, action badges (Reduce/Pause/Restructure), and effort badges (Low/Medium)

**Key decisions & why:**
- All rendering stays in AiOptimizerPanel.vue — sections are specific to this panel and not reused; extracting 7 sub-components would add indirection without value at this stage
- Mock index starts at -1 and increments before use — ensures first click shows index 0 (the first mock) rather than skipping it
- 5 diverse scenarios — covers different array lengths, confidence levels, action types, and optional fields to stress-test the UI layout
- Button changes to "Re-Analyze" after first result — communicates to the user that they can cycle to a new analysis without confusion about repeated clicks
- Reused existing CSS class patterns (ai-result-block, ai-confidence) and extended with new card types (ai-recommendation, ai-performer, ai-quick-win, ai-correlation, ai-risk) and generic ai-badge for action/effort labels


## [#17] Executive Summary — mock responses and full UI
**Type:** feature

**Summary:** Created 5 mock ExecutiveSummaryResponse objects and built the full result UI for the Executive Summary panel, replacing the demo stub with structured rendering of all response sections.

**Brainstorming:** The ExecutiveSummaryResponse type has 8 distinct sections (health_score, bottom_line, key_metrics, insights, priority_actions, channel_summary, correlations, additional_channels_note). Design decisions: (1) health score rendered as a large color-coded badge with score/100 — this is the hero element that sets the tone for the entire summary; (2) key metrics in a 2-column grid with special full-width treatment for "biggest opportunity" — provides scannable data density; (3) insight cards color-coded by type (performance/opportunity/warning/achievement) with inline metric highlight bar — each insight is self-contained with its supporting data point; (4) priority actions numbered with urgency badges (Immediate/This Quarter/Next Quarter) — conveys both order and time pressure; (5) channel summary with status dots (strong/moderate/weak) + budget share — quick portfolio overview. For mock data, 5 scenarios covering the full health_score spectrum: strong (82/Good), needs attention (48), excellent (91), critical (25), and growth phase (73/Good). Each has different insight types, action counts, and channel distributions to stress-test the layout.

**Prompt:** Do the same and complete summary UI based on ExecutiveSummaryResponse. Create 5 mock responses, place in mocks folder, cycle through on Summarize click.

**What was built:**
- `features/ai-tools/mocks/executive-summary-mocks.ts` — 5 ExecutiveSummaryResponse mock objects: strong portfolio (82/Good), needs attention (48), excellent performance (91), critical state (25), growth phase (73/Good)
- `features/ai-tools/mocks/index.ts` — added executive summary mocks barrel export
- `features/ai-tools/components/AiSummaryPanel.vue` — complete rewrite: replaced demo stub with full structured rendering of all ExecutiveSummaryResponse sections; mock cycling logic (mockIndex mod 5); button changes to "Re-Summarize" after first result; new CSS for health score badge, key metrics grid, insight cards (4 type-based color themes), priority action cards (numbered with urgency badge), channel cards (status badge), correlation cards

**Key decisions & why:**
- Health score as a hero badge with score/100 — immediately communicates portfolio state at a glance; color-coding (green/indigo/amber/red) maps to the 4 label tiers and provides instant visual assessment
- Key metrics in a 2-column grid — maximizes information density in the narrow drawer width; "biggest opportunity" spans full width because it's typically a longer text value
- Insight cards typed by color (performance=indigo, opportunity=green, warning=amber, achievement=purple) — helps users scan for what matters most to them; the inline metric highlight bar makes each insight self-contained
- 5 mocks covering the full health score spectrum (25-91) — ensures the UI handles all 4 health labels (Excellent/Good/Needs Attention/Critical) and varying array lengths
- Correlations use `so_what` field (not `implication` like Budget Optimizer) — matches the ExecutiveSummaryResponse type definition which uses different field names than BudgetOptimizerResponse


## [#18] Rename Grok to Groq, rename test helpers to connect helpers, radio buttons for providers
**Type:** update

**Summary:** Renamed all Grok references to Groq across the codebase, renamed testGemini/testGrok to connectGemini/connectGroq, updated Groq API endpoint, and replaced the provider dropdown with radio buttons.

**Brainstorming:** Three changes bundled together as they all touch the AI connection layer: (1) Grok → Groq is a naming correction — Groq is the cloud inference platform, distinct from xAI's Grok LLM; (2) test → connect renaming better describes the function's purpose — it's not a test utility, it's the actual connection handshake; (3) radio buttons vs dropdown — with only 2 providers, radio buttons show all options at a glance without requiring a click to reveal them, reducing interaction cost and making the choice more discoverable.

**Prompt:** Update everything and all docs from grok to Groq. testGemini and testGroq rename to connectGemini and connectGroq. connectGroq should connect to https://api.groq.com/openai/v1/models. Change dropdown to radio buttons for providers since we only allow 2 integrations at the moment.

**What changed:**
- `stores/aiStore.ts` — `AiProvider` type `'grok'` → `'groq'`; `PROVIDER_LABELS.grok` → `PROVIDER_LABELS.groq` with label `'Groq'`; `testGemini` → `connectGemini`; `testGrok` → `connectGroq`; API endpoint changed from `https://api.x.ai/v1/models` to `https://api.groq.com/openai/v1/models`; `connect()` calls updated to use new function names
- `features/ai-tools/components/AiConnectionForm.vue` — replaced `<select>` dropdown with `<fieldset>` containing two styled radio buttons; `value="grok"` → `value="groq"`; removed select CSS (appearance, background-image chevron, option styles); added radio button CSS (ai-conn__radios, ai-conn__radio, ai-conn__radio-input with custom dot, ai-conn__radio--active highlight)
- `CLAUDE.md` — updated tech stack, status, architecture descriptions, and feature checklist to reflect Groq naming, radio buttons, and connectGemini/connectGroq helpers
- `README.md` — updated all Grok → Groq references across AI Budget Optimizer, Executive Summary, and Tech Stack sections

**Key decisions & why:**
- Radio buttons with active highlight state — the `ai-conn__radio--active` class adds an indigo border and subtle background tint to the selected option, providing clear visual feedback without a separate indicator element
- Custom radio input styling — native radio appearance is hidden; a custom circle with indigo dot on `:checked` matches the dark theme design system
- `<fieldset>` + `<legend>` instead of `<div>` + `<label>` — semantically correct for a group of radio buttons; improves accessibility by associating the "Provider" label with the entire radio group


## [#19] Granular error handling for AI connection and panels
**Type:** feature

**Summary:** Added comprehensive error handling for AI connection with 6 error codes, contextual user-facing hints per error type, 10s connection timeout, and error state in both Optimizer and Summary panels.

**Brainstorming:** Identified 6 distinct error cases: (1) invalid API key (400/401/403) — user action needed: check/re-copy key; (2) network offline or DNS failure (TypeError from fetch) — user action: check internet; (3) request timeout (AbortError after 10s) — user action: check network, try again; (4) rate limited (429) — user action: wait and retry; (5) server error (5xx) — provider's fault, not user's; (6) unknown/unexpected — generic fallback. Each case gets a specific error code, a clear primary message, and a secondary hint explaining what the user can do. The connect button re-enables after error so user can immediately try again — no separate retry button needed. Both AI panels also get an error state for when real API calls are wired up later.

**Prompt:** Add proper error handling for AI connection. Identify all cases where connection is lost, key is invalid, or something has gone wrong. Implement proper user feedback for each case. No retry button — re-enable connect button. All messages above the connect button.

**What was built:**
- `stores/aiStore.ts` — added `AiConnectionErrorCode` type (6 codes: invalid-key, network, timeout, rate-limit, server-error, unknown); `AiConnectionError` type (code + message); `ConnectionError` class extending Error with code; `handleHttpError` helper mapping HTTP status to specific codes with provider-aware messages; `fetchWithTimeout` wrapper with 10s AbortController timeout; `toConnectionError` converting any caught error to structured `AiConnectionError`; `connectionError` ref changed from `string | null` to `AiConnectionError | null`
- `features/ai-tools/components/AiConnectionForm.vue` — added `ERROR_HINTS` map with contextual hint per error code; error display changed from single `<p>` to `<div>` with primary message + secondary hint; added `ai-conn__error-message` (red, 500 weight) and `ai-conn__error-hint` (slate, normal) CSS
- `features/ai-tools/components/AiOptimizerPanel.vue` — added `'error'` to Status type; `errorMessage` ref; error block in template between loading and result; button shows "Re-Analyze" on error; error CSS (red tinted background, centered message + hint)
- `features/ai-tools/components/AiSummaryPanel.vue` — same error state additions as Optimizer; hint says "Click Re-Summarize to try again"

**Key decisions & why:**
- 6 error codes rather than just message strings — allows the UI to show different hints per error type; also enables future logic (e.g., auto-disconnect on invalid key, skip retry on auth errors)
- `fetchWithTimeout` using AbortController — fetch has no built-in timeout, so without this the spinner would hang forever on network issues; 10s is generous enough for slow connections but catches truly dead requests
- `ConnectionError` class extending Error — allows typed error propagation through the try/catch chain; `toConnectionError` then converts any error (ConnectionError, DOMException, TypeError, or unknown) to a structured object
- Error messages include provider name (e.g., "Invalid API key for Google Gemini") — when both providers are available, users need to know which one failed
- Panels show error state with hint pointing to the button — no separate retry button, just re-enable the action button; keeps UI clean and consistent with the existing idle/loading/done flow


## [#20] Extract AI connection logic into ai-tools feature module
**Type:** refactor

**Summary:** Moved all AI connection types, constants, and helper functions out of aiStore.ts into the ai-tools feature module, separating data (error codes) from presentation (user-facing messages).

**Brainstorming:** The aiStore had grown to include HTTP logic, error mapping, timeout handling, and user-facing message strings — none of which belong in a Pinia store. Three changes: (1) move types (AiProvider, AiConnectionErrorCode, AiConnectionError) and PROVIDER_LABELS to ai-tools/types where all other AI feature types live; (2) extract connection logic (fetchWithTimeout, connectGemini, connectGroq, error code mapping) into a new ai-tools/ai-connection module with a single entry point `connectProvider(provider, key) → AiConnectionError | null`; (3) change AiConnectionError from `{ code, message }` to `{ code, provider }` — the helpers return structured data, and the UI component (AiConnectionForm) is the only place that constructs user-facing strings. This separates concerns: the connection module handles HTTP, the store manages state, and the UI owns the words.

**Prompt:** Improve architecture. Move helper functions to ai-tools feature in an ai-connection folder. Move types to the ai-tools types folder. Error handling in helper functions should return proper properties for the UI and the UI component should handle the message for displaying to the user.

**What changed:**
- `features/ai-tools/types/index.ts` — added AiProvider, PROVIDER_LABELS, AiConnectionErrorCode, AiConnectionError (now `{ code, provider }` with no message string)
- `features/ai-tools/ai-connection/connectProvider.ts` — new file: fetchWithTimeout (10s AbortController), errorCodeFromStatus (HTTP status → error code), errorCodeFromException (JS error → error code), connectGemini, connectGroq, and `connectProvider` entry point returning `AiConnectionError | null`
- `features/ai-tools/ai-connection/index.ts` — barrel export
- `stores/aiStore.ts` — slimmed to pure store logic: imports types from ai-tools/types and connectProvider from ai-tools/ai-connection; no HTTP code, no error message strings, no timeout logic
- `features/ai-tools/components/AiConnectionForm.vue` — now owns all user-facing strings: ERROR_MESSAGES map (code + provider → message via function) and ERROR_HINTS map (code → hint); imports types from ai-tools/types instead of aiStore
- `features/ai-tools/components/AiConnectedStatus.vue` — imports PROVIDER_LABELS from ai-tools/types instead of aiStore

**Key decisions & why:**
- `AiConnectionError = { code, provider }` without message — separates data from presentation; the connection module doesn't know or care what the user sees; the UI component decides how to phrase each error
- `connectProvider` returns `null` on success, `AiConnectionError` on failure (no throw) — the store just checks the result without try/catch, making the control flow cleaner and removing the need for the `ConnectionError` class and `toConnectionError` converter
- `errorCodeFromStatus` and `errorCodeFromException` as pure mapping functions — simple input→output with no side effects; easy to reason about and test
- ERROR_MESSAGES as functions `(provider) => string` — allows provider-aware messages ("Invalid API key for Google Gemini") without the connection module needing to know about display labels
- PROVIDER_LABELS lives in ai-tools/types alongside AiProvider — they're tightly coupled (the label map uses AiProvider as its key type), and both are consumed by UI components within the ai-tools feature


## [#21] Return provider models from connection and add model types
**Type:** feature

**Summary:** connectProvider now parses and returns the models array from both Gemini and Groq API responses on successful connection, with typed model interfaces for each provider.

**Brainstorming:** Both Gemini and Groq list-models endpoints return useful model metadata alongside verifying the API key. Instead of discarding the response body, we can parse it and return the models array for later use (e.g., model selection dropdown). The two providers have different response shapes: Gemini wraps models in `{ models: [...] }`, Groq uses OpenAI-compatible `{ object, data: [...] }`. Each gets its own response and model type. The return type of `connectProvider` changes from `AiConnectionError | null` to `GeminiModel[] | GroqModel[] | AiConnectionError` — the store uses a type guard (`'code' in result`) to distinguish error from success.

**Prompt:** connectGemini should return the models array. Create types for the response and models and return the models array. Do the same for Groq. connectProvider returns GeminiModel[] | GroqModel[] | AiConnectionError.

**What changed:**
- `features/ai-tools/types/index.ts` — added GeminiModel (name, version, displayName, description, inputTokenLimit, outputTokenLimit, supportedGenerationMethods, temperature, topP, topK, maxTemperature, thinking), GeminiModelsResponse, GroqModel (id, object, created, owned_by, active, context_window, public_apps, max_completion_tokens), GroqModelsResponse
- `features/ai-tools/ai-connection/connectProvider.ts` — connectGemini now parses response JSON and returns `GeminiModel[] | AiConnectionErrorCode`; connectGroq returns `GroqModel[] | AiConnectionErrorCode`; connectProvider return type changed to `GeminiModel[] | GroqModel[] | AiConnectionError`; error code (string) vs models array distinguished by `typeof result === 'string'`
- `stores/aiStore.ts` — added `models` ref (`GeminiModel[] | GroqModel[]`); `isConnectionError` type guard using `'code' in result`; connect() stores models on success; disconnect() clears models to empty array

**Key decisions & why:**
- Separate types per provider (GeminiModel vs GroqModel) — the APIs return different shapes with different field names; a union type preserves the full information from each provider without lossy normalization
- `typeof result === 'string'` inside connectGemini/connectGroq to distinguish error code from models array — clean and zero-overhead; error codes are always strings, model arrays are always objects
- `isConnectionError` type guard in the store using `'code' in result` — cleanly narrows the union at the store boundary; the store doesn't need to know about individual model types
- Models cleared on disconnect — prevents stale model data from a previous provider persisting after switching


## [#22] AI model selection during connection + split provider files
**Type:** feature

**Summary:** Connection now fetches provider models, filters them, sends an AI model selection prompt using a default model, and stores the ranked AiModel[] with auto-selected best model. Provider logic split into separate gemini.ts and groq.ts files with shared utilities.

**Brainstorming:** The connection flow needed to go beyond just verifying the API key — it should also determine the best model to use for subsequent prompts. The approach: (1) fetch all models from the provider API; (2) filter out non-text models (embeddings, image, audio, etc.); (3) send the filtered list to the AI itself using a default/fallback model and the existing `generateModelSelectionPrompt`; (4) parse the AI's structured JSON response into `AiModel[]`; (5) store the ranked list and auto-select the highest `strength_score`. New error case: `no-models` if the filter or AI selection returns nothing. The ai-connection folder was also growing — splitting into `gemini.ts`, `groq.ts`, and `shared.ts` keeps each provider's HTTP logic self-contained and the shared utilities (fetchWithTimeout, error code mapping, JSON parsing) reusable. The `connectProvider.ts` becomes a thin orchestrator.

**Prompt:** Use filterGeminiModels and filterGroqModels to filter models on response. Use generateModelSelectionPrompt to get optimal models from AI. Connection should end when we get a response from the model selection prompt. If the list is empty throw a new error. Save in the store the models returned AND set as selected model the one with highest strength score. Use OUTPUT_SCHEMA to create the type for the final list. Split provider files per integration.

**What was built:**
- `features/ai-tools/types/index.ts` — added AiModel type (id, model, display_name, provider, strength, strength_score, reason), ModelSelectionResponse type, added 'no-models' to AiConnectionErrorCode
- `features/ai-tools/ai-connection/shared.ts` — new file: extracted fetchWithTimeout, errorCodeFromStatus, errorCodeFromException + new parseJsonResponse (strips markdown fences before JSON.parse)
- `features/ai-tools/ai-connection/gemini.ts` — new file: filterGeminiModels, getDefaultGeminiModel (gemini-2.0-flash), connectGemini (list + filter), callGemini (POST to generateContent endpoint)
- `features/ai-tools/ai-connection/groq.ts` — new file: filterGroqModels, getDefaultGroqModel (llama-3.3-70b-versatile), connectGroq (list + filter), callGroq (POST to chat/completions endpoint)
- `features/ai-tools/ai-connection/connectProvider.ts` — rewritten as orchestrator: getDefaultModel, callAi (provider dispatcher), selectModels (generates prompt → calls AI → parses ModelSelectionResponse), connectProvider (fetch → filter → select → return AiModel[] or error)
- `features/ai-tools/ai-connection/index.ts` — updated barrel exports
- `stores/aiStore.ts` — models ref changed to AiModel[]; added selectedModel ref (AiModel | null); selectBestModel helper picks highest strength_score; connect() stores both; disconnect() clears both
- `features/ai-tools/components/AiConnectionForm.vue` — added 'no-models' to ERROR_MESSAGES and ERROR_HINTS maps

**Key decisions & why:**
- Default models (gemini-2.0-flash / llama-3.3-70b-versatile) for the initial selection prompt — we need a model to ask "which model is best" before we know the answer; these are reliable mid-tier models available on both free tiers
- `getDefaultGeminiModel` / `getDefaultGroqModel` as exported functions — centralizes the default model choice per provider; easy to update in one place if defaults change
- `parseJsonResponse` strips markdown fences — AI models often wrap JSON in ```json blocks even when told not to; this handles that gracefully
- `selectBestModel` using reduce on strength_score — simple, deterministic selection; the AI already ranked them so the highest score is always the first choice
- Split into gemini.ts / groq.ts / shared.ts — each provider file owns its API specifics (endpoints, auth headers, request/response shapes, model filtering); shared.ts owns transport-level utilities; connectProvider.ts is a thin orchestrator that doesn't know HTTP details
- `no-models` error code — covers both "provider returned no compatible models" and "AI selection returned empty" cases; UI explains to try a different provider


## [#23] Dynamic optimal model selection — remove hardcoded defaults
**Type:** update

**Summary:** Replaced hardcoded DEFAULT_MODEL constants with dynamic `getOptimalModel` functions that pick the best model from the actual filtered models list returned by each provider's API.

**Brainstorming:** The hardcoded defaults (gemini-2.0-flash, llama-3.3-70b-versatile) would go stale as providers add new models. Since we already have the filtered models list from the list-models API call, we can pick the best one programmatically. For Gemini: prefer "flash" models (cheaper/faster for a meta-prompt) then sort by version descending (latest first). For Groq: sort by `created` timestamp descending (most recently added). Both return the model identifier from the actual list, so the initial model selection prompt always uses a model the provider actually supports right now.

**Prompt:** Is there a way to get the best model for the initial call without DEFAULT_MODEL hardcoded? What about calling the one with the latest version?

**What changed:**
- `features/ai-tools/ai-connection/gemini.ts` — removed DEFAULT_MODEL constant and getDefaultGeminiModel; added getOptimalGeminiModel(models) which sorts filtered list by flash-preference then version descending, strips "models/" prefix; callGemini model param now required (no fallback)
- `features/ai-tools/ai-connection/groq.ts` — removed DEFAULT_MODEL constant and getDefaultGroqModel; added getOptimalGroqModel(models) which sorts by created timestamp descending; callGroq model param now required
- `features/ai-tools/ai-connection/connectProvider.ts` — getDefaultModel replaced with getOptimalModel(provider, models) that passes the filtered list to the provider-specific function; selectModels now receives the typed filtered models and calls getOptimalModel to pick the initial model

**Key decisions & why:**
- Flash-first for Gemini — flash models are faster and cheaper, ideal for a meta-prompt that just selects models; version sort as tiebreaker ensures we get the latest flash variant
- Created-timestamp for Groq — Groq doesn't have a "flash" concept; most recently created model is the best proxy for "latest and most capable"
- Model param now required on callGemini/callGroq — removes the hidden coupling to a default; every call site must explicitly choose which model to use


## [#24] Refactor connectProvider — full flow inside each provider
**Type:** refactor

**Summary:** Moved the complete connection flow (fetch → filter → select models) into connectGemini and connectGroq, making connectProvider a thin try/catch wrapper with no branching logic.

**Brainstorming:** connectProvider had if/else checks for provider at every step: fetching models, getting the optimal model, calling the AI. By pushing the entire flow into each provider's connect function, each provider owns its full lifecycle and connectProvider becomes a simple dispatcher. The provider functions now return `AiModel[]` on success or throw `ConnectionError` on failure — connectProvider catches and converts to `AiConnectionError`. This also means callGemini, callGroq, filterModels, getOptimalModel are no longer exported — they're internal implementation details of each provider module.

**Prompt:** Refactor connectProvider. connectGemini should return the 3 final models or throw an error. Similar for connectGroq. That way we avoid if/else checks for the subsequent functionality and we do not need to export those functions.

**What changed:**
- `features/ai-tools/ai-connection/gemini.ts` — connectGemini now handles the full flow: fetchModels → filterModels → getOptimalModel → callGemini → parseJsonResponse → return AiModel[]; throws ConnectionError (with error code) on failure; callGemini, filterModels, getOptimalModel are now internal (not exported)
- `features/ai-tools/ai-connection/groq.ts` — same pattern: connectGroq owns the full flow; throws ConnectionError; internal helpers not exported
- `features/ai-tools/ai-connection/connectProvider.ts` — reduced to a thin wrapper: delegates to connectGemini/connectGroq, catches ConnectionError → AiConnectionError; no more getOptimalModel, callAi, selectModels helpers
- `features/ai-tools/ai-connection/index.ts` — barrel now only exports connectProvider

**Key decisions & why:**
- ConnectionError class in each provider file — each provider throws typed errors with AiConnectionErrorCode; connectProvider catches them uniformly without knowing provider internals
- Provider functions return AiModel[] directly (no error codes in return type) — cleaner API: success = return, failure = throw; connectProvider does the conversion to the store-friendly AiConnectionError
- callGemini/callGroq no longer exported — they're implementation details; if future features need to call the AI directly, they should go through a higher-level API that manages model selection and error handling


## [#25] Remove ConnectionError class — use plain Error with error code as message
**Type:** fix

**Summary:** Replaced custom ConnectionError class with plain Error throws, using the error code string as the message. connectProvider checks error messages against known codes.

**Brainstorming:** The ConnectionError class was duplicated in both provider files and added unnecessary complexity. Since the error codes are unique strings, we can throw `new Error('invalid-key')` and check `e.message` against a known set in connectProvider. This removes the custom class entirely while preserving the same error code mapping.

**Prompt:** Can we avoid ConnectionError and throw normal error?

**What changed:**
- `features/ai-tools/ai-connection/gemini.ts` — removed ConnectionError class and its export; all throws now use `new Error(errorCode)` directly
- `features/ai-tools/ai-connection/groq.ts` — same: removed ConnectionError class, use plain Error throws
- `features/ai-tools/ai-connection/connectProvider.ts` — removed ConnectionError imports; added ERROR_CODES Set of all known AiConnectionErrorCode values; catch block checks if `e.message` is a known code (use directly) or falls back to `errorCodeFromException(e)` for network/timeout/unknown errors

**Key decisions & why:**
- Error message = error code — simple convention: provider functions throw `new Error('invalid-key')` or `new Error('no-models')`; no custom class needed since the message itself carries the structured information
- ERROR_CODES Set for validation — ensures only legitimate error codes pass through; any other Error message (like "Gemini API error (500)") falls through to errorCodeFromException which classifies it as 'unknown'


## [#26] AI Analysis Flow — Budget Optimizer + Executive Summary
**Type:** feature

**Summary:** Replaced mock response cycling with real Gemini/Groq API calls for both AI tabs, adding a full analysis flow with debouncing, caching, cancellation, cooldown, panel/tab lifecycle, and token-limit protection.

**Brainstorming:** The spec required 15 behavioral rules covering first-manual-trigger, automatic label-change calls, response caching, data caching, request cancellation, cooldown, CSV reset, panel close/reopen, tab switching, error fallback, and token-limit detection. Key architecture decision: one shared Pinia store (`aiAnalysisStore`) with per-tab state stored in plain objects and synced to Vue refs for reactivity. A config-map approach keeps both tabs DRY — the only differences are which data builder and prompt generator to call. The `callProviderForAnalysis` function lives in a new `ai-analysis/` module separate from `ai-connection/` because analysis calls need external AbortSignal support and a longer timeout (60s vs 10s). Panel open/close state (`aiPanelOpen`) was moved to `aiStore` since it's cross-cutting. Tab switching was given the same evaluation logic as panel reopen. Labels use `"all"` as the cache key when no filters are active to avoid empty-string edge cases. Data caching (buildBudgetOptimizerData/buildExecutiveSummaryData) was added to avoid redundant computation when re-analyzing the same label combination.

**Prompt:** Implement the Budget Optimizer AI flow with debounce, cancellation, caching, cooldown, panel reopen handling, CSV reset, token-limit protection, and the same flow for Executive Summary. Cache built data per label combination. Tab switching = panel reopen evaluation.

**What was built:**
- `features/ai-tools/ai-analysis/callProvider.ts` — `callProviderForAnalysis<T>()` with AbortSignal support, 60s timeout, token/quota limit detection (429, RESOURCE_EXHAUSTED, rate_limit patterns), Gemini + Groq call paths
- `features/ai-tools/ai-analysis/index.ts` — barrel export
- `stores/aiAnalysisStore.ts` — shared Pinia store for both tabs; per-tab state (firstAnalyzeCompleted, status, response, error, cache, cacheTimestamps, dataCache, cooldowns, lastVisibleCacheKey, errorFallbackMessage); shared state (activeTab, tokenLimitReached); watchers for label changes (debounced) and CSV upload (reset); actions: analyze, setActiveTab, onPanelOpen, onPanelClose, clearStateForNewCSV, clearStateForDisconnect
- `features/ai-tools/types/index.ts` — added AiAnalysisTab, AiAnalysisStatus, AiAnalysisErrorCode, AiAnalysisError types
- `stores/aiStore.ts` — added aiPanelOpen ref + openPanel() / closePanel() actions
- `shell/AppShell.vue` — replaced local isAiOpen with aiStore.aiPanelOpen; wired panel open/close to analysisStore.onPanelOpen/onPanelClose
- `features/ai-tools/components/AiToolsContent.vue` — uses analysisStore.activeTab for tab routing and setActiveTab for tab switching
- `features/ai-tools/components/AiOptimizerPanel.vue` — replaced mock cycling with analysisStore; added cached indicator (timestamp), error fallback message, token-limit notice, cooldown-disabled button
- `features/ai-tools/components/AiSummaryPanel.vue` — same treatment as optimizer panel
- `features/ai-tools/components/AiConnectedStatus.vue` — disconnect now calls analysisStore.clearStateForDisconnect() before aiStore.disconnect()
- `features/ai-tools/components/AiTabs.vue` — uses AiAnalysisTab type from types instead of local export

**Key decisions & why:**
- Single store with per-tab state objects — avoids duplicate store logic while keeping each tab's state independent; plain objects synced to refs because Maps and nested objects don't trigger Vue reactivity on their own
- Separate `ai-analysis/` module from `ai-connection/` — analysis calls need external AbortSignal (for cancellation) and a 60s timeout; connection calls use internal 10s timeout with their own AbortController
- `"all"` as key when no filters active — avoids empty-string edge case in cache keys; normalized labels are sorted so `["Email","Social"]` and `["Social","Email"]` produce the same key
- Data cache keyed by labels only (per tab) — provider/model don't affect the preprocessed data; avoids redundant buildBudgetOptimizerData/buildExecutiveSummaryData when only provider changes
- Global single-request rule — only one API request across both tabs at any time; switching tabs cancels the other tab's request and reverts it to its last known state
- Error fallback with cached result — if a request fails but a cached response exists for the same key, the cached result stays visible with a warning message instead of showing an empty error state


## [#27] Remove data persistence and data preview from checklist
**Type:** update

**Summary:** Removed "Data persistence" and "Data preview before importing" from the feature checklist — not needed for the MVP scope.

**Brainstorming:** For an MBA assignment MVP, memory-only storage is sufficient (page refresh losing data is acceptable in a demo context), and data preview adds complexity without value since the error table already surfaces CSV issues. Upload-replace is the only remaining CSV feature that matters for usability.

**Prompt:** Remove items 2 and 3 from the CSV checklist.

**What changed:**
- `CLAUDE.md` — removed "Data persistence (memory vs sessionStorage vs localStorage)" and "Data preview before importing" from the CSV Upload & Template checklist

**Key decisions & why:**
- MVP scope trim — both features add complexity without meaningful value for a demo/presentation context; upload-replace is the only remaining must-have


## [#28] Fix connection timeout and cooldown button re-enable
**Type:** fix

**Summary:** Increased model selection timeout from 10s to 30s to prevent connection timeouts on free-tier APIs, and fixed the Analyze/Summarize button not re-enabling after the 5-second cooldown.

**Brainstorming:** Two issues. (1) The connection flow makes two API calls — fetching models (fast GET) and model selection (slow POST with AI prompt). Both used the same 10s timeout, but the model selection call on free-tier Gemini/Groq can take 15-30s especially on cold starts. Fix: add optional `timeoutMs` parameter to `fetchWithTimeout` and pass 30s for the model selection calls. (2) The `canAnalyze()` function used `Date.now()` to check cooldown expiry, but Vue computed properties only re-evaluate when a reactive dependency changes — time passing doesn't trigger re-evaluation. Fix: add a `cooldownTick` ref that increments via `setTimeout` after each cooldown expires, referenced inside `canAnalyze()` as a reactive dependency.

**Prompt:** Fix connection timeout for model selection call (increase to 30s). Fix Analyze button not re-enabling after 5s cooldown.

**What changed:**
- `features/ai-tools/ai-connection/shared.ts` — added optional `timeoutMs` parameter to `fetchWithTimeout` (default 10s), exported `MODEL_SELECTION_TIMEOUT_MS` (30s)
- `features/ai-tools/ai-connection/gemini.ts` — `callGemini` now passes `MODEL_SELECTION_TIMEOUT_MS` to `fetchWithTimeout`
- `features/ai-tools/ai-connection/groq.ts` — `callGroq` now passes `MODEL_SELECTION_TIMEOUT_MS` to `fetchWithTimeout`
- `stores/aiAnalysisStore.ts` — added `cooldownTick` ref + `scheduleCooldownExpiry()` (setTimeout that increments tick after 5s) + `clearCooldownTimers()` (cleanup on reset); `canAnalyze()` reads `cooldownTick.value` as reactive dependency; `executeAnalysis` calls `scheduleCooldownExpiry()` on success; `clearStateForNewCSV` calls `clearCooldownTimers()`

**Key decisions & why:**
- Optional timeout parameter vs separate function — keeps the API simple; the 10s default still applies to the fast model-list fetch, only the model selection call overrides to 30s
- `cooldownTick` ref pattern — the lightest way to make a time-based check reactive in Vue; the `void cooldownTick.value` read inside `canAnalyze()` creates a reactive dependency without using the value, so the computed re-evaluates when the timeout fires


## [#67] Fix and improve AI connection and analysis flow
**Type:** fix

**Summary:** Removed all API timeouts, fixed Gemini CORS error from duplicate `models/` prefix, added model selection fallback to optimal model, and added cross-tab auto-call activation.

**Brainstorming:** Five issues addressed: (1) Timeouts are unnecessary — the browser and the store's AbortController already handle cancellation; removing them simplifies the code and avoids false timeout errors on slow connections. (2) Gemini CORS error — the AI model selection prompt may return model IDs with `models/` prefix (e.g. `models/gemini-2.0-flash`), and the analysis URL already has `models/` in the path, producing `models/models/...` — a 404 that manifests as CORS. Fix: strip prefix before building URL. (3) Model selection fallback — if the AI prompt returns no models or fails to parse, throwing `no-models` blocks connection entirely. Instead, fall back to the optimal model already chosen for the prompt call. (4) Cross-tab auto-call — previously each tab had its own `firstAnalyzeCompleted` flag, so analyzing on Optimizer then switching to Summary did nothing. Fix: shared `analysisActivated` flag set on any manual analyze, used by `evaluateTab` and the label-change watcher. (5) Cached indicator display deferred to polishing phase.

**Prompt:** Fix/improve: remove all timeouts for API calls (connection and analysis), fix Gemini CORS error from duplicate models/ prefix, add model selection fallback to optimal model when AI prompt fails, add cross-tab auto-call so analyzing on one tab activates auto-calls on the other on tab switch.

**What changed:**
- `features/ai-tools/ai-connection/shared.ts` — removed `fetchWithTimeout`, `CONNECTION_TIMEOUT_MS`, and `MODEL_SELECTION_TIMEOUT_MS`; only `errorCodeFromStatus`, `errorCodeFromException`, `parseJsonResponse` remain
- `features/ai-tools/ai-connection/gemini.ts` — replaced `fetchWithTimeout` with plain `fetch`; added `buildFallbackModel`; `connectGemini` wraps AI selection in try-catch and falls back to optimal model on failure
- `features/ai-tools/ai-connection/groq.ts` — replaced `fetchWithTimeout` with plain `fetch`; added `buildFallbackModel`; `connectGroq` wraps AI selection in try-catch and falls back to optimal model on failure
- `features/ai-tools/ai-analysis/callProvider.ts` — removed `ANALYSIS_TIMEOUT_MS` and `fetchWithSignal`; `callGemini`/`callGroq` now use plain `fetch` with external `signal`; `callGemini` strips `models/` prefix from model ID
- `stores/aiAnalysisStore.ts` — added shared `analysisActivated` ref; set to `true` on manual `analyze()`; used in `evaluateTab` and label-change watcher instead of per-tab `firstAnalyzeCompleted`; reset in `clearStateForNewCSV`

**Key decisions & why:**
- Shared `analysisActivated` vs merging per-tab flags — a single shared flag is simpler and directly models the intent: "user has opted in to AI analysis"; per-tab `firstAnalyzeCompleted` kept for button label logic (Analyze vs Re-Analyze)
- `buildFallbackModel` per provider — each provider builds a fallback with the correct `PROVIDER_LABELS` value and appropriate display name formatting (Gemini strips `models/` prefix, Groq uses ID as-is)
- Strip `models/` prefix in analysis `callGemini` rather than at store level — keeps the fix close to where the URL is built, and the connection `getOptimalModel` already strips it independently


## [#68] Per-model token limit tracking and 5-model selection
**Type:** feature

**Summary:** Updated model selection prompt to return 5 models (deprioritizing preview/experimental), added per-model `limitReached` tracking so token limits mark individual models instead of globally blocking, and global block only engages when all models are exhausted.

**Brainstorming:** Gemini Pro Preview hits rate limits after ~3 calls on free tier (2 RPM, 32K TPM). Previously, any token-limit error set a global `tokenLimitReached` flag that permanently blocked all further calls. The fix has two parts: (1) select more models and steer the prompt away from preview/experimental ones with low quotas, and (2) track limits per model so the user can switch to another model and keep working. The global flag only activates when every model in the list is marked. Cache keys already include the model ID, so switching models and back naturally preserves previous responses.

**Prompt:** Update model selection prompt to 5 models, deprioritize preview/experimental. Add limitReached on AiModel. Track per-model limits in aiStore. Only set global tokenLimitReached when all models exhausted. Add model change watcher for cache/auto-call. Preserve cached responses across model switches.

**What was built:**
- `features/ai-tools/prompts/model-selection-prompt.ts` — changed from 3 to 5 models; added selection criteria to prefer high free-tier limits and avoid preview/experimental models; updated strict rules, validation checklist, and intro
- `features/ai-tools/types/index.ts` — added `limitReached: boolean` to `AiModel` type
- `features/ai-tools/ai-connection/gemini.ts` — `connectGemini` initializes `limitReached: false` on all returned models (AI-selected and fallback)
- `features/ai-tools/ai-connection/groq.ts` — `connectGroq` initializes `limitReached: false` on all returned models (AI-selected and fallback)
- `stores/aiStore.ts` — added `selectedModelLimitReached` and `allModelsLimitReached` computed properties; added `markModelLimitReached(modelId)` action; exported all three
- `stores/aiAnalysisStore.ts` — `handleRequestError` now calls `aiStore.markModelLimitReached` for the current model on token-limit; sets global `tokenLimitReached` only when `aiStore.allModelsLimitReached`; `executeAnalysis` guards on both global and per-model limit; label-change watcher guards on per-model limit; added model change watcher that triggers `evaluateTab` for cache/auto-call

**Key decisions & why:**
- Per-model `limitReached` on `AiModel` directly vs separate Map — mutating the model object is simpler and Vue reactivity picks it up via the `models` ref array; no need for a parallel data structure
- Global flag only when all exhausted — allows the user to switch models and keep working; previous behavior was too aggressive
- Model change watcher — ensures switching models immediately shows cached data or triggers auto-call, same as label/tab changes
- 5 models with anti-preview criteria — gives more fallback options and steers away from the models most likely to hit free-tier walls


## [#69] Set deterministic generation config for Gemini and Groq
**Type:** update

**Summary:** Pinned generation parameters to deterministic values on all Gemini and Groq API calls (connection + analysis) to ensure consistent, reproducible responses.

**Brainstorming:** Both providers defaulted to non-zero temperature (Groq was 0.3, Gemini used the API default). This introduced randomness between identical prompts, making analysis results inconsistent across runs. Setting temperature to 0 (and Groq's additional sampling params to neutral values) eliminates this variance. Applied to all 4 call sites: analysis calls in `callProvider.ts` and connection-time model-selection calls in `gemini.ts`/`groq.ts`.

**Prompt:** Set deterministic generation parameters — Gemini: `temperature: 0`; Groq: `temperature: 0, top_p: 1, frequency_penalty: 0, presence_penalty: 0` — on all API calls (connection and analysis).

**What changed:**
- `features/ai-tools/ai-analysis/callProvider.ts` — Gemini `callGemini`: added `generationConfig: { temperature: 0 }`; Groq `callGroq`: changed `temperature` from 0.3 to 0, added `top_p: 1`, `frequency_penalty: 0`, `presence_penalty: 0`
- `features/ai-tools/ai-connection/gemini.ts` — `callGemini`: added `generationConfig: { temperature: 0 }` to model-selection call
- `features/ai-tools/ai-connection/groq.ts` — `callGroq`: changed `temperature` from 0.3 to 0, added `top_p: 1`, `frequency_penalty: 0`, `presence_penalty: 0` to model-selection call

**Key decisions & why:**
- Applied to all 4 call sites (not just analysis) — model selection during connection also benefits from deterministic output for consistent model ranking
- Gemini uses `generationConfig` wrapper — required by the Gemini API schema; temperature is nested inside it
- Groq gets all 4 params explicitly — even though 0/1 are defaults for some, setting them explicitly documents intent and prevents any future API default changes from affecting behavior


## [#70] Model evaluation prompt, silent model fallback, and model attribution
**Type:** feature

**Summary:** Switched to `generateModelEvaluationPrompt` for ranking up to 15 models, added silent model fallback on token-limit errors (retries with next best model transparently), and stamped each AI response with the model display_name shown alongside the cached timestamp.

**Brainstorming:** The previous `generateModelSelectionPrompt` returned only 5 models and did not guarantee sort order. The new `generateModelEvaluationPrompt` evaluates all available models and returns up to 15, ranked by strength_score. Since the AI might not sort perfectly, a re-sort by `strength_score` desc is applied client-side. For token limits: previously the first failure would show an error to the user and block further requests. Now the flow is: mark model as exhausted → pick next highest-scored available model from the sorted list → retry the same call transparently. The user never sees the intermediate failure — only the final result. The global `tokenLimitReached` flag is only set when ALL models are exhausted. For attribution: added an optional `model` field to both response types, stamped with `display_name` on success, and shown in the cached indicator as "Generated at [time] with [model_name]". The default model (used for the evaluation prompt itself) gets its AI-assigned properties if it appears in the ranked response.

**Prompt:** Use generateModelEvaluationPrompt instead of generateModelSelectionPrompt. Sort the returned models ranking with highest score first. In the response from AI save the model properties as well and show to the user the display_name too. If a model reaches the token limit then on the first failure select the next one in the list without showing the error to the user and try again the call. If all models reached their limit then the global flag for limit reached should be true.

**What was built:**
- `features/ai-tools/types/index.ts` — added optional `model?: string` field to `BudgetOptimizerResponse` and `ExecutiveSummaryResponse`
- `features/ai-tools/ai-connection/gemini.ts` — switched to `generateModelEvaluationPrompt`, re-sort results by `strength_score` desc, update default model properties if it appears in ranked list
- `features/ai-tools/ai-connection/groq.ts` — same changes as gemini.ts
- `stores/aiStore.ts` — added `selectNextAvailableModel()` that picks next non-exhausted model from sorted list (returns false if none left)
- `stores/aiAnalysisStore.ts` — `handleRequestError`: on token-limit, marks model, calls `selectNextAvailableModel`, retries silently; global flag only when all exhausted. `executeAnalysis`: pre-check tries next model instead of blocking. Stamps `result.model` with display_name on success. Label-change watcher: tries next model instead of blocking
- `features/ai-tools/components/AiOptimizerPanel.vue` — cached indicator shows "Generated at [time] with [model_name]"
- `features/ai-tools/components/AiSummaryPanel.vue` — same cached indicator update

**Key decisions & why:**
- Re-sort client-side after AI response — cannot fully trust the AI to return models in correct order despite the prompt requiring it
- Silent retry is transparent — user sees only the final result with the model name, never intermediate failures; this avoids confusing error flashes
- `selectNextAvailableModel` uses `Array.find` on the sorted models array — since models are sorted by strength_score desc, `find(!limitReached)` naturally picks the best available
- `tokenLimitReached` set to `true` directly (not via computed) — only when `selectNextAvailableModel` returns false, meaning all models are exhausted
- Default model properties updated from AI response — ensures the model used for evaluation gets accurate display_name/strength/reason from the AI instead of the generic fallback values


## [#71] Store full AiModel in responses and extract rankModels utility
**Type:** refactor

**Summary:** Changed the `model` field on `BudgetOptimizerResponse` and `ExecutiveSummaryResponse` from `string` to `AiModel` so the full model properties are preserved per response. Extracted the shared ranking/sorting/optimal-update logic from both provider modules into a new `rankModels` utility.

**Brainstorming:** Storing only `display_name` as a string lost all other model metadata (strength_score, reason, provider, etc.) per cached response. Switching to `AiModel` preserves everything. The ranking logic — sort by score, init limitReached, update optimal model's id/model from fallback — was duplicated identically in `gemini.ts` and `groq.ts`. Extracting it into `utils/rankModels.ts` removes duplication and keeps the connection modules focused on provider-specific fetch/call/filter logic.

**Prompt:** Save the full AiModel in the ExecutiveSummaryResponse and BudgetOptimizerResponse. If the optimal model is in the list, assign the returned properties to it. Extract similar functionalities into the utils folder.

**What changed:**
- `features/ai-tools/types/index.ts` — changed `model?: string` to `model?: AiModel` on both response types
- `features/ai-tools/utils/rankModels.ts` — new file: `rankModels(parsed, optimalModelId, fallback)` sorts models by strength_score desc, inits limitReached, updates optimal model entry with correct id/model from fallback
- `features/ai-tools/ai-connection/gemini.ts` — replaced inline ranking logic with `rankModels()` call
- `features/ai-tools/ai-connection/groq.ts` — same simplification
- `stores/aiAnalysisStore.ts` — stamps `result.model` with full `AiModel` copy (spread) instead of just display_name string
- `features/ai-tools/components/AiOptimizerPanel.vue` — reads `response.model.display_name` instead of `response.model`
- `features/ai-tools/components/AiSummaryPanel.vue` — same template update

**Key decisions & why:**
- Full `AiModel` instead of string — preserves all metadata per cached response; future features can display strength, reason, etc. without re-querying
- Spread copy (`{ ...aiStore.selectedModel }`) — prevents the response's model snapshot from mutating if the store's model changes later (e.g. limitReached toggled)
- `rankModels` in utils, not in ai-connection — it's pure data transformation with no provider-specific logic, so it belongs in the shared utils folder


## [#72] Guarantee rankModels always returns at least one model
**Type:** update

**Summary:** Updated `rankModels` to always include the fallback (optimal) model — if the AI response is empty or doesn't contain the optimal model, the fallback is added and the list re-sorted. Simplified both provider modules since `rankModels` now guarantees a non-empty result.

**Brainstorming:** Previously `rankModels` returned an empty array when the AI response was empty, forcing the callers to check length and fall back manually. Since the fallback model is always available and always passed in, `rankModels` can guarantee at least one model by appending it when missing. This lets the callers simplify from a 4-line check-and-fallback to a single `return rankModels(...)`, with the catch block still providing the fallback for network/parse failures.

**Prompt:** Update rankModels: pass the optimal we selected. If not in the list add it and return the sorted list. If in the list then return the sorted list. That way rankModels will return at least one model in case the response is empty.

**What changed:**
- `features/ai-tools/utils/rankModels.ts` — removed early `return []` for empty response; if optimal model not found in sorted list, pushes fallback and re-sorts
- `features/ai-tools/ai-connection/gemini.ts` — simplified try block to single `return rankModels(...)` call (removed `selected.length` and `ranked.length` guards)
- `features/ai-tools/ai-connection/groq.ts` — same simplification

**Key decisions & why:**
- Fallback added via push + re-sort rather than unshift — keeps the list properly sorted even when the fallback score (7) is higher than some AI-ranked models
- Callers still keep the catch block with `[buildFallbackModel(optimal)]` — the catch covers network/parse failures where `rankModels` is never reached


## [#73] Filter out weak models in rankModels
**Type:** update

**Summary:** Added a filter step in `rankModels` to remove all models with a `strength_score` below 6, ensuring only suitable models are available for AI analysis.

**Brainstorming:** The model evaluation prompt scoring guidelines already define models below 6 as "generally unsuitable for this application." Filtering them out at the `rankModels` level ensures unsuitable models never reach the selection pool, regardless of what the AI returns. A simple `.filter()` before `.sort()` is the cleanest approach — no new abstractions needed.

**Prompt:** Update rankModels to remove all models that have less than 6 strength_score.

**What changed:**
- `features/ai-tools/utils/rankModels.ts` — added `.filter((m) => m.strength_score >= 6)` before the sort step; updated JSDoc to reflect the new pipeline order
- `CLAUDE.md` — updated architecture description for `rankModels.ts`

**Key decisions & why:**
- Filter placed before sort — no point sorting models that will be discarded
- Threshold of 6 aligns with the scoring guidelines in `model-evaluation-prompt.ts` where below 6 means "generally unsuitable"
- Fallback model is still added before filtering — if the fallback has a score >= 6 (default is 7) it survives; if not, the list may still contain other qualifying models


## [#74] Rename ModelSelectionResponse → RankedModelsResponse, remove legacy model-selection prompt
**Type:** refactor

**Summary:** Renamed `ModelSelectionResponse` to `RankedModelsResponse` and `selected_models` to `models` across the codebase, and deleted the unused `model-selection-prompt.ts`.

**Brainstorming:** The codebase had two model prompt files: `model-selection-prompt.ts` (legacy, selects top 5) and `model-evaluation-prompt.ts` (active, evaluates and ranks up to 20). Only `generateModelEvaluationPrompt` is imported — `generateModelSelectionPrompt` is dead code with no consumers. The legacy prompt was the original implementation that selected a fixed top-5 list. It was superseded by the evaluation prompt which introduced scoring (strength_score 1–10), richer evaluation criteria (reasoning ability, summarization, structured output, stability, rate limits), and support for up to 20 models. Both providers (Gemini and Groq) import exclusively from `model-evaluation-prompt.ts` via the prompts barrel export, which never re-exported the legacy prompt. The type name `ModelSelectionResponse` and field `selected_models` were holdovers from the legacy prompt's naming. Renaming to `RankedModelsResponse` with a `models` field better reflects the current evaluation-and-ranking semantics. The prompt schema output also needed updating from `selected_models` to `models` to match the new type so the AI response parses correctly into `RankedModelsResponse`.

**Prompt:** Update ModelSelectionResponse to RankedModelsResponse and selected_models to models. Clean up model-selection prompt and justify in the logs why we will only use the model evaluation prompt based on current implementation.

**What changed:**
- `features/ai-tools/types/index.ts` — renamed `ModelSelectionResponse` → `RankedModelsResponse`, `selected_models` → `models`, updated comment
- `features/ai-tools/utils/rankModels.ts` — updated import and usage to `RankedModelsResponse` and `parsed.models`
- `features/ai-tools/ai-connection/gemini.ts` — updated import and cast to `RankedModelsResponse`
- `features/ai-tools/ai-connection/groq.ts` — updated import and cast to `RankedModelsResponse`
- `features/ai-tools/prompts/model-evaluation-prompt.ts` — updated output schema from `selected_models` to `models`
- `features/ai-tools/prompts/model-selection-prompt.ts` — deleted (dead code)
- `CLAUDE.md` — removed model-selection-prompt from architecture, updated type name

**Key decisions & why:**
- Deleted `model-selection-prompt.ts` rather than keeping it — it was never imported anywhere, the prompts barrel export excluded it, and keeping dead code adds confusion about which prompt is active
- Renamed to `RankedModelsResponse` (not `ModelEvaluationResponse`) — the type describes the response shape (a ranked list of models), not the prompt that produced it; this keeps the type reusable if the prompt evolves
- Updated the prompt schema output field to `models` — the AI response must match the TypeScript type for `parseJsonResponse(...) as RankedModelsResponse` to work correctly


## [#75] Fix CAC returning 0 for zero-conversion campaigns — use null instead
**Type:** fix

**Summary:** Changed CAC calculation to return `null` instead of `0` when conversions are zero, preventing zero-conversion campaigns from appearing artificially efficient in AI analysis and dashboard display.

**Brainstorming:** `safeDivide(budget, 0)` returns `0`, which makes a zero-conversion campaign look like it has the best possible acquisition cost (€0). This is semantically wrong — CAC is undefined when there are no conversions, not zero. The AI prompts receive this data as JSON and would misinterpret `cac: 0` as exceptional efficiency, potentially recommending budget increases for campaigns that produce no conversions at all. Three options: (1) `null` — signals "not computable", serializes to `null` in JSON which the AI can interpret correctly; (2) large sentinel like `Infinity` — doesn't serialize to valid JSON; (3) "N/A" string — breaks the numeric type. `null` is the cleanest: it's type-safe, serializes correctly, and the AI can distinguish "no data" from "zero cost." For the dashboard, `KpiCard` now shows "N/A" for null values. The `CampaignTable` already displayed '—' for zero-conversion CAC but its sort function returned 0 (sorting them to the top as "best"); changed to `Infinity` so they sort to the bottom instead. `safeDivide` itself was not changed — it's correct for ROI, CTR, CVR where 0 is a valid result (0% ROI means break-even, 0% CTR means no clicks).

**Prompt:** Fix issues that fall in this case: CAC with zero conversions. budget / 0 should not become 0 in business terms. That makes a zero-conversion campaign look artificially efficient.

**What changed:**
- `features/ai-tools/types/index.ts` — `CampainSummaryTotals.cac` changed from `number` to `number | null`
- `common/types/campaign.ts` — `CampaignKPIs.cac` changed from `number` to `number | null`
- `features/ai-tools/utils/buildBudgetOptimizerData.ts` — 3 CAC sites: per-campaign, per-channel, totals — all return `null` when conversions = 0
- `features/ai-tools/utils/buildExecutiveSummaryData.ts` — 3 CAC sites: per-campaign, per-channel, totals — all return `null` when conversions = 0
- `stores/campaignStore.ts` — portfolio KPI CAC returns `null` when total conversions = 0
- `features/dashboard/components/KpiCard.vue` — `value` prop accepts `number | null`, displays "N/A" for null
- `features/dashboard/components/CampaignTable.vue` — CAC sort value uses `Infinity` instead of `0` for zero conversions, pushing them to the bottom

**Key decisions & why:**
- Used `null` over `0`, `Infinity`, or `"N/A"` — null is type-safe, serializes to valid JSON, and lets the AI distinguish "not computable" from "zero cost"
- Did not change `safeDivide` — it's correct for ROI (0% = break-even), CTR (0% = no clicks), CVR (0% = no conversions from clicks); only CAC has the semantic mismatch where 0 is misleading
- Used `Infinity` for sort (not `null`) in CampaignTable — `Infinity` sorts correctly with numeric comparison, pushing zero-conversion rows to the bottom of ascending sort (highest CAC = worst)
- Inlined the check (`conversions > 0 ? round2(budget / conversions) : null`) rather than creating a utility — the pattern is simple and explicit at each call site


## [#76] Rewrite buildExecutiveSummaryData with portfolio benchmarks, delta signals, and structured classification logic
**Type:** refactor

**Summary:** Rewrote the executive summary data builder with portfolio benchmark metrics, per-campaign/channel delta signals, structured campaign classification rules (top/underperforming with no-overlap guarantee), materiality-based channel ranking, priority-ordered key findings, minimum sample thresholds, and explicit empty dataset handling.

**Brainstorming:** The previous implementation used simple ROI-based sorting for top/underperforming campaigns and budget-share sorting for channels. This produced weak classifications — a campaign could be both top and underperforming, there was no relative efficiency signal (delta vs portfolio), and key findings had ad-hoc priority ordering. The new rules introduce: (1) Portfolio benchmarks as baseline reference (ROI, CAC, CVR from totals); (2) Delta signals (roiDelta, cacDelta, cvrDelta) on every campaign and channel so the AI can see relative performance at a glance; (3) Structured top-campaign selection requiring BOTH ROI >= portfolio AND CAC <= portfolio; (4) Multi-signal underperforming detection (2+ of 4 conditions); (5) Explicit no-overlap guarantee (top takes precedence); (6) Minimum sample threshold (conversions >= 10 OR budget >= 2%) to prevent low-volume campaigns from skewing classifications; (7) Materiality score (60% budget + 40% revenue) for channel ranking instead of pure budget share; (8) Priority-ordered key findings (budget inefficiency > disproportionate revenue > campaign outperformance > concentration risk). CAC uses Infinity for zero conversions in this builder — enables natural comparison logic (Infinity > any threshold → never classified as efficient) and serializes to null in JSON for the AI prompt.

**Prompt:** Fix the buildExecutiveSummaryData with detailed rules covering portfolio benchmarks, delta signals, campaign classification (top/underperforming), channel efficiency, key finding generation priority, division safety, empty dataset handling, materiality-based channel ranking, and minimum sample threshold.

**What was built:**
- `features/ai-tools/types/index.ts` — added `PerformanceDeltas` type (roiDelta, cacDelta, cvrDelta); extended `ExecutiveSummaryChannel` and `ExecutiveSummaryCampaign` with it
- `features/ai-tools/utils/buildExecutiveSummaryData.ts` — complete rewrite:
  - `computeCAC` — returns Infinity for zero conversions
  - `computeCacDelta` — returns null when result is non-finite (Infinity - Infinity = NaN)
  - `meetsMinSample` — conversions >= 10 OR budget >= 2% of portfolio
  - `deriveCampaignMetrics` — now computes roiDelta, cacDelta, cvrDelta against portfolio benchmarks
  - `aggregateChannels` — now receives benchmarks, computes channel deltas
  - `splitChannels` — materiality score ranking (budgetShare × 0.6 + revenueShare × 0.4)
  - `selectTopCampaigns` — ROI >= portfolio AND CAC <= portfolio, min sample, ranked by ROI desc → Revenue desc → Conversions desc
  - `countUnderperformingSignals` — 4 conditions: ROI weakness, CAC inefficiency (gated on conversions >= 10), revenue-budget share gap, CVR weakness
  - `selectUnderperformingCampaigns` — requires 2+ signals, excludes top campaigns, min sample
  - `generateKeyFindings` — priority-ordered: budget inefficiency, disproportionate revenue, major outperformance, concentration risk
  - `buildExecutiveSummaryData` — explicit empty dataset early return, benchmark-driven pipeline

**Key decisions & why:**
- CAC = Infinity (not null) for zero conversions in this builder — enables natural comparison semantics (Infinity is always > any threshold, so zero-conversion items never qualify as efficient); serializes to null in JSON for the AI, matching the existing prompt handling
- `PerformanceDeltas` as a shared type — both campaign and channel types need the same delta fields; a shared type avoids duplication and makes the contract explicit
- Top campaign precedence over underperforming — prevents contradictory classifications that would confuse the AI; when filtered datasets are small, underperforming list shrinks rather than overlapping
- Underperforming CAC condition gated on conversions >= 10 — avoids penalizing campaigns whose zero/low conversion count makes CAC unreliable as an efficiency signal
- Materiality score (60/40 budget-revenue blend) for channel ranking — pure budget share would miss high-revenue-efficiency channels; the blend surfaces channels that matter most to the business
- Budget inefficiency as highest-priority finding — an active budget drain is more actionable than an outperformance signal



## [#77] Rename generateBudgetOptimizerPrompt to generateBudgetOptimizationPrompt
**Type:** update

**Summary:** Renamed the function `generateBudgetOptimizerPrompt` to `generateBudgetOptimizationPrompt` and the source file from `budget-optimizer-prompt.ts` to `budget-optimization-prompt.ts` for naming consistency.

**Brainstorming:** A simple rename across four locations: the function declaration, the barrel export, the store import, and the store call site. The file rename follows the function name to keep them in sync.

**Prompt:** Rename generateBudgetOptimizerPrompt to generateBudgetOptimizationPrompt and rename the file too.

**What changed:**
- `budget-optimizer-prompt.ts` → `budget-optimization-prompt.ts` — file renamed
- `budget-optimization-prompt.ts:277` — function declaration renamed to `generateBudgetOptimizationPrompt`
- `prompts/index.ts:1` — barrel export updated to new name and file path
- `aiAnalysisStore.ts:17,235` — import and call site updated to new name
- `CLAUDE.md` — architecture entry updated to reflect new file and function name

**Key decisions & why:**
- All four references updated atomically — no intermediate broken state


## [#78] Upload again / replace existing data with confirmation warning
**Type:** feature

**Summary:** Added a confirmation modal that gates the "Upload CSV" header button when campaign data already exists, warning the user that uploading will replace all current data and reset analysis.

**Brainstorming:** The trigger already existed in the AppShell header. The question was how to intercept it. Three options considered: (A) reuse BaseModal as a confirm dialog, (B) add a warning step inside UploadModal, (C) window.confirm(). Option A was chosen — a dedicated ReplaceDataModal keeps UploadModal clean and the confirmation logic separate. The provide('openUploadModal') path remains untouched since EmptyState only appears when no data exists and needs no confirmation.

**Prompt:** Implement Upload again / replace existing data (with confirmation warning). Reuse BaseModal as a confirm dialog. The trigger already exists in the header.

**What was built:**
- `csv-file/components/ReplaceDataModal.vue` — BaseModal with warning message, "Replace data" (primary) and "Cancel" (ghost) buttons; emits confirm/close
- `AppShell.vue` — added showReplaceConfirm ref and onReplaceConfirm handler; header "Upload CSV" button now opens ReplaceDataModal instead of UploadModal directly; on confirm: closes modal and opens UploadModal; provide('openUploadModal') path unchanged

**Key decisions & why:**
- ReplaceDataModal is v-if (not v-show) — avoids mounting BaseModal's keyboard/scroll listeners when it's not visible
- provide('openUploadModal') left unchanged — the EmptyState path has no data to replace, confirmation would be incorrect there
- Warning copy mentions analysis reset — consistent with the existing CSV upload reset behaviour already implemented in aiAnalysisStore


## [#79] CsvUploadForm: extract common field styles to @layer components
**Type:** refactor

**Summary:** Extracted shared form field styles (background, border-radius, font, hover/focus/error border states) into global `.form-control`, `.form-field`, `.form-field__label`, `.form-field__error` classes in `@layer components`; dropzone now has a solid darker background matching the title input.

**Brainstorming:** Two problems to solve: (1) shared visual styles between text input and dropzone (background, border interaction states), and (2) border declarations differ (1px solid vs 1.5px dashed), making a single shared border rule impossible. The solution uses a CSS custom property `--control-border` set to `var(--color-border)` by default on `.form-control`, then overridden on `:hover`, `:focus`/`:focus-within`, and via `.form-control--error`. Each field's scoped style declares its own `border: <style> var(--control-border)` so the shape differs but the color is always driven by the global class. This avoids specificity conflicts entirely — there's no competing border-color declaration. `--active` on the dropzone sets the same custom property. The background tint on dropzone hover was removed since both fields now have a solid background and the hover state is purely a border color change.

**Prompt:** Refactor CsvUploadForm: upload file field should have the same darker background as the campaign title and a solid background. Focus and hover states should be the same for fields. Extract common styles in the @layer components.

**What changed:**
- `style.scss` — added `.form-field`, `.form-field__label`, `.form-field__error`, `.form-control`, `.form-control--error` to `@layer components`; `.form-control` owns `--control-border` custom property and all hover/focus/error state changes
- `CsvUploadForm.vue` — template: replaced `.field`/`.field__label`/`.field__error` with global classes; added `form-control` to both input and dropzone; replaced `field__input--error`/`dropzone--error` with `form-control--error`; scoped styles: removed `.field` block entirely; `.field__input` reduced to border + padding + placeholder; `.dropzone` reduced to layout + dashed border using `var(--control-border)` + sub-element styles; `--active` modifier sets `--control-border` directly

**Key decisions & why:**
- CSS custom property `--control-border` chosen over shared `border-color` rule to avoid specificity conflicts between global and scoped styles — each field keeps its own border shorthand while the color is centrally controlled
- `:focus-within` on `.form-control` covers the dropzone (label containing a hidden file input) — keyboard focus on the file input surfaces the same indigo border as the text field
- Background tint on dropzone hover removed — both fields are now solid `var(--color-bg)`, so hover is a border-only change, consistent with the text input


## [#80] AiConnectionForm: align styles with CsvUploadForm, button toggles, Groq default
**Type:** refactor

**Summary:** Aligned AiConnectionForm field styles with CsvUploadForm using shared global classes, replaced radio buttons with button toggles, moved Groq to first/default provider, and made error state inline below the API key field.

**Brainstorming:** The form had its own label/field/error styles duplicating what is now in @layer components. Four problems to solve: (1) visual alignment — use form-field/form-field__label/form-field__error/form-control/form-control--error everywhere they apply; (2) radio → button toggles — hide the native radio input (keep for a11y), style the label as a filled toggle: inactive = border only with muted text, active = solid indigo + white text, hover-inactive = subtle indigo border; (3) error placement — move from the styled error box (outside the field flow) to inline below the API key input so the filled value stays visible and the form structure is not disrupted; (4) provider change → clear stale error — a watcher on selectedProvider sets store.connectionError = null so an error from one provider does not confuse the user when they switch.

**Prompt:** AiConnectionForm should have the same styles as CsvUploadForm. Labels, fields, colors and error visual states should be the same. Upon error the form state should be maintained. Update radio buttons to look like button toggles. Move Groq connection as the first/default provider.

**What changed:**
- `AiConnectionForm.vue` — script: default selectedProvider changed to 'groq'; added watch(selectedProvider) that clears store.connectionError on change; template: fieldset/legend use form-field/form-field__label; radios reordered (Groq first); radio-input hidden (display:none), label styled as toggle; API key field uses form-field/form-field__label/form-control/form-control--error; error rendered as form-field__error + ai-conn__error-hint inside the field wrapper; old ai-conn__error box removed; scoped styles: removed __field/__label/__radio-input dot styles/__error/__error-message; __radio redesigned as button toggle; __input uses var(--control-border) for border; __error-hint kept for hint secondary text
- `CLAUDE.md` — AiConnectionForm architecture entry updated

**Key decisions & why:**
- `display: none` on radio-input (not sr-only) — the label itself is the clickable toggle, so screen readers navigate by the label text and fieldset legend; the hidden input still carries the checked state for v-model
- Error cleared on provider switch via direct store.connectionError = null — Pinia refs are writable from components; no new store action needed
- Button toggle padding matches field__input (spacing[2.5] vertical) — visual height matches the API key field for a consistent form rhythm
- Hint text kept as ai-conn__error-hint (secondary color, xs) below form-field__error — preserves the contextual guidance without introducing a new global class for a single use


## [#81] Extract @layer components to dedicated file; centralize form colors in Tailwind config
**Type:** refactor

**Summary:** Moved all @layer component classes to a new src/styles/components.scss file, added a danger color token to tailwind.config.js, and eliminated all hardcoded hex values from form-related styles by using theme() references throughout.

**Brainstorming:** Three problems: (1) @layer components was inline in style.scss, mixing global class definitions with theme tokens and base styles; (2) hardcoded hex values were scattered across style.scss, CsvUploadForm, and AiConnectionForm — #6366f1, #f43f5e, #818cf8, #a5b4fc appeared in multiple places; (3) form-control lacked border, width, and ::placeholder, so component scoped styles had to duplicate them. Solution: new src/styles/components.scss holds the full @layer components block and is imported via SCSS @import in style.scss. tailwind.config.js gets a danger token (DEFAULT: #f43f5e) so error colors use theme('colors.danger.DEFAULT'). form-control gains border: 2px solid var(--control-border), width: 100%, and ::placeholder — scoped input styles in both form components are now reduced to padding only. All remaining hex in component scoped styles replaced with theme() or CSS keywords.

**Prompt:** Lets extract all form styles to layer components. I still see hover states placeholder styles in CsvUploadForm. Make sure borders are 2px. Do not use hardcoded colors in the code. Try to update tailwind config to centralize colors. Focus on forms only for now. Lets also make a new file for layer components and import it in styles.scss.

**What was built:**
- `src/styles/components.scss` (NEW) — @layer components block with form classes (form-field, form-field__label, form-field__error, form-control with border/width/placeholder/hover/focus, form-control--error) and existing non-form classes (card, btn-primary, section-title, data-table family); all form hex replaced with theme()
- `tailwind.config.js` — danger color token added: DEFAULT: '#f43f5e'
- `style.scss` — @layer components block removed; replaced with @import './styles/components'
- `CsvUploadForm.vue` — .field__input reduced to padding only; .dropzone border removed (from form-control); --active and __link hex replaced with theme('colors.primary.500')
- `AiConnectionForm.vue` — __input reduced to padding only; radio --active and hover hex replaced with theme() and color-mix(); __toggle hex replaced with theme('colors.primary.400'/'300')
- `CLAUDE.md` — architecture updated: new styles/ folder entry, style.scss and tailwind.config.js descriptions updated

**Key decisions & why:**
- SCSS @import (not @use) chosen for the components file — @use requires placement before all other rules which conflicts with @tailwind directives already at the top of style.scss
- danger token added to tailwind.config.js as a top-level semantic color (not nested under primary) — it's a distinct semantic meaning (error state), not a shade of indigo
- border: 2px solid moved into .form-control globally — both form components now get consistent 2px borders without duplicating the declaration; radio toggles stay at 2px via their own scoped border
- color-mix(in srgb, theme('colors.primary.500') 50%, transparent) for radio hover — avoids adding a semi-transparent color variant to tailwind config; PostCSS resolves theme() inside color-mix correctly
- Spinner white border kept as CSS keyword 'white' — it's a universal constant for a spinner on any background, not a design token


## [#82] Fix SCSS @import deprecation warning — switch to @use
**Type:** fix

**Summary:** Replaced deprecated SCSS @import with @use, moving it to the top of style.scss before @tailwind directives, which is the only valid position Dart Sass accepts for @use.

**Brainstorming:** @use must be the first statement in a Dart Sass file (before all other rules including unknown at-rules like @tailwind). Moving @use before @tailwind directives is safe — PostCSS/Tailwind processes @layer components content independently of where it appears in source order.

**Prompt:** Deprecation Warning [import]: Sass @import rules are deprecated and will be removed in Dart Sass 3.0.0.

**What changed:**
- `style.scss` — @use './styles/components' moved to top of file (before @tailwind directives); @import line removed; comment updated to reference the file path

**Key decisions & why:**
- @use placed before @tailwind directives — Dart Sass requires @use to precede all other statements; PostCSS handles @layer content regardless of source order so this has no functional impact


## [#83] Centralize #cbd5e1 text color as slate.300 token in Tailwind config
**Type:** refactor

**Summary:** Added slate.300 color token to tailwind.config.js and replaced all 7 files that hardcoded #cbd5e1, ensuring side panel body text and table cell text are driven by the same single token.

**Brainstorming:** #cbd5e1 (= Tailwind's slate-300) was the shared body/content text color used across the table (data-table__td), both AI panels, the drawer title and close button, the tabs, the connected status bar, and the funnel chart label. Since all these contexts want the same color, a single token ensures they stay in sync. Adding slate.300 to the theme extension (rather than importing Tailwind's full default palette) keeps the config minimal and intentional. replace_all on all 7 files eliminates every occurrence atomically.

**Prompt:** Side panel text color should be the same as the text of the values in the table. Any color changes should go through tailwind config.

**What changed:**
- `tailwind.config.js` — slate.300: '#cbd5e1' added to theme.extend.colors
- `styles/components.scss` — data-table__td color updated to theme('colors.slate.300')
- `AiToolsDrawer.vue` — 3 occurrences replaced (ai-close-btn, ai-drawer__title, ai-overlay__title)
- `AiConnectedStatus.vue` — 2 occurrences replaced (ai-status__provider, ai-status__disconnect)
- `AiTabs.vue` — 1 occurrence replaced (ai-tabs__tab)
- `AiOptimizerPanel.vue` — 8 occurrences replaced (subtitle, empty-text, loader-text, result-block__text, recommendation detail-value, metrics-text strong, performer unlock, risk mitigation strong)
- `AiSummaryPanel.vue` — 7 occurrences replaced (subtitle, empty-text, loader-text, result-block__text, health-score__label, insight__text, priority__metric)
- `FunnelChart.vue` — 1 occurrence replaced (funnel__label)

**Key decisions & why:**
- slate (not content or body) chosen as the token namespace — matches Tailwind's own naming for this shade and makes the value self-documenting to anyone familiar with Tailwind; other slate shades (#94a3b8 = slate-400, #64748b = slate-500) are candidates for future tokens when addressed
- Only slate.300 added — user said "focus on forms" in the previous task; this task is specifically about the one shared content color; other hardcoded hex values left for a future pass


## [#84] Set slate.300 as app default text; update modal and ghost button colors via theme()
**Type:** refactor

**Summary:** Changed --color-text to theme('colors.slate.300') so slate.300 is the app-wide default text color, updated ghost button and modal/drawer close button text from --color-text-secondary to --color-text, and replaced all remaining hardcoded hex in those components with theme() references.

**Brainstorming:** Three things to wire up: (1) --color-text drives body { color } and form-control color — changing it to slate.300 makes every default text element pick up the token automatically; (2) ghost button was using --color-text-secondary (#94a3b8) which is dimmer than slate.300 — swapping to --color-text aligns it with the new default; (3) modal and drawer close buttons had the same --color-text-secondary starting color plus hardcoded hex for hover/focus — replaced with var(--color-text) and theme() equivalents. AiToolsDrawer has its own close button identical to BaseModal's that also needed the same treatment.

**Prompt:** Do the same for modals and ghost buttons. Make sure this is the default text color for our app.

**What changed:**
- `style.scss` — --color-text changed from #f1f5f9 to theme('colors.slate.300'); PostCSS resolves to #cbd5e1 at build time
- `BaseButton.vue` — ghost color changed to var(--color-text); ghost hover border-color to theme('colors.primary.500'); primary bg to theme('colors.primary.500'), hover to theme('colors.primary.600'); focus-visible outline to theme('colors.primary.500'); color: white replaces #ffffff
- `BaseModal.vue` — close button color changed to var(--color-text); hover color to theme('colors.primary.300'), hover bg to color-mix(primary.500 20%); focus-visible border-color to theme('colors.primary.500')
- `AiToolsDrawer.vue` — same close button updates as BaseModal; was already using slate.300 token (from previous pass) but still had hardcoded hex for hover/focus

**Key decisions & why:**
- --color-text updated via theme() in :root — PostCSS resolves theme() in CSS variable declarations the same as anywhere else; keeps the CSS variable linked to the single tailwind token rather than a second hardcoded copy
- Ghost button uses var(--color-text) not theme('colors.slate.300') directly — CSS variables allow runtime theming; hardcoding theme() would break if --color-text is ever overridden per-context
- --color-header-text left at #f1f5f9 — header intentionally uses a brighter white; user did not request changing it


## [#85] Fix --color-text resolution and align body text to slate.300 across app
**Type:** fix

**Summary:** Fixed --color-text not resolving correctly (theme() is unreliable in CSS custom property declarations with Dart Sass) and corrected four body-text roles that were still explicitly using --color-text-secondary instead of inheriting the default text color.

**Brainstorming:** Two root causes: (1) --color-text: theme('colors.slate.300') used a PostCSS function inside a CSS custom property declaration — Dart Sass passes custom property values through as opaque strings which should let PostCSS resolve theme(), but in practice this is unreliable across toolchain versions and was likely the primary reason ghost buttons, modal close buttons, and form controls were not showing slate.300. Fix: use #cbd5e1 directly with a /* slate.300 */ comment to keep the token traceable. (2) Several body-text roles explicitly set var(--color-text-secondary) (#94a3b8) rather than inheriting var(--color-text) — these needed to be corrected individually. Deliberately left as secondary: placeholder text, table th, error hints, dropzone icon, and any other intentionally muted/secondary UI text.

**Prompt:** I want the default color of the text in the app, modals, side panels, ghost buttons to be exactly the same as the table values. this is not the case now fix it.

**What changed:**
- `style.scss` — --color-text changed from theme('colors.slate.300') to #cbd5e1 with /* slate.300 */ comment; fixes var(--color-text) resolution for all consumers
- `ReplaceDataModal.vue` — __message color: var(--color-text-secondary) → var(--color-text)
- `AiConnectionForm.vue` — __intro color: var(--color-text-secondary) → var(--color-text); __radio inactive color: var(--color-text-secondary) → var(--color-text)
- `CsvUploadForm.vue` — dropzone __hint color: var(--color-text-secondary) → var(--color-text)

**Key decisions & why:**
- Hex value used directly for --color-text rather than theme() — theme() in CSS custom property declarations is not reliably resolved by Tailwind's PostCSS plugin across all Dart Sass versions; /* slate.300 */ comment preserves the token reference for maintainability
- __error-hint, ::placeholder, __icon, data-table__th left as --color-text-secondary — these are intentionally muted UI roles that should remain visually subordinate to body text
- Radio inactive state changed to --color-text — the unselected toggle should read at the same level as other body text; the contrast between inactive (slate.300) and active (white on indigo) is still clear


## [#86] Add API key instructions and clear key on provider switch in AiConnectionForm
**Type:** update

**Summary:** Added a collapsible "How to get your key?" help section with provider-specific numbered steps, and clear the API key (and show/hide state) when the user switches providers.

**Brainstorming:** Two small but complementary UX improvements. The help section reduces friction for first-time users who may not know where to obtain a Groq or Gemini key — it belongs near the API key field, toggled on demand so it does not clutter the form by default. The clear-on-switch behaviour prevents the previous provider's key from silently persisting in the input when the user changes their mind, which could lead to a confusing connect failure with a mismatched key.

**Prompt:** Add instructions on how to connect AI (Gemini and Groq API key steps). Clear the API key when switching providers.

**What changed:**
- `AiConnectionForm.vue` — added `showHelp` ref; `watch(selectedProvider)` now also resets `apiKey` and `showKey`; template gains `ai-conn__key-header` row (label + help toggle button) and `ai-conn__help` collapsible block with provider-specific numbered steps and a privacy note; scoped styles add `__key-header`, `__help-toggle`, `__help`, `__help-title`, `__help-steps`, `__help-note`
- `CLAUDE.md` — AiConnectionForm architecture description updated

**Key decisions & why:**
- Help section is collapsible — the form is already compact inside a side panel; showing steps inline by default would push the Connect button out of view; toggling on demand keeps the default state clean
- Provider-specific steps shown via `v-if selectedProvider` — each provider has a different console URL and flow; a single generic description would be less useful
- Groq note ("Some models may require additional terms acceptance") shown only for Groq — it is Groq-specific and not applicable to Gemini
- Privacy note ("Keep your API key private") shown for both providers at the bottom of the help block — applies equally to both and reinforces good practice
- `showKey` also reset on provider switch — avoids the previous key being briefly visible in plain text if the user had toggled it on before switching


## [#87] Polish AI key instructions — unified wording and open/close transition
**Type:** update

**Summary:** Rewrote both provider instruction sets to share the same 4-step structure and phrasing, and added a max-height/opacity CSS transition on the help block open and close.

**Brainstorming:** The original Groq and Gemini steps had different lengths (6 vs 5 steps) and inconsistent phrasing — one started with "Go to", the other mixed imperatives. Aligning both to 4 steps with identical sentence patterns ("Go to X and sign in / Open Y / Click Z / Copy and paste below") makes them feel like the same product. The transition used Vue's named `<Transition name="help">` with max-height 0→300px and opacity 0→1; this is the standard CSS approach for height animations since `height: auto` cannot be transitioned directly.

**Prompt:** Make instructions more user friendly and similar in wording. Add a small transition when opening/closing instructions.

**What changed:**
- `AiConnectionForm.vue` — both instruction blocks rewritten to 4 parallel steps; Groq note reworded to plain English; `v-if` div wrapped in `<Transition name="help">`; `.help-enter-active/leave-active/enter-from/leave-to` transition rules added at bottom of scoped styles; split `.ai-conn` blocks consolidated into one

**Key decisions & why:**
- 4 steps for both providers — Groq's "give it a name" step folded into the Create step; both flows are structurally identical so the same count reinforces that
- `max-height: 300px` as the expanded value — tall enough for the longest content (~4 steps + note); an exact pixel value is required because CSS cannot transition to `max-height: auto`
- Transition rules placed outside `.ai-conn {}` — Vue's `<Transition>` injects classes on the element itself, not scoped to a parent selector; placing them at root level ensures the scoped attribute matches correctly


## [#88] Fix step numbering and strong color in AI key instructions
**Type:** fix

**Summary:** Restored ol numbering (hidden by Tailwind's base reset) and removed the indigo color from strong tags inside steps so they no longer look like links.

**Brainstorming:** Tailwind preflight sets list-style: none on all lists, which silently removed the decimal numbers from the ol. Fix: add list-style-type: decimal explicitly. The strong color was var(--color-title) (#a5b4fc, indigo) — the same hue used for links and headings — so bolded terms read as clickable. Fix: remove the color override entirely so strong inherits var(--color-text), keeping only font-weight: 600 for emphasis.

**Prompt:** Make steps numbered. Do not color text cause it looks like links.

**What changed:**
- `AiConnectionForm.vue` — `__help-steps` gains `list-style-type: decimal`; `strong` rule drops `color: var(--color-title)`, keeps `font-weight: 600`

**Key decisions & why:**
- list-style-type: decimal on the ol rule rather than a utility class — the steps are scoped SCSS; explicit property keeps it co-located with the other list styles
- strong color removed entirely rather than set to var(--color-text) — inheriting is simpler and ensures it always matches surrounding text even if the color token changes


## [#89] Smoother help section transition using CSS grid collapse
**Type:** fix

**Summary:** Replaced the max-height transition with the CSS grid-template-rows 0fr→1fr technique to get a transition that animates to the element's actual height rather than an arbitrary ceiling.

**Brainstorming:** max-height transition is jerky because the easing curve spans the full 0–300px range while the real content is ~160px tall — the element visually snaps through most of its travel instantly and the easing only appears near the top. The grid trick (grid-template-rows: 0fr → 1fr on the outer wrapper, min-height: 0 on the inner div) animates precisely to the content's natural height, making the easing feel correct all the way through. A wrapper div (ai-conn__help-collapse) is needed to separate the grid container (which gets the transition classes) from the visual box (ai-conn__help, which keeps its flex layout and visual styles). cubic-bezier(0.4, 0, 0.2, 1) is Material Design's standard easing — fast start, gentle deceleration.

**Prompt:** Make transition smoother.

**What changed:**
- `AiConnectionForm.vue` — help content wrapped in new `ai-conn__help-collapse` div; `<Transition>` now targets the collapse wrapper; `__help-collapse` style: `overflow: hidden`; `__help` gains `min-height: 0`; transition rules replaced: `max-height`/`overflow` → `grid-template-rows`/`cubic-bezier(0.4, 0, 0.2, 1)`

**Key decisions & why:**
- Wrapper div required — the grid container and the visual box (flex layout + padding + border) must be separate elements; combining them would fight over display type during the transition
- overflow: hidden on the wrapper, not the inner — the wrapper clips the growing/shrinking inner div; the inner div's own overflow: hidden clips text that would otherwise peek out at small heights before the border-radius takes effect
- cubic-bezier(0.4, 0, 0.2, 1) over plain ease — standard deceleration curve; feels intentional rather than mechanical


## [#90] Fix help section clipping at end of collapse transition
**Type:** fix

**Summary:** Moved display: grid and grid-template-rows: 1fr from the transition active classes to the permanent __help-collapse style so the grid is always set up, eliminating the layout discontinuity at the start and end of the animation.

**Brainstorming:** The previous approach set display: grid only during the transition active phases. This meant the wrapper was a plain div at rest and switched to a grid container at the moment the transition fired — causing a layout recalculation mid-animation that made it appear to "stop" just before fully collapsing. With grid always active on __help-collapse, the leave transition starts from a stable grid-template-rows: 1fr and animates smoothly to 0fr with no display-type change. The transition rules now only need to declare the transition property and the from/to states.

**Prompt:** It still looks like it is stopping just before collapsing, can we fix that?

**What changed:**
- `AiConnectionForm.vue` — `__help-collapse` gains `display: grid; grid-template-rows: 1fr`; `display: grid; grid-template-rows: 1fr` removed from `.help-enter-active/.help-leave-active`

**Key decisions & why:**
- Grid always on, not just during transition — removes the display-type switch that was causing the stutter at transition boundaries; the wrapper is always a single-row grid, so enter/leave just animate that one row between 0fr and 1fr


## [#91] Change key_metrics numeric fields to number type with euro formatting
**Type:** update

**Summary:** Updated `ExecutiveSummaryResponse.key_metrics` so that `total_spend`, `total_revenue`, `overall_roi`, and `total_conversions` are typed as `number` instead of `string`, and added euro/number formatters to the Summary panel for display.

**Brainstorming:** The fields were previously typed as `string` and the AI prompt schema already had them typed as `number`, so the type was inconsistent with the prompt. Changing to `number` aligns the TypeScript type with the prompt schema, enables proper formatting in the UI (euro symbol, locale-aware comma separators, ROI as multiplier), and removes the formatting responsibility from the AI model. The panel now owns all display formatting, which is cleaner.

**Prompt:** Update the ExecutiveSummaryResponse with `key_metrics` having `total_spend`, `total_revenue`, `overall_roi`, and `total_conversions` as numbers. Handle formatting of numbers to euro.

**What changed:**
- `features/ai-tools/types/index.ts` — `total_spend`, `total_revenue`, `overall_roi`, `total_conversions` in `key_metrics` changed from `string` to `number`
- `features/ai-tools/prompts/executive-summary-prompt.ts` — updated `JSON_OUTPUT_RULES`: replaced "ROI values should be expressed as percentages. Example: 490%" with "overall_roi must be returned as a decimal multiplier. Example: 4.9 for a 490% return."
- `features/ai-tools/components/AiSummaryPanel.vue` — added `formatEuro` (Intl.NumberFormat en-IE EUR, no decimals), `formatRoi` (appends "x"), `formatNumber` (Intl.NumberFormat en-IE) helpers; applied them to the four numeric key_metrics fields in the template
- `features/ai-tools/mocks/executive-summary-mocks.ts` — converted all 5 mock objects from string values to plain numbers for `total_spend`, `total_revenue`, `overall_roi`, `total_conversions`

**Key decisions & why:**
- `formatEuro` uses `en-IE` locale with `maximumFractionDigits: 0` — matches the locale already used in the panel's `formattedCacheTime` and produces `€102,800` style output without cents, appropriate for large budget figures
- ROI stored as multiplier (e.g., `2.1`) not percentage integer — consistent with how `roi` is stored throughout the rest of the codebase (`CampainSummaryTotals`, `BudgetOptimizerCampaign`, etc.)


## [#92] Format overall_roi as percentage in Executive Summary panel
**Type:** fix

**Summary:** Updated `formatRoi` in `AiSummaryPanel.vue` to display `overall_roi` as a percentage (e.g., `210%`) instead of a multiplier (e.g., `2.1x`).

**Brainstorming:** The AI returns `overall_roi` as a decimal multiplier (e.g., `2.1`). Multiplying by 100 and appending `%` in the formatter gives the correct percentage display without changing the type or prompt. `Math.round` avoids floating-point noise (e.g., `2.1 * 100 = 210.00000000000003`).

**Prompt:** When showing overall_roi add percentage symbol please.

**What changed:**
- `features/ai-tools/components/AiSummaryPanel.vue` — `formatRoi` updated: `\`${value}x\`` → `\`${Math.round(value * 100)}%\``

**Key decisions & why:**
- Conversion in formatter, not in type/prompt — the AI correctly returns a decimal multiplier; the display conversion is a UI concern only, so it belongs in the formatter
- `Math.round` — prevents floating-point artifacts in the displayed value


## [#93] Change new_roi_estimate to number type with percentage display in Budget Optimizer
**Type:** update

**Summary:** Updated `BudgetOptimizerResponse.expected_impact.new_roi_estimate` from `string` to `number`, fixed the prompt schema (removed erroneous quotes), added a decimal-multiplier output rule, and added `formatRoi` to the optimizer panel to display as percentage.

**Brainstorming:** Mirrors the same pattern applied to `overall_roi` in the Summary panel. `new_roi_estimate` was typed as `string` but the prompt schema had it quoted as `"number"` (a string description), which was inconsistent and would produce strings from the AI. Changing to a proper numeric type and formatting in the UI keeps all ROI values consistent across both panels.

**Prompt:** Update new_roi_estimate to number in BudgetOptimizerResponse and display the percentage symbol in the UI.

**What changed:**
- `features/ai-tools/types/index.ts` — `new_roi_estimate` changed from `string` to `number`
- `features/ai-tools/prompts/budget-optimization-prompt.ts` — fixed `"new_roi_estimate": "number"` → `"new_roi_estimate": number` in OUTPUT_SCHEMA; added rule: "new_roi_estimate must be returned as a decimal multiplier. Example: 4.9 for a 490% return."
- `features/ai-tools/components/AiOptimizerPanel.vue` — added `formatRoi` helper (`Math.round(value * 100)%`); applied to `new_roi_estimate` in the New ROI row
- `features/ai-tools/mocks/budget-optimizer-mocks.ts` — converted all 12 `new_roi_estimate` string values to plain numbers across all 5 mocks

**Key decisions & why:**
- Same `Math.round(value * 100)%` pattern as Summary panel — consistent ROI display format across both AI panels
- Decimal multiplier storage (e.g., `3.9`) not percentage integer — consistent with `roi` fields in `top_performers` and `underperformers` which are already stored as multipliers
