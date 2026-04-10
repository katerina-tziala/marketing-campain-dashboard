import type { GeminiModel, GroqModel, PromptInstructionStep } from "../types";
import { getPromptList, getPromptNumberedList, JSON_OUTPUT_RULES, JSON_SCHEMA_LABEL, OUTPUT_RULES_LABEL, renderNumberedInstructions } from "./prompt-utils";

const APPLICATION_USE_CASE = [
  'generate marketing campaign executive summaries',
  'generate budget optimization recommendations'
];

const SELECTION_CRITERIA = [
  'strong reasoning',
  'strong summarization',
  'good analytical capability for marketing/business data',
  'reliable structured output',
  'consistent performance',
  'higher free-tier rate limits and token quotas (prefer models that allow sustained usage)',
  'avoid experimental or preview models — they typically have very low rate limits and may become unavailable',
];

const STRICT_RULES = [
  'Only choose models from the provided list',
  'Do NOT invent models',
  `The "model" field must match exactly the model identifier from the provided list`,
  'The model identifier may appear as "id" or "name" in the list — copy the exact value',
  'Return exactly 5 models from the list only, unless fewer than 5 relevant models are available. In that case, return only the models found. Do not add or invent items to reach 5.',
  'Deprioritize models with "preview" or "experimental" in their name — they have severely limited free-tier quotas',
  'Prefer stable, generally-available models with high token limits',
];

const FIELD_RULES: PromptInstructionStep[] = [
  {
    title: "STRICT RULES:",
    bullets: [
  '10 = excellent for reasoning, summarization, and analytical marketing insights',
  '8–9 = very strong and reliable for the use case',
  '6–7 = good but with some limitations',
  'below 6 should not normally be selected'
    ],
    notes: [
      "Higher score = better model for this marketing analysis application.",
    ],
  }
];

const OUTPUT_SCHEMA = `
{
  "selected_models": [
    {
      "id": "exact model identifier from list",
      "model": "exact identifier from list",
      "display_name": "user-friendly model name",
      "provider": "user-friendly provider name",
      "strength": "short capability label",
      "strength_score": 9,
      "reason": "brief explanation"
    }
  ]
}`;
 
const VALIDATION_CHECKLIST = [
  'Every selected model exists in the provided list',
  'Every returned item matches the JSON schema EXACTLY',
  'Every model value matches exactly an id or name from the list',
  'Return up to 5 models from the list; fewer are allowed if fewer valid matches exist',
  'strength_score is between 1 and 10',
  'Output is valid JSON'
];

export function generateModelSelectionPrompt(models: GeminiModel[] | GroqModel[]): string {
  const sections = [`You are a model selection assistant.\nYour task is to choose the 5 best LLM models for a marketing analysis application.`,
    getPromptList('APPLICATION USE CASE', APPLICATION_USE_CASE).join("\n"),
    getPromptList('SELECTION CRITERIA', SELECTION_CRITERIA).join("\n"),
    getPromptNumberedList('STRICT RULES', STRICT_RULES).join("\n"),
    renderNumberedInstructions(FIELD_RULES),
    getPromptList(OUTPUT_RULES_LABEL, JSON_OUTPUT_RULES),
    `${JSON_SCHEMA_LABEL}\n${OUTPUT_SCHEMA}`,
    getPromptList('Validation checklist before answering', VALIDATION_CHECKLIST).join("\n"),
    `Model list:\n${JSON.stringify(models)}`,
  ];

 return sections.join("\n\n");
}
