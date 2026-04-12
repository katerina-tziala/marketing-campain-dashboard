# Budget Optimizer AI Prompt – Design and Architecture
This document describes the design and architecture of the Budget Optimization AI prompt used in the marketing campaign dashboard. The prompt analyzes structured marketing campaign performance data and produces realistic budget reallocation recommendations intended to improve overall marketing efficiency.

The prompt is designed to operate consistently across multiple large language models while producing deterministic, structured outputs that can be safely integrated into the application interface. Its purpose is to identify actionable optimization opportunities while maintaining realistic operational constraints and minimizing execution risk.

The prompt emphasizes conservative reasoning, structured analytical reasoning guidance, and strict output constraints. These design principles ensure that the generated recommendations remain credible, explainable, and safe to present within a production marketing dashboard environment.
 
## Purpose

The Budget Optimization prompt generates practical budget reallocation recommendations based on structured marketing campaign performance data. Its goal is to identify realistic opportunities to improve portfolio efficiency while maintaining operational stability.

Rather than simply summarizing campaign performance, the prompt guides the model to evaluate efficiency signals across campaigns and determine where budget should be reduced, increased, or reallocated. The recommendations prioritize measurable performance improvements while avoiding unrealistic scaling assumptions or aggressive optimization strategies.

The output is intended for marketing decision-makers who need actionable recommendations for improving campaign allocation without performing manual analysis of campaign performance metrics.

The prompt is designed to operate in a model-agnostic manner, enabling consistent behavior across multiple large language model providers such as Grok, Gemini, and other compatible systems. To support reliable integration into the marketing dashboard, the prompt emphasizes clear instruction structure, reduced ambiguity, and deterministic JSON output. These constraints ensure that generated recommendations remain predictable, machine-readable, and safe to render directly within the application interface.

## Prompt Architecture

The Budget Optimization prompt is structured into clearly defined sections that guide the model through a consistent analytical workflow. Each section exists to stabilize model behavior, reduce ambiguity, and improve cross-model reliability when generating optimization recommendations.

### Role
The prompt establishes a clear analytical persona by positioning the model as a senior performance marketing analyst responsible for budget optimization. This role encourages the model to approach the dataset from an operational marketing perspective, focusing on efficiency, scalability, and realistic budget management.

The defined role anchors the reasoning process in practical marketing decision-making rather than theoretical analysis.

### Task
The task section defines the expected outcome: identifying realistic budget reallocations that improve marketing efficiency while maintaining portfolio balance and operational feasibility.

This framing ensures the model focuses on actionable optimization decisions, not descriptive summaries of campaign performance.

### Objectives
The objectives outline the core optimization goals the model should prioritize when evaluating the dataset. These objectives guide the model to focus on key budget allocation signals, including:

 - identifying overfunded campaigns with weak efficiency
 - identifying underfunded campaigns with strong efficiency
 - reallocating budget toward stronger campaigns
 - detecting structural allocation imbalances across the portfolio

Explicit objectives reduce ambiguity and help ensure that the generated recommendations remain aligned with practical marketing optimization strategies.

### Input Data
The prompt receives structured campaign performance data dynamically from the application. The dataset includes portfolio-level metrics, campaign performance metrics, and channel summaries.

Providing structured input data improves reliability by:

 - enabling deterministic interpretation of performance signals
 - reducing hallucination risk
 - encouraging consistent reasoning across models

All recommendations must be derived strictly from the provided dataset unless the user supplies additional business context.

### Business Context
The prompt supports optional structured business context that can be provided by the user to influence how the optimization recommendations are generated.

The business context allows the model to incorporate strategic or operational constraints when interpreting campaign performance signals. When present, this context is injected into the prompt before the analysis instructions and may influence how the model evaluates scaling opportunities and risk tolerance.

Supported context fields may include:

- analysis period
- industry
- business goal
- business stage
- attribution model
- risk tolerance
- scaling tolerance
- operational constraints

If no context is provided, the prompt automatically inserts a default statement instructing the model to derive conclusions strictly from the dataset without making unsupported assumptions.

#### Budget Expansion Context
The optimizer also supports a specific optional flag allowing the model to consider portfolio budget expansion.

