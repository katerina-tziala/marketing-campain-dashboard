# AI Prompt Engineering Guidelines
This document describes the prompt engineering principles used by the AI features in the marketing campaign dashboard. The system integrates with multiple large language model providers and uses structured prompts to generate analytical outputs such as executive summaries and marketing budget optimization recommendations.

Because different language models interpret instructions differently, the prompts used in the application are engineered using a consistent design framework. This framework focuses on improving cross-model reliability, enforcing deterministic outputs, and guiding the reasoning process used by the model.

By applying consistent prompt design principles across all AI features, the system ensures that generated responses remain predictable, structured, and safe to integrate directly into the application interface.

## AI Prompts in the System
The AI features in the marketing campaign dashboard rely on several specialized prompts designed for different analytical tasks. Each prompt follows the prompt engineering principles described in this document while implementing task-specific reasoning logic and response schemas.

The current prompts used in the system are:

- **Model Evaluation Prompt**  
  Evaluates and ranks available language models for marketing analysis tasks.  
  See documentation: [MODEL_EVALUATION_PROMPT.md](./MODEL_EVALUATION_PROMPT.md)

- **Executive Summary Prompt**  
  Generates a board-level summary of marketing campaign performance.  
  See documentation: [EXECUTIVE_SUMMARY_PROMPT.md](./EXECUTIVE_SUMMARY_PROMPT.md)

- **Budget Optimization Prompt**  
  Provides budget reallocation recommendations based on campaign efficiency.  
  See documentation: [BUDGET_OPTIMIZATION_PROMPT.md](./BUDGET_OPTIMIZATION_PROMPT.md)

Each prompt document provides detailed information about the prompt’s design, reasoning structure, output contract, and integration within the system.

## Model-Agnostic Prompt Design
The prompts used in the AI tools are designed to operate consistently across multiple LLM providers, including Grok, Gemini, and other compatible models.

Different models interpret prompts differently due to variations in training data, reasoning strategies, and instruction-following behavior. To reduce these inconsistencies, the prompts incorporate several stabilization techniques.

These techniques include:

 - explicit role definition to anchor the model’s reasoning perspective
 - clear task framing that defines the expected analytical objective
 - structured reasoning instructions that guide how the model evaluates the provided data
 - strict schema constraints that standardize output structure
 - explicit guardrails that reduce ambiguity and prevent unsupported assumptions

These design choices improve cross-model reliability and allow the system to switch between model providers without requiring significant changes to prompt logic.

## Deterministic Output Strategy
Large language models naturally produce variable outputs. To ensure reliable integration with the application interface, the prompts enforce deterministic output constraints.

Each prompt defines strict output rules and formatting requirements that the model must follow. These constraints ensure that generated responses remain machine-readable and compatible with the application UI.

Key deterministic design techniques include:

 - strict JSON schema enforcement
 - explicit formatting rules for currency values, percentages, and numerical metrics
 - instructions to return only the JSON response without additional commentary
 - guardrails preventing unsupported assumptions or invented metrics

These constraints significantly reduce response variability and ensure that model outputs remain predictable and safe to render directly within the application interface.

## Structured Reasoning Design
The prompts incorporate structured reasoning instructions that guide the model through a consistent analytical process before producing the final output.

Rather than immediately generating a response, the model is instructed to internally analyze the provided dataset using a defined reasoning sequence. This approach improves analytical quality and reduces variability across different LLM architectures.

Typical reasoning steps include:

 - evaluating portfolio-level performance signals
 - analyzing channel or campaign efficiency
 - identifying performance drivers or inefficiencies
 - evaluating allocation or optimization opportunities
 - prioritizing insights based on the strength of the available signals

By guiding the model through structured reasoning steps, the prompts reduce randomness in the analysis process and encourage consistent evaluation across different models.

# Prompt Architecture Standard
All prompts in the system follow a consistent structural pattern designed to improve readability, maintainability, and reliability across different language models.

While the exact sections may vary depending on the task being performed, prompts generally follow a common architectural structure that separates context, reasoning instructions, constraints, and output requirements.

Typical prompt components include:

 - **Role:** Defines the analytical persona the model should adopt when performing the task.
 - **Task:** Clarifies the objective of the prompt and the expected analytical outcome.
 - **Input Data:** Structured data provided dynamically by the application at runtime.
 - **Context or Scope:** Optional contextual information or filters that define the boundaries of the analysis.
 - **Analysis Instructions:** Structured reasoning steps guiding how the model should evaluate the provided data.
 - **Guardrails or Operational Constraints:** Rules that prevent unrealistic conclusions, unsupported assumptions, or invalid recommendations.
 - **Output Rules:** Strict formatting rules that enforce deterministic outputs.
 - **Response Schema:** A predefined JSON structure that the model must return.

Depending on the analytical objective, prompts may also include specialized sections such as scoring guidelines, optimization guardrails, or evaluation criteria.

Using a consistent architectural pattern improves cross-model reliability and makes prompts easier to maintain as the system evolves

## Benefits of the Prompt Design Framework

Applying these prompt engineering principles provides several operational benefits for the AI features in the application.

First, it improves cross-model reliability, allowing the system to run the same prompts across different LLM providers while maintaining consistent results.

Second, deterministic output constraints ensure that model responses remain structured and machine-readable, enabling direct integration with the application interface without requiring additional post-processing.

Finally, the structured reasoning design improves analytical quality by guiding the model through a consistent evaluation process before producing the final output.

Together, these design principles ensure that the AI features remain stable, predictable, and maintainable as the system evolves and new model providers are integrated.