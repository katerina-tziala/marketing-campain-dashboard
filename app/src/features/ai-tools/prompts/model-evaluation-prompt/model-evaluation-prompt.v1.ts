import type { AiModelCandidate } from '@/features/ai-tools/providers/types'
import { getPromptRuleGroup } from '../utils'
import { OUTPUT_REQUIREMENTS_RULES } from '../constants'
import { ROLE_AND_TASK_RULES, EVALUATION_RULES, OUTPUT_SCHEMA } from './config'

export function generateModelEvaluationPrompt(
  models: AiModelCandidate[],
): string {
  const promptSections = [
    ...ROLE_AND_TASK_RULES.map(getPromptRuleGroup),
    `INPUT MODEL LIST:\n${JSON.stringify(models, null, 2)}`,
    ...EVALUATION_RULES.map(getPromptRuleGroup),
    getPromptRuleGroup(OUTPUT_REQUIREMENTS_RULES),
    `RESPONSE SCHEMA:\n${OUTPUT_SCHEMA}`
  ];

  return promptSections.join('\n\n').trim()
}