When enabled, the prompt includes the instruction:

> Budget expansion is allowed. Total portfolio budget may increase if performance signals clearly support additional investment.

If this option is not enabled, the optimizer assumes that total portfolio budget should remain constant and only recommends reallocations between campaigns.

This mechanism allows the system to safely control whether the optimizer is allowed to suggest new investment or only redistribution of existing budget.

### Optimization Scope
The optimization scope defines the boundaries of the analysis. The prompt supports two scenarios.

#### Full Portfolio Optimization

When no filters are applied, the model evaluates the entire marketing portfolio. All campaigns included in the dataset are eligible for budget reallocations.

#### Scoped Optimization

When channel filters are applied, the dataset provided to the model represents only the selected subset of campaigns.

In this case, the prompt instructs the model to treat the filtered dataset as the full analysis portfolio for the current request. The model must not recommend reallocating budget to campaigns or channels outside the filtered subset.

This explicit scope definition prevents the model from generating recommendations that reference campaigns not included in the current analysis.

### Data Interpretation Rules
The prompt includes a shared set of data interpretation rules that define how the model should interpret the provided dataset before performing the analysis.

These rules serve as a foundational guardrail to ensure that the model:

- uses only the provided dataset and optional business context
- avoids inventing unsupported metrics or external assumptions
- interprets correlations conservatively rather than assuming causality
- respects the defined analysis scope
- treats filtered datasets as the complete portfolio for the current request when channel filters are applied

These interpretation rules act as a first-level reasoning constraint before the model proceeds to the structured analysis instructions.

Including this section improves cross-model consistency and reduces hallucinated insights.

### Analysis Instructions

The analysis instructions define the reasoning sequence the model should follow before generating recommendations. These instructions guide the model through structured evaluation steps including:

 - portfolio performance evaluation
 - campaign efficiency analysis
 - budget allocation comparisons
 - identification of scaling opportunities
 - detection of inefficient spend patterns

This structured reasoning process improves analytical consistency and reduces variability across models.

The analysis instructions also require the model to identify likely funding sources and scaling targets before recommending budget transfers.

### Optimization Guardrails
Optimization guardrails define operational constraints that prevent unrealistic or risky budget recommendations. These rules enforce limitations such as:

 - preventing excessive budget increases
 - avoiding trivial reallocations
 - preventing reallocations smaller than 5% of the source campaign budget unless they are explicitly framed as experimental tests
 - assuming diminishing returns when scaling spend

These guardrails ensure that the generated recommendations remain operationally realistic and implementable.

### Impact Estimation Rules
The impact estimation rules govern how the model estimates the potential performance impact of budget changes. Because large language models may otherwise assume perfect scaling behavior, the prompt enforces conservative projection logic.

The model is instructed to:

 - assume diminishing returns as spend increases
 - avoid linear scaling assumptions
 - base projections on existing efficiency signals
 - keep estimated ROI within realistic ranges

These constraints reduce hallucinated performance projections and improve the credibility of the generated recommendations.

### Internal Analysis Checklist
The prompt includes an internal checklist that the model must verify before generating the final response. This checklist ensures that the model evaluates the key optimization dimensions required for a credible recommendation.

The checklist covers:

 - portfolio efficiency
 - campaign efficiency
 - allocation efficiency
 - scaling opportunities
 - optimization risks

This validation step reduces incomplete or inconsistent outputs.

### Interpretation Rules
Interpretation rules act as guardrails to prevent incorrect reasoning and unsupported conclusions. These rules enforce constraints such as:

- respecting the defined optimization scope
- keeping filtered optimization analysis inside the selected channel subset
- using conservative language when evidence is limited
- avoiding contradictory classification of the same campaign as both a top performer and an underperformer

These guardrails reduce hallucination risk and improve cross-model reliability.

### Output Rules
The output rules enforce strict formatting constraints for the model response. The prompt requires the model to return only valid JSON that matches the defined schema.

Additional rules ensure that:

 - no commentary or markdown is included
 - schema fields are not modified
 - formatting rules for percentages and numeric values are respected
 - unsupported metrics are not invented

These rules ensure the response can be parsed reliably by the application.

