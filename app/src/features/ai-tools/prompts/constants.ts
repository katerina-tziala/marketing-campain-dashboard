import type { PromptRuleGroup } from './types';

export const OUTPUT_REQUIREMENTS_RULES: PromptRuleGroup = {
  title: 'OUTPUT REQUIREMENTS',
  type: 'unordered',
  list: [
    'Return exactly one JSON object strictly matching the response schema.',
    'No markdown, commentary, surrounding text, or trailing commas.',
    'Use double quotes for all keys and string values.',
    'Do not add, remove, rename, or change field types or structure.',
  ],
};
