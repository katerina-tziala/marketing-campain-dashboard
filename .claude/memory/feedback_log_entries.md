---
name: Log Entry After Every Change
description: CRITICAL — write docs/vibe-coding-logs.md entry after every code change, before responding
type: feedback
---

Write a docs/vibe-coding-logs.md entry after every code change — including small ones like moving a button or fixing a style. The log entry is the last tool call before responding. Always append to the end of docs/vibe-coding-logs.md — never prepend or insert before existing entries.

There is no short entry. Every change uses the full entry format. All six sections are required: **Type**, **Summary**, **Brainstorming**, **Prompt**, **What was built / What changed**, **Key decisions & why**.

**Formatting rules:**
- `**Type:**` immediately after the `##` heading — no blank line between them
- One blank line between every section within an entry
- Two blank lines between entries
- No `---` separators
- No extra sections

**Why:** User corrected missing sections across all entries in three rounds and manually cleaned up formatting. These rules are non-negotiable.

**How to apply:** After the last file edit → append the log at the bottom of docs/vibe-coding-logs.md → respond. Never skip, never prepend. Full format is in CLAUDE.md.
