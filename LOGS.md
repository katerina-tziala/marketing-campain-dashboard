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


## [#94] Add model field to all AI response mocks
**Type:** update

**Summary:** Added the optional `model?: AiModel` field to all 10 mock response objects (5 BudgetOptimizerResponse + 5 ExecutiveSummaryResponse) so that mocks fully represent the complete type shape.

**Brainstorming:** Both response types include `model?: AiModel` which is stamped by the analysis store on real API responses. The mocks were missing this field, leaving them incomplete relative to the type definition. Two realistic mock models were defined (Gemini 2.0 Flash and Llama 3.3 70B via Groq) and alternated across mocks to reflect that either provider may generate a response.

**Prompt:** The mock data for BudgetOptimizerResponse and ExecutiveSummaryResponse do not include optional properties model?: AiModel and period?: string — update the mocks to include all fields.

**What changed:**
- `features/ai-tools/mocks/budget-optimizer-mocks.ts` — added `MOCK_GEMINI_FLASH` and `MOCK_GROQ_LLAMA` model constants; added `model` field to all 5 mocks (aggressiveReallocation/seasonalPivot/growthExpansion → Gemini Flash; conservativeOptimization/channelConsolidation → Groq Llama)
- `features/ai-tools/mocks/executive-summary-mocks.ts` — added `MOCK_GEMINI_FLASH` and `MOCK_GROQ_LLAMA` model constants; added `model` field to all 5 mocks (strongPortfolio/excellentPerformance/growthPhase → Gemini Flash; needsAttention/criticalState → Groq Llama)

**Key decisions & why:**
- Two providers represented — alternating Gemini and Groq across mocks reflects real usage and exercises both provider code paths during UI development
- Model constants defined at file level — avoids repetition and keeps mock model data maintainable in one place per file


## [#95] Extract spinner into BaseSpinner UI component
**Type:** refactor

**Summary:** Consolidated three duplicated inline spinner implementations into a single reusable `BaseSpinner.vue` component, removing repeated SCSS and `@keyframes spin` declarations.

**Brainstorming:** Three files each defined their own spinner span + scoped SCSS block + `@keyframes spin`: `AiConnectionForm.vue` (small white button spinner, 0.875rem), `AiOptimizerPanel.vue` and `AiSummaryPanel.vue` (larger indigo panel spinner, 1.5rem). The two visual variants map cleanly to two props: `size` (sm/md) and `variant` (white/indigo). Placing the component in `src/ui/` keeps it alongside `BaseButton` and `BaseModal` as a generic, app-agnostic primitive. `aria-hidden="true"` is baked in since all use sites are decorative. The animation keyframes now live in one place.

**Prompt:** Find all spinner instances across the codebase, create a reusable BaseSpinner UI component with size and variant props, replace all instances, and remove the duplicated local SCSS.

**What was built:**
- `src/ui/BaseSpinner.vue` — new component; `size` prop (sm: 0.875rem / md: 1.5rem, default md); `variant` prop (white / indigo, default indigo); `aria-hidden` baked in; single `@keyframes spin` scoped inside
- `src/ui/index.ts` — added `BaseSpinner` to barrel export
- `src/features/ai-tools/components/AiConnectionForm.vue` — replaced `<span class="ai-conn__spinner">` with `<BaseSpinner size="sm" variant="white" />`; removed `&__spinner` SCSS block and `@keyframes spin`
- `src/features/ai-tools/components/AiOptimizerPanel.vue` — replaced `<span class="ai-panel__spinner">` with `<BaseSpinner />`; removed `&__spinner` SCSS block and `@keyframes spin`
- `src/features/ai-tools/components/AiSummaryPanel.vue` — replaced `<span class="ai-panel__spinner">` with `<BaseSpinner />`; removed `&__spinner` SCSS block and `@keyframes spin`

**Key decisions & why:**
- Two props instead of one — `size` and `variant` are orthogonal; keeping them separate avoids a combinatorial named-variant explosion and allows mixing (e.g. a future sm/indigo spinner in a button)
- `aria-hidden` baked into the component — every current use site is purely decorative; callers that need an accessible label can override with an explicit attribute
- Scoped `@keyframes spin` in the component — Vue scoped styles do not scope keyframe names, but the animation is defined once in one file rather than scattered across three


## [#96] Rename BaseSpinner to Spinner with semantic variants and Tailwind @apply
**Type:** refactor

**Summary:** Renamed `BaseSpinner.vue` to `Spinner.vue`, replaced `white`/`indigo` variants with `primary`/`secondary`, moved all raw CSS values to Tailwind `@apply` rules, and added spinner color tokens and a custom animation to `tailwind.config.js`.

**Brainstorming:** The previous component had raw hex and rgba values hardcoded in SCSS with no connection to the design system. The goal was to: (1) rename to match the shorter convention requested, (2) express colors as semantic variants (`primary`/`secondary`) rather than literal color names, (3) push all color and size values into the Tailwind config so they are maintainable in one place, and (4) use `@apply` throughout so the SCSS is purely structural. The `spinner` color group in the config holds four tokens — arc and track for each variant — which map directly to the `border-t-*` (arc) and `border-*` (track) utilities. The `animate-spinner` custom animation reuses Tailwind's built-in `spin` keyframe at 0.7s rather than redefining `@keyframes spin` in the component.

**Prompt:** Rename the spinner component to just Spinner. Make variants primary and secondary. Use @apply rules instead of theming. Use the Tailwind library as much as possible. Add Tailwind classes that use those colors and move colors into the tailwind config.

**What changed:**
- `app/tailwind.config.js` — added `spinner` color tokens (`primary`, `primary-track`, `secondary`, `secondary-track`) and `animation.spinner` (`spin 0.7s linear infinite`)
- `src/ui/Spinner.vue` — new file replacing `BaseSpinner.vue`; variants renamed to `primary`/`secondary`; all SCSS replaced with `@apply` using Tailwind utilities and the new config tokens
- `src/ui/BaseSpinner.vue` — deleted
- `src/ui/index.ts` — updated export from `BaseSpinner` to `Spinner`
- `AiConnectionForm.vue` — updated import + usage: `variant="white"` → `variant="secondary"`
- `AiOptimizerPanel.vue` — updated import + usage
- `AiSummaryPanel.vue` — updated import + usage

**Key decisions & why:**
- Four distinct color tokens (`arc` + `track` per variant) — `border-t-*` sets the arc color and `border-*` sets the track; keeping them separate in the config lets each be adjusted independently without touching the component
- `animate-spinner` in config, not `@keyframes` in SCSS — Tailwind already defines the `spin` keyframe; adding a custom animation utility reuses it and keeps the component style-free of any keyframe declarations
- `primary`/`secondary` naming — decouples the variant label from any specific color, making the component resilient to theme changes


## [#97] Fix cross-file @apply of custom component classes in Vue scoped styles
**Type:** fix

**Summary:** Replaced `@apply card` and `@apply section-title` references in scoped Vue component styles with their expanded CSS equivalents, fixing a PostCSS error triggered when the Tailwind config change invalidated the cache and forced reprocessing.

**Brainstorming:** Tailwind v3 cannot resolve custom component classes (defined in `@layer components` in a separate file) when they appear in `@apply` inside another file's scoped style block — PostCSS processes each file independently. The classes `card` and `section-title` are defined in `src/styles/components.scss`. The config change from #96 invalidated Tailwind's cache, causing DashboardView.vue and KpiCard.vue to be reprocessed and the latent issue to surface. Fix: inline the CSS properties that each custom class would have contributed, using Tailwind utilities where possible.

**Prompt:** fix [postcss] The `card` class does not exist. If `card` is a custom class, make sure it is defined within a `@layer` directive.

**What changed:**
- `src/features/dashboard/DashboardView.vue` — `.chart-card`: replaced `@apply card p-5` with expanded CSS vars + Tailwind utilities; `.chart-card__title`: replaced `@apply section-title mb-4` with direct `color` + `@apply text-base mb-4 shrink-0`; `.table-section__title`: replaced `@apply section-title px-5 pt-5 pb-3` with direct `color` + `@apply text-base px-5 pt-5 pb-3`
- `src/features/dashboard/components/KpiCard.vue` — `.kpi-card`: replaced `@apply card rounded-md p-4` with expanded CSS vars + `@apply rounded-md shadow-sm p-4`

**Key decisions & why:**
- Expand inline rather than add `@layer components` wrappers in scoped blocks — `@layer` in scoped Vue styles interacts awkwardly with the scoped hash selector and is less readable; inlining is more explicit and avoids the coupling entirely
- Grep for all other `@apply` usages of custom component class names to catch all instances in one pass — found and fixed three locations across two files


## [#98] Fix animate-spinner @apply failure in Spinner.vue
**Type:** fix

**Summary:** Replaced `@apply animate-spinner` with Tailwind's built-in `animate-spin` plus an `animation-duration` override, and removed the unused `animation.spinner` extension from `tailwind.config.js`.

**Brainstorming:** Custom `animation` extensions added to `theme.extend` in the Tailwind config don't resolve reliably via `@apply` in scoped Vue component styles — same root cause as the `card`/`section-title` issue in #97. The fix: use the existing built-in `animate-spin` utility (which is always available to `@apply`) and override only the duration with a single `animation-duration: 0.7s` CSS property. This avoids the config extension entirely and keeps the component free of raw keyframe declarations.

**Prompt:** fix [postcss] The `animate-spinner` class does not exist.

**What changed:**
- `src/ui/Spinner.vue` — replaced `@apply animate-spinner` with `@apply animate-spin` + `animation-duration: 0.7s`
- `app/tailwind.config.js` — removed `animation.spinner` extension (no longer needed)

**Key decisions & why:**
- `animate-spin` + `animation-duration` override instead of a config extension — built-in utilities always resolve in `@apply`; the only custom part is the 0.7s duration, which is a one-liner override and needs no config entry


## [#99] Add dev-mode mocks for instant UI iteration
**Type:** update

**Summary:** Added three named boolean flags (DEV_MOCK_CAMPAIGNS, DEV_MOCK_CONNECTED, DEV_MOCK_ANALYSIS) to pre-load campaign data, mock the AI connection state, and cycle through mock AI responses — so the side panel UI is immediately accessible without CSV upload or API credentials.

**Brainstorming:** Working on side panel UI requires repeatedly going through CSV upload → AI connection form → analyze flow, which is slow. The fastest solution is to intercept at three points: (1) the campaign store initial state, (2) the AI store initial state, and (3) the AI analysis execution path. Each flag is a single boolean at the top of its store file with explicit TODO comments listing exactly what to remove when reverting. The mock analysis block sits inside executeAnalysis just before the real API call, runs a 700ms fake delay (so loading state is visible), then resolves with the next mock in a rotating index.

**Prompt:** Add mock data in the store so I do not have to upload the file each time. When opening side panel mock connection state. When clicking on analyze or generate iterate in the mock data and return mock data. Add todos to revert the code without breaking anything.

**What changed:**
- `app/src/stores/campaignStore.ts` — added DEV_MOCK_CAMPAIGNS flag + MOCK_CAMPAINS import; initializes campaigns and title refs with mock data when true
- `app/src/stores/aiStore.ts` — added DEV_MOCK_CONNECTED flag + MOCK_DEV_MODEL constant; initializes provider, apiKey, isConnected, models, selectedModel with mock values when true
- `app/src/stores/aiAnalysisStore.ts` — added DEV_MOCK_ANALYSIS flag + BUDGET_OPTIMIZER_MOCKS/EXECUTIVE_SUMMARY_MOCKS imports + optimizerMockIndex/summaryMockIndex refs; intercepts executeAnalysis before the real API call to return the next mock response in rotation with a 700ms delay

**Key decisions & why:**
- Named boolean flags at file-top rather than env variables — simpler to flip, no build config changes needed, and the TODO comments are co-located with the flag
- 700ms fake delay in mock analysis — makes the loading spinner visible so UI loading states can be inspected; short enough not to slow iteration
- Rotating index (modulo array length) rather than random — predictable cycling means each click shows the next mock in sequence, making it easy to see all five variants in order
- Mock model set to Gemini 2.0 Flash matching the existing budget-optimizer mock objects — consistent display_name shown in the "Generated at…" panel footer


## [#100] Remove ai-result-block card wrapper, use h4 section headings
**Type:** update

**Summary:** Replaced the `.ai-result-block` card wrapper (bordered box with background/padding) with a flat `.ai-section` element in both panels, and converted all section labels from `<span>` to `<h4>` tags; renamed "Executive Summary" to "Summary" in the Budget Optimizer panel.

**Brainstorming:** The card wrapper added visual noise with borders and backgrounds around every section. Removing it flattens the hierarchy so sections read as part of a continuous document rather than isolated boxes. The `<h4>` change is both semantic (correct heading level inside the panel) and visual — same indigo uppercase style, just a proper element. The rename from "Executive Summary" to "Summary" avoids redundancy since the panel itself is already called "Budget Optimizer".

**Prompt:** Remove .ai-result-block card. No need for additional wrapper. Each section should have an h4 tag. Rename Executive Summary to Summary for budget optimization.

**What changed:**
- `src/features/ai-tools/components/AiOptimizerPanel.vue` — replaced all `<div class="ai-result-block">` wrappers with `<section class="ai-section">`; replaced `<div class="ai-result-block__header"><span class="ai-result-block__label">` with `<h4 class="ai-section__title">`; renamed "Executive Summary" section label to "Summary"; replaced `.ai-result-block` CSS block with `.ai-section`
- `src/features/ai-tools/components/AiSummaryPanel.vue` — same structural changes across all seven sections; `.ai-result-block__note` renamed to `.ai-section__note`

**Key decisions & why:**
- `<section>` element instead of `<div>` for the wrapper — semantically correct for a named content region; pairs well with the `<h4>` heading inside it
- Kept the same visual style (uppercase, indigo, letter-spacing) on the `h4` — only the element type changes, not the appearance
- `.ai-section` has no border, background, or padding — content floats directly in the panel's flex column gap


## [#101] Increase section spacing in AI panels
**Type:** fix

**Summary:** Bumped `.ai-panel__result` gap from `spacing.4` (16px) to `spacing.6` (24px) in both panels to better visually separate the flat sections now that the card borders are gone.

**Brainstorming:** Without the card borders, sections needed more breathing room to read as distinct blocks. Increasing the flex gap on the result container is the minimal, correct change.

**Prompt:** Increase spacing where each h4 is present to separate sections a bit better.

**What changed:**
- `src/features/ai-tools/components/AiOptimizerPanel.vue` — `.ai-panel__result` gap: spacing.4 → spacing.6
- `src/features/ai-tools/components/AiSummaryPanel.vue` — `.ai-panel__result` gap: spacing.4 → spacing.6

**Key decisions & why:**
- Gap on the result container rather than margin on individual sections — single change, consistent across all sections, no per-section overrides needed


## [#102] Rearrange Portfolio Health section layout
**Type:** fix

**Summary:** Moved the health score badge to the top-right (where period was), placed period below the heading row, and kept the health label and reasoning underneath.

**Brainstorming:** Simple reordering — score badge is more meaningful alongside the heading than the period date. Period as a secondary meta line reads naturally below the title.

**Prompt:** Portfolio Health — move period under Portfolio Health, put health where period is now, health score underneath.

**What changed:**
- `src/features/ai-tools/components/AiSummaryPanel.vue` — reordered Portfolio Health section: score badge moves to `.ai-section__head` right slot; period becomes a standalone line below the head; health label and reasoning follow

**Key decisions & why:**
- Score badge in the head row pairs the key number with the section title — scannable at a glance
- Period as a sub-line reads as secondary metadata, which is what it is


## [#103] Stack health score label under badge
**Type:** fix

**Summary:** Grouped the health score label with its badge and stacked them vertically so the label ("Good", "Excellent" etc.) sits directly beneath the score box.

**Prompt:** Health score should appear underneath health box.

**What changed:**
- `src/features/ai-tools/components/AiSummaryPanel.vue` — wrapped score badge and label in `.ai-health-score`; changed `.ai-health-score` to `flex-direction: column; align-items: flex-end` so label renders below the badge, right-aligned

**Key decisions & why:**
- `align-items: flex-end` keeps both badge and label right-aligned, matching their position in the section header
- Reduced label font-size to `xs` to match the badge's compact scale


## [#104] Place period directly under Portfolio Health heading
**Type:** fix

**Summary:** Wrapped the h4 and period in a `.ai-section__title-group` column so the period sits flush beneath the heading text rather than below the full header row.

**Prompt:** Period should be exactly underneath the Portfolio Health.

**What changed:**
- `src/features/ai-tools/components/AiSummaryPanel.vue` — added `.ai-section__title-group` wrapper around h4 + period; added `flex-direction: column` CSS for that class

**Key decisions & why:**
- Left-side column group mirrors the same pattern used in `.ai-panel__titles` — heading + sub-label stacked vertically on the left, badge on the right


## [#105] Reduce health score box size
**Type:** fix

**Summary:** Shrunk the health score badge — score value from 2xl to lg, /100 suffix from sm to xs, padding tightened from spacing.1/spacing.3 to 2px/spacing.2, border-radius from lg to md.

**Prompt:** Make score box a bit smaller.

**What changed:**
- `src/features/ai-tools/components/AiSummaryPanel.vue` — reduced font sizes and padding on `.ai-health`

**Key decisions & why:**
- Scaled all dimensions together so the box shrinks proportionally without looking cramped


## [#106] Unify panel text color via Tailwind token
**Type:** update

**Summary:** Added `panel.text` color token to Tailwind config and replaced all `slate.300` / `#94a3b8` / `#b5bdc9` / `#8996a9` text color literals in both panel components with `theme('colors.panel.text')`.

**Prompt:** Change panel color of text to #b5bdc9. Add the color in tailwind.

**What changed:**
- `app/tailwind.config.js` — added `panel.text` color token
- `src/features/ai-tools/components/AiOptimizerPanel.vue` — replaced all body/secondary text color literals with `theme('colors.panel.text')`
- `src/features/ai-tools/components/AiSummaryPanel.vue` — same; also replaced the already-hardcoded `#b5bdc9` instances

**Key decisions & why:**
- Named token over a raw hex in CSS — single place to adjust the panel text color in the future
- Functional colors (red, green, amber, indigo badges; title var; white button text) left untouched — those are semantic, not general text


## [#107] Fix panel-text color token — use flat key
**Type:** fix

**Summary:** PostCSS can't resolve nested custom color paths like `theme('colors.panel.text')` at compile time; changed the Tailwind token to a flat `'panel-text'` key and updated all references in both panel files.

**Prompt:** fix [plugin:vite:css] 'colors.panel.text' does not exist in your theme config.

**What changed:**
- `app/tailwind.config.js` — `panel: { text }` → `'panel-text'` flat key
- `src/features/ai-tools/components/AiOptimizerPanel.vue` — `theme('colors.panel.text')` → `theme('colors.panel-text')` (all occurrences)
- `src/features/ai-tools/components/AiSummaryPanel.vue` — same

**Key decisions & why:**
- Flat key avoids the nested object path resolution issue in PostCSS `theme()` — consistent with how other multi-word tokens (e.g. `primary-track`) are defined in this config


## [#108] Intensify insight card colors in Executive Summary panel
**Type:** update

**Summary:** Increased the visual intensity of the four insight card types (performance, opportunity, warning, achievement) with higher-opacity backgrounds and borders, a solid 3px left accent border per type, and type-matched metric value text color.

**Brainstorming:** The insight cards were barely visible — background opacity 0.05 and border opacity 0.15 made each type almost indistinguishable. The goal was more vivid differentiation without making the cards feel heavy. Three levers: (1) raise bg/border opacity, (2) add a solid left accent border as a strong color anchor, (3) color the metric highlight value to match the card type. The left border approach is a common pattern in dark UIs for type-coded cards — it anchors the color identity without flooding the card. Metric value coloring reinforces the type identity on the data that matters most.

**Prompt:** In summary add more light/intense colors for the insights section.

**What changed:**
- `src/features/ai-tools/components/AiSummaryPanel.vue` — each insight modifier (`--performance`, `--opportunity`, `--warning`, `--achievement`) updated: bg opacity raised (0.05→0.10–0.12), border opacity raised (0.15→0.28–0.30), `border-left-width: 3px` + solid `border-left-color` added, `.ai-insight__metric-value` color scoped per type

