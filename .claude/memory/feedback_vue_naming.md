---
name: Vue component input/output naming convention
description: Props and events in Vue templates must use kebab-case; camelCase is only for JS/TS (script block)
type: feedback
originSessionId: 9667b5bc-3672-4348-b52c-11be675943aa
---
In Vue components, naming must follow case by context:
- JavaScript / TypeScript (script block) → camelCase (props definitions, emit names, variables)
- Templates / HTML → kebab-case (prop bindings `:my-prop`, event listeners `@my-event`, v-model modifiers `v-model:my-value`)

**Why:** Explicit rule from user. Vue supports both, but the project enforces kebab-case in all template attribute positions — binding names, event names, v-model argument names.

**How to apply:** Any time writing or reviewing a Vue `<template>`: `:modelValue` → `:model-value`, `@myEvent` → `@my-event`, `@update:modelValue` → `@update:model-value`. Script-side definitions stay camelCase.
