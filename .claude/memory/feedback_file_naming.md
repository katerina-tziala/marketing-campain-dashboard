---
name: Util file naming — kebab-case only, no resolver/camelCase names
description: Util files must use kebab-case; do not name them after the function they export (e.g. no resolveChartsThemeTokens.ts)
type: feedback
originSessionId: a3f50a1b-9809-47af-a8b7-36e753589407
---
**Rule:** All non-component files (utils, composables, types) use kebab-case filenames. Do not name a file after the function it exports (e.g. `resolveChartsThemeTokens.ts` is wrong). Use a descriptive kebab-case name instead (e.g. `chart-theme-tokens.ts`). Composable files follow the same rule: `useTheme.ts` is acceptable because it matches the Vue composable convention, but pure util files must be kebab-case.

**Why:** Consistent kebab-case across all non-component files. Function-named files blur the distinction between the file and its export.

**How to apply:** Whenever creating or renaming a util file, use kebab-case. If the file resolves/reads theme tokens, name it `chart-theme-tokens.ts`, not `resolveChartsThemeTokens.ts`.
