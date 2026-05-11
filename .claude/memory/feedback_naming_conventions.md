---
name: Naming convention preferences — avoid "build"
description: Do not use "build" as a function naming convention; prefer "get" for accessor functions
type: feedback
originSessionId: 780fa77d-441e-4bdf-b19c-ae6f217fcfef
---
**Rule:** Avoid using "build" as a function naming convention. Prefer "get" for functions that construct or return data structures.

**Why:** "build" implies side effects or complex construction logic, while "get" is clearer for simple accessor/transformation functions that have no side effects and simply return data.

**How to apply:** When naming a function that returns a constructed value or data structure (e.g., building scope objects, creating configuration objects), use a "get" prefix instead. Example: `getPortfolioScope()` rather than `buildPortfolioScope()`.
