# Documentation Index

This folder contains the technical documentation for the Marketing Intelligence Dashboard. It is organised into architecture decisions, feature specifications, and a running engineering log.

---

## Architecture

These documents describe structural decisions that cut across features. Read them before working on cross-cutting concerns like state sharing, provider integration, or prompt strategy.

| Document | What it covers |
|---|---|
| [Software Architecture](architecture/software-architecture.md) | System overview — boundaries, responsibilities, and how the major layers relate |
| [Frontend Architecture](architecture/frontend-architecture.md) | Vue application structure — layers, state management patterns, and feature isolation rules |
| [AI Prompt Architecture](architecture/ai-prompt-architecture.md) | Prompt design, schema constraints, model evaluation strategy, and deterministic generation config |

---

## Features

Each document covers one feature slice — its responsibilities, boundaries, internal design, and the contracts it exposes to the rest of the system. Start here when changing or extending a feature.

| Document | What it covers |
|---|---|
| [Campaign Performance](features/campaign-performance.md) | Portfolio analytics, KPI derivation, chart compositions, channel filters, and campaign table |
| [Data Transfer](features/data-transfer.md) | CSV ingestion, row validation, duplicate detection, and portfolio store hydration |
| [AI Connection](features/ai-connection.md) | Provider connection, model discovery, candidate ranking, and connection state |
| [AI Analysis](features/ai-analysis.md) | Analysis execution, caching, automatic refresh, request cancellation, and token protection |

---

## Engineering Log

| Document | What it covers |
|---|---|
| [Vibe Coding Logs](vibe-coding-logs.md) | Chronological record of every implementation decision — prompts, trade-offs, and what was built |

---

## Assets

Diagrams and brand assets referenced by the documentation above.

| File | Description |
|---|---|
| [system-architecture.svg](assets/system-architecture.svg) | System-level architecture diagram |
| [system-use-case-diagram.svg](assets/system-use-case-diagram.svg) | Use case diagram |
| [logo.svg](assets/logo.svg) / [logo.png](assets/logo.png) | Application logo |

---

## Reading Order

If you are new to the codebase, read in this order:

1. [Software Architecture](architecture/software-architecture.md) — understand the system boundaries
2. [Frontend Architecture](architecture/frontend-architecture.md) — understand the application structure
3. The feature document for the slice you are working in
4. [AI Prompt Architecture](architecture/ai-prompt-architecture.md) — only needed if touching AI provider integration or prompt logic
