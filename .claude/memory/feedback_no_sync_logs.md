---
name: Never log CLAUDE.md syncs
description: docs/vibe-coding-logs.md entries must never be written for CLAUDE.md-only updates — syncing docs is not a loggable event
type: feedback
originSessionId: 10520e0b-b152-4f94-bea4-3d39fa49ef46
---
**ABSOLUTE RULE — NO EXCEPTIONS:** Never write a docs/vibe-coding-logs.md entry when the only thing changed is CLAUDE.md (or any other documentation/memory file). This applies regardless of who triggered it, how large the sync was, or whether the user explicitly asked for the sync.

**Why:** User has corrected this multiple times — dedicated sync entries #431 and #695 were both removed from the log. CLAUDE.md updates are documentation maintenance, not code changes.

**How to apply:**
- Only log entries that describe actual source code changes (components, stores, utils, types, styles, etc.)
- CLAUDE.md updates that accompany a code change are bundled into that code change's log entry — never written as their own entry
- A session that only syncs CLAUDE.md or memory files produces zero log entries
- There is no rationalization that makes a CLAUDE.md-only sync loggable — not "user triggered it", not "it was a large audit", not anything