**Key decisions & why:**
- Left accent border (3px solid, full opacity) gives a strong, immediate color signal — more effective than raising opacity on a thin 1px border
- Metric value colored per type — the data highlight is the most prominent text in the card, so matching it to the type color reinforces the semantic meaning
- Background raised to 0.10–0.12 (not higher) — keeps the card legible without competing with surrounding content in a tight panel


## [#109] Extract Badge UI component with Tailwind color tokens
**Type:** refactor

**Summary:** Extracted the duplicated `ai-badge` / `ai-confidence` scoped styles from both AI panel components into a reusable `Badge.vue` UI component, moved badge colors into `tailwind.config.js`, and applied `@apply`-based styling with `capitalize` text transform.

**Brainstorming:** Both `AiOptimizerPanel` and `AiSummaryPanel` contained identical `.ai-badge` style blocks with four color variants, plus `AiOptimizerPanel` had a separate `.ai-confidence` block that was structurally identical. All three were prime candidates for extraction into a shared component. The Badge component takes a `variant` prop (`success | warning | danger | info`), maps the confidence/action/effort/urgency semantics to variants in the parent via small helper functions, uses `@apply` for all Tailwind utilities, and adds `capitalize` so text casing is handled by the component rather than the caller. Colors moved to `tailwind.config.js` as flat `badge-*` keys (consistent with the `panel-text` flat-key pattern) so they work with Tailwind's `bg-color/opacity` JIT syntax in `@apply`.

**Prompt:** There are many instances of ai-badge. Create a ui component badge with all variations. All text should be with first letter of each word capitalized. Use @apply rules for styling and move colors config in tailwind.config.

**What was built / What changed:**
- `app/src/ui/Badge.vue` — new component; `variant` prop (`success | warning | danger | info`); `@apply`-based styles; `capitalize` applied globally on `.badge`
- `app/src/ui/index.ts` — exports `Badge` and `BadgeVariant`
- `app/tailwind.config.js` — added `badge-success`, `badge-warning`, `badge-danger`, `badge-info` flat color tokens
- `app/src/features/ai-tools/components/AiOptimizerPanel.vue` — imported `Badge` + `BadgeVariant`; replaced `confidenceClass/actionBadgeClass/effortBadgeClass` with `confidenceVariant/actionVariant/effortVariant` returning `BadgeVariant`; swapped three `<span :class>` usages for `<Badge :variant>`; removed `.ai-confidence` and `.ai-badge` style blocks
- `app/src/features/ai-tools/components/AiSummaryPanel.vue` — imported `Badge` + `BadgeVariant`; replaced `urgencyBadgeClass` with `urgencyVariant`; swapped `<span :class>` for `<Badge :variant>`; removed `.ai-badge` style block

**Key decisions & why:**
- Flat `badge-*` token keys in Tailwind config — consistent with existing `panel-text` flat-key pattern; required for PostCSS `theme()` resolution and Tailwind JIT `bg-color/opacity` syntax in `@apply`
- `capitalize` on the component — removes the responsibility from every caller; single source of truth for badge text casing
- Helper functions return `BadgeVariant` instead of a class string — type-safe, no string concatenation, template is cleaner
- `ai-confidence` merged into `Badge` — structurally identical to `ai-badge`; the semantic difference (confidence level) is now expressed via the variant prop value, not a separate CSS class hierarchy


## [#110] Modularize SCSS and refactor UI component layer
**Type:** refactor

**Summary:** Split the monolithic `components.scss` into individual SCSS partials per concern, extracted a `utilities.scss` entry file for utility classes, promoted `Tabs` to a generic reusable UI component (replacing the feature-specific `AiTabs.vue`), removed `Badge.vue` in favour of global CSS classes, added `roi.ts` shared utilities, extended `Spinner` with larger size variants, and cleaned up Tailwind tokens.

**Brainstorming:** The single `components.scss` file was growing unwieldy — every component category dumped styles into one file, making it hard to navigate and reason about. Splitting by concern (button, badge, card, form, modal, table, roi, ai-summary, scrollbar) follows the same pattern already used in most style systems: one partial per semantic area, composed via a top-level entry file. A separate `utilities.scss` entry mirrors the Tailwind layer split (components vs utilities). `AiTabs.vue` was feature-locked; `Tabs.vue` in the UI library is generically useful — takes a typed `Tab<T>[]` prop with optional icon. `Badge.vue` as a Vue component added component overhead for what is essentially a styled `<span>`; moving to global `.badge` + `.badge-text`/`.badge-background` modifier classes (extended via `@extend`) is simpler and works in any template without an import. `roi.ts` extracts three ROI helpers (`roiValue`, `roiClass`, `formatROI`) that were likely duplicated across components. `Spinner` gained `lg/xl/xxl` sizes to cover full-panel loading states.

**Prompt:** Split components.scss into individual SCSS partials per concern (badge, button, card, forms, modal, roi, scrollbar, table, ai-summary). Add a utilities.scss entry file for utility-layer classes. Replace the feature-specific AiTabs.vue with a generic reusable Tabs.vue in the UI library. Remove Badge.vue and move badge styling to global CSS classes. Add roi.ts shared utilities (roiValue, roiClass, formatROI) to common/utils. Extend Spinner with lg/xl/xxl size variants. Standardize icon sizing via inline style. Clean up Tailwind tokens — remove badge-* and panel-text flat keys, add danger.-5p, typography.intense, surface-border.secondary.

**What changed:**
- `app/src/styles/components.scss` — converted to entry file; replaced inline styles with `@use` imports for each partial
- `app/src/styles/utilities.scss` — new entry file; imports `_scrollbar`
- `app/src/styles/_ai-summary.scss` — new partial; `.ai-panel`, `.ai-section`, `.ai-section__analysis-details`
- `app/src/styles/_badge.scss` — new partial; `.badge`, `.badge-text`, `.badge-background`; variants: success/warning/danger/info/opportunity; uses `@extend`
- `app/src/styles/_button.scss` — new partial; `.btn` base + `.btn-primary`, `.btn-icon-secondary`, `.btn-secondary-outline`, `.btn-destructive-small`, `.btn-small`
- `app/src/styles/_card.scss` — new partial; `.card`, `.card-secondary` with sub-elements
- `app/src/styles/_forms.scss` — new partial; full form class set migrated from old `components.scss`
- `app/src/styles/_modal.scss` — new partial; `.modal__body`, `.modal__footer`
- `app/src/styles/_roi.scss` — new partial; `.roi-text` with `.positive`/`.warning`/`.negative` modifiers
- `app/src/styles/_scrollbar.scss` — new partial; `.scrollbar-stable`, `.scrollbar-stable-both`, `.scrollbar-on-surface`
- `app/src/styles/_table.scss` — new partial; `.data-table` and element classes migrated from old `components.scss`
- `app/src/style.scss` — updated to import both `styles/components` and `styles/utilities`
- `app/src/ui/Tabs.vue` — new generic tab component; `Tab<T>` type exported; `tabs` + `activeTab` props; `change` emit; optional icon per tab via `Component`; auto-selects first tab on mount
- `app/src/ui/types/` — new directory stub for future shared UI types
- `app/src/ui/Badge.vue` — deleted; badge styling moved to global CSS classes in `_badge.scss`
- `app/src/features/ai-tools/components/AiTabs.vue` — deleted; replaced by generic `Tabs.vue`
- `app/src/ui/BaseButton.vue` — refined with scoped `@apply` styles per variant
- `app/src/ui/BaseModal.vue` — updated to use `.btn-icon-secondary` global class for close button
- `app/src/ui/Spinner.vue` — added `lg`, `xl`, `xxl` size variants
- `app/src/ui/icons/*.vue` — standardized all icons with `style="width: 1em; height: 1em; display: inline-block;"` inline sizing
- `app/src/ui/index.ts` — removed `Badge`/`BadgeVariant` exports; added `Tabs` + `Tab` type exports
- `app/src/common/utils/roi.ts` — new shared utility; `roiValue()`, `roiClass()`, `formatROI()`
- `app/tailwind.config.js` — removed `badge-*` and `panel-text` flat tokens; added `danger.-5p`, `typography.intense`, `surface-border.secondary`, explicit `black`/`white` tokens

**Key decisions & why:**
- One partial per concern — mirrors Tailwind's own layer structure; each file is self-contained and easy to locate
- `@extend` in `_badge.scss` — avoids duplicating the full modifier list on `.badge`; works correctly within a single `@layer components` block
- `Tabs.vue` in `ui/` not `ai-tools/` — the component has no AI-specific logic; keeping it in the ui library makes it available to any future feature
- Badge as CSS classes not a component — no import overhead, works with any element, easier to compose with other classes
- `roi.ts` in `common/utils/` — ROI calculation is domain logic shared across dashboard and AI panels; belongs with other shared utils alongside `math.ts`
- Icon sizing via inline style — consistent 1em × 1em sizing that inherits font-size from parent; avoids needing a Tailwind class on every usage site


## [#111] Apply global CSS classes across csv-file, dashboard, and shell components
**Type:** refactor

**Summary:** Replaced inline/scoped button and layout styles in csv-file, dashboard, and shell components with the global CSS classes introduced in the SCSS modularization — global btn-*, modal-*, data-table, badge, card, and form classes now used consistently throughout the app.

**Brainstorming:** With the SCSS partials established in #110, the remaining work was to wire the consumer components up to those classes. Each component had a mix of: raw `<button>` elements with no shared class, `BaseButton` used inconsistently, and scoped styles that duplicated what the new globals provide. The goal was consistency — same class names in the same situations everywhere — without breaking component-specific layout logic (dropzone, error table sticky headers, responsive footer stacking) which stays scoped. `ReplaceDataModal` became the cleanest example: zero scoped styles, purely composed from `BaseModal` + global utility classes. `AppShell` gained the `app-shell__left` wrapper to support the push-drawer layout at lg+, and `app-shell__main` as a constrained max-width content area. `CampaignTable` channel cell moved from a `Badge` component import to a `.badge.info` class pair — consistent with how badge-as-class works elsewhere post #110.

**Prompt:** Apply the global CSS class system (btn-*, modal-*, data-table, badge, card, form classes) consistently across all components in the csv-file, dashboard, and shell folders. Use BaseButton in csv-file components. Use raw button elements with global classes in dashboard and shell. Remove redundant scoped styles where global classes now cover the same ground. Update AppShell layout with app-shell__left and app-shell__main wrappers. Update CLAUDE.md and write a log entry.

**What changed:**
- `app/src/shell/AppShell.vue` — added `app-shell__left` wrapper (flex col, overflow-y auto); added `app-shell__main` inner wrapper (max-width 1280px, margin auto, overflow-x clip); header Upload CSV button uses `.btn-secondary-outline`; gradient title (indigo→pink via `-webkit-background-clip`)
- `app/src/features/dashboard/DashboardView.vue` — AI button uses raw `<button class="btn-primary">`; table section uses global `.card` class; `BaseButton` import removed
- `app/src/features/dashboard/components/CampaignTable.vue` — uses global `.data-table`, `.data-table__th`, `.data-table__tr`, `.data-table__td` classes throughout; channel cell uses `.badge.info` global CSS class pair; ROI coloring via scoped modifier classes
- `app/src/features/csv-file/components/CsvUploadForm.vue` — `isLoading` prop added; all buttons via `BaseButton`; global `form-field`, `form-control`, `form-control--error` classes; footer stacks vertically at <480px
- `app/src/features/csv-file/components/CsvErrorTable.vue` — prop type updated to `CsvRowError[]`; all buttons via `BaseButton`; global `data-table` classes throughout; Proceed button conditionally shown when `validCampaigns.length > 0`
- `app/src/features/csv-file/components/ReplaceDataModal.vue` — wraps `BaseModal`; uses global `.modal__body`, `.modal__footer`, `.btn-secondary-outline`, `.btn-primary`; all scoped styles removed
- `app/src/features/csv-file/types/index.ts` — `CsvRowError` (row/column/issue) extracted as a standalone interface; `CsvValidationErrorType` added as a union type; `CsvValidationError` updated with `rowErrors?: CsvRowError[]`

**Key decisions & why:**
- `BaseButton` in csv-file, raw `<button class="btn-*">` in dashboard/shell — csv-file actions benefit from BaseButton's variant/disabled props; dashboard and shell have simpler, one-off buttons where a class is sufficient
- `app-shell__left` wrapper — required by the push-drawer layout: the drawer is a sibling at flex-row level, and the left column must scroll independently; without this wrapper the main content would expand behind the open drawer
- `app-shell__main` max-width constraint — 1280px cap with `margin: 0 auto` centers the dashboard on wide screens; `overflow-x: clip` prevents horizontal scrollbar from chart overflow
- `.badge.info` class pair in CampaignTable — avoids importing a Vue component just for a styled span; consistent with how badges are used in the AI panels post-#110
- `ReplaceDataModal` zero scoped styles — the modal shell, body, footer, and buttons are all covered by global classes; there is nothing component-specific left to scope


## [#112] Apply global CSS classes and ui library components across ai-tools components, types, mocks, prompts, and store
**Type:** refactor

**Summary:** Wired the global CSS class system and refactored ui library components (Tabs, badge classes, roi utilities, scrollbar utilities) throughout all remaining changed files — ai-tools components, types, mocks, prompts, and aiAnalysisStore — and extracted BadgeVariant into the ui/types layer.

**Brainstorming:** The ai-tools components were the largest remaining consumer of the old patterns: Badge component imports, AiTabs component, inline badge class strings, and scoped button styles. Each panel component needed to switch from `<Badge :variant>` to `.badge` + `BadgeVariant` class pair, which required `BadgeVariant` to be importable from `ui/types/badge-variant.ts`. `AiSummaryPanel` additionally needed `roiClass` from `common/utils/roi` for ROI metric coloring — the shared utility introduced in #110. `AiToolsContent` replaced the deleted `AiTabs.vue` with the generic `Tabs` component from the ui library, and gained `scrollbar-stable scrollbar-on-surface` utility classes on its scroll container. `AiToolsDrawer` width was adjusted from 400px to 30rem. The store gained `errorFallbackMessage` per tab state and `clearStateForDisconnect` as a named alias for `clearStateForNewCSV`. The types file had `Correlation` extracted as a shared type used by both response shapes, and `ExecutiveSummaryResponse` gained `additional_channels_note?` and a stricter icon union. The executive summary mocks were enriched with model and period stamps matching the real response shape.

**Prompt:** Apply the global CSS class system (btn-*, badge class pairs, card-secondary, form classes, scrollbar utilities) and ui library components (Tabs, BadgeVariant type) consistently across all ai-tools components. Replace Badge component usage with .badge + variant class pairs. Replace AiTabs with generic Tabs. Extract BadgeVariant to ui/types/badge-variant.ts. Use roiClass from common/utils/roi in AiSummaryPanel. Update AiConnectedStatus to use btn-destructive-small. Update AiConnectionForm to use global form/button classes. Update CLAUDE.md and write a log entry.

**What changed:**
- `app/src/ui/types/badge-variant.ts` — new file; exports `BadgeVariant` type (`'success' | 'warning' | 'danger' | 'info' | 'opportunity'`)
- `app/src/features/ai-tools/components/AiConnectedStatus.vue` — Disconnect uses `.btn-destructive-small`; green dot via `::before` pseudo-element + `shadow-connection`
- `app/src/features/ai-tools/components/AiConnectionForm.vue` — uses global `form`, `form-field`, `form-field__label`, `form-control`, `form-control--error`, `form-field__error-container`, `form-field__error`, `form-field__error-hint` classes; help toggle + key show/hide use `.btn-icon-secondary.btn-small`; Connect uses `.btn-primary`; help section uses `.card-secondary`
- `app/src/features/ai-tools/components/AiToolsContent.vue` — replaced `AiTabs` import with generic `Tabs` from ui library; tabs array defined locally with FileTextIcon/SlidersIcon icons; close button uses `.btn-icon-secondary`; scroll container uses `.scrollbar-stable.scrollbar-on-surface`
- `app/src/features/ai-tools/components/AiToolsDrawer.vue` — push drawer open width changed from 400px to `w-[30rem]`
- `app/src/features/ai-tools/components/AiOptimizerPanel.vue` — Analyze button uses `.btn-primary`; Badge component replaced with `.badge` + `BadgeVariant` class pair throughout; `BadgeVariant` imported from `ui/types/badge-variant`; Spinner `size="xxl"`; quick win detail row uses `.badge-background.badge-text.opportunity`
- `app/src/features/ai-tools/components/AiSummaryPanel.vue` — Summarize button uses `.btn-primary`; Badge component replaced with `.badge` + `BadgeVariant` class pairs; `roiClass` imported from `common/utils/roi` for ROI metric coloring; `.roi-text` class applied to ROI values; insight metric highlight uses `.badge-background.badge-text`; `BadgeVariant` imported from `ui/types/badge-variant`
- `app/src/features/ai-tools/types/index.ts` — `Correlation` extracted as a named shared type (used by both BudgetOptimizerResponse and ExecutiveSummaryResponse); `ExecutiveSummaryResponse` gained `additional_channels_note?` and stricter icon union; `AiAnalysisError` confirmed with `code` + `message` fields
- `app/src/features/ai-tools/mocks/executive-summary-mocks.ts` — each mock stamped with `model` (MOCK_GEMINI_FLASH or MOCK_GROQ_LLAMA) and `period` ('Q1 2026' / 'Q2 2026'); full field coverage matching real response shape
- `app/src/features/ai-tools/prompts/budget-optimization-prompt.ts` — imports updated to align with refactored prompt-utils exports
- `app/src/features/ai-tools/prompts/executive-summary-prompt.ts` — imports updated to align with refactored prompt-utils exports
- `app/src/stores/aiAnalysisStore.ts` — `errorFallbackMessage` added to per-tab state; `clearStateForDisconnect` defined as named alias for `clearStateForNewCSV`; `setActiveTab` cancels in-flight request on previous tab before switching; `DEV_MOCK_ANALYSIS` flag (currently `true`) cycles through 5 mocks per tab with 700ms simulated delay; `optimizerMockIndex` + `summaryMockIndex` refs for mock cycling

**Key decisions & why:**
- `BadgeVariant` in `ui/types/badge-variant.ts` not in `ai-tools/types` — badge variants are a ui concern, not an AI concern; placing the type in the ui layer keeps it importable by any future consumer without an ai-tools dependency
- `.badge` + class pair instead of `<Badge>` component — consistent with the #110 decision; removes Vue component overhead for what is a styled span; the two-class pattern (`.badge variant`) is more composable and readable in templates
- `roiClass` imported from shared util in `AiSummaryPanel` — DRY: the same ROI → color logic exists in `CampaignTable` locally and now in the summary panel via the shared util; `CampaignTable` still uses local helpers (not yet migrated to the shared util)
- `Correlation` extracted as shared type — both response types use the identical `{ finding, implication }` shape; a named type removes the duplication and makes the intent explicit
- `clearStateForDisconnect` as a named alias — caller intent is clearer than calling `clearStateForNewCSV` from a disconnect handler; behavior is identical today but can diverge independently if needed


## [#113] Reorganize styles into components/ and utilities/ subfolders
**Type:** refactor

**Summary:** Moved SCSS partials from a flat `styles/` directory into `styles/components/` and `styles/utilities/` subfolders, promoted `_roi.scss` to a utility, and introduced barrel `index.scss` files at each level.

**Brainstorming:** The flat layout mixed component-scoped styles with utility-style rules in one directory with no structural signal of their role. Moving to two named subfolders makes the layer intent explicit and mirrors the Tailwind layer model. `_roi.scss` belongs in utilities because `.roi-text` and its modifiers are stateless, single-purpose color/weight helpers — not component definitions. A barrel per folder plus a root barrel keeps the import surface in `style.scss` to a single line. SASS `@use` namespace collision with two `index.scss` files was resolved by aliasing each with an explicit namespace (`as components`, `as utilities`) in the root barrel.

**Prompt:** Refactor the styles folder: roi should be a utility. Group styles in 2 folders utilities and components. Create a barrel file in each folder. Create a barrel file in the styles folder that exports both layers.

