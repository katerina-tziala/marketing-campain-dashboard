# Model Evaluation AI Prompt – Design and Architecture
This document describes the design and architecture of the Model Evaluation AI prompt used in the marketing campaign dashboard. The prompt evaluates and ranks large language models based on their suitability for performing marketing analytics tasks within the application.

The evaluation process analyzes available models and selects the strongest candidates capable of supporting analytical reasoning, summarization, and structured output generation. The resulting ranked model list allows the system to dynamically select high-quality models while maintaining reliable performance and sustainable usage limits.

The prompt is designed to operate in a model-agnostic environment where multiple providers may be available. To ensure consistent results across providers, the prompt emphasizes structured evaluation rules, deterministic output constraints, and strict validation checks.

## Purpose
The Model Evaluation prompt is responsible for identifying and ranking the most suitable large language models for the marketing analytics application.

The system may have access to multiple LLM providers and model variants. Rather than relying on static model selection, this prompt dynamically evaluates the available models and selects those most capable of performing the required analytical tasks.

The selected models must support the core capabilities required by the application, including:

 - generating executive marketing performance summaries
 - generating marketing budget optimization recommendations
 - producing reliable structured JSON responses

The evaluation process focuses on identifying models with strong reasoning capabilities, effective summarization performance, and reliable structured output generation. Additionally, the prompt prioritizes models that offer stable availability and sustainable usage limits, ensuring that the application can operate reliably under free-tier constraints.

The final output is a ranked list of the strongest candidate models that can be used by the application for marketing analysis tasks.

## Prompt Architecture

The Model Evaluation prompt is structured into clearly defined sections that guide the evaluation process and reduce ambiguity when ranking models. Each section contributes to stabilizing the evaluation behavior, ensuring consistent model selection results, and enforcing deterministic outputs that can be reliably parsed by the application.

### Role
The prompt defines the model as a model selection specialist. This role frames the task as a structured evaluation problem rather than a generative or creative task.

By assigning a clear analytical role, the prompt encourages the model to reason systematically about the strengths and limitations of the available models.

### Task
The task section defines the objective of the prompt: evaluating and ranking available LLM models for a marketing analytics application.

The task explicitly requires the model to identify which models are most suitable for performing the analytical and summarization tasks required by the system.

### Application Use Case
The application use case section explains how the selected models will be used within the system. This provides the model with the context required to evaluate model capabilities appropriately.

The models must support two core analytical workflows:

 - executive summary generation for marketing campaign performance
 - marketing budget optimization analysis

Providing this context helps the model evaluate reasoning ability, summarization capability, and structured output reliability.

### Selection Criteria
The selection criteria define the capabilities that models must demonstrate to be considered strong candidates.

These criteria include:

 - reasoning capability for analytical tasks
 - summarization capability
 - ability to analyze marketing and business performance data
 - reliable generation of structured JSON outputs
 - consistent performance across repeated requests
 - sustainable usage limits and rate limits

These criteria ensure that the selected models can support the operational requirements of the application.

### Input Data
The prompt receives a dynamically generated list of available models from the system. This list represents the models currently accessible through the configured providers.

Each model entry may contain metadata such as:

 - model identifier
 - provider name
 - descriptive information

The prompt strictly instructs the model to select only from this provided list. This prevents the model from inventing or suggesting unsupported models.

### Strict Rules
The strict rules section enforces important constraints that stabilize the evaluation process.

These rules ensure that:

 - only models present in the provided list can be selected
 - model identifiers must be copied exactly from the list
 - the output contains no duplicate models
 - the number of returned models is limited

The rules also instruct the model to deprioritize models labeled as preview, latest, or experimental. These models often have limited rate limits or unstable availability and are therefore less suitable for sustained application usage.

### Reasoning Design
The prompt includes structured reasoning instructions that guide the model through a systematic evaluation process before producing the final ranked list.

Rather than immediately generating a response, the model is instructed to internally analyze each model in the provided list using several evaluation dimensions.

These evaluation dimensions include:

 - reasoning ability for analytical tasks
 - summarization capability
 - ability to produce structured outputs
 - stability and reliability
 - expected usage constraints such as token quotas and rate limits

By guiding the model through a consistent reasoning process, the prompt improves the reliability of the evaluation results and reduces variability across different LLM architectures.

### Scoring Strategy
Each evaluated model receives a strength score between 1 and 10 representing its suitability for the marketing analytics use case within the application.
The scoring scale is defined as follows:

 - 10 – excellent capability for reasoning, summarization, and structured analysis
 - 8–9 – very strong and reliable performance for the use case
 - 6–7 – acceptable performance with potential limitations
 - below 6 – generally unsuitable for the application

This scoring framework allows the model to compare candidates consistently and rank the strongest models.

### Internal Validation
Before producing the final output, the prompt instructs the model to perform an internal validation step.

This validation confirms that:

 - all returned models originate from the provided list
 - models are sorted by descending score
 - no duplicate models appear in the output
 - the number of models does not exceed the defined limit

This validation step reduces the likelihood of malformed or inconsistent responses.

### Output Contract
The prompt enforces a strict output contract requiring the model to return only valid JSON matching a predefined schema.

The response contains a structured list of selected models ranked by suitability.

Each returned model entry includes:

 - the exact model identifier
 - a user-friendly display name
 - the provider name
 - a short capability label describing the model's strength
 - a strength score between 1 and 10
 - a short explanation of why the model was selected

Strict output rules prevent the model from including additional commentary or modifying the schema structure. This ensures that the application can reliably parse the response and integrate the selected models into the system.

## Integration in the System
The Model Evaluation prompt is part of the AI tools feature within the marketing campaign dashboard.

The prompt is generated by the system function `generateModelEvaluationPrompt` responsible for evaluating available models and selecting the strongest candidates for marketing analysis tasks.

At runtime, the system dynamically injects the list of available models into the prompt. This list may include models from multiple providers depending on the configured integrations.

Once the prompt is constructed, it is sent to the configured language model provider for evaluation. The model analyzes the provided list and returns a ranked set of recommended models.

The application then uses this ranked list to determine which models should be used for the marketing analytics workflows, including executive summary generation and budget optimization analysis.

By dynamically evaluating models rather than relying on static configuration, the system can adapt to changing model availability and prioritize models that offer the best analytical performance and operational reliability.
