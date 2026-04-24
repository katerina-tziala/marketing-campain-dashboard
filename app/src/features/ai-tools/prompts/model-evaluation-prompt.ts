import type { AiModelCandidate } from '../providers/types'

const OUTPUT_SCHEMA = `{
  "models": [
    {
      "id": "exact identifier copied from the provided list",
      "model": "exact identifier copied from the provided list",
      "displayName": "concise user-friendly model name",
      "provider": "user-friendly provider name",
      "family": "model family such as Gemini, Llama, Gemma, Qwen, Mixtral, or Other",
      "strength": "short capability label",
      "strengthScore": 9,
      "reason": "brief justification tied to the use case"
    }
  ]
}`

export function generateModelEvaluationPrompt(
  models: AiModelCandidate[],
  providerRules: string[] = [],
): string {
  const rulesList = providerRules.map((r) => `- ${r}`).join('\n')

  return `
ROLE:
You are a model selection specialist responsible for ranking LLMs for a marketing analytics application.

TASK:
Evaluate every model in the provided list, but return only the strongest models.
Rank models by suitability for marketing analytics, structured reasoning, summarization, and reliable JSON generation.

APPLICATION USE CASE:
The selected models will be used to:
- generate marketing campaign executive summaries
- generate marketing budget optimization recommendations
- analyze marketing and business performance data
- produce reliable structured JSON outputs

SELECTION CRITERIA:
Prioritize models with:
- strong reasoning ability
- strong summarization capability
- strong business and marketing analysis capability
- reliable structured JSON generation
- consistent performance across repeated requests
- stable generally available identifiers
- sustainable expected usage characteristics

Deprioritize models when:
- the identifier contains "preview", "experimental", "latest", "beta", or similar instability markers
- the model appears small, lightweight, or specialized for non-analytical use
- the model is likely weaker for reasoning, summarization, or structured output reliability

INPUT EVIDENCE RULES:
- Use the provided model list as the source of truth for available identifiers.
- Use only identifiers present in the provided list.
- Do not invent, normalize, rename, or modify model identifiers.
- If an identifier appears as "id", use that value.
- If no "id" exists but "name" exists, use "name" as the identifier.
- Both "id" and "model" in the output must exactly match the chosen identifier.
- If metadata is incomplete, make a conservative suitability judgment from the identifier and provider context.
- Do not fabricate exact rate limits, token limits, or availability guarantees.

PROVIDER-SPECIFIC RULES:
${rulesList || '- No additional provider-specific rules provided.'}

STRICT SELECTION RULES:
- Evaluate all models from the input list internally.
- Return only the top-ranked models.
- Return no more than 20 models.
- Do not return weak models just to be comprehensive.
- Do not duplicate models.
- The output must be ranked in descending order by strengthScore.
- Prefer stable production-suitable models over preview, latest, beta, or experimental models.
- For similar model families, prefer the strongest stable variant.

SCORING RULES:
Assign strengthScore from 1 to 10:
- 10 = excellent fit for reasoning, summarization, structured JSON, and marketing analytics
- 8-9 = very strong fit with minor limitations
- 6-7 = usable but meaningfully weaker
- below 6 = generally unsuitable and should usually not be returned

REASONING INSTRUCTIONS:
Before answering, internally evaluate:
1. reasoning ability
2. summarization quality
3. marketing/business analysis suitability
4. structured JSON reliability
5. stability of the model identifier
6. expected consistency for repeated production-like use
7. provider-specific constraints

OUTPUT REQUIREMENTS:
- Return only valid JSON.
- Do not include markdown.
- Do not include commentary outside the JSON.
- Do not include trailing commas.
- Use double quotes for all strings.
- Do not add, remove, or rename schema fields.
- The final response must contain only the JSON object.

FINAL VALIDATION CHECK:
- Every returned model appears in the input list.
- Every "id" exactly matches an input identifier.
- Every "model" exactly matches the same identifier as "id".
- No duplicate models.
- No more than 20 models.
- Models are ranked from strongest to weakest.
- Every strengthScore is between 1 and 10.
- Every reason is short, specific, and tied to the application use case.

RESPONSE SCHEMA:
${OUTPUT_SCHEMA}

INPUT MODEL LIST:
${JSON.stringify(models, null, 2)}
`.trim()
}