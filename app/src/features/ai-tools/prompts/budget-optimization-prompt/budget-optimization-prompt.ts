import type { AiAnalysisContext } from '../../ai-analysis/types';
import { OUTPUT_REQUIREMENTS_RULES } from '../constants';
import { getPromptRuleGroup } from '../utils';
import {
  FULL_PORTFOLIO_OPTIMIZATION_RULES,
  OUTPUT_SCHEMA,
  ROLE_TASK_OBJECTIVE_RULES,
  SELECTION_ANALYSIS_RULES,
} from './config.v1';

export function generateBudgetOptimizationPrompt(context: AiAnalysisContext): string {
  const { analysis, businessContext, portfolioBenchmark } = context;
  const { portfolio, campaignGroups, channels, channelContext, channelGroups, derivedSignals } =
    analysis;

  const promptInput = {
    portfolio,
    channels,
    channelContext,
    campaignGroups,
    channelGroups,
    derivedSignals,
    portfolioBenchmark, // full portfolio benchmark when filtered
  };

  const analysisRules = portfolioBenchmark
    ? SELECTION_ANALYSIS_RULES
    : FULL_PORTFOLIO_OPTIMIZATION_RULES;

  const promptSections = [
    ...ROLE_TASK_OBJECTIVE_RULES.map(getPromptRuleGroup),
    `INPUT DATA:\n${JSON.stringify(promptInput)}`,
    `BUSINESS CONTEXT:\n${businessContext ? JSON.stringify(businessContext) : 'No business context provided.'}`,
    ...analysisRules.map(getPromptRuleGroup),
    getPromptRuleGroup(OUTPUT_REQUIREMENTS_RULES),
    `RESPONSE SCHEMA:\n${OUTPUT_SCHEMA}`,
  ];

  return promptSections.join('\n\n').trim();
}
