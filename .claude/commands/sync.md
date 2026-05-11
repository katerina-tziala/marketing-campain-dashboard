# /sync — Sync CLAUDE.md against the actual codebase

Check whether CLAUDE.md accurately reflects the current state of the project. Report discrepancies only — do not fix anything unless asked.

## What to check

**Architecture section**
- For every file or folder listed in the Architecture tree, verify it exists under `app/src/`.
- Flag any documented path that no longer exists.
- Flag any file or folder present in `app/src/` that is not documented (focus on meaningful additions — skip build artefacts, `node_modules`, `.env` files).

**Feature Checklist**
- Review each checklist item marked `[x]`.
- If any item references a component, store, or composable that no longer exists or has been renamed, flag it.
- If there are implemented features visible in the codebase that are not listed at all, flag them.

**Status paragraph**
- Read the opening Status paragraph and check whether it still accurately describes the current implemented state.
- Flag any claims that appear outdated or missing.

## Output format

Report findings as three sections:
1. **Paths out of sync** — documented paths that don't exist, or existing paths not documented
2. **Checklist gaps** — items that are stale or missing
3. **Status drift** — anything in the Status paragraph that no longer holds

If everything is in sync, say so clearly.

## Important

This is a documentation audit, not a code change. Do NOT write a LOGS.md entry for this operation — syncing docs is not a loggable event (see `feedback_no_sync_logs.md`).
