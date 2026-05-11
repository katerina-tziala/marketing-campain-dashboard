---
name: Memory files live inside the project
description: All memory reads and writes must stay within the project — .claude/memory/ is the only valid memory path
type: feedback
---
**Rule:** Memory files must always be read from and written to `.claude/memory/` inside the project directory. Never read from or write to `~/.claude/projects/.../memory/` or any path outside the project.

**Why:** User explicitly requires all project knowledge to live inside the repo so it is version-controlled and portable. Nothing project-related should exist only on the local machine outside the project folder.

**How to apply:**
- At session start: read `.claude/memory/MEMORY.md`, then load relevant files listed there.
- When saving a new memory: write to `.claude/memory/<name>.md` and add a pointer line to `.claude/memory/MEMORY.md`.
- When updating an existing memory: edit the file at `.claude/memory/<name>.md` directly.
- Never use the system auto-memory path (`~/.claude/projects/...`) for this project.
