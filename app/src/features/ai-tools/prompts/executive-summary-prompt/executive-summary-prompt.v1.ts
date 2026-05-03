import type { AiAnalysisContext } from '@/features/ai-tools/ai-analysis/types'
import { getPromptRuleGroup } from '../utils'
import { OUTPUT_REQUIREMENTS_RULES } from '../constants'
import { ROLE_TASK_OBJECTIVE_RULES, FULL_PORTFOLIO_ANALYSIS_RULES, SELECTION_ANALYSIS_RULES, OUTPUT_SCHEMA } from './config'

export function generateExecutiveSummaryPrompt(
  context: AiAnalysisContext,
): string {
  const { analysis, businessContext, portfolioBenchmark } = context


  const { portfolio, campaignGroups, channels, channelGroups,
    derivedSignals: { inefficientChannels, scalingOpportunities, concentrationFlag, correlations }
  } = analysis

  // remove noise
  const promptInput = {
    portfolio,
    portfolioBenchmark, // full portfolio benchmark when filtered
    campaignGroups,
    channels,
    channelGroups,
    derivedSignals: {
      inefficientChannels,
      scalingOpportunities,
      concentrationFlag,
      correlations,
    },
  }

  const analysisRules = portfolioBenchmark ? SELECTION_ANALYSIS_RULES : FULL_PORTFOLIO_ANALYSIS_RULES

  const promptSections = [
    ...ROLE_TASK_OBJECTIVE_RULES.map(getPromptRuleGroup),
    `INPUT DATA:\n${JSON.stringify(promptInput)}`,
    `BUSINESS CONTEXT:\n${businessContext ? JSON.stringify(businessContext) : 'No business context provided.'}`,
    ...analysisRules.map(getPromptRuleGroup),
    getPromptRuleGroup(OUTPUT_REQUIREMENTS_RULES),
    `RESPONSE SCHEMA:\n${OUTPUT_SCHEMA}`,
  ]

  return promptSections.join('\n\n').trim()
}