**What changed:**
- `app/src/styles/components/` — new folder; received `_ai-summary.scss`, `_badge.scss`, `_button.scss`, `_card.scss`, `_forms.scss`, `_modal.scss`, `_table.scss` (moved from flat root)
- `app/src/styles/components/index.scss` — new barrel; `@use` all component partials
- `app/src/styles/utilities/` — new folder; received `_scrollbar.scss` (moved) and `_roi.scss` (moved + layer updated)
- `app/src/styles/utilities/_roi.scss` — `@layer components` changed to `@layer utilities`
- `app/src/styles/utilities/index.scss` — new barrel; `@use ./roi` and `@use ./scrollbar`
- `app/src/styles/index.scss` — new root barrel; `@use ./components/index as components` + `@use ./utilities/index as utilities`
- `app/src/styles/components.scss` — deleted (replaced by `components/index.scss`)
- `app/src/styles/utilities.scss` — deleted (replaced by `utilities/index.scss`)
- `app/src/style.scss` — two `@use` lines replaced with single `@use './styles/index'`
- `CLAUDE.md` — architecture section updated to reflect new folder structure

**Key decisions & why:**
- `_roi.scss` promoted to `@layer utilities` — `.roi-text` and its modifiers are stateless color/weight helpers, not component definitions; utilities layer cascades after components which is correct for modifier-style classes
- Explicit namespace aliases (`as components`, `as utilities`) in root barrel — SASS `@use` prohibits two modules sharing the same auto-derived namespace; aliasing is the minimal fix with zero impact on CSS output
- Barrel files use `@use` not `@forward` — all partials are pure CSS side-effects with no exported SCSS members; `@use` is sufficient and avoids unnecessarily widening the member surface


## [#114] Extract shared panel state into AiAnalysisState component
**Type:** refactor

**Summary:** Extracted the duplicated header, notice, idle, loading, error, and response-meta blocks from AiOptimizerPanel and AiSummaryPanel into a new shared AiAnalysisState wrapper component with a default slot for panel-specific result content.

**Brainstorming:** Both panels were near-identical in structure — only the title, button label, idle/loading text, and result sections differed. Every state block (token-limit notice, idle text, spinner, error box, response metadata) was copy-pasted. The natural boundary is: AiAnalysisState owns the shell and all state UI; each panel owns its result rendering in the default slot. Props cover the variable parts; the slot covers the result content. No BEM in AiAnalysisState per project direction to move away from BEM styling.

**Prompt:** AiOptimizerPanel and AiSummaryPanel share the same logic of showing errors, and content. Extract this logic to a shared component with the name AiAnalysisState. Do not use BEM for styling.

**What was built:**
- `app/src/features/ai-tools/components/AiAnalysisState.vue` — new shared wrapper; props: title, actionLabel, idleText, loadingText, status, error, errorFallback, tokenLimitReached, isButtonDisabled, hasResult, formattedCacheTime, modelName?; emit: analyze; default slot for result content; scoped non-BEM styles (panel-head, panel-title, idle-text, loader, loader-text, notice, notice-text, notice-hint, error-box, error-message, error-hint, result, response-meta, response-meta-text, response-meta-disclaimer, response-meta-fallback)
- `app/src/features/ai-tools/components/AiOptimizerPanel.vue` — refactored to wrap AiAnalysisState; retains only optimizer-specific computeds, badge helpers, and formatters; result sections moved into default slot; duplicate state/style blocks removed
- `app/src/features/ai-tools/components/AiSummaryPanel.vue` — refactored to wrap AiAnalysisState; retains only summary-specific computeds, badge helpers, and formatters; result sections moved into default slot; duplicate state/style blocks removed
- `CLAUDE.md` — architecture updated with AiAnalysisState entry and revised panel descriptions

**Key decisions & why:**
- `hasResult: boolean` prop instead of passing response — AiAnalysisState does not need to know the response shape; the parent derives `!!response` and passes the boolean, keeping the wrapper type-agnostic
- `modelName?: string` instead of full model object — only the display name is rendered; avoids coupling the wrapper to AiModel type
- Non-BEM scoped classes in AiAnalysisState — user direction to move away from BEM; plain descriptive class names (panel-head, loader, error-box, etc.) are scoped so no global collision risk
- Default slot for result — each panel's result markup is structurally different enough that a slot is cleaner than props; panels retain full control of their rendering


## [#115] Replace BaseButton with plain buttons and global button classes
**Type:** refactor

**Summary:** Removed the BaseButton component and replaced all usages with plain `<button>` elements using the global `.btn-primary` and `.btn-secondary-outline` classes; ghost variant mapped to secondary outline.

**Brainstorming:** BaseButton was a thin wrapper that added no value once global button classes existed — it simply replicated `.btn-primary` and a ghost style that is now `.btn-secondary-outline`. Eliminating the wrapper removes a layer of indirection, makes the class applied to each button explicit in the template, and reduces bundle size. The `:deep(.base-btn)` selectors in EmptyState were replaced with `> button` since the buttons are now direct children of the scoped element.

**Prompt:** Find all BaseButton instances and replace them with buttons and proper styles from the button component in the styles folder. Ghost instances should be secondary buttons now.

**What changed:**
- `app/src/ui/BaseButton.vue` — deleted
- `app/src/ui/index.ts` — removed BaseButton export
- `app/src/shell/AppShell.vue` — removed unused BaseButton import (template already used a plain button)
- `app/src/features/dashboard/components/EmptyState.vue` — replaced two BaseButton instances with plain buttons (.btn-secondary-outline, .btn-primary); replaced :deep(.base-btn) selectors with > button
- `app/src/features/csv-file/components/CsvUploadForm.vue` — replaced three BaseButton instances with plain buttons; removed BaseButton import
- `app/src/features/csv-file/components/CsvErrorTable.vue` — replaced three BaseButton instances with plain buttons; removed BaseButton import
- `CLAUDE.md` — removed BaseButton entry, updated CsvUploadForm/CsvErrorTable descriptions, updated ui/index.ts note

**Key decisions & why:**
- `ghost` → `.btn-secondary-outline` — the ghost style (transparent bg, primary border) matches the existing secondary outline class exactly; no visual change
- `> button` instead of a shared class in EmptyState — the two buttons are the only direct children of `.empty-state__actions`; element selector is more direct and requires no extra markup
- Deleted BaseButton.vue entirely — no remaining usages; keeping unused components creates maintenance burden and misleads future readers about available abstractions



## [#116] Remove BEM from forms SCSS and update consumers
**Type:** refactor

**Summary:** Replaced BEM element and modifier class names in `_forms.scss` with flat descriptive names, and updated the two components that consume those classes.

**Brainstorming:** The forms SCSS used BEM element syntax (`form-field__label`, `form-field__error-container`, `form-field__error`, `form-field__error-hint`) and one BEM modifier (`form-control--error`). These are global utility classes, not block-scoped component styles, so BEM is the wrong convention here — flat names like `.field-label` and `.input-error` are cleaner and consistent with the direction established in other recent refactors (e.g. AiAnalysisState using plain scoped class names).

**Prompt:** Update the forms file in styles/components to not use BEM. Update the respective components that use this.

**What changed:**
- `app/src/styles/components/_forms.scss` — renamed `.form-field` → `.field`, `.form-field__label` → `.field-label`, `.form-control--error` → `.input-error`, `.form-field__error-container` → `.field-errors`, `.form-field__error` → `.field-error`, `.form-field__error-hint` → `.field-error-hint`; `.form` and `.form-control` unchanged
- `app/src/features/ai-tools/components/AiConnectionForm.vue` — updated all class references to match new names
- `app/src/features/csv-file/components/CsvUploadForm.vue` — updated all class references to match new names
- `CLAUDE.md` — updated `_forms.scss` architecture entry and component descriptions for AiConnectionForm and CsvUploadForm

**Key decisions & why:**
- `.form` and `.form-control` kept unchanged — neither uses `__` or `--` BEM syntax; they are already flat
- `.input-error` (not `.form-control-error`) — names the state, not the base class it modifies; reads as "this input has an error" rather than implying it extends `.form-control`
- `.field-errors` (not `.field-error-container`) — shorter and self-descriptive; `-container` suffix adds no meaning


## [#117] Extract password input into reusable ui component with slot-driven error
**Type:** refactor

**Summary:** Extracted the API key input with show/hide toggle from AiConnectionForm into a generic PasswordInput component in the ui lib, with EyeIcon/EyeOffIcon icons and an error slot instead of a hasError prop.

**Brainstorming:** The key-wrap block in AiConnectionForm (input + toggle button + scoped show/hide state) was self-contained and generically useful for any secret/password field. Extracting it removes local state and styling from AiConnectionForm and makes the pattern reusable. For the error state, a hasError boolean prop was considered but rejected — it would require the parent to maintain a redundant boolean alongside the actual error content. A named error slot is cleaner: the parent projects the error markup directly, and the component detects whether the slot has meaningful content (filtering Vue Comment nodes produced by v-if="false") to apply the input-error class automatically.

**Prompt:** Extract the ai-conn__key-wrap content into a password input component in the ui lib. Create icons for hide and show button. Instead of hasError, add content projection so we pass error from places where we use it.

**What was built / What changed:**
- `app/src/ui/icons/EyeIcon.vue` — new; inline SVG eye icon (show password), Lucide style
- `app/src/ui/icons/EyeOffIcon.vue` — new; inline SVG eye-off icon (hide password), Lucide style
- `app/src/ui/icons/index.ts` — added EyeIcon and EyeOffIcon exports
- `app/src/ui/PasswordInput.vue` — new; v-model input with show/hide toggle (EyeIcon/EyeOffIcon), named error slot, hasError computed from slot content via Comment node filtering, scoped non-BEM styles; props: modelValue, id?, placeholder?, disabled?, autocomplete? (default "off"); spellcheck hardcoded false
- `app/src/ui/index.ts` — added PasswordInput export
- `app/src/features/ai-tools/components/AiConnectionForm.vue` — replaced key-wrap block with PasswordInput; error passed via #error slot; removed showKey ref and watch reset; removed ai-conn__key-wrap, ai-conn__input, ai-conn__toggle scoped style blocks
- `CLAUDE.md` — added EyeIcon/EyeOffIcon/PasswordInput to architecture; updated AiConnectionForm description

**Key decisions & why:**
- Named error slot over hasError prop — parent owns both the condition and the markup; component stays generic and doesn't prescribe error message format
- Comment node filtering for hasError detection — v-if="false" on a slot template produces a Comment vnode, not an empty slot; filtering these gives reliable detection without requiring the parent to pass an extra boolean
- spellcheck hardcoded false — never appropriate for a password/secret field; not a prop
- Non-BEM scoped class names (password-input, input-field, toggle-btn) — consistent with project direction established in recent refactors


## [#118] Extract radio toggle into reusable RadioToggle ui component
**Type:** refactor

**Summary:** Extracted the provider pill-toggle from AiConnectionForm into a generic RadioToggle component in the ui lib, driven by an options array with dynamic grid columns.

**Brainstorming:** The radio toggle in AiConnectionForm (pill-style segment control) had its markup and all three related scoped style blocks (.ai-conn__radios, .radio-text, input[type='radio']) embedded in the feature component. Extracting it makes the pattern reusable for any pill-style radio group. grid-template-columns is set via inline style based on options.length so the component works for 2, 3, or more options without Tailwind arbitrary-value hacks. providerOptions is defined as an explicit array (not Object.entries(PROVIDER_LABELS)) because PROVIDER_LABELS has gemini first while the UI requires Groq first — relying on object key order would have silently produced the wrong display order.

**Prompt:** Do the same for the radio toggle in AiConnectionForm. Create a radio-toggle component in the ui.

**What was built / What changed:**
- `app/src/ui/RadioToggle.vue` — new; pill-style radio group; props: modelValue (string), options ({value,label}[]), name?; dynamic grid-template-columns via inline style; scoped non-BEM styles (radio-toggle, option-label)
- `app/src/ui/index.ts` — added RadioToggle export
- `app/src/features/ai-tools/components/AiConnectionForm.vue` — replaced inline radio markup with RadioToggle; added providerOptions constant (explicit order: groq first); removed ai-conn__radios, .radio-text, input[type='radio'] scoped style blocks
- `CLAUDE.md` — added RadioToggle to architecture; updated AiConnectionForm description

**Key decisions & why:**
- Explicit providerOptions array over Object.entries — PROVIDER_LABELS defines gemini first; Object.entries would silently flip the display order; explicit array is unambiguous
- Inline style for grid-cols — options.length is dynamic; Tailwind arbitrary values are static and cannot be reactive; inline style is the correct tool here
- fieldset + legend stay in AiConnectionForm — they are field structure (using global .field/.field-label), not part of the toggle control itself


## [#119] Extract file dropzone into reusable FileDropzone ui component
**Type:** refactor

**Summary:** Extracted the file drop zone from CsvUploadForm into a generic FileDropzone ui component, fixing a double-label accessibility bug and removing all BEM from the dropzone scoped styles.

**Brainstorming:** The dropzone in CsvUploadForm had two accessibility problems: (1) the field label had no for attribute so it was unconnected, and (2) the dropzone itself was a <label> element, meaning screen readers encountered two labels for the same field. The fix replaces the dropzone <label> with a <div role="button" tabindex="0"> and adds for="csv-file" to the field label — a single <label> now correctly names the hidden <input id="csv-file"> inside the component. The hidden input gets tabindex="-1" to remove it from tab order since the div button handles keyboard interaction. Drag state, file input ref, open(), onDrop(), and onChange() are all internal to the component. Validation (isValidCsvFile) stays in CsvUploadForm since it is CSV-specific business logic — the component emits the raw File. The error slot follows the same Comment-node detection pattern as PasswordInput and RadioToggle. BEM names in the scoped styles (.dropzone--active, __icon, __filename, __hint, __link, __input) are replaced with flat names. The redundant .field__input class (identical values to .form-control) is removed from CsvUploadForm.

**Prompt:** Extract file dropzone component in a ui component. It should NOT have 2 labels since this breaks accessibility. Handle errors like in the password component. Make it generic as well. Remove BEM logic from scoped styles.

**What was built / What changed:**
- `app/src/ui/FileDropzone.vue` — new; props: modelValue (File|null), id?, accept?; div role="button" + aria-label; hidden input tabindex="-1"; isDragging + fileInputRef internal; named error slot with Comment-node detection; emits raw File; scoped non-BEM styles (dropzone, dropzone-active, upload-icon, filename, hint, browse-link)
- `app/src/ui/index.ts` — added FileDropzone export
- `app/src/features/csv-file/components/CsvUploadForm.vue` — replaced inline dropzone with FileDropzone; added for="csv-file" to field label; added handleFileSelect (CSV validation); removed isDragging, isValidCsvFile, setFile, onFileChange, onDrop; removed .field__input scoped class (redundant); removed all .dropzone* scoped styles
- `CLAUDE.md` — added FileDropzone to architecture; updated CsvUploadForm and ui/index.ts descriptions

**Key decisions & why:**
- div role="button" over label for the dropzone — eliminates the double-label accessibility bug; the field label's for attribute correctly targets the hidden input by id regardless of nesting
- tabindex="-1" on the hidden input — prevents keyboard users from tabbing to the input directly (which would open a duplicate file picker); the div button is the single keyboard-accessible entry point
- Validation stays in CsvUploadForm — FileDropzone emits raw File; CSV type checking is app-specific and does not belong in a generic ui component
- .field__input removed — its padding values were identical to what .form-control already applies; it was dead weight


## [#120] Refine FileDropzone — button element, hint prop, aria-describedby, @apply styles
**Type:** refactor

**Summary:** Replaced the div role="button" with a semantic button element, added a hint prop for file-type context, wired aria-describedby from button to hint, aligned visual styles with the design system, and converted all scoped styles to @apply.

**Brainstorming:** Several improvements were needed after the initial extraction. Using a real <button> element is semantically correct and removes the need for manual keydown handlers. The hidden input must move outside the button since interactive elements cannot be nested inside a button (invalid HTML). The hint prop allows callers to inject a file type ("CSV") into the hint text without hard-coding it in the component. The hintId computed from the id prop creates a stable aria-describedby link from the button to its hint text — this is only set when the hint is in the DOM (no file selected). Hint color uses typography-subtle (same Tailwind token as placeholder) for visual consistency. browse-link uses primary-400 (the shade before primary-500, the "previous" primary) and is styled like a small text button (text-xs, font-medium, tracking-wide, underline). All raw CSS in scoped styles converted to @apply where Tailwind tokens exist; color: var(--color-title) on .filename keeps the CSS variable since there is no Tailwind equivalent.

**Prompt:** Use @apply in styles. Hint same color as placeholder. Browse-link use previous primary color from tailwind.config. Browse link should look like a text button small. Hint should accept an input that can be empty or specify the type of file — in our case CSV passed from CsvUploadForm. Form control should be described by hint. Add id input and attach it to the form-control. Use a button instead of role="button".

**What changed:**
- `app/src/ui/FileDropzone.vue` — button replaces div role="button"; hidden input moved outside button; hint? prop added; hintId computed (id + "-hint"); hintText computed ("Drag & drop a {hint} file here, or" / generic fallback); aria-describedby on button conditional on !modelValue && hintId; hint span gets :id="hintId"; @keydown handlers removed (button native); all scoped styles converted to @apply; hint → text-typography-subtle; browse-link → text-xs text-primary-400 font-medium tracking-wide underline
- `app/src/features/csv-file/components/CsvUploadForm.vue` — added hint="CSV" to FileDropzone
- `CLAUDE.md` — updated FileDropzone and CsvUploadForm descriptions

**Key decisions & why:**
- Input outside button — nesting interactive elements inside <button> is invalid HTML; moved input as a sibling and kept fileInputRef pointing to it
- aria-describedby conditional on !modelValue — when a file is selected the hint element is not in the DOM; aria-describedby referencing a missing id is silently ignored, but it's cleaner to not set it
- primary-400 for browse-link — user confirmed "previous primary color" = the shade before the active primary-500
- @apply throughout; color: var(--color-title) as exception — no Tailwind token maps to this CSS custom property


## [#121] Remove browse-link span and style from FileDropzone
**Type:** refactor

**Summary:** Removed the redundant browse-link span and its scoped style from FileDropzone since the entire button is already clickable.

**Brainstorming:** The "browse" link was a visual cue carried over from the original label-based dropzone where clicking the label was the only way to open the file picker. Now that the entire element is a button, the affordance is clear without it. The inner span added markup noise and a separate style block for no functional or UX gain. The hintText computed was also updated to drop the trailing "or" that only made sense when "browse" followed.

**Prompt:** Do we need the browse to look like a link? Users can click the whole button anyways. Remove unnecessary span element and styles.

**What changed:**
- `app/src/ui/FileDropzone.vue` — removed inner browse-link span from hint; updated hintText computed to drop trailing "or"; removed .browse-link scoped style block

**Key decisions & why:**
- hintText updated to "Drag & drop a {hint} file here" — removing "or" makes the sentence grammatically complete without needing a follow-on word


## [#122] Extract AiAnalysisCorrelations shared component
**Type:** refactor

**Summary:** Extracted the identical correlations section from AiOptimizerPanel and AiSummaryPanel into a shared AiAnalysisCorrelations component.

**Brainstorming:** The correlations section markup was a verbatim copy in both panels — same v-if guard, same section structure, same card-secondary loop rendering corr.finding and corr.implication. The Correlation type is already shared in the types barrel. Extracting it removes the duplication and gives a single place to update if the correlations UI ever changes.

**Prompt:** Extract AiAnalysisCorrelations component from shared summary and budget.

**What was built / What changed:**
- `app/src/features/ai-tools/components/AiAnalysisCorrelations.vue` — new; correlations: Correlation[] prop; v-if on length guards the section; no scoped styles (all global classes)
- `app/src/features/ai-tools/components/AiOptimizerPanel.vue` — replaced inline correlations section with AiAnalysisCorrelations
- `app/src/features/ai-tools/components/AiSummaryPanel.vue` — replaced inline correlations section with AiAnalysisCorrelations
- `CLAUDE.md` — added AiAnalysisCorrelations to architecture; updated panel descriptions

**Key decisions & why:**
- v-if on length kept inside the component — both panels had the same guard; inlining it avoids requiring callers to add a v-if wrapper on every usage
- No scoped styles — the section uses only global ai-section, card-secondary classes; no component-specific styling needed


## [#123] Extract AiAnalysisSummarySection shared component and wire campaign counts
**Type:** refactor

