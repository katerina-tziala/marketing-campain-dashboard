import type { AiModelCandidate } from '../providers/types'

const OUTPUT_SCHEMA = `{
  "models": [
    {
      "id": "string — exact identifier copied from the provided list",
      "displayName": "string — concise, user-friendly model name",
      "family": "string — inferred family name such as Gemini, Llama, Gemma, Qwen, Mixtral, or Other",
      "strength": "string — short capability label",
      "strengthScore": number,
      "reason": "string — brief justification"
    }
  ]
}`

export function generateModelEvaluationPrompt(
  models: AiModelCandidate[],
  providerRules: string[],
): string {
  const rulesList = providerRules.map((r) => `- ${r}`).join('\n')

  return `
ROLE:
You are an AI model selection specialist.
Be concise, analytical, strict about evidence, and free of fluff.

TASK:
Evaluate all provided models for a marketing analytics application.

APPLICATION USE CASE:
The models will be used for:
- executive summary generation
- budget optimization recommendations
- reliable structured JSON output generation

SELECTION GOAL:
Assess each model based on suitability for:
- reasoning quality
- summarization quality
- business and marketing analysis
- reliable structured JSON generation
- expected consistency and production suitability

INPUT EVIDENCE RULES:
- Use the provided model list as the primary source of truth.
- Use only identifiers present in the provided list.
- Do not invent or modify identifiers.
- If metadata required for a criterion is not present in the list, use conservative judgment.
- Do not fabricate usage limits, token limits, stability guarantees, or availability details if they are not explicitly supported by the input.

PROVIDER-SPECIFIC RULES:
${rulesList}

STRICT RULES:
- Return only models that appear in the provided list.
- Evaluate and return all valid models from the provided list.
- Do not omit any valid model from the provided list.
- Do not duplicate models.
- The "id" field must exactly match the input identifier.
- Assign a strengthScore to every model based on suitability.
- Models with similar identifiers must use consistent family naming.
- Models with similar identifiers must use consistent displayName formatting.
- Deprioritize models whose identifier suggests instability such as "preview", "experimental", or "latest".

NOISE CONTROL:
- Keep every reason short and specific to the use case.
- Do not include commentary outside required fields.
- Do not repeat the same reasoning across multiple models.
- Keep displayName short, readable, and suitable for UI display.
- Do not use vague praise such as "good overall" without linking it to the application needs.

SCORING RULES:
- Assign strengthScore from 1 to 10.
- 10 = excellent fit for reasoning, summarization, and structured business analysis
- 8-9 = very strong fit with minor limitations
- 6-7 = usable but meaningfully weaker
- below 6 = generally weak for this use case
- Use the score range realistically.

FINAL QUALITY CHECK:
- Every returned model must appear in the input list.
- The number of returned models must match the number of valid models in the input list.
- No duplicate models.
- Every "id" must exactly match an input identifier.
- Every model must have a valid strengthScore between 1 and 10.
- Family naming must be consistent across similar models.
- Reasons must be concise and tied to the application use case.

OUTPUT REQUIREMENTS:
- Return only valid JSON matching the schema exactly.
- Do not add extra fields.
- Do not include markdown, commentary, or wrapper text.
- Use double quotes for all strings.
- Do not include trailing commas.

OUTPUT SHAPE:
- return all valid models

RESPONSE SCHEMA:
${OUTPUT_SCHEMA}

INPUT MODEL LIST:
${JSON.stringify(models, null, 2)}
`.trim()
}
