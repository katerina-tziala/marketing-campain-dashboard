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
