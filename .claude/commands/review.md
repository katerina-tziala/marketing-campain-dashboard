# /review — Audit changes against project rules

Review the current changes (or the file/folder passed as argument if provided) against the project's coding rules. Report violations; do not auto-fix unless asked.

Scope: $ARGUMENTS (if empty, review all modified files in the working tree)

## What to check

**Import rules**
- Within-feature files must use relative imports (`./`, `../`) — never `@/features/feature-name/...` for internal imports
- Cross-boundary imports must use the `@/` alias — no relative paths that escape the feature
- Import order: (1) Vue/framework, (2) `@/shared/*`, (3) `@/ui`, (4) `@/app`, (5) `@/features/*` cross-feature only, (6) relative within-feature
- UI components must be imported from `@/ui` only — never from `@/ui/primitives`, `@/ui/charts`, etc.
- Shared submodules imported from barrel folders (`@/shared/utils`, `@/shared/portfolio-analysis`) — not from specific files

**Vue template rules**
- Props bound with kebab-case in templates (`:my-prop`, not `:myProp`)
- Events listened with kebab-case (`@my-event`, not `@myEvent`)
- v-model modifiers in kebab-case (`v-model:my-value`, not `v-model:myValue`)
- camelCase only in script blocks

**Styling rules**
- No BEM — no `__element` or `--modifier` class naming anywhere
- New components use Tailwind utility classes directly in the template — no `<style>` block unless a style cannot be expressed as a Tailwind class
- Never use `border-border` — use plain `border` for default border color

**Naming rules**
- Non-component files use kebab-case filenames (e.g. `chart-theme-tokens.ts`, not `resolveChartsThemeTokens.ts`)
- Composable files may use `useFoo.ts` convention
- Avoid `build` prefix for accessor functions — use `get` instead

**Constants**
- Prop defaults and magic numbers declared as named `const` above `defineProps`, not inline with `??`
- Module-level constants use SCREAMING_SNAKE_CASE

**General**
- No comments that describe WHAT the code does — only WHY (hidden constraint, workaround, non-obvious invariant)
- No features, abstractions, or error handling beyond what the task requires
- No backwards-compatibility shims for removed code

## Output format

Group violations by file. For each violation state: the rule broken, the line or pattern, and the fix needed. If no violations are found, confirm the changes are clean.
