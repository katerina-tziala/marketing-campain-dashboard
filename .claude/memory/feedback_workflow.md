---
name: Development Workflow Rules
description: Mandatory workflow rules for every interaction — full rules live in CLAUDE.md
type: feedback
originSessionId: 19a760d2-a213-4582-a633-f44ced7071d3
---
All workflow rules, log entry format, language rules, and git rules are defined in `CLAUDE.md` at the project root. Read it at the start of every session.

Key rules to never forget:
- Brainstorm and get approval before writing any code for new features or refactors
- Write a docs/vibe-coding-logs.md entry after **every** code change — it is the last tool call before responding
- Every log entry requires both **Brainstorming** and **Prompt** fields
- **NEVER write a docs/vibe-coding-logs.md entry for CLAUDE.md-only syncs** — updating CLAUDE.md or memory files is not a code change and produces zero log entries, no exceptions (user removed entries #431 and #695 for this)
- Keep CLAUDE.md up to date after every change — Status, Architecture, and Feature Checklist must always reflect current state
- English only — all communication, code, comments, and docs
- Never run any git commands — user handles all git operations
- **No BEM** — when refactoring or creating components, use flat class names with `@apply` only; never introduce `__element` or `--modifier` BEM classes
