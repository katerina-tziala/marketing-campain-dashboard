# Executive Summary AI Prompt – Design and Architecture
This document describes the design and architecture of the Executive Summary AI prompt used in the marketing campaign dashboard. The prompt converts structured marketing performance data into a concise executive briefing for leadership stakeholders. It is designed to operate consistently across multiple large language models while producing deterministic, structured outputs that can be safely integrated into the application interface.

## Purpose
The Executive Summary prompt generates a board-level summary of marketing performance based on structured campaign data. Its goal is to translate marketing analytics into clear, decision-oriented insights that can be quickly understood by non-technical leadership stakeholders.

Rather than repeating raw metrics, the prompt instructs the model to interpret performance signals, highlight risks and opportunities, evaluate the overall health of the marketing portfolio, and identify the most relevant leadership actions.

The prompt is designed to operate in a model-agnostic manner, enabling consistent behavior across multiple large language model providers such as Grok, Gemini, and other compatible systems. To support reliable integration into the marketing dashboard, the design emphasizes clear instruction structure, reduced ambiguity, and deterministic JSON output. These constraints ensure that generated summaries remain predictable, machine-readable, and safe to render directly in the application interface.

## Prompt Architecture
The Executive Summary prompt is structured into clearly defined sections that guide the model’s reasoning process and reduce ambiguity. Each section is designed to stabilize model behavior, improve cross-model reliability, and ensure that the generated output aligns with executive reporting needs.

### Role
The prompt establishes a clear persona by positioning the model as a Chief Marketing Officer delivering a board-level briefing. This role anchors the tone and reasoning perspective of the model, encouraging strategic interpretation of the data rather than purely analytical description.

### Task
The task section defines the expected output: a concise executive briefing that summarizes marketing performance for leadership stakeholders. This instruction ensures the model prioritizes strategic insights and business implications over detailed metric explanations.

### Executive Questions
The executive questions define the key business questions that leadership expects the summary to address. These questions guide the analytical focus of the summary and ensure that insights remain decision-oriented rather than descriptive.

### Input Data
The prompt receives structured marketing performance data dynamically from the application. This dataset includes portfolio-level metrics, channel summaries, campaign performance data, and key findings.

Using structured data improves reliability by:

- enabling deterministic interpretation of performance signals
- reducing hallucination risk
- encouraging consistent reasoning across models

The dataset represents the complete set of available performance signals for this analysis unless explicitly limited by analysis scope filters.

### Business Context
The prompt supports optional structured business context that can be provided by the user to influence how the executive summary is interpreted. This context allows leadership priorities or operational considerations to be incorporated into the analysis.

Supported context fields may include:

- analysis period
- industry
- business goal
- business stage
- attribution model
- risk tolerance
- scaling tolerance
- operational constraints

When provided, this context is injected into the prompt before the analytical reasoning instructions. The model may use this information to refine interpretation of performance signals and strategic implications.

However, the prompt explicitly instructs the model that the underlying dataset remains the primary source of truth. Business context may influence interpretation but must not override the performance signals present in the data.

If no business context is provided, the system automatically inserts a default instruction directing the model to derive conclusions strictly from the dataset and to avoid unsupported assumptions about strategy, constraints, or market conditions.

### Analysis Scope
The analysis scope defines the boundaries of the evaluation. The prompt supports two scenarios:

**Full portfolio analysis**
When no filters are applied, the dataset represents the entire marketing portfolio. The model evaluates all channels and campaigns contained in the dataset.

**Filtered analysis**
When channel filters are applied by the user, the dataset provided to the model represents only the selected subset of channels.

In this case, the prompt explicitly instructs the model to treat the filtered dataset as the complete marketing portfolio for the current request. The model must interpret performance signals only within this subset and must not generalize conclusions to channels or campaigns outside the filtered scope unless the data clearly supports such conclusions.

This mechanism ensures that insights remain valid when users analyze only a subset of their marketing portfolio.

