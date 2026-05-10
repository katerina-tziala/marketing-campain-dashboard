# Memory Index

- [feedback_workflow.md](feedback_workflow.md) — Mandatory workflow rules: brainstorm→build→update docs for every interaction
- [feedback_brainstorm_first.md](feedback_brainstorm_first.md) — Never switch implementation approach mid-task without confirming with user — ambiguous requests require stopping to ask
- [feedback_log_entries.md](feedback_log_entries.md) — CRITICAL: write LOGS.md entry after every code change, before responding — user corrected this multiple times
- [feedback_language.md](feedback_language.md) — English for all communication, code, comments, and documentation files — no exceptions
- [project_context.md](project_context.md) — Marketing Campaign Dashboard: MBA project, docs complete (#680), portfolio domain @/shared/portfolio, per-tab autoRefreshEnabled, recent accessibility changes
- [feedback_vue_naming.md](feedback_vue_naming.md) — Vue templates use kebab-case for props/events; camelCase only in script
- [feedback_no_sync_logs.md](feedback_no_sync_logs.md) — Never write a LOGS.md entry for CLAUDE.md-only syncs — not a loggable event
- [feedback_border_class.md](feedback_border_class.md) — `border-border` does not exist; use plain `border` for default border color
- [feedback_naming_conventions.md](feedback_naming_conventions.md) — Avoid "build" as naming convention; use "get" for accessor/constructor functions
- [feedback_file_naming.md](feedback_file_naming.md) — Util files must use kebab-case; never name a file after the function it exports (e.g. chart-theme-tokens.ts not resolveChartsThemeTokens.ts)
- [feedback_memory_location.md](feedback_memory_location.md) — All memory files must live in `.claude/memory/` inside the project — never write outside the project boundaries