**Summary:** Extracted the section header pattern shared by AiOptimizerPanel (Summary) and AiSummaryPanel (Portfolio Health) into a dumb AiAnalysisSummarySection component, replacing the hardcoded campaign count TODO with live values from the campaign store.

**Brainstorming:** Both panels had a section-header with a title, an analysis-details line (period + campaign count TODO), and optional extra content alongside the title (health badge in Summary panel, nothing in Optimizer). The pattern was structurally identical but visually different in the badge area. Extracting it into a shared dumb component — no store reads — keeps the component testable and predictable. The badge and body content are projected via named slot (#badge) and default slot respectively. Campaign counts (total vs filtered) are passed as props from each parent, which reads them from useCampaignStore.

**Prompt:** Extract Summary component from optimizer and summary. Add projection slot to project bottom line and portfolio health after the period we should show how many campaigns are selected out of how many. Follow the process we defined for this project. Do not use any BEM scoped styles we are moving away from this. This is a dumb component. No reads from store, pass it from the parents.

**What was built / What changed:**
- `app/src/features/ai-tools/components/AiAnalysisSummarySection.vue` — new; props: title, period?, totalCampaigns, selectedCampaigns; #badge slot for optional right-side content; default slot for body; renders "N of M campaigns" count; flat non-BEM scoped styles
- `app/src/features/ai-tools/components/AiOptimizerPanel.vue` — replaced inline Summary section with AiAnalysisSummarySection; imports useCampaignStore and passes campaigns.length / filteredCampaigns.length; removed .ai-summary BEM scoped block
- `app/src/features/ai-tools/components/AiSummaryPanel.vue` — replaced inline Portfolio Health section with AiAnalysisSummarySection; health badge projected into #badge slot; reasoning + bottom line in default slot; imports useCampaignStore and passes campaign counts; removed .portfolio-health BEM scoped block; health badge styles rewritten as flat classes (health-container, health-badge, health-score, health-label)
- `CLAUDE.md` — added AiAnalysisSummarySection to architecture; updated AiOptimizerPanel and AiSummaryPanel descriptions

**Key decisions & why:**
- Dumb component (no store reads) — makes the component reusable and easier to reason about; parents own the data source
- #badge slot rather than a health-score prop — keeps the component generic; the badge markup (with its dynamic class binding) stays in the panel that owns it
- Flat non-BEM scoped class names — consistent with the ongoing move away from BEM in scoped styles; .health-container/.health-badge/.health-score/.health-label replace the old .portfolio-health__ block


## [#124] Rename AiAnalysisSummarySection to AiAnalysisSummary
**Type:** update

**Summary:** Renamed the component file and all references from AiAnalysisSummarySection to AiAnalysisSummary for a shorter, cleaner name.

**Brainstorming:** The "Section" suffix was redundant — the component name already conveys its purpose. Dropping it makes the import and template usage more concise.

**Prompt:** Rename AiAnalysisSummarySection to AiAnalysisSummary.

**What was built / What changed:**
- `app/src/features/ai-tools/components/AiAnalysisSummarySection.vue` — renamed to `AiAnalysisSummary.vue`
- `app/src/features/ai-tools/components/AiOptimizerPanel.vue` — import and template tag updated
- `app/src/features/ai-tools/components/AiSummaryPanel.vue` — import and template tag updated
- `CLAUDE.md` — filename updated in architecture

**Key decisions & why:**
- No behaviour change — pure rename for naming clarity


## [#125] Remove BEM from _ai-summary.scss and update all consumers
**Type:** refactor

**Summary:** Replaced BEM child selectors in _ai-summary.scss with flat class names and updated every component that referenced those classes.

**Brainstorming:** The global stylesheet used BEM notation (ai-section__title, ai-section__subtitle, ai-section__note, ai-section__analysis-details, ai-panel__head, ai-panel__title) inconsistently alongside flat scoped styles. The ai-panel BEM children were already dead — AiAnalysisState.vue had replaced them with its own scoped flat classes (panel-head, panel-title). All remaining BEM globals were renamed to flat equivalents and templates updated. The undefined ai-section__content and ai-section__text classes (used in templates but never styled) were removed rather than renamed.

**Prompt:** Update ai-summary in styles components and move away from BEM logic. Update respective components with updated classes.

**What was built / What changed:**
- `app/src/styles/components/_ai-summary.scss` — removed ai-panel BEM children (already dead); flattened ai-section children: ai-section__title → .section-title, ai-section__subtitle → .section-subtitle, ai-section__note → .section-note, ai-section__analysis-details → .analysis-details
- `app/src/features/ai-tools/components/AiOptimizerPanel.vue` — ai-section__title → section-title (×5); ai-section__content removed from executive_summary paragraph
- `app/src/features/ai-tools/components/AiSummaryPanel.vue` — ai-section__title → section-title (×5); ai-section__subtitle → section-subtitle; ai-section__note → section-note; ai-section__text removed from two paragraphs; ai-section__content removed from ai-metrics wrapper
- `app/src/features/ai-tools/components/AiAnalysisCorrelations.vue` — ai-section__title → section-title
- `app/src/features/ai-tools/components/AiAnalysisSummary.vue` — ai-section__title → section-title; ai-section__analysis-details → analysis-details
- `CLAUDE.md` — updated _ai-summary.scss architecture entry

**Key decisions & why:**
- ai-panel BEM children dropped entirely — AiAnalysisState.vue already had scoped flat equivalents; no template was using the global versions
- ai-section__content and ai-section__text removed rather than renamed — they had no styles behind them; removing keeps templates clean


## [#126] Remove BEM from _card.scss and update all consumers
**Type:** refactor

**Summary:** Replaced BEM child selectors in _card.scss with flat class names and updated every component that referenced those classes.

**Brainstorming:** The .card-secondary block used three BEM children (card-secondary__head, card-secondary__title, card-secondary__content) referenced heavily across ai-tools components and in scoped styles. Flattening them to card-head, card-title, card-content follows the same pattern applied to _ai-summary.scss. The parent .card-secondary class is kept as-is since it distinguishes card variants, but its children are no longer BEM.

**Prompt:** Do the same for card.

**What was built / What changed:**
- `app/src/styles/components/_card.scss` — extracted card-secondary BEM children into standalone flat classes: .card-head, .card-title, .card-content
- `app/src/features/ai-tools/components/AiOptimizerPanel.vue` — card-secondary__head → card-head, card-secondary__title → card-title, card-secondary__content → card-content (template and scoped styles)
- `app/src/features/ai-tools/components/AiSummaryPanel.vue` — same rename across template and scoped styles
- `app/src/features/ai-tools/components/AiConnectionForm.vue` — card-secondary__title → card-title
- `app/src/features/ai-tools/components/AiAnalysisCorrelations.vue` — card-secondary__title → card-title, card-secondary__content → card-content
- `CLAUDE.md` — updated _card.scss architecture entry

**Key decisions & why:**
- card-head/card-title/card-content chosen over generic head/title/content — short but still namespaced to the card context, avoiding collision with other global classes


## [#127] Remove BEM from _table.scss and update all consumers
**Type:** refactor

**Summary:** Replaced BEM child selectors in _table.scss with flat class names and updated every component that referenced those classes.

**Brainstorming:** The .data-table block used three BEM children (data-table__th, data-table__tr, data-table__td) across CampaignTable and CsvErrorTable. Flattening to data-table-header, data-table-row, data-table-cell follows the same pattern applied to _ai-summary.scss and _card.scss. The parent .data-table class is kept as-is.

**Prompt:** Same for table. data-table__th → data-table-header, data-table__tr → data-table-row, data-table__td → data-table-cell.

**What was built / What changed:**
- `app/src/styles/components/_table.scss` — renamed .data-table__th → .data-table-header, .data-table__tr → .data-table-row, .data-table__td → .data-table-cell
- `app/src/features/dashboard/components/CampaignTable.vue` — updated all three class references in template
- `app/src/features/csv-file/components/CsvErrorTable.vue` — updated all three class references in template
- `CLAUDE.md` — updated _table.scss architecture entry

**Key decisions & why:**
- Hyphen separator (data-table-header) rather than double-underscore BEM notation — consistent with the flat naming approach adopted across all global component styles


## [#128] Extract shared badge variants and formatters from AI panels into utils
**Type:** refactor

**Summary:** Extracted duplicated badge variant helpers and display formatters from AiOptimizerPanel and AiSummaryPanel into two dedicated utility files.

**Brainstorming:** Both panels had local copies of urgencyVariant and formatRoi (identical) plus formatCurrency/formatEuro (same output, different implementations). Badge variant functions all followed the same map[key.toLowerCase()] ?? 'info' pattern. A generic internal badgeVariant(map, key) resolver eliminates this repetition while each named export stays descriptive. Formatters go in a separate file since they are a different concern — display strings vs visual badge mapping. Function declarations used instead of arrow const per project convention.

**Prompt:** AiSummaryPanel and AiOptimizerPanel share a lot of functions — extract them in a file in utils. For badge variants create another file with maps for each item and a generic function, export functions for the rest. Do not export them as const if they are functions. Name the file analysis-badge-variants.

**What was built / What changed:**
- `app/src/features/ai-tools/utils/analysis-badge-variants.ts` — new file; internal badgeVariant generic resolver + named map constants; exports: healthScoreVariant, channelStatusVariant, urgencyVariant (merged superset), insightTypeVariant, confidenceVariant, actionVariant, effortVariant
- `app/src/features/ai-tools/utils/panel-formatters.ts` — new file; exports: formatRoi, formatEuro (unified from both panels using Intl.NumberFormat), formatNumber
- `app/src/features/ai-tools/components/AiSummaryPanel.vue` — removed all local badge variant and formatter functions; updated imports; renamed healthScoreClass → healthScoreVariant, channelStatusClass → channelStatusVariant, insightTypeClass → insightTypeVariant in template; classROI kept local (delegates to roiClass from common utils)
- `app/src/features/ai-tools/components/AiOptimizerPanel.vue` — removed all local badge variant and formatter functions; updated imports; renamed formatCurrency → formatEuro in template
- `CLAUDE.md` — updated utils folder entries and panel descriptions

**Key decisions & why:**
- badgeVariant kept internal (not exported) — it is an implementation detail of the map-based lookup pattern, not a public API
- formatCurrency (optimizer) unified into formatEuro using Intl.NumberFormat — more correct than the template literal approach it replaced
- urgencyVariant merged with the optimizer's superset map (adds 'this month': 'opportunity') — no behaviour change for summary, which never passes that value
- classROI left local in AiSummaryPanel — it is a thin wrapper around roiClass from common/utils/roi, not a formatting concern shared with the optimizer


## [#129] Extract executive summary sections into dumb components
**Type:** refactor

**Summary:** Extracted each section of AiSummaryPanel into a dedicated dumb component inside a new executive-summary/ folder, leaving the panel as a thin orchestrator with no scoped styles.

**Brainstorming:** AiSummaryPanel had five inline sections (Portfolio Health, Priority Actions, Key Metrics, Insights, Channel Summary) plus shared AiAnalysisCorrelations. Each section owns its own template logic, badge helpers, and scoped styles. Extracting them makes each section independently readable and keeps the panel itself clean. All components are dumb (props-only, no store reads). Scoped styles use @apply with flat class names — no BEM. classROI moved into AiExecutiveSummaryMetrics since that is the only consumer.

**Prompt:** Create an executive-summary/ folder inside ai-tools/components. Create dumb components for each section of AiSummaryPanel, prefixed with AiExecutiveSummary. Scoped styles with @apply and no BEM.

**What was built / What changed:**
- `app/src/features/ai-tools/components/executive-summary/AiExecutiveSummaryHealth.vue` — Portfolio Health; wraps AiAnalysisSummary with health badge slot; healthScoreVariant from utils
- `app/src/features/ai-tools/components/executive-summary/AiExecutiveSummaryPriorityActions.vue` — Priority Actions list; urgencyVariant badge; flat scoped styles (priority-head, priority-number, priority-metric)
- `app/src/features/ai-tools/components/executive-summary/AiExecutiveSummaryMetrics.vue` — Key Metrics grid; formatEuro/formatRoi/formatNumber + classROI local; flat scoped styles (metrics-grid, metric-card, expandable)
- `app/src/features/ai-tools/components/executive-summary/AiExecutiveSummaryInsights.vue` — Insights list; insightTypeVariant badge; flat scoped styles (insight-content, insight-icon, insight-metric, insight-metric-label, insight-metric-value)
- `app/src/features/ai-tools/components/executive-summary/AiExecutiveSummaryChannels.vue` — Channel Summary; channelStatusVariant badge + border-left color per status; flat scoped styles (channel-card, channel-head, channel-budget)
- `app/src/features/ai-tools/components/AiSummaryPanel.vue` — rewritten to delegate all sections to executive-summary/ components; removed all local formatters, badge helpers, and scoped styles
- `CLAUDE.md` — updated architecture for AiSummaryPanel and added executive-summary/ folder entries

**Key decisions & why:**
- AiAnalysisCorrelations stays in the panel directly — it is already a shared component used by both panels, not summary-specific
- classROI moved into AiExecutiveSummaryMetrics rather than panel-formatters — it wraps roiClass from common/utils and is only used in the metrics section
- No barrel index.ts for executive-summary/ — all five components are imported directly by AiSummaryPanel, adding an index would add indirection with no benefit


## [#130] Move cache time formatting into AiAnalysisState
**Type:** refactor

**Summary:** Replaced the duplicated formattedCacheTime computed in both panels with a single internal computed in AiAnalysisState, accepting the raw cacheTimestamp prop.

**Brainstorming:** Both AiOptimizerPanel and AiSummaryPanel had identical formattedCacheTime computed properties formatting the timestamp for display. Since AiAnalysisState is the only consumer, the formatting belongs there. Panels now pass the raw store value directly. Prop type widened to string|number|null to match the store's number timestamp.

**Prompt:** formattedCacheTime exists in both places now — pass time in AiAnalysisState as is and move the formatter in that component.

**What was built / What changed:**
- `app/src/features/ai-tools/components/AiAnalysisState.vue` — replaced formattedCacheTime prop with cacheTimestamp (string|number|null); added internal formattedCacheTime computed using toLocaleTimeString
- `app/src/features/ai-tools/components/AiOptimizerPanel.vue` — removed formattedCacheTime computed; passes :cache-timestamp="cacheTimestamp" to AiAnalysisState
- `app/src/features/ai-tools/components/AiSummaryPanel.vue` — same as optimizer
- `CLAUDE.md` — updated AiAnalysisState prop description

**Key decisions & why:**
- Prop type string|number|null rather than string|null — the store cacheTimestamps are numbers; widening avoids a pointless String() cast in the panels


## [#131] Extract budget-optimization/ dumb components from AiOptimizerPanel
**Type:** refactor

**Summary:** Split all inline sections of AiOptimizerPanel into six props-only components under a new budget-optimization/ subfolder, mirroring the executive-summary/ pattern applied to AiSummaryPanel.

**Brainstorming:** AiOptimizerPanel had all its section markup inline with scoped BEM-style styles. The executive-summary/ refactor showed the dumb-component pattern: one file per section, props typed via indexed access on the response type, scoped @apply flat styles, no store reads. The same pattern applies here directly. AiAnalysisCorrelations is already a shared component and stays a direct import. The panel becomes a thin orchestrator with no styles of its own.

**Prompt:** Create a budget-optimization/ subfolder inside ai-tools/components. Split the sections of AiOptimizerPanel into dumb components each starting with BudgetOptimization (e.g. BudgetOptimizationOverview). Scoped styles with @apply, no BEM.

**What changed:**
- `app/src/features/ai-tools/components/budget-optimization/BudgetOptimizationOverview.vue` — new; executive summary wrapper; wraps AiAnalysisSummary with executiveSummary, period, totalCampaigns, selectedCampaigns props
- `app/src/features/ai-tools/components/budget-optimization/BudgetOptimizationRecommendations.vue` — new; recommendations cards with confidenceVariant + urgencyVariant badges, formatEuro + formatRoi; flat scoped styles (rec-badges, rec-details, rec-row, rec-value, rec-metrics, rec-metrics-title, rec-metrics-text)
- `app/src/features/ai-tools/components/budget-optimization/BudgetOptimizationTopPerformers.vue` — new; top performers with ROI in text-success; flat scoped styles (performer-roi, performer-unlock)
- `app/src/features/ai-tools/components/budget-optimization/BudgetOptimizationUnderperformers.vue` — new; underperformers with actionVariant badge, ROI in text-danger--5p; flat scoped styles (performer-roi)
- `app/src/features/ai-tools/components/budget-optimization/BudgetOptimizationQuickWins.vue` — new; quick wins with effortVariant badge; flat scoped styles (quick-win-details, quick-win-impact, quick-win-timeline)
- `app/src/features/ai-tools/components/budget-optimization/BudgetOptimizationRisks.vue` — new; risks & mitigations with v-if on length; no scoped styles needed
- `app/src/features/ai-tools/components/AiOptimizerPanel.vue` — rewritten as thin orchestrator; removed all inline sections and scoped styles; imports the six new components
- `CLAUDE.md` — architecture updated with budget-optimization/ subfolder and component descriptions

**Key decisions & why:**
- Six components rather than fewer combined ones — each section is independently renderable and has its own type slice; fine-grained split matches the executive-summary/ precedent
- BudgetOptimizationRisks owns the v-if on risks.length — keeps the condition co-located with the section rather than in the parent, consistent with how AiAnalysisCorrelations handles its own v-if
- AiAnalysisCorrelations kept as a direct import — it is already a shared component used by both panels; wrapping it in a budget-optimization component would add a pointless indirection
- Scoped styles use flat class names (rec-*, performer-*, quick-win-*) without BEM double-underscore — consistent with the project's flat scoped style convention


## [#132] Remove Ai prefix from executive-summary components; move shared components to shared/
**Type:** refactor

**Summary:** Stripped the Ai prefix from all executive-summary/ components, renamed AiAnalysisSummary and AiAnalysisCorrelations to AnalysisSummary and AnalysisCorrelations, and moved both to a new shared/ subfolder alongside the other panel component folders.

**Brainstorming:** The Ai prefix on these components was redundant — they all live inside the ai-tools feature already, so the prefix adds noise without adding clarity. The two shared components (AnalysisSummary and AnalysisCorrelations) were floating in the components/ root, which made their shared nature implicit. Grouping them in shared/ makes the folder structure self-documenting: budget-optimization/, executive-summary/, and shared/ each have a clear role.

**Prompt:** Remove Ai from all components in the executive-summary folder. Do the same for AiAnalysisSummary and AiAnalysisCorrelations and move those components to a folder named shared.

**What changed:**
- `components/AiAnalysisSummary.vue` → `components/shared/AnalysisSummary.vue` — moved and renamed
- `components/AiAnalysisCorrelations.vue` → `components/shared/AnalysisCorrelations.vue` — moved and renamed
- `executive-summary/AiExecutiveSummaryHealth.vue` → `executive-summary/ExecutiveSummaryHealth.vue` — renamed; import + template tag updated to AnalysisSummary
- `executive-summary/AiExecutiveSummaryPriorityActions.vue` → `executive-summary/ExecutiveSummaryPriorityActions.vue` — renamed
- `executive-summary/AiExecutiveSummaryMetrics.vue` → `executive-summary/ExecutiveSummaryMetrics.vue` — renamed
- `executive-summary/AiExecutiveSummaryInsights.vue` → `executive-summary/ExecutiveSummaryInsights.vue` — renamed
- `executive-summary/AiExecutiveSummaryChannels.vue` → `executive-summary/ExecutiveSummaryChannels.vue` — renamed
- `budget-optimization/BudgetOptimizationOverview.vue` — import + template tag updated to AnalysisSummary from shared/
- `AiSummaryPanel.vue` — all 6 imports and template tags updated
- `AiOptimizerPanel.vue` — AnalysisCorrelations import and template tag updated
- `CLAUDE.md` — architecture updated: shared/ subfolder added, all renamed components reflected

**Key decisions & why:**
- Ai prefix dropped — the components are already scoped to the ai-tools feature folder; the prefix is redundant and clutters component names
- shared/ folder rather than keeping them in the components/ root — makes the three-folder structure (shared/, budget-optimization/, executive-summary/) explicit and symmetric; a new developer immediately understands which components are reused vs panel-specific


## [#133] Move AiAnalysisState to shared/AnalysisState; group identical scoped selectors
**Type:** refactor

**Summary:** Moved AiAnalysisState.vue into the shared/ subfolder as AnalysisState.vue and grouped the three scoped selectors that shared identical styles into a single rule.

**Brainstorming:** With AnalysisSummary and AnalysisCorrelations already in shared/, AiAnalysisState was the one remaining shared component still living in the components/ root. Moving it completes the reorganisation. On the scoped styles: .loader-text, .notice-hint, and .error-hint all had exactly @apply text-typography text-sm — they can be merged into one grouped selector with no semantic loss and less repetition. The import path for Spinner and SparklesIcon deepens by one level (../../../../ui instead of ../../../ui).

**Prompt:** Move AiAnalysisState into shared, rename it to AnalysisState. Group CSS selectors from scoped styles that share exactly the same styles.

**What changed:**
- `components/AiAnalysisState.vue` — deleted
- `components/shared/AnalysisState.vue` — new; same logic, updated import paths (../../../../ui), .loader-text + .notice-hint + .error-hint grouped into one rule
- `AiSummaryPanel.vue` — import and opening/closing template tags updated to AnalysisState from shared/
- `AiOptimizerPanel.vue` — same as summary panel
- `CLAUDE.md` — AnalysisState.vue added to shared/ section; removed from standalone entry

**Key decisions & why:**
- Only selectors with exactly identical @apply bodies were grouped — .notice-text and .error-message share font-medium text-sm but differ in color, so they stay separate


## [#134] Introduce CampaignScope and campaignScope store computed; replace count props in AnalysisSummary
**Type:** refactor

**Summary:** Added a CampaignScope interface to common types and a campaignScope computed to campaignStore, replacing the pair of totalCampaigns/selectedCampaigns number props in AnalysisSummary (and its callers) with a single typed scope object; AnalysisSummary now uses scope.selectedCampaigns.length for the count display.

**Brainstorming:** Both panels were passing two raw .length numbers down two component levels (panel → Health/Overview → AnalysisSummary). That leaks the shape of the store into every intermediate component. A single CampaignScope object centralises the structure in common types, lets the store own the mapping to string arrays, and gives AnalysisSummary access to selectedChannels if needed in future. Using .length in the leaf keeps the prop surface minimal (no derived scalars). The store getter is a natural home — it's a reactive projection of existing state, derived the same way kpis is.

**Prompt:** Create an object in the state that returns campaign names array as campaigns, selected campaign names as selectedCampaigns, and selected channel names as selectedChannels. Create respective interface in common types. Pass this object in AnalysisSummary. After period show • N campaigns using .length. Use shared selector to pass the values.

**What changed:**
- `app/src/common/types/campaign.ts` — added CampaignScope interface
- `app/src/stores/campaignStore.ts` — imported CampaignScope; added campaignScope computed (maps campaigns→name strings, filteredCampaigns→name strings, selectedChannels); exported in return
- `app/src/features/ai-tools/components/shared/AnalysisSummary.vue` — replaced totalCampaigns/selectedCampaigns number props with scope: CampaignScope; template now shows scope.selectedCampaigns.length campaigns
- `app/src/features/ai-tools/components/executive-summary/ExecutiveSummaryHealth.vue` — replaced totalCampaigns/selectedCampaigns with scope: CampaignScope; passes :scope to AnalysisSummary
- `app/src/features/ai-tools/components/budget-optimization/BudgetOptimizationOverview.vue` — same replacement; passes :scope to AnalysisSummary
- `AiSummaryPanel.vue` — passes :scope="campaignStore.campaignScope" to ExecutiveSummaryHealth
- `AiOptimizerPanel.vue` — passes :scope="campaignStore.campaignScope" to BudgetOptimizationOverview
- `CLAUDE.md` — campaign.ts, campaignStore.ts, AnalysisSummary.vue descriptions updated

**Key decisions & why:**
- String arrays rather than Campaign objects in CampaignScope — AnalysisSummary only needs names and counts; exporting full Campaign objects would over-share store internals into UI components
- campaignScope in campaignStore, not a local computed in the panels — the scope is a store concern (derived from store state); panels shouldn't repeat the mapping logic


## [#135] Move AiConnectionForm into components/ai-connection/ subfolder; convert BEM to flat scoped styles
**Type:** refactor

**Summary:** Created `ai-connection/` subfolder under `components/`, moved `AiConnectionForm.vue` there, added a barrel `index.ts`, and replaced all BEM-style nested selectors with flat scoped `@apply` class names.

**Brainstorming:** The components folder was growing with top-level files for both panels and the connection form. Grouping the connection form (and its future companions such as `AiConnectedStatus`) into a dedicated `ai-connection/` subfolder mirrors the existing `shared/`, `budget-optimization/`, and `executive-summary/` pattern. The BEM block `.ai-conn` with `&__intro`, `&__help-steps`, etc. was replaced with flat names (`.conn-form`, `.conn-intro`, `.conn-fieldset`, `.help-steps`, `.help-note`) matching the style convention used throughout the refactored components.

**Prompt:** create components folder in ai-connection, create barrel index file, move AiConnectionForm there and update scoped styles to move away from BEM

**What changed:**
- `app/src/features/ai-tools/components/ai-connection/AiConnectionForm.vue` — new location; import paths deepened by one level; BEM selectors replaced with flat scoped classes: `.conn-form`, `.conn-intro`, `.conn-fieldset`, `.help-steps`, `.help-note`; transition selectors `.help-enter-active` etc. promoted to top-level (no longer nested inside `.ai-conn`)
- `app/src/features/ai-tools/components/ai-connection/index.ts` — barrel export for `AiConnectionForm`
- `app/src/features/ai-tools/components/AiConnectionForm.vue` — deleted (moved)
- `app/src/features/ai-tools/components/AiToolsContent.vue` — import path updated to `./ai-connection/AiConnectionForm.vue`
- `CLAUDE.md` — architecture updated: root-level `AiConnectionForm.vue` entry replaced with `ai-connection/` subfolder tree; stale `BudgetOptimizationOverview` prop descriptions corrected

**Key decisions & why:**
- Flat class names over BEM — consistent with `shared/`, `budget-optimization/`, and `executive-summary/` components; scoped styles don't need BEM specificity since Vue scoping provides the isolation
- Transition selectors promoted to top-level — Vue's `<Transition>` injects transition classes at the component root scope, so nesting them inside `.ai-conn` was unnecessary and potentially fragile


## [#136] Move components/ai-connection/ into ai-connection/components/
**Type:** refactor

**Summary:** Relocated `AiConnectionForm.vue` and its barrel `index.ts` from `components/ai-connection/` into `ai-connection/components/` so that the component lives alongside the connection logic rather than inside the generic components tree.

**Brainstorming:** The previous location (`components/ai-connection/`) put the connection form inside the components folder, which is the right folder for Vue components but doesn't group it with the related connection logic. Moving it to `ai-connection/components/` keeps all connection-related code — logic files (gemini.ts, groq.ts, etc.) and UI components — under the same `ai-connection/` module, mirroring how `ai-analysis/` owns its own logic. Import depths remain unchanged (both paths are 4 levels from `src/`), so no internal imports inside `AiConnectionForm.vue` needed updating — only `AiToolsContent.vue`'s import path changed.

**Prompt:** move ai-tools/components/ai-connection to ai-tools/ai-connection/components

**What changed:**
- `app/src/features/ai-tools/ai-connection/components/AiConnectionForm.vue` — new location (moved, no content changes)
- `app/src/features/ai-tools/ai-connection/components/index.ts` — new location (moved, no content changes)
- `app/src/features/ai-tools/components/ai-connection/` — deleted (empty after move)
- `app/src/features/ai-tools/components/AiToolsContent.vue` — import updated from `./ai-connection/AiConnectionForm.vue` to `../ai-connection/components/AiConnectionForm.vue`
- `CLAUDE.md` — architecture updated: `ai-connection/components/` entry added under `ai-connection/`; removed stale entry from `components/` tree

**Key decisions & why:**
- No content changes to `AiConnectionForm.vue` — both old and new paths are 4 levels from `src/`, so all relative imports (`../../../../stores`, `../../../../ui`, `../../types`) stay correct


## [#137] Extract providerHelp computed from PROVIDER_HELP[selectedProvider] in AiConnectionForm
**Type:** update

**Summary:** Replaced repeated `PROVIDER_HELP[selectedProvider]` inline lookups in the template with a single `providerHelp` computed that derives the current provider's help object reactively.

**Brainstorming:** The template accessed `PROVIDER_HELP[selectedProvider]` three times (title, steps, note). Extracting it as a computed eliminates the repetition, makes the reactive dependency explicit, and gives the template a cleaner single reference.

**Prompt:** in this component can we create PROVIDER_HELP[selectedProvider] as computed?

**What changed:**
- `app/src/features/ai-tools/ai-connection/components/AiConnectionForm.vue` — added `providerHelp` computed derived from `PROVIDER_HELP[selectedProvider.value]`; replaced all three template usages of `PROVIDER_HELP[selectedProvider]` with `providerHelp`

**Key decisions & why:**
- `selectedProvider.value` in the computed (not `selectedProvider`) — computed callbacks access refs via `.value`; the template usages used `selectedProvider` directly because Vue unwraps refs in templates automatically


## [#138] Convert .conn-form raw CSS to @apply in AiConnectionForm
**Type:** update

**Summary:** Replaced the three raw CSS properties (`padding`, `display`, `flex-direction`, `gap`) in `.conn-form` with a single `@apply p-6 flex flex-col gap-5` rule to match the `@apply`-only convention used by every other selector in the file.

**Brainstorming:** All other selectors in the scoped block already use `@apply`. The `.conn-form` block was the only outlier using `theme()` calls and raw properties — carried over from the original BEM version. Straightforward conversion: `padding: theme('spacing.6')` → `p-6`, `display: flex` → `flex`, `flex-direction: column` → `flex-col`, `gap: theme('spacing.5')` → `gap-5`.

**Prompt:** AiConnForm use @apply rules

**What changed:**
- `app/src/features/ai-tools/ai-connection/components/AiConnectionForm.vue` — `.conn-form` converted from raw CSS to `@apply p-6 flex flex-col gap-5`

**Key decisions & why:**
- IDE reports "Unknown at rule @apply" on the new line — this is a CSS language server false positive; all other `@apply` rules in the same file are unaffected and the project compiles correctly via Tailwind/PostCSS


## [#139] Extract ERROR_MESSAGES, ERROR_HINTS, PROVIDER_OPTIONS, PROVIDER_LABELS into ai-connection/utils/
**Type:** refactor

**Summary:** Moved the four UI constants (`ERROR_MESSAGES`, `ERROR_HINTS`, `PROVIDER_OPTIONS`, `PROVIDER_LABELS`) out of `AiConnectionForm.vue` into a new `ai-connection/utils/index.ts`, and renamed `providerOptions` to `PROVIDER_OPTIONS` as part of the move.

**Brainstorming:** The connection form component was carrying static lookup tables that have no reason to live inside a Vue component. Extracting them to a utils file keeps the component focused on reactive state and template logic, and makes the constants independently testable and reusable. `PROVIDER_LABELS` was already imported from types — re-exporting it from utils means the component has a single import source for all connection-related constants.

**Prompt:** create in ai-connection folder a subfolder with utils, move PROVIDER_LABELS, ERROR_MESSAGES, providerOptions, ERROR_HINTS, rename providerOptions to PROVIDER_OPTIONS

**What changed:**
- `app/src/features/ai-tools/ai-connection/utils/index.ts` — new file; imports `PROVIDER_LABELS` from types and re-exports it; exports `ERROR_MESSAGES`, `ERROR_HINTS`, `PROVIDER_OPTIONS`
- `app/src/features/ai-tools/ai-connection/components/AiConnectionForm.vue` — removed the four constants; imports `PROVIDER_OPTIONS`, `ERROR_MESSAGES`, `ERROR_HINTS` from `../utils`; template updated from `:options="providerOptions"` to `:options="PROVIDER_OPTIONS"`; `AiConnectionErrorCode` type import dropped (no longer needed in component)
- `CLAUDE.md` — architecture updated: `utils/` subfolder added under `ai-connection/`; `AiConnectionForm.vue` description updated

**Key decisions & why:**
- `PROVIDER_LABELS` re-exported from utils rather than imported directly in the component — single import source for all connection constants; component no longer needs to know about the types barrel for this
- Renamed to `PROVIDER_OPTIONS` (uppercase) on move — consistent with the SCREAMING_SNAKE_CASE convention used by the other exported constants in the same file


## [#140] Move PROVIDER_LABELS and PROVIDER_HELP to ai-connection/utils; rename AiProvider to AiProviderType
**Type:** refactor

**Summary:** Moved `PROVIDER_LABELS` out of `types/index.ts` and into `ai-connection/utils/index.ts` alongside `PROVIDER_HELP` (moved from `AiConnectionForm.vue`); typed both with `AiProviderType` as key; renamed the type `AiProvider` → `AiProviderType` across all files.

**Brainstorming:** `PROVIDER_LABELS` is a runtime constant (display strings), not a type — it had no business living in `types/index.ts`. Moving it to `ai-connection/utils` groups all connection-related constants in one place. `PROVIDER_HELP` was the last constant inside `AiConnectionForm.vue`; moving it to utils leaves the component with only reactive state and lifecycle logic. Using `AiProviderType` as the key for both records makes the type constraint explicit and catches any future provider additions at compile time. The rename to `AiProviderType` adds the `Type` suffix convention used by other types in the codebase.

**Prompt:** PROVIDER_LABELS should be in that file, move also PROVIDER_HELP and use AiProvider type as key, rename AiProvider to AiProviderType and update all files necessary

**What changed:**
- `app/src/features/ai-tools/types/index.ts` — `AiProvider` renamed to `AiProviderType`; `PROVIDER_LABELS` const removed
- `app/src/features/ai-tools/ai-connection/utils/index.ts` — `PROVIDER_LABELS` defined here as `Record<AiProviderType, string>`; `PROVIDER_HELP` added as `Record<AiProviderType, { title; steps; note? }>`; `AiProvider` → `AiProviderType` throughout
- `app/src/features/ai-tools/ai-connection/components/AiConnectionForm.vue` — `PROVIDER_HELP` block removed; `PROVIDER_HELP` imported from `../utils`; `AiProvider` → `AiProviderType`
- `app/src/features/ai-tools/ai-connection/connectProvider.ts` — `AiProvider` → `AiProviderType` in import and function signature
- `app/src/features/ai-tools/ai-connection/gemini.ts` — `PROVIDER_LABELS` import moved from `../types` to `./utils`
- `app/src/features/ai-tools/ai-connection/groq.ts` — `PROVIDER_LABELS` import moved from `../types` to `./utils`
- `app/src/features/ai-tools/ai-analysis/callProvider.ts` — `AiProvider` → `AiProviderType` in import and function signature
- `app/src/stores/aiStore.ts` — `AiProvider` → `AiProviderType` in import and all usages
- `app/src/features/ai-tools/components/AiConnectedStatus.vue` — `PROVIDER_LABELS` import moved from `../types` to `../ai-connection/utils`
- `CLAUDE.md` — types/index.ts entry updated; utils/index.ts entry updated; AiConnectionForm.vue description updated

**Key decisions & why:**
- `Record<AiProviderType, ...>` as key type for both constants — exhaustiveness: TypeScript will error if a new provider is added to the union but not to the constant objects
- `PROVIDER_LABELS` stays in `ai-connection/utils`, not exported from `types` — runtime values belong in utils, not type declaration files


## [#141] Move AiConnectedStatus into ai-connection/components; convert BEM to flat scoped styles
**Type:** refactor

**Summary:** Relocated `AiConnectedStatus.vue` from the generic `components/` folder into `ai-connection/components/` alongside `AiConnectionForm.vue`, and replaced BEM class names (`.ai-status__provider`, `.ai-status__connected`) with flat scoped `@apply` classes.

**Brainstorming:** `AiConnectedStatus` is tightly coupled to the AI connection module — it reads `PROVIDER_LABELS` from `ai-connection/utils` and calls `store.disconnect()`. Keeping it in the generic `components/` folder was inconsistent with the pattern established when `AiConnectionForm` was moved. Moving it into `ai-connection/components/` groups all connection-related UI in one place. The BEM names (`.ai-status__provider`, `.ai-status__connected`) were replaced with flat names (`.status-provider`, `.status-connected`) following the same convention used throughout the refactor.

**Prompt:** Move `AiConnectedStatus.vue` from `ai-tools/components/` into `ai-tools/ai-connection/components/`. Update the barrel export in `ai-connection/components/index.ts` to include it. Update the import in `AiToolsContent.vue`. Convert scoped styles from BEM (`.ai-status__provider`, `.ai-status__connected`) to flat `@apply` classes.

**What changed:**
- `app/src/features/ai-tools/ai-connection/components/AiConnectedStatus.vue` — created at new location; BEM child classes renamed to `.status-provider` and `.status-connected`; `PROVIDER_LABELS` import path unchanged (already pointing to `../utils`); depth from `src/` unchanged so all other imports required no changes
- `app/src/features/ai-tools/ai-connection/components/index.ts` — added `AiConnectedStatus` to barrel export
- `app/src/features/ai-tools/components/AiToolsContent.vue` — updated import path from `./AiConnectedStatus.vue` to `../ai-connection/components/AiConnectedStatus.vue`
- `app/src/features/ai-tools/components/AiConnectedStatus.vue` — deleted
- `CLAUDE.md` — removed `AiConnectedStatus` from `components/` listing; added it under `ai-connection/components/`; updated barrel export description

**Key decisions & why:**
- Flat class names `.status-provider` / `.status-connected` instead of keeping `.ai-status__provider` / `.ai-status__connected` — consistent with the flat-scoped-styles convention applied to all other refactored components in this session
- No changes to import depth-sensitive paths inside the component — the file moved from `components/` to `ai-connection/components/`, both 4 levels deep from `src/`, so all `../../../../` prefixes remain valid


## [#142] Move AiOptimizerPanel → BudgetOptimizationAnalysis; AiSummaryPanel → ExecutiveSummaryAnalysis
**Type:** refactor

**Summary:** Relocated the two tab orchestrator components into their respective section subfolders and renamed them to match the naming convention of their sibling components.

**Brainstorming:** `AiOptimizerPanel` and `AiSummaryPanel` sat in the generic `components/` folder while all the section components they orchestrate live in `budget-optimization/` and `executive-summary/`. Moving the orchestrators into those subfolders collapses the distinction between "orchestrator" and "section components" — the whole tab is now self-contained in its folder. Renaming to `BudgetOptimizationAnalysis` / `ExecutiveSummaryAnalysis` removes the `Ai`/`Panel` prefix and aligns with the `BudgetOptimization*` / `ExecutiveSummary*` naming pattern already used by all sibling components.

**Prompt:** Move `AiOptimizerPanel.vue` to `components/budget-optimization/` and rename it `BudgetOptimizationAnalysis.vue`. Move `AiSummaryPanel.vue` to `components/executive-summary/` and rename it `ExecutiveSummaryAnalysis.vue`. Update all imports and template references in `AiToolsContent.vue`. Delete the old files.

**What changed:**
- `app/src/features/ai-tools/components/budget-optimization/BudgetOptimizationAnalysis.vue` — created; store imports updated from `../../../` to `../../../../`; shared component imports updated from `./shared/` to `../shared/`; section component imports flattened from `./budget-optimization/` to `./`
- `app/src/features/ai-tools/components/executive-summary/ExecutiveSummaryAnalysis.vue` — created; same import depth adjustments; section imports flattened from `./executive-summary/` to `./`
- `app/src/features/ai-tools/components/AiToolsContent.vue` — replaced `AiOptimizerPanel` import and template usage with `BudgetOptimizationAnalysis`; replaced `AiSummaryPanel` with `ExecutiveSummaryAnalysis`
- `app/src/features/ai-tools/components/AiOptimizerPanel.vue` — deleted
- `app/src/features/ai-tools/components/AiSummaryPanel.vue` — deleted
- `CLAUDE.md` — removed old panel entries from `components/`; added `BudgetOptimizationAnalysis` and `ExecutiveSummaryAnalysis` as first entries in their respective subfolders

**Key decisions & why:**
- Orchestrators moved into section subfolders rather than kept in `components/` root — each tab's entire component tree is now self-contained in one folder, consistent with the `ai-connection/components/` pattern
- Renamed to `*Analysis` suffix rather than keeping `*Panel` — `Panel` described the drawer slot role; `Analysis` describes what the component does, consistent with `AnalysisState`, `AnalysisSummary`, `AnalysisCorrelations`


## [#143] Extract AiAnalysis — move Tabs + panel container out of AiToolsContent
**Type:** refactor

**Summary:** Extracted the tab bar and scrollable panel container from `AiToolsContent.vue` into a dedicated `AiAnalysis.vue` component, leaving `AiToolsContent` responsible only for the header and the connected/disconnected split.

**Brainstorming:** `AiToolsContent` was mixing two concerns: the persistent shell (header + connected/disconnected routing) and the tab navigation logic (tab definitions, active-tab binding, panel switching). Splitting them gives each component a single responsibility. `AiAnalysis` owns everything inside the connected panel below the status bar: tab bar, scroll container, and tab content routing.

**Prompt:** Create `AiAnalysis.vue` at the same level as `AiToolsContent.vue` and move the Tabs + scrollable container block (including the `BudgetOptimizationAnalysis`/`ExecutiveSummaryAnalysis` conditional) into it. Update `AiToolsContent` to use `<AiAnalysis />` instead. Remove the now-unused imports from `AiToolsContent`.

**What changed:**
- `app/src/features/ai-tools/components/AiAnalysis.vue` — created; owns `tabs` constant, `useAiAnalysisStore`, `Tabs`, `BudgetOptimizationAnalysis`, `ExecutiveSummaryAnalysis`; scoped `.panel-container` replaces old `.ai-content__panel--container`
- `app/src/features/ai-tools/components/AiToolsContent.vue` — replaced Tabs + panel block with `<AiAnalysis />`; removed `useAiAnalysisStore`, `BudgetOptimizationAnalysis`, `ExecutiveSummaryAnalysis`, `FileTextIcon`, `SlidersIcon`, `AiAnalysisTab`, `Tab`, `Tabs`, `tabs` constant; removed `.ai-content__panel--container` scoped style
- `CLAUDE.md` — updated `AiToolsContent` description; added `AiAnalysis` entry

**Key decisions & why:**
- `AiAnalysis` sits at `components/` root alongside `AiToolsContent` rather than inside a subfolder — it is a layout/routing component, not a section component, so it does not belong in `budget-optimization/` or `executive-summary/`
- Flat `.panel-container` name in `AiAnalysis` scoped styles — consistent with the flat-scoped convention applied throughout this refactor session


## [#144] Move budget-optimization, executive-summary, shared, and AiAnalysis into ai-analysis/components
**Type:** refactor

**Summary:** Relocated all AI analysis UI — the tab switcher, shared section wrappers, and both tab component trees — from the generic `components/` folder into `ai-analysis/components/`, co-locating them with the analysis logic (`callProvider.ts`). Added a barrel `index.ts` that exports `AiAnalysis`.

**Brainstorming:** The `components/` folder was a grab-bag: shell components (`AiToolsDrawer`, `AiToolsContent`) alongside the entire analysis UI subtree. Moving the analysis UI into `ai-analysis/components/` groups all analysis concerns — logic, types, and UI — into one module. `components/` is now only the drawer and content shell. The barrel export lets `AiToolsContent` import from the module boundary (`'../ai-analysis/components'`) rather than reaching into a specific file path.

**Prompt:** Move `components/budget-optimization/`, `components/executive-summary/`, `components/shared/`, and `components/AiAnalysis.vue` into `ai-analysis/components/`. Create a barrel `ai-analysis/components/index.ts` exporting `AiAnalysis`. Update all import paths affected by the depth change. Update `AiToolsContent.vue` to import via the barrel.

**What changed:**
- `ai-analysis/components/AiAnalysis.vue` — moved from `components/`; store and ui imports incremented by one `../` level; `'../types'` → `'../../types'`
- `ai-analysis/components/index.ts` — created; exports `AiAnalysis`
- `ai-analysis/components/shared/AnalysisState.vue` — moved; `ui` imports: +1 level; `types` import: `'../../types'` → `'../../../types'`
- `ai-analysis/components/shared/AnalysisSummary.vue` — moved; `common` import: +1 level
- `ai-analysis/components/shared/AnalysisCorrelations.vue` — moved; pre-existing path bug (`'../types'` → `components/types`) fixed to `'../../../types'` (now correctly resolves to `ai-tools/types/`)
- `ai-analysis/components/budget-optimization/*` — moved; store imports: +1 level; `types` and `utils` imports: `'../../'` → `'../../../'`; `common` imports: +1 level; `'../shared/'` relative stays valid
- `ai-analysis/components/executive-summary/*` — moved; same depth corrections as budget-optimization
- `ai-analysis/components/budget-optimization/BudgetOptimizationAnalysis.vue` — store imports: +1 level
- `ai-analysis/components/executive-summary/ExecutiveSummaryAnalysis.vue` — store imports: +1 level
- `app/src/features/ai-tools/components/AiToolsContent.vue` — import changed from `'./AiAnalysis.vue'` to `'../ai-analysis/components'` (barrel)
- `CLAUDE.md` — removed analysis component tree from `components/` section; added full tree under `ai-analysis/components/`

**Key decisions & why:**
- All analysis UI moves together as a unit — partial moves would leave dangling relative imports between shared, section, and orchestrator components
- Barrel export at `ai-analysis/components/index.ts` — `AiToolsContent` imports from the module boundary, insulated from internal folder reorganization
- `'../shared/'` imports in section components require no change after the move — `shared/` is still a sibling folder of `budget-optimization/` and `executive-summary/` within `ai-analysis/components/`


## [#145] UI polish — AiToolsContent layout, AnalysisState scoped styles, AiAnalysis tab order
**Type:** update

**Summary:** Polished the connected-state layout in `AiToolsContent`, reorganised scoped styles in `AnalysisState` into logical groups, and reordered the tabs in `AiAnalysis` so Summary appears before Optimizer.

**Brainstorming:** After the structural refactors (#143, #144) the three shell/analysis components had minor inconsistencies: `AiToolsContent` lacked an explicit height-taking grid row for the scrollable panel, `AnalysisState` had scoped styles in arbitrary order making maintenance harder, and the tab array in `AiAnalysis` listed Optimizer before Summary which did not match the intended default (Summary is the first tab users see). All three changes are purely presentational — no logic, no props, no store changes.

**Prompt:** Polish the AI tools panel UI. In `AiToolsContent.vue` refine the connected-state wrapper to use an explicit 3-row grid (`min-content min-content 1fr`) so the scrollable analysis area always fills remaining height, and tighten the container overflow handling. In `AnalysisState.vue` reorganise scoped styles into logical groups (header, states, result/meta). In `AiAnalysis.vue` reorder the tabs array so Summary (`FileTextIcon`) comes first and Optimizer (`SlidersIcon`) second.

**What changed:**
- `app/src/features/ai-tools/components/AiToolsContent.vue` — `.ai-tools-analysis` uses `grid-rows-[min-content_min-content_1fr]`; `.ai-tools-content` gets `grow shrink-0 overflow-hidden` to hand remaining height down to the grid
- `app/src/features/ai-tools/ai-analysis/components/shared/AnalysisState.vue` — scoped styles regrouped: header block, state blocks (idle/loader/notice/error), result/meta block; no rule changes, ordering only
- `app/src/features/ai-tools/ai-analysis/components/AiAnalysis.vue` — `tabs` array reordered: Summary first, Optimizer second; `v-if` on the panel container checks for `optimizer` explicitly, `v-else` falls through to `ExecutiveSummaryAnalysis`

**Key decisions & why:**
- `grid-rows-[min-content_min-content_1fr]` in `.ai-tools-analysis` — rows 1 and 2 (status bar and tab bar) shrink to content; row 3 (the panel container) gets all remaining height, enabling reliable `overflow-y-auto` inside `AiAnalysis`
- Summary tab first — Summary is the higher-level view; presenting it as the default tab matches a top-down reading flow (overview → detail)
- Style reorder only in `AnalysisState` — avoids any risk of specificity changes while making the file easier to scan


## [#146] Replace media queries with container queries in BudgetOptimizationRecommendations and ExecutiveSummaryMetrics
**Type:** update

**Summary:** Replaced viewport-based `@media` queries with `@container` queries in the two components that have responsive layout rules, so their layouts respond to the panel's actual available width rather than the viewport width.

**Brainstorming:** Both components used `@media` rules to compensate for the fact that the AI panel changes width depending on context — at lg+ the push drawer is fixed at 30rem and compresses the dashboard, while below lg the overlay can be up to 90vw wide. Media queries can only approximate this: the same viewport width can produce different panel widths depending on whether the drawer is open or overlaying. Container queries solve this directly by measuring the element's own containing block. `BudgetOptimizationRecommendations` stacks the confidence/timeline badges vertically when the rec card is narrow; `ExecutiveSummaryMetrics` widens `expandable` and eventually full-width cards when the metrics grid is narrow. No logic changes — purely a layout responsiveness improvement.

**Prompt:** Replace all `@media` queries in `BudgetOptimizationRecommendations.vue` and `ExecutiveSummaryMetrics.vue` with `@container` queries. In `BudgetOptimizationRecommendations`, make each `.card-secondary` rec card the container (`rec-card` class, `container-type: inline-size`) and use `@container (max-width: 460px)` for badge stacking instead of the two media queries (min-width 1024px and max-width 520px). In `ExecutiveSummaryMetrics`, make `.metrics-grid` the container and use `@container (max-width: 548px)` for `.expandable` col-span-2 and `@container (max-width: 360px)` for all `.metric-card` col-span-2.

**What changed:**
- `app/src/features/ai-tools/ai-analysis/components/budget-optimization/BudgetOptimizationRecommendations.vue` — added `rec-card` class to the `v-for` card wrapper; `.rec-card { container-type: inline-size }` added to scoped styles; two `@media` rules in `.rec-badges` replaced with `@container (max-width: 460px)`
- `app/src/features/ai-tools/ai-analysis/components/executive-summary/ExecutiveSummaryMetrics.vue` — `container-type: inline-size` added to `.metrics-grid`; three `@media` rules replaced with `@container (max-width: 548px)` (expandable) and `@container (max-width: 360px)` (all metric-cards full-width)
- `CLAUDE.md` — updated component descriptions for both files

**Key decisions & why:**
- Container on the rec card (`rec-card`), not on `.card-head` — the card is the natural layout boundary; querying it means the threshold is the card's outer width, which is easy to reason about against the known drawer/overlay widths
- Container on `.metrics-grid` directly — the grid is self-contained; no wrapper needed
- `460px` threshold for badge stacking — push drawer content width is ~452px, small overlay (<520px viewport) is ~440px; 460px catches both without bleeding into medium overlays (521px+ → ~441px+ containers)
- `548px` for `.expandable` — push drawer (~452px) and small-screen overlays (≤640px viewport → ≤548px container) both fall below this; medium overlays (641px+ viewport → 549px+ container) do not, matching the original two-breakpoint intent with a single threshold
- VS Code reports a false-positive "Unknown at rule @apply" warning inside `@container` blocks — the CSS language server does not fully understand container queries; the code compiles and runs correctly


## [#147] AnalysisSummary: render detail items as spans with CSS bullet separators
**Type:** update

**Summary:** Replaced the hardcoded `&bull;` HTML entities in the `analysis-details` line with semantic `<span class="detail-item">` elements and a CSS `::before` pseudo-element separator, removing presentational markup from the template.

**Brainstorming:** The original template mixed content and presentation by embedding `&bull;&nbsp;` directly between the text nodes. Using separate `<span>` elements per item keeps the template clean and moves the separator entirely into CSS via `& + & { &::before { content: '\2022' } }`, which only inserts the bullet between adjacent items. Added scoped styles to the component (previously had none).

**Prompt:** In `AnalysisSummary.vue`, replace the `analysis-details` paragraph content with three `<span class="detail-item">` elements (period, campaigns count, channels count). Remove the `&bull;&nbsp;` entities. Add scoped styles: `.detail-item` is `inline-block`; `& + &` adds `pl-3` and a `::before` pseudo-element with `content: '\2022'` and `pr-3 text-typography-subtle`.

**What changed:**
- `app/src/features/ai-tools/ai-analysis/components/shared/AnalysisSummary.vue` — `analysis-details` paragraph now renders three `.detail-item` spans; `&bull;&nbsp;` entities removed; scoped styles added with `.detail-item` (`inline-block`) and `& + &::before` CSS bullet separator

**Key decisions & why:**
- `& + &` combinator for the separator — only inserts the bullet between sibling `.detail-item` elements, so no leading bullet before the first item and no trailing bullet after the last; no conditional logic needed in the template
- Empty `content: ''` with CSS-drawn circle (`w-1 h-1 rounded-full bg-typography-subtle align-middle`) — avoids unicode characters entirely; the circle is purely geometric and scales with the design token
- `text-typography-subtle` color on the circle — visually de-emphasises the separator relative to the content text


## [#148] Remove DEV_MOCK_ANALYSIS flag from aiAnalysisStore
**Type:** update

**Summary:** Removed the development mock flag and all associated mock code from `aiAnalysisStore.ts` so the store executes real AI API calls.

**Brainstorming:** The `DEV_MOCK_ANALYSIS` flag was added during development to cycle through fixture responses without hitting the AI providers. It was always intended as a temporary scaffold with a TODO comment marking it for removal before shipping. Removing it means: the mock import, the flag constant, the two mock-index refs, the entire conditional block inside `executeAnalysis`, and an incidental `console.log(prompt)` left in the real code path.

**Prompt:** Revert the DEV_MOCK_ANALYSIS flag in `aiAnalysisStore.ts`: remove the `BUDGET_OPTIMIZER_MOCKS`/`EXECUTIVE_SUMMARY_MOCKS` import, the `DEV_MOCK_ANALYSIS` constant and TODO comment, the `optimizerMockIndex`/`summaryMockIndex` refs and their TODO comment, the entire `if (DEV_MOCK_ANALYSIS)` block inside `executeAnalysis`, and the leftover `console.log(prompt)` in the real code path.

**What changed:**
- `app/src/stores/aiAnalysisStore.ts` — mock import removed; `DEV_MOCK_ANALYSIS` constant and comment removed; `optimizerMockIndex`/`summaryMockIndex` refs and comment removed; `if (DEV_MOCK_ANALYSIS)` block removed; `console.log(prompt)` removed

**Key decisions & why:**
- Removed `console.log(prompt)` in the same pass — it was a debug leftover in the real code path and should not reach production


## [#149] Remove DEV_MOCK_CONNECTED flag from aiStore
**Type:** update

**Summary:** Removed the `DEV_MOCK_CONNECTED` development flag from `aiStore.ts` so the store initialises in the correct disconnected state, requiring the user to connect an AI provider before analysis can run.

**Brainstorming:** The flag initialised `provider`, `apiKey`, `isConnected`, `models`, and `selectedModel` with mock values, bypassing the connection form entirely. Removing it restores the intended UX flow: user opens the AI panel → fills in the connection form → connects → then runs analysis. Console.log statements in both stores are retained intentionally for active development debugging.

**Prompt:** Revert DEV_MOCK_CONNECTED in aiStore.ts — remove the flag constant, the MOCK_DEV_MODEL object, and reset all conditional initialisers to their real defaults (null/false/empty). Keep console.log statements.

**What changed:**
- `app/src/stores/aiStore.ts` — `DEV_MOCK_CONNECTED` constant, TODO comment, and `MOCK_DEV_MODEL` object removed; `provider`, `apiKey`, `isConnected`, `models`, `selectedModel` reset to real defaults (`null`, `''`, `false`, `[]`, `null`)

**Key decisions & why:**
- Console.log statements kept in both `aiStore.ts` and `aiAnalysisStore.ts` — intentionally retained for ongoing debugging during development


## [#150] Disable API key input and help toggle while connecting
**Type:** fix

**Summary:** Disabled the API key `PasswordInput` and the "How to get your key?" button during connection, while leaving the provider `RadioToggle` interactive so the user can still switch providers.

**Brainstorming:** While `isConnecting` is true the Connect button is already disabled and shows a spinner, but the key input and help toggle remained active. Disabling them prevents the user from mutating form state mid-request. The provider toggle is intentionally left enabled — switching provider while connecting cancels the request (the watch on `selectedProvider` clears the error and key, and the next submit will use the new provider).

**Prompt:** While connecting, disable the API key input and the help toggle button. Keep the provider radio toggle enabled.

**What changed:**
- `app/src/features/ai-tools/ai-connection/components/AiConnectionForm.vue` — `:disabled="store.isConnecting"` added to `PasswordInput` and the "How to get your key?" button

**Key decisions & why:**
- Provider toggle left enabled — switching provider is a valid mid-flight action; the watch already resets key and error on change


## [#151] Add disabled prop to RadioToggle
**Type:** update

**Summary:** Added a `disabled` prop to `RadioToggle` that disables all radio inputs and applies `opacity-50 pointer-events-none` via a CSS `:has()` selector on the wrapper.

**Brainstorming:** The component had no disabled state at all — no prop, no visual, no native input attribute. Adding `:disabled` to each input handles keyboard/form interaction natively. The visual dimming uses `.radio-toggle:has(input:disabled)` so no extra class needs to be toggled on the wrapper — the CSS derives state directly from the inputs. No BEM modifier class needed.

**Prompt:** Implement disabled state in RadioToggle — add a `disabled?` prop, pass it to each radio input, and reflect it visually without BEM modifier classes. Also remove the `:disabled` from the help toggle button in AiConnectionForm so instructions remain accessible during connecting.

**What changed:**
- `app/src/ui/RadioToggle.vue` — `disabled?` prop added; `:disabled="disabled"` on each input; `.radio-toggle:has(input:disabled)` scoped rule applies `opacity-50 pointer-events-none`
- `app/src/features/ai-tools/ai-connection/components/AiConnectionForm.vue` — `:disabled="store.isConnecting"` removed from the help toggle button

**Key decisions & why:**
- `:has(input:disabled)` instead of a toggled modifier class — CSS derives the disabled visual from the native input state, no extra class binding needed on the wrapper
- Help button left enabled — instructions should remain accessible while the user waits for a connection response


## [#152] Move AiToolsDrawer to shell and refactor styles
**Type:** refactor

**Summary:** Moved `AiToolsDrawer.vue` from `features/ai-tools/components/` into `shell/` (where it belongs as a layout concern) and refactored both the drawer and `AppShell` styles from BEM to flat `@apply` class names.

**Brainstorming:** The drawer is not a feature component — it is a shell-level layout primitive that decides how the AI panel is presented (push drawer vs. overlay). Placing it alongside `AppShell.vue` makes that responsibility explicit. The BEM style migration replaced `&__panel`/`&--open` nesting with flat class names (`push-drawer`, `push-drawer-panel`, `overlay`, `overlay-panel`, `.open` modifier) and `@apply` throughout both files, consistent with the non-BEM approach already used in the ai-connection and other components.

**Prompt:** Move `AiToolsDrawer.vue` from `features/ai-tools/components/` to `shell/`. Update its import of `AiToolsContent` to the new relative path. Update `AppShell.vue` to import it locally instead of from the feature barrel. Refactor both files' scoped styles from BEM (`&__element`, `&--modifier`) to flat non-BEM class names using `@apply`. Remove the `AiToolsDrawer` export from `features/ai-tools/index.ts` and delete the original file.

**What changed:**
- `app/src/shell/AiToolsDrawer.vue` — new location; import path updated; BEM styles replaced with flat `@apply` classes (`push-drawer`, `push-drawer-panel`, `.open`, `overlay`, `overlay-panel`)
- `app/src/shell/AppShell.vue` — import updated to local `./AiToolsDrawer.vue`; template class names updated (`shell-left`, `shell-header`, `shell-title`, `shell-main`); BEM block replaced with flat `@apply` scoped rules
- `app/src/features/ai-tools/components/AiToolsDrawer.vue` — deleted (moved)
- `app/src/features/ai-tools/index.ts` — `AiToolsDrawer` export removed (file now empty)

**Key decisions & why:**
- Drawer placed in `shell/` not `features/` — it is a layout decision (push vs. overlay), not an AI feature; co-locating it with `AppShell` keeps layout responsibilities in one place
- Flat `@apply` class names — consistent with the non-BEM style convention already established in connection and analysis components
- `.open` modifier class instead of `&--open` — simple boolean class toggle on the wrapper, no BEM suffix needed in scoped context


## [#153] Fix DonutChart hidden legend label detection
**Type:** fix

**Summary:** Replaced `meta.data[i]?.hidden` with `!chart.getDataVisibility(i)` in the legend `generateLabels` callback — `Element` in Chart.js has no `hidden` property, making the previous access both a type error and a runtime no-op.

**Brainstorming:** The `ChartMeta.data` array holds `Element` instances whose TypeScript type exposes no `hidden` field, so the optional-chain always resolved to `undefined ?? false`, meaning hidden state was never reflected in legend items. `chart.getDataVisibility(i)` is the correct Chart.js API for per-datapoint visibility. With `meta` now unused it was removed in the same pass.

**Prompt:** Fix the TypeScript error on line 36 of DonutChart.vue — `meta.data[i]?.hidden` is not a valid Chart.js API. Use `chart.getDataVisibility(i)` instead, and remove the now-unused `meta` variable.

**What changed:**
- `app/src/ui/charts/DonutChart.vue` — `meta` variable removed; hidden check replaced with `!chart.getDataVisibility(i)`

**Key decisions & why:**
- `getDataVisibility(i)` is the Chart.js v3+ public API for checking per-point visibility — avoids reaching into internal element state


## [#154] Extract FileActions component from EmptyState
**Type:** refactor

**Summary:** Extracted the "Download Template" and "Upload CSV" button pair from `EmptyState.vue` into a dedicated `FileActions.vue` component in the `csv-file` feature, co-locating it with the download logic it depends on.

**Brainstorming:** The two buttons and their responsive layout are a self-contained unit tied to CSV file operations. Extracting them into `csv-file/components/FileActions.vue` keeps the composable and UI in the same feature, removes the cross-feature composable import from `EmptyState`, and makes the pair reusable. Styles moved from the BEM `&__actions` block in EmptyState into flat `@apply` scoped styles on `.file-actions` in the new component.

**Prompt:** Create `FileActions.vue` in `csv-file/components/` with the Download Template and Upload CSV buttons. Move the layout styles there as flat @apply. Update EmptyState to import and use `<FileActions @upload="emit('upload')" />` and remove the now-redundant imports and style block.

**What changed:**
- `app/src/features/csv-file/components/FileActions.vue` — new component; Download Template + Upload CSV buttons; `useDownloadTemplate` called internally; emits `upload`; flat `@apply` scoped styles with <480px column stacking
- `app/src/features/dashboard/components/EmptyState.vue` — replaced inline buttons with `<FileActions>`; removed `DownloadIcon`, `UploadIcon`, and `useDownloadTemplate` imports; removed `__actions` style block

**Key decisions & why:**
- Placed in `csv-file/components/` not `dashboard/` — the component owns CSV-specific actions and its composable lives there; dashboard just consumes it via an event


## [#155] Extract useUploadModal composable from AppShell
**Type:** refactor

**Summary:** Extracted upload modal state and replace-confirm logic from `AppShell.vue` into `useUploadModal.ts` in `csv-file/composables/`, co-locating it with the feature it belongs to.

**Brainstorming:** `AppShell` was holding `uploadModal` ref, `showReplaceConfirm`, `onReplaceConfirm`, and the `provide('openUploadModal')` call — all CSV upload concerns. Extracting them into a composable reduces AppShell to layout-only logic. The composable accepts `modalRef` as a parameter rather than creating it internally, so AppShell declares and owns the template ref (eliminating the "declared but never read" TS warning that occurs when a ref is only written via `ref="..."` in the template).

**Prompt:** Create `useUploadModal.ts` in `csv-file/composables/`. It accepts a `modalRef: Ref<InstanceType<typeof UploadModal> | null>`, manages `showReplaceConfirm`, defines `openUploadModal` and `onReplaceConfirm`, calls `provide('openUploadModal', openUploadModal)`, and returns `{ showReplaceConfirm, onReplaceConfirm }`. Update AppShell to declare the ref locally and pass it to the composable.

**What changed:**
- `app/src/features/csv-file/composables/useUploadModal.ts` — new composable; accepts `modalRef`; manages replace-confirm state and open handlers; calls `provide('openUploadModal')` internally
- `app/src/shell/AppShell.vue` — `uploadModal` ref declared locally and passed to `useUploadModal`; `showReplaceConfirm` and `onReplaceConfirm` destructured from composable; manual `provide('openUploadModal')` removed

**Key decisions & why:**
- `modalRef` passed as parameter rather than created inside the composable — the template ref must be declared in the component's setup scope for Vue's `ref="..."` binding to work; passing it in also makes the TS warning disappear since the ref is explicitly read at the call site
- `provide` called inside the composable — it runs synchronously in setup context, so this is valid and keeps all upload-related wiring in one place


## [#156] Move replace modal logic into useUploadModal
**Type:** refactor

**Summary:** Moved the replace-confirm decision logic and `useCampaignStore` dependency from `AppShell` into `useUploadModal`, exposing `hasCampaigns`, `requestUpload`, and `closeReplaceConfirm` so AppShell's template binds to composable-owned state only.

**Brainstorming:** `AppShell` was still directly setting `showReplaceConfirm = true` in the template and importing `useCampaignStore` solely for the button condition. Both belong in the composable — it already owns `showReplaceConfirm` and the open logic, so it should also own the decision of whether to show replace confirm or open directly. Moving `useCampaignStore` in with a `hasCampaigns` computed removes the last campaign-related concern from AppShell.

**Prompt:** Extend `useUploadModal` with `useCampaignStore` (for `hasCampaigns` computed), `requestUpload` (opens modal directly or sets `showReplaceConfirm` based on `hasCampaigns`), and `closeReplaceConfirm`. Update AppShell template to use `hasCampaigns`/`requestUpload`/`closeReplaceConfirm` and remove `useCampaignStore` import.

**What changed:**
- `app/src/features/csv-file/composables/useUploadModal.ts` — added `useCampaignStore`; `hasCampaigns` computed; `requestUpload` and `closeReplaceConfirm` functions; all five values returned
- `app/src/shell/AppShell.vue` — `useCampaignStore` import and `store` removed; template updated to `v-if="hasCampaigns"`, `@click="requestUpload"`, `@close="closeReplaceConfirm"`

**Key decisions & why:**
- `requestUpload` centralises the open-vs-confirm decision in the composable — the template no longer needs to know about campaign state to decide what clicking "Upload CSV" does


## [#157] Split parseCsv — extract validateCampaignData
**Type:** refactor

**Summary:** Extracted column and row validation logic from `parseCsv.ts` into a dedicated `validateCampaignData.ts`, leaving `parseCsv` responsible only for file-level checks and PapaParse invocation.

**Brainstorming:** `parseCsv` was doing two distinct jobs: file I/O concerns (type/size guard + PapaParse) and data correctness concerns (column presence, row field validation, cross-field constraints). Separating them makes `validateCampaignData` independently testable and reusable if another file type (e.g. Excel/JSON) is added later — the data shape validation would not need to be re-implemented. `parseCsv` is now a thin adapter: validate the file, parse it, hand the rows to the validator.

**Prompt:** Split `parseCsv.ts` — move `EXPECTED_HEADERS`, column validation, empty-file check, headerMap/get helper, and row validation into a new `validateCampaignData(data, fields): CsvParseResult` function in `validateCampaignData.ts`. Reduce `parseCsv` to file-level checks + PapaParse, calling `validateCampaignData` in the `complete` callback.

**What changed:**
- `app/src/features/csv-file/utils/validateCampaignData.ts` — new file; owns `EXPECTED_HEADERS`, column check, empty-file check, headerMap/get, row validation, and result assembly
- `app/src/features/csv-file/utils/parseCsv.ts` — reduced to file type/size guards + PapaParse wrapper; delegates to `validateCampaignData`

**Key decisions & why:**
- `validateCampaignData` takes `(data, fields)` not a raw PapaParse result — keeps it decoupled from the parser, so it can be called from any source that produces rows and header field names


## [#158] Add parse_error type for PapaParse failures
**Type:** fix

**Summary:** Replaced the semantically incorrect `'file_type'` error type used in the PapaParse `error` callback with a new `'parse_error'` type, and wired it into the UploadModal handler.

**Brainstorming:** The PapaParse `error` callback fires when the parser itself fails — not when the file type is wrong (that check happens earlier). Reusing `'file_type'` was misleading. Adding `'parse_error'` makes the error union exhaustive and accurate. UploadModal already had a clean switch on error type; `parse_error` slots in alongside `file_size` and `empty_file` since all three show the message inline on the form.

**Prompt:** Add `'parse_error'` to `CsvValidationErrorType`. Update the PapaParse error callback in `parseCsv.ts` to emit `type: 'parse_error'`. Handle it explicitly in `UploadModal.vue` alongside `file_size` and `empty_file`.

**What changed:**
- `app/src/features/csv-file/types/index.ts` — `'parse_error'` added to `CsvValidationErrorType`
- `app/src/features/csv-file/utils/parseCsv.ts` — PapaParse error callback type changed from `'file_type'` to `'parse_error'`
- `app/src/features/csv-file/components/UploadModal.vue` — `parse_error` added to the inline-message condition alongside `file_size` and `empty_file`

**Key decisions & why:**
- `parse_error` grouped with `file_size`/`empty_file` in the handler — all three result in an inline form error with the raw message; no row table needed


## [#159] Extract extractCampaignFields helper and remove debug log
**Type:** fix

**Summary:** Extracted the per-row field reading logic into a named `extractCampaignFields(row, headerMap)` function and removed the stray `console.log(row)` debug statement from `validateCampaignData.ts`.

**Brainstorming:** The inline `get` helper and the seven field assignments were cohesive enough to pull into a named function — it improves readability, makes the row loop body shorter, and removes the need for the closure over `headerMap` inside `validateCampaignData`. The `console.log` was a debug leftover that should never have been committed; removing it is part of the same cleanup.

**Prompt:** Create a `extractCampaignFields(row, headerMap)` function in `validateCampaignData.ts` that returns a `Campaign` object with all seven fields extracted and coerced. Replace the inline `get` helper and the seven `const` assignments in the `forEach` loop with a single destructured call to the new function. Remove the `console.log(row)` debug line.

**What changed:**
- `app/src/features/csv-file/utils/validateCampaignData.ts` — added `extractCampaignFields` function; replaced inline `get` helper + seven field `const` declarations with destructured call; removed `console.log(row)`

**Key decisions & why:**
- `extractCampaignFields` returns a full `Campaign` shape — lets TypeScript enforce all seven fields are present and correctly typed at the extraction boundary
- `get` helper moved inside `extractCampaignFields` — it only makes sense in that context, no need to expose it further


## [#160] Add isValidString, isNonNegativeNumber, isNonNegativeInteger helpers to validateCampaignData
**Type:** update

**Summary:** Added three named guard functions and replaced all inline validation expressions with calls to them throughout `validateCampaignData.ts`.

**Brainstorming:** The validation conditions were correct but expressed as inline expressions — `!isNaN(x) && x >= 0 && Number.isInteger(x)`, `isNaN(budget) || budget <= 0`, etc. Extracting them into named predicates makes each validation line read as a business rule rather than a type-check expression. `isValidString` also adds explicit rejection of the literal strings `'undefined'` and `'null'` which raw CSV cells can contain after PapaParse stringification.

**Prompt:** Add `isValidString(value?)`, `isNonNegativeNumber(value)`, and `isNonNegativeInteger(value)` functions to `validateCampaignData.ts` and use them to replace all inline validation expressions in the row validation loop.

**What changed:**
- `app/src/features/csv-file/utils/validateCampaignData.ts` — three guard functions added at the top; `campaign`/`channel` checks use `isValidString`; `budget` uses `!isNonNegativeNumber || budget === 0`; `impressions`/`clicks`/`conversions` use `isNonNegativeInteger`; `revenue` uses `!isNonNegativeNumber`

**Key decisions & why:**
- `budget` keeps a separate `=== 0` check alongside `isNonNegativeNumber` — budget must be strictly positive, while `isNonNegativeNumber` allows zero (shared with `revenue`)
- `isValidString` rejects `'undefined'` and `'null'` literals — raw CSV cells can carry these strings after PapaParse stringification of missing values


## [#161] Extract buildHeaderMap helper in validateCampaignData
**Type:** update

**Summary:** Extracted the header map construction into a named `buildHeaderMap(fields)` function using `reduce`, replacing the imperative `forEach` mutation pattern.

**Brainstorming:** The two-line `forEach` mutation was a minor but noisy side-effect pattern inside an otherwise functional pipeline. A named `reduce`-based function is self-documenting and has no mutable intermediate variable.

**Prompt:** Create a `buildHeaderMap(fields: string[]): Record<string, string>` function using `reduce` and replace the inline `headerMap` construction in `validateCampaignData`.

**What changed:**
- `app/src/features/csv-file/utils/validateCampaignData.ts` — `buildHeaderMap` added; inline `forEach` mutation replaced with `const headerMap = buildHeaderMap(fields)`

**Key decisions & why:**
- `reduce` with an explicit `{}` accumulator keeps the function pure — no external mutation


## [#162] Extract processRows function in validateCampaignData
**Type:** update

**Summary:** Extracted the row iteration and per-row validation logic into a dedicated `processRows(data, headerMap)` function returning `{ campaigns, errors }`, leaving `validateCampaignData` as a thin coordinator for file-level checks.

**Brainstorming:** `validateCampaignData` was mixing file-level concerns (missing columns, empty file) with row-level concerns (field extraction, cross-field validation, accumulation). Splitting them makes each function single-purpose. A `ProcessRowsResult` interface names the return shape explicitly.

**Prompt:** Create a `processRows(data, headerMap)` function that owns the `forEach` loop, per-row field validation, and result accumulation, returning `{ campaigns: Campaign[], errors: CsvRowError[] }`. Replace the inline loop in `validateCampaignData` with a call to it.

**What changed:**
- `app/src/features/csv-file/utils/validateCampaignData.ts` — `ProcessRowsResult` interface added; `processRows` function added with full row loop; `validateCampaignData` replaced its row section with `const { campaigns, errors: rowErrors } = processRows(data, headerMap)`

**Key decisions & why:**
- `ProcessRowsResult` is a local interface, not exported — it is only relevant to the internal split between `processRows` and `validateCampaignData`


## [#163] Replace CsvRowError.issue string with typed CsvRowIssueType and extract error-messages util
**Type:** update

**Summary:** Replaced the free-form `issue: string` on `CsvRowError` with a `CsvRowIssueType` union and an optional `details` field, and moved all display messages into a new `error-messages.ts` utility with a `getRowErrorMessage` function.

**Brainstorming:** A plain string `issue` field forces display logic into the data model — any consumer must know what strings are valid. A typed union makes issue codes exhaustive and refactor-safe. Separating the display message map into `error-messages.ts` keeps the types and validator free of presentation concerns. The `exceeds` issue type uses `details` to carry the field name being exceeded, so the message map stays a flat `Record` with no special cases.

**Prompt:** Add `CsvRowIssueType` union to `types/index.ts`, update `CsvRowError.issue` to use it, add optional `details?: string`. Create `utils/error-messages.ts` with `ROW_ISSUE_MESSAGES` map and `getRowErrorMessage(error)` function. Update `validateCampaignData.ts` to push typed issue codes. Update `CsvErrorTable.vue` to display `getRowErrorMessage(err)`.

**What changed:**
- `app/src/features/csv-file/types/index.ts` — `CsvRowIssueType` union added; `CsvRowError.issue` typed to it; `details?: string` added
- `app/src/features/csv-file/utils/error-messages.ts` — new file; `ROW_ISSUE_MESSAGES` record + `getRowErrorMessage(error)` export
- `app/src/features/csv-file/utils/validateCampaignData.ts` — all `rowErrors.push` calls updated to use typed issue codes; `exceeds` issues include `details` field
- `app/src/features/csv-file/components/CsvErrorTable.vue` — imports `getRowErrorMessage`; template uses it instead of `err.issue`

**Key decisions & why:**
- `exceeds` is a single issue type with `details` carrying the field name — avoids proliferating `exceeds_impressions`/`exceeds_clicks` variants while keeping the message map flat
- Display messages live only in `error-messages.ts` — types and validator have no knowledge of how issues are presented


## [#164] Extract validateRow function in validateCampaignData
**Type:** update

**Summary:** Extracted per-row field validation into a `validateRow(fields, rowNum)` function that returns only the errors for that row, leaving `processRows` as a thin accumulator loop.

**Brainstorming:** The validation checks for all seven fields were inline inside the `forEach` in `processRows`, mixing iteration concerns with field-level rules. `validateRow` now has a single responsibility: given extracted field values and a row number, return any errors. `processRows` becomes a clean loop that extracts fields, delegates validation, and accumulates results.

**Prompt:** Create a `validateRow(fields: Campaign, rowNum: number): CsvRowError[]` function containing all field checks. Update `processRows` to call it and use the returned errors array instead of an inline `rowErrors` accumulator.

**What changed:**
- `app/src/features/csv-file/utils/validateCampaignData.ts` — `validateRow` added with all field checks; `processRows` forEach simplified to extract → validate → accumulate

**Key decisions & why:**
- `validateRow` takes a `Campaign` (already extracted) rather than a raw row + headerMap — keeps it decoupled from parsing, pure over typed values only


## [#165] Split validateRow into validateStringFields, validateNumericFields, validateFunnelFields
**Type:** update

**Summary:** Split `validateRow` into three focused validators grouped by field type, with `validateRow` reduced to a one-liner that spreads all three results.

**Brainstorming:** `validateRow` had a complexity of 14 from mixing string, numeric, and funnel (cross-field) checks. The natural grouping is: string fields (campaign/channel — empty check), numeric fields (budget/revenue — range checks), and funnel fields (impressions/clicks/conversions — integer + cross-field ordering constraints). Each group is independently testable. `validateRow` becomes a pure composition.

**Prompt:** Split `validateRow` into `validateStringFields(campaign, channel, rowNum)`, `validateNumericFields(budget, revenue, rowNum)`, and `validateFunnelFields(impressions, clicks, conversions, rowNum)`, each returning `CsvRowError[]`. Reduce `validateRow` to spread all three.

**What changed:**
- `app/src/features/csv-file/utils/validateCampaignData.ts` — three focused validators added; `validateRow` reduced to a spread of all three results

**Key decisions & why:**
- Funnel fields grouped together because their cross-field ordering constraints (`clicks ≤ impressions`, `conversions ≤ clicks`) require shared validity flags — splitting them further would require passing those flags across boundaries


## [#166] Move validateRow and helpers into validateRow.ts
**Type:** update

**Summary:** Extracted `validateRow`, `validateStringFields`, `validateNumericFields`, `validateFunnelFields`, and the three guard helpers into a new `validateRow.ts`, leaving `validateCampaignData.ts` importing only `validateRow`.

**Brainstorming:** All row-level validation logic was inline in `validateCampaignData.ts` alongside the file/column-level checks. Moving it to its own file gives each file a single responsibility: `validateRow.ts` owns field rules, `validateCampaignData.ts` owns structural checks (headers, empty file) and result assembly.

**Prompt:** Move `isValidString`, `isNonNegativeNumber`, `isNonNegativeInteger`, `validateStringFields`, `validateNumericFields`, `validateFunnelFields`, and `validateRow` into a new `utils/validateRow.ts`. Export only `validateRow`. Import it in `validateCampaignData.ts` and remove the moved functions.

**What changed:**
- `app/src/features/csv-file/utils/validateRow.ts` — new file; owns all row-level validation logic; exports only `validateRow`
- `app/src/features/csv-file/utils/validateCampaignData.ts` — removed all moved functions; imports `validateRow` from `./validateRow`

**Key decisions & why:**
- Only `validateRow` is exported — the three sub-validators and guard helpers are implementation details of the row validation module


## [#167] Rename validateRow.ts to validateRowData.ts
**Type:** update

**Summary:** Renamed `validateRow.ts` to `validateRowData.ts` and updated the import in `validateCampaignData.ts`.

**Brainstorming:** The new name is consistent with the `validateCampaignData` naming convention — both files describe what they validate, not just the action.

**Prompt:** Rename `utils/validateRow.ts` to `utils/validateRowData.ts` and update the import path in `validateCampaignData.ts`.

**What changed:**
- `app/src/features/csv-file/utils/validateRow.ts` → renamed to `validateRowData.ts`
- `app/src/features/csv-file/utils/validateCampaignData.ts` — import path updated to `./validateRowData`

**Key decisions & why:**
- Name aligned with `validateCampaignData` convention — file names describe the data being validated, not just the operation


## [#168] Unify error handling — CsvFieldIssue type, sub-validators return field-only issues
**Type:** update

**Summary:** Added `CsvFieldIssue` as the base type for field-level validation results, made `CsvRowError` extend it, stripped `rowNum` from the three sub-validators so they return pure field issues, and updated `validateRow` to map issues to `CsvRowError` by adding `row`. Updated `error-messages.ts` to accept `CsvFieldIssue` instead of `CsvRowError`.

**Brainstorming:** The sub-validators previously received `rowNum` only to construct the full `CsvRowError` shape — mixing structural row identity with field validation rules. Separating the two means sub-validators are purely about which fields are wrong and why; `validateRow` is the single place that stamps the row number. `getRowErrorMessage` only ever needed `issue` and `details`, so accepting `CsvFieldIssue` is more accurate than `CsvRowError`.

**Prompt:** Add `CsvFieldIssue { column, issue, details? }` to types. Make `CsvRowError` extend it with `row`. Strip `rowNum` from `validateStringFields`, `validateNumericFields`, `validateFunnelFields` — return `CsvFieldIssue[]`. In `validateRow`, collect all issues then map to `CsvRowError[]` with `row: rowNum`. Update `error-messages.ts` to import and use `CsvFieldIssue`.

**What changed:**
- `app/src/features/csv-file/types/index.ts` — `CsvFieldIssue` interface added; `CsvRowError` now extends it
- `app/src/features/csv-file/utils/validateRowData.ts` — sub-validators return `CsvFieldIssue[]`, no `rowNum` param; `validateRow` maps issues to `CsvRowError[]`
- `app/src/features/csv-file/utils/error-messages.ts` — `getRowErrorMessage` param type changed from `CsvRowError` to `CsvFieldIssue`

**Key decisions & why:**
- `CsvRowError extends CsvFieldIssue` rather than duplicating fields — keeps the type hierarchy explicit and `CsvErrorTable` continues to work unchanged since `CsvRowError` still satisfies `CsvFieldIssue`


## [#169] Revert rowNum removal from sub-validators in validateRowData
**Type:** fix

**Summary:** Restored `rowNum` as a parameter in `validateStringFields`, `validateNumericFields`, and `validateFunnelFields` — sub-validators continue to return `CsvRowError[]` with `row` stamped directly.

**Brainstorming:** The previous change stripped `rowNum` from sub-validators and moved the mapping to `validateRow`. The user confirmed `rowNum` should stay in the sub-validators. The `CsvFieldIssue` type and `getRowErrorMessage` signature update from #168 are retained — only the sub-validator signatures and return types are reverted.

**Prompt:** Restore `rowNum` parameter and `CsvRowError[]` return type in all three sub-validators. Revert `validateRow` to spreading results directly.

**What changed:**
- `app/src/features/csv-file/utils/validateRowData.ts` — `rowNum` restored in all sub-validators; return type reverted to `CsvRowError[]`; `validateRow` reverted to direct spread (no mapping)

**Key decisions & why:**
- `CsvFieldIssue` type and `getRowErrorMessage(error: CsvFieldIssue)` from #168 are kept — they are still accurate and useful for the display layer


## [#170] Unify error types — missingColumns field, ProcessRowsResult moved to types
**Type:** update

**Summary:** Replaced the generic `details?: string[]` on `CsvValidationError` with a dedicated `missingColumns?: string[]` field, moved `ProcessRowsResult` from a local interface into `types/index.ts`, and updated all consumers.

**Brainstorming:** `details` was a loosely-typed catch-all only ever used for missing column names. A named field is self-documenting and type-safe. `ProcessRowsResult` was a local interface in `validateCampaignData.ts` that duplicated the concept of a parse result — moving it to types makes it available to any future consumer and keeps all types in one place.

**Prompt:** Replace `details?: string[]` with `missingColumns?: string[]` on `CsvValidationError`. Add `ProcessRowsResult` to `types/index.ts`. Remove the local `ProcessRowsResult` interface from `validateCampaignData.ts` and import it from types. Update `validateCampaignData.ts` to use `missingColumns` in the error object. Update `UploadModal.vue` to read `err.missingColumns`.

**What changed:**
- `app/src/features/csv-file/types/index.ts` — `details?: string[]` replaced with `missingColumns?: string[]`; `ProcessRowsResult` exported
- `app/src/features/csv-file/utils/validateCampaignData.ts` — local `ProcessRowsResult` removed; imported from types; `missing_columns` error uses `missingColumns` field
- `app/src/features/csv-file/components/UploadModal.vue` — `err.details` updated to `err.missingColumns`

**Key decisions & why:**
- `missingColumns` instead of `details` — the field name describes exactly what it carries; avoids the ambiguity of a generic `details` array


## [#171] Move validation error messages to error-messages.ts
**Type:** update

**Summary:** Moved all hardcoded error message strings from `validateCampaignData.ts` into `error-messages.ts`, making it the single source of truth for all CSV validation display text.

**Brainstorming:** `validateCampaignData.ts` still contained three inline string literals: `'CSV file headers are missing.'`, `'The CSV file contains no data rows.'`, and the dynamic invalid-rows message. These belong alongside the row-level issue messages in `error-messages.ts` so that any future text change has one place to go.

**Prompt:** Move the three hardcoded error message strings from `validateCampaignData.ts` into `error-messages.ts`. Add a `VALIDATION_MESSAGES` constant for the static strings and a `getInvalidRowsMessage(count)` function for the dynamic one. Import and use them in `validateCampaignData.ts`.

**What changed:**
- `app/src/features/csv-file/utils/error-messages.ts` — added `VALIDATION_MESSAGES` (missing_columns, empty_file) and `getInvalidRowsMessage(invalidRowCount)`
- `app/src/features/csv-file/utils/validateCampaignData.ts` — imported `VALIDATION_MESSAGES` and `getInvalidRowsMessage`; replaced all three inline strings with the imported values

**Key decisions & why:**
- `VALIDATION_MESSAGES` as a plain object rather than a `Record<CsvValidationErrorType, string>` — not all error types have static messages (`invalid_rows` is dynamic), so a complete record would require a placeholder or a different type


## [#172] Move all validation display text to error-messages.ts — consumed by UI
**Type:** update

**Summary:** Removed all display strings from the validation and parse layers; `error-messages.ts` now owns all message mapping via `getValidationErrorMessage`, which the UI calls directly.

**Brainstorming:** `validateCampaignData.ts` and `parseCsv.ts` had no reason to know about display text — they only need to return typed error data. `UploadModal.vue` was also duplicating the missing-columns message inline. The fix is to strip `message` from `CsvValidationError`, add `detail?: string` for the one dynamic case (PapaParse error text), and centralise all string mapping in `getValidationErrorMessage` inside `error-messages.ts`. The UI then calls that one function for every non-`invalid_rows` case, which also eliminates the branching in `handleSubmit`.

**Prompt:** Remove `message` from `CsvValidationError` and add `detail?: string`. Add `getValidationErrorMessage(error: CsvValidationError): string` to `error-messages.ts` covering all six error types. Strip all message strings from `validateCampaignData.ts` and `parseCsv.ts` — `parseCsv` carries the PapaParse message via `detail`. Update `UploadModal.vue` to call `getValidationErrorMessage(err)` instead of reading `err.message` or building the missing-columns string inline. Remove previous `VALIDATION_MESSAGES` / `getInvalidRowsMessage` exports.

**What changed:**
- `app/src/features/csv-file/types/index.ts` — `message: string` replaced with `detail?: string` on `CsvValidationError`
- `app/src/features/csv-file/utils/error-messages.ts` — removed `VALIDATION_MESSAGES` and `getInvalidRowsMessage` exports; added `getValidationErrorMessage(error: CsvValidationError): string` covering all six error types
- `app/src/features/csv-file/utils/validateCampaignData.ts` — removed error-messages import; all error objects now carry only typed fields (no `message`)
- `app/src/features/csv-file/utils/parseCsv.ts` — removed `message` from `file_type` and `file_size` errors; `parse_error` now uses `detail: err.message`
- `app/src/features/csv-file/components/UploadModal.vue` — imports `getValidationErrorMessage`; `handleSubmit` reduced to one `invalid_rows` branch + a single `parseError.value = getValidationErrorMessage(err)` fallback

**Key decisions & why:**
- `detail?: string` instead of keeping `message` — `detail` signals "raw external data" (the PapaParse error string), distinct from a user-facing message which now lives only in `error-messages.ts`
- `getValidationErrorMessage` handles all six types including `invalid_rows` — completeness, even though `UploadModal` currently doesn't call it for that case


## [#173] Use placeholder pattern for variable content in validation error messages
**Type:** update

**Summary:** Replaced inline string interpolation in `getValidationErrorMessage` with a `{placeholder}` pattern — all message text lives in `VALIDATION_ERROR_MESSAGES`, variable content is substituted via `replacePlaceholders`.

**Brainstorming:** The previous implementation mixed message text with logic inside the switch branches. The user wanted the text fully captured in a const map, with `{cols}`, `{count}`, `{rows}`, and `{detail}` as named placeholders substituted at call time. A small `replacePlaceholders` helper uses a regex replace to fill them in.

**Prompt:** Move all display text into a `VALIDATION_ERROR_MESSAGES` const map. Use `{placeholder}` syntax for variable content (`{cols}`, `{count}`, `{rows}`, `{detail}`). Add `replacePlaceholders(template, values)` to resolve them. `getValidationErrorMessage` looks up the template, resolves values per error type, and returns the filled string.

**What changed:**
- `app/src/features/csv-file/utils/error-messages.ts` — added `VALIDATION_ERROR_MESSAGES` const map with `{placeholder}` syntax; added `replacePlaceholders` helper; `getValidationErrorMessage` now looks up template and substitutes values per error type

**Key decisions & why:**
- `{rows}` placeholder resolves to `'row'`/`'rows'` separately from `{count}` — keeps the full sentence in the template rather than splitting text across code


## [#174] Rename csv-file/utils files to kebab-case
**Type:** update

**Summary:** Renamed all camelCase files in `csv-file/utils/` to kebab-case and updated every import path referencing them.

**Brainstorming:** Four files were still camelCase (`downloadCsv.ts`, `parseCsv.ts`, `validateCampaignData.ts`, `validateRowData.ts`); `error-messages.ts` was already kebab-case. Renaming required updating imports in `useDownloadTemplate.ts`, `parse-csv.ts`, `validate-campaign-data.ts`, and `UploadModal.vue`.

**Prompt:** Rename all files in `csv-file/utils/` to kebab-case. Update all import paths that reference the renamed files.

**What changed:**
- `csv-file/utils/downloadCsv.ts` → `download-csv.ts`
- `csv-file/utils/parseCsv.ts` → `parse-csv.ts`
- `csv-file/utils/validateCampaignData.ts` → `validate-campaign-data.ts`
- `csv-file/utils/validateRowData.ts` → `validate-row-data.ts`
- `csv-file/composables/useDownloadTemplate.ts` — import path updated
- `csv-file/utils/parse-csv.ts` — import path updated
- `csv-file/utils/validate-campaign-data.ts` — import path updated
- `csv-file/components/UploadModal.vue` — import path updated
- `CLAUDE.md` — architecture section updated with new file names and added missing `error-messages.ts` and `validate-row-data.ts` entries

**Key decisions & why:**
- All five utils now consistently kebab-case — matches the project convention used by SCSS partials, components, and the already-named `error-messages.ts`


## [#175] Move inline pluralization logic from CsvErrorTable template to error-messages.ts
**Type:** fix

**Summary:** Extracted repeated ternary pluralization logic from `CsvErrorTable.vue`'s template into a `getRowErrorSummaryWords` function in `error-messages.ts`, consumed via a single `summaryWords` computed property.

**Brainstorming:** The template contained five inline ternary expressions (`row/rows`, `contains/contain`, `was/were`, `totalRowWord`, `validRowWord`) duplicating the pluralization pattern already established in `error-messages.ts`. The fix centralises this logic in `error-messages.ts` as a typed `RowErrorSummaryWords` interface + `getRowErrorSummaryWords(invalidCount, validCount)` function. The component computes `summaryWords` once and the template only reads values from it.

**Prompt:** `CsvErrorTable` includes duplicated logic with `error-messages`. Move the pluralization logic out of the template; keep only values in the template.

**What changed:**
- `csv-file/utils/error-messages.ts` — added `RowErrorSummaryWords` interface and `getRowErrorSummaryWords(invalidCount, validCount)` exported function
- `csv-file/components/CsvErrorTable.vue` — imported `getRowErrorSummaryWords`; added `summaryWords` computed; replaced all five inline ternaries in the template with `summaryWords.*` bindings

**Key decisions & why:**
- Returned a plain object (`RowErrorSummaryWords`) rather than individual functions — a single `computed` call in the component is enough; no need for five separate imports
- `totalRowWord` and `validRowWord` derived from their respective counts inside the helper — keeps all pluralization logic in one place


## [#176] Add duplicate campaign detection and resolution UI to CSV upload flow
**Type:** feature

**Summary:** Extended CSV validation to detect rows with duplicate campaign names, added a new `CsvDuplicateTable` view where users select which row to keep per group, and wired the full sequential flow in `UploadModal` so both row errors and duplicates can coexist.

**Brainstorming:** Duplicate detection needed to happen after row validation, operating on the set of valid rows only. `processRows` was updated to return row numbers alongside campaigns so duplicate groups can reference original file rows. `findDuplicateGroups` groups by case-insensitive campaign name and separates unique entries from groups of two or more. The `CsvParseResult` returns both `invalid_rows` and `duplicate_campaigns` errors independently, allowing `UploadModal` to handle them sequentially (row-errors view → duplicate-rows view). The proceed button in `CsvDuplicateTable` is disabled only when `validCampaigns.length === 0 AND no selections` — if valid non-duplicate campaigns exist, the user can always proceed (skipping unresolved groups). Two test CSV files were created: one with duplicates alongside valid unique campaigns, and one with only duplicate groups to exercise the disabled-proceed path.

**Prompt:** Data validation should also check for duplicate campaigns. A new error type is needed. Users should see duplicate rows in a table and select one row per group. Groups should be shown by campaign name. A message should explain that duplicates are excluded until selected. This should also appear when there are partially correct campaigns. If there are only errors and duplicates with no selection, proceed must be disabled. Also create two test CSV files: one with 3 duplicate groups and valid data, one with only 3 duplicate groups.

**What was built:**
- `csv-file/types/index.ts` — added `CsvValidCampaignEntry` (rowNum + Campaign), `CsvDuplicateGroup` (campaignName + rows), `'duplicate_campaigns'` to `CsvValidationErrorType`, `duplicateGroups?` field on `CsvValidationError`; updated `ProcessRowsResult.campaigns` to `CsvValidCampaignEntry[]`
- `csv-file/utils/validate-campaign-data.ts` — updated `processRows` to return `CsvValidCampaignEntry[]`; added `findDuplicateGroups` (case-insensitive grouping); updated `validateCampaignData` to accumulate both `invalid_rows` and `duplicate_campaigns` errors instead of early-returning on row errors
- `csv-file/utils/error-messages.ts` — added `'duplicate_campaigns'` to `VALIDATION_ERROR_MESSAGES` record (required by `Record<CsvValidationErrorType, string>`)
- `csv-file/components/CsvErrorTable.vue` — added `duplicateGroupCount` prop; `showProceed` computed (visible when validCampaigns > 0 OR duplicateGroupCount > 0); `proceedLabel` computed ('Proceed with valid rows' vs 'Review duplicate campaigns'); `duplicateNote` computed shown as warning text when duplicateGroupCount > 0
- `csv-file/components/CsvDuplicateTable.vue` — new component; shows duplicate groups with radio selection per row; 8-column horizontally scrollable table; `canProceed` computed; emits `proceed([Campaign[]])` with only selected campaigns; Back/Cancel buttons
- `csv-file/components/UploadModal.vue` — added `'duplicate-rows'` view, `duplicateGroups` ref; updated `handleSubmit` to detect both error types and route accordingly; separate `handleBackFromErrors`, `handleProceedFromErrors`, `handleBackFromDuplicates`, `handleProceedFromDuplicates` handlers
- `test-data/duplicates-with-valid.csv` — 3 duplicate groups (Summer Blast ×2, SEO Drive ×3, Retargeting Push ×3) plus 4 valid unique campaigns
- `test-data/duplicates-only.csv` — same 3 duplicate groups, no other valid data (exercises disabled-proceed state)

**Key decisions & why:**
- Both errors accumulated and returned together from `validateCampaignData` — allows `UploadModal` to decide routing; early-return would hide duplicates when row errors also exist
- `processRows` returns row numbers in `CsvValidCampaignEntry` — needed so the duplicate table can display the original file row for each candidate row; row number is not part of `Campaign` and should not be
- Proceed disabled only when `validCampaigns.length === 0 && selections.size === 0` — if there are already valid campaigns, the user can always proceed and skip unresolved groups; forcing all groups to be resolved before proceeding would be too strict
- `findDuplicateGroups` uses case-insensitive name comparison — same campaign name in different casing is the same campaign from the user's perspective
- Sequential views (row-errors then duplicate-rows) rather than combined — keeps each view focused; `Back` from duplicate-rows returns to row-errors when row errors exist, otherwise to form


## [#177] Introduce CsvCampaign extended model with mapper boundary
**Type:** refactor

**Summary:** Replaced the `CsvValidCampaignEntry` wrapper with a `CsvCampaign` interface that extends `Campaign` with `rowNum`, extracted duplicate detection into `detect-campaign-duplication.ts`, and introduced a `map-campaign.ts` mapper that strips `rowNum` before data enters the store.

**Brainstorming:** The `CsvValidCampaignEntry` wrapper (`{ rowNum, campaign }`) required unwrapping at every use site. Extending `Campaign` directly as `CsvCampaign` lets all CSV-internal code access fields without indirection while keeping `Campaign` clean for the rest of the app. The mapper (`toCampaign` / `toCampaigns`) is the single boundary — called only in `UploadModal` just before `campaignStore.loadCampaigns`. Duplicate detection moved to its own file as discussed, keeping `validate-campaign-data.ts` focused on orchestration.

**Prompt:** Create an extended campaign model for CSV upload. Before storing in the campaign store, remove the extra field via a mapper function. Extract duplicate detection into a separate file `detect-campaign-duplication.ts`.

**What changed:**
- `csv-file/types/index.ts` — replaced `CsvValidCampaignEntry` with `CsvCampaign extends Campaign { rowNum: number }`; updated `CsvDuplicateGroup.rows`, `CsvParseResult.campaigns`, `ProcessRowsResult.campaigns` to `CsvCampaign[]`
- `csv-file/utils/detect-campaign-duplication.ts` — new file; `detectCampaignDuplication(campaigns)` extracted from `validate-campaign-data.ts`
- `csv-file/utils/map-campaign.ts` — new file; `toCampaign` destructures out `rowNum`; `toCampaigns` maps an array
- `csv-file/utils/validate-campaign-data.ts` — `processRows` spreads `{ ...fields, rowNum }` into `CsvCampaign`; delegates to `detectCampaignDuplication`; removed `findDuplicateGroups`
- `csv-file/components/CsvErrorTable.vue` — `validCampaigns` prop type updated to `CsvCampaign[]`
- `csv-file/components/CsvDuplicateTable.vue` — all types updated to `CsvCampaign`; `entry.campaign.*` field accesses simplified to `entry.*` since fields are top-level; emits `CsvCampaign[]`
- `csv-file/components/UploadModal.vue` — state types updated to `CsvCampaign[]`; `toCampaigns` called at every `campaignStore.loadCampaigns` call site

**Key decisions & why:**
- `CsvCampaign extends Campaign` rather than a wrapper — direct field access throughout CSV parsing code; wrapper required destructuring at every use site
- Mapper lives only in `UploadModal` — it is the single boundary between CSV parsing and the store; no other file needs to know about the mapping
- `detect-campaign-duplication.ts` as a standalone file — single responsibility; testable in isolation; keeps `validate-campaign-data.ts` as an orchestrator
