---
name: Never log CLAUDE.md syncs
description: LOGS.md entries must never be written for CLAUDE.md-only updates — syncing docs is not a loggable event
type: feedback
originSessionId: 10520e0b-b152-4f94-bea4-3d39fa49ef46
---
Never write a LOGS.md entry for syncing or updating CLAUDE.md alone. CLAUDE.md updates are part of every code change task and do not warrant their own log entry.

**Why:** User explicitly called this out and had a dedicated sync entry (#431) removed from the log.

**How to apply:** Only log entries that describe actual code changes. CLAUDE.md updates are always bundled into the entry for the code change they accompany — never standalone.
