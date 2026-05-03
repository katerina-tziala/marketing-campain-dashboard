import type { AiModelCandidate } from '@/features/ai-tools/providers/types'
import { getPromptRuleGroup, type PromptRuleGroup } from "./_a2/v";

const OUTPUT_SCHEMA = `{
  "models": [
    {
      "id": "exact identifier copied from the provided list",
      "displayName": "concise user-friendly model name",
      "family": "model family such as Gemini, Llama, Gemma, Qwen, Mixtral, or Other",
      "strengthScore": 9
    }
  ]
}`


const OUTPUT_REQUIREMENTS_RULES: PromptRuleGroup = {
  title: 'OUTPUT REQUIREMENTS',
  type: 'unordered',
  list: [
    'Return exactly one JSON object strictly matching the response schema.',
    'No markdown, commentary, surrounding text, or trailing commas.',
    'Use double quotes for all keys and string values.',
    'Do not add, remove, rename, or change field types or structure.',
  ],
}

export function generateModelEvaluationPrompt(
  models: AiModelCandidate[],
): string {
  return `
ROLE:
You are a model selection specialist evaluating LLMs for a marketing analytics application.

TASK:
Evaluate and rank all models from the provided list.
Return the strongest models for analytical reasoning, summarization, budget optimization, and structured JSON generation.

EVALUATION CRITERIA:
Score each model based on:
1. Marketing campaign executive summaries
2. Marketing budget optimization recommendations
3. Marketing and business performance analysis
4. Structured JSON reliability
5. Reasoning and summarization quality
6. Consistency across repeated requests
7. Production suitability, including stable identifiers and expected usage sustainability

RANKING SIGNALS:
Use available fields as ranking signals:
- provider
- contextWindow
- maxOutputTokens
- supportsTextGeneration
- thinking

Treat missing optional fields as neutral, not negative.

SELECTION PROCESS:
1. Evaluate every model in the list.
2. Assign each model a strengthScore from 1 to 10.
3. Sort models by strengthScore from highest to lowest.
4. Break ties strictly using reasoning strength, structured output reliability, and consistency. Prefer only the top few models for the highest scores.
5. Return the top 20 models after sorting.
6. If fewer than 20 models are provided, return all identifiable models ranked.
7. Do not duplicate models.

SCORING SCALE:
- 10 = exceptional fit, rare and reserved for clearly superior models (at most 1–2 models should receive a 10)
- 9 = excellent fit
- 8 = strong fit
- 7 = good fit with some limitations
- 6 = usable but meaningfully weaker
- 5 = marginal fit; return only if needed to fill the top 20
- below 5 = unsuitable; exclude unless fewer than 20 identifiable models exist

IDENTIFIER RULES:
- Use only "id" as the identifier.
- The output "id" must exactly match the input "id".
- Do not modify, normalize, rename, or infer identifiers.
- Only return models from the input list.

METADATA RULES:
- Derive displayName from "id".
- Infer family from "id" and provider.
- Use short standardized family names: Gemini, Llama, Gemma, Qwen, Mixtral, or Other.
- If family cannot be clearly inferred, use "Other".
- Do not use marketing language.

FINAL VALIDATION CHECK:
1. Every "id" matches an input "id".
2. No duplicate models.
3. No more than 20 models.
4. Every strengthScore is between 1 and 10.
5. Output matches the schema exactly.

${getPromptRuleGroup(OUTPUT_REQUIREMENTS_RULES)}

RESPONSE SCHEMA:
${OUTPUT_SCHEMA}

INPUT MODEL LIST:
${JSON.stringify(models, null, 2)}
`.trim()
}