### Response Schema
The response schema defines the exact JSON structure that the model must return. The schema organizes the optimization output into structured components including:

 - executive optimization summary
 - recommended budget reallocations
 - top performing campaigns
 - underperforming campaigns
 - quick optimization opportunities
 - correlations across campaigns or channels
 - potential optimization risks

By enforcing a strict schema, the system ensures that generated outputs remain predictable and compatible with the application interface.

## Reasoning Design
The prompt incorporates structured reasoning instructions to guide the model through a consistent optimization process before producing the final recommendation set. Rather than generating immediate conclusions from the input data, the model is instructed to internally evaluate the dataset through a defined reasoning sequence.

The reasoning process includes evaluating several dimensions of marketing performance:

 - overall portfolio performance
 - campaign efficiency signals
 - budget allocation efficiency
 - scaling opportunities
 - optimization risks

To further stabilize decision-making, the prompt instructs the model to identify funding sources and scaling targets before recommending reallocations. Funding sources represent campaigns where budget reductions may improve portfolio efficiency, while scaling targets represent campaigns that demonstrate stronger efficiency signals and may benefit from additional budget.

This structured reasoning approach improves output stability by:

 - reducing randomness in optimization recommendations
 - ensuring consistent evaluation of campaign efficiency signals
 - improving reliability across different LLM architectures

## Filtered Portfolio Safety

When channel filters are applied, the prompt includes explicit constraints to ensure that optimization recommendations remain valid within the filtered dataset.

The model is instructed to:

- treat the filtered dataset as the full analysis portfolio for the current request
- avoid recommending budget reallocations outside the selected channels
- avoid generalizing optimization conclusions to campaigns not included in the dataset

These safeguards prevent the optimizer from generating invalid or misleading recommendations when users analyze only a subset of their marketing channels.

## Output Contract
The Budget Optimization prompt enforces a strict output contract to ensure that model responses are predictable and compatible with the application interface.

Rather than allowing free-form natural language responses, the prompt requires the model to return a response that strictly follows a predefined JSON schema.

The schema organizes the optimization output into structured sections including:

 - executive summary of optimization opportunities
 - recommended budget reallocations
 - top performing campaigns
 - underperforming campaigns
 - quick optimization opportunities
 - correlations across campaigns or channels
 - optimization risks

Strict output rules prevent the model from generating unsupported responses by requiring that the output:

 - contain only valid JSON
 - match the schema exactly
 - avoid markdown formatting
 - avoid additional explanatory text

By enforcing this deterministic output contract, the system ensures that responses remain stable, predictable, and safe to render directly in the marketing dashboard.

## Integration in the System
The Budget Optimization prompt is integrated into the marketing campaign dashboard as part of the AI tools feature. The prompt template is constructed by the function responsible for generating the optimization prompt:

`generateBudgetOptimizationPrompt()`

This function dynamically injects runtime data before sending the request to the selected language model.

At execution time, the system populates the prompt with several runtime inputs:

- **Campaign performance data**, generated from the analytics layer and formatted into the structured dataset used by the prompt
- **Optional business context**, supplied by the user when available
- **Budget expansion setting**, which determines whether the model may recommend increasing the total portfolio budget
- **Optimization scope filters**, which determine whether the model evaluates the full portfolio or a filtered subset of campaigns

If channel filters are applied, the prompt instructs the model to treat the filtered dataset as the full analysis portfolio for the current request and to avoid recommendations outside the selected scope.

Once the prompt is constructed, it is sent to the configured language model provider. The system supports multiple models, allowing the application to run the prompt against providers such as Grok, Gemini, or other compatible models.

The model returns a response that must strictly follow the defined JSON schema. The application parses this structured output and renders the results within the marketing dashboard interface.

The prompt design emphasizes:

 - **model-agnostic compatibility**, allowing the system to operate across multiple LLM providers
 - **deterministic output structure**, ensuring responses can be safely parsed and rendered
 - **tight instruction design**, reducing ambiguity and improving cross-model consistency

This architecture allows the application to maintain stable behavior even when switching between underlying AI models while ensuring that generated insights remain predictable and compatible with the dashboard interface.
 