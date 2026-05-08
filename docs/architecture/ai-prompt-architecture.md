# AI Prompt Architecture

The AI prompt architecture supports model selection, executive summary generation, and budget optimization for the Marketing Intelligence Dashboard. Its boundary starts with normalized provider/model metadata or portfolio analysis context, and ends with schema-constrained responses that downstream features can validate and render.

This document focuses on prompt strategy and system behavior. For provider connection flow, see [AI Connection](../features/ai-connection.md). For analysis execution, caching, automatic refresh, and token protection, see [AI Analysis](../features/ai-analysis.md).

## System Overview

The AI pipeline exists to turn deterministic analytics data into structured AI-assisted decisions without letting provider variability leak into the rest of the application.

Multiple prompt types exist because each AI task has a different risk profile and output contract:

- Model selection evaluates prepared provider model candidates and returns a ranked compatible model set
- Executive summary interprets portfolio performance into decision-ready business insights
- Budget optimization reasons over allocation signals and returns constrained recommendations

All prompts operate on normalized inputs. Portfolio prompts receive precomputed marketing analysis signals rather than raw CSV rows, so the LLM interprets established metrics instead of recomputing business logic.

## Provider Normalization Strategy

Provider normalization is the boundary between provider-specific APIs and application-level prompt behavior. Providers expose inconsistent metadata, naming conventions, capability flags, limits, and lifecycle labels, so raw provider payloads are not passed directly into prompts.

Models are normalized into a unified candidate shape before model selection. Provider-specific connection code may also filter and sort candidates locally before prompt evaluation. The prompt receives only the fields needed to evaluate suitability, such as provider identity, stable model identifier, text-generation support, context capacity, output capacity, and reasoning-related capability metadata when available.

This reduces provider coupling and keeps ranking behavior comparable across Gemini and Groq. It also reduces prompt branching and token usage because the LLM evaluates a compact application-owned model contract instead of multiple provider payload formats.

## Prompt Architecture

Prompts are structured as reusable rule groups with explicit role, task, scope, reasoning constraints, and output requirements. This keeps prompt intent consistent across providers and makes future changes easier to review.

The architecture prioritizes structurally deterministic outputs. Each prompt asks for one JSON object matching a known schema, with no markdown or surrounding prose. The response content is still probabilistic, but the application can validate its structure before treating it as usable feature output.

Schema enforcement is central because the UI depends on predictable fields, field types, and nesting. The prompts define the expected response shape, while runtime parsing and validation remain responsible for rejecting invalid provider output.

Ranking-based evaluation is used where the system must choose between provider models. Instead of relying only on provider ordering or names, the model selection prompt evaluates candidate suitability for the dashboard's actual AI workloads.

Unsupported inference is reduced through scoped inputs, authoritative derived signals, identifier constraints, and explicit rules against fabricated metrics, invalid identifiers, invented entities, unsupported causes, and out-of-scope trends. Prompts are designed to interpret known data, not discover new facts.

Provider abstraction keeps prompt behavior stable across Gemini and Groq. The prompt layer consumes normalized provider/model data and emits application-level response contracts, so provider-specific discovery and error handling stay outside the prompt strategy.

Prompt modularity and versioning allow each prompt family to evolve independently. Configuration files define the rules for a specific prompt version, while generation code assembles the active prompt from the current input context.

## AI Model Selection Prompt Strategy

Model selection starts after provider discovery and local candidate preparation. Provider-specific model records are converted into a shared candidate shape before they reach the prompt. This gives the evaluation prompt a consistent view of model identity, provider, text-generation support, context capacity, output capacity, and reasoning-related metadata when available.

Irrelevant or unsupported models are filtered before candidate evaluation when provider metadata makes that decision deterministic. For Gemini, local preparation keeps models that support text generation, excludes known unsupported model families, and sorts compatible candidates before AI evaluation. The prompt therefore receives an already filtered and ordered candidate list, not the raw provider model list.

The evaluation prompt ranks suitability for the dashboard's downstream AI tasks. It should not be treated as provider discovery, raw compatibility detection, or user-controlled model choice; it is an application-owned suitability layer over prepared candidates.

The ranking methodology scores models for the application's actual needs:

- analytical reasoning over marketing performance data
- executive summarization quality
- budget optimization suitability
- schema-constrained response reliability
- consistency across repeated requests
- stable identifiers and expected production suitability
- useful context and output limits

Scoring is intentionally conservative. Top scores are reserved for clearly strong candidates, and weaker models are excluded unless the provider returns too few usable options. This protects downstream features from selecting a model that can connect successfully but produce unreliable analytical output.

Identifier integrity is a hard requirement. Returned model identifiers must match provider identifiers exactly, and the evaluation cannot rename, normalize, infer, or invent model IDs. This prevents the application from selecting a model that the provider cannot actually call.

Metadata derivation is limited to display concerns such as user-friendly names and model family labels. These values help the product communicate selected model state without changing the provider identifier used for requests.

Token optimization starts before model evaluation. The system sends only the prepared candidate list needed for connection, limits the returned model set, and prefers models that can handle structured analytical prompts without excessive retries or fallback churn.

Unstable, preview, gated, or low-suitability models are treated cautiously. A model may be technically visible from a provider but still be a poor default for production analytics if access, quota, identifier stability, or output consistency is uncertain.

