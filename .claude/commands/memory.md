# /memory — Review and update project memory files

Review all memory files in `.claude/memory/` and report on their accuracy. Fix stale entries when the correct state is clear; flag anything that needs user input.

## Step 1 — Load the index

Read `.claude/memory/MEMORY.md` to get the full list of memory files.

## Step 2 — Check each file

For every file listed in the index:

- Read the file content
- Assess whether the information is still accurate based on the current state of `CLAUDE.md`, `docs/`, and `app/src/`
- Flag any claim that references a file path, function name, type name, or architectural pattern that may have changed
- Check dates and entry numbers in `project_context.md` — verify the latest log entry number against `docs/vibe-coding-logs.md`

## Step 3 — Report

Produce a summary:
- **Up to date** — files that are accurate and need no changes
- **Updated** — files you corrected (list what changed)
- **Needs input** — files with claims you cannot verify without user clarification

## Step 4 — Write updates

For any file you can confidently correct, write the updated content directly to `.claude/memory/<file>.md`. If the MEMORY.md index itself is out of date (missing entries, stale descriptions), update it too.

## Important

All memory reads and writes must stay within `.claude/memory/` inside the project. Never read from or write to `~/.claude/projects/...` or any path outside the project.
