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

**Prompt:** Split components.scss into individual SCSS partials per concern (badge, button, card, forms, modal, roi, scrollbar, table, ai-summary). Add a utilities.scss entry file for utility-layer classes. Replace the feature-specific AiTabs.vue with a generic reusable Tabs.vue in the UI library. Remove Badge.vue and move badge styling to global CSS classes. Add roi.ts shared utilities (roiValue, roiClass, formatROI) to common/utils. Extend Spinner with lg/xl/xxl size variants. Standardize icon sizing via inline style. Clean up Tailwind tokens — remove badge-* and panel-text flat keys, add danger.-5p, typography.intense, border.secondary.

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
- `app/tailwind.config.js` — removed `badge-*` and `panel-text` flat tokens; added `danger.-5p`, `typography.intense`, `border.secondary`, explicit `black`/`white` tokens

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


## [178] Create DataErrorsTable dumb component
**Type:** feature

**Summary:** Created a new `validation/` folder inside `csv-file/components` with a dumb `DataErrorsTable.vue` that renders a sortable, scrollable error table using flat `@apply` styles and no BEM.

**Brainstorming:** The existing `CsvErrorTable.vue` mixes layout, summary copy, footer actions, and table rendering into one multi-root component. Extracting the table as a standalone dumb component (`DataErrorsTable`) makes it independently reusable — it only receives `CsvRowError[]` and renders rows. Sorting is kept local (no store, no emits) since it is purely a display concern. Scrollability is achieved by constraining the wrapper div, leaving the table header sticky. Styles use flat class names with `@apply` exclusively — no BEM.

**Prompt:** Create a `validation/` folder inside `csv-file/components`. Inside it, create `DataErrorsTable.vue` — a dumb component that only renders the error table. The Row column must be sortable (asc/desc). Table body must be scrollable. Use flat `@apply` styles, no BEM.

**What was built:**
- `csv-file/components/validation/DataErrorsTable.vue` — dumb table component; props: `errors: CsvRowError[]`; internal `sortDir` ref toggles asc/desc on the Row column; `sortedErrors` computed sorts by `err.row`; table wrapper has `overflow-y: auto` + `max-height: 260px`; sticky thead; flat `@apply` scoped styles; no BEM

**Key decisions & why:**
- Sort state kept local — purely a display concern, no parent needs to know the current sort direction
- `validation/` subfolder — signals intent to group validation-related rendering components separately from the parent modal's multi-root components
- Flat `@apply` only — aligns with the project-wide move away from BEM


## [179] Use DataErrorsTable in CsvErrorTable
**Type:** update

**Summary:** Replaced the inline table markup in `CsvErrorTable.vue` with the new `DataErrorsTable` component and removed the now-dead table styles.

**Brainstorming:** Straightforward swap — import the new component, replace the `<div class="error-table-wrapper"><table>...</table></div>` block with `<DataErrorsTable :errors="rowErrors" />`, drop the unused `getRowErrorMessage` import, and clean up the dead SCSS rules.

**Prompt:** Replace the table rendering inside CsvErrorTable with the new DataErrorsTable component.

**What changed:**
- `csv-file/components/CsvErrorTable.vue` — imported `DataErrorsTable`; replaced inline table markup with `<DataErrorsTable :errors="rowErrors" />`; removed unused `getRowErrorMessage` import; removed dead `.error-table-wrapper`, `.error-table__th`, `.error-table__td` SCSS blocks

**Key decisions & why:**
- Removed `getRowErrorMessage` import entirely — it was only used inside the now-extracted table rows
- Deleted all table-related scoped styles — they are now owned by `DataErrorsTable`


## [180] Scrollable tbody only in DataErrorsTable
**Type:** fix

**Summary:** Moved scrolling from the wrapper to `tbody` so the scrollbar appears only beside the data rows, while the header stays fixed above with its background and bottom border intact.

**Brainstorming:** The previous approach scrolled the entire `.table-wrapper` div, which dragged the `<thead>` along — solved with `sticky top-0` as a workaround. The cleaner approach is to set `tbody { display: block; overflow-y: auto }` and `tbody tr { display: table; table-layout: fixed; width: 100% }` so only the body scrolls. `thead` also becomes `display: table; width: 100%` to keep column widths in sync with `table-layout: fixed` on the table. Sticky is no longer needed; the header background is maintained with `bg-surface`.

**Prompt:** Make only the table body scrollable. Header should stay visible with its background and bottom border. No scrollbar beside the header.

**What changed:**
- `csv-file/components/validation/DataErrorsTable.vue` — removed `overflow-y: auto` / `max-height` from `.table-wrapper`; added `table-layout: fixed` on table; `thead` set to `display: table; w-full; bg-surface`; `tbody` set to `display: block; overflow-y: auto; max-height: 220px`; `tbody tr` set to `display: table; table-layout: fixed; w-full`; removed `thead th { sticky top-0 }`

**Key decisions & why:**
- `display: block` on `tbody` is the standard way to scroll only the body — requires syncing column widths via `table-layout: fixed` on both table and each `tbody tr`
- `bg-surface` on `thead` — ensures the header has a solid background so it visually separates from the scrolling rows beneath
- Removed sticky — no longer needed since the header is naturally above the scroll container


## [181] Fix column alignment in DataErrorsTable
**Type:** fix

**Summary:** Added explicit widths to `td` cell classes to realign columns after the `tbody display: block` change broke automatic width inheritance.

**Brainstorming:** With `tbody { display: block }`, thead and tbody are effectively separate table contexts — `table-layout: fixed` no longer propagates column widths from thead to tbody automatically. The fix is to mirror the same widths (`w-14`, `w-28`) on the `td` classes so both tables use identical column sizing.

**Prompt:** Columns are misaligned after the scrollable tbody change. Fix alignment.

**What changed:**
- `csv-file/components/validation/DataErrorsTable.vue` — added `w-14` to `.cell-row` and `w-28` to `.cell-col` to match thead column widths

**Key decisions & why:**
- Mirror widths on td classes rather than inline styles — keeps sizing in one place per column and consistent with the Tailwind @apply approach


## [182] Revert DataErrorsTable to sticky header approach
**Type:** fix

**Summary:** Reverted to scrolling the whole wrapper with a sticky `thead` — simpler, maintains column alignment naturally, and keeps the header pinned with a solid background.

**Brainstorming:** The `display: block` tbody approach broke column alignment because thead and tbody became separate layout contexts. The sticky header approach is simpler and correct: the wrapper scrolls, `thead th` gets `sticky top-0 bg-surface` so the header stays visible and its background covers scrolling content beneath it.

**Prompt:** Maintain column widths and make header stay on top — scroll can be on the whole table.

**What changed:**
- `csv-file/components/validation/DataErrorsTable.vue` — removed `display: block` tbody hacks; restored `overflow-y: auto; max-height: 260px` on `.table-wrapper`; `thead th` is `sticky top-0 bg-surface`; removed explicit widths from `.cell-row` / `.cell-col`

**Key decisions & why:**
- Sticky header on the wrapper scroll is the standard, alignment-safe solution — no width synchronization needed
- `bg-surface` on `thead th` prevents row content from bleeding through the header when scrolling


## [183] Add ArrowUpIcon to sort button in DataErrorsTable
**Type:** update

**Summary:** Created `ArrowUpIcon.vue`, exported it from the icons barrel, and replaced the `&#8593;` HTML entity in `DataErrorsTable` with the new icon component.

**Brainstorming:** The sort button used a raw HTML entity for the arrow, which is inconsistent with the rest of the icon system. A proper SVG icon component matches the existing pattern (same style as `ArrowLeftIcon`) and inherits `currentColor` and `1em` sizing automatically.

**Prompt:** Add an arrow icon to the sort button in DataErrorsTable.

**What was built:**
- `ui/icons/ArrowUpIcon.vue` — new inline SVG up arrow, same structure as `ArrowLeftIcon`
- `ui/icons/index.ts` — exported `ArrowUpIcon`
- `csv-file/components/validation/DataErrorsTable.vue` — imported `ArrowUpIcon`; replaced `&#8593;` span with `<ArrowUpIcon>` carrying the existing sort-icon / sort-icon--desc classes

**Key decisions & why:**
- Reused the rotate-180 class for descending — the icon is an up arrow that flips, consistent with the existing sort-icon--desc pattern


## [184] Thicker stroke on ArrowUpIcon
**Type:** fix

**Summary:** Increased `stroke-width` from `2` to `2.5` in `ArrowUpIcon.vue` for a bolder appearance at small sizes.

**Brainstorming:** At `1em` the arrow was too thin. A slight stroke increase makes it more legible without changing shape.

**Prompt:** Make ArrowUpIcon lines a bit wider.

**What changed:**
- `ui/icons/ArrowUpIcon.vue` — `stroke-width` updated from `2` to `2.5`

**Key decisions & why:**
- `2.5` over `3` — enough to be visually bolder while staying consistent with the fine-line icon style used elsewhere


## [#185] UI polish: extract DataErrorSummary, de-BEM modal classes, improve BaseModal accessibility
**Type:** update

**Summary:** Extracted a shared `DataErrorSummary` presentational component for CSV error screens, de-BEM'd modal global classes to flat names, and improved `BaseModal` with Teleport, accessibility attributes, and backdrop click-to-close.

**Brainstorming:** Both `CsvErrorTable` and `CsvDuplicateTable` had inline summary blocks with identical structure (title + badge + body text) — extracting `DataErrorSummary` as a slot-driven presentational component removes the duplication and makes the pattern reusable. Modal global classes (`modal__body`, `modal__footer`) were BEM-style holdovers — renamed to flat `modal-body` / `modal-footer` consistent with the project's move away from BEM. `BaseModal` was missing `Teleport`, which meant it rendered in-tree rather than on `body`; also added proper ARIA attributes and backdrop click-to-close for completeness.

**Prompt:** Read changed files on the feat/ui-polish branch and update CLAUDE.md and LOGS.md accordingly. This conversation is not logged.

**What changed:**
- `csv-file/components/validation/DataErrorSummary.vue` — new presentational component; three named slots (title, badge, summary); no props, no scoped styles; used by both error screens
- `csv-file/components/CsvErrorTable.vue` — replaced inline summary HTML with stacked `DataErrorSummary` instances rendered conditionally (invalid-only / partial-import / duplicate-notice)
- `csv-file/components/CsvDuplicateTable.vue` — replaced inline summary/notice markup with a single `DataErrorSummary` block
- `csv-file/components/validation/DataErrorsTable.vue` — refactored scoped styles to flat class names (`table-wrapper`, `col-row`, `col-campain`, `cell-row`, `cell-col`); thead uses `data-table-sticky-header`; sortable th uses `data-table-sortable-header`; removed hardcoded max-height from scoped style
- `styles/components/_modal.scss` — renamed `modal__body` → `modal-body`, `modal__footer` → `modal-footer`; added `.modal-body` class definition
- `ui/BaseModal.vue` — added `Teleport to="body"`; added `aria-modal="true"`, `role="dialog"`, `:aria-label="title"` on backdrop; added `@click.self` for backdrop click-to-close
- `csv-file/components/ReplaceDataModal.vue` — updated to use flat `modal-body` / `modal-footer` class names

**Key decisions & why:**
- `DataErrorSummary` uses only named slots, no props — keeps it maximally flexible; callers own all content including badge variant
- Flat modal class names (`modal-body` / `modal-footer`) over BEM — aligns with the established project direction away from BEM modifiers
- `Teleport to="body"` on `BaseModal` — ensures the modal and its backdrop render above all page content regardless of stacking context


## [#186] Sort rows by row number within duplicate groups in CsvDuplicateTable
**Type:** update

**Summary:** Added asc/desc sort toggle on the Row column in `CsvDuplicateTable` so rows within each duplicate group can be sorted by row number.

**Brainstorming:** The duplicate table shows rows grouped by campaign name. Sorting by row number helps users quickly orient themselves — especially in large files where duplicates may be far apart. The sort is applied per-group independently via a `sortedGroups` computed that maps each group's rows through a sort, leaving group order unchanged. Pattern mirrors `DataErrorsTable`.

**Prompt:** CsvDuplicate table should sort grouped data by row.

**What changed:**
- `csv-file/components/CsvDuplicateTable.vue` — imported `ArrowUpIcon`; added `SortDir` type, `sortDir` ref, `toggleSort`, `sortedGroups` computed (sorts rows within each group by `rowNum`); Row `th` changed to `data-table-sortable-header` with sort button and `ArrowUpIcon`; `thead` gets `data-table-sticky-header`; `v-for` switched from `duplicateGroups` to `sortedGroups`

**Key decisions & why:**
- Sort per group (not global re-ordering of groups) — group identity is the primary structure; row sort is a secondary navigation aid within each group
- Reused `data-table-sortable-header` / `data-table-sticky-header` global classes — consistent with `DataErrorsTable` and avoids new scoped styles


## [#187] Add sorting by conversions and revenue to CsvDuplicateTable
**Type:** update

**Summary:** Extended the row sort in `CsvDuplicateTable` to support sorting by conversions and revenue, with a shared sort key + direction state so only one column is active at a time.

**Brainstorming:** The existing single-column sort was refactored to a two-ref pattern (`sortKey` + `sortDir`) so multiple columns can share the same sort state cleanly. Switching to a new column resets direction to asc. A `sortIconClass(key)` helper drives the active/inactive visual state of each sort icon — inactive columns show the dimmed icon, active column shows bright asc/desc. Numeric sortable headers need right-aligned buttons, handled with a scoped `.col-sortable-num` rule adding `justify-end w-full` to the inner button.

**Prompt:** Add sorting for revenue and conversions.

**What changed:**
- `csv-file/components/CsvDuplicateTable.vue` — replaced `sortDir`-only state with `sortKey` + `sortDir` refs; added `SortKey` type (`'rowNum' | 'conversions' | 'revenue'`); `toggleSort(key)` switches key (resets to asc) or toggles direction on same key; `sortIconClass(key)` returns asc/desc/empty class object; `sortedGroups` sorts by `a[sortKey] - b[sortKey]`; Conversions and Revenue th elements converted to `data-table-sortable-header col-sortable-num` with sort buttons; scoped `.col-sortable-num > button` adds `justify-end w-full` for right alignment

**Key decisions & why:**
- Single `sortKey` + `sortDir` over per-column state — only one column is ever active; simpler and matches standard table sort UX
- `sortIconClass` helper over inline ternary — keeps template readable when the same expression is repeated across three columns
- `.col-sortable-num` scoped class for right alignment — avoids touching the global `data-table-sortable-header` style which is left-aligned by default for the Row column


## [#188] Refactor CsvDuplicateTable styles to match DataErrorsTable flat naming
**Type:** refactor

**Summary:** Replaced all BEM class names in `CsvDuplicateTable` with flat names and converted all style rules to `@apply`, matching the pattern established in `DataErrorsTable`.

**Brainstorming:** The table had two BEM parent blocks (`duplicate-table__th` and `duplicate-table__td`) with element/modifier children, plus `duplicate-table__row` with BEM modifiers. These were all renamed to flat, semantic class names (`col-select`, `col-channel`, `col-num`, `cell-select`, `cell-row`, `cell-num`, `group-header`, `row-selectable`, `row-selected`) consistent with the project's move away from BEM. Style rules were rewritten with `@apply` throughout; `color-mix` values stay as direct CSS since there is no Tailwind `@apply` equivalent.

**Prompt:** Update table styles in CsvDuplicateTable to match DataErrorsTable.

**What changed:**
- `csv-file/components/CsvDuplicateTable.vue` — renamed all BEM class names in template and styles to flat equivalents; rewrote style block using `@apply` throughout; removed `duplicate-table__th` and `duplicate-table__td` BEM parent blocks; `.duplicate-table__row` / `--selected` → `.row-selectable` / `.row-selected` (sibling class pattern instead of BEM modifier)

**Key decisions & why:**
- Sibling class `.row-selected` instead of BEM `&--selected` — flat modifier as an independent class matches the project direction; selector becomes `&.row-selected` in SCSS which is equally specific
- Kept `color-mix` as direct CSS — no `@apply` equivalent; these two lines are the only exception to the `@apply`-throughout rule


## [#189] Add DataTableHeader reusable thead component and migrate tables
**Type:** feature

**Summary:** Created a generic `DataTableHeader` UI component that owns all sortable-header styles, and migrated `CsvDuplicateTable` and `DataErrorsTable` to use it, removing the duplicated thead markup and moving the related styles out of `_table.scss`.

**Brainstorming:** Both `CsvDuplicateTable` and `DataErrorsTable` repeated the same thead pattern — sortable and non-sortable headers, sticky support, sort icon state, right-aligned numeric columns. Extracting this into a `ui` component eliminates the duplication. The `data-table-sortable-header` and `data-table-sticky-header` styles moved to the component's scoped block since they are now exclusively used by it. `data-table-header` stayed global because `CampaignTable` still references it directly. Sort state stays in callers (stateless component). Right-aligned sort buttons use `class: 'th-right'` on the column definition, since `align` was removed by the linter in favor of passing the scoped class name directly.

**Prompt:** Move all related styles from styles/table to DataTableHeader. Implement this in CsvDuplicateTable and DataErrorsTable. Instead of a new log, update #189.

**What was built:**
- `ui/DataTableHeader.vue` — renders `<thead>`; `columns: DataTableColumn[]` (key, label, sortable?, ariaLabel?, class?); `sticky` prop; `sortKey`/`sortDir` props; emits `sort: [key]`; sortable → `data-table-sortable-header` + button + ArrowUpIcon; non-sortable → `data-table-header`; scoped styles own `data-table-sortable-header`, `data-table-sticky-header`, and `.th-right`; exports `DataTableColumn` + `SortDir` types
- `ui/index.ts` — added `DataTableHeader`, `DataTableColumn`, `SortDir` exports
- `styles/components/_table.scss` — removed `data-table-sortable-header` and `data-table-sticky-header` blocks (now owned by `DataTableHeader`)
- `csv-file/components/CsvDuplicateTable.vue` — replaced `<thead>` with `<DataTableHeader>`; removed `ArrowUpIcon` import and `sortIconClass`; added `columns` definition and `handleSort` wrapper; right-align via `class: 'th-right'`; removed `col-select`/`col-channel`/`col-num`/`col-sortable-num` scoped classes
- `csv-file/components/validation/DataErrorsTable.vue` — replaced `<thead>` with `<DataTableHeader>`; removed `ArrowUpIcon` import; added `columns` definition; `@sort="toggleSort"` (single-column sort, key ignored)

**Key decisions & why:**
- `data-table-header` stays global — `CampaignTable` still uses it directly; moving it to scoped would silently break that component
- `data-table-sortable-header` + `data-table-sticky-header` moved to scoped — safe; no other component uses them after this migration
- Sort state stays in parent — callers own `sortKey`/`sortDir` refs; component is stateless and works with any sorting logic
- `class: 'th-right'` instead of `align` prop — the linter removed `align` from `DataTableColumn`; passing the scoped class name directly through `class` achieves the same result since all elements in `DataTableHeader`'s template receive its scoped attribute
- `ariaLabel` on `DataTableColumn` — covers th `aria-label` for empty headers (e.g. "Select") and the sort button label base text via `col.ariaLabel ?? col.label`


## [#190] Add selection state indicators to CsvDuplicateTable
**Type:** update

**Summary:** Added a `CheckIcon` to each group header with per-group selection state styling, and a "Resolve duplicates (X/N)" progress indicator above the table that turns green when all groups are resolved.

**Brainstorming:** The group header showed only the campaign name with no indication of resolved state. A check icon per group gives an immediate per-row signal; a global counter above the table tells users how many groups still need attention without scrolling through the whole list. When all groups are resolved the indicator turns green to signal readiness.

**Prompt:** Add text next to grouped header to display how many are selected out of duplicates. Create a check icon and add it before group name in group header. Add above table an indicator "Resolve duplicates (1/3)" to match how many groups are resolved.

**What changed:**
- `ui/icons/CheckIcon.vue` — new inline SVG check icon (polyline `20 6 9 17 4 12`, stroke-width 2.5)
- `ui/icons/index.ts` — added `CheckIcon` export
- `csv-file/components/CsvDuplicateTable.vue` — imported `CheckIcon`; added `isGroupSelected` helper and `resolvedCount`/`allResolved` computeds; added `CheckIcon` before campaign name in `.group-header td` with muted/highlighted state; added `.resolve-indicator` bar above the table ("Resolve duplicates (X/N)", turns green when all resolved); updated `.duplicate-body` grid to `grid-rows-[min-content_min-content_1fr]`

**Key decisions & why:**
- `resolvedCount` uses `selections.value.size` directly — the map has one entry per resolved group by design (radio input, max 1 per group)
- Green (`text-primary-400`) for resolved indicator state — clear positive signal without introducing a new color token
- Grid row added for indicator — keeps the table's `1fr` row intact so it still fills available height


## [#192] Extract format helpers to common/utils/formatters
**Type:** refactor

**Summary:** Moved `formatCurrency` and `formatNumber` out of `CsvDuplicateTable` into a new shared `common/utils/formatters.ts` so they can be reused across the codebase.

**Brainstorming:** The two helpers had no component-specific logic and are generically useful anywhere currency or numbers need display formatting. `common/utils/` already holds `math.ts` and `roi.ts` for shared pure utilities — formatters belong there.

**Prompt:** Move all format functions from CsvDuplicateTable to common/utils/formatters and import those from there.

**What changed:**
- `common/utils/formatters.ts` — new file; exports `formatCurrency(value)` and `formatNumber(value)`
- `csv-file/components/CsvDuplicateTable.vue` — removed local `formatCurrency`/`formatNumber` definitions; added import from `../../../common/utils/formatters`

**Key decisions & why:**
- Placed in `common/utils/` not `csv-file/utils/` — no CSV-specific logic; available to dashboard, AI panels, or any future component that formats currency or counts


## [#193] Extract duplicate table into CampainDuplicationsTable
**Type:** refactor

**Summary:** Extracted the grouped duplicate table and all its sorting/selection logic from `CsvDuplicateTable` into a new `CampainDuplicationsTable` component in `csv-file/components/validation/`.

**Brainstorming:** `CsvDuplicateTable` was doing two jobs: orchestrating the modal shell (summary block, resolve indicator, footer) and owning the table's internal sort/selection state. Extracting the table into its own component in `validation/` alongside `DataErrorsTable` keeps the table logic self-contained and makes `CsvDuplicateTable` a thin orchestrator. The new component emits `change:[CsvCampaign[]]` on every selection so the parent can track resolved count and build the proceed payload without needing to reach into internal state.

**Prompt:** Extract duplication table to csv-file/components/validation with name CampainDuplicationsTable.

**What changed:**
- `csv-file/components/validation/CampainDuplicationsTable.vue` — new component; owns `sortKey`/`sortDir`/`columns`/`sortedGroups`, `selections` Map, `isSelected`/`isGroupSelected`/`selectRow`; emits `change:[CsvCampaign[]]` on every `selectRow` call; owns all table-related scoped styles (group-header, cell-select, row-selectable, data-table-row hover)
- `csv-file/components/CsvDuplicateTable.vue` — reduced to thin orchestrator; holds `selectedCampaigns` ref updated via `@change`; `resolvedCount`/`allResolved`/`canProceed` computed from that ref; `handleProceed` emits `selectedCampaigns.value` directly; removed all sorting/selection/formatting logic and imports

**Key decisions & why:**
- `change` emit carries the full `CsvCampaign[]` snapshot on every selection — parent needs the array for both the counter and the proceed payload; avoids exposing internal Map state
- `allResolved` drives the indicator `.resolved` class in the parent (was `resolvedCount > 0` before — corrected to `allResolved` for accurate green state)


## [#194] Extract DuplicateSummary component shared by CsvErrorTable and CsvDuplicateTable
**Type:** refactor

**Summary:** Extracted the duplicate-specific `DataErrorSummary` blocks used in both `CsvErrorTable` and `CsvDuplicateTable` into a shared `DuplicateSummary.vue` component in `validation/`.

**Brainstorming:** Both components had a `DataErrorSummary` block describing duplicate campaign names — `CsvErrorTable` showed a notice ("will be resolved in the next step") and `CsvDuplicateTable` showed the resolution prompt ("select one row per group"). The structure (DataErrorSummary wrapper, badge, count-based grammar) was the same. Extracting into `DuplicateSummary` with a `variant` prop removes the duplication and centralises the duplicate messaging in one place consistent with how `DataErrorSummary` and `DataErrorsTable` already live in `validation/`.

**Prompt:** CsvErrorTable and CsvDuplicateTable use same logic for duplications extract to errors.

**What was built:**
- `csv-file/components/validation/DuplicateSummary.vue` — new component; wraps `DataErrorSummary`; props: `count: number`, `variant?: 'notice' | 'resolve'` (default `'notice'`), `hasValidCampaigns?: boolean`; notice variant renders "will need to be resolved" messaging; resolve variant renders "select one row per group" messaging with danger badge when no valid campaigns exist
- `csv-file/components/CsvErrorTable.vue` — replaced inline duplicate `DataErrorSummary` block with `<DuplicateSummary v-if="duplicateGroupCount > 0" :count="duplicateGroupCount" />`
- `csv-file/components/CsvDuplicateTable.vue` — replaced inline duplicate `DataErrorSummary` block with `<DuplicateSummary :count="duplicateGroups.length" variant="resolve" :has-valid-campaigns="validCampaigns.length > 0" />`; removed now-unused `groupWord`/`verbWord` computeds

**Key decisions & why:**
- `variant` prop over two separate components — the two modes share enough structure (DataErrorSummary wrapper, count-based grammar) that a single component with a variant is simpler than two separate files
- Default `variant='notice'` — the notice use case (CsvErrorTable) is the simpler one and the more likely reuse path; resolve is the explicit opt-in


## [#195] Rename CsvDuplicateTable to ResolveDuplicationsStep
**Type:** refactor

**Summary:** Renamed `CsvDuplicateTable.vue` to `ResolveDuplicationsStep.vue` to better reflect its role as a modal step rather than a generic table component.

**Brainstorming:** The old name described the data it handled (CSV duplicates); the new name describes what the user is doing at this point in the upload flow (resolving duplications). Consistent with the step-based mental model of the upload modal.

**Prompt:** Rename CsvDuplicateTable to ResolveDuplicationsStep.

**What changed:**
- `csv-file/components/ResolveDuplicationsStep.vue` — new file; identical content to old `CsvDuplicateTable.vue`
- `csv-file/components/CsvDuplicateTable.vue` — deleted
- `csv-file/components/UploadModal.vue` — updated import and template tag to `ResolveDuplicationsStep`

**Key decisions & why:**
- No logic changes — pure rename; component interface (props/emits) unchanged


## [#196] Rename CsvErrorTable to DisplayUploadErrorsStep
**Type:** refactor

**Summary:** Renamed `CsvErrorTable.vue` to `DisplayUploadErrorsStep.vue` to match the step-based naming convention established by `ResolveDuplicationsStep`.

**Brainstorming:** Consistent with the rename of `CsvDuplicateTable` → `ResolveDuplicationsStep` in #195. Both components are modal steps in the upload flow; naming them as steps makes their role in `UploadModal` immediately clear.

**Prompt:** Same CsvErrorTable TO DisplayUploadErrorsStep.

**What changed:**
- `csv-file/components/DisplayUploadErrorsStep.vue` — new file; identical content to old `CsvErrorTable.vue`
- `csv-file/components/CsvErrorTable.vue` — deleted
- `csv-file/components/UploadModal.vue` — updated import and template tag to `DisplayUploadErrorsStep`

**Key decisions & why:**
- No logic changes — pure rename; component interface (props/emits) unchanged


## [#197] Rename CsvUploadForm to UploadCampainData
**Type:** refactor

**Summary:** Renamed `CsvUploadForm.vue` to `UploadCampainData.vue` to align with the step-based naming convention used across the CSV upload modal flow.

**Brainstorming:** All modal view components in the upload flow are now named to reflect their role rather than their implementation detail. `UploadCampainData` is consistent with `DisplayUploadErrorsStep` and `ResolveDuplicationsStep`.

**Prompt:** Rename UploadForm to UploadCampainData.

**What changed:**
- `csv-file/components/UploadCampainData.vue` — new file; identical content to old `CsvUploadForm.vue`
- `csv-file/components/CsvUploadForm.vue` — deleted
- `csv-file/components/UploadModal.vue` — updated import and template tag to `UploadCampainData`
- `CLAUDE.md` — architecture entry updated

**Key decisions & why:**
- No logic changes — pure rename; component interface (props/emits) unchanged


## [#198] Extract isValidCsvFile and create csv-file barrel index
**Type:** refactor

**Summary:** Consolidated the duplicated `isValidCsvFile` logic into `parse-csv.ts` and created a feature-level `index.ts` barrel for the `csv-file` feature so external consumers import from one place.

**Brainstorming:** `isValidCsvFile` existed as an inline check in `parse-csv.ts` and as a local function in `UploadCampainData.vue`. The canonical home is `parse-csv.ts` since it is the file entry point for CSV handling. The barrel `index.ts` follows the same pattern as `ui/index.ts` — external features (`AppShell`, `EmptyState`) should import from the feature root, not reach into internal subfolders.

**Prompt:** isValidCsvFile logic exists in 2 places — create and export the function from the parse-csv file. Create barrel index for csv-file feature and export everything consumed by other features.

**What changed:**
- `csv-file/utils/parse-csv.ts` — added exported `isValidCsvFile(f: File): boolean`; replaced inline condition with the function call
- `csv-file/components/UploadCampainData.vue` — removed local `isValidCsvFile`; imports it from `../utils/parse-csv`
- `csv-file/index.ts` — new barrel; exports `UploadModal`, `ReplaceDataModal`, `FileActions`, `useUploadModal`
- `shell/AppShell.vue` — updated three deep imports to single `import { useUploadModal, UploadModal, ReplaceDataModal } from '../features/csv-file'`
- `features/dashboard/components/EmptyState.vue` — updated deep import to `import { FileActions } from '../../csv-file'`
- `CLAUDE.md` — architecture updated: `index.ts` entry added, `parse-csv.ts` and `UploadCampainData.vue` descriptions updated

**Key decisions & why:**
- `isValidCsvFile` lives in `parse-csv.ts` (not a separate util) because CSV file validation is the entry-point concern of that module
- Barrel only exports what external code actually imports — internal components (`UploadCampainData`, `DisplayUploadErrorsStep`, `ResolveDuplicationsStep`) are not exported


## [#199] Rename csv-file feature folder to data-transfer
**Type:** refactor

**Summary:** Renamed the `csv-file` feature folder to `data-transfer` and updated all external import paths.

**Brainstorming:** Pure folder rename. The barrel `index.ts` created in #198 meant only two external import paths needed updating (`AppShell.vue` and `EmptyState.vue`). Internal relative imports within the feature are unaffected.

**Prompt:** Rename csv-file to data-transfer.

**What changed:**
- `features/csv-file/` → `features/data-transfer/` — folder renamed; all internal files unchanged
- `shell/AppShell.vue` — updated import path to `../features/data-transfer`
- `features/dashboard/components/EmptyState.vue` — updated import path to `../../data-transfer`
- `CLAUDE.md` — architecture entry updated

**Key decisions & why:**
- Only two import paths needed updating because the barrel from #198 isolated all external consumers from the internal folder structure


## [#200] UI polish — extract .detail-item, de-BEM components, accessibility improvements
**Type:** update

**Summary:** Extracted `.detail-item` as a global reusable SCSS component class, applied it across AnalysisSummary and DashboardView, de-BEMed Tabs and BaseModal, improved FileDropzone accessibility with a real `<button>` element, and applied several style tweaks across the shell and UI components.

**Brainstorming:** Several components shared the same bullet-separated inline metadata pattern (AnalysisSummary analysis-details, DashboardView dashboard-details) but each had its own scoped implementation. Extracting `.detail-item` to a global partial makes this a reusable primitive. FileDropzone used `div[role="button"]` which is an accessibility antipattern — a native `<button>` is semantically correct and handles keyboard interaction natively. Tabs had a BEM modifier `.tab--active` which was replaced with flat `.tab-active` consistent with the project's no-BEM rule. BaseModal header classes were already partially de-BEMed in a prior commit; remaining scoped names are now flat. Button style: `.btn-secondary-outline` border weight dropped from `border-2` to `border` (1px) to match the visual weight of the outline variant; `.btn-small` became a standalone class so it can be extended independently.

**Prompt:** Check the modified files, create a log entry for the changes, and update CLAUDE.md if necessary.

**What changed:**
- `app/src/styles/components/_detail-item.scss` — new file; `.detail-item` global component class (inline-block, pr-1.5) with bullet separator via `& + &::before` pseudo-element
- `app/src/styles/components/index.scss` — added `@use './detail-item'`
- `app/src/features/ai-tools/ai-analysis/components/shared/AnalysisSummary.vue` — removed scoped styles; analysis-details children are now `.detail-item` spans using the global class
- `app/src/features/dashboard/DashboardView.vue` — `.dashboard-details` paragraph children use `.detail-item` spans
- `app/src/styles/components/_button.scss` — `.btn-secondary-outline` uses `border` (1px) instead of `border-2`; `.btn-small` extracted as standalone class; `.btn-destructive-small` extends both `.btn` and `.btn-small`
- `app/src/ui/Tabs.vue` — `.tab--active` BEM modifier replaced with flat `.tab-active`
- `app/src/ui/BaseModal.vue` — header classes de-BEMed to `.modal-header` / `.modal-header-title`; `aria-modal`, `role="dialog"`, `:aria-label` moved to backdrop div; close button uses `.btn-icon-secondary`
- `app/src/ui/FileDropzone.vue` — changed from `div[role="button"]` to native `<button>`; hidden file input moved outside button; `hintId` computed from id prop; `aria-describedby` only set when no file is selected
- `app/src/ui/Spinner.vue` — template/script order normalised (template first)
- `app/src/shell/AppShell.vue` — `provide('openUploadModal')` delegated to `useUploadModal` composable; `shell-main` overflow refined; gradient title (indigo→pink via `secondary-500`)
- `app/src/shell/AiToolsDrawer.vue` — overlay-panel sizing tweaked; push-drawer-panel uses `grid-rows-[min-content_1fr]`
- `app/src/features/dashboard/components/EmptyState.vue` — `onMounted`/`onUnmounted` hooks added to lock/unlock body overflow while empty state is visible
- `app/src/stores/campaignStore.ts` — `campaignScope` computed (CampaignScope) added to store return
- `app/tailwind.config.js` — `secondary-500` (#ec4899 pink) added for gradient title; `surface-secondary-10` token added

**Key decisions & why:**
- `.detail-item` in global SCSS (not a Vue component) — it's a single-element CSS primitive with no logic; a full component would be over-engineered; consistent with how `.badge` and `.btn` are handled
- Native `<button>` for FileDropzone — removes need for manual `role`, `tabindex`, and keyboard handling; browsers provide these for free; hidden input stays outside so it is not a descendant of the button (invalid HTML)
- `.tab-active` flat name — consistent with `.tab-icon` already on the same component and with the project no-BEM rule


## [#201] Extract DashboardHeader component
**Type:** refactor

**Summary:** Extracted the dashboard header markup (title, AI button, campaign details) from DashboardView into a dedicated DashboardHeader component.

**Brainstorming:** The header section in DashboardView was inline markup with its own scoped styles. Extracting it into a component gives the header a clear boundary, reduces DashboardView's template size, and makes the header independently maintainable. The component reads campaignStore directly (consistent with other dashboard components like CampaignTable) and emits ai-click so DashboardView stays the single place that knows about the openAiPanel injection. The component is multi-root (title-row + details paragraph) — the .dashboard-section layout wrapper stays in DashboardView alongside the channel filter section wrapper, keeping layout ownership consistent.

**Prompt:** Extract dashboardHeader component in dashboard/components.

**What was built:**
- `app/src/features/dashboard/components/DashboardHeader.vue` — new component; multi-root template (title-row + details paragraph); reads campaignStore for title and campaign counts; emits ai-click on AI button press; scoped styles for .dashboard-title-row and .dashboard-details
- `app/src/features/dashboard/DashboardView.vue` — replaced inline header markup with `<DashboardHeader @ai-click="openAiPanel?.()"/>`; removed SparklesIcon import; kept .dashboard-section scoped style for both header and channel filter wrappers; removed title-row/details styles

**Key decisions & why:**
- Multi-root component — the header has two sibling elements (title row + details paragraph) with no semantic reason to wrap them; DashboardView's .dashboard-section provides the layout context, same as it does for the channel filter
- Store read inside component — consistent with how other dashboard components (KpiCard, CampaignTable) receive or read data; avoids threading props through DashboardView for data it no longer needs
- emit ai-click, not inject openAiPanel — keeps the panel-open concern in DashboardView where the inject already lives; DashboardHeader has no knowledge of the panel system


## [#202] DashboardHeader enhancements — channels detail, disabled AI button, connected dot, camelCase emit
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


## [#203] Refactor KpiCard — flat styles, slot projection, formatters, N/A fallback, roiClass coloring
**Type:** refactor

**Summary:** Full KpiCard refactor: removed BEM classes, extracted formatting logic into shared formatter functions, reduced props to label and value only, made secondary metrics slot-projected, moved all formatting calls to DashboardView, added N/A fallback for null/undefined, and wired ROI and CVR secondary coloring through roiClass + .roi-text.

**Brainstorming:** KpiCard had three concerns tangled together: layout/styling, formatting logic (Intl.NumberFormat inline), and secondary metric composition (label + colored value + raw value for color derivation). Separating them keeps the card as a pure display shell. Formatting belongs in common/utils/formatters.ts — the compact variants (≥1000 → compact notation) are distinct from the existing simple formatCurrency/formatNumber which have a stable signature consumed by panel-formatters.ts, so they are added as separate functions. Secondary content is parent-specific and projected via slot so the card stays generic; the secondaryColor computed (which depended on secondaryRawValue) is removed entirely — the parent slot controls color directly. The N/A fallback stays on the card because it is a display safety net — callers should not have to guard null before passing. BEM class names (__label, __value, __secondary, __secondary-value) replaced with flat scoped names per the no-BEM project rule. accentColor was introduced to drive a CSS custom property (--accent) but after the style refactor nothing consumed var(--accent) anymore — it was pure dead weight and removed. For ROI and CVR coloring: the initial slot used inline hex colors and font-bold; these were replaced with class="roi-text" :class="roiClass(value)" which uses the existing global utility (.roi-text applies font-semibold; .positive/.warning/.negative apply success/warning/danger color). CVR uses the same thresholds as ROI — both are percentage metrics where higher is better.

**Prompt:** Refactor KPI card move away from BEM styles. Check formatting functions in common/utils and reuse. Add formatting function for percentage. KPI card should accept value and label. Secondary KPI metrics should be projected so we do not need to pass labels and colors. Format value from parent component. N/A should be fallback value for null or undefined passed values. CVR lost its coloring add it back. Use roi formatting from common utils for roi color. Remove accentColor from KpiCard.

**What changed:**
- `app/src/common/utils/formatters.ts` — added formatPercentage (toFixed(2)+'%'), formatCompactCurrency (compact EUR ≥1000 else 2-decimal EUR), formatCompactNumber (compact ≥1000 else localized)
- `app/src/features/dashboard/components/KpiCard.vue` — props reduced to label and value (string|null|undefined); removed format/secondaryLabel/secondaryValue/secondaryRawValue/accentColor props; removed formatted and secondaryColor computeds; removed :style="{ '--accent': accentColor }"; value renders with ?? 'N/A' fallback; secondary section replaced with `<p v-if="$slots.secondary"><slot name="secondary"/></p>`; BEM classes replaced with flat scoped names: kpi-label, kpi-value, kpi-secondary
- `app/src/features/dashboard/DashboardView.vue` — imports formatCompactCurrency, formatCompactNumber, formatPercentage, roiClass; all KpiCard usages updated: values pre-formatted by parent; accent-color removed from all cards; Revenue and Conversions cards use #secondary slot with roi-text + roiClass coloring; CAC passes null when cac is null

**Key decisions & why:**
- value typed as string|null|undefined — callers should not guard null before passing; the card owns the N/A display fallback
- Secondary as slot not a sub-component — the content is a label + a colored span, trivial enough that a slot avoids a dedicated component for two lines of markup
- roiClass for CVR as well as ROI — both are percentage metrics where higher is better; shared thresholds keep coloring logic in one place
- accentColor removed without replacement — var(--accent) was unused after the style refactor; removing it entirely is cleaner than keeping a prop with no consumer
- formatCompactCurrency/formatCompactNumber separate from formatCurrency/formatNumber — compact variants use different precision rules; existing simple formatters must not change signature


## [#204] Extract DashboardKpis component; move totalConversions into CampaignKPIs
**Type:** refactor

**Summary:** Extracted the KPI cards section from DashboardView into a dedicated DashboardKpis component that accepts a single kpis prop, and moved totalConversions into the CampaignKPIs interface and kpis computed so the component needs only one input.

**Brainstorming:** DashboardView was doing formatting work (importing formatters, roiClass) just for the KPI section — extracting it makes DashboardView a thinner orchestrator. The key API question was whether DashboardKpis should read the store directly or accept props. Props was the right choice: it keeps the component testable and decoupled, and a single kpis prop is cleaner than reading the store internally. The original concern was that totalConversions lives as a separate computed on the store root (not in kpis), which would mean a second prop. Rather than threading two separate inputs, totalConversions was added to CampaignKPIs so the component takes a single cohesive object. totalConversions stays exported from the store root as well since the funnel chart in DashboardView still needs it. The .kpi-grid scoped style moves from DashboardView into DashboardKpis where it belongs.

**Prompt:** Extract DashboardKpis.vue component. It should not read from store but accept an input of kpis. totalConversions should be part of kpis when we get data from the store.

**What was built:**
- `app/src/common/types/campaign.ts` — CampaignKPIs interface extended with totalConversions: number
- `app/src/stores/campaignStore.ts` — kpis computed now includes totalConversions: totalConversions.value
- `app/src/features/dashboard/components/DashboardKpis.vue` — new component; props: kpis (CampaignKPIs); imports formatCompactCurrency, formatCompactNumber, formatPercentage, roiClass; renders 5 KpiCards with secondary slots for ROI and CVR; owns .kpi-grid scoped style
- `app/src/features/dashboard/DashboardView.vue` — removed formatter/roiClass/KpiCard imports; added DashboardKpis import; replaced KPI section with `<DashboardKpis :kpis="store.kpis" />`; removed .kpi-grid scoped style

**Key decisions & why:**
- totalConversions added to CampaignKPIs rather than passed as a second prop — a single cohesive input is cleaner than two separate inputs; KPIs are logically a bundle
- totalConversions kept on store root as well — funnel chart in DashboardView still needs store.totalConversions, totalImpressions, totalClicks directly
- Formatting logic moves into DashboardKpis, not left in DashboardView — DashboardView should not know the display format of KPIs; that knowledge belongs in the component that renders them


## [#205] Extract groupByChannel utility; expose channelTotals from campaignStore
**Type:** refactor

**Summary:** Extracted the repeated channel accumulation pattern into a shared common utility and exposed it as a computed on the campaign store, without touching any feature files.

**Brainstorming:** Three places in the codebase compute the same Map-based channel accumulation (budget + revenue + impressions + clicks + conversions per channel): the revVsBudgetData chart computed in DashboardView, and the internal aggregateChannels functions in buildBudgetOptimizerData and buildExecutiveSummaryData. The chart only uses budget + revenue; the AI utils also compute derived metrics on top. The shared raw accumulation step — iterating campaigns and summing the five numeric fields per channel — is a pure data transformation with no feature dependencies, making it a natural fit for common/utils. Extracting it there lets all consumers eventually replace their inline loops. The store exposes it as channelTotals computed (keyed off filteredCampaigns) so feature components can consume it reactively without importing the utility directly. AI tools and DashboardView were not touched in this pass — they will be updated to use the new utility separately.

**Prompt:** Chart data calculation in DashboardView seems to reuse functionality with other places — can we move those calculations into common utils? Scope: only common and stores, do not replace anything in other features for now.

**What was built:**
- `app/src/common/utils/campaign-aggregation.ts` — new file; exports ChannelTotals type and groupByChannel(campaigns) → Record<string, ChannelTotals>; pure accumulator with no derived metrics
- `app/src/stores/campaignStore.ts` — imports groupByChannel; adds channelTotals computed (groupByChannel over filteredCampaigns); exposed in store return

**Key decisions & why:**
- All five fields in ChannelTotals (not just budget + revenue) — the chart only needs two, but the AI utils need all five; a partial accumulator would force a second pass or separate util
- No derived metrics (roi, ctr, cvr, etc.) in the utility — those depend on rounding strategy and output type, which differ per consumer; the utility is intentionally a raw accumulator
- Exposed via store computed rather than requiring feature components to import the util directly — store is already the data layer; channelTotals fits naturally alongside kpis and filteredCampaigns
- AI tools files left unchanged — scoped to common and stores only for this pass


## [#206] Extract DashboardCharts component; consolidate funnel totals into CampaignKPIs
**Type:** refactor

**Summary:** Extracted the charts section from DashboardView into DashboardCharts, which accepts campaigns, channelTotals, and kpis as props — and consolidated totalImpressions and totalClicks into CampaignKPIs so the funnel data travels with the single kpis object rather than as separate props.

**Brainstorming:** The charts section in DashboardView contained all chart computeds (campaignColorMap, roiChartData, budgetCampaignData, revVsBudgetData, funnelValues) and the charts grid template — a natural extraction unit. Following the same pattern as DashboardKpis, the component accepts props rather than reading the store. The revVsBudgetData computed was a free win: instead of the inline byChannel loop, it uses the channelTotals prop (already provided by the store after the previous groupByChannel extraction), making the computation a straightforward Object.entries pass. For the funnel, the initial prop design had totalImpressions, totalClicks, totalConversions as three separate inputs. The user requested consolidation into kpis — this led to adding totalImpressions and totalClicks to CampaignKPIs (totalConversions was already there), so the funnel chart reads from props.kpis. This keeps DashboardCharts to three clean props: the campaign list for per-campaign charts, channelTotals for the grouped bar chart, and kpis for everything aggregate.

**Prompt:** Create DashboardCharts component and move charts section there. Pass inputs in, will not read from store. Consolidate kpis.

**What was built:**
- `app/src/common/types/campaign.ts` — CampaignKPIs extended with totalImpressions and totalClicks
- `app/src/stores/campaignStore.ts` — kpis computed now includes totalImpressions and totalClicks
- `app/src/features/dashboard/components/DashboardCharts.vue` — new component; props: campaigns (Campaign[]), channelTotals (Record<string, ChannelTotals>), kpis (CampaignKPIs); all chart computeds internal; revVsBudgetData uses channelTotals prop directly; funnelValues reads from kpis; owns .charts-grid scoped style
- `app/src/features/dashboard/DashboardView.vue` — removed chart imports (ChartData, chart components, CHART_COLORS), all chart computeds, and chart styles; added DashboardCharts; passes store.filteredCampaigns, store.channelTotals, store.kpis

**Key decisions & why:**
- totalImpressions and totalClicks added to CampaignKPIs — they are aggregate portfolio metrics; keeping them alongside totalConversions in one object avoids threading individual totals as separate props
- revVsBudgetData uses channelTotals prop instead of inline loop — free win from the prior groupByChannel extraction; eliminates the last inline channel accumulation in the dashboard feature
- Three props rather than one flat object — campaigns is a list (variable length, drives color mapping), channelTotals is a map keyed by channel name, kpis is a fixed-shape aggregate; splitting them by semantic type makes it clear what each chart computation depends on




## [#207] UI polish: table styles, responsive charts grid, dashboard layout, formatter and modal updates
**Type:** update

**Summary:** Polished the UI across several areas — table global classes with zebra striping, DataTableHeader class-prop refactor and scoped sticky styles, responsive 2-col charts grid via container query, dashboard layout restructure with max-width and overflow zones, formatCurrency decimals param, and ReplaceDataModal button order fix.

**Brainstorming:** A batch of incremental UI polish changes across the dashboard: the table needed zebra-striping utilities that could be toggled per-table, the DataTableHeader's align prop was replaced with a generic class string to keep it flexible without special-casing right-alignment, the charts grid needed a container query so it collapses to one column when the drawer is open, the dashboard layout needed a stable scroll zone with max-width constraints to match the rest of the page, formatCurrency needed a decimals param to serve both integer (KPIs) and decimal (CAC) use cases, and the ReplaceDataModal button order was corrected so the primary action comes first.

**Prompt:** Check the files I worked on and create a log.

**What changed:**
- `app/src/styles/components/_table.scss` — added `.table-wrapper` global class (overflow-auto); added `.data-table.stripped-odd` and `.data-table.stripped-even` modifier classes for zebra striping; removed sticky header from global scope (moved to DataTableHeader scoped styles)
- `app/src/ui/DataTableHeader.vue` — replaced `align?: 'left'|'right'` prop with generic `class?: string` on DataTableColumn; `.data-table-sticky-header` moved to scoped styles (wraps `.data-table-header` and `.data-table-sortable-header` with sticky/z-index/bg); sort icon active/inactive color states refined
- `app/src/features/dashboard/components/CampaignTable.vue` — table now uses `stripped-even` modifier class; scoped `.campaign-table-td` sets padding; table max-height set to 45rem
- `app/src/features/dashboard/components/DashboardCharts.vue` — added `.charts-container` wrapper with `container-type: inline-size`; charts grid switches to 2 columns via `@container (min-width: 60rem)` query
- `app/src/features/dashboard/DashboardView.vue` — layout restructured into sticky header/filter sections + scrollable `.data-visualization` zone; `.dashboard-visualizations` wraps KPIs + charts + table with max-width 7xl and flex-col gap; table card and title styles scoped inline
- `app/src/common/utils/formatters.ts` — `formatCurrency` now accepts optional `decimals` param (default 0); locale changed from `'en-US'` to `'en'` for consistency with other formatters
- `app/src/features/data-transfer/components/ReplaceDataModal.vue` — button order corrected to primary action first (Replace data), cancel second
- `app/src/stores/aiAnalysisStore.ts` — minor update; debug `console.log` calls present in `buildPrompt` and `executeAnalysis`

**Key decisions & why:**
- `stripped-odd`/`stripped-even` as modifier classes on `.data-table` rather than always-on — different tables need different striping behavior (or none); keeps the base table neutral
- `class?` string prop instead of `align?: 'left'|'right'` on DataTableColumn — more flexible without adding new special cases; callers pass Tailwind/global classes directly
- `@container` query for charts grid instead of `@media` — charts grid width is determined by the available container (which shrinks when the AI drawer opens), not the viewport; media queries would not respond to drawer state
- `data-visualization` as the scroll zone — header and channel filter stay sticky, only the chart/table area scrolls; max-width on the inner wrapper keeps content aligned with the rest of the page


## [#208] Refactor toast notifications: variants, icons, flat styles, typed store helpers
**Type:** refactor

**Summary:** Refactored the toast system from a single error-only notification into a fully typed, multi-variant system — adding NotificationVariant type, four dedicated icon components, four typed store helpers, and replacing all BEM styles with flat @apply classes in both toast components.

**Brainstorming:** The existing toast had a single hardcoded error variant with an inline SVG, BEM class names, and a generic addToast(message, type) API. The refactor covers four concerns: (1) type — a new NotificationVariant union replaces the inline 'error' literal, giving the system a shared vocabulary; (2) icons — the inline SVG in ToastNotification was replaced with dedicated icon components (AlertCircleIcon, CheckCircleIcon, AlertTriangleIcon, InfoIcon) following the same pattern as all other icons in the project; (3) store API — four typed helpers (showSuccessToast, showErrorToast, showWarningToast, showInfoToast) replace the generic addToast call at the call site level, while addToast stays as an internal helper so existing callers are not broken; (4) styles — BEM (toast__icon, toast__message, toast__close, toast-container__list) removed and replaced with flat @apply classes in both components, matching the project-wide convention. Colors match badge tokens exactly: bg/border/icon use the same success/danger--5p/warning/primary-500 opacity utilities.

**Prompt:** Refactor toast notifications. Structure styles and move away from BEM. Any SVGs should be created as icons. Add variations: success, error, warning, info. Use same colors as badge. Create a notification type. Toast store should have 4 functions one per variation: showSuccessToast etc. Do not update useDownloadTemplate. Update styles of ToastContainer too.

**What was built:**
- `app/src/ui/types/notification-variant.ts` — new file; NotificationVariant = 'success' | 'error' | 'warning' | 'info'
- `app/src/ui/icons/AlertCircleIcon.vue` — new icon; circle + exclamation — error variant
- `app/src/ui/icons/CheckCircleIcon.vue` — new icon; circle + checkmark — success variant
- `app/src/ui/icons/AlertTriangleIcon.vue` — new icon; triangle + exclamation — warning variant
- `app/src/ui/icons/InfoIcon.vue` — new icon; circle + i — info variant
- `app/src/ui/icons/index.ts` — added exports for all 4 new icons
- `app/src/stores/toastStore.ts` — Toast.type updated to NotificationVariant; addToast kept as internal helper (existing callers unaffected); showSuccessToast / showErrorToast / showWarningToast / showInfoToast added as public API
- `app/src/ui/toast/ToastNotification.vue` — variant prop added; icon resolved via static ICON_MAP computed; BEM removed, flat @apply styles; variant modifier classes (.success/.error/.warning/.info) drive bg + border + icon color matching badge tokens
- `app/src/ui/toast/ToastContainer.vue` — passes variant prop from toast.type; BEM (toast-container__list) removed; flat @apply styles for container and list
- `app/src/ui/index.ts` — exports NotificationVariant

**Key decisions & why:**
- addToast kept exported and default type preserved — useDownloadTemplate.ts was intentionally left unchanged; keeping addToast public avoids breaking it
- Colors match badge tokens exactly (bg-success/10, border-success/25, text-success etc.) — user requested badge color parity; reusing existing token values keeps the system visually consistent without new tokens
- ICON_MAP as a static Record rather than a switch/computed — resolves the icon component in one lookup; static so Vue can tree-shake unused icons if needed
- flat modifier classes (.success etc.) on .toast rather than separate component per variant — variant is data, not structure; one component handles all four cases


## [#209] Toast visual polish — solid background, larger icon, btn-icon-secondary close
**Type:** update

**Summary:** Updated toast appearance: solid `bg-surface-secondary` background replaces the transparent tint, borders are now variant-colored at `/50` opacity, the variant icon is bumped to `text-xl`, and the close button now uses the global `.btn-icon-secondary` class.

**Brainstorming:** The previous toasts used a low-opacity tinted background (`bg-{color}/10`) which made them feel washed-out against the dark surface. Switching to `bg-surface-secondary` gives them the same solid, readable background as secondary cards. Borders at `/50` stay color-coded but are now clearly visible against the solid background. The icon needed to grow to match the heavier visual weight of the solid card. The close button already had a custom style that duplicated btn-icon-secondary behavior — replacing it with the global class removes the duplication and ensures it stays in sync with the rest of the UI.

**Prompt:** Toasts should not be transparent. Background should be like secondary cards with updated border colors. Icon should be bigger. Close button should be like btn-icon-secondary.

**What changed:**
- `app/src/ui/toast/ToastNotification.vue` — background changed from `bg-{color}/10` to `bg-surface-secondary`; borders updated from `{color}/25` to `{color}/50`; icon size bumped from `text-base` to `text-xl`; close button now uses global `btn-icon-secondary` class with a scoped `.toast-close` trim (`-mt-0.5 -mr-0.5`) replacing the previous inline button styles

**Key decisions & why:**
- `bg-surface-secondary` for background — matches `.card-secondary` token exactly; no new tokens needed
- Border opacity `/50` instead of full — full opacity borders felt too heavy against the solid background; `/50` keeps the color signal readable without overpowering the card
- `.btn-icon-secondary` applied directly in template — it is a global class; applying it in template is cleaner than duplicating its rules in scoped SCSS


## [#210] Remove all BEM class names from the codebase
**Type:** refactor

**Summary:** Replaced the only remaining BEM double-underscore class names in FunnelChart.vue with flat hyphenated names, completing the project-wide no-BEM cleanup.

**Brainstorming:** A full codebase scan confirmed that `FunnelChart.vue` was the only file still using BEM syntax (`funnel__row`, `funnel__label`, etc. with `&__` nesting in SCSS). All other files already used flat hyphenated class names. The fix is a straightforward rename: collapse `block__element` into `block-element`, unnest the SCSS rules, and update the matching template class attributes. No logic changes needed.

**Prompt:** Clean up any leftover BEM styles. Make sure the project does not follow that pattern. Update your instructions.

**What changed:**
- `app/src/ui/charts/FunnelChart.vue` — renamed all BEM classes to flat hyphenated names (`funnel__row` → `funnel-row`, `funnel__label` → `funnel-label`, `funnel__track` → `funnel-track`, `funnel__bar-wrap` → `funnel-bar-wrap`, `funnel__bar` → `funnel-bar`, `funnel__value` → `funnel-value`, `funnel__rate` → `funnel-rate`); SCSS block rules unnested into flat selectors
- `CLAUDE.md` — Styling rule updated: wording changed from "moving away from BEM" to "does not use BEM — codebase fully cleaned"; rule now says to replace BEM immediately if encountered

**Key decisions & why:**
- Flat hyphenated names instead of BEM — consistent with every other component in the project; scoped styles prevent collisions so the block prefix alone is sufficient
- SCSS rules unnested — the `&__` nesting was the BEM-specific pattern; flat rules are more readable and make the no-BEM intent explicit


## [#211] Disable upload form during submission; fix FileDropzone hasError detection
**Type:** fix

**Summary:** Disabled the title input and FileDropzone while a CSV upload is in progress, and fixed `hasError` in FileDropzone to correctly filter out Comment nodes so the error border only appears when an actual error message is slotted in.

**Brainstorming:** Two independent bugs: (1) During `isLoading`, only the Upload button was disabled — the title field and file dropzone remained editable, allowing the user to change inputs mid-parse. Fix: pass `isLoading` as the `disabled` prop to both. (2) `hasError` was checking `slots.error` (a function reference), which is always truthy when the slot is defined. Vue renders a Comment node when a slotted `v-if` is false — the fix is to call the slot function and check whether any of the returned VNodes has a type other than `Comment`.

**Prompt:** Upload form should be disabled while uploading the file. Add disabled properties to respective components if not existent. FileDropzone hasError is not working properly — fix it.

**What changed:**
- `app/src/ui/FileDropzone.vue` — added `disabled?: boolean` prop; `hasError` now calls `slots.error?.()` and filters out Comment nodes; button and hidden input get `:disabled="disabled"`; `open()` and `onDrop()` return early when disabled; `@dragover` guard added
- `app/src/features/data-transfer/components/UploadCampainData.vue` — title input gets `:disabled="isLoading"`; FileDropzone gets `:disabled="isLoading"`

**Key decisions & why:**
- Comment-node filtering for `hasError` — standard Vue pattern for detecting meaningful slot content when the slot uses `v-if`; `slots.error` alone is always truthy if the slot is declared
- Cancel and Download Template buttons left enabled — user should always be able to cancel an in-progress upload or download the template; only data-entry fields are locked
- Guard in `open()` and `onDrop()` in addition to `:disabled` on the button — the native `disabled` attribute stops click and keyboard, but drag-and-drop events fire independently of it


## [#212] Fix FileDropzone hasError — plain function instead of computed
**Type:** fix

**Summary:** Changed `hasError` from a `computed` to a plain function so it re-evaluates on every render, which is required because Vue's computed cache does not track slot function calls reactively.

**Brainstorming:** `computed()` only re-runs when its tracked reactive dependencies change. Calling `slots.error?.()` inside a computed doesn't register any reactive dependency — so the cached result never updates when the parent's `v-if` toggles slot content. A plain function called directly in the template runs fresh on every render cycle, picking up the current slot nodes correctly each time the parent re-renders with changed slot content.

**Prompt:** File dropzone still is not applying hasError correctly.

**What changed:**
- `app/src/ui/FileDropzone.vue` — `hasError` converted from `computed<boolean>` to a plain `function hasError(): boolean`; template updated to call `hasError()` instead of referencing `hasError`

**Key decisions & why:**
- Plain function over computed — slot calls are not reactive dependencies; computed caching breaks the detection; a plain function in the template runs in the render tracking context and sees the correct slot nodes on every update


## [#213] Extract ui/forms/ module — FileDropzone, PasswordInput, RadioToggle
**Type:** refactor

**Summary:** Moved the three form input components from the `ui/` root into a dedicated `ui/forms/` subfolder with its own barrel, mirroring the existing `charts/`, `icons/`, and `toast/` module pattern.

**Brainstorming:** The `ui/` root was mixing standalone layout components (BaseModal, Spinner, Tabs, DataTableHeader) with form-input components (FileDropzone, PasswordInput, RadioToggle). Grouping the form inputs into their own folder makes the library structure more navigable and consistent with the existing module pattern. The forms barrel re-exports from `ui/index.ts`, so no consumer imports change.

**Prompt:** Create a folder forms in ui and move all form related components there.

**What changed:**
- `app/src/ui/forms/FileDropzone.vue` — moved from ui/ root; internal UploadIcon import updated from `./icons/` to `../icons/`
- `app/src/ui/forms/PasswordInput.vue` — moved from ui/ root; no import path changes needed
- `app/src/ui/forms/RadioToggle.vue` — moved from ui/ root; no import path changes needed
- `app/src/ui/forms/index.ts` — new barrel; exports FileDropzone, PasswordInput, RadioToggle
- `app/src/ui/index.ts` — replaced three individual form exports with `export * from './forms'`
- `CLAUDE.md` — architecture updated; forms/ subfolder documented under ui/

**Key decisions & why:**
- Barrel re-export via `export * from './forms'` in ui/index.ts — all consumers import from the top-level ui barrel; no consumer files needed updating
- Only relative path to fix was UploadIcon in FileDropzone — the other two components had no relative sibling imports


## [#214] Move toast notifications to bottom-left
**Type:** fix

**Summary:** Repositioned the toast container from bottom-right to bottom-left, with matching leave animation direction.

**Brainstorming:** Single-file change — update the fixed positioning class and items alignment in ToastContainer, then flip the leave animation to slide left instead of right to match the new position.

**Prompt:** Toast messages should appear at the bottom left.

**What changed:**
- `app/src/ui/toast/ToastContainer.vue` — changed `right-6` → `left-6` on `.toast-container`, `items-end` → `items-start` on `.toast-list`, and `translate-x-4` → `-translate-x-4` on `.toast-leave-to`

**Key decisions & why:**
- Flipped leave translation to `-translate-x-4` so toasts slide out to the left, consistent with their anchor position


## [#215] Pre-calculate campaign metrics in store
**Type:** refactor

**Summary:** Introduced `CampaignPerformance` model that extends `Campaign` with pre-calculated roi, ctr, cvr, cac; the store now maps raw campaigns to this model on load so the table reads values directly instead of computing them inline.

**Brainstorming:** The table was recalculating roi/ctr/cvr/cac inside helper functions and sort comparators on every render. Moving calculation to load time keeps the table as pure display logic and creates a single authoritative source for per-campaign derived metrics. `null` on zero-divisor (instead of the `safeDivide` zero fallback) correctly represents "not applicable" for display and sorting purposes.

**Prompt:** When setting campaigns in the store we should calculate all values for campaigns that we display on the campaign table. Campaigns in the campaignStore will be of a new model called CampaignPerformance that extends Campaign. When setting the campaigns iterate through each one and calculate roi, ctr, cvr, cac — if dividers are zero values must be null.

**What changed:**
- `app/src/common/types/campaign.ts` — added `CampaignPerformance` interface extending `Campaign` with `roi/ctr/cvr/cac: number | null`
- `app/src/common/utils/campaign-performance.ts` — new file; `toCampaignPerformance(c: Campaign): CampaignPerformance` calculates all four metrics with null on zero-divisor using `round2`
- `app/src/stores/campaignStore.ts` — `campaigns` ref typed as `CampaignPerformance[]`; both mock init and `loadCampaigns` map through `toCampaignPerformance`
- `app/src/features/dashboard/components/CampaignTable.vue` — prop changed to `CampaignPerformance[]`; removed all inline calculation helpers; reads `c.roi/ctr/cvr/cac` directly; `getFieldValue` simplified with null → 0 fallback (cac → Infinity)

**Key decisions & why:**
- `null` instead of `0` for zero-divisor cases: correctly distinguishes "not computable" from "zero value" for both display (shows N/A) and sorting (sorts as 0 or Infinity for CAC)
- Did not use `safeDivide` in the converter — it returns `0`, not `null`, so inline null checks were needed
- `CampaignPerformance extends Campaign` means all existing consumers typed as `Campaign[]` (charts, AI data builders) remain valid without changes
- KPI aggregations in the store are untouched — they operate on filtered totals, not per-row derived values


## [#216] Sort null campaign metrics last
**Type:** fix

**Summary:** Removed `Infinity` sentinel from CAC sorting; null metric values now always sort last regardless of direction.

**Brainstorming:** Using `Infinity` as a sort proxy for null CAC is a marketing nonsense — CAC can't be infinite. Null means "not computable", so the correct UX is to push those rows to the bottom in both asc and desc. The comparator handles null explicitly before the direction logic.

**Prompt:** Remove Infinity from campaign table. Null values should always sort last.

**What changed:**
- `app/src/features/dashboard/components/CampaignTable.vue` — `getFieldValue` return type widened to `number | string | null`, Infinity special-case removed; comparator handles null-last before applying sort direction

**Key decisions & why:**
- Null always last regardless of direction: null means no data, not a metric value — it should never compete with real values in either direction


## [#217] Extract sort helpers into common/utils/sorting.ts
**Type:** refactor

**Summary:** Extracted null-safe sorting logic from CampaignTable into reusable utilities so the comparator is not inline ad-hoc code.

**Brainstorming:** The sort comparator in CampaignTable had two distinct concerns — null handling and directional comparison. Splitting them into named functions makes each testable and reusable. `sortWithNullsLast` composes both into a single call site.

**Prompt:** In common utils create a sorting.ts file. Create a function for the null checks, a function for the directional comparison, then use those to create a single sortWithNullsLast function. Use it in CampaignTable.

**What was built:**
- `app/src/common/utils/sorting.ts` — new file; `compareNullsLast(a, b)` returns 0/1/-1 or null if no nulls present; `compareDirectional(a, b, dir)` handles directional comparison; `sortWithNullsLast(a, b, dir)` composes both via `??`
- `app/src/features/dashboard/components/CampaignTable.vue` — comparator body replaced with single `sortWithNullsLast` call

**Key decisions & why:**
- `compareNullsLast` returns `null` (not a number) when both values are non-null — signals "no null decision made", allowing `??` composition in `sortWithNullsLast`


## [#218] Fix formatNumber locale
**Type:** fix

**Summary:** Changed `formatNumber` locale from `'en-US'` to `'en'` to match the rest of the formatters and the app's European context.

**Brainstorming:** `formatCurrency` and `formatCompactNumber` already use `'en'`; `'en-US'` was inconsistent and wrong for a EUR-denominated European app.

**Prompt:** formatNumber should not be en-US, app is for Europe.

**What changed:**
- `app/src/common/utils/formatters.ts` — `formatNumber` locale changed from `'en-US'` to `'en'`

**Key decisions & why:**
- Used `'en'` to be consistent with all other formatters in the same file rather than introducing a new locale


## [#219] Move null fallback into formatPercentage and formatCurrency
**Type:** refactor

**Summary:** `formatPercentage` and `formatCurrency` now accept `number | null` and an optional fallback string, removing inline null checks from call sites.

**Brainstorming:** Null checks scattered in templates are noise — the formatter already owns the display contract, so it should own the null case too. A `fallback` parameter keeps it flexible without forcing a hardcoded 'N/A'.

**Prompt:** formatPercentage and formatCurrency return string — pass a parameter for the default displayed value and move the null check there.

**What changed:**
- `app/src/common/utils/formatters.ts` — `formatPercentage(value: number | null, fallback = 'N/A')` and `formatCurrency(val: number | null, decimals = 0, fallback = 'N/A')` handle null internally
- `app/src/features/dashboard/components/CampaignTable.vue` — removed inline `c.ctr !== null ? ... : 'N/A'` ternaries for ctr, cvr, cac; now plain function calls

**Key decisions & why:**
- `fallback` defaults to `'N/A'` so all existing call sites are unaffected; callers can override if needed


## [#220] Use formatPercentage for ROI in CampaignTable
**Type:** fix

**Summary:** ROI column now uses `formatPercentage` instead of an inline `toFixed(0)` expression, consistent with ctr and cvr columns.

**Brainstorming:** Inline formatting bypassed the formatter and used 0 decimals instead of the app standard of 2.

**Prompt:** ROI in table should use formatPercentage.

**What changed:**
- `app/src/features/dashboard/components/CampaignTable.vue` — ROI cell replaced inline ternary with `formatPercentage(c.roi)`

**Key decisions & why:**
- `formatPercentage` already handles null, so no ternary needed


## [#221] Pre-calculate percentageClass on CampaignPerformance
**Type:** refactor

**Summary:** Moved ROI CSS class calculation out of the table template into the model; `roiClass` updated to handle null; `CampaignTable` derives a computed Map for class lookups.

**Brainstorming:** The table was calling `roiClass` inline per row per render. Since `roi` is already pre-calculated on the model, the class can be derived at the same time. A computed Map in the table then gives O(1) lookup per row with no per-render function calls. `roiClass` needed to accept null to avoid callers guarding it externally.

**Prompt:** Move roiClass into CampaignPerformance, rename to percentageClass. For the table create a computed value for roi class so we do not calculate each time. The function should also handle null.

**What changed:**
- `app/src/common/utils/roi.ts` — `roiClass(roi: number | null)` returns `''` for null
- `app/src/common/types/campaign.ts` — `CampaignPerformance` gains `percentageClass: string`
- `app/src/common/utils/campaign-performance.ts` — calculates `percentageClass: roiClass(roi)` after deriving roi; imports roiClass
- `app/src/features/dashboard/components/CampaignTable.vue` — `percentageClassMap` computed (Map from sortedCampaigns); revenue and ROI columns use `percentageClassMap.get(c.campaign)`; roiClass import removed

**Key decisions & why:**
- `percentageClassMap` derived from `sortedCampaigns` (not `props.campaigns`) so it stays in sync with the rendered rows
- `roiClass` returns `''` for null so bindings are clean with no ternary guards


## [#222] Remove percentageClassMap — read c.percentageClass directly
**Type:** fix

**Summary:** Removed the intermediate `percentageClassMap` computed; template reads `c.percentageClass` directly from the model.

**Prompt:** Do not use the map, use the function directly.

**What changed:**
- `app/src/features/dashboard/components/CampaignTable.vue` — `percentageClassMap` computed removed; revenue and ROI `:class` bindings use `c.percentageClass` directly

**Key decisions & why:**
- `percentageClass` is already on the model so a Map lookup adds no value — direct property access is simpler and just as efficient


## [#223] Move percentageClass function to campaign-performance.ts
**Type:** refactor

**Summary:** Moved `roiClass` (renamed `percentageClass`) out of `roi.ts` into `campaign-performance.ts`; removed `percentageClass` from the `CampaignPerformance` model; table calls the function directly.

**Brainstorming:** `percentageClass` is display logic tied to campaign metrics, not a general ROI utility. Keeping it in `campaign-performance.ts` groups it with its domain. The model doesn't need to store a CSS class string — the function is cheap and called only in the template.

**Prompt:** Move the function to campaign-performance.ts so we eventually delete roi.ts. Do not put percentageClass on the model.

**What changed:**
- `app/src/common/types/campaign.ts` — `percentageClass` field removed from `CampaignPerformance`
- `app/src/common/utils/campaign-performance.ts` — `percentageClass(value: number|null): string` exported; `roiClass` import removed; `toCampaignPerformance` no longer sets `percentageClass`
- `app/src/common/utils/roi.ts` — `roiClass` removed (now dead; to be deleted)
- `app/src/features/dashboard/components/CampaignTable.vue` — imports `percentageClass` from `campaign-performance`; template uses `percentageClass(c.roi)` for revenue and ROI columns

**Key decisions & why:**
- Function lives in `campaign-performance.ts` rather than the model — CSS class derivation is view concern, not domain data
- `roi.ts` left in place for now; `roiValue` and `formatROI` remain but are unused — full deletion is a follow-up


## [#224] Use formatNumber for conversions in CampaignTable
**Type:** fix

**Summary:** Replaced inline `toLocaleString('en')` with `formatNumber` for the conversions column.

**Prompt:** Use formatter for conversions, not toLocaleString.

**What changed:**
- `app/src/features/dashboard/components/CampaignTable.vue` — conversions cell uses `formatNumber(c.conversions)`; `formatNumber` added to import

**Key decisions & why:**
- `formatCurrency` was not appropriate — conversions is a count, not a monetary value



## [#225] Use pre-calculated roi in DashboardCharts
**Type:** refactor

**Summary:** Updated DashboardCharts to use `CampaignPerformance` prop type and read `c.roi` directly instead of recalculating inline.

**Brainstorming:** After campaigns moved to `CampaignPerformance[]` in the store, DashboardCharts was still accepting `Campaign[]` and recalculating ROI inline with a duplicated formula. Straightforward fix: update the prop type and replace the inline calculation with the pre-calculated field.

**Prompt:** DashboardCharts should use calculated values. Adjust the functions.

**What changed:**
- `app/src/features/dashboard/components/DashboardCharts.vue` — prop type changed from `Campaign[]` to `CampaignPerformance[]`; `roiChartData` uses `c.roi ?? 0` instead of inline formula

**Key decisions & why:**
- `c.roi ?? 0` falls back to `0` when ROI is null (zero-budget campaign) — consistent with the previous inline behaviour which also returned 0 in that case


## [#226] Delete roi.ts
**Type:** fix

**Summary:** Removed `roi.ts` — all three of its functions (`roiValue`, `roiClass`, `formatROI`) were unused after previous refactoring moved `roiClass` to `campaign-performance.ts` as `percentageClass`.

**Brainstorming:** Grep confirmed zero imports of `roi.ts` across the entire `src/` tree. Safe to delete.

**Prompt:** Check roi.ts. If none of its functions are used please remove the file.

**What changed:**
- `app/src/common/utils/roi.ts` — deleted
- `CLAUDE.md` — entry removed from architecture

**Key decisions & why:**
- No replacement needed — `percentageClass` in `campaign-performance.ts` covers the class derivation use case; `roiValue` and `formatROI` had no callers


## [#227] Use PerformanceMetrics in CampaignPerformance
**Type:** fix

**Summary:** Removed the duplicated fields from `CampaignPerformance` and made it extend `PerformanceMetrics` instead.

**Brainstorming:** `PerformanceMetrics` was already declared with the same four nullable fields. `CampaignPerformance` was simply re-declaring them inline. Extending the interface removes the duplication.

**Prompt:** In campaign.ts use PerformanceMetrics to extend the models where necessary.

**What changed:**
- `app/src/common/types/campaign.ts` — `CampaignPerformance` now extends `Campaign, PerformanceMetrics` with an empty body instead of redeclaring the four fields

**Key decisions & why:**
- `CampaignKPIs` was not changed — its metric fields are non-nullable (except `cac`) and represent aggregated portfolio values, not per-campaign calculated metrics, so `PerformanceMetrics` does not apply


## [#228] Refactor campaign type hierarchy and metric calculation pipeline
**Type:** refactor

**Summary:** Extracted `CampaignMetrics` as the numeric base type, added `aggregateCampaignMetrics` and `computePerformanceMetrics` as a composable pipeline, collapsed `CampaignKPIs` to `extends CampaignMetrics, PerformanceMetrics {}`, and simplified the store to a single `filteredTotals` computed.

**Brainstorming:** Several problems existed in parallel: the store recalculated roi/ctr/cvr/cac inline with wrong zero semantics (0 instead of null); `CampaignKPIs` duplicated the five numeric fields under `totalX` aliases, forcing redundant mappings everywhere; there was no reusable aggregation function, so every reduce was written inline. Solving them together — extract `CampaignMetrics`, add `aggregateCampaignMetrics` + `computePerformanceMetrics`, collapse `CampaignKPIs` — removed all the duplication in one coherent pass. Dead imports from the previously deleted `roi.ts` in `DashboardKpis.vue` and `ExecutiveSummaryMetrics.vue` were fixed as part of the same session.

**Prompt:** CampaignKPIs should also extend PerformanceMetrics. In campaignStore there is also the same calculation for KPIs as in toCampaignPerformance — extract that part so we can use the same calculation. KPIs can also have null values — fix FE consumers. computePerformanceMetrics should accept the campaign model and use object destructuring. Check exported members of campaignStore — remove anything not consumed. Create a function in campaign-performance that accepts an array of campaigns and returns CampaignMetrics. Use this function in campaignStore. CampaignKPIs should extend CampaignMetrics and PerformanceMetrics — avoid multiple mappings. Update everything related to those.

**What changed:**
- `app/src/common/types/campaign.ts` — `CampaignMetrics` interface added (budget/revenue/impressions/clicks/conversions); `Campaign extends CampaignMetrics`; `CampaignKPIs` collapsed to `extends CampaignMetrics, PerformanceMetrics {}`
- `app/src/common/utils/campaign-performance.ts` — `computePerformanceMetrics(campain: CampaignMetrics): PerformanceMetrics` extracted (null on zero-divisor); `aggregateCampaignMetrics(campaigns: Campaign[]): CampaignMetrics` added (single-pass reduce); `toCampaignPerformance` delegates to `computePerformanceMetrics`
- `app/src/stores/campaignStore.ts` — five individual `totalX` computeds replaced by `filteredTotals` (via `aggregateCampaignMetrics`); `kpis` simplified to `{ ...filteredTotals.value, ...computePerformanceMetrics(filteredTotals.value) }: CampaignKPIs`; `totalImpressions/totalClicks/totalConversions` removed from public return (no external consumers); `safeDivide`/`round2` imports removed
- `app/src/features/dashboard/components/DashboardKpis.vue` — broken `roiClass` import from deleted `roi.ts` replaced with `percentageClass`; `kpis.totalBudget/totalRevenue/totalConversions` → `kpis.budget/revenue/conversions`
- `app/src/features/dashboard/components/DashboardCharts.vue` — `kpis.totalImpressions/totalClicks/totalConversions` → `kpis.impressions/clicks/conversions`
- `app/src/features/ai-tools/ai-analysis/components/executive-summary/ExecutiveSummaryMetrics.vue` — broken `roiClass` import from deleted `roi.ts` replaced with `percentageClass`

**Key decisions & why:**
- `CampaignMetrics` accepts `Campaign[]` in `aggregateCampaignMetrics` — only numeric base fields matter for aggregation; `CampaignPerformance[]` would also work structurally but the base type is the correct constraint
- `computePerformanceMetrics` uses null (not 0) for zero-divisor cases — consistent with per-campaign semantics; `safeDivide` returning 0 was semantically wrong for portfolio KPIs
- `filteredTotals` kept as an intermediate computed rather than inlined into `kpis` — allows future reuse without recalculation
- `buildExecutiveSummaryData.ts` / `buildBudgetOptimizerData.ts` not touched — their `totalX` locals are internal variables; they operate on raw `Campaign[]` with deliberate `Infinity`-based CAC for comparison logic and are not consumers of `CampaignKPIs`
- Explicit `: CampaignKPIs` return type on `kpis` computed — catches shape mismatches at the store boundary


## [#235] Add rowId to Campaign and wire through data transfer
**Type:** update

**Summary:** Added `rowId: number` to `Campaign` as a system-generated identity field, assigned from `rowNum` during CSV parsing, and set explicitly on all 21 mock campaigns.

**Brainstorming:** `rowId` is not a CSV column — it's assigned by the system at parse time from the row's position in the file. `EXPECTED_HEADERS` and `CSV_HEADERS` are left unchanged since `rowId` is never in the uploaded or downloaded CSV. `extractCampaignFields` now receives `rowId` as a parameter (set to `rowNum` by `processRows`). `map-campaign.ts` requires no change — destructuring strips `rowNum` and naturally retains `rowId` on the campaign passed to the store.

**Prompt:** Add a property rowId: number in Campaign model. Update data transfer logic to include this field.

**What changed:**
- `app/src/common/types/campaign.ts` — `rowId: number` added to `Campaign`
- `app/src/common/data/MOCK_CAMPAIN_DATA.ts` — `rowId: 1–21` added to all mock campaigns
- `app/src/features/data-transfer/utils/validate-campaign-data.ts` — `extractCampaignFields` accepts third `rowId: number` param and includes it in the returned `Campaign`; `processRows` passes `rowNum` as `rowId`

**Key decisions & why:**
- `rowId` placed on `Campaign` (not `CampaignMetrics`) — it's an identity field, not a numeric performance metric
- `EXPECTED_HEADERS` / `CSV_HEADERS` unchanged — `rowId` is system-assigned, never user-supplied or exported
- `map-campaign.ts` unchanged — rest-spread already keeps all `Campaign` fields including `rowId` after stripping `rowNum`


## [#236] Rename Csv* types to CampainData* and remove CsvCampaign
**Type:** refactor

**Summary:** Renamed all `Csv*` data-transfer types to `CampainData*` to decouple from the CSV format, and removed `CsvCampaign` since `Campaign` (with `rowId`) now covers all its fields.

**Brainstorming:** The data-transfer feature is intended to support multiple file formats in the future. Using `Csv` as a prefix tied the type names to a specific format. The new `CampainData` prefix is format-agnostic. `CsvCampaign` became unnecessary after `rowId` was added to `Campaign` in the previous session — it was `Campaign + rowNum`, but `rowId === rowNum`, making it a redundant wrapper. Removing it simplifies the entire data flow: `processRows` now pushes `Campaign` directly without the `rowNum` spread, `map-campaign.ts` became an identity function and was deleted, and all downstream consumers use `Campaign` directly.

**Prompt:** data-transfer feature must support different file types in the future. Update models and move away from naming Csv.... use CampainData.... . Clean up unnecessary types like CsvCampain. Update consumers as well.

**What was built:**
- `app/src/features/data-transfer/types/index.ts` — all types renamed: `CsvRowIssueType` → `CampainDataRowIssueType`, `CsvFieldIssue` → `CampainDataFieldIssue`, `CsvRowError` → `CampainDataRowError`, `CsvDuplicateGroup` → `CampainDataDuplicateGroup`, `CsvValidationErrorType` → `CampainDataValidationErrorType`, `CsvValidationError` → `CampainDataValidationError`, `CsvParseResult` → `CampainDataParseResult`, `ProcessRowsResult` → `CampainDataProcessRowsResult`; `CsvCampaign` removed — `rows: Campaign[]` in `CampainDataDuplicateGroup`; `CampainDataParseResult.campaigns` and `CampainDataProcessRowsResult.campaigns` are `Campaign[]`
- `app/src/features/data-transfer/utils/validate-campaign-data.ts` — imports updated; `processRows` now pushes `fields` (Campaign) directly without `rowNum` spread; return types updated
- `app/src/features/data-transfer/utils/detect-campaign-duplication.ts` — `CsvCampaign` replaced with `Campaign`; `CsvDuplicateGroup` → `CampainDataDuplicateGroup`
- `app/src/features/data-transfer/utils/validate-row-data.ts` — `CsvRowError` → `CampainDataRowError` throughout
- `app/src/features/data-transfer/utils/error-messages.ts` — all four `Csv*` type imports renamed
- `app/src/features/data-transfer/utils/parse-csv.ts` — `CsvParseResult` → `CampainDataParseResult`
- `app/src/features/data-transfer/utils/map-campaign.ts` — **deleted**; became identity function after `CsvCampaign` removal
- `app/src/features/data-transfer/components/UploadModal.vue` — removed `toCampaigns` import; replaced all three call sites with direct value/spread; `CsvCampaign` → `Campaign`, `CsvRowError` → `CampainDataRowError`, `CsvDuplicateGroup` → `CampainDataDuplicateGroup`
- `app/src/features/data-transfer/components/DisplayUploadErrorsStep.vue` — `CsvCampaign` → `Campaign`, `CsvRowError` → `CampainDataRowError`
- `app/src/features/data-transfer/components/ResolveDuplicationsStep.vue` — `CsvCampaign` → `Campaign`, `CsvDuplicateGroup` → `CampainDataDuplicateGroup`
- `app/src/features/data-transfer/components/validation/CampainDuplicationsTable.vue` — type renames; `rowNum` → `rowId` throughout (SortKey, COLUMNS key, sort comparator, selection map, template bindings)
- `app/src/features/data-transfer/components/validation/DataErrorsTable.vue` — `CsvRowError` → `CampainDataRowError`

**Key decisions & why:**
- `CampainData` prefix chosen (not `Data` or `FileData`) — consistent with existing project naming convention (`CampainDuplicationsTable`, `MOCK_CAMPAINS`, etc.)
- `CsvCampaign` removed entirely rather than renamed — with `rowId` on `Campaign`, the type added no new fields; keeping it would have been a redundant alias
- `map-campaign.ts` deleted — once `CsvCampaign` was gone, `toCampaigns` became `(c: Campaign[]) => c`; dead code deleted rather than left as dead weight
- `rowNum` local variable kept in `processRows` for the `+2` calculation clarity, but no longer spread onto the campaign object


## [#237] Add Channel type, campainChannels store ref, and buildChannelMap utility
**Type:** feature

**Summary:** Added `Channel` type extending `CampaignMetrics`, a `buildChannelMap` utility split into a pure grouping phase and an immutable sort phase, and a `campainChannels` ref in `campaignStore` populated on load.

**Brainstorming:** `Channel` aggregates campaign metrics per channel and carries `CampaignPerformance[]` for future channel views and AI context. The id is derived deterministically (lowercase, trim, hyphenate) so it is URL-safe and stable. `buildChannelMap` accepts `Campaign[]` and calls `toCampaignPerformance` internally — callers pass the natural load-time type and get back a fully typed map. A `ref` is the right store primitive because channel membership belongs to the full loaded dataset, not the filtered view; a computed would rebuild the map on every filter toggle for no benefit. The builder is split into `groupCampaignsByChannel` (accumulation, no sorting) and a sort phase that iterates sorted keys and spreads each entry with a freshly sorted campaigns array — no data is mutated at any point.

**Prompt:** Create `channel.ts` in `common/types` — `Channel extends CampaignMetrics` with `id: string`, `name: string`, `campaigns: CampaignPerformance[]`. Create `campaign-channel.ts` with `buildChannelMap(campaigns: Campaign[]) → Map<string, Channel>`: extract a private `groupCampaignsByChannel` that accumulates channel entries using `aggregateCampaignMetrics` over the growing campaigns list (new object on every collision, no mutation); then sort the map keys, iterate them, and reduce into a new Map spreading each channel with `[...campaigns].sort()` — no in-place sort anywhere. `buildChannelMap` calls `toCampaignPerformance` internally. Add a `campainChannels` ref to `campaignStore` (type `Map<string, Channel>`), initialise it from mock data, set it in `loadCampaigns`, and return it from the store.

**What was built:**
- `app/src/common/types/channel.ts` — `Channel extends CampaignMetrics` with `id`, `name`, `campaigns: CampaignPerformance[]`
- `app/src/common/utils/campaign-channel.ts` — `toChannelId` helper; `groupCampaignsByChannel` (private, pure accumulation via `aggregateCampaignMetrics` + spread on collision); `buildChannelMap` (sorts keys, reduces into new Map with `[...campaigns].sort()` per entry)
- `app/src/stores/campaignStore.ts` — `campainChannels` ref (`Map<string, Channel>`), initialised with `buildChannelMap(MOCK_CAMPAINS)` in dev-mock mode, updated in `loadCampaigns`, returned from store

**Key decisions & why:**
- `Map<string, Channel>` over `Record` — preserves sorted insertion order; communicates that iteration order matters
- `ref` over `computed` — channel structure is load-time data; filters should not trigger a full rebuild
- `toCampaignPerformance` called inside the builder — callers pass `Campaign[]` (the natural type); the builder owns the conversion
- `aggregateCampaignMetrics(updatedCampaigns)` on collision — reuses the already-computed `CampaignPerformance[]` list; keeps campaigns as the single source of truth for totals
- two-phase split — grouping and sorting are separate concerns; the sort phase never touches `groupCampaignsByChannel` output after creation


## [#238] Refactor channel filter to use portfolioChannels and selectedChannelsIds
**Type:** refactor

**Summary:** Replaced string-based channel filter with Channel-object-based approach — ChannelFilter now renders from `portfolioChannels` Map, `selectedChannels` renamed to `selectedChannelsIds` (stores Map keys), and KPIs now aggregate pre-summed Channel objects instead of iterating all campaigns.

**Brainstorming:** Three connected changes discussed: (1) `selectedChannels` → `selectedChannelsIds` to reflect that stored values are channel IDs (Map keys, not display names); (2) ChannelFilter driven by `portfolioChannels` values (Channel objects with id + name) instead of a separate `availableChannels` computed that re-derived strings from campaigns; (3) KPIs computed from Channel objects which already carry pre-aggregated metrics — avoids re-iterating all campaigns on every filter change. `campaignScope.selectedChannels` maps IDs back to human-readable names so AI prompts receive correct strings. `filteredCampaigns` also optimized to flatMap campaign arrays from selected Channel objects instead of filtering the full campaigns array.

**Prompt:** Use portfolioChannels to render channel filters. selectedChannels should be renamed to selectedChannelsIds. kpis should be computed from selected channels so calculation is faster.

**What changed:**
- `campaignStore.ts` — renamed `selectedChannels` → `selectedChannelsIds`; removed `availableChannels` computed; added `selectedChannelObjects` computed (Channel[] for selected IDs or all); `filteredCampaigns` now flatMaps from Channel objects; `kpis` aggregates `selectedChannelObjects` (pre-summed); `campaignScope.selectedChannels` maps IDs to names; `toggleChannel`/`clearFilters`/`loadCampaigns` updated
- `ChannelFilter.vue` — prop `channels` changed from `string[]` to `Channel[]`; template uses `channel.id` as key and for toggle, `channel.name` for display
- `DashboardView.vue` — passes `[...store.portfolioChannels.values()]` and `store.selectedChannelsIds` to ChannelFilter
- `DashboardHeader.vue` — `selectedChannels` → `selectedChannelsIds`, `availableChannels.length` → `portfolioChannels.size`
- `aiAnalysisStore.ts` — three references to `campaignStore.selectedChannels` updated: cache keys use `selectedChannelsIds`; prompt `filteredChannels` uses `campaignStore.campaignScope.selectedChannels` (names); watcher updated to `selectedChannelsIds`

**Key decisions & why:**
- `selectedChannelsIds` stores channel IDs (Map keys) not names — IDs are stable, normalized strings; names are for display only
- `campaignScope.selectedChannels` maps IDs → names — AI prompts receive human-readable channel names, not hyphenated IDs
- KPIs aggregate `Channel[]` (pre-summed) instead of `CampaignPerformance[]` — Channel already carries budget/revenue/etc totals; no need to re-sum campaigns on every filter interaction
- `filteredCampaigns` flatMaps from selected Channel objects — O(selected channels × campaigns per channel) instead of O(all campaigns); order changes (grouped by channel) but table is sortable so it doesn't matter
- `availableChannels` computed removed — redundant once ChannelFilter accepts `Channel[]`; `portfolioChannels.size` replaces `.length` for the header count


## [#239] Replace channelTotals with selectedChannels Channel array in store and charts
**Type:** refactor

**Summary:** Removed `channelTotals` computed and `campaign-aggregation.ts`, renamed `selectedChannelObjects` → `selectedChannels` (Channel[]), and updated DashboardCharts to map data directly from Channel objects.

**Brainstorming:** `channelTotals` was a `Record<string, ChannelTotals>` derived by iterating all filtered campaigns — redundant now that `portfolioChannels` already holds pre-aggregated Channel objects. Replacing it with `selectedChannels: Channel[]` gives charts direct access to `ch.name`, `ch.budget`, `ch.revenue` etc. without a separate accumulation pass. `groupByChannel` and `ChannelTotals` type become dead code, so `campaign-aggregation.ts` is deleted entirely.

**Prompt:** Remove channelTotals, create a selectedChannels array, use that in charts to map data, clean up groupByChannel function, selectedChannelObjects should be selectedChannels.

**What changed:**
- `campaignStore.ts` — removed `groupByChannel` import and `channelTotals` computed; renamed `selectedChannelObjects` → `selectedChannels`; added `selectedChannels` to return
- `DashboardCharts.vue` — prop `channelTotals: Record<string, ChannelTotals>` replaced with `channels: Channel[]`; `revVsBudgetData` maps from `channels` directly (`ch.name`, `ch.budget`, `ch.revenue`)
- `DashboardView.vue` — `:channel-totals` replaced with `:channels="store.selectedChannels"`
- `campaign-aggregation.ts` — deleted (no remaining usages)

**Key decisions & why:**
- `Channel[]` instead of `Record<string, ChannelTotals>` — Channel already carries all needed fields; a flat array is simpler to map over in chart computeds
- File deleted rather than emptied — `ChannelTotals` type and `groupByChannel` function had no other consumers; keeping an empty file would be misleading


## [#240] Derive filteredCampaigns from selectedChannels; campaignScope.campaigns from portfolioChannels
**Type:** refactor

**Summary:** Simplified `filteredCampaigns` to always flatMap from `selectedChannels` Channel objects (no conditional), and updated `campaignScope.campaigns` to derive from `portfolioChannels` instead of the raw `campaigns` ref.

**Brainstorming:** Two connected simplifications: (1) `filteredCampaigns` had a conditional — return `campaigns.value` when no filter, else flatMap from selected Channel objects. Since `selectedChannels` already resolves to all channels when nothing is selected, the conditional is redundant — always flatMap from `selectedChannels`. (2) `campaignScope.campaigns` sourced from `campaigns.value` (raw ref); portfolioChannels is now the canonical structure, so flatMap from its values makes portfolioChannels the single source of truth. Rename to `selectionScope` was requested then cancelled by user mid-implementation — name stays `campaignScope`.

**Prompt:** filteredCampaigns should be populated from selected channels. campainScope campaigns in scope map it from portfolioChannels.

**What changed:**
- `campaignStore.ts` — `selectedChannels` moved above `filteredCampaigns` (dependency order); `filteredCampaigns` simplified to `selectedChannels.value.flatMap(ch => ch.campaigns)`; `campaignScope.campaigns` changed from `campaigns.value.map(...)` to `[...portfolioChannels.value.values()].flatMap(ch => ch.campaigns.map(c => c.campaign))`

**Key decisions & why:**
- `selectedChannels` declared before `filteredCampaigns` — `filteredCampaigns` now depends on it, order matters in the setup function
- `portfolioChannels` as source for `campaignScope.campaigns` — portfolioChannels is already the canonical sorted structure; raw `campaigns` ref is now an internal implementation detail only needed for loadCampaigns and empty-state checks


## [#241] Derive campaigns computed from portfolioChannels; remove campaigns ref
**Type:** refactor

**Summary:** Replaced the `campaigns` ref with a computed that flatMaps from `portfolioChannels`, making portfolioChannels the single source of truth and removing `toCampaignPerformance` from the store.

**Brainstorming:** `buildChannelMap` already calls `toCampaignPerformance` internally — portfolioChannels already holds all `CampaignPerformance[]` data. The raw `campaigns` ref was redundant duplication of that same data. Making `campaigns` a computed simplifies `loadCampaigns` (one less assignment), removes the `toCampaignPerformance` import from the store, and lets `campaignScope.campaigns` use the computed directly instead of the verbose flatMap from the previous session.

**Prompt:** Compute campaigns from all channels, use that to populate campaigns in campaignScope, make sure campaignStore is clean.

**What changed:**
- `campaignStore.ts` — removed `campaigns` ref and `toCampaignPerformance` import; added `campaigns` computed (flatMaps all ch.campaigns from portfolioChannels); `campaignScope.campaigns` simplified to `campaigns.value.map(c => c.campaign)`; `loadCampaigns` removes the `campaigns.value = ...` assignment; DEV_MOCK comment updated

**Key decisions & why:**
- `campaigns` as computed not ref — portfolioChannels is already the authoritative structure built by `buildChannelMap`; a separate ref was a copy that had to be kept in sync manually
- `toCampaignPerformance` removed from store imports — conversion now happens exclusively inside `buildChannelMap`; the store no longer needs to know about it


## [#242] Show campaign count pill in channel filter chips
**Type:** update

**Summary:** Added a subtle count pill inside each channel chip showing how many campaigns belong to that channel.

**Brainstorming:** `Channel` already carries `campaigns: CampaignPerformance[]`, so the count is available via `channel.campaigns.length` with no prop or store changes. Two visual options considered: inline text ("Email (4)") vs a small rounded pill. Pill chosen for cleaner visual separation between name and count. Styled with `bg-white/10` so it adapts to both active (primary) and inactive (surface) chip states without needing variant-specific overrides.

**Prompt:** Show campaign count in the channel chips — option 2 (subtle pill).

**What changed:**
- `ChannelFilter.vue` — added `<span class="filter-count">` inside each channel button; added `.filter-count` scoped style (inline-flex, rounded-full, px-1.5, min-w-[1.25rem], h-5, text-xs, bg-white/10, ml-1)

**Key decisions & why:**
- `bg-white/10` for the pill background — semi-transparent white works on both the active primary-500 and inactive surface backgrounds without needing per-state color overrides


## [#243] Extract provider implementations into dedicated providers/ module
**Type:** refactor

**Summary:** Broke the monolithic `ai-connection/gemini.ts`, `ai-connection/groq.ts`, and `ai-connection/shared.ts` files into a structured `providers/` module with per-provider subfolders (gemini/, qroq/) each owning its types, API calls, and connection logic, plus shared utils for error handling and model ranking.

**Brainstorming:** The old structure put every concern for a provider into one large file — raw HTTP calls, model filtering, model evaluation prompt, fallback logic, and shared utilities all mixed together. As the codebase grew and a second provider (Groq) was added alongside Gemini, the duplication became visible: both `gemini.ts` and `groq.ts` had their own copies of `buildFallbackModel`, `filterModels`, `getOptimalModel`, and both imported from a flat `shared.ts`. The goal was single-responsibility: each provider folder gets `types.ts` (raw API shapes), `api.ts` (fetch wrappers), and `connect.ts` (full connection flow). Shared error utilities (`normalizeConnectionError`, `assertResponseOk`, `assertChatResponseOk`) and model utilities (`buildFallbackModel`, `rankModels`, `parseJsonResponse`) were lifted into `providers/utils/`. A new generic `runProviderPrompt<T>` was added as a clean replacement for the inline `callGemini`/`callGroq` pattern inside `callProviderForAnalysis` — though the analysis call path is only partially migrated. `assertChatResponseOk` is a notable new addition: it reads the response body to detect token-limit patterns before throwing, which was previously done inline inside `callProviderForAnalysis`.

**Prompt:** Refactor the ai-connection provider files (gemini.ts, groq.ts, shared.ts) into a dedicated providers/ module. Each provider should have its own subfolder with types, api, and connect files. Shared utilities for error handling and model ranking go into providers/utils/. Add a generic runProviderPrompt<T> as the future replacement for callProviderForAnalysis. Update connectProvider to import from the new module.

**What changed:**
- `providers/` (new folder) — dedicated provider module
- `providers/index.ts` — barrel exporting connectGemini, connectGroq, requestGeminiChatCompletion, requestGroqChatCompletion, runProviderPrompt, connectProvider
- `providers/connect-provider.ts` — thin connectProvider dispatcher with no error wrapping (errors thrown by individual providers)
- `providers/run-provider-prompt.ts` — generic runProviderPrompt<T>; dispatches to provider caller, parses JSON, throws 'invalid-response' on parse failure
- `providers/types.ts` — empty placeholder file
- `providers/gemini/types.ts` — GeminiModel, GeminiModelsResponse (moved from ai-tools/types/)
- `providers/gemini/api.ts` — fetchGeminiModels + requestGeminiChatCompletion; uses shared error utils
- `providers/gemini/connect.ts` — connectGemini full flow; filterModels, getSortedModels (flash-first + version desc), getOptimalModel; AI evaluation prompt; falls back to buildFallbackModel
- `providers/gemini/index.ts` — barrel
- `providers/qroq/types.ts` — GroqModel, GroqModelsResponse (moved from ai-tools/types/); folder named qroq
- `providers/qroq/api.ts` — fetchGroqModels + requestGroqChatCompletion; uses shared error utils
- `providers/qroq/connect.ts` — connectGroq full flow; filterModels, getOptimalModel (most recently created); AI evaluation prompt; falls back to buildFallbackModel
- `providers/qroq/index.ts` — barrel
- `providers/utils/error-handling.ts` — normalizeConnectionError, errorCodeFromStatus (expanded: 400/401/403→invalid-key), assertResponseOk, assertChatResponseOk (new — reads body for token-limit detection)
- `providers/utils/shared.ts` — buildFallbackModel, rankModels, parseJsonResponse (consolidated from old shared.ts and per-provider files)
- `providers/utils/index.ts` — barrel re-exporting error-handling
- `ai-connection/gemini.ts` — deleted (moved to providers/gemini/)
- `ai-connection/groq.ts` — deleted (moved to providers/qroq/)
- `ai-connection/shared.ts` — deleted (moved to providers/utils/)
- `ai-connection/connectProvider.ts` — updated to import from providers/ barrel; uses normalizeConnectionError from providers/utils
- `ai-analysis/callProvider.ts` — imports parseJsonResponse from providers/utils/shared (partial migration; inline callGemini/callGroq remain)
- `ai-connection/utils/index.ts` — added invalid-response to ERROR_MESSAGES and ERROR_HINTS
- `types/index.ts` — added invalid-response to AiConnectionErrorCode; removed GeminiModel/GeminiModelsResponse/GroqModel/GroqModelsResponse (moved to provider files); replaced RankedModelsResponse with ModelsResponse (generic); promoted ConfidenceLevel to top-level export; added ExecutiveSummaryChannel, ExecutiveSummaryCampaign, ExecutiveSummaryOtherChannelsSummary as named types
- `toastStore.ts` — auto-dismiss changed from 4s to 5s

**Key decisions & why:**
- `providers/` as a sibling to `ai-analysis/` and `ai-connection/` — provider logic is its own concern, not owned by either the connection or analysis path; this placement makes both consumers equal importers
- Folder named `qroq` not `groq` — name chosen during authoring; kept as-is to avoid unnecessary rename churn
- `assertChatResponseOk` separate from `assertResponseOk` — analysis calls need token-limit body inspection; connection calls only need status-based error codes; separating them avoids over-reading response bodies during model listing
- `runProviderPrompt` added but not yet wired to `aiAnalysisStore` — incremental migration; the analysis store still calls `callProviderForAnalysis` from `ai-analysis/callProvider.ts`; full cutover is the next step
- `rankModels.ts` in `ai-tools/utils/` kept for now — still referenced by existing code; removal deferred until the full migration to `providers/utils/shared.ts` is complete
- `errorCodeFromStatus` now maps 400/401/403 → `invalid-key` — the old version only mapped 429 and 500+; this means auth errors from the connection endpoint now produce the correct user-facing message rather than 'unknown'


## [#244] Wire aiStore to providers/connectProvider; move error mapping into store; delete old ai-connection wrappers
**Type:** refactor

**Summary:** Replaced the `ai-connection/connectProvider.ts` wrapper (which returned `AiModel[] | AiConnectionError`) with the new `providers/connectProvider` (which throws), moved error mapping into `aiStore.connect()`, and deleted the now-redundant `ai-connection/connectProvider.ts` and `ai-connection/index.ts`.

**Brainstorming:** The old `ai-connection/connectProvider.ts` was a catch-and-return wrapper: it caught any thrown error, normalized it, and returned an `AiConnectionError` object so the store could check `isConnectionError(result)`. The new `providers/connect-provider.ts` is a thin dispatcher that throws — meaning the union return type `AiModel[] | AiConnectionError` was wrong, and error handling belonged somewhere else. The store is the right place: it already owns connection state (`connectionError`, `isConnected`), so catching there keeps the error path next to the state it affects. The `isConnectionError` type guard became unnecessary once the return type is `AiModel[]` only. The `console.log` in `selectBestModel` was removed as part of cleanup.

**Prompt:** Use the new connectProvider from providers/. Move error mapping to aiStore. Clean up files not needed anymore.

**What changed:**
- `providers/connect-provider.ts` — return type corrected from `Promise<AiModel[] | AiConnectionError>` to `Promise<AiModel[]>`; unused `AiConnectionError` import removed; indentation normalized
- `stores/aiStore.ts` — imports `connectProvider` from `providers/` and `normalizeConnectionError` from `providers/utils`; added `AiConnectionErrorCode` import and `ERROR_CODES` set; removed `isConnectionError` type guard; `connect()` rewritten as try/catch — success path sets state directly, catch path maps error via `normalizeConnectionError` + `ERROR_CODES`; removed `console.log` from `selectBestModel`
- `ai-connection/connectProvider.ts` — deleted (logic split: dispatch moved to `providers/connect-provider.ts`, error mapping moved to `aiStore`)
- `ai-connection/index.ts` — deleted (barrel had no remaining exports)

**Key decisions & why:**
- Error mapping in the store, not in a wrapper — the store is the only consumer of `connectProvider`; keeping error handling next to the state it sets avoids an indirection layer that existed solely to avoid a try/catch in the store
- `isConnectionError` guard removed — with `connectProvider` returning `Promise<AiModel[]>` and throwing on failure, a union return type and its guard are no longer needed
- `invalid-response` added to `ERROR_CODES` — it was missing from the old set and is now a valid `AiConnectionErrorCode`


## [#245] Retry model evaluation across candidates; fix swapped args and wrong provider label
**Type:** refactor

**Summary:** Replaced the single-shot AI model evaluation call in `connectGemini` and `connectGroq` with a retry loop that iterates through sorted candidates, removes any model that fails (API error or parse error), and only falls back to `[fallback]` when all candidates are exhausted; also fixed two pre-existing bugs: swapped `model`/`prompt` args in both API calls, and wrong provider label (`PROVIDER_LABELS.groq`) used for the Gemini fallback model.

**Brainstorming:** The old implementation picked one optimal model and ran the evaluation prompt with it — if that call failed for any reason, the whole evaluation was abandoned and only the fallback model was returned. The retry loop is the natural fix: if the best candidate can't run the prompt, try the next-best. Removing the failed candidate from `candidates` also means the evaluation prompt is rebuilt each iteration, so the AI isn't asked to evaluate models that have already proven unresponsive. The `attemptEvaluation` helper was extracted to keep `connectGemini`/`connectGroq` under the complexity threshold (the nested try/catch inside a while loop was flagged at complexity 11). Both implementations follow the same shape, differing only in provider-specific types and model ID format. The swapped-args bug (`requestGeminiChatCompletion(apiKey, prompt, optimal)` instead of `(apiKey, modelId, prompt)`) would have sent the full prompt text as the model identifier — the evaluation call was silently broken. The Gemini fallback used `PROVIDER_LABELS.groq` as the provider string — cosmetic but incorrect.

**Prompt:** Update connectGroq and connectGemini. Iterate on multiple models if call fails, rather than just picking the optimal and falling back to it if the evaluation fails. Models that failed should be removed from the filtered models list. Make sure to add a new error handling in case parsing of JSON response fails.

**What changed:**
- `providers/gemini/connect.ts` — complete rewrite; `getSortedCandidates` replaces `getFlashModelSortDir` + `getSortedModels` + `getOptimalModel`; `attemptEvaluation(apiKey, modelId, candidates, fallback)` → `AiModel[]|null` encapsulates one attempt (API call + parse); `connectGemini` runs the retry loop, shifts failed candidates; fixed `PROVIDER_LABELS.groq` → `PROVIDER_LABELS.gemini`; fixed arg order `(apiKey, modelId, prompt)`; removed console.logs and TODO comments
- `providers/qroq/connect.ts` — complete rewrite; `getSortedCandidates` (sort by `created` desc) replaces `getOptimalModel`; same `attemptEvaluation` pattern; `connectGroq` runs the retry loop; fixed arg order `(apiKey, runner.id, prompt)`; removed console.logs and TODO comments
- `prompts/model-evaluation-prompt.ts` — import of `GeminiModel`/`GroqModel` updated to source from `providers/gemini/types` and `providers/qroq/types` (auto-fixed; the old `../types` import was broken after the providers refactor)

**Key decisions & why:**
- `attemptEvaluation` extracted as a module-private helper — the nested try/catch inside a while loop pushed `connectGemini` to complexity 11; the helper reduces the public function to a simple loop with an early return, bringing complexity down to an acceptable level
- Failed candidates removed from `candidates` before each retry — the evaluation prompt is rebuilt from the remaining list each iteration, so the AI is never asked to evaluate a model that already failed; this keeps the prompt consistent with what's actually available
- `null` return from `attemptEvaluation` rather than throwing — makes the retry loop a simple `if (result) return result` without any additional try/catch at the call site
- Fallback returned only when all candidates are exhausted — connection still succeeds with the optimal model as a baseline; the AI evaluation is a best-effort ranking, not a hard requirement


## [#246] Replace fallback model with recursive evaluation; throw on exhaustion; filter ranked output against candidates
**Type:** refactor

**Summary:** Replaced the while-loop-with-fallback pattern in `connectGemini` and `connectGroq` with a recursive `evaluateModels` function; removed `buildFallbackModel` and `rankModels` from `providers/utils/shared.ts`; the ranked output is now validated against the actual candidates list, and if all candidates are exhausted the error propagates to the store which blocks connection.

**Brainstorming:** The fallback model was a silent safety net: if every AI evaluation attempt failed, the user was "connected" with an untested model. The argument against keeping it is that a fallback that passes all prompts would also pass the evaluation — so if the evaluation consistently fails, it's likely a deeper problem (rate limit, API instability) and silently connecting is misleading. The recursive structure is a natural fit: base case throws, recursive case tries the head and falls through to tail on failure. `tryWithModel` extracts the single-attempt logic so `evaluateModels` has no branching beyond the base case and `.catch`, keeping both functions well within the complexity budget. The ranked output validation (`toRankedModels` filtering by `validIds`) prevents hallucinated model IDs from leaking through — previously `rankModels` would push a fallback if the AI returned nothing matching, now an empty validated result triggers another retry instead. `buildFallbackModel` and `rankModels` in `providers/utils/shared.ts` became dead code once both providers stopped using them.

**Prompt:** Refine the logic. Use recursive calling instead of while. Filter out all models that are not in the candidates list or in the runner. Do not keep fallback model — if the prompt fails, the rest will fail too. In that case throw an error and do not establish connection in the store.

**What changed:**
- `providers/gemini/connect.ts` — complete rewrite; `flashPriority` extracted for sort readability; `isSufficientModel`/`buildValidIds`/`byStrengthDesc`/`withLimitReset` extracted as named helpers to keep `toRankedModels` below complexity threshold; `toRankedModels` validates response against candidate IDs (both `models/` prefixed and stripped forms), filters strength_score≥6, throws `no-models` if result is empty; `tryWithModel` runs one prompt+parse attempt and throws on any failure; `evaluateModels` is recursive — base case throws `no-models`, catches `tryWithModel` failure and recurses with `remaining`; `connectGemini` just filters, sorts, and delegates; `PROVIDER_LABELS` import removed (no fallback)
- `providers/qroq/connect.ts` — same structure; `buildValidIds` inlined as a single `new Set(candidates.map(c => c.id))` (no prefix stripping needed for Groq); otherwise identical shape
- `providers/utils/shared.ts` — `buildFallbackModel` and `rankModels` removed (dead code); only `parseJsonResponse` remains
- `aiStore.ts` — no change needed; the store's existing catch block maps the thrown `no-models` error to `{ code: 'no-models', provider }`, which blocks connection and shows the appropriate error message

**Key decisions & why:**
- Recursive `evaluateModels` over while loop — natural base-case/recursive-case fit; removes mutable `candidates.shift()` mutation; each frame gets its own immutable `[runner, ...remaining]` destructure
- `tryWithModel` extracted — isolates the async attempt logic so `evaluateModels` contains no branching except the base case and the `.catch`; this is what keeps both functions under the complexity threshold
- Throw on exhaustion, not silent fallback — if every candidate fails the evaluation call, connecting with an unverified model is misleading; the error propagates to `aiStore` which sets `connectionError` and leaves `isConnected = false`
- `toRankedModels` validates output against `validIds` — prevents the AI from returning hallucinated model identifiers; an empty validation result triggers a retry rather than a silent empty connection
- `buildFallbackModel` / `rankModels` removed from `providers/utils/shared.ts` — both were only used by the connect files and are now fully superseded by the per-provider `toRankedModels` implementations


## [#247] Move shared ranking logic (strength filter, sort, limitReset, no-models throw) to connect-provider
**Type:** refactor

**Summary:** Extracted the universal post-evaluation ranking step — strength_score≥6 filter, byStrengthDesc sort, withLimitReset map, and no-models throw — from each provider's `toRankedModels` into `connect-provider.ts`; providers now only validate the AI response against their own candidate ID sets.

**Brainstorming:** The `isSufficientModel`, `byStrengthDesc`, and `withLimitReset` helpers were duplicated verbatim in both `gemini/connect.ts` and `qroq/connect.ts`. The strength score threshold, sort order, and `limitReached` reset are universal concerns independent of any provider — they belong at the aggregation point, not inside each provider. Moving them to `connect-provider` means a single `rankModels` function owns that logic, providers only need to answer "did the AI return something that matches a known model ID?", and any future provider automatically gets the same ranking applied. The retry logic (evaluateModels recursion) is unaffected: `toRankedModels` still throws `no-models` if no candidate IDs match, which triggers the next recursion frame. The strength/sort/map step happens once, after the winning evaluation round completes. The Groq file also needed named function references (`isAllowed`, `byCreatedDesc`) instead of inline arrows to keep the cumulative file complexity under the linter threshold.

**Prompt:** Lets move `.sort(byStrengthDesc)` `.map(withLimitReset)` to the connect-provider without missing any error handling — filtering by strength_score should also happen there and throwing a no models error there.

**What changed:**
- `providers/connect-provider.ts` — added `byStrengthDesc`, `withLimitReset`, and `rankModels` (strength≥6 filter + sort + map + no-models throw); `connectProvider` now calls `rankModels(await CONNECTORS[provider](apiKey))` instead of returning the raw result
- `providers/gemini/connect.ts` — removed `isSufficientModel`, `byStrengthDesc`, `withLimitReset`; `toRankedModels` now filters by `validIds` only and throws `no-models` if empty; `isSufficientModel` check (`strength_score >= 6`) removed from this file
- `providers/qroq/connect.ts` — same removals; additionally introduced `BANNED` constant, `isAllowed(m)` named predicate used as a direct reference in `filterModels` (eliminates inline arrow), `byCreatedDesc` named comparator used as a direct reference in `getSortedCandidates` (eliminates inline arrow), and `buildValidIds` helper (mirrors Gemini's pattern) — all required to keep cumulative file complexity under the linter threshold

**Key decisions & why:**
- Ranking moved to `connect-provider`, not to a shared utils file — the dispatcher is already the natural integration point between providers and the store; putting `rankModels` here means it runs exactly once regardless of provider, with no duplication
- `toRankedModels` in each provider retains the validIds throw — this is what drives the retry recursion; if the AI hallucinated all model IDs the loop still tries the next candidate; only the universal quality bar (strength, sort, reset) moved up
- Named function references in Groq file — the linter reports cumulative file complexity and was hitting the threshold at `toRankedModels`; extracting `isAllowed` and `byCreatedDesc` as named functions (used by reference, not as inline arrows) removes their branch cost from the calling functions, bringing cumulative complexity to 4


## [#248] Extract toValidModels into shared utils; remove toRankedModels from provider connect files
**Type:** refactor

**Summary:** Moved the duplicate candidate-validation logic from both provider `toRankedModels` functions into a shared `toValidModels(validIds, parsed)` utility in `providers/utils/shared.ts`; `tryWithModel` in each provider now calls it directly with the provider-built `validIds` set.

**Brainstorming:** Both `toRankedModels` implementations were identical in logic — filter parsed AI response against a `Set<string>` of valid IDs, throw `no-models` if nothing matches. The only difference between providers was how `validIds` was built (Gemini strips `models/` prefix, Groq uses raw IDs), and that already lived in the provider-specific `buildValidIds` helpers. Moving the shared filter+throw step to a named utility makes the logic explicit, removes the last duplication between the two connect files, and gives the function a name that accurately describes what it does: it validates the AI response against known model IDs, not ranks them.

**Prompt:** toRankedModels is wrong naming — create a function in shared, name it toValidModels and use validIds Set<string> and AiModel[] as inputs; reuse the same function.

**What changed:**
- `providers/utils/shared.ts` — added `toValidModels(validIds: Set<string>, parsed: AiModel[]): AiModel[]`; filters parsed by `validIds.has(m.id) || validIds.has(m.model)`, throws `no-models` if result is empty
- `providers/gemini/connect.ts` — removed `toRankedModels`; `tryWithModel` now calls `toValidModels(buildValidIds(candidates), parseJsonResponse<ModelsResponse>(raw).models)`; added `toValidModels` to import from `../utils/shared`
- `providers/qroq/connect.ts` — same: removed `toRankedModels`, updated `tryWithModel`, added `toValidModels` to import

**Key decisions & why:**
- Signature is `(validIds, parsed)` not `(parsed, candidates)` — the caller already has `validIds` from `buildValidIds`; passing the set directly keeps the function decoupled from provider-specific model shapes
- `buildValidIds` stays in each provider — it handles provider-specific ID formats (Gemini `models/` prefix stripping vs Groq plain IDs); only the generic filter step is shared


## [#249] Align Gemini filterModels architecture with Groq
**Type:** refactor

**Summary:** Refactored `filterModels` in `gemini/connect.ts` to match the Groq pattern: `BANNED` module constant, `isAllowed(m)` named predicate, `filterModels` uses `isAllowed` as a direct reference with no inline arrow.

**Brainstorming:** The two providers now have identical structural shape for the filter step — a constant, a named predicate, and a one-liner `filterModels`. The Gemini predicate is slightly richer (checks `supportedGenerationMethods` in addition to the banned-name check), but the pattern is the same. `!!` coerces `boolean | undefined` from the optional chain to `boolean` so the return type is satisfied without a cast.

**Prompt:** filterModels in gemini must have same architecture as in groq. update.

**What changed:**
- `providers/gemini/connect.ts` — extracted `BANNED` constant; extracted `isAllowed(m: GeminiModel): boolean` (uses `!!` on optional-chain result + `!BANNED.some(...)`); `filterModels` now calls `models.filter(isAllowed)` with no inline arrow

**Key decisions & why:**
- `!!` on `m.supportedGenerationMethods?.includes('generateContent')` — the optional chain returns `boolean | undefined`; `!!` coerces to `boolean` so the named function satisfies its declared return type without needing `=== true` or a broader signature


## [#250] Wire runProviderPrompt into aiAnalysisStore; delete unused callProvider and rankModels files
**Type:** refactor

**Summary:** Replaced `callProviderForAnalysis` in `aiAnalysisStore` with `runProviderPrompt` from the providers module, then deleted the now-unused `ai-analysis/callProvider.ts`, `ai-analysis/index.ts`, `utils/rankModels.ts`, and removed the stale `RankedModelsResponse` type.

**Brainstorming:** `callProviderForAnalysis` was a parallel implementation of the HTTP calls already living in `providers/gemini/api.ts` and `providers/qroq/api.ts`. `runProviderPrompt` is the proper thin dispatcher that delegates to those same provider callers, parses JSON, and throws `'invalid-response'` on parse failure. The error codes that flow out of the provider API functions (`'token-limit'`, `'network'`, `'timeout'`, `'server-error'`, `'unknown'`) match what the store's `handleRequestError` expects, so the swap is a direct one-to-one replacement with no error-handling changes needed. `utils/rankModels.ts` had already been superseded by the `rankModels` function in `connect-provider.ts` — nothing else imported it. `RankedModelsResponse` was only used by `rankModels.ts`.

**Prompt:** Wire `runProviderPrompt` into `aiAnalysisStore` to replace `callProviderForAnalysis`. Then clean up all unused files: `ai-analysis/callProvider.ts`, `ai-analysis/index.ts`, `utils/rankModels.ts`; remove `RankedModelsResponse` type.

**What changed:**
- `stores/aiAnalysisStore.ts` — import changed from `callProviderForAnalysis` (via `ai-analysis` barrel) to `runProviderPrompt` (via `providers`); call site updated accordingly
- `features/ai-tools/ai-analysis/callProvider.ts` — deleted (parallel HTTP implementation, fully replaced)
- `features/ai-tools/ai-analysis/index.ts` — deleted (barrel that only re-exported `callProviderForAnalysis`)
- `features/ai-tools/utils/rankModels.ts` — deleted (superseded by `rankModels` in `connect-provider.ts`)
- `features/ai-tools/types/index.ts` — removed `RankedModelsResponse` type (only used by the deleted file)
- `CLAUDE.md` — architecture updated: removed deleted files, updated `run-provider-prompt.ts` description, updated checklist and status

**Key decisions & why:**
- No error-handling changes in the store — `runProviderPrompt` surfaces the same error codes (`'token-limit'`, `'network'`, `'timeout'`, `'server-error'`, `'unknown'`) that `handleRequestError` already handles; `'invalid-response'` on parse failure falls through to the `?? ERROR_MESSAGES.unknown` fallback
- Deleted `ai-analysis/index.ts` rather than leaving an empty barrel — an empty barrel is dead weight


## [#251] Unify error codes, extract AsyncStatus, move AiModel to providers
**Type:** refactor

**Summary:** Merged `AiConnectionErrorCode` and `AiAnalysisErrorCode` into a single `AiErrorCode` union; extracted `AsyncStatus` into `common/types/`; moved `AiModel` and `ModelsResponse` from `ai-tools/types/` to `providers/types.ts`.

**Brainstorming:** Three separate type concerns were addressed together since they all touched the same type boundary. `AiConnectionErrorCode` and `AiAnalysisErrorCode` had overlapping codes and both ended up surfaced in the same error records — unifying them into `AiErrorCode` removes the duplicate and forces exhaustive coverage everywhere via `Record<AiErrorCode, ...>`. `AsyncStatus` is a plain four-value union that every async operation uses — it belongs in `common/types/` rather than inside a feature folder. `AiModel` and `ModelsResponse` describe provider-layer data (model IDs, strength scores, limit flags) and are only meaningful inside the providers layer — moving them to `providers/types.ts` and exporting via the providers barrel keeps the public API clean while removing the circular feel of `ai-tools/types/` importing back from the providers it configures.

**Prompt:** AiConnectionErrorCode and AiAnalysisErrorCode should be unified. Also 'idle' | 'loading' | 'done' | 'error' should be a type status in common folder. Move models related to providers only there.

**What changed:**
- `common/types/async-status.ts` — new file; exports `AsyncStatus = 'idle' | 'loading' | 'done' | 'error'`
- `providers/types.ts` — was empty placeholder; now contains `AiModel` and `ModelsResponse` definitions
- `providers/index.ts` — added `export * from './types'` to expose `AiModel`/`ModelsResponse` via the barrel
- `ai-tools/types/index.ts` — removed `AiConnectionErrorCode`, `AiAnalysisErrorCode`, `AiAnalysisStatus`, `AiModel` (definition), `ModelsResponse`, `RankedModelsResponse`; added `AiErrorCode` (10-code unified union); `AiConnectionError.code` and `AiAnalysisError.code` now use `AiErrorCode`; added internal `import type { AiModel }` from providers for response types that stamp the model
- `providers/utils/error-handling.ts` — `AiConnectionErrorCode` → `AiErrorCode`
- `ai-connection/utils/index.ts` — `AiConnectionErrorCode` → `AiErrorCode` throughout; `ERROR_MESSAGES` and `ERROR_HINTS` expanded to `Record<AiErrorCode, ...>` covering all 10 codes (added `parse-error` entries)
- `stores/aiStore.ts` — `AiConnectionErrorCode` → `AiErrorCode`; `AiModel` now imported from `providers/types`; `Set<AiConnectionErrorCode>` → `Set<AiErrorCode>`
- `stores/aiAnalysisStore.ts` — `AiAnalysisStatus` → `AsyncStatus`; `AiAnalysisErrorCode` → `AiErrorCode`; `ERROR_MESSAGES` expanded to all 10 `AiErrorCode` values
- `providers/connect-provider.ts` — `AiModel` import split: from `./types` instead of `../types`
- `providers/gemini/connect.ts` — `AiModel`/`ModelsResponse` import: `../types` instead of `../../types`
- `providers/qroq/connect.ts` — same import path update
- `providers/utils/shared.ts` — `AiModel` import: `../types` instead of `../../types`
- `mocks/budget-optimizer-mocks.ts` — `AiModel` import split from `../providers/types`
- `mocks/executive-summary-mocks.ts` — same split
- `ai-analysis/components/shared/AnalysisState.vue` — replaced `AiAnalysisStatus` import with `AsyncStatus`; `status` prop type updated to `AsyncStatus`
- `CLAUDE.md` — architecture updated: `async-status.ts` added, `providers/types.ts` description updated, `types/index.ts` description rewritten, `error-handling.ts` and `ai-connection/utils/index.ts` descriptions updated, `AnalysisState.vue` prop types corrected

**Key decisions & why:**
- `AiModel` re-exported from `providers/index.ts` barrel so consumers that already import from `providers` don't need a deeper path — the type is public but lives in the right layer
- `types/index.ts` imports `AiModel` internally (not re-exported) to satisfy `BudgetOptimizerResponse.model?` and `ExecutiveSummaryResponse.model?` — the response types stay in the feature types file while the definition stays in providers
- `Record<AiErrorCode, ...>` for all error maps — TypeScript enforces exhaustiveness, preventing silent gaps when a new code is added
- `parse-error` added to `ai-connection/utils/index.ts` error records even though it's an analysis-only code — exhaustiveness requires all 10 entries everywhere the record type is used


## [#252] Refactor AiModel DTO, add AiModelCandidate mapping, providers-meta rules
**Type:** refactor

**Summary:** Updated AiModel to a clean camelCase DTO (added family, removed model/provider, renamed display_name/strength_score), introduced per-provider AiModelCandidate conversion in connect files, extracted provider rules to providers-meta.ts, and updated generateModelEvaluationPrompt to accept models + providerRules as separate parameters.

**Brainstorming:** Three concerns were addressed together because they form a single coherent data-flow change. AiModel had snake_case fields (display_name, strength_score) inconsistent with the rest of the codebase, a redundant model field (duplicate of id), a provider field that duplicates aiStore.provider, and was missing family (which the prompt already produced in its output schema but the type didn't capture). AiModelCandidate already existed in providers/types.ts — the connect files were still passing raw provider types (GroqModel[]/GeminiModel[]) to the prompt instead of using it. Moving the provider-specific rules to providers-meta.ts as string[] makes the prompt function reusable and testable without conditionals. Gemini's buildValidIds was simplified to stripped IDs only since candidates now have stripped IDs. Groq inactive model filtering was also added (m.active === true) which was the original impetus.

**Prompt:** Remove inactive models when filtering Groq models. Convert Groq and Gemini models to AiModelCandidate after filtering. Update AiModel to new DTO (id/displayName/family/strength/strengthScore/reason/limitReached). generateModelEvaluationPrompt must be called with models: AiModelCandidate[] and providerRules: string[]. Add providers-meta.ts with Groq and Gemini rules as string[].

**What changed:**
- `providers/types.ts` — AiModel updated: removed model/provider, renamed display_name→displayName/strength_score→strengthScore, added family; AiModelCandidate kept as-is
- `providers/providers-meta.ts` — new file; GROQ_PROVIDER_RULES and GEMINI_PROVIDER_RULES as string[]
- `prompts/model-evaluation-prompt.ts` — new signature (models: AiModelCandidate[], providerRules: string[]); removed provider param and getProviderSpecificInstructions; renders providerRules as bullet list; fixed stale import from model-evaluation-prompt2
- `providers/qroq/connect.ts` — isAllowed adds m.active===true check; toAiModelCandidate(GroqModel)→AiModelCandidate mapper added; tryWithModel maps candidates before passing to prompt with GROQ_PROVIDER_RULES; removed TODO comments
- `providers/gemini/connect.ts` — stripPrefix helper extracted; buildValidIds uses stripped IDs only; toAiModelCandidate(GeminiModel)→AiModelCandidate mapper added; tryWithModel maps candidates before passing to prompt with GEMINI_PROVIDER_RULES; removed TODO comments
- `providers/utils/shared.ts` — toValidModels: removed || validIds.has(m.model) branch (model field gone)
- `providers/connect-provider.ts` — strength_score → strengthScore in byStrengthDesc and rankModels filter
- `stores/aiStore.ts` — selectBestModel: strength_score → strengthScore; markModelLimitReached: m.model → m.id
- `stores/aiAnalysisStore.ts` — selectedModel.model → selectedModel.id in getCurrentCacheKey, handleRequestError, executeAnalysis
- `mocks/executive-summary-mocks.ts` — MOCK_GEMINI_FLASH and MOCK_GROQ_LLAMA updated to new DTO (added family, removed model/provider, renamed fields)
- `mocks/budget-optimizer-mocks.ts` — same mock updates
- `ExecutiveSummaryAnalysis.vue` — model?.display_name → model?.displayName
- `BudgetOptimizationAnalysis.vue` — model?.display_name → model?.displayName
- `CLAUDE.md` — architecture updated: providers/types.ts, providers-meta.ts, connect files, model-evaluation-prompt, shared.ts, connect-provider.ts descriptions

**Key decisions & why:**
- provider removed from AiModel — aiStore already knows the provider at the connection level; per-model duplication was noise
- model field removed — id now serves both roles (prompt input identifier and API call identifier); Gemini connect strips the models/ prefix in toAiModelCandidate so id is already the API-call form
- Gemini buildValidIds simplified to stripped forms only — since candidates now carry stripped IDs, the AI always returns stripped IDs; the previous both-forms logic was a workaround for ambiguous input
- providerRules as string[] rather than derived from provider enum — keeps the prompt function free of provider knowledge and makes rules independently testable
- prompt2 files left untouched — user explicitly excluded them


## [#253] Split provider metadata and error messages to correct feature boundaries
**Type:** refactor

**Summary:** Moved `PROVIDER_LABELS`, `PROVIDER_HELP`, and `PROVIDER_OPTIONS` from `ai-connection/utils` into `providers/providers-meta.ts`; extracted the inline `ERROR_MESSAGES` from `aiAnalysisStore` into a dedicated `ai-tools/utils/analysis-error-messages.ts`; `ai-connection/utils` now only contains connection-form error display constants.

**Brainstorming:** `ai-connection/utils/index.ts` was acting as a grab-bag for both provider-level metadata (labels, help text, options) and connection-form display strings. Provider metadata belongs in the provider layer alongside the existing rule arrays in `providers-meta.ts`. Error messages split along feature lines: the connection form needs provider-aware functions `(provider) => string`; the analysis store needs plain strings. The analysis store was also defining its error map inline — extracting it to `ai-tools/utils/` makes it a proper module-level concern and removes hidden coupling between store logic and display strings.

**Prompt:** `PROVIDER_LABELS`, `PROVIDER_HELP`, `PROVIDER_OPTIONS` should also be part of `providers-meta`. `ERROR_MESSAGES` and `ERROR_HINTS` are both in `ai-connection/utils` and used in different features — split them properly.

**What changed:**
- `providers/providers-meta.ts` — added `PROVIDER_LABELS`, `PROVIDER_HELP`, `PROVIDER_OPTIONS`; imports `AiProviderType` from types
- `ai-connection/utils/index.ts` — removed the three provider metadata constants; now imports `PROVIDER_LABELS` from `providers-meta` for use in error message functions; retains `ERROR_MESSAGES` (provider-aware functions) and `ERROR_HINTS` (plain strings) as connection-form-specific display constants
- `ai-tools/utils/analysis-error-messages.ts` — new file; `ANALYSIS_ERROR_MESSAGES: Record<AiErrorCode, string>` (all 10 codes, plain strings) extracted from `aiAnalysisStore`
- `stores/aiAnalysisStore.ts` — removed inline `ERROR_MESSAGES` constant and its comment block; imports `ANALYSIS_ERROR_MESSAGES` from `ai-tools/utils/analysis-error-messages`; usage updated at `handleRequestError`
- `ai-connection/components/AiConnectionForm.vue` — imports `PROVIDER_OPTIONS, PROVIDER_HELP` from `providers/providers-meta`; imports `ERROR_MESSAGES, ERROR_HINTS` from `../utils`
- `ai-connection/components/AiConnectedStatus.vue` — imports `PROVIDER_LABELS` from `providers/providers-meta`
- `CLAUDE.md` — updated `providers-meta.ts`, `ai-connection/utils/index.ts`, `AiConnectionForm.vue` descriptions; added `analysis-error-messages.ts` entry

**Key decisions & why:**
- Provider metadata in `providers-meta.ts` — it was already home to provider rule arrays; labels, help text, and form options are all provider-level knowledge that the connection UI consumes, not produces
- Two separate error message constants (`ERROR_MESSAGES` vs `ANALYSIS_ERROR_MESSAGES`) kept intentionally separate — connection form messages are provider-aware functions; analysis panel messages are plain strings; merging them would require artificial branching or overloading
- `ai-connection/utils` retained (not deleted) — it still owns the connection-form error display constants, which are specific to the connection UI and not reusable elsewhere


## [#254] Move analysis-error-messages to ai-analysis/utils/
**Type:** fix

**Summary:** Relocated `analysis-error-messages.ts` from `ai-tools/utils/` into the correct `ai-analysis/utils/` subfolder so analysis-specific constants live within their own feature boundary.

**Brainstorming:** `analysis-error-messages.ts` was placed in the shared `ai-tools/utils/` folder in #253, but it is exclusively used by the analysis feature. The `ai-analysis/` feature folder is the right home; a new `utils/` subfolder was created for it.

**Prompt:** ANALYSIS_ERROR_MESSAGES should be in the ai-analysis feature — why is it not?

**What changed:**
- `ai-tools/utils/analysis-error-messages.ts` — moved to `ai-tools/ai-analysis/utils/analysis-error-messages.ts`
- `stores/aiAnalysisStore.ts` — import path updated accordingly
- `CLAUDE.md` — removed entry from `ai-tools/utils/`; added `ai-analysis/utils/` section with the file entry

**Key decisions & why:**
- New `ai-analysis/utils/` subfolder created — `ai-analysis/` had only `components/`; utils is the natural parallel for non-component module-level code scoped to this feature


## [#255] Add PerformanceMetrics to Channel type
**Type:** update

**Summary:** Extended `Channel` to include `PerformanceMetrics` (roi/ctr/cvr/cac) computed from the channel's aggregated campaign totals, reusing `computePerformanceMetrics` from `campaign-performance.ts`.

**Brainstorming:** `Channel` already aggregates raw `CampaignMetrics` totals across its campaigns. Adding `PerformanceMetrics` is a natural extension — the channel-level ROI, CTR, CVR, and CAC are derived from those same aggregated totals using the same formula already applied at the campaign level. The `computePerformanceMetrics` function takes any `CampaignMetrics` object, so it works on channel aggregates without modification. Both the create and update paths in `groupCampaignsByChannel` need to spread the result.

**Prompt:** Add PerformanceMetrics in Channel and calculate them correctly based on the campaigns of the channel. Re-use functionality from the campaign performance.

**What changed:**
- `common/types/channel.ts` — `Channel` now extends both `CampaignMetrics` and `PerformanceMetrics`; imports `PerformanceMetrics` from `./campaign`
- `common/utils/campaign-channel.ts` — imports `computePerformanceMetrics`; both the new-channel and update-channel branches in `groupCampaignsByChannel` now spread `computePerformanceMetrics(metrics)` on top of the aggregated raw metrics

**Key decisions & why:**
- Performance metrics re-computed on every campaign addition (update branch) — channel aggregates change with each new campaign, so metrics must be derived from the final aggregated totals, not accumulated incrementally
- `computePerformanceMetrics` called on the extracted `metrics` object (not on the full channel) — avoids passing extra fields and matches the function's `CampaignMetrics` parameter contract exactly


## [#256] Move computePerformanceMetrics call to buildChannelMap sort phase
**Type:** fix

**Summary:** Moved `computePerformanceMetrics` from the per-campaign accumulation loop in `groupCampaignsByChannel` to the final sort phase in `buildChannelMap`, so it is called once per channel rather than on every campaign addition.

**Brainstorming:** Previously, every time a campaign was added to an existing channel entry, `computePerformanceMetrics` was called on the intermediate aggregate — meaning a channel with N campaigns triggered N-1 redundant computations. The accumulator only needs raw metric totals; performance metrics are derived values that belong at the end. Introduced a local `ChannelAccumulator` type (`Omit<Channel, keyof PerformanceMetrics>`) so `groupCampaignsByChannel` is correctly typed without performance fields, and `buildChannelMap` stamps them once after sorting.

**Prompt:** computePerformanceMetrics better to call once when we build the sorted map.

**What changed:**
- `common/utils/campaign-channel.ts` — added `ChannelAccumulator` local type; `groupCampaignsByChannel` now returns `Map<string, ChannelAccumulator>` and accumulates raw metrics only; `buildChannelMap` spreads `computePerformanceMetrics(sorted)` once per channel in the reduce step

**Key decisions & why:**
- `ChannelAccumulator = Omit<Channel, keyof PerformanceMetrics>` — ties the type to `PerformanceMetrics` structurally; if new performance fields are added later, the omit stays correct without manual updates


## [#257] Move aggregateCampaignMetrics to buildChannelMap sort phase
**Type:** fix

**Summary:** Removed `aggregateCampaignMetrics` from the per-campaign accumulation loop; `ChannelAccumulator` is now minimal (`{ id, name, campaigns }`), with both metric aggregation and performance computation deferred to the single `buildChannelMap` reduce step.

**Brainstorming:** Same reasoning as #256 — `aggregateCampaignMetrics` was being called on every campaign addition to an existing channel, re-iterating all accumulated campaigns each time (O(N²) total). The accumulator only needs to collect campaigns; all derived values belong at the end. With this change `groupCampaignsByChannel` is purely a grouping function and `buildChannelMap` owns all derivation in one pass.

**Prompt:** Can we do the same for aggregateCampaignMetrics?

**What changed:**
- `common/utils/campaign-channel.ts` — `ChannelAccumulator` simplified to `{ id, name, campaigns }`; `groupCampaignsByChannel` loop only appends campaigns; `buildChannelMap` reduce calls `aggregateCampaignMetrics` then `computePerformanceMetrics` once per channel; `PerformanceMetrics` import removed (no longer needed for Omit)

**Key decisions & why:**
- Accumulator reduced to the minimum needed for grouping — raw metrics and performance metrics are all derived; keeping them out of the loop makes the separation of concerns explicit


## [#258] Replace 12 individual refs with two reactive display objects in aiAnalysisStore
**Type:** refactor

**Summary:** Removed the 12 per-tab named refs (`optimizerStatus`, `optimizerResponse`, etc.) and the `syncRefsFromTab`/`syncCacheTimestamp` sync functions; replaced them with two typed `reactive()` display objects (`optimizer` and `summary`) that are mutated directly wherever state changes.

**Brainstorming:** The 12 individual refs existed only because `createTabState()` returned a plain object that Vue cannot observe — requiring a manual copy step (`syncRefsFromTab`) after every mutation. The fix is to separate display state (needs reactivity, consumed by components) from internal state (controllers, timers, caches — no reactivity needed). Two `reactive()` objects per tab provide the reactive surface without the sync overhead. `firstAnalyzeCompleted` stays internal (nothing outside the store reads it). `syncRefsFromTab` and `syncCacheTimestamp` are removed entirely; mutations happen in place at every call site.

**Prompt:** Do we really need the 12 individual reactive wrappers and their sync functions in aiAnalysis store?

**What changed:**
- `stores/aiAnalysisStore.ts` — removed 12 individual refs; removed `syncRefsFromTab` and `syncCacheTimestamp`; added `optimizer` and `summary` reactive objects (typed per response type); `createTabState()` trimmed to internal-only fields; all mutation sites updated to use `d = getDisplay(tab)` directly; `optimizerCanAnalyze`/`summaryCanAnalyze` read from reactive objects; return statement exposes `optimizer` and `summary` instead of 12 named refs; `reactive` imported
- `BudgetOptimizationAnalysis.vue` — computed refs updated from `analysisStore.optimizerX` to `analysisStore.optimizer.x`
- `ExecutiveSummaryAnalysis.vue` — computed refs updated from `analysisStore.summaryX` to `analysisStore.summary.x`
- `CLAUDE.md` — aiAnalysisStore description updated

**Key decisions & why:**
- Two separate reactive objects rather than one generic — preserves per-tab response typing (`BudgetOptimizerResponse | null` vs `ExecutiveSummaryResponse | null`) without casts in components
- Internal state kept as plain objects — AbortController, Map, setTimeout timers should not be reactive; separating them is also clearer about intent
- `firstAnalyzeCompleted` moved to internal state only — nothing outside the store used the exposed refs; `analysisActivated` (shared ref) serves the same role for the UI


## [#259] Fix unsafe response casts in aiAnalysisStore
**Type:** fix

**Summary:** Replaced all 10 `as typeof d.response` / `as typeof otherD.response` / `as typeof prevD.response` casts with `as unknown as typeof d.response` to silence the legitimate IDE warning about non-overlapping types.

**Brainstorming:** TypeScript's `as T` assertion requires the source type to overlap with T. `TabResponse` (non-null) doesn't sufficiently overlap with `X | null` at the union member level, so the cast was flagged. The two-step `as unknown as T` pattern is the standard escape hatch for intentional narrowing casts where the developer knows the runtime value is correct.

**Prompt:** Line 354 is problematic.

**What changed:**
- `stores/aiAnalysisStore.ts` — all 10 response assignment casts changed from `as typeof d.response` to `as unknown as typeof d.response`

**Key decisions & why:**
- `as unknown as T` rather than a different typing approach — the union return type of `getDisplay` is correct; the unsafe cast is a deliberate trade-off to avoid duplicating response-assignment logic per tab


## [#260] Consolidate per-tab cache maps into a single CacheEntry map
**Type:** refactor

**Summary:** Replaced the three co-keyed maps (`cache`, `cacheTimestamps`, `cooldowns`) in `createTabState()` with a single `Map<string, CacheEntry>` where each entry carries `response`, `timestamp`, and `cooldownUntil` together.

**Brainstorming:** All three maps shared the same key (`provider::model::sorted-labels`) and were always written atomically on a successful analysis call. Keeping them as parallel maps created partial-state risk (a key present in one but not another) and required three lookups at every read site. A single `CacheEntry` type eliminates the redundancy. The `dataCache` map uses a different key format (labels only, no provider/model prefix) so it stays separate — merging it would force re-building data per model, which is wasteful. The cooldown semantics also improved: instead of storing a start timestamp and subtracting on read, `cooldownUntil` stores the expiry time directly (`now + COOLDOWN_MS`), making the `canAnalyze` check a simple `Date.now() >= entry.cooldownUntil`.

**Prompt:** Instead of having 4 maps (cache, cacheTimestamps, dataCache, cooldowns), does it make sense to have one map with a CacheEntry type extending TabResponse with cooldown, timestamp, and data?

**What changed:**
- `stores/aiAnalysisStore.ts` — added `CacheEntry` type (`response`, `timestamp`, `cooldownUntil`); removed `cacheTimestamps` and `cooldowns` from `createTabState()`; `cache` map retyped to `Map<string, CacheEntry>`; all read sites updated to use `entry.response` / `entry.timestamp` / `entry.cooldownUntil`; success path collapsed to single `t.cache.set(cacheKey, { response: result, timestamp: now, cooldownUntil: now + COOLDOWN_MS })`; `clearStateForNewCSV` no longer needs separate `cacheTimestamps.clear()` / `cooldowns.clear()` calls; `canAnalyze` simplified to `Date.now() >= entry.cooldownUntil`

**Key decisions & why:**
- `dataCache` kept separate — uses a label-only key (no provider/model); merging would cause unnecessary data rebuilds per model switch
- `cooldownUntil` instead of `cooldownStart` — storing expiry rather than start time makes the check a direct comparison with no arithmetic


## [#261] Remove model from response cache key
**Type:** refactor

**Summary:** Changed the response cache key from `provider::model::labels` to `provider::labels` because model selection is system-controlled (auto-fallback), not user-controlled, making per-model cache isolation unnecessary.

**Brainstorming:** The model is in the key because different models could produce different responses. However, users never pick a model — the system selects the highest-scored available model and silently falls back on token-limit. Keeping the model in the key meant a cache miss on every system-initiated model switch, forcing a redundant API call even when a valid cached response already existed. Removing it means model switches reuse cached responses across the same provider+labels combination. The token-limit fallback path (`executeAnalysis(tab, false)`) bypasses the cache check entirely (`isAutomatic=false`), so it still fetches a fresh response from the next model when needed. The provider stays in the key because Gemini and Groq produce structurally different responses. `response.model` stamp on each entry preserves traceability — the UI still shows which model generated the response.

**Prompt:** Cache uses provider::model::labels — since model switching is done by the system, should we remove model from the key?

**What changed:**
- `stores/aiAnalysisStore.ts` — `createCacheKey` signature reduced from `(labels, provider, model)` to `(labels, provider)`; key format changes from `provider::model::labels` to `provider::labels`; `getCurrentCacheKey` no longer passes `aiStore.selectedModel.id`
- `CLAUDE.md` — Status and aiAnalysisStore description updated to reflect new key format and `CacheEntry` type

**Key decisions & why:**
- Model removed, provider kept — provider determines response structure; model within a provider is an implementation detail the user never controls
- Token-limit fallback unaffected — it calls `executeAnalysis(tab, false)` which skips the cache check, so a fresh response is always fetched on the first call after model switch


## [#262] Move cacheTimestamp into response — stamp timestamp on TabResponse
**Type:** refactor

**Summary:** Removed the standalone `cacheTimestamp` field from reactive display state; `timestamp` is now stamped directly onto the response object alongside `model`, so it travels with the response automatically.

**Brainstorming:** The reactive display objects (`optimizer`, `summary`) each held a `cacheTimestamp: number | null` field that was written at every cache-restore site (~9 write sites total). Since `model` is already stamped onto the response as an infrastructure concern, there is an established pattern for attaching metadata to the response. Adding `timestamp` to `BudgetOptimizerResponse` and `ExecutiveSummaryResponse` follows the same approach: stamp once at write time, read anywhere via `response?.timestamp`. This removes the `cacheTimestamp` field from reactive state entirely, collapses all `d.cacheTimestamp = entry.timestamp` assignments, and means that wherever `d.response` is set from a cache entry the timestamp comes for free — no separate assignment needed. Components read `response?.timestamp ?? null` instead of a dedicated computed.

**Prompt:** d.cacheTimestamp — can't we use timestamp in the TabResponse without breaking anything?

**What changed:**
- `features/ai-tools/types/index.ts` — added `timestamp?: number` to `BudgetOptimizerResponse` and `ExecutiveSummaryResponse`
- `stores/aiAnalysisStore.ts` — removed `cacheTimestamp` from both `optimizer` and `summary` reactive objects; stamped `result.timestamp = now` in `executeAnalysis` success path alongside `result.model`; removed all `d.cacheTimestamp = ...` write sites (~9 total) across `handleRequestError`, `executeAnalysis`, `evaluateTab`, `clearStateForNewCSV`, and the label-change watcher
- `features/ai-tools/ai-analysis/components/executive-summary/ExecutiveSummaryAnalysis.vue` — `cacheTimestamp` computed changed to `analysisStore.summary.response?.timestamp ?? null`
- `features/ai-tools/ai-analysis/components/budget-optimization/BudgetOptimizationAnalysis.vue` — `cacheTimestamp` computed changed to `analysisStore.optimizer.response?.timestamp ?? null`
- `CLAUDE.md` — Status and aiAnalysisStore description updated to reflect that `timestamp` is on the response, not in reactive state

**Key decisions & why:**
- Pattern follows `model` stamp — `model` was already an infrastructure field on the response; `timestamp` is consistent with that precedent
- No cache-restore sites need changing — `d.response = entry.response` implicitly carries `response.timestamp` already set at write time; all restore paths just work



## [#263] Executive Summary — full refactor to camelCase schema, derivedSignals-first prompt, and new builder
**Type:** refactor

**Summary:** Replaced the snake_case `ExecutiveSummaryData`/`ExecutiveSummaryResponse` pipeline (with `icon`, `key_metrics`, `channel_summary`) with a new camelCase `ExecutiveSummaryInput`/`ExecutiveSummaryResponse` pipeline driven by `derivedSignals`, switching to `executive-summary-prompt2` and rewriting all mocks to match.

**Brainstorming:** The existing executive summary pipeline had grown unwieldy: snake_case keys across prompts, types, and UI components; a `key_metrics` grid and `channel_summary` table that added noise without improving the actionability of the output; `icon` fields on insights that required the AI to emit an emoji (unreliable); and a builder (`buildExecutiveSummaryData`) that computed deltas and classifications at the data layer rather than letting the prompt guide AI reasoning. The new direction: (1) camelCase everywhere for consistency with the rest of the TypeScript codebase; (2) `derivedSignals` — pre-computed signals (topCampaigns, bottomCampaigns, positiveChannels, negativeChannels, budgetConcentration, roiOutlierSpread) that give the AI structured facts without exhaustive raw data; (3) `executive-summary-prompt2` which uses these signals as the primary reasoning input and emits a strict, noise-free schema (healthScore, bottomLine, insights, priorityActions, correlations — no icon, no key_metrics, no channel_summary); (4) `buildExecutiveSummaryInput` accepts `Channel[]` directly from `campaignStore.selectedChannels` instead of re-aggregating from campaigns. Badge variant maps were also updated to match the new enum string forms (`NeedsAttention`, `ThisQuarter`, `NextQuarter`).

**Prompt:** Refactor the executive summary pipeline end-to-end. Replace the existing `buildExecutiveSummaryData` builder and `ExecutiveSummaryData`/`ExecutiveSummaryResponse` types (snake_case, with `icon`, `key_metrics`, `channel_summary`) with a new camelCase `ExecutiveSummaryInput`-based flow. Update `buildExecutiveSummaryData.ts` in-place — do not create a new file alongside it — renaming the export to `buildExecutiveSummaryInput` and refining the logic to accept `Channel[]` directly from `campaignStore.selectedChannels`. Integrate `getExecutiveSummaryDerivedInputs` from `common/analysis/executive-summary-analysis` to compute `topCampaigns`, `bottomCampaigns`, and `derivedSignals`. Update `ExecutiveSummaryResponse` in `ai-tools/types` to the new camelCase shape (healthScore, bottomLine, insights with metricHighlight, priorityActions, correlations — no icon, no key_metrics, no channel_summary). Wire the store to call `executive-summary-prompt2`. Update all UI components and rewrite all 5 executive summary mocks to match the new shape.

**What changed:**
- `common/analysis/executive-summary-analysis.ts` — refined: `getBottomCampaigns` now takes `excludedNames?: Set<string>` and filters `budgetShare >= MIN_BUDGET_SHARE (0.01)`; `getExecutiveSummaryDerivedInputs` computes `topCampaigns` first, derives `topCampaignNames` Set, passes it to `getBottomCampaigns` to prevent overlap
- `features/ai-tools/utils/buildExecutiveSummaryData.ts` — completely rewritten; renamed export to `buildExecutiveSummaryInput(campaigns, channels)`; adds `computeChannelStatus` (Strong/Moderate/Weak via ±10% band around portfolioRoi), `toCampaignSummary`, `toChannelSummary`; portfolioRoi in percentage form; passes `Channel[]` directly
- `features/ai-tools/types/index.ts` — replaced `PerformanceDeltas`, `ExecutiveSummaryChannel/Campaign/OtherChannelsSummary/Data` with new camelCase `ExecutiveSummaryResponse` (healthScore, bottomLine, insights, priorityActions, correlations — no icon, no key_metrics, no channel_summary)
- `features/ai-tools/ai-analysis/types/index.ts` — added `export * from './executive-summary.types'` barrel entry
- `features/ai-tools/prompts/index.ts` — swapped `executive-summary-prompt` for `executive-summary-prompt2`
- `stores/aiAnalysisStore.ts` — updated imports (`ExecutiveSummaryData` → `ExecutiveSummaryInput`, `buildExecutiveSummaryData` → `buildExecutiveSummaryInput`); `dataCache` type updated; `getOrBuildData` passes `campaignStore.selectedChannels`; `buildPrompt` derives `isFiltered: boolean` and passes to new prompt signature
- `features/ai-tools/utils/analysis-badge-variants.ts` — `HEALTH_SCORE_MAP` key updated to `'needsattention'`; `URGENCY_MAP` keys updated to `'thisquarter'` / `'nextquarter'`
- `features/ai-tools/ai-analysis/components/executive-summary/ExecutiveSummaryHealth.vue` — removed `period` prop; updated to `healthScore` / `bottomLine` (camelCase)
- `features/ai-tools/ai-analysis/components/executive-summary/ExecutiveSummaryInsights.vue` — removed icon span and related styles; updated to `metricHighlight` (camelCase)
- `features/ai-tools/ai-analysis/components/executive-summary/ExecutiveSummaryPriorityActions.vue` — updated to `priorityActions` / `expectedOutcome` / `successMetric` (camelCase)
- `features/ai-tools/ai-analysis/components/executive-summary/ExecutiveSummaryAnalysis.vue` — removed `ExecutiveSummaryChannels` and `ExecutiveSummaryMetrics` imports/usage; updated all prop names to camelCase
- `features/ai-tools/ai-analysis/components/executive-summary/ExecutiveSummaryChannels.vue` — DELETED
- `features/ai-tools/ai-analysis/components/executive-summary/ExecutiveSummaryMetrics.vue` — DELETED
- `features/ai-tools/mocks/executive-summary-mocks.ts` — all 5 mock objects rewritten to match new camelCase `ExecutiveSummaryResponse` shape (no period, no icon, no key_metrics, no channel_summary); `AiModel` import updated to `providers/types`
- `CLAUDE.md` — Status, Architecture (added `common/analysis/`, updated all executive summary component and type descriptions, removed deleted files), checklist updated

**Key decisions & why:**
- `buildExecutiveSummaryInput` not a new file — user clarified to update the existing builder in-place rather than add a parallel file; this keeps the import path stable and avoids dead code
- `excludedNames` Set passed to `getBottomCampaigns` — prevents a campaign appearing in both top and bottom lists; computed once from `topCampaigns` results before calling bottom
- `MIN_BUDGET_SHARE = 0.01` threshold — micro-campaigns (< 1% of portfolio budget) are excluded from the bottom list to avoid noise in the AI prompt
- Badge variant keys lowercased — `healthScoreVariant` / `urgencyVariant` / `insightTypeVariant` all call `.toLowerCase()` on the input; keys in maps updated to match the new enum string casing
- `isFiltered` as boolean to prompt — `executive-summary-prompt2` signature uses `filteredChannels: boolean`; store derives this from `selectedChannelsIds.length > 0` at call time


## [#257] Store PerformanceMetrics as decimal ratios, format percentages at display time
**Type:** fix

**Summary:** Changed `roi`, `ctr`, and `cvr` in `PerformanceMetrics` from percentage values (e.g. 168 = 168%) to decimal ratios (e.g. 1.68 = 168%), rounded to 4 decimal places, and moved the ×100 multiplication into `formatPercentage`.

**Brainstorming:** The previous implementation computed `roi/ctr/cvr` by multiplying the raw ratio by 100 and rounding to 2 decimal places, so the stored value was already a percentage. This conflated two concerns — calculation and display formatting — making it impossible to use these values in arithmetic or AI prompts without knowing the implicit unit. The fix stores clean decimal ratios (4 d.p. for precision) and lets each display site apply the ×100 via `formatPercentage`. The `percentageClass` threshold for "warning" moved from 50 to 0.5 to match the new unit. `cac` is unaffected (it's a currency amount, not a ratio). The ROI bar chart multiplies by 100 in the data mapping to preserve correct axis labels. `portfolioRoi` in `buildExecutiveSummaryData` was already typed as a decimal in `ExecutiveSummaryInput` but was being calculated as a percentage — this is now consistent.

**Prompt:** `computePerformanceMetrics` should keep decimals with 4 decimal digits. The calculation to percentage must happen when formatting values for display. Update the function, add comments to the models, and update formatters.

**What changed:**
- `common/utils/math.ts` — added `round4` (4 decimal places)
- `common/utils/campaign-performance.ts` — `computePerformanceMetrics` removes `* 100` from roi/ctr/cvr, uses `round4` for those three; `percentageClass` warning threshold changed from `<= 50` to `<= 0.5`
- `common/utils/formatters.ts` — `formatPercentage` now multiplies by 100 before `toFixed(2)`; added unit comment
- `common/types/campaign.ts` — `PerformanceMetrics` fields annotated with JSDoc describing units (decimal ratio vs EUR)
- `features/dashboard/components/DashboardCharts.vue` — ROI bar chart data mapping changed from `c.roi ?? 0` to `(c.roi ?? 0) * 100` so axis labels remain in percentage scale
- `features/ai-tools/utils/buildExecutiveSummaryData.ts` — `portfolioRoi` calculation removes `* 100`, uses `round4`; imports `round4`

**Key decisions & why:**
- `round4` not `round2` for ratios — low-CTR channels (e.g. 0.3% CTR) need 4 d.p. to avoid `0.00` values after rounding
- `cac` stays `round2` — it's a currency amount (EUR), where 2 decimal places is the standard
- Chart data multiplied by 100 inline — the chart y-label is "ROI (%)" so raw decimal values would produce a misleading axis; the multiplication lives in the chart mapping, not in the formatter, because chart tooltips read the raw number


## [#258] Replace CampaignScope/CampaignKPIs with PortfolioScope/PortfolioKPIs
**Type:** refactor

**Summary:** Removed `CampaignScope` and `CampaignKPIs` from the type system, replacing them with `PortfolioScope` and `PortfolioKPIs` (explicit named fields), and extracted portfolio KPI computation into `computePortfolioKPIs`.

**Brainstorming:** `CampaignKPIs extends CampaignMetrics, PerformanceMetrics` used the same flat field names (`budget`, `roi`, etc.) as individual campaign objects, making it easy to accidentally mix up portfolio-level and campaign-level values. `PortfolioKPIs` uses explicit `total*` / `aggregated*` prefixes that make the semantic level clear at every call site. `CampaignScope` was renamed to `PortfolioScope` for the same reason — it describes portfolio selection state, not a single campaign. The new `computePortfolioKPIs` function encapsulates the `aggregateCampaignMetrics` + `computePerformanceMetrics` + field-mapping steps that the store was doing inline, making the store computed trivially simple and the logic reusable.

**Prompt:** Replace `CampaignScope` with `PortfolioScope` and `CampaignKPIs` with `PortfolioKPIs`. Create a function in `campaign-performance` that uses `aggregateCampaignMetrics` and `computePerformanceMetrics` to calculate values and returns `PortfolioKPIs`.

**What changed:**
- `common/types/campaign.ts` — removed `CampaignScope` and `CampaignKPIs`; `PortfolioScope` and `PortfolioKPIs` (already present) are now the sole types
- `common/utils/campaign-performance.ts` — added `computePortfolioKPIs(channels: Channel[]): PortfolioKPIs`; imports `PortfolioKPIs`
- `stores/campaignStore.ts` — imports `PortfolioKPIs`, `PortfolioScope`, `computePortfolioKPIs`; `campaignScope` renamed to `portfolioScope`; `kpis` computed simplified to `computePortfolioKPIs(selectedChannels.value)`; removed `aggregateCampaignMetrics` and `computePerformanceMetrics` imports
- `features/dashboard/components/DashboardKpis.vue` — prop type `CampaignKPIs` → `PortfolioKPIs`; all field accesses updated (`budget` → `totalBudget`, `revenue` → `totalRevenue`, `roi` → `aggregatedROI`, `ctr` → `aggregatedCTR`, `cvr` → `aggregatedCVR`, `cac` → `aggregatedCAC`, `conversions` → `totalConversions`)
- `features/dashboard/components/DashboardCharts.vue` — prop type `CampaignKPIs` → `PortfolioKPIs`; funnel values updated (`impressions/clicks/conversions` → `totalImpressions/totalClicks/totalConversions`)
- `features/ai-tools/ai-analysis/components/shared/AnalysisSummary.vue` — prop type `CampaignScope` → `PortfolioScope`
- `features/ai-tools/ai-analysis/components/executive-summary/ExecutiveSummaryHealth.vue` — prop type `CampaignScope` → `PortfolioScope`
- `features/ai-tools/ai-analysis/components/budget-optimization/BudgetOptimizationOverview.vue` — prop type `CampaignScope` → `PortfolioScope`
- `features/ai-tools/ai-analysis/components/budget-optimization/BudgetOptimizationAnalysis.vue` — `campaignStore.campaignScope` → `campaignStore.portfolioScope`
- `features/ai-tools/ai-analysis/components/executive-summary/ExecutiveSummaryAnalysis.vue` — `campaignStore.campaignScope` → `campaignStore.portfolioScope`
- `stores/aiAnalysisStore.ts` — `campaignStore.campaignScope.selectedChannels` → `campaignStore.portfolioScope.selectedChannels`

**Key decisions & why:**
- `computePortfolioKPIs` takes `Channel[]` not `Campaign[]` — channels are already aggregated; passing channels avoids re-flattening and mirrors how the store already builds its `selectedChannels` computed
- `PortfolioKPIs` field names use `total*`/`aggregated*` prefix — distinguishes portfolio-level values from same-named fields on `CampaignMetrics`/`PerformanceMetrics` at every use site


## [#259] Use PortfolioSummary for ExecutiveSummaryInput.portfolio; pass kpis + scope to buildExecutiveSummaryInput
**Type:** refactor

**Summary:** Changed `ExecutiveSummaryInput.portfolio` from an inline object type to `PortfolioSummary`, and updated `buildExecutiveSummaryInput` to accept `PortfolioKPIs` and `PortfolioScope` directly instead of recomputing portfolio totals from raw campaigns.

**Brainstorming:** `PortfolioSummary` already existed in `executive-summary-analysis.types.ts` (extends `PortfolioKPIs` + `campaignCount` + `channelCount`) but `ExecutiveSummaryInput.portfolio` was still an inline type with a subset of those fields. Meanwhile, `buildExecutiveSummaryInput` was recomputing `totalBudget`, `totalRevenue`, `totalConversions`, `portfolioRoi`, and `aggregatedCAC` from `campaigns` arrays — the exact same values already available in `campaignStore.kpis` (a `PortfolioKPIs`). Passing `kpis` and `scope` removes the redundant computation, and typing `portfolio` as `PortfolioSummary` makes the structure explicit and reusable.

**Prompt:** `ExecutiveSummaryInput.portfolio` should be of type `PortfolioSummary`. Notice that kpis in campaign store can be used for `PortfolioSummary` without any further calculations. Pass kpis and portfolio scope in `buildExecutiveSummaryInput` to map required data and avoid recalculations.

**What changed:**
- `common/analysis/executive-summary-analysis.types.ts` — `ExecutiveSummaryInput.portfolio` changed from inline object type to `PortfolioSummary`
- `features/ai-tools/utils/buildExecutiveSummaryData.ts` — signature updated to `(campaigns, channels, kpis: PortfolioKPIs, scope: PortfolioScope)`; portfolio built as `{ ...kpis, campaignCount: scope.selectedCampaigns.length, channelCount: scope.selectedChannels.length }`; removed internal recalculation of totals and ratios; removed `round2`/`round4` imports (no longer needed); added `PortfolioSummary` to imports; cleaned up stale commented-out code
- `stores/aiAnalysisStore.ts` — `buildExecutiveSummaryInput` call now passes `campaignStore.kpis` and `campaignStore.portfolioScope` as third and fourth arguments

**Key decisions & why:**
- `scope.selectedCampaigns.length` and `scope.selectedChannels.length` used for counts — these mirror `campaigns.length` and `channels.length` exactly, but using scope makes the intent explicit (these are portfolio-scoped counts, not raw array lengths)
- `aggregatedROI` from `kpis` used directly for channel status comparison — it is already a decimal ratio matching the same unit as `ch.roi`, so `computeChannelStatus` works unchanged


## [#260] Extract ShareEfficiency interface and computeShareEfficiency function
**Type:** refactor

**Summary:** Created `ShareEfficiency` interface and `computeShareEfficiency` function to eliminate the repeated `budgetShare/revenueShare/efficiencyGap` fields across `ChannelSummary`, `CampaignSummary`, and signal types, and removed inline share computations from `buildExecutiveSummaryData.ts`.

**Brainstorming:** `ChannelSummary` and `CampaignSummary` both declared the same three fields (`budgetShare`, `revenueShare`, `efficiencyGap`) as inline properties, and `buildExecutiveSummaryData.ts` computed them inline in both `toCampaignSummary` and `toChannelSummary` using duplicated `safeDivide` calls. A named interface and a single function eliminate the duplication at both the type and computation level. The function belongs in `campaign-performance.ts` (it operates on `CampaignMetrics`, same as the other helpers there); the interface belongs in `campaign.ts` (shared data type, not analysis-specific). The signal types (`InefficientChannelSignal`, `ScalingCandidateSignal`) were not extended — `InefficientChannelSignal` has all three fields but is a signal DTO not a metrics summary; `ScalingCandidateSignal` has `revenueShare?` as optional so the shape doesn't match.

**Prompt:** Create and reuse `ShareEfficiency { budgetShare, revenueShare, efficiencyGap }` interface. Create a function to get `ShareEfficiency` either from a campaign or a channel in `campaign-performance`. From now on never use one letter to describe variables.

**What changed:**
- `common/types/campaign.ts` — added `ShareEfficiency` interface with JSDoc unit comments on all three fields
- `common/utils/campaign-performance.ts` — added `computeShareEfficiency(item: CampaignMetrics, totalBudget: number, totalRevenue: number): ShareEfficiency`; added `ShareEfficiency` to type import; added `safeDivide` to math import
- `common/analysis/executive-summary-analysis.types.ts` — `ChannelSummary` now extends `ShareEfficiency` (removed the three inline field declarations); `CampaignSummary` now extends `ShareEfficiency` (same); added `ShareEfficiency` to import; removed stale commented-out code
- `features/ai-tools/utils/buildExecutiveSummaryData.ts` — `toCampaignSummary` and `toChannelSummary` now spread `computeShareEfficiency(...)` instead of computing shares inline; removed `safeDivide` import (no longer needed); replaced single-letter parameter names (`c` → `campaign`, `ch` → `channel`) throughout; replaced `s` in reduce with meaningful names

**Key decisions & why:**
- `ShareEfficiency` in `campaign.ts` not in analysis types — `computeShareEfficiency` takes `CampaignMetrics` which lives in `campaign.ts`; putting the interface there avoids a reverse dependency (utils importing from analysis types)
- Function accepts `CampaignMetrics` not a union — both `CampaignPerformance` and `Channel` extend `CampaignMetrics`, so the function works for both without overloads or a union type
- Single-letter variable names banned going forward — `campaign`, `channel` etc. used in all map/reduce callbacks


## [#261] Fix toChannelSummary name-to-channel mapping
**Type:** fix

**Summary:** Fixed `toChannelSummary` to correctly map `Channel.name` to `ChannelSummary.channel` when using object destructuring.

**Brainstorming:** The destructure `{ campaigns, id, ...channelMetrics }` left `name` in the spread, which would produce `name: string` in the result object — but `ChannelSummary` expects `channel: string`, not `name`. The fix extracts `name` from the destructure and sets `channel: name` explicitly, keeping the rest of the metrics spread intact.

**Prompt:** Fix `toChannelSummary` but keep object destructuring.

**What changed:**
- `features/ai-tools/utils/buildExecutiveSummaryData.ts` — destructure updated to `{ campaigns, id, name, ...metrics }`; return object sets `channel: name` explicitly before spreading `metrics`

**Key decisions & why:**
- `name` extracted explicitly from the destructure — prevents it leaking into the spread as a wrong-named field while allowing the alias `channel: name` in the return literal


## [#262] Refactor executive-summary-analysis.ts — sorting, naming, complexity
**Type:** refactor

**Summary:** Replaced the opaque `n()` helper with `toFinite`, eliminated redundant field recomputation by reading `efficiencyGap` directly from typed inputs, and extracted multi-condition predicates into named functions to bring all cyclomatic complexity scores into the "cool" range.

**Brainstorming:** The file had several issues: `n()` was a single-letter function name that violated the naming convention; `getInefficientChannels` was recomputing `efficiencyGap` manually even though `ChannelSummary` already carries it via `ShareEfficiency`; `getBottomCampaigns` was recomputing `gapA/gapB` inline for the same reason; `n()` was wrapping fields that are typed as `number` (never null); and inline multi-condition filter predicates in `getInefficientChannels` and `getScalingCandidates` pushed cyclomatic complexity to 7–10. `sortWithNullsLast` from `sorting.ts` was considered but does not fit — it requires a direction parameter and puts nulls last, whereas the analysis sorts either filter out nulls first or treat null as 0 for ranking purposes, making `toFinite` the correct tool for the one remaining nullable field (roi in bottom-campaign secondary sort).

**Prompt:** Refactor executive-summary-analysis. Since we know the data types we can improve sorting functions in there, replace the use of the n function with something more meaningful if necessary. If you can use functions from utils for sorting do that.

**What changed:**
- `app/src/common/analysis/executive-summary-analysis.ts` — `n()` renamed to `toFinite` with an explanatory comment; `getTopCampaigns` filter and sort use direct field access (`campaign.budget`, `campaign.revenue`, `campaign.conversions`, `b.roi!`, `b.revenue`); `getBottomCampaigns` sort uses `b.efficiencyGap - a.efficiencyGap` directly; `getInefficientChannels` reordered to filter-then-map (more efficient), reads `channel.efficiencyGap` directly; `getScalingCandidates` broken into `hasCampaignScalingData`, `campaignOutperformsPortfolio`, `isChannelScalingCandidate`, `toCampaignScalingSignals`, `toChannelScalingSignals` — all predicates and pipelines extracted so the exported function is a single merge+sort; `getConcentrationFlag` sort uses `b.revenue - a.revenue` directly, `??` replaces `n()` for the optional chained access

**Key decisions & why:**
- `toFinite` retained (not inlined) — still needed for `roi` in `getBottomCampaigns` secondary sort and for coercing `channel.roi` in `getInefficientChannels` map; a named helper is clearer than repeated ternaries
- `sortWithNullsLast` not used — its API (`dir: 1 | -1`) is designed for UI table sorts; analysis sorts are multi-key domain sorts where null handling semantics differ per call site
- filter-before-map in `getInefficientChannels` — avoids constructing signal objects for channels that will be discarded; possible because `efficiencyGap` is already present on `ChannelSummary`
- Predicate extraction driven by complexity linter — each extracted function landed at complexity ≤ 5; `getScalingCandidates` itself dropped to complexity 3


## [#263] Implement dynamic thresholds for campaign filtering
**Type:** refactor

**Summary:** Replaced static MIN_REVENUE and MIN_CONVERSIONS constants with a getDynamicThresholds function that scales floor values relative to the actual portfolio size, so small portfolios are not over-filtered and large portfolios use proportionally meaningful cutoffs.

**Brainstorming:** Static floors (100 revenue, 3 conversions) work poorly at the extremes: a portfolio with 5 campaigns and €2000 total revenue would have almost every campaign exceed the €100 floor, giving no useful signal; a portfolio with 50 campaigns and €500k revenue would need a higher floor to avoid surfacing micro-campaigns. The user-provided formula — 2% of portfolio total, with absolute floor (€50 / 2 conversions) — scales naturally. The thresholds are needed in two places: getTopCampaigns (has the campaigns array directly) and hasCampaignScalingData (called per-campaign from toCampaignScalingSignals). The cleanest approach is to compute once per call site and pass as a DynamicThresholds parameter, avoiding global state and keeping each function pure.

**Prompt:** implement dynamic thresholds — getDynamicThresholds(campaigns) returning { minRevenue: Math.max(totalRevenue * 0.02, 50), minConversions: Math.max(totalConversions * 0.02, 2) }

**What changed:**
- `app/src/common/analysis/executive-summary-analysis.ts` — removed MIN_REVENUE and MIN_CONVERSIONS constants; added DynamicThresholds interface and getDynamicThresholds function; getTopCampaigns computes thresholds from its input and uses minRevenue/minConversions in the filter; hasCampaignScalingData accepts a DynamicThresholds parameter (destructured inline); toCampaignScalingSignals computes thresholds and passes to hasCampaignScalingData; remaining single-letter variable c fixed to campaign in getExecutiveSummaryDerivedInputs

**Key decisions & why:**
- Compute per call site, not once at the top — both getTopCampaigns and toCampaignScalingSignals receive the same campaigns array, so the result is identical; avoids threading thresholds through every function signature in the call chain
- DynamicThresholds interface defined locally — only used within this module; no need to export to types file
- hasCampaignScalingData receives thresholds as a parameter — it does not have access to the full campaigns array, so the caller (toCampaignScalingSignals) computes and passes them


## [#264] ExecutiveSummaryResponse extends ExecutiveSummaryOutput
**Type:** refactor

**Summary:** Replaced the inline duplicate field declarations on ExecutiveSummaryResponse with an intersection of ExecutiveSummaryOutput, eliminating redundant inline unions that already had named types.

**Brainstorming:** ExecutiveSummaryResponse in types/index.ts was repeating every field from ExecutiveSummaryOutput verbatim — including literal unions ("Excellent" | "Good" | ...) that already exist as HealthLabel, InsightType, ActionUrgency in analysis types. ExecutiveSummaryOutput is the canonical shape; the response type only adds model and timestamp. Correlation stays in types/index.ts because BudgetOptimizerResponse still uses it.

**Prompt:** ExecutiveSummaryResponse should extend ExecutiveSummaryOutput. Clean up the rest.

**What changed:**
- `app/src/features/ai-tools/types/index.ts` — added import of ExecutiveSummaryOutput; ExecutiveSummaryResponse replaced with ExecutiveSummaryOutput & { model?: AiModel; timestamp?: number }; all inline field duplicates removed

**Key decisions & why:**
- Intersection type rather than interface extends — ExecutiveSummaryResponse is a type alias (not interface), so & is the correct composition form
- Correlation retained — still used by BudgetOptimizerResponse; removing it would break the optimizer types


## [#265] Rename ExecutiveSummaryInput to SummaryAnalysis
**Type:** refactor

**Summary:** Renamed ExecutiveSummaryInput to SummaryAnalysis (and its builder to buildSummaryAnalysis) across all files that reference it — arrived at the final name after discarding "Insights" as too output-oriented.

**Brainstorming:** "Input" was a leaky implementation detail describing the type's role as a prompt argument rather than what it represents. "Insights" was considered but rejected — it implies AI output. "SummaryAnalysis" better reflects that this is computed analysis data (portfolio summary, derived signals, top/bottom campaigns) assembled from campaign/channel data and used as structured input to the AI prompt. Vue component references to ExecutiveSummaryInsights.vue were left untouched throughout — that is a separate UI component for rendering AI response insights, unrelated to this type.

**Prompt:** Rename ExecutiveSummaryInput to ExecutiveSummaryInsights. / Rename ExecutiveSummaryInsights to SummaryAnalysis.

**What changed:**
- `app/src/common/analysis/executive-summary-analysis.types.ts` — interface renamed to SummaryAnalysis
- `app/src/features/ai-tools/utils/buildExecutiveSummaryData.ts` — type import and function renamed to buildSummaryAnalysis
- `app/src/features/ai-tools/prompts/executive-summary-prompt2.ts` — type import and parameter type updated
- `app/src/stores/aiAnalysisStore.ts` — type import, function import, Map type param, return type, cast, and call site updated

**Key decisions & why:**
- "SummaryAnalysis" chosen over "Insights" — "Insights" reads as AI output; this type is prompt input (computed analysis)
- Builder renamed to buildSummaryAnalysis for consistency with the type name
- Vue component ExecutiveSummaryInsights.vue not renamed — unrelated to the analysis data type


## [#266] Move summary assembly into executive-summary-analysis and rename to computeSummaryAnalysis
**Type:** refactor

**Summary:** Moved the `buildSummaryAnalysis` function and its helpers out of the feature-layer `buildExecutiveSummaryData.ts` file into `common/analysis/executive-summary-analysis.ts`, renamed it `computeSummaryAnalysis`, and deleted the now-empty utility file.

**Brainstorming:** `buildExecutiveSummaryData.ts` was a thin wrapper that converted raw store data into `SummaryAnalysis`. Its helpers (`computeChannelStatus`, `toCampaignSummary`, `toChannelSummary`) and the assembly function belong logically in the same module as the derived-signal computation already in `executive-summary-analysis.ts`. Keeping them separate created an artificial split: `common/analysis/` had the analysis logic while a feature-layer utils file had the data shaping — both operating on the same types. Consolidating into `common/analysis/` makes the module self-contained and removes the cross-layer dependency. The rename from `build` to `compute` aligns with the `compute*` naming convention already used throughout `common/utils/`.

**Prompt:** Move all functions from `buildExecutiveSummaryData.ts` into `executive-summary-analysis.ts`, rename `buildSummaryAnalysis` to `computeSummaryAnalysis`, update the store import, and delete the file.

**What changed:**
- `app/src/common/analysis/executive-summary-analysis.ts` — added imports for `CampaignPerformance`, `PortfolioKPIs`, `PortfolioScope`, `Channel`, `computeShareEfficiency`, `PortfolioSummary`, `SummaryAnalysis`, `SummaryMetricStatus`; appended `computeChannelStatus`, `toCampaignSummary`, `toChannelSummary`, and `computeSummaryAnalysis` (exported)
- `app/src/stores/aiAnalysisStore.ts` — updated import from `buildSummaryAnalysis` at `buildExecutiveSummaryData` to `computeSummaryAnalysis` at `common/analysis/executive-summary-analysis`; updated call site
- `app/src/features/ai-tools/utils/buildExecutiveSummaryData.ts` — deleted
- `CLAUDE.md` — removed deleted file from architecture; updated `executive-summary-analysis.ts` description; updated status and campaign-performance.ts description

**Key decisions & why:**
- Moved into `common/analysis/` not `common/utils/` — this function is specific to the executive summary analysis domain, not a generic utility
- Rename to `compute` prefix — consistent with `computePerformanceMetrics`, `computeShareEfficiency`, `computePortfolioKPIs` already in `common/utils/`
- No intermediate barrel needed — `aiAnalysisStore` imports directly from `common/analysis/executive-summary-analysis`


## [#267] Update executive-summary-analysis imports and mappings for restructured signal types
**Type:** fix

**Summary:** Moved `ScalingCandidateSignal` import to `campaign.ts` (its new home) and added the required `efficiencyGap` field to both `toCampaignScalingSignals` and `toChannelScalingSignals` mappers after `ScalingCandidateSignal` was updated to extend `ShareEfficiency`.

**Brainstorming:** The types restructure moved `ScalingCandidateSignal` from `executive-summary-analysis.types.ts` to `campaign.ts` and changed it to extend `ShareEfficiency` — making `efficiencyGap` a required field. The analysis file's import was still pointing to the old location, and both mapping functions were missing `efficiencyGap` in their object literals. Two targeted fixes: correct the import source and add the missing field in both mappers.

**Prompt:** Read the updates in the types and update executive-summary-analysis.

**What changed:**
- `app/src/common/analysis/executive-summary-analysis.ts` — moved `ScalingCandidateSignal` from `./executive-summary-analysis.types` import to `../types/campaign` import; added `efficiencyGap: campaign.efficiencyGap` to `toCampaignScalingSignals` mapper; added `efficiencyGap: channel.efficiencyGap` to `toChannelScalingSignals` mapper

**Key decisions & why:**
- `efficiencyGap` is already present on both `CampaignSummary` (via `ShareEfficiency`) and `ChannelSummary` (via `ShareEfficiency`) — no computation needed, just a direct field read


## [#268] Extract businessContext from SummaryAnalysis into separate prompt parameter
**Type:** refactor

**Summary:** Removed `businessContext` from `SummaryAnalysis` and added it as an explicit optional parameter to `generateExecutiveSummaryPrompt`, matching the same pattern used by `generateBudgetOptimizationPrompt`.

**Brainstorming:** `SummaryAnalysis` is a computed data structure built from campaign and channel metrics — it describes portfolio state, not the user's business configuration. `businessContext` is caller-supplied metadata that informs prompt interpretation but is not derived from the data. Keeping it inside `SummaryAnalysis` mixed two different concerns. Making it a separate prompt parameter keeps the data type pure and aligns with how the budget optimizer already handles it.

**Prompt:** `generateExecutiveSummaryPrompt` businessContext should be an additional input — implement this.

**What changed:**
- `app/src/common/analysis/executive-summary-analysis.types.ts` — removed `businessContext?: BusinessContext` from `SummaryAnalysis`; removed now-unused `BusinessContext` import
- `app/src/features/ai-tools/prompts/executive-summary-prompt2.ts` — added `import type { BusinessContext }` from types; added `businessContext?: BusinessContext` as third parameter; updated `getBusinessContextBlock` call to use the standalone parameter instead of `input.businessContext`

**Key decisions & why:**
- Parameter is optional — no call sites currently pass business context, and the prompt handles `undefined` gracefully via `getBusinessContextBlock`
- Store call site unchanged — omitting the optional third arg is valid; it will be wired when the UI provides business context input


## [#269] Refactor Budget Optimizer to use computeBudgetOptimizerAnalysis and BudgetOptimizerOutput
**Type:** refactor

**Summary:** Replaced the old flat `BudgetOptimizerData` pipeline with a `computeBudgetOptimizerAnalysis` function in `common/analysis/`, mirroring the executive summary pattern exactly; updated the AI response shape to the new camelCase `BudgetOptimizerOutput` (summary + recommendations with fromCampaign/toCampaign/budgetShift/expectedImpact/confidence/executionRisk); removed four obsolete UI section components (TopPerformers, Underperformers, QuickWins, Risks).

**Brainstorming:** The executive summary already had a clean pattern: domain data computation in `common/analysis/`, a typed analysis struct with derivedSignals, a prompt function that takes that struct, and slim UI components. The budget optimizer was still using a flat `buildBudgetOptimizerData` util and a snake_case AI response shape from a different era. The goal was to make both tabs structurally identical: same layer boundaries, same data-building pattern, same camelCase response convention. The old response had top_performers, underperformers, quick_wins, correlations, and risks — all removed in favour of a minimal summary + recommendations schema that the AI can actually produce reliably.

**Prompt:** In common/analysis/budget-optimization-analysis build the BudgetOptimizerAnalysis data in a similar way as the executive-summary-analysis. Update types and UI and use BudgetOptimizerOutput and budget-optimization-prompt2. Make sure scope and businessContext is handled the same way in the prompt as in the executive-summary-prompt2.

**What was built / What changed:**
- `app/src/common/analysis/budget-optimization-analysis.types.ts` — fully rewritten: ConfidenceLevel/ExecutionRisk, InefficientCampaignSignal, BudgetScalingCandidate, TransferCandidate, BudgetOptimizerAnalysis
- `app/src/common/analysis/budget-optimization-analysis.ts` — written: getInefficientCampaigns, getBudgetScalingCandidates, getTransferCandidates, computeBudgetOptimizerAnalysis
- `app/src/features/ai-tools/prompts/budget-optimization-prompt2.ts` — rewritten: uses BudgetOptimizerAnalysis as input type, local getScopeBlock(isFiltered), getBusinessContextBlock(businessContext), camelCase OUTPUT_SCHEMA (summary + recommendations[])
- `app/src/features/ai-tools/prompts/index.ts` — updated: exports generateBudgetOptimizationPrompt from budget-optimization-prompt2
- `app/src/features/ai-tools/types/index.ts` — updated: BudgetOptimizerResponse = BudgetOptimizerOutput & {model?,timestamp?}; imports BudgetOptimizerOutput from executive-summary.types
- `app/src/stores/aiAnalysisStore.ts` — updated: uses computeBudgetOptimizerAnalysis; dataCache typed as BudgetOptimizerAnalysis|SummaryAnalysis; buildPrompt calls generateBudgetOptimizationPrompt(data, isFiltered)
- `app/src/features/ai-tools/utils/analysis-badge-variants.ts` — added executionRiskVariant (low→success, medium→warning, high→danger)
- `app/src/features/ai-tools/ai-analysis/components/budget-optimization/BudgetOptimizationAnalysis.vue` — simplified orchestrator: renders Overview + Recommendations only; uses response.summary (not executive_summary); no period prop
- `app/src/features/ai-tools/ai-analysis/components/budget-optimization/BudgetOptimizationRecommendations.vue` — redesigned: fromCampaign→toCampaign header with arrow, budgetShift, expectedImpact (revenueChange/conversionChange/roiEstimate), confidence + executionRisk badges; v-if on length
- `app/src/features/ai-tools/mocks/budget-optimizer-mocks.ts` — rewritten: 5 camelCase BudgetOptimizerResponse mocks (aggressive reallocation, conservative, seasonal pivot, channel consolidation, no strong opportunity)
- Deleted: BudgetOptimizationTopPerformers.vue, BudgetOptimizationUnderperformers.vue, BudgetOptimizationQuickWins.vue, BudgetOptimizationRisks.vue

**Key decisions & why:**
- `computeBudgetOptimizerAnalysis` takes `(campaigns, channels, kpis, scope)` — same signature as `computeSummaryAnalysis` so the store's `getOrBuildData` stays symmetric
- `ConfidenceLevel` and `ExecutionRisk` canonical home is `budget-optimization-analysis.types.ts` — `executive-summary.types.ts` already imports them from there
- Old `budget-optimization-prompt.ts` kept as dead-but-compilable code so its dependent legacy types in `types/index.ts` remain valid
- Mock 5 changed from "growth expansion" to "no strong opportunity" (empty recommendations) — exercises the v-if guard on the Recommendations component and matches the prompt's instruction to prefer an empty array over weak suggestions
- `executionRiskVariant` uses the same low/medium/high→success/warning/danger mapping as confidence to keep the badge language consistent


## [#270] Create portfolio-analysis module and campaignStore getter
**Type:** refactor

**Summary:** Introduced `common/portfolio-analysis/` as a self-contained analysis module that unifies both AI tab data computation into a single `PortfolioAnalysis` structure, exposed as a `portfolioAnalysis` computed getter on `campaignStore`.

**Brainstorming:** Both `computeSummaryAnalysis` and `computeBudgetOptimizerAnalysis` duplicate core mapping logic (`toCampaignSummary`, `toChannelSummary`, `computeChannelStatus`) and diverge only in their `derivedSignals`. The goal is a single authoritative computation that both AI prompt functions will eventually consume. The unified `derivedSignals` disambiguates the `scalingCandidates` name collision: `scalingOpportunities` (mixed campaign+channel, top 5 by ROI — for summary) vs `budgetScalingCandidates` (campaign-only with capacity data — for budget optimizer). The module imports only from `common/types/` — no dependency on the old `analysis/` files so it can become the sole source of truth when cleanup happens. Existing analysis files are left in place (no cleanup in this phase). The `filteredChannels` boolean is passed as a fifth parameter since only the store knows `selectedChannelsIds.length`.

**Prompt:** Create a portfolio-analysis folder in common/ with types.ts (self-contained, no imports from old analysis files), utils.ts (all signal computation and mapping helpers), and portfolio-analysis.ts (assembly function). Add portfolioAnalysis as a computed getter in campaignStore. No prompt changes, no cleanup of existing files.

**What was built:**
- `app/src/common/portfolio-analysis/types.ts` — `PortfolioAnalysis` interface; all signal types defined here (InefficientChannelSignal, InefficientCampaignSignal, BudgetScalingCandidate, TransferCandidate, ConcentrationLevel, ConcentrationFlagSignal, CorrelationSignal); imports only from `common/types/campaign`
- `app/src/common/portfolio-analysis/utils.ts` — all mapping and signal computation: toCampaignSummary, toChannelSummary, computeChannelStatus, toFinite, getDynamicThresholds, getTopCampaigns, getBottomCampaigns, getInefficientChannels, getInefficientCampaigns, getScalingOpportunities, getBudgetScalingCandidates, getTransferCandidates, getConcentrationFlag, getCorrelations
- `app/src/common/portfolio-analysis/portfolio-analysis.ts` — `computePortfolioAnalysis(campaigns, channels, kpis, scope, filteredChannels)` → `PortfolioAnalysis`; thin assembly only, delegates to utils
- `app/src/stores/campaignStore.ts` — added `portfolioAnalysis` computed getter calling `computePortfolioAnalysis` with filteredCampaigns, selectedChannels, kpis, portfolioScope, and `selectedChannelsIds.length > 0`

**Key decisions & why:**
- `types.ts` imports nothing from `common/analysis/` — makes the module independently deletable and avoids circular dependency risk when the old files are eventually removed
- `scalingOpportunities` vs `budgetScalingCandidates` naming — summary needs a mixed campaign+channel narrative list; budget optimizer needs campaign-only operational data with capacity fields; different names prevent confusion when both appear in the same `derivedSignals` object
- `filteredChannels` as a fifth parameter — the boolean is derived from `selectedChannelsIds.length` which is store state; the pure function has no access to it
- Old `analysis/` files left intact — prompt integration is a separate phase; no cleanup until both prompts are migrated


## [#271] Add campaign and channel classification with four mutually exclusive groups
**Type:** refactor

**Summary:** Replaced `topCampaigns`/`bottomCampaigns` in `PortfolioAnalysis` with a four-bucket classification system (`CampaignGroups`, `ChannelGroups`) extracted into dedicated files, adding Opportunity and Watch categories with documented marketing rationale.

**Brainstorming:** The existing top/bottom split was too coarse — it missed campaigns that are under-invested (Opportunity) or show contradictory signals worth monitoring (Watch). "High variance" from the requirement cannot be computed from a static snapshot (no time series), so Watch was redefined as campaigns/channels with specific contradictory signals detectable in a single data point: funnel leak (high CTR + low CVR vs dataset median) or positive-but-underperforming ROI. Mutual exclusivity is enforced via a priority cascade (Top→Opportunity→Bottom→Watch for campaigns; Strong→Opportunity→Weak→Watch for channels), so each item appears in exactly one bucket. Small dataset handling is per-item — no minimum size guards — so 1, 2, or 3 campaigns/channels are classified correctly with empty buckets where nothing qualifies. All numeric thresholds are centralised in a single CLASSIFY_THRESHOLDS constant in classify-utils.ts to serve as the natural seam for future user configurability. Comments in each predicate explain the marketing reasoning behind the condition, not just what the code does. The user requested splitting classify into one file per entity type, with a shared utils file only for genuinely shared helpers (getMedian, getDynamicThresholds, CLASSIFY_THRESHOLDS). channels: ChannelSummary[] is kept as-is on PortfolioAnalysis (for table enumeration) alongside the new channelGroups.

**Prompt:** Refine the top/bottom campaign and channel classification in portfolio-analysis. Add Opportunity (under-invested, efficient) and Watch (contradictory signals: funnel leak or positive underperforming ROI) categories. Enforce mutual exclusivity via priority cascade. Remove minimum dataset size guards — classify per-item, allow empty buckets. Extract into classify-campaigns.ts, classify-channels.ts, and classify-utils.ts. Add inline documentation explaining the marketing rationale. All thresholds in one CLASSIFY_THRESHOLDS constant for future configurability. Keep channels: ChannelSummary[] on PortfolioAnalysis; add channelGroups alongside it.

**What changed:**
- `app/src/common/portfolio-analysis/classify-utils.ts` (new) — `CLASSIFY_THRESHOLDS` (all decision boundaries with full marketing rationale comments); `getMedian(values)`; `getDynamicThresholds(campaigns)` (moved from utils.ts)
- `app/src/common/portfolio-analysis/classify-campaigns.ts` (new) — `classifyCampaigns(campaigns, portfolioRoi) → CampaignGroups`; priority cascade Top→Opportunity→Bottom→Watch; Watch detects funnel leak (CTR > medianCtr×1.2 AND CVR < medianCvr×0.8) or underperforming positive ROI (roi < portfolioRoi×0.9); each bucket sorted most-actionable-first
- `app/src/common/portfolio-analysis/classify-channels.ts` (new) — `classifyChannels(channels, portfolioRoi) → ChannelGroups`; priority cascade Strong→Opportunity→Weak→Watch; Watch at channel level interpreted as structural audience/format issue rather than individual campaign execution
- `app/src/common/portfolio-analysis/types.ts` — added `CampaignGroups` and `ChannelGroups` interfaces with JSDoc; `PortfolioAnalysis` replaces `topCampaigns`/`bottomCampaigns` with `campaignGroups: CampaignGroups` and adds `channelGroups: ChannelGroups`
- `app/src/common/portfolio-analysis/utils.ts` — removed `getDynamicThresholds`, `getTopCampaigns`, `getBottomCampaigns`; imports `getDynamicThresholds` from classify-utils; removed unused `MIN_BUDGET_SHARE_BOTTOM` constant
- `app/src/common/portfolio-analysis/portfolio-analysis.ts` — imports `classifyCampaigns` + `classifyChannels`; removes `getTopCampaigns`/`getBottomCampaigns` calls; updated empty-guard return and full return shape

**Key decisions & why:**
- Watch = specific contradictory signals, not catch-all — gives the category a defined, actionable meaning rather than being a residual bin; campaigns with no signal stay unclassified
- 1.2×/0.8× funnel leak thresholds — symmetric 20% deviation from median; meaningful above statistical noise in marketing data; AND requirement (both conditions together) further reduces false positives
- watchRoiFactor 0.9 (10% buffer) — campaigns near the portfolio average are normal performers; the buffer ensures only a consistent, meaningful lag fires the signal
- Single CLASSIFY_THRESHOLDS object — all boundaries in one place; the natural seam if thresholds become user-configurable in the future
- classify-utils.ts exports getDynamicThresholds — avoids duplication between classify-campaigns.ts (Top gate) and utils.ts (scaling signal filtering); utils.ts imports it from there
- Kept channels: ChannelSummary[] — flat list needed for table enumeration and raw channel access; channelGroups is additive, not a replacement


## [#272] Simplify classifiers to single-pass loop and extract shared getFunnelMedians
**Type:** refactor

**Summary:** Replaced the four-pass loop pattern in both classifier functions with a single `else if` cascade, and extracted the duplicated `getFunnelMedians` helper into `classify-utils.ts`.

**Brainstorming:** Both `classifyCampaigns` and `classifyChannels` used four separate `for` loops — one per priority level — plus a `Set` to track assigned items. The `else if` cascade achieves identical mutual exclusivity in a single pass: each item hits the first matching branch and falls through to nothing if no predicate matches. The `Set` becomes unnecessary. Additionally, both classifier files contained an identical `getFunnelMedians` function; with structural typing (`{ ctr: number | null; cvr: number | null }`) it can live in `classify-utils.ts` and serve both without coupling to either concrete type.

**Prompt:** classifyChannels is over complicated. Refactor it to loop through channels once only. Check if there are functions we can extract and re-use between classification files and utils in portfolio-analysis.

**What changed:**
- `app/src/common/portfolio-analysis/classify-utils.ts` — added `getFunnelMedians(items: Array<{ ctr, cvr }>) → { medianCtr, medianCvr }`; shared by both classifiers
- `app/src/common/portfolio-analysis/classify-campaigns.ts` — removed local `getFunnelMedians`; imports shared one from classify-utils; collapsed four loops + Set into single `else if` cascade
- `app/src/common/portfolio-analysis/classify-channels.ts` — same refactor: removed local `getFunnelMedians`, imports shared one, single-pass loop

**Key decisions & why:**
- `else if` over `Set` tracking — mutual exclusivity is guaranteed by the branch structure itself; no auxiliary data structure needed; simpler to read and reason about
- Structural typing for `getFunnelMedians` — accepts `Array<{ ctr: number | null; cvr: number | null }>` rather than a union of `CampaignSummary | ChannelSummary`; avoids coupling the shared helper to either concrete type; both types satisfy the shape
- Complexity lint hint acknowledged but not acted on — the hint fires on `isWatch` (many `&&` conditions) which is already split into two named booleans (`hasFunnelLeak`, `hasUnderperformingRoi`); extracting further would reduce clarity rather than improve it


## [#273] Refactor portfolio analysis, store computeds, and AI prompt inputs
**Type:** refactor

**Summary:** Consolidated `computePortfolioAnalysis` to a 2-param function that derives everything internally, removed `kpis` as a separate store computed, eliminated `dataCache` from `aiAnalysisStore`, and wired both prompt generators to accept `PortfolioAnalysis` directly — removing all intermediate analysis adapter types.

**Brainstorming:** The previous design had several redundancies: `campaignStore` computed `kpis`, `portfolioScope`, and `portfolioAnalysis` separately despite significant overlap; `aiAnalysisStore` maintained a `Map<string, BudgetOptimizerAnalysis|SummaryAnalysis>` data cache that duplicated what Vue's `computed` already provides; prompt generators accepted bespoke adapter types (`BudgetOptimizerAnalysis`, `SummaryAnalysis`) that were built by separate analysis functions in `common/analysis/`. The simplification: `computePortfolioAnalysis(selectedChannels, selectedChannelsIds)` derives `kpis`, `scope`, `portfolio`, campaign/channel classifications, and all signals internally; `campaignStore.portfolioAnalysis` Vue computed replaces the data cache entirely (memoized by Vue, invalidated only on channel selection change); prompt generators accept `PortfolioAnalysis` and curate a local `promptInput` from the relevant fields — no adapter types needed. `PortfolioScope` kept for display and passed as a prop into both tab orchestrators (not read from store directly inside them). `channels: string[]` added to `PortfolioScope` for components that need the full portfolio channel list regardless of current filter. `v-if="response"` guard added to both tab slot contents to eliminate non-null assertions and prevent reactive timing issues. Budget optimization display bug was also root-caused to missing null guard on slot content — fixed by the same `v-if` addition.

**Prompt:** portfolioAnalysis in campaignStore should accept only 2 inputs — selectedChannels and selectedChannelsIds. Move all calculations into computePortfolioAnalysis. Remove portfolioScope and kpis from the store as separate computeds and update consumers. aiAnalysisStore should not maintain data in a Map — create a function to get portfolioAnalysis and map it to the prompt input. All related models and functions should live in ai-tools/ai-analysis. No single-character variables. Keep portfolioScope for display, add channels property, pass as prop to components. Fix budget optimization panel display. Use PortfolioAnalysis as direct input to prompt generators.

**What changed:**
- `app/src/common/types/campaign.ts` — added `channels: string[]` to `PortfolioScope` (full portfolio channel names, not filtered)
- `app/src/common/portfolio-analysis/portfolio-analysis.ts` — rewritten to 2-param signature `(selectedChannels, selectedChannelsIds)`; all derivations (kpis, scope, portfolio, classifications, signals) computed internally; imports `computePortfolioKPIs` from campaign-performance utils
- `app/src/stores/campaignStore.ts` — removed `kpis` computed entirely; `portfolioScope` now includes `channels` field; `portfolioAnalysis` calls `computePortfolioAnalysis(selectedChannels.value, selectedChannelsIds.value)` only
- `app/src/features/dashboard/DashboardView.vue` — `store.kpis` → `store.portfolioAnalysis.portfolio` in DashboardKpis and DashboardCharts props
- `app/src/stores/aiAnalysisStore.ts` — removed `dataCache` from `createTabState()`; removed `getOrBuildData()` function; removed imports of `computeBudgetOptimizerAnalysis`, `computeSummaryAnalysis`, `BudgetOptimizerAnalysis`, `SummaryAnalysis`; `buildPrompt()` now reads `campaignStore.portfolioAnalysis` directly; all single-char vars renamed (`t` → `tabState`, `d` → `display`, `e` → `error`)
- `app/src/features/ai-tools/prompts/budget-optimization-prompt2.ts` — input type changed from `BudgetOptimizerAnalysis` to `PortfolioAnalysis`; curates `promptInput` locally; added CAMPAIGN GROUP CONTEXT block
- `app/src/features/ai-tools/prompts/executive-summary-prompt2.ts` — input type changed from `SummaryAnalysis` to `PortfolioAnalysis`; curates `promptInput` locally; added CAMPAIGN GROUP CONTEXT and CHANNEL GROUP CONTEXT blocks
- `app/src/features/ai-tools/ai-analysis/components/AiAnalysis.vue` — imports `useCampaignStore`; passes `:scope="campaignStore.portfolioScope"` to both tab components
- `app/src/features/ai-tools/ai-analysis/components/budget-optimization/BudgetOptimizationAnalysis.vue` — added `scope: PortfolioScope` prop; removed `useCampaignStore`; slot content wrapped in `<template v-if="response">`
- `app/src/features/ai-tools/ai-analysis/components/executive-summary/ExecutiveSummaryAnalysis.vue` — added `scope: PortfolioScope` prop; removed `useCampaignStore`; slot content wrapped in `<template v-if="response">`

**Key decisions & why:**
- Vue `computed` replaces `dataCache` Map — the store's `portfolioAnalysis` computed is already memoized by Vue and invalidated only when `selectedChannels` or `selectedChannelsIds` change; a separate Map cache was redundant and added complexity
- `PortfolioScope` kept as a store computed — it serves display purposes (campaign/channel counts, filter summaries) independent of the analysis computation; passing it as a prop into tab components keeps those components free of direct store reads
- Prompt generators curate `promptInput` locally — each tab's AI context is different; the curation belongs inside the prompt function, not in an adapter layer; this removes the need for `BudgetOptimizerAnalysis` and `SummaryAnalysis` types entirely
- `v-if="response"` over non-null assertion — the slot is only rendered when `hasResult` is true, but the `!` assertions were fragile against reactive timing; `v-if` makes the guard explicit in the template and eliminates the assertions cleanly
- `scope.campaigns === scope.selectedCampaigns` inside `computePortfolioAnalysis` — the analysis scope is defined by what is selected; the full portfolio campaign list (needed by `PortfolioScope` for display) is maintained separately in the store's `portfolioScope` computed from `portfolioChannels`


## [#274] Delete common/analysis, buildBudgetOptimizerData, and inline orphaned types
**Type:** refactor

**Summary:** Removed the dead `common/analysis/` folder (4 files) and `buildBudgetOptimizerData.ts`, inlined the 5 AI response literal types into `executive-summary.types.ts`, and removed the duplicate `ConfidenceLevel` from `ai-tools/types/index.ts`.

**Brainstorming:** With `PortfolioAnalysis` now the direct input to both prompt generators, the intermediate analysis layer in `common/analysis/` became fully dead code — the function files were never called, and the `.types.ts` files were only imported for 5 string union literals (`ConfidenceLevel`, `ExecutionRisk`, `HealthLabel`, `InsightType`, `ActionUrgency`). Those 5 literals belong in the AI feature, not in `common`, since they describe AI response output shapes. `buildBudgetOptimizerData.ts` was similarly dead — not called anywhere active (the old `budget-optimization-prompt.ts` imports only the type `BudgetOptimizerData`, not the function). `common/utils/` was confirmed correct where it is: all 5 files are shared between dashboard and portfolio-analysis layers with no clear migration target. The `ConfidenceLevel` duplicate was removed from `types/index.ts` — its use in `BudgetOptimizerCampaign.spendTier` replaced with an inlined `'high' | 'medium' | 'low'` literal.

**Prompt:** Clean up: without touching prompts folder, check if we need common/analysis folder; move related interfaces and functions to ai-analysis feature; check which of common/utils can move to portfolio-analysis; check if we need buildBudgetOptimizerData.

**What changed:**
- `app/src/features/ai-tools/ai-analysis/types/executive-summary.types.ts` — removed imports from `common/analysis`; inlined `ConfidenceLevel`, `ExecutionRisk`, `HealthLabel`, `InsightType`, `ActionUrgency` as local type declarations; cleaned up comments; standardised quote style
- `app/src/features/ai-tools/types/index.ts` — removed `ConfidenceLevel` type declaration; replaced `Lowercase<ConfidenceLevel>` in `BudgetOptimizerCampaign.spendTier` with `'high' | 'medium' | 'low'`
- `app/src/common/analysis/` — deleted entirely (budget-optimization-analysis.types.ts, budget-optimization-analysis.ts, executive-summary-analysis.types.ts, executive-summary-analysis.ts)
- `app/src/features/ai-tools/utils/buildBudgetOptimizerData.ts` — deleted

**Key decisions & why:**
- Inline literal types rather than re-export from types/index.ts — `executive-summary.types.ts` is imported by `types/index.ts`, so the reverse import would be circular; inlining avoids the dependency and keeps the types next to the interfaces that use them
- `common/utils/` stays unchanged — `campaign-performance.ts` is used by both `portfolio-analysis` and dashboard components; `formatters.ts`/`sorting.ts` are dashboard-facing; `campaign-channel.ts` is store-facing; `math.ts` is foundational; none have a clear home in `portfolio-analysis`
- Legacy `BudgetOptimizerData`/`BudgetOptimizerCampaign`/`BudgetOptimizerChannel` kept in `types/index.ts` — the old `budget-optimization-prompt.ts` imports them; removing them would break the legacy file which is intentionally kept compilable


## [#275] Merge ai-analysis/types into ai-tools/types/index.ts
**Type:** refactor

**Summary:** Moved all types from `ai-analysis/types/executive-summary.types.ts` into the central `ai-tools/types/index.ts`, deleted the `ai-analysis/types/` folder, and replaced the duplicate `Correlation` type with `ExecutiveCorrelation`.

**Brainstorming:** `ai-analysis/types/` was a two-file folder (`executive-summary.types.ts` + barrel `index.ts`) with a single external consumer: `ai-tools/types/index.ts` imported `BudgetOptimizerOutput` and `ExecutiveSummaryOutput` from it. With `common/analysis/` already deleted and both output type trees belonging to the same feature, maintaining a separate subfolder added indirection with no benefit. The `Correlation` type in `types/index.ts` (`{ finding: string; implication: string }`) was structurally identical to `ExecutiveCorrelation` in `executive-summary.types.ts`; after merging, only `ExecutiveCorrelation` is needed. `AnalysisCorrelations.vue` was the one active consumer of `Correlation` — updated to `ExecutiveCorrelation`.

**Prompt:** Clean up types in ai-tools/types and move all executive-summary.types to index since it does not make sense anymore.

**What changed:**
- `app/src/features/ai-tools/types/index.ts` — removed import from `ai-analysis/types/executive-summary.types`; inlined all response literal types, output interfaces, and response types directly; removed `Correlation` type (replaced by `ExecutiveCorrelation`); reorganised with section comments
- `app/src/features/ai-tools/ai-analysis/components/shared/AnalysisCorrelations.vue` — updated import from `Correlation` to `ExecutiveCorrelation`
- `app/src/features/ai-tools/ai-analysis/types/` — deleted entirely (executive-summary.types.ts + index.ts)

**Key decisions & why:**
- All types in one file rather than re-exported from a subfolder — the subfolder only existed to group output types; with `common/analysis/` gone and the types folded into the feature's single index, the grouping adds no value
- `ExecutiveCorrelation` kept over `Correlation` — `ExecutiveCorrelation` is the more specific name and comes from the response schema; `Correlation` was a generic alias with no added meaning


## [#276] Mark upload-replace flow as complete in CLAUDE.md
**Type:** update

**Summary:** Removed the stale "Upload-replace flow is next" placeholder from the Status section and replaced it with an accurate description of what was built.

**Brainstorming:** The upload-replace flow was already fully implemented (`ReplaceDataModal`, `useUploadModal` composable, header button wiring in `AppShell`) and marked `[x]` in the feature checklist. The only stale reference was the trailing sentence in the Status paragraph. No code changes needed — documentation-only update.

**Prompt:** This has been completed, update CLAUDE.md respectively.

**What changed:**
- `CLAUDE.md` — replaced "Upload-replace flow is next." with a concise description of the implemented flow: header Upload CSV button → `ReplaceDataModal` confirmation when data exists → confirmed opens `UploadModal`; `useUploadModal` composable owns all state and provides `openUploadModal`

**Key decisions & why:**
- Description follows the same inline style as the rest of the Status paragraph — no separate section needed since the feature is small and already documented in the architecture and checklist


## [#277] Wire analysis-prompt utils into aiAnalysisStore
**Type:** refactor

**Summary:** Replaced the inline prompt-building, `runProviderPrompt` call, and manual model+timestamp stamping in `aiAnalysisStore` with the new `runAnalysisPrompt` util; replaced the local `createCacheKey`/`normalizeLabels` helpers with `getCacheKey`; replaced the local `TabResponse` alias with the shared `AnalysisResponse` type.

**Brainstorming:** The new `ai-analysis/utils/` files (`analysis-prompt.ts`, `utils.ts`, `types.ts`) already encapsulate exactly what `aiAnalysisStore` was doing inline: building the prompt from a tab type + portfolio analysis, dispatching to `runProviderPrompt`, and stamping `model`/`timestamp` on the result. The store no longer needs to import the prompt generators or `runProviderPrompt` directly — `runAnalysisPrompt` owns that boundary. `getCacheKey` is a direct drop-in for the local `createCacheKey`/`normalizeLabels` pair. `AnalysisResponse` replaces the local `TabResponse` alias which was defined identically.

**Prompt:** use analysis-prompt utils in aiAnalysisStore

**What changed:**
- `app/src/stores/aiAnalysisStore.ts` — removed imports of `generateBudgetOptimizationPrompt`, `generateExecutiveSummaryPrompt`, `runProviderPrompt`; added imports of `runAnalysisPrompt`, `getCacheKey` from `ai-analysis/utils` barrel and `AnalysisResponse` from `ai-analysis/utils/types`; added `AiAnalysisType` to types import; removed `ALL_LABELS_KEY`, `TabResponse`, `normalizeLabels`, `createCacheKey`, `buildPrompt`; updated `CacheEntry.response` to `AnalysisResponse`; updated `getCurrentCacheKey` to call `getCacheKey`; replaced the `buildPrompt` + `runProviderPrompt` + manual stamp block in `executeAnalysis` with a single `runAnalysisPrompt` call + `if (!result) return` guard

**Key decisions & why:**
- `if (!result) return` replaces `if (controller.signal.aborted) return` after the await — `runAnalysisPrompt` returns `null` on abort, so the explicit signal check is no longer needed at the call site; the catch block still checks `signal.aborted` for abort-related throws from lower layers
- `AiAnalysisTab` → `AiAnalysisType` mapping inline (`tab === 'optimizer' ? 'budgetOptimizer' : 'executiveSummary'`) — keeps the mapping co-located with the only place it's needed; no shared helper warranted for a two-value switch


## [#278] evaluationDisabled, setDisplay helper, optimizer minimum campaign guard
**Type:** refactor

**Summary:** Extracted a `evaluationDisabled` computed to replace repeated panel/provider/model guards; introduced a `setDisplay` helper to collapse the repeated 4-field display mutation; and added a minimum-2-campaign guard on the Budget Optimizer tab with an explicit error message.

**Brainstorming:** Three separate but related cleanups. `evaluationDisabled` captures the identical 2-line guard (`!aiPanelOpen || !provider || !selectedModel`) that appeared in `executeAnalysis`, `evaluateTab`, and both watchers — a computed is the right home since it reacts to the same signals everywhere. `setDisplay` eliminates ~12 repetitions of the `display.status / display.response (cast) / display.error / display.errorFallback` assignment pattern; the cast `as unknown as typeof display.response` is now in one place. The optimizer minimum-campaign guard is behaviour: with only 1 campaign there is no source and destination for a budget reallocation, so running the analysis produces meaningless output — block it before the API call and surface a clear message rather than letting the AI return empty recommendations.

**Prompt:** use evaluationDisabled for checks in aiAnalysisStore; create function to set display state with required inputs to avoid repetition; disable evaluation running for budget if selected campaigns <2 -> add error message for this

**What changed:**
- `app/src/stores/aiAnalysisStore.ts` — added `MIN_OPTIMIZER_CAMPAIGNS = 2` constant; added `OPTIMIZER_MIN_CAMPAIGNS_ERROR: AiAnalysisError` constant; added `evaluationDisabled` computed; added `setDisplay(tab, status, response?, error?, errorFallback?)` helper; replaced all manual 4-field display assignments with `setDisplay` calls throughout (`handleRequestError`, `executeAnalysis`, `evaluateTab`, `setActiveTab`, `onPanelClose`, `clearStateForNewCSV`, debounced watcher); replaced `!aiStore.aiPanelOpen` / `!aiStore.provider || !aiStore.selectedModel` guard pairs with `evaluationDisabled.value`; destructured `provider`/`apiKey`/`selectedModel` after guard in `executeAnalysis` to satisfy TypeScript narrowing; added `< MIN_OPTIMIZER_CAMPAIGNS` check in `executeAnalysis`, `evaluateTab`, and debounced watcher; updated `optimizerCanAnalyze` to return false when `filteredCampaigns.length < MIN_OPTIMIZER_CAMPAIGNS`

**Key decisions & why:**
- `evaluationDisabled` does not include `apiKey` — the key is a memory-only secret; its absence is an internal invariant (should never happen post-connect), not a display-facing condition; keeping it as a separate check in `executeAnalysis` makes the intent clearer
- Non-null assertions (`provider!`, `selectedModel!`) after the `evaluationDisabled` guard — TypeScript cannot narrow through a computed getter; the assertions are safe because the guard already verified non-null; extracting to locals also makes the `runAnalysisPrompt` call site cleaner
- `setDisplay` uses positional params (not an options object) — all 5 fields, response/error/errorFallback default to null; call sites read naturally (`setDisplay(tab, 'done', entry.response)`)
- `OPTIMIZER_MIN_CAMPAIGNS_ERROR` uses `code: 'unknown'` — no specific `AiErrorCode` exists for validation failures; `handleRequestError` only special-cases `token-limit`; all other codes just surface the message, which is the desired behaviour here
- Both `executeAnalysis` and `evaluateTab` enforce the guard (not just one) — `evaluateTab` is the auto-eval path (panel open, tab switch, model change); `executeAnalysis` is the manual and debounced path; both need the check so the error state is set regardless of how analysis was triggered


## [#279] AiAnalysisType unification, ref display state, module-level helpers, type cleanup
**Type:** refactor

**Summary:** Replaced `AiAnalysisTab` with `AiAnalysisType` as the single key type throughout the store and components, converted display state from `reactive()` to `ref<TabDisplay<T>>` with whole-object replacement, moved `setDisplay` and `getOtherAnalysisType` outside the store as module-level helpers, and removed stray dead code.

**Brainstorming:** The store had two parallel tab-key types (`AiAnalysisTab` 'optimizer'|'summary' and `AiAnalysisType` 'budgetOptimizer'|'executiveSummary') that both mapped to the same concept. Unifying on `AiAnalysisType` eliminates the ternary mapping in `executeAnalysis` and all string duplication. The `reactive()` display objects allowed scattered property mutation — converting to `ref<TabDisplay<T>>` with `display.value = { ... }` replacement makes all updates explicit and atomic. Pure helpers with no dependency on reactive state (`getOtherAnalysisType`, `setDisplay`) belong at module scope. `PromptBuilder` was exported from `analysis-prompt.ts` without any external consumer — made internal. The stray `getCacheKey(selectedChannelsIds.value, 'groq')` dev-test call in `campaignStore.ts` was removed.

**Prompt:** Check created types in ai-connection types. Move related and reused types and interfaces to that feature only there. Instead of AiAnalysisTab use AiAnalysisType. Avoid data mutation in this store. Write helper functions outside the store on top of the file for repeated logic.

**What changed:**
- `stores/campaignStore.ts` — removed stray `getCacheKey` import and dead call inside `selectedChannels` computed
- `features/ai-tools/types/index.ts` — deleted `AiAnalysisTab` type
- `features/ai-tools/ai-analysis/utils/analysis-prompt.ts` — made `PromptBuilder` type non-exported (internal)
- `stores/aiAnalysisStore.ts` — full refactor: `AiAnalysisTab` → `AiAnalysisType` everywhere; `tabs`/display refs renamed `optimizer`→`budgetOptimizer`, `summary`→`executiveSummary`; `reactive()` → `ref<TabDisplay<T>>` for display state; `setDisplay` and `getOtherAnalysisType` moved to module scope; `TabDisplay<T>` type defined at module level; `analyze` uses spread instead of direct property assignment; `activeTab` default changed to `'executiveSummary'`
- `ai-analysis/components/AiAnalysis.vue` — tab IDs updated to `'executiveSummary'`/`'budgetOptimizer'`; cast changed to `AiAnalysisType`; `v-if` check updated
- `ai-analysis/components/budget-optimization/BudgetOptimizationAnalysis.vue` — store refs `optimizer` → `budgetOptimizer`; `analyze('optimizer')` → `analyze('budgetOptimizer')`
- `ai-analysis/components/executive-summary/ExecutiveSummaryAnalysis.vue` — store refs `summary` → `executiveSummary`; `analyze('summary')` → `analyze('executiveSummary')`

**Key decisions & why:**
- `AiAnalysisTab` deleted (not aliased) — the type was purely a UI naming accident; `AiAnalysisType` is the correct domain term; no external consumers outside the store and three components
- `ref<TabDisplay<T>>` with full `.value` replacement instead of `reactive()` — avoids scattered property mutation; `getDisplay` returns `Ref<TabDisplay>` (widened via cast) so `setDisplay` can remain generic; Pinia auto-unwraps the specific typed ref for consumers, preserving `BudgetOptimizerResponse|null` precision at component level
- `setDisplay` at module scope takes `Ref<TabDisplay>` parameter — decouples the helper from the store's closure; call sites pass `getDisplay(tab)` which centralises the ref lookup
- `getOtherAnalysisType` at module scope — pure function, no reactive dependencies; replaces the inline ternary in `executeAnalysis` and makes the "other tab" concept named
- `PromptBuilder` made internal — was exported but had zero external consumers; leaking implementation types widens the public API unnecessarily
- `activeTab` default `'executiveSummary'` — aligns with the Summary-first tab order in the UI (Summary tab is shown first)


## [#280] aiAnalysisStore: derived getters from aiStore, unified evaluationDisabled, allModelsLimitReached handling
**Type:** refactor

**Summary:** Replaced local `tokenLimitReached` ref and duplicated `evaluationDisabled` logic with derived getters from `aiStore`, combined the no-campaigns gate into `evaluationDisabled`, and added `showTokenLimitState` to properly show cached responses or error when all models are exhausted.

**Brainstorming:** `aiStore` already exposed `evaluationDisabled` (panel open + provider + selectedModel + allModelsLimitReached) and `allModelsLimitReached`. The analysis store was duplicating a subset of that check in its own `evaluationDisabled` and tracking `tokenLimitReached` as an independent ref that had to be manually set and reset. Deriving both from aiStore eliminates the duplication and makes the two stores consistent. The `filteredCampaigns.length === 0` check was scattered across three sites — folding it into `evaluationDisabled` reduces it to one definition. The `allModelsLimitReached` inclusion in `evaluationDisabled` means `evaluateTab` now returns early when token-limited, so a dedicated `showTokenLimitState` helper is needed to ensure cached responses are restored (or token-limit error shown) in that path. The filter watcher gained an immediate token-limit branch (no debounce needed when no API call is possible) to keep the display current when filters change while exhausted. `getCurrentCacheKey` no longer needs the `selectedModel` check — provider alone is the requirement for `getCacheKey`.

**Prompt:** evaluationDisabled in aiAnalysisStore should read evaluationDisabled from aiStore and combine campaignStore.filteredCampaigns.length === 0. When allModelsLimitReached we should show previous cached responses and error message if not. Create getters that derive everything needed from aiStore if necessary. We will not deviate from this approach.

**What changed:**
- `stores/aiAnalysisStore.ts` — `tokenLimitReached` changed from `ref(false)` to `computed(() => aiStore.allModelsLimitReached)`; `evaluationDisabled` now reads `aiStore.evaluationDisabled || filteredCampaigns.length === 0`; added `showTokenLimitState(tab)` internal helper; `getCurrentCacheKey` drops `selectedModel` null-guard; `evaluateTab` calls `showTokenLimitState` when `evaluationDisabled && tokenLimitReached`; `executeAnalysis` token pre-flight calls `showTokenLimitState` instead of setting ref; `handleRequestError` removes explicit `tokenLimitReached.value = true`; filter watcher handles token-limited case immediately before debounce; `optimizerCanAnalyze` and `summaryCanAnalyze` gate on `tokenLimitReached`; `clearStateForNewCSV` removes `tokenLimitReached.value = false`
- `CLAUDE.md` — updated Status paragraph and aiAnalysisStore architecture entry

**Key decisions & why:**
- `tokenLimitReached` as computed not ref — `aiStore.allModelsLimitReached` is the single source of truth for model exhaustion; a local ref that shadowed it required manual sync and could drift; computed is always accurate
- `evaluationDisabled` combines `aiStore.evaluationDisabled` (includes allModelsLimitReached) with `filteredCampaigns.length === 0` — both are "cannot analyze" conditions; one computed replaces three scattered checks
- `showTokenLimitState` called inside the `evaluationDisabled` branch of `evaluateTab` — when `allModelsLimitReached` gates the evaluation, the old cache-restore path is unreachable; this helper re-establishes that path specifically for the token-limit case
- Filter watcher: token-limit check before debounce — when models are exhausted, filter changes should update the display immediately (lookup new cache key or show error); no point debouncing since no API call will happen
- `optimizerCanAnalyze`/`summaryCanAnalyze` gated on `tokenLimitReached` — `AnalysisState.vue` controls the button only via `isButtonDisabled`; without the gate the button would be enabled when all models are exhausted even though clicking does nothing
- `getCurrentCacheKey` only checks `!aiStore.provider` — `selectedModel` is not used by `getCacheKey`; provider is non-null whenever the computed's callers have already passed the `evaluationDisabled` guard


## [#281] getCurrentCacheKey: remove null return, propagate provider guard to canAnalyze
**Type:** refactor

**Summary:** Changed `getCurrentCacheKey` to always return `string` (was `string | null`), moved the provider null-guard into `canAnalyze` (its only unguarded caller), and removed the now-dead `if (!cacheKey) return` checks from `executeAnalysis`, `evaluateTab`, and the debounce watcher.

**Brainstorming:** After the previous refactor, every call site of `getCurrentCacheKey` except `canAnalyze` was already guarded by `evaluationDisabled` (which includes `!aiStore.provider`). The null check inside `getCurrentCacheKey` was redundant in those paths. `canAnalyze` is called from `optimizerCanAnalyze`/`summaryCanAnalyze` without an `evaluationDisabled` guard, so it needs its own provider check. Moving the guard there lets `getCurrentCacheKey` be a pure, non-nullable function. The downstream `if (!cacheKey) return` guards in `executeAnalysis`, `evaluateTab`, and the debounce callback become dead code and can be deleted.

**Prompt:** getCurrentCacheKey — do we really need to check again provider?

**What changed:**
- `stores/aiAnalysisStore.ts` — `getCurrentCacheKey` return type changed from `string | null` to `string`, non-null assertion on `aiStore.provider!`; `canAnalyze` adds `if (!aiStore.provider) return false` guard; `showTokenLimitState` drops the `cacheKey ?` ternary (always a string now); removed `if (!cacheKey) return` from `executeAnalysis`, `evaluateTab`, and the debounce callback

**Key decisions & why:**
- Guard moved to `canAnalyze`, not inlined at each call site — `canAnalyze` is the only path that can reach `getCurrentCacheKey` without an `evaluationDisabled` guard; the other callers are already safe by construction
- `getCurrentCacheKey` returns `string` unconditionally — callers after the `evaluationDisabled` guard have a non-null provider by definition; making the return type reflect that removes defensive checks that were pure noise


## [#282] Container query system + CSS variable theme tokens
**Type:** architecture

**Summary:** Introduced a SCSS mixin library for container queries globally injected via Vite, extracted dark theme tokens into a dedicated `themes/dark.scss` file, migrated key Tailwind color tokens to CSS custom properties, and rewired the KPI grid and KpiCard to use container queries instead of viewport media queries.

**Brainstorming:** The dashboard's KPI grid was using viewport-based media queries, which break when the AI drawer opens and compresses the content area — the viewport width does not change but the available space for the grid does. Container queries solve this precisely: the grid reacts to the width of its own container, not the viewport. To use container queries cleanly across multiple components without per-file imports, the mixin library is injected globally via Vite's `additionalData`. The theme tokens were scattered across `style.scss` as hardcoded values — extracting them to `themes/dark.scss` and wiring them into Tailwind as CSS variables makes the color system coherent and prepares for future theme switching.

**Prompt:** Set up a container query SCSS mixin system and make it globally available. Extract the dark theme into a proper tokens file. Migrate the KPI grid layout to use container queries so it responds to the AI drawer compression rather than viewport width. Wire CSS variable-based color tokens into Tailwind.

**What was built:**
- `app/src/styles/container-queries.scss` — new SCSS mixin library: `$container-sizes` scale (tiny 220px / xs 280px / sm 320px / md 400px / lg 480px / xl 640px / 2xl 768px); mixins `cq-container`, `cq-up`, `cq-down`, `cq-between` with optional named-container support
- `app/src/styles/themes/dark.scss` — new file; CSS custom properties for the dark theme (primary scale 50–1000, color-background, color-surface, color-typography, color-on-surface-high, color-surface-outline); applied on `:root` and `[data-theme="dark"]`
- `app/src/styles/index.scss` — updated to `@use './themes/dark.scss'` as first import
- `app/src/style.scss` — simplified; theme tokens removed (now live in `themes/dark.scss`)
- `app/tailwind.config.js` — `background`, `surface`, `surface-outline`, `on-surface-high`, and `typography.DEFAULT` now reference CSS custom properties via `rgb(var(--color-*) / <alpha-value>)` instead of hardcoded values
- `app/vite.config.ts` — added `css.preprocessorOptions.scss.additionalData` to globally inject `@use "@/styles/container-queries" as *` into every SCSS file
- `app/src/features/dashboard/DashboardView.vue` — `.data-visualization` scoped style adds `container-type: inline-size` to establish the container context for child grid queries
- `app/src/features/dashboard/components/DashboardKpis.vue` — `.kpi-grid` now uses `@container (min-width: Xrem)` breakpoints (360px → 2 cols, 640px → 3 cols, 1024px → 5 cols) instead of viewport media queries
- `app/src/features/dashboard/components/KpiCard.vue` — uses `@include cq-container('kpi-card')` on the card root and `@include cq-up(tiny, 'kpi-card')` to scale the value font size from 2xl to 3xl when the card is wide enough
- Minor style token updates across `_card.scss`, `_forms.scss`, `Tabs.vue`, `RadioToggle.vue`, `ToastNotification.vue`, `CampainDuplicationsTable.vue` to align with the new CSS variable token names

**Key decisions & why:**
- Vite `additionalData` for global mixin injection — avoids per-file `@use` boilerplate; the mixin file contains no CSS output (only variables and mixins) so injecting it globally has zero bundle cost
- Container queries over media queries for the KPI grid — the AI drawer compresses the content area without changing the viewport width; only container queries respond to actual available space
- Named container on KpiCard (`kpi-card`) — allows the card to query its own width independently of the grid; a single card can appear in different layout contexts without needing separate media query overrides
- Theme tokens in a dedicated `themes/dark.scss` — keeps the token definitions co-located with the theme they belong to; `style.scss` stays as a thin entry point; future light theme would be a sibling file
- CSS variables in Tailwind via `rgb(var(--color-*) / <alpha-value>)` — preserves Tailwind's opacity modifier support (`bg-surface/50`) while making the underlying value runtime-configurable


## [#283] Move analysis-badge-variants into ai-analysis/utils; remove panel-formatters
**Type:** refactor

**Summary:** Relocated `analysis-badge-variants.ts` from the orphaned `ai-tools/utils/` folder into `ai-analysis/utils/` where its consumers live, deleted `panel-formatters.ts` entirely, and replaced its two callers (`formatEuro`, `formatRoi`) with `formatCurrency` and `formatPercentage` from `common/utils/formatters`.

**Brainstorming:** `ai-tools/utils/` held two files with no barrel and no consumers outside `ai-analysis/` — a folder that existed only to hold these two files. `analysis-badge-variants.ts` belongs beside the other AI analysis utilities it's always used with. `panel-formatters.ts` duplicated functionality already present in `common/utils/formatters` with minor locale differences (`en-IE` vs `en`) and slightly different precision for ROI (no decimals vs 2 decimals via `toFixed`). The common formatters are the single source of truth for display formatting; duplicating them in a feature folder creates drift risk. Removing `panel-formatters.ts` leaves the `ai-tools/utils/` folder empty, so it is deleted too.

**Prompt:** Move analysis-badge-variants out of ai-tools/utils and into ai-analysis/utils. Remove panel-formatters.ts and use the formatters from common instead.

**What changed:**
- `ai-tools/ai-analysis/utils/analysis-badge-variants.ts` — new location; same content, import path for `BadgeVariant` updated to `../../../../ui/types/badge-variant`
- `ai-tools/ai-analysis/utils/index.ts` — added `export * from './analysis-badge-variants'`
- `ai-tools/utils/analysis-badge-variants.ts` — deleted (old location)
- `ai-tools/utils/panel-formatters.ts` — deleted
- `ai-tools/utils/` folder — deleted (now empty)
- `BudgetOptimizationRecommendations.vue` — import updated to `'../../utils/analysis-badge-variants'`; panel-formatters import removed; `formatEuro` → `formatCurrency`, `formatRoi` → `formatPercentage` from `common/utils/formatters`; template call sites updated accordingly
- `ExecutiveSummaryPriorityActions.vue`, `ExecutiveSummaryInsights.vue`, `ExecutiveSummaryHealth.vue` — import paths updated from `'../../../utils/analysis-badge-variants'` to `'../../utils/analysis-badge-variants'`

**Key decisions & why:**
- `ai-analysis/utils/` as destination — badge variants are consumed exclusively by ai-analysis components; co-locating them with the other ai-analysis utilities (getCacheKey, analysis-prompt, error-messages) removes the cross-folder hop
- `formatCurrency` for euro amounts, `formatPercentage` for ROI — direct functional equivalents in common; locale difference (`en-IE` → `en`) and ROI decimal change (0 → 2) are acceptable since the common formatters are the project standard
- Deleted the `ai-tools/utils/` folder entirely — an empty folder with no barrel serves no purpose


## [#284] Isolate types per feature — portfolio-analysis barrel, slim ai-tools/types, ai-analysis/types expansion, prompts/types
**Type:** refactor

**Summary:** Split the monolithic `ai-tools/types/index.ts` into feature-scoped type files, moved portfolio-specific summary types out of `common/types/campaign.ts` into `common/portfolio-analysis/types.ts`, created a barrel for `common/portfolio-analysis/`, extracted prompt-building primitives into `ai-tools/prompts/types.ts`, expanded `ai-analysis/types/index.ts` to own all AI response types, and relocated legacy types into the legacy prompt file where they belong.

**Brainstorming:** `ai-tools/types/index.ts` had grown into a 199-line mega-hub mixing provider/connection types, analysis meta-types, prompt-building primitives, response literal types, output interfaces, response types, building blocks, and legacy data types. Similarly, `common/types/campaign.ts` contained portfolio classification summary types (`CampaignSummary`, `ChannelSummary`, `PortfolioSummary`, `SummaryMetricStatus`, `ScalingCandidateSignal`) that are exclusively consumed within `common/portfolio-analysis/` — a clear misplacement. The goal was feature-scoped isolation: each folder's types live in that folder, each layer imports only what it owns. The ai-tools feature was split into three focused type files: `ai-tools/types/` (5 cross-feature provider+meta types), `ai-analysis/types/` (all response types + BusinessContext), and `prompts/types.ts` (prompt-building primitives). Legacy types were moved locally into the legacy prompt file.

**Prompt:** Audit every type and interface across the codebase. Move each type to the folder that owns it. Create barrel files per folder for clean imports. Remove types from shared hubs that are only used within one sub-feature. Move all types used only by legacy prompt files directly into those files as local (non-exported) types. The goal is to isolate related types per feature so that each feature folder's index.ts or types/ barrel is the sole source of truth for that feature's types.

**What changed:**
- `common/types/campaign.ts` — removed `PortfolioSummary`, `SummaryMetricStatus`, `ChannelSummary`, `CampaignSummary`, `ScalingCandidateSignal` (moved to portfolio-analysis/types.ts)
- `common/portfolio-analysis/types.ts` — added the 5 portfolio-only summary types as local definitions; updated import from `../types/campaign` to only pull base types
- `common/portfolio-analysis/index.ts` — new barrel: exports `computePortfolioAnalysis` + all types from `types.ts`
- `common/portfolio-analysis/classify-campaigns.ts` — `CampaignSummary` import: `../types/campaign` → `./types`
- `common/portfolio-analysis/classify-utils.ts` — `CampaignSummary` import: `../types/campaign` → `./types`
- `common/portfolio-analysis/classify-channels.ts` — `ChannelSummary` import: `../types/campaign` → `./types`
- `common/portfolio-analysis/portfolio-analysis.ts` — `PortfolioSummary` import: `../types/campaign` → `./types`
- `common/portfolio-analysis/utils.ts` — `CampaignSummary, ChannelSummary, ScalingCandidateSignal, SummaryMetricStatus` import: `../types/campaign` → `./types`
- `ai-tools/types/index.ts` — slimmed to 5 types only: `AiProviderType`, `AiErrorCode`, `AiConnectionError`, `AiAnalysisType`, `AiAnalysisError`
- `ai-tools/ai-analysis/types/index.ts` — expanded to own all AI response types: `BusinessContext`, `ConfidenceLevel`, `ExecutionRisk`, `HealthLabel`, `InsightType`, `ActionUrgency`, `ExecutiveInsight`, `PriorityAction`, `ExecutiveCorrelation`, `ExecutiveSummaryOutput`, `BudgetRecommendation`, `BudgetOptimizerOutput`, `BudgetOptimizerResponse`, `ExecutiveSummaryResponse` + existing `AnalysisResponse`, `AnalysisContext`, `AIProviderState`
- `ai-tools/prompts/types.ts` — new file: `PromptList`, `PromptInstructions`, `PromptInstructionStep`, `PromptScopeConfig`
- `ai-tools/prompts/index.ts` — added `export type { ... } from './types'`
- `ai-tools/prompts/prompt-utils.ts` — import from `'../types'` → `'./types'`
- `ai-tools/prompts/budget-optimization-prompt.ts` — all legacy types (`BudgetOptimizerData`, `BudgetOptimizerCampaign`, `BudgetOptimizerChannel`, building blocks, `BudgetOptimizerContextInput`) defined locally; import updated to `'./types'`
- `ai-tools/prompts/executive-summary-prompt.ts` — legacy file; imports fixed: `BusinessContext` from `'../ai-analysis/types'`, `PromptScopeConfig` from `'./types'`, `ExecutiveSummaryData` defined locally
- `ai-tools/prompts/budget-optimization-prompt2.ts` — `BusinessContext` import: `'../types'` → `'../ai-analysis/types'`
- `ai-tools/prompts/executive-summary-prompt2.ts` — `BusinessContext` import: `'../types'` → `'../ai-analysis/types'`
- `ai-tools/ai-analysis/utils/analysis-prompt.ts` — split import: `AiAnalysisType` stays in `'../../types'`, `BusinessContext` → `'../types'`
- `stores/aiAnalysisStore.ts` — `BudgetOptimizerResponse`, `ExecutiveSummaryResponse` moved from `ai-tools/types` import to `ai-analysis/types` import
- `ai-tools/mocks/budget-optimizer-mocks.ts` — `BudgetOptimizerResponse` from `'../types'` → `'../ai-analysis/types'`
- `ai-tools/mocks/executive-summary-mocks.ts` — `ExecutiveSummaryResponse` from `'../types'` → `'../ai-analysis/types'`
- `CLAUDE.md` — updated architecture entries for all changed files

**Key decisions & why:**
- `common/portfolio-analysis/types.ts` as destination for summary types — `CampaignSummary`, `ChannelSummary` etc. were defined in `campaign.ts` but imported exclusively by `portfolio-analysis/` internals; co-locating them with the classification logic they support removes the leaky abstraction
- `ai-analysis/types/index.ts` as the owner of all AI response types — response types, literal types, and `BusinessContext` are all consumed within the `ai-analysis` sub-feature (components, store, prompts); centralising them here eliminates the need for external callers to import from the parent `ai-tools/types` hub
- `prompts/types.ts` as a dedicated file — prompt-building primitives are only used by `prompt-utils.ts` and the legacy prompt files; keeping them separate from both the provider/connection hub and the analysis response types avoids cross-concern leakage
- Legacy types moved locally (not deleted) — the old `budget-optimization-prompt.ts` and `executive-summary-prompt.ts` are non-exported dead code but are kept compilable; inlining their types makes them fully self-contained and removes all traces from the shared hub
- `common/portfolio-analysis/index.ts` created — the folder had no barrel despite having five internal files; the barrel lets external consumers (`campaignStore`, `ai-analysis/types`) import from a single path rather than reaching into internals


## [#285] Move aiStore to ai-connection/stores as useAiConnectionStore; tighten providers barrel
**Type:** refactor

**Summary:** Moved the AI connection Pinia store from `stores/aiStore.ts` into `features/ai-tools/ai-connection/stores/` as `useAiConnectionStore`, co-locating it with the connection UI it serves; tightened `providers/index.ts` to export only symbols consumed externally.

**Brainstorming:** The store was sitting in the global `stores/` folder despite being exclusively an ai-connection concern — it holds provider state, API key, connection status, model list, and panel open/close. Moving it into `ai-connection/stores/` makes the feature folder self-contained: components, utils, and store all live together. The rename from `useAiStore` / `'ai'` to `useAiConnectionStore` / `'aiConnection'` clarifies intent. The `providers/index.ts` barrel was exporting everything from `./utils` (including internal error-handling symbols only used inside providers) and `./providers-meta` (imported directly by components, never via the barrel); narrowing to named exports removes accidental leakage of internal API surface.

**Prompt:** Move aiStore to ai-connection/stores folder, define it as aiConnection, update barrel files in ai-tools folder to export only what is consumed.

**What changed:**
- `features/ai-tools/ai-connection/stores/aiConnectionStore.ts` — new file; store content moved from `stores/aiStore.ts`; store id changed from `'ai'` to `'aiConnection'`; export renamed from `useAiStore` to `useAiConnectionStore`; import paths updated to resolve from new location
- `features/ai-tools/ai-connection/stores/index.ts` — new barrel; exports `useAiConnectionStore`
- `stores/aiStore.ts` — replaced with location comment (pending deletion); all consumers updated
- `features/ai-tools/providers/index.ts` — removed `export * from './utils'` (wildcard) and `export * from './providers-meta'`; replaced with named exports: `getAllModelsLimitReached`, `getModelById`, `getNextAvailableMode` from utils; kept `export * from './types'`, `runProviderPrompt`, `connectProvider`
- `shell/AppShell.vue` — import + usage updated to `useAiConnectionStore`
- `features/dashboard/components/DashboardHeader.vue` — import + usage updated
- `features/ai-tools/components/AiToolsContent.vue` — import + usage updated
- `features/ai-tools/ai-connection/components/AiConnectionForm.vue` — import + usage updated
- `features/ai-tools/ai-connection/components/AiConnectedStatus.vue` — import + usage updated
- `stores/aiAnalysisStore.ts` — import + usage updated
- `CLAUDE.md` — architecture updated: removed `aiStore.ts` entry, added `ai-connection/stores/` sub-tree, updated `providers/index.ts` description, updated `DashboardHeader.vue` and `AppShell.vue` descriptions, updated `aiAnalysisStore.ts` description

**Key decisions & why:**
- Store placed in `ai-connection/stores/` (not a top-level `ai-tools/stores/`) — the store serves only the connection sub-feature; placing it alongside the connection components and utils gives the clearest ownership boundary
- Rename to `'aiConnection'` store id — the old `'ai'` id was ambiguous; `'aiConnection'` matches the folder name and signals the store's single responsibility
- `providers/index.ts` named exports only — `export * from './utils'` was leaking `normalizeConnectionError`, `assertResponseOk`, `parseJsonResponse`, `toValidModels` — all internal to provider implementations and not consumed by any external caller; named exports make the public API explicit
- `export * from './providers-meta'` removed — `PROVIDER_LABELS`, `PROVIDER_HELP`, `PROVIDER_OPTIONS` are imported directly from `providers-meta` by the two connection components, not via the barrel; removing the re-export eliminates a redundant path without breaking anything


## [#286] Refactor analysis error and notice types — move message mapping to one file in the analysis feature
**Type:** refactor

**Summary:** Removed message text from `AiAnalysisError`, replaced `errorFallback: string` with a typed `AiAnalysisNotice`, and consolidated all analysis-panel message text into a single `analysis-messages.ts` file so the store only stores error codes and components resolve display text.

**Brainstorming:** The store was doing two jobs: tracking error state and resolving human-readable message strings via `ANALYSIS_ERROR_MESSAGES`. This created a split where some message text lived in the store constant file and some was hardcoded directly in `AnalysisState.vue` (the token-limit notice block). `errorFallback: string | null` was an untyped raw string with no connection to a code or mapping. The fix: strip message resolution out of the store entirely, add typed `AiAnalysisNotice` alongside `AiAnalysisError`, collect every analysis-panel string into one mapping file (`analysis-messages.ts`), and have `AnalysisState.vue` resolve display text from that file. A new `'min-campaigns'` error code was added so the optimizer threshold case has a real code instead of piggybacking on `'unknown'`. `rawMessage` on `AiAnalysisError` provides a runtime fallback for any truly unhandled error whose code falls through the map.

**Prompt:** Move the mapping of error types to displayed errors into the analysis feature. The store should only save errors. Errors should ideally carry a rawMessage for unhandled cases. errorFallback should be renamed to a typed notice. All message text should live in one file. Add error types if necessary.

**What changed:**
- `app/src/features/ai-tools/types/index.ts` — added `'min-campaigns'` to `AiErrorCode`; changed `AiAnalysisError` from `{ code, message }` to `{ code, rawMessage? }`; added `AiAnalysisNoticeCode` ('stale-result') and `AiAnalysisNotice ({ code })`
- `app/src/features/ai-tools/ai-analysis/utils/analysis-messages.ts` (NEW) — `ANALYSIS_ERROR_MESSAGES` (11 codes), `ANALYSIS_NOTICE_MESSAGES` ('stale-result'), `TOKEN_LIMIT_MESSAGES` ({ notice, hint }); replaces `analysis-error-messages.ts`
- `app/src/features/ai-tools/ai-analysis/utils/analysis-error-messages.ts` (DELETED) — replaced by `analysis-messages.ts`
- `app/src/features/ai-tools/ai-analysis/utils/index.ts` — barrel updated to re-export `analysis-messages` instead of `analysis-error-messages`
- `app/src/stores/aiAnalysisStore.ts` — removed `ANALYSIS_ERROR_MESSAGES` import; `OPTIMIZER_MIN_CAMPAIGNS_ERROR` now `{ code: 'min-campaigns' }`; `TabDisplay` field `errorFallback: string|null` → `notice: AiAnalysisNotice|null`; `setDisplay` 5th param renamed to `notice`; `handleRequestError` stores `{ code, rawMessage }` — no message lookup; `showTokenLimitState` stores `{ code: 'token-limit' }` — no message lookup; stale-result case stores `{ code: 'stale-result' }` notice; `analyze()` clears `notice: null`
- `app/src/features/ai-tools/ai-analysis/components/shared/AnalysisState.vue` — prop `errorFallback: string|null` → `notice: AiAnalysisNotice|null`; imports `ANALYSIS_ERROR_MESSAGES`, `ANALYSIS_NOTICE_MESSAGES`, `TOKEN_LIMIT_MESSAGES`; `errorMessage` computed resolves from map with `rawMessage` fallback; `noticeText` computed resolves from notice map; token-limit template strings use `TOKEN_LIMIT_MESSAGES`
- `app/src/features/ai-tools/ai-analysis/components/budget-optimization/BudgetOptimizationAnalysis.vue` — `errorFallback` → `notice` in computed + template prop
- `app/src/features/ai-tools/ai-analysis/components/executive-summary/ExecutiveSummaryAnalysis.vue` — `errorFallback` → `notice` in computed + template prop
- `CLAUDE.md` — updated types description, aiAnalysisStore description, analysis-messages entry, barrel entry, AnalysisState description, Status paragraph

**Key decisions & why:**
- `rawMessage` on `AiAnalysisError` (not only when code === 'unknown') — always capturing the raw error text is cheap and lets the component decide whether to show it; the component prioritises the map lookup and only falls back to rawMessage if the map has no entry for that code (defensive against future unhandled codes at runtime)
- `TOKEN_LIMIT_MESSAGES` as a plain object in `analysis-messages.ts` (not a notice code) — the token-limit notice is driven by a prop, not a `TabDisplay.notice` field; adding it to the mapping file still satisfies "one file for all message text" without forcing a second notice code
- `'min-campaigns'` added as a real `AiErrorCode` — the optimizer threshold case previously borrowed `'unknown'` and baked a long message inline in the store constant; a real code gives it a proper entry in the map and removes the inline string from the store entirely


## [#287] Refactor aiAnalysisStore to remove repetition
**Type:** refactor

**Summary:** Extracted three internal helpers from `aiAnalysisStore` to eliminate repeated code patterns across `executeAnalysis`, `evaluateTab`, `setActiveTab`, `onPanelClose`, and the channel-filter watcher.

**Brainstorming:** Three patterns repeated across the store: (1) "cancel in-flight + revert to last known state" was an identical 4-line block in three places; (2) the optimizer minimum campaign check was duplicated four times inline; (3) "look up cache entry → setDisplay('done') → update lastVisibleCacheKey" appeared in five locations including as two separate near-identical blocks inside `evaluateTab`. Extracting each into a named helper eliminates the duplication, gives each pattern a descriptive name, and makes the callers read as intent rather than mechanics. The derived-state section was also tidied: `tokenLimitReached`, `evaluationDisabled`, and the two `canAnalyze` computeds are now co-located under one section header. Two separate reset sections (`clearStateForNewCSV`, `clearStateForDisconnect`) were collapsed into a single "Reset" section. All logic is unchanged; zero TypeScript errors after refactor.

**Prompt:** The aiAnalysisStore has a lot of repetition. Clean up the store, maintain the functionality but make it more readable.

**What changed:**
- `app/src/stores/aiAnalysisStore.ts` — extracted `isBelowOptimizerMinimum(): boolean`, `showOptimizerMinimumError(tab): boolean`, `showCachedResult(tab, cacheKey): boolean`, and `revertTab(tab): void`; simplified `showTokenLimitState`, `canAnalyze`, `optimizerCanAnalyze`, `handleRequestError`, `executeAnalysis`, `evaluateTab`, `setActiveTab`, `onPanelClose`, and the channel-filter watcher to use the new helpers; merged single-getter sections into "Derived state"; merged reset sections into "Reset"; removed spurious double blank line in watcher
- `CLAUDE.md` — updated `aiAnalysisStore.ts` architecture description to document the new store-internal helpers

**Key decisions & why:**
- `revertTab` encapsulates "cancel + show last known state" — this exact sequence appeared identically when switching tabs, when pre-empting the other tab before a new request, and when closing the panel; a single named function makes each call site's intent obvious
- `showCachedResult` returns a boolean so callers can gate on it (`if (showCachedResult(...)) return`) — this collapses `evaluateTab`'s two near-identical cache-check blocks into one call and simplifies the watcher debounce body
- `isBelowOptimizerMinimum` keeps the raw boolean check separate so `optimizerCanAnalyze` can use it without side effects; `showOptimizerMinimumError` layers the display call on top and returns a boolean for the same early-return pattern, collapsing the repeated 4-line block in `executeAnalysis`, `evaluateTab`, and the watcher debounce into a single `if (showOptimizerMinimumError(tab)) return`
- `setDisplay` moved inside the store and its first parameter changed from `display: Ref<TabDisplay>` to `tab: AiAnalysisType` — it now calls `getDisplay(tab).value = { status, response, error, notice }` internally (full object replacement, the correct Vue reactivity pattern), removing the repeated `setDisplay(getDisplay(tab), ...)` pattern from every call site


## [#288] Background connection: toast notifications + green dot pop-in
**Type:** update

**Summary:** When the AI panel is closed while a connection request is in flight, the request completes in the background and shows a success or error toast; the connected dot gains a spring pop-in animation so it appears immediately and visibly on background success.

**Brainstorming:** The connection store's `connect()` already continued in the background when the panel closed (no AbortController, no cancel call in `closePanel`). What was missing was feedback: the user had no way to know the request succeeded or failed. Solution: check `aiPanelOpen` at completion time inside `connect()` and fire toasts conditionally. Analysis cancellation on panel close was confirmed to remain unchanged. For the green dot, it already appeared reactively when `isConnected && !aiPanelOpen`, but the static appearance made it easy to miss. A one-shot spring keyframe animation makes it pop into view so the user notices it immediately.

**Prompt:** When the AI panel is closed while a connection request is in flight: let the request complete in background, show a success toast ("Connected to [Provider]") or error toast ("Connection failed. Reopen the panel for details.") if the panel is still closed at completion time. Also add a pop-in animation to the connected dot in DashboardHeader so it's immediately noticeable on background success. Analysis requests still cancel on panel close.

**What changed:**
- `app/src/features/ai-tools/ai-connection/stores/aiConnectionStore.ts` — imported `useToastStore` and `PROVIDER_LABELS`; `connect()` checks `!aiPanelOpen.value` after success and after catch, showing the appropriate toast only when panel is closed
- `app/src/features/dashboard/components/DashboardHeader.vue` — added `dot-pop` scoped `@keyframes` (cubic-bezier spring, scale 0→1, 0.4s) applied to `.connected-status` so the dot animates in each time it appears

**Key decisions & why:**
- Check `aiPanelOpen.value` at completion time (not captured at call start) — the panel might be closed mid-flight, so the relevant question is whether it's open when the result arrives
- `useToastStore()` called inside `connect()` rather than at store definition level — avoids circular initialization risk since both stores are Pinia setup stores; Pinia resolves setup-store instances lazily so calling inside an action is safe
- No new reactive state — the dot's appearance is already driven by `isConnected && !aiPanelOpen`; the animation triggers naturally via `v-if` re-mount each time the condition becomes true
- Error toast message intentionally vague ("Reopen the panel for details") — the granular error codes and hints are displayed in the connection form, not appropriate for a transient toast


## [#289] Normalize all component emits and listeners to camelCase
**Type:** fix

**Summary:** Renamed the one kebab-case emit (`'download-template'`) to `'downloadTemplate'` in `UploadCampainData.vue` and updated its emit call and listener in `UploadModal.vue`; also updated the `@clear-all` listener in `DashboardView.vue` to `@clearAll` to match the existing camelCase emit in `ChannelFilter.vue`.

**Brainstorming:** Audited all `defineEmits` definitions and `@event` listeners across the codebase. Found three inconsistencies: one kebab-case emit name in `UploadCampainData.vue`, one matching kebab-case listener in `UploadModal.vue`, and one kebab-case listener `@clear-all` in `DashboardView.vue` (the emit itself was already `clearAll`). All other emits were already camelCase. Vue 3 accepts either form but camelCase in both emit definition and listener keeps the codebase consistent.

**Prompt:** Make all component outputs/emits camelCase

**What changed:**
- `app/src/features/data-transfer/components/UploadCampainData.vue` — renamed emit `'download-template'` → `'downloadTemplate'`; updated `emit('download-template')` call to `emit('downloadTemplate')`
- `app/src/features/data-transfer/components/UploadModal.vue` — updated listener `@download-template` → `@downloadTemplate`
- `app/src/features/dashboard/DashboardView.vue` — updated listener `@clear-all` → `@clearAll`

**Key decisions & why:**
- No logic changes — purely naming consistency; Vue 3 auto-maps both forms so behavior is unchanged
- `ChannelFilter` emit was already `clearAll`; only the call-site listener needed updating


## [#290] Enforce camelCase/kebab-case split between script and template
**Type:** fix

**Summary:** Applied the project naming convention — JS/TS uses camelCase, templates/HTML use kebab-case — to violations found in three modified files.

**Brainstorming:** The rule is that the two halves of a Vue SFC use different case conventions: script block (defineEmits keys, defineProps keys, emit() call arguments, variable names) → camelCase; template attributes (prop bindings, event listeners, v-model argument) → kebab-case. Vue 3 auto-maps between them. Three files had violations from a previous commit that uniformly moved everything to camelCase.

**Prompt:** Inputs and outputs in Vue components must follow this pattern: JavaScript / TypeScript → camelCase; Templates / HTML → kebab-case.

**What changed:**
- `app/src/features/dashboard/DashboardView.vue` — `@aiClick` → `@ai-click`
- `app/src/features/data-transfer/components/UploadCampainData.vue` — `:modelValue` → `:model-value`; `@update:modelValue` → `@update:model-value`; emit definition `'download-template'` → `downloadTemplate`; inline `emit('download-template')` → `emit('downloadTemplate')`
- `app/src/features/data-transfer/components/UploadModal.vue` — `@download-template` was already kebab-case; no changes needed

**Key decisions & why:**
- Emit definition keys in `defineEmits` are JS/TS → camelCase; corresponding template listeners are HTML → kebab-case; Vue maps them automatically
- `v-model:title` / `v-model:file` argument names follow the prop name and stay as-is; the generated `update:title` / `update:file` event names are a Vue convention, not free-form strings


## [#291] Replace all relative path imports with @ alias
**Type:** refactor

**Summary:** Replaced every `../` relative import across the entire `src/` tree with `@/` alias paths, and fixed a set of pre-existing type errors exposed by making the paths explicit.

**Brainstorming:** The `@` alias (pointing to `src/`) was already declared in both `vite.config.ts` and `tsconfig.app.json` but was not used in any source file — all 177 cross-folder imports used relative `../../..` chains. A Python script resolved each relative import to its absolute `src/`-rooted path and rewrote it as `@/...`. This also surfaced pre-existing errors that had been masked: five analysis components imported response types from `@/features/ai-tools/types` (the slim meta-types module) when they needed `@/features/ai-tools/ai-analysis/types`; `business-context.ts` had the same wrong module for `BusinessContext`; `error-handling.ts` was missing `min-campaigns` from both `ERROR_MESSAGES` and `ERROR_HINTS` records after the error code was added to `AiErrorCode`; two accidental Finder copy files (`budget-optimization-prompt copy.ts`, `executive-summary-prompt copy.ts`) were in `src/` and failed to compile; a string literal in `executive-summary-mocks.ts` had an unescaped apostrophe; and both orchestrator components passed `:error-fallback` after the prop was renamed to `notice` in `AnalysisState`. All fixed as part of this change. Build is now clean.

**Prompt:** Use alias in vite for imports and not relative paths.

**What changed:**
- 80 source files — all `../` relative imports replaced with `@/` equivalents via automated script
- `features/ai-tools/ai-analysis/components/executive-summary/ExecutiveSummaryHealth.vue`, `ExecutiveSummaryInsights.vue`, `ExecutiveSummaryPriorityActions.vue`, `AnalysisCorrelations.vue` (shared), `BudgetOptimizationRecommendations.vue` — import of response types fixed from `@/features/ai-tools/types` → `@/features/ai-tools/ai-analysis/types`
- `features/ai-tools/prompts/business-context.ts` — `BusinessContext` import fixed to `@/features/ai-tools/ai-analysis/types`
- `features/ai-tools/ai-connection/utils/error-handling.ts` — `min-campaigns` entry added to both `ERROR_MESSAGES` and `ERROR_HINTS`
- `features/ai-tools/mocks/executive-summary-mocks.ts` — unescaped apostrophe in string literal fixed (outer quotes changed to double quotes)
- `features/ai-tools/ai-analysis/components/budget-optimization/BudgetOptimizationAnalysis.vue`, `executive-summary/ExecutiveSummaryAnalysis.vue` — `:error-fallback` → `:notice` to match renamed prop in `AnalysisState`
- `features/ai-tools/prompts/budget-optimization-prompt copy.ts`, `executive-summary-prompt copy.ts` — deleted (accidental Finder duplicates; not referenced anywhere)

**Key decisions & why:**
- Same-directory `./foo` imports left as-is — they don't benefit from an alias and are already unambiguous
- Double-quoted imports handled in a second pass to catch provider utils that used `"../..."` style
- Pre-existing type errors fixed inline rather than deferred — the build must be clean after a refactor


## [#292] Rename `common/` folder to `shared/`
**Type:** refactor

**Summary:** Renamed `src/common/` to `src/shared/` and updated all `@/common/` imports across the codebase to `@/shared/`.

**Brainstorming:** The folder name `common` is ambiguous — it could mean anything generic. `shared` more clearly communicates that this module contains domain types, utilities, and logic shared across features (dashboard, data-transfer, AI tools, stores). Since all imports were already migrated to use the `@/` alias in the previous session, this was a clean two-step operation: rename the folder and bulk-replace the import prefix.

**Prompt:** Rename the `common` folder to `shared`. Update all imports accordingly and update CLAUDE.md.

**What changed:**
- `app/src/common/` → `app/src/shared/` — folder rename; no file contents changed
- 33 `.ts` and `.vue` files — `@/common/` import prefix replaced with `@/shared/`
- `CLAUDE.md` — architecture section updated (`common/` → `shared/` in all references)

**Key decisions & why:**
- Bulk sed on the entire `src/` tree rather than file-by-file — safe because every cross-folder import already used the `@/` alias; no relative paths remained to confuse the replace pattern
- TypeScript reported zero errors after the rename — confirms no missed references


## [#293] Rename store files to `.store.ts` pattern
**Type:** refactor

**Summary:** Renamed all four store files to use the `<name>.store.ts` convention, matching the explicit file-type suffix pattern already used for `.vue` components.

**Brainstorming:** `campaignStore.ts` bundles the role ("store") into the identifier, making it redundant when the function name (`useCampaignStore`) already signals that. The `<name>.store.ts` pattern separates the domain name from the file type, aligns with common Vue/Pinia conventions, and makes the role scannable at a glance in a file tree without reading the function export.

**Prompt:** Rename aiConnectionStore to aiConnection.store.ts. Apply the same pattern to the rest of the stores.

**What changed:**
- `aiConnectionStore.ts` → `aiConnection.store.ts`
- `aiAnalysisStore.ts` → `aiAnalysis.store.ts`
- `campaignStore.ts` → `campaign.store.ts`
- `toastStore.ts` → `toast.store.ts`
- 14 `.ts` and `.vue` files — import paths updated to match new filenames
- `CLAUDE.md` — architecture section updated with new filenames

**Key decisions & why:**
- Sed on import path segments (`/campaignStore` → `/campaign.store`) rather than full paths — handles both `@/stores/` and `./stores/` forms without needing separate patterns
- Internal self-references inside store files (e.g. `aiConnectionStore.ts` importing `toastStore`) were caught by the same bulk replace


## [#294] Remove pass-through barrel files project-wide
**Type:** refactor

**Summary:** Deleted 10 barrel index.ts files that were pure pass-throughs with no real module API value, and updated all import sites to use direct file paths.

**Brainstorming:** Flat utility/type folders benefit from deep imports — each consumer's import line is self-documenting about exactly what it depends on, there's no extra file to maintain, and circular imports can't sneak through a pass-through. An audit of all 24 barrel files in the project identified 10 candidates for removal: 6 with zero imports (outright dead) and 4 that were used but added no curation. The remaining 14 barrels serve as real module API boundaries (type hubs, feature public surfaces, UI library entry points) and were left in place.

**Prompt:** Audit all barrel index.ts files in the project. Delete the ones that are pure pass-throughs or unused. Update all import sites to use direct file paths. Keep barrels that serve as real module API boundaries.

**What changed:**
- Deleted: `ai-tools/index.ts` (empty), `ai-connection/components/index.ts`, `ai-connection/stores/index.ts`, `ai-connection/utils/index.ts`, `ai-analysis/components/index.ts`, `ai-analysis/utils/index.ts`, `mocks/index.ts`, `providers/gemini/index.ts`, `providers/qroq/index.ts`, `ui/forms/index.ts`
- `stores/aiAnalysis.store.ts` — split `ai-analysis/utils` import into two direct imports (`analysis-prompt`, `utils`)
- `ui/index.ts` — replaced `export * from './forms'` with three direct `.vue` component exports
- 9 other `.ts`/`.vue` files — import paths updated to direct file targets
- `CLAUDE.md` — architecture section updated to remove deleted barrel entries

**Key decisions & why:**
- `ui/index.ts` needed a manual fix: it re-exported `./forms` which pointed at the now-deleted barrel; replaced with explicit named exports for the three form components so the UI library public API is unchanged for consumers
- `ai-analysis/utils` had four wildcard re-exports from different files; the single import site needed two separate lines since `runAnalysisPrompt` and `getCacheKey` live in different source files


## [#295] Restore gemini and qroq provider barrel files
**Type:** fix

**Summary:** Recreated the deleted `index.ts` barrels for `providers/gemini/` and `providers/qroq/` after the barrel removal pass broke the Vite dev build with an unresolved import error.

**Brainstorming:** The previous barrel audit classified these two as "0 imports" and deleted them. But `connect-provider.ts` and `run-provider-prompt.ts` both import from `"./gemini"` and `"./qroq"` using folder-style resolution — which requires an `index.ts` to exist. Without it Vite throws a "Failed to resolve import" error at startup. The fix is to restore the barrels with only the exports actually consumed by those two callers.

**Prompt:** The Vite dev server throws "Failed to resolve import './gemini'" from connect-provider.ts. The gemini/index.ts and qroq/index.ts barrel files were deleted in the last session. Put them back, exporting only what the callers need.

**What changed:**
- `app/src/features/ai-tools/providers/gemini/index.ts` — recreated; exports `connectGemini` from `./connect` and `requestGeminiChatCompletion` from `./api`
- `app/src/features/ai-tools/providers/qroq/index.ts` — recreated; exports `connectGroq` from `./connect` and `requestGroqChatCompletion` from `./api`

**Key decisions & why:**
- Both barrels export the full public surface of their module (connect + api functions) rather than only the currently-used subset, so future callers don't need to know the internal file split
- TypeScript type check (`tsc --noEmit`) confirmed clean after recreation


## [#296] Fix broken named import of AiAnalysis.vue in AiToolsContent
**Type:** fix

**Summary:** Corrected a broken named import `{ AiAnalysis }` that was left behind when the `ai-analysis/components/index.ts` barrel was deleted — Vue SFCs are default exports, not named exports.

**Brainstorming:** The barrel removal pass updated the import path to point directly at `AiAnalysis.vue` but kept the curly-brace named import syntax from the barrel. At runtime Vite resolved the file but found no named export called `AiAnalysis`, causing a blank screen. The fix is a one-line change from `{ AiAnalysis }` to `AiAnalysis` (default import).

**Prompt:** The app shows a blank screen after the barrel removal. Running `vite build` reveals: "AiAnalysis is not exported by AiAnalysis.vue" in AiToolsContent.vue. Fix the import.

**What changed:**
- `app/src/features/ai-tools/components/AiToolsContent.vue` — line 5: changed `import { AiAnalysis }` to `import AiAnalysis` (default import for Vue SFC)

**Key decisions & why:**
- Vue SFCs always use default exports; named re-exports of SFCs are only possible through an intermediate barrel — without the barrel the import must be a default import


## [#297] Dashboard layout refinements and upload modal flow improvements
**Type:** update

**Summary:** Refined the dashboard grid layout and table card styling in DashboardView, tightened the upload form layout and footer button ordering in UploadCampainData, and hardened the multi-step upload navigation logic in UploadModal.

**Brainstorming:** Three files were modified as a set of incremental UI/UX improvements. DashboardView needed the table section to be properly bounded (max width, max height) with its title styled distinctly from card body text. UploadCampainData needed a constrained width for the form body and a responsive footer that reorders buttons at the xs (480px) breakpoint rather than stacking them awkwardly. UploadModal's back/proceed navigation needed to be bidirectional — going back from the duplicates step should return to the row-errors step if that step was traversed, not always to the form.

**Prompt:** Make the following three targeted changes:

1. **DashboardView.vue** — Convert the dashboard wrapper to a CSS grid with three rows (header / filter / scrollable content): `grid grid-cols-1 grid-rows-[min_content-min-content_1fr]` with `pt-5 gap-y-5`. Give `.data-visualization` `px-4 pb-6` padding plus `container-type: inline-size` (inline style, not @apply — not a Tailwind utility). Change the table card div to `class="card table-card max-h-full mx-auto max-w-7xl w-full"` and give its `<h3>` `class="card-title table-card-title"`. Add a scoped style `card-title.table-card-title { @apply text-base shrink-0 font-normal text-primary-300; }`.

2. **UploadCampainData.vue** — Make it a multi-root component: template root is two sibling divs (`form-body` + `modal-footer`). Add scoped style `.form-body { @apply p-6 overflow-y-auto w-[90vw] max-w-2xl; }`. In the footer, the Upload button has no extra order class (stays first); Download Template gets `xs:order-3 xs:mr-auto`; Cancel gets `xs:order-2 min-w-24`. This reorders the footer at the 480px (`xs`) breakpoint: Upload | Cancel | Download Template (Download pushed to the right via `mr-auto`). File selection goes through `handleFileSelect(f)` which calls `isValidCsvFile(f)` from `parse-csv` — sets `fileError` and emits `update:file` with `null` on invalid type, clears error and emits the file on valid. Props: `title: string`, `file: File | null`, `parseError: string`, `isLoading: boolean`. Emits: `update:title`, `update:file`, `submit`, `close`, `downloadTemplate`.

3. **UploadModal.vue** — Lift all form state (`title`, `file`, `parseError`, `isLoading`) to the modal level so it survives view switches; `watch(file, () => { parseError.value = '' })` clears parse error on file change. Implement bidirectional navigation: `handleBackFromDuplicates` checks `rowErrors.value.length > 0` — if true, return to `row-errors` view; if false, return to `form` and clear `validCampaigns` + `duplicateGroups`. `handleProceedFromDuplicates(selected: Campaign[])` calls `campaignStore.loadCampaigns(pendingTitle.value, [...validCampaigns.value, ...selected])` — merges the valid campaigns from the row-errors step with the user's selected duplicate resolutions. `handleProceedFromErrors` checks `duplicateGroups.value.length > 0` — if true, advance to `duplicate-rows`; if false, load and close. `close()` resets all state: `view = 'form'`, clears title/file/parseError/rowErrors/validCampaigns/duplicateGroups.

**What changed:**
- `app/src/features/dashboard/DashboardView.vue` — grid layout for dashboard wrapper; table card sizing + scoped title color style
- `app/src/features/data-transfer/components/UploadCampainData.vue` — multi-root template; constrained form-body width; xs-breakpoint footer button reordering; file validation via `isValidCsvFile`
- `app/src/features/data-transfer/components/UploadModal.vue` — lifted form state; bidirectional back navigation (duplicates → row-errors → form); proceed-from-duplicates merges valid + selected campaigns

**Key decisions & why:**
- `xs:order-*` on footer buttons rather than flex-direction reversal: allows Upload to remain first in DOM (accessible tab order) while reordering visually at wider widths
- `handleBackFromDuplicates` checks `rowErrors` length rather than tracking a navigation stack: the two-step flow is linear enough that checking state is simpler than a history array
- `validCampaigns` and `selected` are spread into a new array in `handleProceedFromDuplicates` rather than mutating — avoids ref side-effects when `close()` later clears `validCampaigns.value`


## [#298] Install xxhashjs and hash cache keys deterministically
**Type:** update

**Summary:** Replaced the plain-string cache key in `getCacheKey` with a deterministic 64-bit xxHash, so identical inputs always produce the same compact hex key.

**Brainstorming:** The existing key was a readable concatenated string (`provider::ch1|ch2`). For caching correctness this already worked, but hashing gives a fixed-length opaque key regardless of how many channel IDs are present. xxhashjs was chosen because it is pure JavaScript (browser-compatible with Vite), synchronous, and exposes an `h64` API matching the intended `hash64` use. The seed is fixed at 0 for full determinism.

**Prompt:** Install and implement a hash function to hash cache keys — create the same hash key from the same input each time.

**What changed:**
- `app/package.json` — added `xxhashjs` (dependency) and `@types/xxhashjs` (dev dependency)
- `app/src/features/ai-tools/ai-analysis/utils/utils.ts` — imports `XXH` from `xxhashjs`; `getCacheKey` now builds the raw key string internally then returns `XXH.h64(raw, 0).toString(16)` — a 16-char hex string

**Key decisions & why:**
- Seed fixed at `0` via named constant `HASH_SEED` — any non-zero seed would produce different hashes on different builds with no benefit here
- Raw string still constructed the same way (sorted channel IDs, lowercased provider) — hashing is applied on top of the same normalization logic, not as a replacement for it
- `xxhashjs` over inline FNV/djb2 — user asked to install a package; xxhash is a well-known algorithm with type definitions available


## [#299] portfolioData.store architecture — brainstorm + implementation
**Type:** architecture

**Summary:** Introduced `portfolioData.store` as a dedicated data layer for portfolio entries, refactored `campaign.store` into a selection/filter layer, updated `aiAnalysis.store` to use a nested per-portfolio cache, and wired the upload flow directly to `portfolioData.store`.

**Brainstorming:** Extensive multi-turn design session covering: store location (app-level `stores/` — no feature owns this data yet); `PortfolioEntry` shape (id via `crypto.randomUUID()`, title, channelMap, `fullAnalysis` pre-computed at add time, uploadedAt); no raw campaigns stored (channel map already contains them via `Channel.campaigns`); `fullAnalysis` pre-computed once at upload time so full-portfolio view never recomputes and future portfolio comparison arrives with analysis ready; selection signal pattern — `pendingSelectionId` ref on `portfolioData.store` watched by `campaign.store` with `{ immediate: true }` (handles both first upload and replace without the array-length-stays-same atomicity bug); `lastEvictedId` signal for explicit user-initiated delete (future); nested `Map<portfolioId, Map<cacheKey, CacheEntry>>` in `aiAnalysis.store` so switching portfolios preserves cached AI responses (each portfolio's results are retrievable when switching back); `getCacheKey` signature unchanged — portfolioId is the outer map key, not part of the hash; portfolio switch triggers `onPortfolioSwitch` (resets display + flags, cache preserved); filter watcher double-guarded on `analysisActivated` + `firstAnalyzeCompleted` to prevent spurious auto-calls during portfolio switch; `clearStateForNewCSV` removed — replaced by portfolio switch watcher; `data-transfer` writes to `portfolioData.store` directly (mechanism-agnostic — future API fetch works the same way); `campaign.store` watches signals reactively, never writes to `portfolioData.store`; `aiAnalysis.store` watches `activePortfolioId` + `lastEvictedId` reactively. IndexedDB noted as future cache persistence layer (TODO).

**Prompt:** Introduce a portfolioData.store as a data layer holding PortfolioEntry objects (id, title, channelMap, fullAnalysis, uploadedAt). Refactor campaign.store into a selection/filter layer that watches portfolioData signals. Update aiAnalysis.store to use nested per-portfolio cache. Wire UploadModal to portfolioData.store directly. Preserve all existing public APIs of campaign.store so no dashboard components change.

**What was built:**
- `app/src/stores/portfolioData.store.ts` — new store; `PortfolioEntry` interface exported; `addPortfolio`, `replacePortfolio`, `loadPortfolio` (delegates), `deletePortfolio`, `getById` actions; `pendingSelectionId` + `lastEvictedId` signals; `buildChannelMap` + `computePortfolioAnalysis` called at write time; DEV_MOCK block initialises mock portfolio on first load
- `app/src/stores/campaign.store.ts` — `activePortfolioId` ref added; `portfolioChannels` + `title` converted from direct state to computeds derived from active portfolio entry; `portfolioAnalysis` short-circuits to `entry.fullAnalysis` when no filter; watchers on `pendingSelectionId` (immediate) and `lastEvictedId`; `loadCampaigns` removed; all existing computed names/types preserved
- `app/src/stores/aiAnalysis.store.ts` — cache type changed to `Map<string, Map<string, CacheEntry>>`; `getCacheEntry` + `setCacheEntry` helpers scope all cache access to `activePortfolioId`; `onPortfolioSwitch` internal function (cancel + reset flags + show cached or idle, no cache clear); watcher on `activePortfolioId` → `onPortfolioSwitch`; watcher on `lastEvictedId` → delete portfolio cache entry; filter watcher adds `firstAnalyzeCompleted` guard; `clearStateForNewCSV` removed from public API; campaigns watcher removed
- `app/src/features/data-transfer/composables/useUploadModal.ts` — `hasCampaigns` now reads `portfolioData.portfolios.length`; `useCampaignStore` import removed
- `app/src/features/data-transfer/components/UploadModal.vue` — all three `loadCampaigns` call sites replaced with `portfolioData.loadPortfolio(campaigns, title)`

**Key decisions & why:**
- `pendingSelectionId` signal over length watch — delete+add (replace) leaves array length unchanged so the length watcher would never fire; a dedicated signal is unambiguous and works for both add and replace
- `fullAnalysis` on `PortfolioEntry` — computed once at upload time; short-circuit in `portfolioAnalysis` computed avoids recomputation on filter clear; future portfolio comparison has both sides pre-computed
- Nested cache by portfolioId — switching portfolios preserves LLM responses; switching back to a previous portfolio restores its cached results; only explicit `deletePortfolio` evicts a portfolio's cache
- `getCacheKey` unchanged — portfolioId scoping is handled by the outer map, not by changing the hash input
- Filter watcher double guard — `analysisActivated` was already checked; adding `firstAnalyzeCompleted` closes the timing window where a portfolio switch (which changes `selectedChannelsIds` to `[]`) could trigger a spurious debounced auto-call before `onPortfolioSwitch` resets the flag
- `data-transfer` writes directly to `portfolioData.store` with no store in `data-transfer` — the upload feature is a write mechanism; future API fetches would follow the same pattern


## [#300] Add ROI by Channel chart to dashboard
**Type:** feature

**Summary:** Added a horizontal bar chart showing ROI by channel, placed immediately after the existing ROI by campaign chart in DashboardCharts.vue.

**Brainstorming:** Reused the existing `BarChart` component in horizontal mode — same pattern as ROI by campaign. Data comes from the `channels` prop already passed to `DashboardCharts.vue` (each `Channel` carries `roi` via `PerformanceMetrics`). Colors assigned from `CHART_COLORS` by index, matching the per-channel visual language used elsewhere (Revenue vs Budget chart). No new components needed.

**Prompt:** Add a ROI by channel horizontal bar chart to the dashboard, placed after the ROI by campaign chart.

**What changed:**
- `app/src/features/dashboard/components/DashboardCharts.vue` — added `roiChannelChartData` computed (maps `channels` to ROI % values with `CHART_COLORS` by index); inserted "ROI by Channel" card between ROI by campaign and Budget Allocation cards

**Key decisions & why:**
- Horizontal bar chart — matches ROI by campaign visual style and keeps channel names readable on the Y axis
- `CHART_COLORS` by channel index — consistent with the existing per-channel color convention; `campaignColorMap` is campaign-keyed so a separate index-based mapping is cleaner here


## [#301] Add Chart.js conversion funnel for comparison
**Type:** feature

**Summary:** Created a Chart.js-based funnel chart (FunnelBarChart.vue) as an alternative to the existing custom HTML/SCSS FunnelChart, and rendered both on the dashboard so the user can compare and decide which to keep.

**Brainstorming:** Chart.js has no native funnel type, so the closest equivalent is a horizontal bar chart — impressions/clicks/conversions naturally produce a funnel shape since values decrease at each stage. The existing FunnelChart uses cube-root width scaling and inline rate labels; the Chart.js version shows drop rates (CTR/CVR) in the tooltip via the afterLabel callback instead. Same FUNNEL_COLORS used for visual consistency. Both components share the same labels/values prop interface so they are drop-in interchangeable.

**Prompt:** Create a Chart.js-based conversion funnel chart (FunnelBarChart.vue) using a horizontal bar chart. Keep both the existing FunnelChart and the new FunnelBarChart visible in DashboardCharts.vue so the user can compare them.

**What was built:**
- `app/src/ui/charts/FunnelBarChart.vue` — new component; horizontal Bar chart; FUNNEL_COLORS per bar; `rates` computed for CTR/CVR drop rates; tooltip `afterLabel` callback shows rate label + value; X axis ticks formatted K/M; same `labels`/`values` props as FunnelChart
- `app/src/ui/charts/index.ts` — added `FunnelBarChart` export
- `app/src/features/dashboard/components/DashboardCharts.vue` — imported `FunnelBarChart`; added "Conversion Funnel (Chart.js)" card after existing funnel card

**Key decisions & why:**
- Horizontal bar over vertical — matches funnel reading direction (top to bottom = Impressions → Clicks → Conversions) and keeps stage labels readable
- Drop rates in tooltip rather than inline — Chart.js bar charts don't have a clean way to render inline labels without the datalabels plugin; tooltip afterLabel is dependency-free and unambiguous
- Both charts kept simultaneously — user explicitly requested side-by-side comparison before deciding which to remove


## [#302] Add step and stacked funnel chart variants
**Type:** feature

**Summary:** Created two more Chart.js funnel chart alternatives (FunnelStepChart and FunnelStackedChart) and added them to the dashboard alongside the existing two, so all four variants are visible for comparison.

**Brainstorming:** Step chart uses Chart.js Line with `stepped: true` and fill below — the cliff drops between stages make drop-off viscerally clear; good for "shock" communication of funnel loss. Stacked progression uses a horizontal stacked bar with Progressed (green) + Dropped (red) datasets per stage — every bar sums to the full stage total, making conversion rates readable as proportions; better for analytical audiences. `LineElement`, `PointElement`, and `Filler` were not registered; added them to register.ts. Stacked tooltip uses `afterBody` (fires once per tooltip, not per dataset) to show the progression rate for the hovered stage.

**Prompt:** Add a step line chart and a stacked progression bar chart as additional conversion funnel variants. Register the missing Chart.js elements. Keep all four funnel charts visible on the dashboard.

**What was built:**
- `app/src/ui/charts/register.ts` — added LineElement, PointElement, Filler registrations
- `app/src/ui/charts/FunnelStepChart.vue` — Line chart, stepped: true, fill below with semi-transparent indigo; Y axis ticks formatted K/M; tooltip afterLabel shows CTR/CVR per stage
- `app/src/ui/charts/FunnelStackedChart.vue` — stacked horizontal Bar; Progressed + Dropped datasets; progression rate shown via tooltip afterBody; legend at bottom
- `app/src/ui/charts/index.ts` — exported FunnelStackedChart and FunnelStepChart
- `app/src/features/dashboard/components/DashboardCharts.vue` — imported and rendered both new components as additional chart cards

**Key decisions & why:**
- `stepped: true` (not 'before'/'after') — centers the step transition at the midpoint between stages, giving a balanced look rather than holding the line until the last moment
- `afterBody` in stacked tooltip — fires once per tooltip group rather than once per dataset (afterLabel), avoids the progression rate appearing twice
- Dropped dataset opacity 0.45 — muted intentionally so the green "progressed" portion reads as the primary signal


## [#303] Normalize FunnelBarChart values and show actual values as bar labels
**Type:** update

**Summary:** Updated FunnelBarChart to use normalized values (% of impressions) so all bars are visually comparable, and added chartjs-plugin-datalabels to render formatted actual values inside each bar.

**Brainstorming:** Raw values (impressions=1M, conversions=~1.4K) make the bottom bars invisible at scale — normalization fixes this. chartjs-plugin-datalabels is the standard Chart.js solution for on-bar text; registered per-instance via the `:plugins` prop on the Bar component so other charts are unaffected. Anchor 'start' + align 'end' + clamp: true places labels at the left of each bar reading rightward, clamped to stay inside even for very short bars. Tooltip updated to show normalized %, actual value, and CTR/CVR rate.

**Prompt:** Use normalized values (% of impressions) for FunnelBarChart so bars are visually comparable. Display formatted actual values (K/M notation) on the bars. Install chartjs-plugin-datalabels.

**What changed:**
- `app/package.json` / `package-lock.json` — added chartjs-plugin-datalabels dependency
- `app/src/ui/charts/FunnelBarChart.vue` — `normalized` computed maps values to % of first value; chartData uses normalized values; X axis fixed 0–100 with `%` tick suffix; ChartDataLabels imported and passed via `:plugins`; datalabels config: anchor start, align end, clamp true, formatter returns formatActual(rawValue); tooltip label shows normalized %, afterLabel shows actual + rate

**Key decisions & why:**
- Per-instance plugin registration — avoids polluting all other charts with datalabels; Chart.js global registration would require every other chart to explicitly opt out
- `values[0]` as the normalization base — impressions is always the first (and largest) stage; using max() would be equivalent but fragile if order changed
- `clamp: true` — prevents label overflow on the very short conversions bar without needing conditional positioning logic


## [#304] Remove Chart.js funnel variants — keep original FunnelChart
**Type:** update

**Summary:** Removed all three Chart.js funnel alternatives (FunnelBarChart, FunnelStepChart, FunnelStackedChart) after user chose the original custom HTML/SCSS FunnelChart as the best visual.

**Brainstorming:** No trade-offs — user decision after seeing all four side by side.

**Prompt:** Keep only the original FunnelChart. Remove the three Chart.js variants, their files, exports, registrations, and the chartjs-plugin-datalabels dependency.

**What changed:**
- Deleted `app/src/ui/charts/FunnelBarChart.vue`, `FunnelStepChart.vue`, `FunnelStackedChart.vue`
- `app/src/ui/charts/register.ts` — removed LineElement, PointElement, Filler registrations
- `app/src/ui/charts/index.ts` — removed FunnelBarChart, FunnelStepChart, FunnelStackedChart exports
- `app/src/features/dashboard/components/DashboardCharts.vue` — removed all three imports and their chart cards
- `app/package.json` / `package-lock.json` — uninstalled chartjs-plugin-datalabels

**Key decisions & why:**
- Full removal rather than keeping files unused — no orphaned code


## [#305] RevVsBudgetChart — toggle between Budget vs Revenue and Efficiency Gap views
**Type:** feature

**Summary:** Extracted "Revenue vs Budget by Channel" into a dedicated component with a view toggle (Budget vs Revenue / Efficiency Gap), and added `gapAmount` to `ShareEfficiency` so the euro gap propagates across all portfolio analysis models.

**Brainstorming:** The toggle needed two distinct chart configs — the grouped bars view uses the standard legend + Amount (€) axis, while the gap view needs per-bar green/red coloring by sign, no legend, Gap (%) axis, and euro amounts visible without hover. Evaluated two options for showing euros on the gap chart: (1) tooltip-only — cleaner axis but requires hover, (2) x-axis label strings including the euro gap — always visible, slightly busier. Chose (2). For the chart component, direct `Bar` from vue-chartjs is simpler than adding an `extraOptions` escape hatch to `GroupedBarChart`. `RadioToggle` already exists and fits the 2-option toggle exactly. `gapAmount` (`revenue - budget`) added to `ShareEfficiency` so AI prompts and analysis signals carry the absolute EUR gap alongside the share-based `efficiencyGap`.

**Prompt:** Update Revenue vs Budget by Channel. Add a toggle [ Budget vs Revenue ] (default) [ Efficiency Gap ]. Amount (€) → Gap (%). Labels for gap chart should include value in euros. Create a component for this chart to handle view switch. Also add the gap in euros in the campaign analysis calculations and update all models.

**What was built / What changed:**
- `app/src/features/dashboard/components/RevVsBudgetChart.vue` — new component; owns `view` ref (ChartView union); `TOGGLE_OPTIONS` drives RadioToggle; `revVsBudgetData` + `revVsBudgetOptions` for grouped view; `efficiencyGapData` (x-axis labels include `+€N` / `-€N`, per-bar colors by sign) + `gapOptions` (Gap (%) axis, no legend) for gap view; renders `Bar` directly from vue-chartjs
- `app/src/features/dashboard/components/DashboardCharts.vue` — removed `revVsBudgetData` computed and `GroupedBarChart` import; added `RevVsBudgetChart` import; replaced the inline card body with `<RevVsBudgetChart>`
- `app/src/shared/types/campaign.ts` — `ShareEfficiency` gains `gapAmount: number` (revenue − budget in EUR)
- `app/src/shared/utils/campaign-performance.ts` — `computeShareEfficiency` computes `gapAmount: item.revenue - item.budget`
- `app/src/shared/portfolio-analysis/utils.ts` — all 5 explicit `ShareEfficiency` object literals updated to include `gapAmount` from the parent summary object

**Key decisions & why:**
- `Bar` directly rather than extending `GroupedBarChart` — the gap view has fundamentally different options; an escape-hatch prop would bleed app-specific logic into the UI library
- Euro amount in axis label string — always visible without requiring hover; implemented as `${ch.name} (+€N)` format with explicit `+` prefix for positive values
- `gapAmount` on `ShareEfficiency` rather than a separate field — all signal types extend `ShareEfficiency`, so a single change propagates to `CampaignSummary`, `ChannelSummary`, `InefficientChannelSignal`, `InefficientCampaignSignal`, `BudgetScalingCandidate`, `ScalingCandidateSignal`


## [#306] Rename CAC → CPA across all models and UI
**Type:** fix

**Summary:** Corrected a metric naming error — the formula `budget / conversions` is CPA (Cost Per Acquisition), not CAC (Customer Acquisition Cost); renamed the field and all references across types, utils, UI, prompts, and mocks.

**Brainstorming:** Pure rename — no logic changes. Scope covered: `PerformanceMetrics.cac` → `cpa`, `PortfolioKPIs.aggregatedCAC` → `aggregatedCPA`, all downstream KPI card and table labels, and all "CAC" string occurrences in AI prompts and mock responses. Legacy prompt files kept compilable with the rename applied. `channel.ts` description updated in CLAUDE.md (no code change needed there — Channel inherits from PerformanceMetrics).

**Prompt:** CAC formula is actually CPA. Rename cac → cpa in models and update UI too.

**What changed:**
- `app/src/shared/types/campaign.ts` — `PerformanceMetrics.cac` → `cpa`; `PortfolioKPIs.aggregatedCAC` → `aggregatedCPA`
- `app/src/shared/utils/campaign-performance.ts` — `cac:` → `cpa:` in `computePerformanceMetrics`; destructured `cac` → `cpa` and `aggregatedCAC` → `aggregatedCPA` in `computePortfolioKPIs`
- `app/src/features/dashboard/components/DashboardKpis.vue` — label "CAC" → "CPA"; `kpis.aggregatedCAC` → `kpis.aggregatedCPA`
- `app/src/features/dashboard/components/CampaignTable.vue` — column key `cac` → `cpa`; label "CAC" → "CPA"; ariaLabel "Customer acquisition cost" → "Cost per acquisition"; `c.cac` → `c.cpa`
- `app/src/features/ai-tools/mocks/executive-summary-mocks.ts` — all "CAC" string occurrences → "CPA"
- `app/src/features/ai-tools/prompts/executive-summary-prompt2.ts` — all "CAC" string occurrences → "CPA"
- `app/src/features/ai-tools/prompts/executive-summary-prompt.ts` (legacy) — all "CAC" string occurrences → "CPA"
- `app/src/features/ai-tools/prompts/budget-optimization-prompt.ts` (legacy) — all "CAC" string occurrences → "CPA"; local `CampainSummaryTotals.cac` → `cpa`

**Key decisions & why:**
- No logic change — the formula `budget / conversions` is correct, only the name was wrong
- Legacy prompt files updated for consistency even though they are unused — kept compilable


## [#307] Efficiency Gap chart — move euro gap from x-axis labels to tooltip
**Type:** fix

**Summary:** Removed the inline euro gap from efficiency gap x-axis labels and moved it into a tooltip `afterLabel` callback instead.

**Brainstorming:** The euro gap embedded in the label (`Email (+€1,234)`) cluttered the x-axis and made rotation labels harder to read. Tooltip is the correct place for supplementary detail — the label should only identify the channel.

**Prompt:** Efficiency gap chart should not show gap amount in labels, only on tooltips.

**What changed:**
- `app/src/features/dashboard/components/RevVsBudgetChart.vue` — `efficiencyGapData` labels simplified to `ch.name` only; `gapOptions` extended with `tooltip.callbacks.afterLabel` that returns `Gap: +€X` or `Gap: -€X` for the hovered channel

**Key decisions & why:**
- Used `afterLabel` callback (renders on a separate line below the percentage value) so the euro gap supplements rather than replaces the primary value
- Spread `basePlugins.tooltip` inside the override to preserve dark-theme tooltip styling


## [#308] Efficiency Gap chart — format axis ticks and tooltip values as percentages
**Type:** fix

**Summary:** Y-axis tick labels and tooltip primary value in the Efficiency Gap chart now display with a `%` suffix instead of raw numbers.

**Brainstorming:** The raw number on the axis (e.g. `12.5`) was ambiguous without the unit. Adding a `ticks.callback` to format axis labels as `N.N%` and a `tooltip.callbacks.label` to show `N.NN%` makes the chart self-explanatory. The euro gap remains in `afterLabel` unchanged.

**Prompt:** Efficiency gap should be a percentage — axis as well.

**What changed:**
- `app/src/features/dashboard/components/RevVsBudgetChart.vue` — `gapOptions.scales.y.ticks.callback` formats axis ticks as `N.N%`; `gapOptions.plugins.tooltip.callbacks.label` formats the hovered value as `N.NN%`

**Key decisions & why:**
- Axis ticks use 1 decimal (`toFixed(1)`) for readability at small label size; tooltip uses 2 decimals (`toFixed(2)`) for precision on hover


## [#309] ROI vs CPA — Decision Quadrants scatter chart
**Type:** feature

**Summary:** Added a full-width scatter chart above the campaign table that plots each campaign by ROI (y-axis) vs CPA (x-axis), split into four color-coded decision quadrants divided by portfolio average reference lines.

**Brainstorming:** Considered a bubble chart with budget-encoded size but concluded that position (ROI vs CPA) carries the decision signal and bubble size would add cognitive load without proportionate value. Quadrant coloring (green/yellow/indigo/red) gives immediate actionability without reading axis values. Four datasets (one per quadrant) provide a built-in legend with action labels. Custom inline Chart.js plugin draws quadrant background tints and dashed reference lines at aggregatedROI / aggregatedCPA without needing the annotation plugin. PointElement was missing from Chart.js registration — added it to register.ts as Scatter requires it.

**Prompt:** Create a ROI vs CPA scatter chart above the campaign table occupying full width. Colored scatter + quadrants + reference lines, no bubble sizing.

**What was built:**
- `app/src/ui/charts/register.ts` — added `PointElement` import and registration (required by Scatter chart type)
- `app/src/features/dashboard/components/RoiCpaScatter.vue` — new component; Scatter from vue-chartjs; 4 datasets keyed by quadrant (Scale aggressively / Optimize cost / Improve funnel / Cut or rethink); inline `quadrantPlugin` draws colored background tints + dashed reference lines at portfolio avg ROI and avg CPA; tooltip shows campaign name, channel, ROI%, CPA€; axis ticks formatted with formatCurrency (x) and formatPercentage (y)
- `app/src/features/dashboard/DashboardView.vue` — imported RoiCpaScatter; inserted full-width between DashboardCharts and the campaign table card

**Key decisions & why:**
- 4 datasets rather than 1 with per-point colors: Chart.js legend entry per dataset gives action labels (Scale/Optimize/Improve/Cut) for free
- Custom plugin reads `props.kpis` directly on each `beforeDraw` call — no computed needed, always uses latest values, avoids plugin re-registration
- No bubble sizing: position alone tells the story; size added noise vs value for this dataset size
- PointElement added globally in register.ts rather than locally — consistent with the existing registration pattern for all other Chart.js elements


## [#310] RoiCpaScatter — fix chart not filling card width
**Type:** fix

**Summary:** Chart wrapper div was missing `w-full` — added the class so the Scatter canvas fills the full card width.

**Brainstorming:** Chart.js `responsive: true` fills the container, but the container div only had a height set and no width, so it defaulted to content width. Adding `w-full` gives it 100% width for the canvas to fill.

**Prompt:** The chart does not cover all the width of the card.

**What changed:**
- `app/src/features/dashboard/components/RoiCpaScatter.vue` — added `class="w-full"` to the chart height-wrapper div

**Key decisions & why:**
- Single class addition; no structural change needed


## [#311] RoiCpaScatter — log scale ROI axis + visible campaign labels
**Type:** update

**Summary:** Y-axis now uses a log1p transform for better separation of closely-clustered ROI values, and campaign names are drawn directly on the chart next to each point.

**Brainstorming:** Chart.js native logarithmic scale only handles positive values; since ROI can be negative, used Math.log1p / Math.expm1 transform on a linear scale instead. log1p(x) = ln(1+x) is defined for x > -1 (ROI cannot be worse than -100%). The transform is monotonic so quadrant assignment logic is unchanged. Visible labels drawn in afterDraw via canvas fillText — no extra plugin dependency needed.

**Prompt:** ROI axis should use log scale; add visible campaign name labels on the chart.

**What changed:**
- `app/src/features/dashboard/components/RoiCpaScatter.vue` — added `roi` field to ScatterPoint (original value for tooltip); `y` stores `logRoi(c.roi)` = Math.log1p(clamped); quadrantPlugin.beforeDraw uses `logRoi(avgRoi)` for the y reference line pixel; quadrantPlugin.afterDraw draws campaign name labels via ctx.fillText colored by dataset border; y-axis ticks callback reverses with Math.expm1; tooltip uses p.roi (original); axis title updated to "ROI (log scale)"; CHART_HEIGHT increased to 420

**Key decisions & why:**
- Math.log1p transform rather than Chart.js logarithmic type — handles negative ROI values cleanly
- Clamp at -0.999 in logRoi helper to avoid log(0) = -Infinity for near-total-loss campaigns
- afterDraw for labels rather than chartjs-plugin-datalabels — no extra dependency, full control; labels offset 9px right and 3px up from the point center


## [#312] RoiCpaScatter — quadrant labels on chart + bubble sizing by budget
**Type:** update

**Summary:** Added in-chart quadrant corner labels (Scale / Optimize / Improve / Cut) and switched from Scatter to Bubble chart with bubble radius scaled from campaign budget.

**Brainstorming:** Quadrant labels drawn in beforeDraw after backgrounds — positioned at the top-left corner of each quadrant using the same i%2/i<2 index logic used for background rects. Short labels (tag field) used on chart; full labels (label field) kept for the legend. Bubble radius: MIN_R=5 to MAX_R=28 pixels, linearly scaled from budget share of maxBudget in the filtered set. Campaign name labels in afterDraw now offset by r+4 from point center so they clear the bubble edge regardless of size.

**Prompt:** Update quadrant labels to Scale/Optimize/Improve/Cut; add bubble size scaled from budget.

**What changed:**
- `app/src/features/dashboard/components/RoiCpaScatter.vue` — added `tag` field to QUADRANTS; added `r` and `roi` to BubblePoint type; switched from Scatter to Bubble (vue-chartjs); added budget-to-radius scaling (MIN_R=5, MAX_R=28); quadrantPlugin.beforeDraw draws short tag labels per quadrant corner at 55% opacity; afterDraw campaign label x-offset uses r+4 to clear bubble edge; ChartOptions type updated to 'bubble'

**Key decisions & why:**
- Separate `tag` (short) from `label` (long) in QUADRANTS — legend keeps descriptive text, chart label stays compact
- globalAlpha 0.55 on quadrant tags — readable but doesn't compete with the data points
- r offset in afterDraw label positioning so labels don't overlap the bubble for large-budget campaigns


## [#313] RoiCpaScatter — selective labels (largest per quadrant) with clipping prevention
**Type:** update

**Summary:** Labels now only appear for the largest-budget campaign per quadrant; all others appear on hover via tooltip; labels are repositioned to never overflow the chart area.

**Brainstorming:** "Important" defined as largest bubble (highest budget) per quadrant — the most impactful decision point in each zone. Per-dataset loop finds max-r point; draws only that label. Clipping prevention: measureText for width, flip to left-aligned if right edge would overflow, clamp y between top+halfLineHeight and bottom-halfLineHeight.

**Prompt:** Labels only for really important items (rest on hover); labels must never be cut outside chart area.

**What changed:**
- `app/src/features/dashboard/components/RoiCpaScatter.vue` — afterDraw rewrites to find max-r index per dataset; draws one label per quadrant; ctx.measureText used to detect right-edge overflow and flip to left; y clamped to stay inside chartArea; textBaseline changed to 'middle' for vertical centering

**Key decisions & why:**
- Largest bubble per quadrant = highest budget = most impactful decision — natural "importance" definition for a budget tool
- Flip-to-left rather than truncate — preserves full campaign name readability
- textBaseline 'middle' + y clamp keeps label anchored to the bubble center regardless of proximity to chart edges


## [#314] RoiCpaScatter — bubble size from revenue (min=6, max=20) + semi-transparent tooltip
**Type:** update

**Summary:** Bubble radius now encodes revenue (not budget), clamped to 6–20px; tooltip background changed to 75% opacity so overlapping bubbles remain visible through it.

**Prompt:** minSize=6, maxSize=20, size=normalize(revenue); tooltips are opaque and this is a problem.

**What changed:**
- `app/src/features/dashboard/components/RoiCpaScatter.vue` — MIN_R 5→6, MAX_R 28→20; radius computed from revenue/maxRevenue; tooltip backgroundColor overridden to rgba(31,41,55,0.75); BubblePoint comment updated

**Key decisions & why:**
- Revenue as size metric: revenue is the output signal — a large revenue bubble in the top-left is the clearest "scale this" signal
- 75% opacity tooltip: retains readability of tooltip text while letting chart content show through


## [#315] RoiCpaScatter — top-3 labels per quadrant, opacity scaling, smaller bubbles, visible tooltip
**Type:** update

**Summary:** Labels now show for top 3 revenue campaigns per quadrant; bubble opacity scales with size (smaller = more transparent); bubbles restrained to MIN_R=4/MAX_R=14; tooltip is nearly opaque with a brighter border; labels are white.

**Prompt:** Top 3 labels per category by meaning; smaller dots more opaque; restrain size; tooltip not visible; labels white.

**What changed:**
- `app/src/features/dashboard/components/RoiCpaScatter.vue` — added `revenue` to BubblePoint for ranking; QUADRANT_RGB array for per-point rgba construction; pointOpacity(r) helper scales 0.35→0.85 by radius; backgroundColor is now an array per dataset; afterDraw ranks by revenue desc and labels top LABELS_PER_QUADRANT=3; label fillStyle '#ffffff'; tooltip backgroundColor 'rgba(15,23,42,0.95)' + brighter border; MIN_R 6→4, MAX_R 20→14

**Key decisions & why:**
- Revenue ranking for labels: highest revenue = highest business impact, consistent with bubble size metric
- Opacity 0.35–0.85 range: smallest bubbles fade back visually; largest stay prominent — reduces perceived overlap
- Tooltip rgba(15,23,42,0.95): near-opaque dark navy, clearly readable against both light and dark chart backgrounds


## [#316] RoiCpaScatter — restore bubble colors, labels under tooltip, updated quadrant text
**Type:** fix

**Summary:** Restored fixed bubble colors per quadrant (removed per-point opacity variation); moved campaign label drawing to afterDatasetsDraw so tooltips always render on top; updated quadrant labels to Scale / Optimize cost / Improve funnel / Rethink / Watch.

**Prompt:** Colors of areas should not have changed; labels appearing above tooltips is wrong; update text to Scale / Optimize cost / Improve funnel / Rethink / Watch.

**What changed:**
- `app/src/features/dashboard/components/RoiCpaScatter.vue` — restored single `color` per QUADRANT dataset (removed QUADRANT_RGB + pointOpacity); renamed labels/tags: "Scale aggressively"→"Scale", "Cut or rethink"→"Rethink / Watch", tag "Optimize"→"Optimize cost", "Improve"→"Improve funnel", "Cut"→"Rethink / Watch"; label drawing moved from `afterDraw` to `afterDatasetsDraw` (runs before tooltip plugin renders, so tooltip draws on top)

**Key decisions & why:**
- afterDatasetsDraw for labels: Chart.js tooltip plugin hooks into a later draw phase; moving labels to afterDatasetsDraw ensures they are drawn to the canvas before the tooltip, so the tooltip always appears on top
- Fixed colors restored: per-point opacity caused unexpected visual divergence from previous appearance


## [#317] RoiCpaScatter — median splits, updated quadrant names, removed kpis prop
**Type:** update

**Summary:** Quadrant split lines now use medianROI and medianCPA computed from the visible campaigns instead of portfolio averages; quadrant labels updated to Efficient / Costly / Weak funnel / Inefficient; kpis prop removed as it is no longer needed.

**Prompt:** Arbitrary average split unfairly flips categories — use medianCPA and medianROI. Update quadrant names to Efficient / Costly / Weak funnel / Inefficient.

**What changed:**
- `app/src/features/dashboard/components/RoiCpaScatter.vue` — added getMedian helper; added medians computed (roi + cpa from non-null campaign values); bubbleData and quadrantPlugin.beforeDraw now read medians.value instead of props.kpis; kpis prop removed; quadrant labels updated to Efficient / Costly / Weak funnel / Inefficient with descriptive legend text
- `app/src/features/dashboard/DashboardView.vue` — removed :kpis binding from RoiCpaScatter

**Key decisions & why:**
- Median over mean: median is not skewed by extreme outliers (a single very high CPA campaign would push the mean right, misclassifying the majority); median gives a stable "middle ground" split
- kpis prop removed entirely: medians are derived from campaigns, so kpis is no longer a required input


## [#318] RoiCpaScatter — median annotations, round tooltip markers, text shadow, axis padding, bubble size subtitle
**Type:** update

**Summary:** Added median value labels on reference lines, removed corner quadrant tags, added text shadow to campaign labels, set explicit ROI tick values, added 5% axis grace padding, made tooltip point markers round, added bubble size subtitle.

**Prompt:** Add reference line value labels; remove corner area tags; round tooltip shape; bubble size legend subtitle; text shadow on labels; axis padding.

**What changed:**
- `app/src/features/dashboard/components/RoiCpaScatter.vue` — removed corner tag rendering from beforeDraw; added median annotation labels ("Median CPA: €X" above vertical line, "Median ROI: X%" above horizontal line at right edge); afterDatasetsDraw adds ctx.shadowColor/shadowBlur for label readability; tooltip usePointStyle: true for round markers; tooltip label callback adds Revenue line; ROI_TICKS array drives afterBuildTicks for clean y-axis tick values (-50%, 0%, 50%, 100%, 200%, 500%, 1000%); grace: '5%' on both axes prevents edge clipping; layout.padding.top: 16 to accommodate median CPA label above chart area; scatter-header + scatter-subtitle added to template

**Key decisions & why:**
- Median labels positioned outside chart area top (CPA) and inside at right edge above line (ROI) — non-overlapping with data
- afterBuildTicks for explicit ticks: the cleanest Chart.js 3 API for overriding auto-generated ticks without affecting data positions
- grace instead of manual min/max: proportional to data range, works across different datasets automatically


## [#319] RoiCpaScatter redesign — fixed size, ghost layer, portfolio benchmarks, adaptive quadrants
**Type:** update

**Summary:** Redesigned RoiCpaScatter with fixed-size points, a ghost context layer for filtered views, portfolio-median reference lines, adaptive quadrant zones, and a clamped y-axis to prevent extreme ROI values from compressing the chart.

**Brainstorming:** The bubble chart was visually noisy due to varying bubble sizes causing overlaps and the log-scale y-axis stretching to accommodate 1000%+ ROI outliers while compressing the interesting region. The redesign separates two concerns: position tells the story (no bubble sizing), and a ghost layer provides portfolio context when filtering. Portfolio medians (not filtered medians) serve as benchmark midlines so the reference lines remain stable across filter changes. Quadrant backgrounds are suppressed below 5 campaigns to avoid misleading splits on thin data. Y-axis max is computed from filtered data p-max + 0.25 in log space to prevent ghost-layer outliers from stretching the scale.

**Prompt:** Redesign RoiCpaScatter: use portfolio medians for midlines; plot filtered campaigns as fixed-size main points; add background ghost points (all non-filtered campaigns, low opacity, small) when filter active; disable quadrant zones if <5 filtered campaigns but keep reference lines; clamp y-axis to filtered data range; dynamic subtitle "Portfolio overview" / "Compared to portfolio benchmarks"; top 2 labels per quadrant by revenue.

**What changed:**
- `app/src/features/dashboard/components/RoiCpaScatter.vue` — full redesign: new props (allCampaigns + campaigns), fixed POINT_R=5 / GHOST_R=3, ghost dataset (non-filtered campaigns only, isGhost flag), medians always from allCampaigns, showQuadrants gate (≥5), yAxisMax computed from filtered data, dynamic subtitle computed, tooltip handles isGhost "(not in filter)" label
- `app/src/features/dashboard/DashboardView.vue` — added `:all-campaigns="store.campaigns"` prop binding

**Key decisions & why:**
- Fixed point size (r=5): position is the primary signal; bubble overlap was the main readability problem
- Ghost layer excludes filtered campaigns (rowId Set): avoids z-order overlap and double tooltips at same position
- Medians from allCampaigns: reference lines stay stable when channel filter changes — consistent benchmark
- yAxisMax from filtered data: ghost-layer outliers can't stretch the visible range; ghost points above max simply clip
- showQuadrants threshold (5): splits are not meaningful with very few data points — colored zones removed but reference lines remain
- Y-axis min fixed at logRoi(-0.7): ensures the scale always shows down to ~-70% ROI regardless of data


## [#320] RoiCpaScatter — remove quadrant gate, fix axis padding symmetry
**Type:** fix

**Summary:** Removed the <5-campaigns quadrant suppression gate and replaced asymmetric grace/fixed-min axis padding with symmetric 10% bounds computed from the filtered data range on all four sides.

**Brainstorming:** The quadrant gate was unhelpful — it removed visual context for small filtered sets rather than helping. The large empty left side was caused by `grace: '5%'` on the x-axis (which adds 5% of the full range, pushing the minimum into negative CPA territory) combined with a hardcoded `logRoi(-0.7)` y-min that didn't match the actual data. The fix: a single `axisBounds` computed derives xMin/xMax/yMin/yMax from the filtered campaign data and applies a uniform 10% padding on each side, with xMin clamped to 0 (CPA can't be negative).

**Prompt:** Remove the quadrant-disable logic for <5 campaigns. Fix the huge empty left side: replace grace and fixed min with symmetric 10% padding on all 4 dimensions computed from the actual data range.

**What changed:**
- `app/src/features/dashboard/components/RoiCpaScatter.vue` — removed `MIN_CAMPAIGNS_FOR_QUADRANTS` constant, `showQuadrants` computed, and the conditional guard in `beforeDraw`; removed `yAxisMax` computed; added `axisBounds` computed (symmetric 10% PAD on x and y from filtered data, xMin clamped ≥0); updated chartOptions x/y scales to use `axisBounds.value.*` instead of `grace`/`yAxisMax`

**Key decisions & why:**
- Single `axisBounds` computed for both axes: ensures padding is symmetric and derived from the same data snapshot
- xMin clamped to 0: CPA is always positive; preventing negative axis values avoids misleading empty space
- 10% PAD: small enough to keep points near edges, large enough for labels not to clip
- Ghost-layer points excluded from bounds calculation: chart always focuses on filtered data, ghost context clips gracefully if outside range


## [#321] RoiCpaScatter — fix median label positions, vertical ROI label outside chart
**Type:** fix

**Summary:** Moved "Median CPA" annotation inside the chart area to stop it clashing with the legend, and drew "Median ROI" vertically outside the right edge of the chart using canvas translate + rotate.

**Brainstorming:** The Median CPA text was drawn at `top - 2` (just above the chart area), which put it in the same space as the Chart.js legend, causing overlap. Moving it to `top + 4` with `textBaseline = 'top'` places it inside the chart right below the top edge — still visually connected to the vertical reference line, no legend clash. The Median ROI text was horizontal at the right edge of the chart area and overlapping with data points; rotating it -90° and translating it to `right + 14` (outside the chart area) keeps it readable and out of the data space. Added `layout.padding.right = 20` to ensure the canvas has room for the rotated label.

**Prompt:** Move the legend up so it doesn't clash with the Median CPA tag. Draw Median ROI vertically outside the chart area on the right so it doesn't overlap with data.

**What changed:**
- `app/src/features/dashboard/components/RoiCpaScatter.vue` — `layout.padding` → `{ top: 24, right: 20 }`; Median CPA text moved to `(xMid, top + 4)` with `textBaseline = 'top'` (inside chart); Median ROI redrawn with `ctx.translate(right + 14, yMid)` + `ctx.rotate(-Math.PI / 2)` (vertical, outside right edge)

**Key decisions & why:**
- Median CPA inside chart (top + 4): removes legend clash entirely without any layout tricks; still visually associated with the vertical reference line
- Median ROI rotated -90°: reads naturally bottom-to-top alongside the horizontal reference line; placed outside chart area so it never overlaps data
- right padding 20px: minimum space needed for the rotated text's rendered height (~12px at 10px font)


## [#322] RoiCpaScatter — median ticks on both axes (pink), fix bottom y-axis collision
**Type:** update

**Summary:** Replaced canvas text annotations for median values with proper pink-coloured axis tick labels on both axes, and filtered y-axis ticks that crowd the axis floor to prevent collision with x-axis labels.

**Brainstorming:** The canvas text approach for median annotations was fragile (could overlap data, hard to align with gridlines) and the Median ROI label was colliding with data points. Moving the annotations to axis tick labels is cleaner: they align exactly with the gridline, respect the axis scale, and are styled consistently with other ticks. The `ticks.color` callback in Chart.js 3 accepts a `ScriptableScaleContext` — comparing `ctx.tick.value` to the median tick value (with a small epsilon for float comparison) returns pink only for the median tick. For the bottom collision: `afterBuildTicks` filters out any tick whose log-space value is within 0.15 of `axis.min` — this clears ticks that would render at the very bottom of the chart area where x-axis labels live.

**Prompt:** Add median ROI as a pink tick label on the y-axis (between other tick lines, in log scale). Add median CPA as a pink tick label on the x-axis. Fix the bottom y-axis tick colliding with x-axis labels.

**What changed:**
- `app/src/features/dashboard/components/RoiCpaScatter.vue` — removed both canvas text annotation blocks from `beforeDraw`; removed `layout.padding.right`; x-axis gains `afterBuildTicks` (injects medCpa tick) + `ticks.color` callback (pink for median); y-axis `afterBuildTicks` now injects `logRoi(medRoi)` into sorted tick list and filters ticks within 0.15 log-units of axis floor; y-axis gains `ticks.color` callback (pink for median)

**Key decisions & why:**
- Axis tick labels instead of canvas text: align precisely with gridlines, never overlap data, scale-aware
- `ticks.color` as function (Chart.js scriptable option): per-tick colour without a custom plugin
- Bottom filter `v > axis.min + 0.15`: 0.15 in log space ≈ one meaningful ROI step; reliably clears the collision without removing meaningful ticks higher up
- x-axis: only inject median tick if not already within 0.01€ of an existing tick (prevents near-duplicate labels)


## [#323] Dev analysis cycle helper
**Type:** update

**Summary:** Added a dev-only helper that fakes a Groq connection and cycles through all mock responses and every error code, allowing UI work on AI analysis panels without real API calls.

**Brainstorming:** The goal was to make it fast and safe to work on AI summary and optimizer UIs without a real API key or live requests. The key design choices were: intercept at `runAnalysisPrompt` (after prompt building, before the HTTP call) so the full store pipeline runs exactly as in production; keep all dev logic in a single file that is inert unless explicitly activated; use a simple module-level counter per tab so cycles are independent; include every `AiErrorCode` reachable from the analysis path to exercise all UI error states; handle `token-limit` specially with a 100 ms auto-reset so the cycle can continue without reconnecting; expose a commented-out block in `AiToolsContent.vue` as the single activation point.

**Prompt:** Add a dev helper function that fakes a Groq AI connection and cycles through all mock responses interleaved with every error code (including hints). 2 s fixed delay per call to show the loader. Per-tab independent counters. No real API calls. Easy to activate/deactivate programmatically via TODO-marked comments.

**What was built:**
- `app/src/features/ai-tools/dev/dev-analysis-cycle.ts` — new file; `DEV_GROQ_MODEL` fake AiModel; `BUDGET_SEQUENCE` and `SUMMARY_SEQUENCE` arrays (5 mocks + 10 error codes each, interleaved); module-level `counters` record; `runDevCycle` override function (2 s sleep, cycles entries, throws `Error(code)` for error entries, resets `token-limit` model flag after 100 ms); `devConnect()` patches aiConnectionStore via `$patch` with fake Groq state; `devDisconnect()` clears override + calls store.disconnect(); `useDevAnalysisCycle()` composable returns `activate`/`deactivate`
- `app/src/features/ai-tools/ai-analysis/utils/analysis-prompt.ts` — added `_devOverride` module-level slot + `setDevAnalysisOverride` export; `runAnalysisPrompt` checks override first and returns early if set; all marked with `TODO: [DEV ONLY]`
- `app/src/features/ai-tools/components/AiToolsContent.vue` — added commented-out activation block (4 lines + import) marked with `TODO: [DEV ONLY]`; uncomment to enable, comment to disable

**Key decisions & why:**
- Intercept in `runAnalysisPrompt` not the store: exercises the full store state machine (loading, caching, error display, cooldown) with no real network hop
- Module-level override slot (not reactive): zero runtime overhead when dev cycle is inactive; a simple null-check
- `token-limit` auto-reset after 100 ms: the store marks the model as exhausted, shows the token-limit state, then the reset re-enables the button so the cycle can continue without reconnecting
- Per-tab counters (not shared): matches the requirement that tabs cycle independently
- Single commented block in `AiToolsContent.vue`: one place to uncomment/re-comment; no build flags or env vars



## [#324] Refactor AI drawer to not push the header
**Type:** fix

**Summary:** Restructured AppShell layout so the AI push drawer only compresses the main content area, leaving the header at full width.

**Brainstorming:** The header was being compressed alongside the main content because both lived inside `.shell-left`, which was a flex sibling of the drawer. The fix is to hoist the header out of that sibling relationship — making it a direct child of `.app-shell` that spans the full width — and wrapping only the main content and the drawer in a new `.shell-body` row. This way the drawer's width transition only affects the content area below the header.

**Prompt:** Refactor the AI drawer so it does not push the header. The header should stay full width when the drawer opens.

**What changed:**
- `app/src/shell/AppShell.vue` — removed `.shell-left` wrapper; `.app-shell` changed from `flex flex-row` to `flex flex-col`; header is now a direct child of `.app-shell`; new `.shell-body` div (`flex flex-row flex-1 overflow-hidden`) wraps `shell-main` + `AiToolsDrawer`; removed commented-out gradient variants from `.shell-title`
- `app/src/shell/AiToolsDrawer.vue` — `.push-drawer-panel` changed from `h-screen` to `h-full` since it is no longer at root level

**Key decisions & why:**
- `h-full` on push-drawer-panel: `h-screen` no longer works once the panel is nested inside `.shell-body` rather than at viewport root; `h-full` fills the parent's constrained height correctly
- No changes to the overlay path (`<lg`): the fixed overlay is already positioned independently of the layout flow


## [#325] Refactor DashboardView header layout — co-locate filter with header
**Type:** refactor

**Summary:** Merged the channel filter into the header section of DashboardView, replacing the separate `.dashboard-section` wrapper with a unified `.dashboard-header` + `.dashboard-header-container`, and reduced the grid from three rows to two.

**Brainstorming:** Previously the header and filter lived in separate `.dashboard-section` rows, giving the grid three rows (`min-content min-content 1fr`). Since the filter is logically part of the header controls area, grouping them inside a single `.dashboard-header` section simplifies the layout — one row for header+filter, one row for the scrollable content area. This also removes the unused `.dashboard-section` class.

**Prompt:** Refactor DashboardView so the channel filter is co-located inside the header section. Replace the separate .dashboard-section wrappers with a unified .dashboard-header layout and update the grid rows accordingly.

**What changed:**
- `app/src/features/dashboard/DashboardView.vue` — header section renamed from `.dashboard-section` to `.dashboard-header` with inner `.dashboard-header-container` (max-w-7xl centered, flex col gap-3); `ChannelFilter` moved inside `.dashboard-header-container` alongside `DashboardHeader`; grid updated to `grid-rows-[min-content_1fr]` (two rows); `DashboardKpis`, `DashboardCharts`, `RoiCpaScatter` temporarily commented out while layout work is in progress; `.card-title.table-card-title` scoped override commented out

**Key decisions & why:**
- `.dashboard-header-container` with `max-w-7xl mx-auto`: keeps the header and filter aligned with the table card's max width for visual consistency
- Two-row grid: with filter inside the header section there is no need for a third `min-content` row; the content area takes `1fr`
- Visualizations commented out (not deleted): layout is in progress — components will be re-enabled once the new layout is validated


## [#326] Refactor design token system and add MetaRow/MetaItem UI components
**Type:** refactor

**Summary:** Extracted the raw color palette into a dedicated `dark-pallette.scss` file, refactored `dark.scss` to a semantic token layer, updated `tailwind.config.js` to consume the new token names, and added `MetaRow`/`MetaItem` reusable UI components for inline metadata display with bullet and divider variants.

**Brainstorming:** The previous `dark.scss` mixed raw color scales with semantic role assignments in one file. Splitting palette from semantics makes it easier to swap palettes or add themes without touching the semantic layer. The new token naming (surface-0/1/2/3, color-border-subtle/default/strong, color-text-muted/subtle etc.) aligns the CSS vars with the Tailwind token names already used in components. `MetaRow`/`MetaItem` were added as generic slot-based wrappers to replace ad-hoc inline patterns for metadata like campaign/channel counts — the bullet and divider variants are driven by modifier classes so no props are needed. The RoiCpaScatter quadrant labels were renamed from action-oriented (Scale/Optimize/Improve/Cut) to descriptive (Efficient/Costly/Weak funnel/Inefficient) to better reflect what the axes measure.

**Prompt:** Check the changed files (RoiCpaScatter.vue, style.scss, _card.scss, _detail-item.scss, dark.scss, MetaItem.vue, MetaRow.vue, tailwind.config.js, dark-pallette.scss), update CLAUDE.md to reflect all changes, write the LOGS.md entry, and give a commit message.

**What changed:**
- `app/src/styles/themes/dark-pallette.scss` — new file; raw color scale variables (primary 50–1000, secondary, accent, success, warning, danger, info, neutral 50–950); applied on :root + [data-theme="dark"]
- `app/src/styles/themes/dark.scss` — @use dark-pallette; refactored to semantic token layer (surface 0–3/hover/active, border subtle/default/strong/divider, text default/muted/subtle/inverse/primary variants, full semantic color groups, focus-ring, disabled, elevation shadows)
- `app/tailwind.config.js` — updated to consume new CSS var names (surface layers, typography variants, border tokens); added primary CSS-var-backed tokens (DEFAULT/light/lighter/dark/darker); added missing tokens from semantic layer
- `app/src/styles/components/_card.scss` — updated to use `border-subtle` (was `border-surface-outline`); removed commented-out dead code
- `app/src/styles/components/_detail-item.scss` — bullet separator updated to `bg-primary-light` (was `bg-typography-subtle`)
- `app/src/style.scss` — removed commented-out h5 rule
- `app/src/ui/meta/MetaItem.vue` — new; inline `<span>` slot wrapper; no props
- `app/src/ui/meta/MetaRow.vue` — new; `<p>` flex-wrap row; .meta-row--bullet (::before dot via :slotted) and .meta-row--divider (border-l separator) variants
- `app/src/ui/meta/index.ts` — new; barrel export for MetaItem + MetaRow
- `app/src/features/dashboard/components/RoiCpaScatter.vue` — quadrant labels renamed to Efficient/Costly/Weak funnel/Inefficient; scatter-title styled with text-primary-300 font-normal; scatter-subtitle uses opacity-50

**Key decisions & why:**
- Palette extracted to `dark-pallette.scss`: keeps the semantic token file (`dark.scss`) free of raw hex/RGB values — palette can be swapped independently
- Semantic surface layers (0–3) instead of named variants: gives a clear depth ordering that maps directly to elevation without requiring arbitrary name invention
- `MetaRow` uses `:slotted` for bullet/divider: avoids requiring every child to be a `MetaItem`; works with any slotted element
- RoiCpaScatter quadrant rename: "Efficient/Costly/Weak funnel/Inefficient" is descriptive of the axes (ROI + CPA) rather than prescriptive; clearer to a first-time reader


## [#327] Refactor channel filter — move toggle logic to ChannelFilter, replace store actions with setChannelFilter
**Type:** refactor

**Summary:** Replaced `toggleChannel` + `clearFilters` store actions with a single `setChannelFilter(ids)` setter; moved all selection logic (toggle, normalize all-selected → `[]`) into ChannelFilter, which now reads `selectedChannelsIds` from the store directly and calls the setter on change.

**Brainstorming:** The previous design had the store owning toggle/clear behavior and ChannelFilter as a fully dumb prop-driven component. This meant the store contained UI behavior (toggling individual items) that only ChannelFilter ever called. The agreed refactor keeps `selectedChannelsIds` in the store (needed by portfolioAnalysis, filteredCampaigns, AI cache key derivations) but makes the store a dumb holder — one setter, no logic. ChannelFilter owns the behavior: it reads the current selection from the store reactively (no local copy, no sync issue on portfolio switch), handles toggle/normalize internally, and writes via `setChannelFilter`. Normalization (all selected → `[]`) happens in the component because it already has the full channel list via its `channels` prop.

**Prompt:** Replace toggleChannel + clearFilters store actions with a single setChannelFilter(ids) setter. Move toggle/select-all/clear logic into ChannelFilter. ChannelFilter reads selectedChannelsIds from store directly (no selected prop, no emits). DashboardView passes only :channels.

**What changed:**
- `app/src/stores/campaign.store.ts` — removed `toggleChannel` + `clearFilters`; added `setChannelFilter(ids: string[])` (assigns selectedChannelsIds.value directly); updated return object
- `app/src/features/dashboard/components/ChannelFilter.vue` — removed `selected` prop and all emits; imports `useCampaignStore`; `toggle(channelId)` builds next array and normalizes (length === channels.length → `[]`) before calling `store.setChannelFilter`; template reads `store.selectedChannelsIds` directly for active/inactive state; "All" button calls `store.setChannelFilter([])` inline
- `app/src/features/dashboard/DashboardView.vue` — removed `:selected`, `@toggle`, `@clear-all` bindings; `<ChannelFilter>` now receives only `:channels`

**Key decisions & why:**
- No local state in ChannelFilter: displayed selection derived from store reactively — portfolio switch resets the store ref and the component updates automatically with no extra watcher
- Normalization in component: ChannelFilter has the `channels` prop (total count) needed to detect "all selected"; the store setter doesn't need to know about total channel count
- Single setter over toggle action: callers compose the next state themselves, giving them full control without relying on store-internal array mutation logic


## [#328] Complete semantic token wiring — tailwind config, ChannelFilter styles
**Type:** refactor

**Summary:** Replaced all hardcoded hex color values in `tailwind.config.js` with CSS-var-backed semantic tokens covering the full design system (primary/secondary/accent/success/warning/danger/info each with DEFAULT/light/lighter/dark/darker scale, on-primary, divider border); updated ChannelFilter pill styles to consume the new tokens.

**Brainstorming:** The previous tailwind config was a hybrid — some tokens pointed to CSS vars, others (primary 50–1000 hex scale, secondary single hex, danger -5p, slate, black/white, surface-border) were hardcoded. This meant changing the theme required editing both `dark-pallette.scss` and `tailwind.config.js`. The refactor makes the config purely a mapping layer: CSS vars are the single source of truth, Tailwind tokens are aliases. The new primary scale adds semantic role names (soft/deep/deeper/muted/ink) rather than numeric steps, which communicate intent rather than lightness level. ChannelFilter was updated as a direct consumer: the old `border-primary-500`/`bg-primary-500`/`text-white`/`bg-white/10` hardcoded values are replaced with `border-primary`/`bg-primary`/`text-on-primary`/`bg-on-primary/10`.

**Prompt:** Check all changed files — tailwind.config.js was updated with the full semantic token system. Update CLAUDE.md to reflect the new token structure, update ChannelFilter docs for the new semantic styles, write the log entry, give a commit message.

**What changed:**
- `app/tailwind.config.js` — removed all hardcoded hex color values; primary now purely CSS-var-backed with soft/deep/deeper/muted/ink semantic variants added; secondary/accent/success/warning/danger/info all expanded to full CSS-var-backed scale (DEFAULT/light/lighter/dark/darker); added on-primary token; added divider to borderColor; removed slate/black/white/surface-border/danger-5p; spinner tokens remain hardcoded hex (no CSS var counterpart)
- `app/src/features/dashboard/components/ChannelFilter.vue` — active pill updated to `border-primary bg-primary text-on-primary`; inactive updated to `hover:border-primary-light focus-visible:border-primary-light`; filter-count badge updated to `bg-on-primary/10`; border-2 reduced to border

**Key decisions & why:**
- Semantic primary scale (soft/deep/deeper/muted/ink) instead of numeric (50–1000): communicates role rather than lightness position; decouples component code from palette values
- Spinner left as hardcoded hex: spinner has no semantic meaning that benefits from CSS-var indirection; it's a UI-only token unlikely to theme-switch
- on-primary token: required to correctly set text on filled primary-background elements without hardcoding `text-white` — enables theme flexibility


## [#329] Rename primary palette scale to semantic names; update dark.scss and _card.scss
**Type:** refactor

**Summary:** Renamed the primary color scale in `dark-pallette.scss` from numeric steps (--primary-400 etc.) to semantic names (--primary-light etc.); updated `dark.scss` to reference the new names; updated `_card.scss` to use `bg-surface-elevated` and `text-primary-soft`.

**Brainstorming:** The previous palette used numeric suffixes (50–1000) for primary, making component code express a position rather than a role. Renaming to semantic names (--primary, --primary-light, --primary-lighter, --primary-soft, --primary-dark, --primary-darker, --primary-deep, --primary-deeper, --primary-muted, --primary-ink) means the palette communicates intent. dark.scss semantic token layer now references these names (--color-primary-light: var(--primary-light)) rather than numerics. Card components updated to use the new tokens: .card uses bg-surface-elevated (surface-1 depth) for slightly elevated appearance; .card-secondary .card-title uses text-primary-soft.

**Prompt:** Check if CLAUDE.md is fully up to date — dark-pallette.scss renamed primary scale to semantic names, dark.scss updated accordingly, _card.scss uses bg-surface-elevated and text-primary-soft.

**What changed:**
- `app/src/styles/themes/dark-pallette.scss` — primary scale renamed: --primary-200→--primary-soft, --primary-300→--primary-lighter, --primary-400→--primary-light, --primary-500→--primary, --primary-600→--primary-dark, --primary-700→--primary-darker, --primary-800→--primary-deep, --primary-900→--primary-deeper, --primary-950→--primary-muted, --primary-1000→--primary-ink; --primary-50/100 kept numeric
- `app/src/styles/themes/dark.scss` — all --color-primary-* vars updated to reference semantic palette names (--primary-light not --primary-400); --color-text-primary/strong/subtle updated similarly; --color-on-primary moved into Primary section
- `app/src/styles/components/_card.scss` — .card uses bg-surface-elevated (was bg-surface); .card-secondary .card-title uses text-primary-soft (was text-primary-200)

**Key decisions & why:**
- Semantic names over numeric steps: component code reads `text-primary-soft` rather than `text-primary-200` — role is explicit without needing to know the scale position
- --primary-50/100 kept numeric: no semantic role assigned to the lightest end of the scale yet; renamed only the values actively used in tokens


## [#330] Fix dark.scss broken palette references after dark-pallette revert to numeric naming
**Type:** fix

**Summary:** Reverted `dark-pallette.scss` to numeric primary scale (50–1000); fixed 5 broken references in `dark.scss` that still used the short-lived semantic palette names (`--primary`, `--primary-light`, `--primary-lighter`).

**Brainstorming:** `dark-pallette.scss` was restored to the original numeric naming. `dark.scss` had 5 leftover references to semantic palette names that no longer exist: `--color-text-primary`, `--color-text-primary-strong`, `--color-text-primary-subtle`, `--color-primary`, and `--color-focus-ring`. All five now point to the correct numeric vars. Lines 37–45 (the `--color-primary-*` semantic token definitions) were already correct as they had been manually updated to use numeric refs.

**Prompt:** dark-pallette.scss reverted to numeric naming. Fix the remaining broken references in dark.scss.

**What changed:**
- `app/src/styles/themes/dark-pallette.scss` — primary scale restored to numeric (--primary-50 through --primary-1000)
- `app/src/styles/themes/dark.scss` — fixed: `--color-text-primary` → `var(--primary-400)`; `--color-text-primary-strong` → `var(--primary-500)`; `--color-text-primary-subtle` → `var(--primary-300)`; `--color-primary` → `var(--primary-500)`; `--color-focus-ring` → `var(--primary-400)`

**Key decisions & why:**
- All five broken refs resolved to their numeric equivalents based on the intended role (400 = light/interactive, 500 = base, 300 = subtle)


## [#324] Add MagicWandIcon and scaffold Button, Card, Badge UI components
**Type:** update

**Summary:** Created a MagicWandIcon SVG component and three new shell UI components (Button, Card, Badge) with no implementation logic yet, registered in barrel files.

**Brainstorming:** The icon uses Lucide-style paths for a wand with accent star marks (small cross at tip, trailing stars). Button, Card, and Badge are thin wrappers that delegate to the existing global SCSS classes (.btn, .card, .badge) via a `variant` prop — no inline styles or new SCSS needed for the scaffold.

**Prompt:** Create a magic wand icon with stars for use in the re-generate button. Also create Button, Card, and Badge components in the ui/ folder — scaffold only, no implementation yet.

**What was built:**
- `app/src/ui/icons/MagicWandIcon.vue` — inline SVG magic wand with star accent paths, same style/size convention as all other icons
- `app/src/ui/Button.vue` — wraps `<button>` with `variant` (primary/secondary-outline/destructive-small/icon-secondary) + `size` (sm/md) + `disabled` + `type` props; delegates to existing `.btn-*` global classes
- `app/src/ui/Card.vue` — wraps `<div class="card">` with `variant` (default/secondary) prop; delegates to `.card` / `.card-secondary`
- `app/src/ui/Badge.vue` — wraps `<span class="badge">` with `variant: BadgeVariant` prop; reuses existing `BadgeVariant` type
- `app/src/ui/icons/index.ts` — added `MagicWandIcon` export
- `app/src/ui/index.ts` — added `Button`, `ButtonVariant`, `ButtonSize`, `Card`, `CardVariant`, `Badge` exports

**Key decisions & why:**
- Components delegate to global SCSS classes rather than introducing new styles — keeps the scaffold consistent with the codebase convention and avoids duplication
- `BadgeVariant` reused from existing `ui/types/badge-variant.ts` — single source of truth for variant values
- `variantClass` resolved as a plain object lookup on props at setup time — avoids computed overhead for a static mapping


## [#325] Add scoped styles to Button, Card, Badge UI components
**Type:** update

**Summary:** Ported the styles from `_button.scss`, `_card.scss`, and `_badge.scss` into each component's own `<style lang="scss" scoped>` block without removing the global classes.

**Brainstorming:** The components already delegated to global classes via `@apply` + `@extend` chains. Moving those rules into scoped blocks makes each component self-contained while the global SCSS classes remain intact for direct className usage elsewhere in the app.

**Prompt:** Add the styles from styles/components to Button, Card, and Badge without removing the previous global ones.

**What changed:**
- `app/src/ui/Button.vue` — added scoped `.btn` block with all variant modifiers (btn-primary, btn-secondary-outline, btn-destructive-small, btn-icon-secondary, btn-small) as nested `&.variant` rules
- `app/src/ui/Card.vue` — added scoped `.card` block with nested `&.card-secondary` including `.card-head`, `.card-title`, `.card-content`
- `app/src/ui/Badge.vue` — added scoped `.badge` block with all five variant modifiers (success/warning/danger/info/opportunity) inlined — text + bg + border tokens merged per variant

**Key decisions & why:**
- Badge collapses the separate `badge-text` / `badge-background` helper classes into a single `&.variant` rule per variant — scoped context removes the need for the split since there are no other consumers inside the component
- Global `_button.scss`, `_badge.scss`, `_card.scss` left untouched — still needed for direct class usage across the rest of the app


## [#326] Redraw MagicWandIcon as filled icon matching reference
**Type:** update

**Summary:** Replaced the stroked outline wand with a fully filled icon — diagonal shaft + eraser cap (two rotated rects) plus three 4-pointed sparkle stars using cubic-bezier curves.

**Brainstorming:** The reference image shows a solid filled style. The wand body is modelled as two `<rect>` elements with `transform="rotate(-45)"` — a long shaft (rx=1.75 for fully rounded handle end) and a shorter wider cap (rx=1) at the upper-right tip. The four-pointed sparkle stars are drawn as closed bezier paths using the formula M cx,cy-r C cx+rk,cy-r cx+r,cy-rk cx+r,cy … with k=0.15 giving sharp inward-curved sides.

**Prompt:** Update MagicWandIcon to look like the reference image (solid filled wand with eraser cap + 3 sparkle stars).

**What changed:**
- `app/src/ui/icons/MagicWandIcon.vue` — full rewrite; switched to fill="currentColor", removed stroke attributes; wand shaft rect (16×3.5, rx=1.75, rotate(-45,11,13)) + eraser cap rect (4×5, rx=1, rotate(-45,18,6)); three sparkle paths at (6,8,r=4.5), (14,2.5,r=2), (20,17.5,r=2) using cubic-bezier 4-pointed star formula

**Key decisions & why:**
- `<rect>` elements used for shaft/cap rather than explicit path — simpler, and SVG `transform="rotate(angle,cx,cy)"` handles the 45° orientation precisely
- k=0.15 in sparkle bezier formula gives sharp points matching the reference; control points are placed at (cx±rk, cy±r) and (cx±r, cy±rk) which pulls the curves inward at each corner


## [#327] Replace MagicWandIcon with Font Awesome wand-magic-sparkles-solid
**Type:** update

**Summary:** Replaced the hand-drawn wand paths with the Font Awesome Free "wand-magic-sparkles-solid" path data, keeping the same component API and size convention.

**Brainstorming:** The FA icon already ships as a single combined <path> with all subpaths (two sparkle stars, one small sparkle, wand tip rect, wand shaft). Easiest and most accurate approach is to use the path as-is and set viewBox="0 0 640 640" to match the FA coordinate space — the browser scales it to 1em×1em automatically.

**Prompt:** Update MagicWandIcon to use the Font Awesome wand-magic-sparkles-solid icon as reference.

**What changed:**
- `app/src/ui/icons/MagicWandIcon.vue` — viewBox changed to "0 0 640 640"; single <path> containing all FA subpaths (two medium sparkles, one small sparkle, wand tip, wand shaft); stroke attributes removed; fill="currentColor" kept

**Key decisions & why:**
- Kept the 640×640 viewBox rather than scaling coordinates — simpler, lossless, and the SVG viewport handles scaling to 1em×1em without any numeric rounding


## [#331] UI restructuring — SectionHeaderLayout, Button in AI panel header, MetaRow in dashboard
**Type:** refactor

**Summary:** Extracted a reusable SectionHeaderLayout shell, moved the analyze button out of AnalysisState into each tab orchestrator's action slot, wired Button + MagicWandIcon into ExecutiveSummaryAnalysis, updated DashboardHeader to use MetaRow/MetaItem, and cleaned up the dev cycle error sequences.

**Brainstorming:** AnalysisState was acting as both the layout host and the action trigger, which coupled button placement to the wrapper. Moving the button to the parent's action slot gives each tab full control over its header (label, icon, styling) without modifying the shared component. SectionHeaderLayout provides the flex scaffolding (header grows, action shrinks) that was being duplicated. The MagicWandIcon in the Button replaces the prior SparklesIcon in the panel-head. DashboardHeader already had MetaRow/MetaItem available in the ui barrel and was the right place to use them instead of raw spans.

**Prompt:** Read all changes, update your files, update last log to include all changes not present in previous log and give me commit message.

**What changed:**
- `app/src/ui/SectionHeaderLayout.vue` — new layout component; header slot (grows, centered) + action slot beside it in a nowrap flex row; default slot below; no props, no scoped styles
- `app/src/ui/index.ts` — added exports for Button, ButtonVariant, ButtonSize, Card, CardVariant, Badge, SectionHeaderLayout
- `app/src/ui/Button.vue` — scoped styles in place; variant/size props commented out; class pass-through for primary/square modifiers; gradient primary styles in scoped block
- `app/src/ui/Card.vue` — scoped .card + &.card-secondary styles in place
- `app/src/ui/Badge.vue` — scoped .badge with per-variant text/bg/border rules in place
- `app/src/features/ai-tools/ai-analysis/components/executive-summary/ExecutiveSummaryAnalysis.vue` — refactored to use SectionHeaderLayout with #header (dynamic title) and #action (Button.primary.square + MagicWandIcon); MetaRow shows portfolio title/channel count/campaign count; AnalysisState no longer owns the analyze button header; imports Button + MagicWandIcon + MetaRow + MetaItem + SectionHeaderLayout from @/ui
- `app/src/features/ai-tools/ai-analysis/components/executive-summary/ExecutiveSummaryHealth.vue` — added scoped .health-container / .health-badge / .health-score / .health-label styles for the health score display block
- `app/src/features/ai-tools/ai-analysis/components/shared/AnalysisState.vue` — panel-head (title h3 + SparklesIcon analyze button) commented out; analyze button responsibility moved to parent orchestrators
- `app/src/features/dashboard/components/DashboardHeader.vue` — switched from raw spans to MetaRow (bullet variant) + MetaItem for the portfolio title/channel/campaign meta line
- `app/src/styles/components/_badge.scss` — badge-text and badge-background kept as separate @extend helper classes; .badge @extends both
- `app/src/style.scss` — h2/h3/h5 global typography rules updated
- `app/src/shell/AiToolsDrawer.vue` — push drawer open width confirmed at w-[30rem]
- `app/src/features/ai-tools/dev/dev-analysis-cycle.ts` — error sequence entries commented out; dev cycle now iterates mocks only; sleep and token-limit reset also commented out for faster iteration

**Key decisions & why:**
- SectionHeaderLayout is props-free — slot-only API keeps it generic; callers own all rendering decisions
- Button action slot placement rather than AnalysisState internal button — decouples the shared wrapper from per-tab action label/icon choices; AnalysisState stays a pure status/slot display component
- MetaRow + MetaItem in DashboardHeader instead of raw spans — consistent with the same pattern used across the rest of the app; bullet separator comes for free from the global .meta-row--bullet rule
- Dev cycle errors commented out (not deleted) — easy to re-enable individual error codes for targeted UI testing


## [#336] Extract AnalysisHeader shared component for AI tab orchestrators
**Type:** refactor

**Summary:** Extracted a fully props-only `AnalysisHeader.vue` to eliminate the duplicated `SectionHeaderLayout` + MetaRow + analyze button pattern between both AI tab orchestrators.

**Brainstorming:** Both `ExecutiveSummaryAnalysis` and `BudgetOptimizationAnalysis` share the same structural header: a `SectionHeaderLayout` with a dynamic title, a `Button.primary.square` with `MagicWandIcon` in the action slot, and a `MetaRow` showing portfolio title / channel count / campaign count. Options considered: (A) fully dumb props-only component — parent computes all values and passes them down; (B) fully smart component reading the store internally; (C) mixed (store + props). Option A chosen: mixing store reads with props in a shared component creates unclear ownership. The orchestrators already read stores and compute derived values — three extra props is trivial. The component stays purely presentational.

**Prompt:** Extract a shared `AnalysisHeader.vue` component (props-only, no store reads) for the SectionHeaderLayout + MetaRow + analyze button pattern shared by both AI tab orchestrators. Props: title, actionLabel, isButtonDisabled, portfolioTitle, channelCount, campaignCount. Emits: analyze. Update both orchestrators to use it, passing all values as props. Icon is baked in (MagicWandIcon) — same for both tabs.

**What changed:**
- `ai-analysis/components/shared/AnalysisHeader.vue` — new; SectionHeaderLayout with dynamic title h3 + Button.primary.square + MagicWandIcon in #action slot + MetaRow with portfolioTitle/channelCount/campaignCount; fully props-only
- `executive-summary/ExecutiveSummaryAnalysis.vue` — replaced inline SectionHeaderLayout/MetaRow/Button/MagicWandIcon block with `<AnalysisHeader>`; added headerTitle + channelCount computeds; removed unused imports; no scoped styles remain
- `budget-optimization/BudgetOptimizationAnalysis.vue` — added `<AnalysisHeader>` (was missing entirely); added campaignStore + headerTitle ("Portfolio Optimizer" / "Budget Optimizer") + channelCount + actionLabel computeds; now reads both aiAnalysis.store and campaign.store

**Key decisions & why:**
- Props-only over store-reading: avoids mixed-responsibility component where ownership of data is ambiguous; orchestrators already read stores, extra props cost nothing
- Icon baked in (not a prop): both tabs use the same MagicWandIcon — no variation exists, so no prop needed; simpler call sites
- Optimizer title "Portfolio Optimizer" / "Budget Optimizer" mirrors the Summary pattern — consistent dynamic title behaviour across both tabs


## [#337] Add portfolioContext getter to aiAnalysisStore
**Type:** refactor

**Summary:** Introduced a `portfolioContext` computed on `aiAnalysisStore` grouping `{ portfolioTitle, filtersActive, channelCount, campaignCount }` so both tab orchestrators read from a single store and the duplicated channelCount derivation is removed.

**Brainstorming:** The channelCount logic (`filtersActive ? selectedChannelsIds.length : portfolioChannels.size`) was duplicated in both orchestrators after the AnalysisHeader extraction. Options: add flat getters to campaignStore (natural owner but orchestrators still need two imports); add a grouped computed to aiAnalysisStore (orchestrators already heavily import it, aiAnalysisStore already reads campaignStore). Grouped object chosen over flat getters — cleaner destructuring at call sites and fewer surface additions to the store. aiAnalysisStore already uses campaignStore extensively so no new cross-store coupling direction is introduced.

**Prompt:** Add a `portfolioContext` computed to `aiAnalysisStore` returning `{ portfolioTitle, filtersActive, channelCount, campaignCount }` derived from campaignStore. Expose it in the return statement. Update both tab orchestrators to read from `analysisStore.portfolioContext` and drop their campaignStore imports.

**What changed:**
- `stores/aiAnalysis.store.ts` — added `portfolioContext` computed (filtersActive gate, channelCount derivation, portfolioTitle, campaignCount); exposed in return
- `executive-summary/ExecutiveSummaryAnalysis.vue` — dropped campaignStore import; headerTitle uses `portfolioContext.filtersActive`; AnalysisHeader props read from `analysisStore.portfolioContext`
- `budget-optimization/BudgetOptimizationAnalysis.vue` — dropped campaignStore import; same pattern

**Key decisions & why:**
- Grouped object over flat getters: single addition to store surface; destructuring at call sites reads naturally
- Placed in aiAnalysisStore not campaignStore: orchestrators already import aiAnalysisStore exclusively — avoids re-adding a second store import that was just removed


## [#338] Introduce PortfolioContext interface and collapse AnalysisHeader props to single object
**Type:** refactor

**Summary:** Defined and exported `PortfolioContext` from `aiAnalysis.store.ts` and collapsed the three flat `AnalysisHeader` props (`portfolioTitle`, `channelCount`, `campaignCount`) into a single `:context` prop.

**Brainstorming:** Three individual props for what is already a grouped computed object in the store creates unnecessary spread at call sites. Defining the interface at the producer (the store) and importing it in the consumer (AnalysisHeader) is the natural ownership direction — the store defines the shape it produces, the component declares it accepts that shape.

**Prompt:** Define and export `PortfolioContext` interface in `aiAnalysis.store.ts`. Update `AnalysisHeader` to replace the three flat props (portfolioTitle/channelCount/campaignCount) with a single `context: PortfolioContext` prop. Update both orchestrators to pass `:context="analysisStore.portfolioContext"`.

**What changed:**
- `stores/aiAnalysis.store.ts` — added exported `PortfolioContext` interface ({ portfolioTitle, channelCount, campaignCount, filtersActive })
- `shared/AnalysisHeader.vue` — replaced three flat props with `context: PortfolioContext`; template reads `context.portfolioTitle` etc.; imports PortfolioContext from store
- `ExecutiveSummaryAnalysis.vue` — AnalysisHeader call site collapsed to `:context="analysisStore.portfolioContext"`
- `BudgetOptimizationAnalysis.vue` — same; titles updated to "Portfolio Budget Optimizer" / "Selection Budget Optimizer"

**Key decisions & why:**
- Interface defined in the store, not in AnalysisHeader — the store is the producer of this shape; component types should flow from data layer toward presentation layer, not the reverse
- `filtersActive` included in the interface — it is part of the computed object the store already returns; omitting it would require a separate computed or type cast


## [#339] Fix AnalysisState double-render during token-limit state
**Type:** fix

**Summary:** Added `!tokenLimitReached` guard to the error box condition in `AnalysisState.vue` to prevent it from rendering alongside the token-limit warning notice.

**Brainstorming:** The token-limit notice and the idle/loading/error/result block are two independent `v-if` chains. When `status === 'error'` and `tokenLimitReached === true` (e.g. during the dev cycle's token-limit entry), both the warning notice (chain 1) and the error box (chain 2) rendered simultaneously — two visible messages at once. The fix is a single guard on the error box condition so it defers to the warning notice when `tokenLimitReached` is true.

**Prompt:** The dev analysis cycle shows 2 messages simultaneously at the token-limit step. The token-limit notice and error box are separate v-if chains in AnalysisState — both render when tokenLimitReached is true and status is 'error'. Add `!tokenLimitReached` to the error box condition.

**What changed:**
- `ai-analysis/components/shared/AnalysisState.vue` — error box `v-else-if` condition extended with `&& !tokenLimitReached`

**Key decisions & why:**
- Guard on the component condition rather than changing store display logic — the store correctly sets `status: 'error'` with the error code; the component is responsible for not showing competing UI states
- One-character change, zero behaviour change when `tokenLimitReached` is false (production path unaffected)


## [#340] Move token-limit to end of dev sequences, remove artificial reset
**Type:** fix

**Summary:** Moved `token-limit` to the last position in both dev sequences and removed `resetTokenLimit()` so the state behaves identically to production — terminal, with the button disabled.

**Brainstorming:** `resetTokenLimit()` was resetting `model.limitReached` after 100ms so the cycle could continue past the token-limit entry. This caused non-production behaviour: the Analyze button would re-enable and the display would flicker as `tokenLimitReached` flipped back. Moving token-limit last means all other error states are fully observable before reaching the terminal state. Removing the reset means token-limit lands exactly as in production — warning notice stays, button stays disabled, only disconnect clears it.

**Prompt:** Move token-limit to the end of both dev sequences and remove resetTokenLimit() so the state matches production exactly.

**What changed:**
- `dev/dev-analysis-cycle.ts` — `token-limit` moved to last in BUDGET_SEQUENCE and SUMMARY_SEQUENCE; `resetTokenLimit` function removed; its call in `runDevCycle` removed

**Key decisions & why:**
- Terminal position for token-limit — all other states are iterable one click at a time before reaching the terminal state; matches real usage where token exhaustion is end-of-session
- `sleep` helper left in place — still useful for the commented-out latency simulation line


## [#341] Restore token-limit reset on cycle wrap in dev analysis cycle
**Type:** fix

**Summary:** Brought back `resetTokenLimit` but scoped it to fire only when the cycle wraps — when `counters[type] === 0` after `nextEntry` returns the last entry — so the terminal state is visible for 1.5s then auto-clears to allow re-cycling.

**Brainstorming:** Removing the reset entirely made token-limit a hard stop requiring manual disconnect each time. The right approach is to detect the natural cycle boundary (`counters[type] === 0` after `nextEntry`) and reset only then. This keeps each state production-accurate during the cycle and auto-resets only at the seam between repetitions. 1500ms gives enough time to actually observe the terminal state before the button re-enables.

**Prompt:** Check if the cycle just wrapped (counters[type] === 0 after nextEntry) and call resetTokenLimit only then, with a 1500ms delay so the terminal state is visible before re-enabling.

**What changed:**
- `dev/dev-analysis-cycle.ts` — `resetTokenLimit` re-added with 1500ms delay; `runDevCycle` captures `cycleWrapped = counters[type] === 0` after `nextEntry` and calls `resetTokenLimit()` only when true

**Key decisions & why:**
- `cycleWrapped` read after `nextEntry` — the counter is already incremented at that point, so `=== 0` means it just wrapped
- 1500ms delay — short enough to not feel broken, long enough to see the warning notice settle before the button re-enables


## [#342] Add pressed state to primary button
**Type:** update

**Summary:** Added `:active` state to `.btn-primary` using `bg-primary-darker` (700) and `border-primary-dark` (600) — one step darker than default, giving a natural depressed feel.

**Brainstorming:** The existing primary button uses primary-600 at rest and brightens to primary-500 on hover. The pressed state should go the other way — darker than rest — to give tactile feedback. primary-700 (primary-darker) is the natural next step down. Border pulls back to primary-600 (primary-dark) to frame it without adding contrast.

**Prompt:** Add a pressed state to the primary button that fits the current token scale.

**What changed:**
- `styles/components/_button.scss` — added `&:active` block inside `.btn-primary :not(:disabled)` with `bg-primary-darker border-primary-dark`

**Key decisions & why:**
- primary-700 for active background — symmetrical to hover (which goes lighter to 500); press goes darker to 700 for clear directionality
- No scale/transform — kept consistent with the existing transition-colors-only pattern on `.btn`


## [#343] Rewrite analysis error messages and add per-code hint map
**Type:** update

**Summary:** Rewrote all analysis error messages to be diagnosis-only, added `ANALYSIS_ERROR_HINTS` for per-code prescriptions with a generic "try again" fallback, and updated `AnalysisState` to render the dynamic hint.

**Brainstorming:** Three problems existed: weak messages (`invalid-key`, `no-models`, `unknown` all said "Something went wrong"), `parse-error` and `invalid-response` were identical strings, and the hardcoded "Click to try again" hint was wrong for non-retryable errors like `invalid-key` (requires reconnect, not retry). Option D was chosen: messages stay as diagnosis, a `Partial<Record<AiErrorCode, string>>` hint map provides per-code prescriptions, with the generic `Click "[actionLabel]" to try again.` as fallback for retryable errors with no specific guidance.

**Prompt:** Update error messages with meaningful content. Messages = diagnosis only. Add ANALYSIS_ERROR_HINTS map with per-code action guidance; fallback to generic "try again" for retryable codes with no specific hint.

**What changed:**
- `ai-analysis/utils/analysis-messages.ts` — ANALYSIS_ERROR_MESSAGES rewritten (diagnosis only); ANALYSIS_ERROR_HINTS Partial map added (network/rate-limit/token-limit/server-error/invalid-key/no-models/min-campaigns); NON_RETRYABLE_CODES removed (superseded); TOKEN_LIMIT_MESSAGES updated with session-focused copy
- `ai-analysis/components/shared/AnalysisState.vue` — imports ANALYSIS_ERROR_HINTS; adds errorHint computed (map lookup with generic fallback); template uses errorHint instead of hardcoded string

**Key decisions & why:**
- Partial map not full Record — only codes that need custom guidance are listed; absence = generic fallback, no need to enumerate retryable codes explicitly
- Generic fallback uses actionLabel prop — stays in sync if the button label ever changes
- server-error gets a specific hint ("Try again in a moment") — slight improvement over generic since it implies waiting, not immediate retry


## [#344] Hoist loading state to top-level exclusive branch in AnalysisState
**Type:** refactor

**Summary:** Restructured AnalysisState.vue template so `status === 'loading'` is the outermost exclusive check, making it structurally impossible for the spinner to co-render with the token-limit notice or any other state.

**Brainstorming:** The token-limit notice was a standalone `v-if` independent of the main `v-else-if` chain, meaning it could render alongside the loading spinner if `tokenLimitReached` became true mid-request. The fix was to hoist loading out as the first `v-if`, wrap all other branches in a `<template v-else>`, and remove the now-redundant `status !== 'loading'` guard concern from the notice. Inside the `v-else`, the existing idle/error/result chain remains unchanged.

**Prompt:** Refactor AnalysisState.vue so loading has exclusive top-level priority — no other state can render while loading.

**What changed:**
- `ai-analysis/components/shared/AnalysisState.vue` — loading moved to top-level `v-if`; all other branches (token-limit notice, idle, error, result) wrapped in `<template v-else>`; indentation corrected inside result block

**Key decisions & why:**
- `<template v-else>` wrapper — renders no DOM element, keeps the flat `.ai-panel` structure unchanged
- Loading first, not last — makes the priority hierarchy readable top-to-bottom: loading → token-limit → idle/error/result


## [#345] Refactor Spinner to SVG with breathing arc animation, remove props
**Type:** refactor

**Summary:** Replaced the CSS border-trick spinner with an SVG material-style breathing arc, removed all props in favour of class pass-through for size and color.

**Brainstorming:** The old spinner was a `<span>` with a border-radius and a top-border color trick — functional but visually plain. Removing props lets the caller control size with Tailwind w-*/h-* classes and color via text-* (since SVG uses currentColor), which is simpler and more composable. For animation, the material indeterminate spinner pattern was chosen: a rotating SVG combined with a stroke-dasharray animation that makes the arc appear to grow and shrink, creating a more elaborate "chasing tail" effect. Circumference at r=9.5 ≈ 60; arc peaks at 45 units (75%), dashoffset drives the head/tail offset cycle.

**Prompt:** Refactor Spinner: remove props (size/variant), add an SVG with a material-style breathing arc animation, update all call sites to use class-based sizing.

**What changed:**
- `ui/Spinner.vue` — full rewrite: SVG with track circle (opacity 0.2) + arc circle; spinner-rotate (1.4s linear) + spinner-dash (1.4s ease-in-out) keyframes; no props
- `ai-analysis/components/shared/AnalysisState.vue` — restored ai-panel root class (linter had zeroed it), removed duplicate loader block introduced by linter, updated `<Spinner class="w-16 h-16" />`
- `ai-connection/components/AiConnectionForm.vue` — updated `<Spinner class="w-3.5 h-3.5" />` (color inherits from btn-primary text-on-primary)

**Key decisions & why:**
- currentColor for both track and arc strokes — inherits from parent text color; variant prop becomes unnecessary
- No default size in component CSS — avoids specificity conflicts with Tailwind; callers always provide size class
- stroke-dasharray/dashoffset on arc circle, rotation on SVG element — standard separation that produces the material indeterminate look


## [#346] Add InlineNotification component to ui library
**Type:** feature

**Summary:** Created a reusable inline notification box component with five status variants, per-variant icons, ARIA role/live region wiring, and slots for extra content and action buttons.

**Brainstorming:** The AnalysisState component already had two well-styled inline boxes (notice/error) using the bg-*/10 + border-*/15 pattern. The request was to extract this into a generic, reusable ui component that handles the five status variants needed across the app: error (operational failure), danger (severe/destructive), warning (caution), info, and default (neutral, no color semantics). The icon is optional and auto-selected per variant. ARIA is wired structurally: error and danger are assertive alerts (screen reader interrupts); warning and info are polite status regions; default has no ARIA role. Two slots: default for additional content below the message, and #actions for action buttons.

**Prompt:** Create a reusable InlineNotification component in the ui folder. States: error, warning, danger, info, and a default neutral state. Each state has an auto-selected icon (icon is optional via showIcon prop). Styling follows the AnalysisState box pattern. ARIA role and aria-live are set based on variant. Provide a default slot for extra content and an #actions slot for action buttons. Add a BellIcon for the neutral default state. Export everything from the ui barrel. Do not implement anywhere yet.

**What was built:**
- `app/src/ui/icons/BellIcon.vue` — new Lucide-style bell SVG; neutral icon for the default notification state
- `app/src/ui/InlineNotification.vue` — new component; variant prop (InlineNotificationVariant); title/message/showIcon props; auto icon map; aria role+live computed from variant; default + #actions slots; scoped flat styles with per-variant bg/border/text tokens; exports InlineNotificationVariant type
- `app/src/ui/icons/index.ts` — added BellIcon export
- `app/src/ui/index.ts` — added InlineNotification default export and InlineNotificationVariant type export

**Key decisions & why:**
- Five variants (error/danger/warning/info/default) rather than reusing NotificationVariant — error vs danger carry different semantic weight; default is a genuinely neutral state with no color connotation
- error → AlertCircleIcon, danger → AlertTriangleIcon, both in danger red — icon shape communicates the distinction (operational vs structural severity)
- BellIcon created for default — no existing icon was semantically neutral enough
- aria-live="assertive" only for error/danger, polite for warning/info, omitted for default — matches WCAG guidance for urgency levels
- Type exported directly from the component file, re-exported via barrel — consistent with DataTableColumn/Tab pattern already in the project


## [#347] Fix InlineNotification compile error — move type export to separate script block
**Type:** fix

**Summary:** `export type` is not valid inside `<script setup>`; moved the type definition to a companion `<script lang="ts">` block so it can be re-exported from the barrel.

**Brainstorming:** Vue 3's `<script setup>` is compiled as a function body, not a module, so `export` statements are syntax errors. The fix is a dual-block pattern: a plain `<script>` block owns the exported type, and `<script setup>` handles the runtime logic — the type is automatically in scope across both blocks without a self-import.

**Prompt:** Fix compile error in InlineNotification.vue caused by `export type` inside `<script setup>`.

**What changed:**
- `app/src/ui/InlineNotification.vue` — extracted `InlineNotificationVariant` type into a separate `<script lang="ts">` block above `<script setup>`; removed invalid self-import

**Key decisions & why:**
- Dual script-block pattern (plain `<script>` + `<script setup>`) is the Vue 3 canonical way to export types from SFC files — avoids circular imports and keeps the type co-located with the component


## [#348] Rename InlineNotification to Notification, fix invalid Tailwind class
**Type:** fix

**Summary:** Renamed the component file to Notification.vue and replaced `bg-surface-secondary/50` with `bg-surface-elevated` — `surface.secondary` does not exist in the Tailwind config.

**Brainstorming:** Straightforward rename + class audit. The only invalid class was `bg-surface-secondary` — the `surface` token in tailwind.config.js has no `secondary` sub-key (it has DEFAULT/elevated/raised/overlay/hover/active). All opacity-modifier classes (`bg-danger/10`, `border-warning/15`, etc.) are valid because those color tokens use `<alpha-value>` in their definitions. `bg-surface-elevated` is the correct neutral surface step for the default notification variant.

**Prompt:** Rename InlineNotification to Notification and remove style classes no longer in the Tailwind config.

**What changed:**
- `app/src/ui/InlineNotification.vue` → `app/src/ui/Notification.vue` — file renamed
- `app/src/ui/Notification.vue` — `bg-surface-secondary/50` replaced with `bg-surface-elevated`
- `app/src/ui/index.ts` — updated export to reference `Notification.vue`

**Key decisions & why:**
- `bg-surface-elevated` for the default variant — the closest valid token that gives a subtle lifted surface without color connotation; no opacity needed since the token itself is already a distinct surface layer


## [#349] Refactor Notification: slots for title/message, reuse NotificationVariant, remove actions slot
**Type:** refactor

**Summary:** Replaced title/message string props with content projection (#title slot + default slot), reused the existing NotificationVariant type with variant made optional, removed the #actions slot, and dropped the custom InlineNotificationVariant type entirely.

**Brainstorming:** The previous design had title and message as string props and a custom type. Using slots for content projection is more flexible and consistent with Vue patterns. Making variant optional (undefined = neutral/no-color state) is cleaner than a 'default' string variant and lets the component reuse the existing NotificationVariant type. Removing the actions slot keeps the component focused. Default icon/title colors moved to base class definitions rather than nested inside .notification to avoid IDE @apply warnings in plain nested selectors.

**Prompt:** Remove #actions slot, add content projection for title and message, clean up inputs, reuse NotificationVariant or undefined.

**What changed:**
- `app/src/ui/Notification.vue` — removed title/message/actions; added #title named slot + default slot; variant now optional NotificationVariant (undefined = neutral); added success variant styling; removed InlineNotificationVariant custom type and dual script block; default icon/title colors moved to base class definitions
- `app/src/ui/index.ts` — removed InlineNotificationVariant type re-export

**Key decisions & why:**
- variant?: NotificationVariant instead of InlineNotificationVariant — reuses existing type, undefined replaces the 'default' string cleanly
- Default colors on .notification-icon/.notification-title base classes, not nested inside .notification — avoids IDE @apply warnings for non-variant nested selectors
- #title named slot + unwrapped default slot — title gets a styled wrapper, body content is unrestricted


## [#350] Notification: rectangle InfoIcon, XPolygonIcon for error, #action slot in header
**Type:** update

**Summary:** Updated InfoIcon to use a rounded rectangle background, added a new XPolygonIcon (diamond + X) for the error state in Notification, and added an #action slot next to the title header row.

**Brainstorming:** InfoIcon background changed from circle to rounded rect to match the requested visual — the info lines stay identical, only the background shape changes. A new XPolygonIcon was created rather than modifying AlertCircleIcon, since that icon is also used by toast notifications and changing it would be a broader breaking change. The action slot is wrapped in a flex .notification-head row that only renders when either a title or action is projected, keeping the DOM clean when neither is used.

**Prompt:** For info icon must have a rectangle background. For error lets add a polygon with an x. Maintain my changes. Lets add a section to project one action next to header.

**What changed:**
- `app/src/ui/icons/InfoIcon.vue` — replaced `<circle>` with `<rect x="2" y="2" width="20" height="20" rx="4" />` for rounded rectangle background
- `app/src/ui/icons/XPolygonIcon.vue` — new icon: diamond polygon + X lines
- `app/src/ui/icons/index.ts` — added XPolygonIcon export
- `app/src/ui/Notification.vue` — error state now uses XPolygonIcon; template restructured with .notification-head (flex row, space-between) wrapping #title slot + new #action slot; .notification-head/.notification-action styles added

**Key decisions & why:**
- New XPolygonIcon instead of modifying AlertCircleIcon — toast still uses the circle icon; keeping them separate avoids unintended visual regressions
- .notification-head only renders when $slots.title or $slots.action has content — no empty wrapper in the DOM for body-only notifications
- .notification-action shrink-0 — prevents the action from being compressed by a long title


## [#351] XPolygonIcon: change to hexagon (6-sided polygon)
**Type:** fix

**Summary:** Replaced the 4-sided diamond polygon in XPolygonIcon with a regular hexagon (6 sides).

**Brainstorming:** The points are computed for a regular hexagon centered at (12,12) with radius 10, at 0°/60°/120°/180°/240°/300°: (22,12) (17,20.7) (7,20.7) (2,12) (7,3.3) (17,3.3). X lines unchanged.

**Prompt:** Not the correct polygon, it has to have 6 sides.

**What changed:**
- `app/src/ui/icons/XPolygonIcon.vue` — polygon points updated to a regular hexagon

**Key decisions & why:**
- Flat-top orientation (first point at 3 o'clock) — natural for a 0° start angle, visually balanced with the X inside


## [#352] Notification: conditional pl-1 on content when showIcon is true
**Type:** fix

**Summary:** Made the `pl-1` padding on the notification body content conditional on the `showIcon` prop so it only aligns with the icon when one is shown.

**Brainstorming:** The left padding exists to visually align body text with the icon. When showIcon is false there is no icon to align with, so the padding should be absent.

**Prompt:** If showIcon apply padding pl-1 in content.

**What changed:**
- `app/src/ui/Notification.vue` — `pl-1` moved from static class to `:class="{ 'pl-1': showIcon }"`

**Key decisions & why:**
- Binding directly to the `showIcon` prop — same source of truth, no extra computed needed


## [#353] Refactor analysis-messages to object shape with title/message
**Type:** refactor

**Summary:** Converted all message constants in `analysis-messages.ts` from flat strings to `{ title, message? }` objects, renamed `TOKEN_LIMIT_MESSAGES` to `TOKEN_LIMIT_MESSAGE`, and unified `parse-error`/`invalid-response` into a single user-facing message.

**Brainstorming:** The previous structure kept error text and hint text in two separate exports (`ANALYSIS_ERROR_MESSAGES` and `ANALYSIS_ERROR_HINTS`), requiring the component to look up both independently. Consolidating into objects co-locates the title and message for each code, makes the intent clearer, and removes the need for `Partial` typing on hints. `TOKEN_LIMIT_MESSAGES` (plural) was renamed to the singular `TOKEN_LIMIT_MESSAGE` since it represents one notification. `parse-error` and `invalid-response` had distinct technical titles but are indistinguishable to users — both now read "The AI returned an unusable response" with a shared actionable hint.

**Prompt:** Convert analysis messages to a map of objects with title and message. TOKEN_LIMIT_MESSAGES → TOKEN_LIMIT_MESSAGE. Refactor maintaining my changes. Also: parse-error and invalid-response — do we really need separate messages? Make them more meaningful.

**What changed:**
- `app/src/features/ai-tools/ai-analysis/utils/analysis-messages.ts` — `ANALYSIS_ERROR_MESSAGES` changed to `Record<AiErrorCode, { title: string; message?: string }>`, `ANALYSIS_ERROR_HINTS` removed (merged into objects), `ANALYSIS_NOTICE_MESSAGES` changed to `Record<AiAnalysisNoticeCode, { title: string; message: string }>`, `TOKEN_LIMIT_MESSAGES` renamed to `TOKEN_LIMIT_MESSAGE` with `notice`/`hint` keys renamed to `title`/`message`; `parse-error` and `invalid-response` now share the same user-facing title and message
- `app/src/features/ai-tools/ai-analysis/components/shared/AnalysisState.vue` — updated imports; `errorMessage`/`errorHint` computeds read from `errorEntry.title`/`errorEntry.message`; `noticeText` renamed to `noticeEntry`; template updated to use `TOKEN_LIMIT_MESSAGE.title`/`.message` and `noticeEntry.title`/`.message`

**Key decisions & why:**
- `message` is optional on error entries — codes with no actionable hint fall back to the dynamic `Click "${actionLabel}" to try again.` string in the component, preserving existing fallback behaviour
- `parse-error` and `invalid-response` unified — the distinction is internal; both result in an unusable AI response from the user's perspective, so separate titles add noise without value


## [#354] Polish analysis error messages: polite tone, no dashes, all codes have message
**Type:** update

**Summary:** Made all error messages polite (added "please"), removed em dashes, filled in missing `message` for `timeout` and `unknown`, and tightened the `message` field to required.

**Brainstorming:** Two codes (`timeout`, `unknown`) had no `message`, leaving the component to fall back to a dynamic string. With all codes covered the fallback is dead code. Tone was also inconsistent — some messages used em dashes and imperative phrasing without "please".

**Prompt:** Make try again messages more polite with no dash between them. All errors must have a message.

**What changed:**
- `app/src/features/ai-tools/ai-analysis/utils/analysis-messages.ts` — `message` type changed from optional to required; `timeout` and `unknown` given messages; em dashes removed; "please" added to all actionable hints
- `app/src/features/ai-tools/ai-analysis/components/shared/AnalysisState.vue` — dynamic fallback in `errorHint` removed; now returns `errorEntry.value?.message ?? null`

**Key decisions & why:**
- `message` made required — all codes now have one, so the optional type was misleading and the fallback in the component was unreachable


## [#355] Extract internal constants for repeated error message strings
**Type:** refactor

**Summary:** Pulled repeated message strings into module-level constants so identical values are defined once and referenced, not duplicated.

**Brainstorming:** Three duplicates existed: `'Please try again in a moment.'` shared by `timeout` and `server-error`, and the full `{ title, message }` object shared by `parse-error` and `invalid-response`. Extracting them removes the risk of the copies drifting apart.

**Prompt:** Same messages should be in internal constants and reused.

**What changed:**
- `app/src/features/ai-tools/ai-analysis/utils/analysis-messages.ts` — added module-private `TRY_AGAIN_LATER` string and `UNUSABLE_RESPONSE` object; `timeout`/`server-error` reference `TRY_AGAIN_LATER`; `parse-error`/`invalid-response` reference `UNUSABLE_RESPONSE` directly

**Key decisions & why:**
- Constants are unexported — they are implementation details of this module, not part of its public API


## [#356] Refactor AnalysisState to slot-based projection; min-campaigns as idle warning
**Type:** refactor

**Summary:** Removed unused props from `AnalysisState`, replaced prop-based idle/loading text with named slots, and changed the min-campaigns check to set `status: 'idle'` so `BudgetOptimizationAnalysis` can project a warning notification into the `#idle` slot rather than triggering the generic error path.

**Brainstorming:** `AnalysisState` had five props (`title`, `actionLabel`, `idleText`, `loadingText`, `isButtonDisabled`) and an `analyze` emit that were never consumed in the template — the panel-head they belonged to had been commented out, and the template used named slots for idle/loading instead. `BudgetOptimizationAnalysis` was passing those props as dead bindings while not filling the slots, so idle/loading text never rendered. Setting min-campaigns to `status: 'idle'` (instead of `status: 'error'`) lets the `#idle` slot projection in `BudgetOptimizationAnalysis` handle the warning display — keeping budget-specific logic out of the shared component entirely. No store export needed; `error?.code` is already available in the orchestrator.

**Prompt:** Use AnalysisState slot-based projection for BudgetAnalysis. Clean up unused inputs. Set min-campaigns to idle so the warning can be caught in the idle projection of the budget analysis component.

**What changed:**
- `app/src/features/ai-tools/ai-analysis/components/shared/AnalysisState.vue` — removed props `title`, `actionLabel`, `idleText`, `loadingText`, `isButtonDisabled` and `analyze` emit; removed all commented-out style blocks; idle container changed to `div` to support slot content beyond plain text
- `app/src/features/ai-tools/ai-analysis/components/budget-optimization/BudgetOptimizationAnalysis.vue` — removed dead prop bindings; added `#loading` and `#idle` named slots; `#idle` conditionally shows `Notification variant="warning"` when `error?.code === 'min-campaigns'`, otherwise shows idle text; imports `ANALYSIS_ERROR_MESSAGES` to reuse min-campaigns message text; inline Tailwind classes used instead of `message-title` (scoped to `AnalysisState`, unreachable from slot content)
- `app/src/features/ai-tools/ai-analysis/components/executive-summary/ExecutiveSummaryAnalysis.vue` — removed dead prop bindings; `#loading` and `#idle` slots already present, kept
- `app/src/stores/aiAnalysis.store.ts` — `showOptimizerMinimumError`: changed `setDisplay` from `status: 'error'` to `status: 'idle'` for min-campaigns

**Key decisions & why:**
- `status: 'idle'` for min-campaigns — the constraint is advisory (not enough data yet), not a failure; idle + slot projection is a cleaner model than hijacking the error state
- No new store export — `error` is already available in the orchestrator; `error?.code === 'min-campaigns'` is sufficient to detect the condition in the template
- Scoped `.message-title` not used in slot content — replaced with inline `text-sm font-normal` Tailwind classes since scoped styles from `AnalysisState` cannot reach projected slot content


## [#357] Unify errorEntry/errorMessage/errorHint into single errorDisplay computed
**Type:** refactor

**Summary:** Replaced three separate error computeds with one `errorNotification` that resolves title and message together in a single pass.

**Brainstorming:** `errorEntry`, `errorMessage`, and `errorHint` each re-derived from `props.error` independently. A single computed that returns `{ title, message } | null` avoids the redundancy and makes the dependency chain explicit.

**Prompt:** errorEntry, errorMessage, errorHint should be unified to compute one object once.

**What changed:**
- `app/src/features/ai-tools/ai-analysis/components/shared/AnalysisState.vue` — replaced `errorEntry`, `errorMessage`, `errorHint` with `errorNotification` computed returning `{ title, message } | null`; template updated to `errorDisplay?.title` and `errorDisplay?.message`
