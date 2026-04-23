import type { GeminiModel } from "../providers/gemini/types";
import type { GroqModel } from "../providers/qroq/types";
import { getPromptList, getPromptNumberedList,   } from "./prompt-utils";
 
 const ROLE = [
    'You are a model selection specialist responsible for evaluating large language models for suitability in a marketing analytics application.'
  ];

 const TASK = [
    'Evaluate and rank the available LLM models from the provided list for a marketing analytics application.',
    'Your evaluation should identify models that can reliably support the application’s analytical and reasoning requirements while maintaining stable and sustainable usage characteristics.',
    'Return only the strongest models ranked according to the defined evaluation criteria.'
  ];

const APPLICATION_USE_CASE = [
  'generate marketing campaign executive summaries',
  'generate marketing budget optimization recommendations'
];

const SELECTION_CRITERIA = [
  'strong reasoning ability',
  'strong summarization capability',
  'ability to analyze marketing and business performance data',
  'reliable generation of structured JSON outputs',
  'consistent performance across repeated requests',
  'sustainable usage limits for free-tier access',
  'stable, generally available models rather than experimental or preview releases',
];
  

const OUTPUT_SCHEMA = `
{
  "models": [
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

const INPUT_DATA = [
  'Use only the information contained in this dataset unless business context explicitly adds additional information.', 
  ' ',
  'The following list contains available models that must be evaluated.',
  '',
  'Each item may contain fields such as:',
  '   - id',
  '   - name',
  '   - provider',
  '   - other descriptive metadata',
  '',
  'Use only identifiers present in this list when populating the response fields.',
  '',
  'Model identifiers may appear as either "id" or "name" in the list.',
  '',
  'Both the "id" and "model" fields in the output must contain the exact identifier copied from the provided list without modification.',
  '',
  'Model list:'
]; 
 
 
const STRICT_RULES = [
  'Only choose models that appear in the provided list.',
  'Do not invent or modify model identifiers.',
  'The "model" field must match exactly an identifier from the list.',
  'The "id" field must also match exactly the identifier from the list.',
  'Evaluate all models from the list, but return only the top-ranked models.',
  'Return no more than 20 models.',
  'Deprioritize models containing "latest", "preview", or "experimental" in their identifier.',
  'Prefer stable, generally available models with sustainable rate limits and token limits.',
  'Do not duplicate models in the output.'
];

 const ANALYSIS_INSTRUCTIONS = [
  'Before generating the final response, internally evaluate each model in the provided list.',
  '',
  'Follow this reasoning process:',
  '  1. Evaluate each model’s reasoning ability for analytical tasks.',
  '  2. Evaluate the model’s summarization capability.',
  '  3. Assess the model’s ability to generate reliable structured outputs.',
  '  4. Consider the model’s stability and expected reliability.',
  '  5. Consider usage constraints such as rate limits and token quotas.',
  '  6. Penalize models labeled "preview", "latest", or "experimental" due to likely usage limitations.',
 ];
 
const JSON_OUTPUT_RULES: string[] = [
  'Return ONLY valid JSON',
  'The JSON response must strictly match the schema.',
  'Do not add fields, rename fields, or omit required fields.',
  '',
  'Strict requirements:',
  'Do not include markdown',
  'Do not include commentary or explanations outside the JSON',
  'Do not include trailing commas',
  'Use double quotes for all strings', 
  'The final response must contain only the JSON object defined in the schema.',
  'Do not wrap the JSON in text.',
];

const SCORING_GUIDELINES = [
  'Assign each model a strength_score between 1 and 10 based on its suitability for the application.',
  '',
  'Use the following scoring interpretation:',
  '  - 10 = excellent for reasoning, summarization, and structured marketing analysis',
  '  - 8–9 = very strong and reliable for the use case',
  '  - 6–7 = good but with some limitations',
  '  - below 6 = generally unsuitable for this application',
]; 

 const INTERNAL_VALIDATION_CHECKLIST = [
  'All returned models appear in the provided model list.',
  'No model appears more than once.',
  'Models are ranked in descending order by strength_score.',
  'No more than 20 models are returned.',
  'Every output object matches the response schema exactly.',
  'All "id" and "model" values match identifiers from the provided list.',
  'All strength_score values are between 1 and 10.',
]; 
 
 
export function generateModelEvaluationPrompt(models: GeminiModel[] | GroqModel[]): string {
  const sections = [
    `ROLE:\n${ROLE.join("\n")}`,
    `TASK:\n${TASK.join("\n")}`,
    `APPLICATION USE CASE:\n${getPromptList('The selected models will be used in a marketing analysis application to perform the following tasks', APPLICATION_USE_CASE).join("\n")}\nThese tasks require models capable of structured reasoning, summarization, and reliable structured output generation.`,
    `SELECTION CRITERIA:\n${getPromptList('Evaluate models using the following criteria', SELECTION_CRITERIA).join("\n")}\nModels with higher sustained rate limits and token quotas should be preferred.\nExperimental, preview, or temporary models should be deprioritized because they often have limited availability and unstable rate limits.`,
    `INPUT DATA:\n${INPUT_DATA.join("\n")}\n${JSON.stringify(models)}`,
    `STRICT RULES:\n${getPromptNumberedList('Follow these rules when selecting models', STRICT_RULES).join("\n")}`,
    `ANALYSIS INSTRUCTIONS:\n${ANALYSIS_INSTRUCTIONS.join("\n")}`,
    `SCORING GUIDELINES:\n${SCORING_GUIDELINES.join("\n")}`, 
     `INTERNAL VALIDATION CHECKLIST:\n${getPromptNumberedList('Before generating the final response, verify the following:', INTERNAL_VALIDATION_CHECKLIST).join("\n")}`,
    `OUTPUT RULES:\n${JSON_OUTPUT_RULES.join("\n")}`,
    `RESPONSE SCHEMA:\n${OUTPUT_SCHEMA}`,
  ];

 return sections.join("\n\n");
}