### Data Interpretation Rules
The prompt includes a shared set of data interpretation rules that define how the model should interpret the provided dataset before performing the analysis.

These rules act as foundational guardrails that ensure the model:

- uses only the provided dataset and optional business context
- avoids inventing unsupported metrics or assumptions
- interprets correlations conservatively rather than assuming causality
- respects the defined analysis scope
- treats filtered datasets as the complete portfolio for the current request when filters are applied

By introducing these rules before the analytical reasoning steps, the prompt reduces hallucination risk and improves consistency across different language models.

### Analysis Instructions
The analysis instructions define the reasoning process the model should follow before producing the final summary. These instructions guide the model through structured evaluation steps including:

- portfolio performance assessment
- channel efficiency analysis
- campaign performance review
- budget allocation evaluation
- identification of patterns or correlations

This structured reasoning approach improves analytical consistency across models.

### Internal Analysis Checklist
The prompt includes an internal checklist that the model must verify before generating the final output. The checklist ensures that key analytical dimensions have been evaluated, including portfolio performance, channel effectiveness, campaign drivers, allocation efficiency, and strategic opportunities.

This step acts as a validation mechanism that helps reduce incomplete or inconsistent outputs.

### Health Score Guidance
The prompt instructs the model to generate a portfolio health score ranging from 0 to 100. The score reflects the overall performance of the marketing portfolio based on several evaluation criteria, including profitability, efficiency, allocation quality, concentration risk, and performance consistency.

The prompt also defines score interpretation ranges to stabilize how models classify overall portfolio health.

The prompt also instructs the model to ensure that the health score label corresponds to the defined score ranges. This constraint stabilizes how different language models classify overall marketing performance.

### Interpretation Rules
Interpretation rules act as guardrails to prevent incorrect reasoning. These rules enforce constraints such as:

- using only the provided dataset and optional business context
- avoiding unsupported assumptions
- distinguishing correlations from causal relationships
- respecting the defined analysis scope
- avoiding inference about missing channels or campaigns

These constraints reduce hallucination risk and improve cross-model reliability.

### Output Rules
The output rules enforce strict formatting constraints for the model response. The prompt requires the model to return only valid JSON that matches the defined schema.

Additional constraints ensure that:

- no commentary or markdown is included
- numeric metrics such as spend, revenue, ROI, and conversions are returned as numeric values
- unsupported metrics are not invented
- currency formatting is handled by the application interface rather than the model

These rules ensure the response can be parsed reliably by the application.

### Response Schema
The response schema defines the exact JSON structure that the model must return. The schema includes structured sections for:

- portfolio health score
- executive bottom-line insight
- prioritized insights
- leadership actions
- channel summaries
- correlations
- key performance metrics

By enforcing a strict schema, the system ensures that generated outputs remain predictable and compatible with the application interface.

Numeric metrics such as total spend, revenue, ROI, and conversions are returned as numbers to simplify parsing and allow formatting to be handled by the user interface.

## Reasoning Design
The prompt incorporates structured reasoning instructions to guide the model through a consistent analytical process before producing the final executive summary. Rather than generating an immediate response from the input data, the model is instructed to internally evaluate the dataset using a defined reasoning sequence. This design improves analytical quality and reduces variability across different large language models.

The reasoning process instructs the model to analyze the dataset across several dimensions of marketing performance, including:

- overall portfolio performance based on aggregated metrics such as revenue, ROI, CAC, conversions, CTR, and CVR
- channel-level efficiency and contribution to portfolio outcomes
- campaign-level performance drivers and weaknesses
- budget allocation efficiency by comparing spend distribution with revenue contribution
- patterns or correlations that may indicate structural strengths or risks in the marketing portfolio

To further stabilize insight generation, the prompt introduces signal prioritization. When forming insights, the model is instructed to prioritize analytical signals in the following order:

 1. overall portfolio metrics
 2. channel-level performance
 3. campaign-level performance
 4. provided key findings

