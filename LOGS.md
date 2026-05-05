 
## [#0] Logo SVG: create marketing intelligence chart logo
**Type:** design/update

**Summary:** Created the app's core logo mark: a compact analytics symbol combining three vertical performance bars with an exploded semicircle chart. The mark establishes the product identity around marketing intelligence, campaign mix, allocation, and optimization.

**Brainstorming:** The logo needed to feel native to a marketing intelligence dashboard rather than like a generic SaaS badge. The bars provide the stable reporting/readout side of the product, while the separated semicircle pieces suggest budget allocation, channel mix, and insight extraction. Several slice-balance directions were explored: perfectly even pie pieces felt too generic, while overly separated pieces felt broken. The chosen direction keeps uneven pieces so the mark reads as real portfolio allocation, with the pink slice acting as the energetic optimization/accent piece and the blue/purple pieces anchoring the chart shape.

**Prompt:** Create and refine a logo for the marketing dashboard using bars plus chart/pie pieces. Make the chart pieces larger, tune the spacing between pieces, align the top blue piece with the third bar radius and the bottom purple piece with the bar bottom, balance the slice proportions, and keep the final logo expressive but still recognizable as a chart mark.

**What changed:**
- `app/src/assets/logo.svg` — created/refined as the primary app logo SVG with three rounded vertical bars and four semicircle chart slices
- `app/src/assets/logo.svg` — tuned bar spacing so the three columns sit as a compact chart group
- `app/src/assets/logo.svg` — enlarged the semicircle chart pieces and adjusted their positions so the top blue piece aligns with the third bar's rounded top area and the bottom purple piece aligns with the bar baseline
- `app/src/assets/logo.svg` — balanced slice proportions so blue is larger than the bottom purple piece and the pink accent piece has more visual energy than the light-purple supporting piece
- `app/src/assets/logo.svg` — used a teal/blue/indigo gradient for bars and distinct cyan, pink, light purple, and deep purple fills for the chart pieces

**Key decisions & why:**
- Bars plus pie pieces instead of an abstract symbol — directly communicates dashboards, performance metrics, spend mix, and campaign analysis
- Uneven pie pieces over equal segments — real marketing portfolios are not evenly distributed; uneven slices make the logo feel analytical and product-specific
- Pink as the expressive accent — gives the logo a sense of movement/optimization without overwhelming the calmer blue and purple data colors
- Keep geometry SVG-native — direct path coordinates keep the mark crisp at favicon/app-icon sizes and avoid raster dependencies for the core identity


## [#1] Logo SVG: equal padding, square viewBox, and gradient stop precision
**Type:** update

**Summary:** Reworked the logo SVG to have equal horizontal padding (2.66 units each side), a square 68.66×68.66 viewBox with content centered vertically, and corrected gradient stops so the light color falls precisely at each bar's midpoint.

**Brainstorming:** The original SVG had no left padding while the right side had a 2.66-unit gap between the light-purple pie piece and the viewBox edge. Equal horizontal padding required matching that gap on the left via a translate. Making the viewBox square required computing the vertical center offset: (68.66 − 48) / 2 = 10.33. Gradient stops were approximate and causing the light hue to land off-center; precise stop positions were calculated by converting each bar's left edge, midpoint, and right edge to percentages of the 38-unit gradient span.

**Prompt:** Can we have same space from the beginning to the first bar? Make the viewBox height 68.66 and move items to be centered vertically — no more changes. Can you check the linear gradients so the light color is always in the middle of the items?

**What changed:**
- `app/src/assets/logo.svg` — added `<g transform="translate(2.66, 10.33)">` to center content in a square 68.66×68.66 viewBox; corrected all nine gradient stop offsets to precise calculated values (0%, 13.2%, 26.3%, 35.5%, 48.7%, 61.8%, 71.1%, 84.2%, 97.4%) so light colors land at bar midpoints and dark colors start at bar edges

**Key decisions & why:**
- Used `translate` on the content group rather than a negative-origin viewBox to keep path coordinates clean and readable
- `gradientUnits="userSpaceOnUse"` gradient coords remain valid inside the `<g transform>` because the spec interprets them in the local coordinate system of the referencing element — no gradient coordinate adjustment needed
- Removed a transparent `<rect>` that was added during iteration — `fill="none"` is invisible and the viewBox itself defines the canvas, so the rect served no purpose


## [#2] Logo SVG: resize viewBox to 72×72 and create dark-background preview
**Type:** update

**Summary:** Updated the logo viewBox to 72×72 with content re-centered, and created a preview copy that fills the viewBox with the app's background color for accurate visual review.

**Brainstorming:** Moving from 68.66 to 72 adds 3.34 units total (1.67 per side). The existing horizontal content positioning within 68.66 was already balanced, so the new translate x = 2.66 + 1.67 = 4.33 preserves that relative spacing while centering within the wider canvas. Vertical center = (72 − 48) / 2 = 12. The preview file needed the HTML background color (`rgb(7, 10, 21)`, from `--neutral-900`) placed as a `<rect>` behind all content so the logo can be reviewed in isolation without opening the app.

**Prompt:** Update logo so viewBox is 72 height and 72 width, align items vertically in the middle, align items horizontally respecting current horizontal space. Create a copy of the logo and use that background in the viewBox.

**What changed:**
- `app/src/assets/logo.svg` — viewBox updated to `0 0 72 72`; `<g transform>` updated to `translate(4.33, 12)` to re-center content
- `app/src/assets/logo.preview.svg` — new file; identical to logo.svg with a `<rect width="72" height="72" fill="rgb(7, 10, 21)" />` as the first child to simulate the app's dark background

