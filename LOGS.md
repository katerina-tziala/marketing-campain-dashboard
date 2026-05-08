
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