The model selection response must be schema-constrained JSON. The application expects a ranked list with stable identifiers, derived metadata, and numeric suitability scores that can be machine-validated before enabling AI analysis.

## Executive Summary Prompt Strategy

The executive summary prompt turns portfolio analysis context into concise business interpretation. It is designed for strategic visibility, not tactical budget movement.

The summary focuses on:

- portfolio or selected-subset health
- material performance signals
- strategic priorities
- key risks
- growth outlook
- concise executive takeaways

The prompt favors business analysis over free-form narrative. It asks the model to organize output into known sections so the application can render insights predictably and compare response quality over time.

Narrative consistency is enforced through scope rules. Full-portfolio analysis and selected-subset analysis have different boundaries, and selected-subset prompts may use full-portfolio benchmarks only for context. This prevents filtered views from producing conclusions about data outside the active scope.

Communication is intentionally concise. The prompt discourages generic language, obvious metric restatement, repeated ideas, and entity-by-entity narration. The goal is to surface what changes a decision.

Analytical reasoning must be grounded in the supplied portfolio, channel, campaign, and derived-signal data. Business context may influence interpretation, but it cannot override the measured data or create unsupported conclusions.

Unsupported inference is limited by prohibiting fabricated metrics, unsupported causes, inferred trends, and assumptions outside the provided data. Since uploaded reports represent a single reporting period, the prompt must not infer time-based movement unless that data is explicitly present.

Formatting and output constraints require stable fields for health, bottom line, overview, insights, priorities, risks, and growth outlook. Invalid or unparseable output is treated as provider failure rather than trusted analysis.

## Budget Optimization Prompt Strategy

The budget optimization prompt generates constrained budget recommendations from portfolio analysis signals. It is designed to support allocation decisions while avoiding speculative financial advice.

Optimization goals include:

- improving ROI and budget efficiency
- reallocating existing budget from inefficient areas to stronger opportunities
- identifying expansion opportunities only when evidence supports additional spend
- preserving conversion potential and avoiding over-concentration

The prompt reasons over normalized marketing performance data and derived optimization signals. It does not invent campaigns, channels, budgets, constraints, or trend assumptions.

Tradeoff analysis is built into the recommendation rules. The prompt must weigh source campaign inefficiency, destination campaign scalability, expected impact, confidence, execution risk, and budget limits before recommending a shift.

Budget allocation logic is constrained by precomputed candidates and limits. Reallocations should use known transfer opportunities, respect reducible and additional budget constraints, and avoid extreme increases that would imply unrealistic linear scaling.

Recommendations must be consistent and material. The prompt favors a small number of distinct, high-impact actions and allows an empty recommendation set when the evidence is weak. This is preferable to forcing low-confidence advice.

Optimization responses include source and destination entities, shift amount, reasoning, expected impact, confidence, execution risk, expansion opportunities, and a no-recommendation reason when appropriate.

Explainability is required because users need to understand why an allocation change is suggested. Each recommendation should connect back to observable performance signals and make the expected business impact explicit.

## Reliability and Safety Mechanisms

Prompt reliability depends on both prompt design and application-side validation.

Prompt compliance alone is insufficient for trust; runtime validation remains the final authority for response acceptance.

- Schema validation rejects responses that do not match the expected output contract
- Identifier validation prevents model selection from returning unknown or rewritten model IDs
- Structurally deterministic formatting reduces parsing ambiguity and UI-specific fallback logic
- Duplicate prevention avoids repeated model entries and repeated recommendation ideas
- Ranking consistency improves model selection stability for the same provider inputs
- Provider-agnostic abstractions keep prompt behavior independent from provider discovery details
- Token efficiency optimizations limit input scope, reuse derived analytics, cap ranked model output, and avoid unnecessary provider retries

The system treats derived analytics signals as authoritative. This reduces the chance that a model recomputes metrics differently from the dashboard or bases recommendations on inconsistent calculations.

The prompt layer does not replace runtime safeguards. Caching, cooldowns, request cancellation, model fallback, stale-result handling, and provider-limit handling are owned by the AI analysis execution layer.

## Versioning and Iteration Strategy

Prompt versions are isolated so each prompt family can evolve without changing unrelated AI workflows. Versioned configuration makes prompt changes reviewable and gives the team a path to compare old and new behavior during iteration. Versioning also prevents silent behavioral drift in downstream product features.

Prompt evolution should be driven by observed failures, product requirements, and regression examples. Changes should target a specific weakness such as invalid JSON, generic summaries, overconfident recommendations, unstable model ranking, or poor filtered-scope behavior.

Regression testing should cover representative provider responses and portfolio contexts, including:

- empty or weak model candidate lists
- unknown or duplicate model identifiers
- full-portfolio and selected-subset summaries
- filtered benchmark behavior
- weak optimization evidence
- budget reallocation constraints
- provider responses with malformed or incomplete JSON

Logging and evaluation should focus on prompt version, provider, selected model, input scope, response validity, cache behavior, fallback behavior, and user-visible outcome. Logs should avoid storing API keys or unnecessary sensitive business data.

Backward compatibility matters because rendered AI output depends on stable schemas. Prompt changes that alter fields, meanings, or constraints should be coordinated with response parsing, UI rendering, and stored cache invalidation.

Future prompt iterations should preserve the current design principles: structured inputs, strict outputs, scoped reasoning, conservative recommendations, identifier integrity, and provider-independent behavior.