**Key decisions & why:**
- New translate x derived by adding half the viewBox width delta to the existing offset: `2.66 + (72 − 68.66) / 2 = 4.33` — keeps the content's relative horizontal balance intact
- Preview file kept as a sibling in `assets/` rather than a separate folder; the `.preview.svg` suffix makes it clear it is not a production asset


## [#3] PWA icon assets: copy to public, wire favicon in HTML
**Type:** update

**Summary:** Copied all icon sizes needed for browser tab, iOS home screen, and future PWA manifest from `assets/Web/` to `public/` with standard naming conventions; replaced `public/favicon.svg` with the app logo on a dark background; wired all icons in `index.html` via `<link>` tags.

**Brainstorming:** The app already had icon exports in `assets/Web/` from a design tool but none of them were referenced anywhere — the favicon was a generic lightning-bolt SVG unrelated to the project logo. PWA icon requirements call for 192×192 (Android manifest/display), 512×512 (install splash), 180×180 apple-touch-icon (iOS home screen), sized PNGs and `.ico` for legacy browsers, and an SVG for modern browsers. The favicon SVG should show the logo with a dark background so it renders correctly on light browser chrome; `logo-dark.svg` (which already included the `<rect>` background) was the correct source. HTML `<link>` ordering follows browser preference: SVG first (modern), `.ico` fallback, sized PNGs for legacy; `apple-touch-icon` is separate and has no `type` attribute.

**Prompt:** Based on the folder assets can you find all assets you need to add nice icon support for the app for a future PWA implementation? Also copy needed files in public folder and then rename. Use logo-dark.svg to create the favicon.svg. Also implement in html so we see icons in tab.

**What changed:**
- `app/public/favicon.svg` — replaced generic lightning-bolt icon with full content of `app/src/assets/logo-dark.svg` (72×72 logo on `rgb(7, 10, 21)` dark background)
- `app/public/favicon.ico` — copied from `assets/Web/favicon.ico` (legacy browser fallback)
- `app/public/favicon-16x16.png` — copied from `assets/Web/favicon-16x16.png`
- `app/public/favicon-32x32.png` — copied from `assets/Web/favicon-32x32.png`
- `app/public/apple-touch-icon.png` — copied from `assets/Web/apple-touch-icon.png` (180×180, iOS home screen)
- `app/public/icon-192x192.png` — renamed from `assets/Web/android-chrome-192x192.png` (manifest display icon)
- `app/public/icon-512x512.png` — renamed from `assets/Web/android-chrome-512x512.png` (manifest install splash icon)
- `app/public/og.png` — copied from `assets/Web/og.png` (Open Graph / social preview)
- `app/index.html` — added five `<link>` tags: `rel="icon"` SVG, `rel="icon"` `.ico` with `sizes="32x32"`, `rel="icon"` 16×16 PNG, `rel="icon"` 32×32 PNG, `rel="apple-touch-icon"` 180×180 PNG

**Key decisions & why:**
- `favicon.svg` uses `logo-dark.svg` (dark background variant) rather than `logo.svg` (transparent) so the logo is readable on light browser chrome where a transparent icon would show invisible paths
- `icon-192x192` / `icon-512x512` naming chosen over `android-chrome-*` to be framework-neutral — these names work for both web manifest `icons` array and generic PWA tooling
- `og.png` included in `public/` now so it is served as a static asset alongside other icon files, ready for Open Graph meta tags when needed
- SVG listed first in `<link>` order so modern browsers use it and fall through to `.ico` / PNGs only when SVG is unsupported; `apple-touch-icon` omits `type` attribute per Apple convention


## [#4] App tooling cleanup: stylelint setup and app-level configuration
**Type:** tooling/cleanup

**Summary:** Added the app-local Stylelint setup, ran the SCSS/Vue style fixer across the app, and cleaned up accidental root-level configuration leftovers so frontend tooling lives under `app/`.

**Brainstorming:** The Vue app already owned the frontend build, lint, format, Tailwind, PostCSS, Vite, and TypeScript setup, so Stylelint belongs beside those files in `app/` rather than at the repository root. Running Stylelint with autofix handled mostly formatting-level SCSS issues: rule spacing, nested selector separation, and modern alpha notation. The root `package-lock.json` was an empty accidental lockfile created outside the app package, and the root VS Code settings duplicated app-specific CSS/SCSS editor behavior, so both were removed to keep the repo boundary clean.

**Prompt:** Run and fix all Stylelint issues in the app. Check whether any configuration should live at app level instead of root, then clean them all.

**What changed:**
- `app/stylelint.config.js` — added Stylelint configuration for SCSS, Vue SFC style blocks, and Tailwind directives
- `app/package.json` — added `stylelint` and `stylelint:fix` scripts and included Stylelint in the combined `check` workflow
- `app/package-lock.json` — updated with Stylelint dependencies
- App Vue/SCSS style blocks — autofixed Stylelint formatting issues, including empty-line separation around nested rules and keyframes
- `app/src/styles/themes/dark/_charts.scss` — converted decimal alpha values to percentage alpha notation in chart theme tokens
- Root `package-lock.json` — removed accidental empty root lockfile; the real package lock remains in `app/`
- Root `.vscode/settings.json` — removed duplicate root editor overrides now covered by `app/.vscode/settings.json`

**Key decisions & why:**
- Keep frontend tooling app-local — this repository has a dedicated `app/` package, so ESLint, Stylelint, Prettier, Tailwind, Vite, PostCSS, TypeScript, and package-lock files should live there
- Let Stylelint own SCSS consistency — autofix is enough for the current issues and keeps hand edits focused on actual configuration boundaries
- Remove accidental root config instead of moving it — the root lockfile had no dependencies and the root VS Code settings only duplicated app-specific behavior
- Verification: `npm run stylelint` and `npm run lint` pass from `app/`
