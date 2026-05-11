# /brainstorm — Structured brainstorm for a new feature or refactor

Topic: $ARGUMENTS

## Step 1 — Brainstorm

Present a structured brainstorm covering:

- **What is being built or changed** — restate the goal in one sentence
- **Scope** — what is in scope and what is explicitly out of scope
- **Files affected** — list every file likely to be created or modified, with a one-line reason for each
- **Approach options** — at least two ways to implement this; explain trade-offs for each
- **Recommended approach** — state which option you recommend and why
- **Open questions** — anything ambiguous that the user should decide before implementation starts
- **Risks** — anything that could go wrong or cause regressions

Then **stop and wait** for explicit approval. Directional feedback ("what about X?", "can we also...") is NOT approval. Only proceed to implementation when the user gives a clear signal: "go", "yes", "build it", "looks good", or equivalent.

## Step 2 — After implementation is complete

Once all code changes are done and confirmed working, ask the user:

> "Ready to write the LOGS.md entry? I'll need: the entry number (check the last entry in `docs/vibe-coding-logs.md`), a title, and confirmation of what was built."

Do not write the LOGS.md entry automatically. Wait for the user to confirm they are ready and provide the required details. The log entry must follow the full format defined in CLAUDE.md — all six sections required.