This hierarchy encourages the model to anchor conclusions in the strongest signals first, reducing the likelihood of overemphasizing isolated campaign metrics or anecdotal findings.

Structured reasoning improves output stability by:

- reducing randomness in how models interpret the dataset
- encouraging consistent analytical coverage of key performance dimensions
- improving reliability across different LLM architectures

## Filtered Portfolio Safety
When channel filters are applied, the prompt includes explicit constraints that prevent the model from making conclusions about channels that are not included in the dataset.

The model is instructed to:

- treat the filtered dataset as the full portfolio for the current request
- interpret findings only within the selected subset
- avoid generalizing conclusions beyond the available data

These safeguards ensure that executive summaries remain accurate even when leadership analyzes only a portion of the marketing portfolio.

## Output Contract
The Executive Summary prompt enforces a strict output contract to ensure that model responses are predictable, machine-readable, and compatible with the application interface. Rather than allowing free-form natural language responses, the prompt requires the model to return a response that strictly follows a predefined JSON schema.

This deterministic output design ensures that generated responses maintain a consistent structure regardless of the underlying model provider. By constraining the response format, the system can reliably parse and render the output within the marketing dashboard without additional post-processing or interpretation.

The schema organizes the executive summary into several structured components, including:

- Portfolio health score, which evaluates the overall performance of the marketing portfolio
- Bottom-line insight, highlighting the most important strategic takeaway for leadership
- Prioritized insights, summarizing key performance signals and supporting metrics
- Recommended actions, outlining the most important next steps for leadership
- Channel performance summaries, providing a concise evaluation of each major marketing channel
- Correlations, identifying supported patterns across campaigns or channels
- Key performance metrics, summarizing the most important portfolio-level indicators

To enforce this contract, the prompt includes strict output rules that prevent the model from producing unsupported or unstructured responses. These rules explicitly require the model to:

- return only valid JSON that matches the defined schema
- avoid including markdown or explanatory text outside the JSON structure
- avoid adding, renaming, or omitting schema fields
- follow explicit formatting rules for numeric metrics and percentage values where applicable

By enforcing a deterministic output contract, the system ensures that generated responses remain stable, predictable, and safe to render directly in the user interface. This approach also improves compatibility across different model providers such as Grok, Gemini, and other large language models, allowing the application to maintain consistent behavior even when switching between underlying AI models.

Financial metrics such as spend and revenue are returned as numeric values rather than formatted currency strings. Currency symbols and localized formatting are applied by the application interface. This approach ensures consistent parsing and allows the UI to render values according to the user's locale and currency preferences.

## Integration in the System
The Executive Summary prompt is integrated into the marketing campaign dashboard as part of the AI tools feature. The prompt is constructed by the function responsible for generating the executive summary prompt template:

`generateExecutiveSummaryPrompt()`

This function constructs the prompt template and dynamically injects runtime data before sending the request to the selected language model.

At execution time, the system populates the prompt with several inputs:

- **Marketing performance data**, generated from the campaign analytics layer and formatted into the structured dataset used by the prompt
- **Optional business context**, which may provide additional strategic or operational information supplied by the user
- **Analysis scope**, defining whether the evaluation covers the full marketing portfolio or a filtered subset of channels or campaigns

These inputs are prepared by supporting utilities within the AI tools feature before being inserted into the prompt template.

Once the prompt is constructed, it is sent to the configured language model provider. The system supports multiple models, allowing the application to run the prompt against providers such as Grok, Gemini, or other compatible models.

The model returns a response that must strictly follow the defined JSON schema. The application then parses this structured output and renders the results within the marketing dashboard interface.

The prompt design emphasizes:

- **model-agnostic compatibility**, allowing the system to operate across multiple LLM providers
- **deterministic output structure**, ensuring responses can be safely parsed and rendered
- **tight instruction design**, reducing ambiguity and improving cross-model consistency

This architecture allows the application to maintain stable behavior even when switching between underlying AI models while ensuring that generated insights remain predictable and compatible with the dashboard interface.
 