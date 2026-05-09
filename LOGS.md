
## [#201] DashboardHeader enhancements — channels detail, disabled AI button, connected dot, camelCase emit

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

## [#202] Provider instruction links and Tailwind apply formatter refinement

**Type:** update

**Summary:** Added external provider-console links to AI connection instructions, normalized provider help steps to a single object structure, introduced link utility styling, and extended the Tailwind `@apply` formatter so wrapped utility lines use a tab continuation and duplicate utilities are removed.

**Brainstorming:** The AI connection instructions needed direct paths to the provider consoles without turning the instruction text into raw HTML or provider-specific template logic. Keeping all help steps as `{ text, linkText?, href? }` gives the renderer one stable shape: linked steps render an external anchor, while plain steps render normal text. The new shared link utility makes anchor styling reusable instead of leaving link presentation inside one feature component. Separately, the Tailwind formatter already enforced sorted `@apply` blocks; adding duplicate removal and a tabbed continuation keeps style blocks cleaner and makes formatting deterministic across Vue and SCSS files.

**Prompt:** Add links for Groq Console and Google AI Studio in provider instructions with `target="_blank"`. Make all instruction steps use the same `{ text }` structure, rendering normal text when `linkText` or `href` is missing. Extend the Tailwind formatter to add a tab to new `@apply` lines and remove duplicate rules, then apply the formatter to the changed files.

**What changed:**

- `app/src/features/ai-tools/providers/utils/providers-meta.ts` — changed provider help steps from mixed strings and linked objects to a uniform `ProviderHelpStep` object shape with optional `linkText` and `href`; added Groq Console and Google AI Studio URLs
- `app/src/features/ai-tools/ai-connection/components/AiConnectionInstructions.vue` — renders linked provider steps as external anchors with `target="_blank"` and `rel="noopener noreferrer"`; renders steps without link metadata as plain text
- `app/src/styles/utilities/_link.scss` — added reusable `.link` and focus-visible utility styling for inline links
- `app/src/styles/utilities/index.scss` — included the new link utility partial
- `app/scripts/format-tailwind-apply.mjs` — deduplicates utilities inside each `@apply` block and indents wrapped continuation lines with one tab after the current rule indentation
- `app/src/**/*.vue` and `app/src/**/*.scss` files containing Tailwind `@apply` rules — reformatted mechanically with the updated formatter, preserving sorted utilities while normalizing continuation indentation and removing duplicate utilities

**Key decisions & why:**

- Uniform step objects over mixed string/object values — one data shape makes provider help copy easier to extend and safer to render
- Optional link metadata — instructions can stay plain text unless both `linkText` and `href` are present
- External links use `noopener noreferrer` — provider consoles open in a new tab without granting the new page access to the app window
- Shared link utility over feature-local styling — link appearance and focus behavior can be reused consistently across the app
- Formatter-owned deduplication — repeated Tailwind utilities are mechanical noise and should be removed by tooling rather than by manual review
- Tab continuation for wrapped `@apply` blocks — nested utility lines now stand out from the rule indentation while remaining deterministic under the formatter

## [#203] Move chart ARIA labels to rendered canvases

**Type:** accessibility

**Summary:** Updated reusable Chart.js wrapper components so chart accessible names are forwarded to the actual `vue-chartjs` components, which render the `<canvas role="img">`, instead of being applied to the outer layout containers.

**Brainstorming:** The chart wrappers already receive meaningful `aria-label` values from feature components, but the label belonged on the semantic image element rather than the surrounding sizing container. Since `vue-chartjs` renders canvases with `role="img"` and supports an `ariaLabel` prop through Vue's kebab-case binding, forwarding `aria-label` directly to `Bar`, `Doughnut`, and `Bubble` keeps the accessible name on the element assistive technology interprets as the chart. `aria-describedby` was considered, but removed because the current app does not provide separate chart description text.

**Prompt:** Move ARIA labels for charts into the component we use from the library. The canvas elements have `role="img"`, so attach `aria-label` to the chart elements directly. Do not keep unused `aria-describedby` forwarding.

**What changed:**

- `app/src/ui/charts/components/BarChart.vue` — removed `role="img"` and `aria-label` from the outer wrapper; forwards computed `chartAriaLabel` to the rendered `Bar` component; filters `aria-label` and `role` out of container attrs
- `app/src/ui/charts/components/GroupedBarChart.vue` — moved the accessible label from the wrapper to the rendered `Bar` component and keeps layout attrs on the container
- `app/src/ui/charts/components/DonutChart.vue` — forwards `aria-label` to `Doughnut` so the generated canvas receives the accessible name
- `app/src/ui/charts/components/BubbleChart.vue` — forwards `aria-label` to `Bubble` while preserving non-semantic wrapper attrs on the outer container

**Key decisions & why:**

- Label the canvas, not the wrapper — the library canvas is the element with `role="img"`, so it should own the accessible name
- Keep wrapper attrs for layout concerns — classes and non-ARIA attrs still belong on the sizing container
- Filter wrapper `role` and `aria-label` — avoids duplicate semantics and prevents stale labels from landing on the container
- Omit `aria-describedby` — no chart description elements currently exist, so forwarding it would add API surface without current value

## [#204] Improve drawer, file input, table header, and chip accessibility

**Type:** accessibility

**Summary:** Addressed several accessibility audit findings across the AI drawer, CSV file upload, duplicate-row selection table, and channel filter chips. The pass also adjusted nearby spacing and typography so focus rings and compact AI content remain readable.

**Brainstorming:** The closed responsive drawer used `aria-hidden` while keeping focusable AI controls mounted, which can leave keyboard-reachable elements inside a hidden subtree. The native file input inside the custom dropzone also needed its own accessible name, even though the visible dropzone button is labeled by the form control. The duplicate review table used an empty selection header with `aria-label`; replacing it with real screen-reader text is more robust for table-header audits. Channel chips needed readonly focus styling to preserve keyboard visibility, and small padding adjustments were needed so rings are not clipped by tight containers.

**Prompt:** Improve accessibility issues found during testing: use `inert` for the responsive drawer instead of hiding focusable descendants with `aria-hidden`, label the hidden file input, give the duplicate table selection header discernible text, and keep readonly chip focus-visible styling visible. Also account for the padding adjustments made so focus rings render fully.

**What changed:**

- `app/src/ui/drawer/ResponsiveDrawer.vue` — replaced closed-state `aria-hidden` with an `inert` binding so mounted drawer contents are not focusable when the desktop drawer is closed
- `app/src/ui/forms/FileDropzone.vue` — added optional `fileInputLabel` and applies it as the native file input `aria-label`, with `Choose file` as the fallback
- `app/src/features/data-transfer/components/UploadDataForm.vue` — passes `Choose campaign data CSV file` to the file dropzone input label
- `app/src/ui/table/TableHeader.vue` — added `visuallyHiddenLabel` support so non-sortable headers can render real `sr-only` text
- `app/src/features/data-transfer/components/data-validation/review-duplications/CampaignDuplicationsTable.vue` — changed the selection column from an empty label with `ariaLabel` to a visually hidden `Select` header
- `app/src/ui/primitives/Chip.vue` — added readonly `:focus-visible` ring styling so focus remains visible without enabling interaction
- `app/src/features/campaign-performance/components/channel-filters/ChannelFilterChips.vue` — added horizontal padding and matching negative margin so chip focus rings have room to render
- `app/src/ui/primitives/Button.vue` — restored wider horizontal button padding so focus rings and button content have more comfortable spacing
- `app/src/ui/forms/FormControl.vue` — added spacing below fieldset legends to improve grouped form layout
- `app/src/features/ai-tools/ai-analysis/AiAnalysis.vue` and `AnalysisHeader.vue` — added small top spacing around AI analysis content and header metadata
- `app/src/features/ai-tools/ai-analysis/components/AnalysisState.vue`, `app/src/features/ai-tools/ai-connection/components/AiConnectedStatus.vue`, and `AiConnectionForm.vue` — shifted secondary copy from `text-typography-soft` to `text-typography-muted`

**Key decisions & why:**

- `inert` over `aria-hidden` for the closed drawer — it prevents focus and interaction in the hidden subtree instead of only hiding it from assistive technology
- Explicit native file input label — custom file controls still need the underlying input to have a discernible accessible name
- Real hidden text for table headers — `sr-only` header content satisfies table semantics more reliably than an empty `<th>` with only `aria-label`
- `:focus-visible` only for readonly chips — keyboard focus receives a visible ring without adding `:focus-within` behavior or changing pointer interaction
- Padding around chip containers — focus rings need physical space so accessibility styling is visible, not clipped by compact layout constraints
- Formatter pass after spacing edits — Tailwind `@apply` rules were normalized with the project formatter before verification
