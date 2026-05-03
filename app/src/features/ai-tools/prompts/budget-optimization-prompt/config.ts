import type { PromptRuleGroup } from '../types'

export const ROLE_TASK_OBJECTIVE_RULES: PromptRuleGroup[] = [
  {
    title: 'ROLE',
    type: 'none',
    list: [
      'You are a performance marketing portfolio optimizer.',
      'Your job is to turn structured portfolio data into realistic budget allocation decisions.',
    ],
  },
  {
    title: 'TASK',
    type: 'ordered',
    list: [
      'Budget optimization recommendations (existing budget)',
      'Budget expansion opportunities (new budget, only if justified)',
    ],
    preamble: 'Analyze the full portfolio and produce:',
  },
  {
    title: 'OBJECTIVE',
    type: 'none',
    list: [
      'Improve ROI and budget efficiency while preserving conversion potential.',
    ],
  },
]

export const FULL_PORTFOLIO_OPTIMIZATION_RULES: PromptRuleGroup[] = [
  {
    title: 'SCOPE',
    type: 'unordered',
    list: [
      'Full portfolio analysis.',
      'All provided channels and campaigns are within scope.',
      'All recommendations must be based only on entities present in INPUT DATA.',
    ],
  },
  {
    title: 'CRITICAL RULES',
    type: 'unordered',
    list: [
      'Use only the provided input data; do not invent entities, metrics, or constraints.',
      'Treat derivedSignals as authoritative.',
      'BUSINESS CONTEXT may influence prioritization, not override data.',
      'Do not infer trends or time-based changes.',
      'Avoid generic or non-actionable advice.',
    ],
  },
  {
    title: 'DERIVED SIGNAL PRIORITY',
    type: 'unordered',
    list: [
      'transferCandidates → required source for reallocations',
      'inefficientCampaigns → funding sources',
      'budgetScalingCandidates → destinations',
      'scalingOpportunities → expansion signals',
      'Respect all min/max constraints.',
    ],
  },
  {
    title: 'RECOMMENDATION RULES',
    type: 'unordered',
    list: [
      'Return 0–3 distinct, high-impact recommendations using existing budget.',
      'Prefer reallocation; allow reduction only if no strong destination exists.',
      'Use ONLY transferCandidates pairs.',
      'Do not split one idea into multiple minor actions.',
      'If evidence is weak, return an empty array.',
    ],
  },
  {
    title: 'BUDGET CONSTRAINTS',
    type: 'unordered',
    list: [
      'Keep budgetShift within transferCandidate limits and available budget.',
      'Respect maxReducibleBudget and maxAdditionalBudget.',
      'Do not exceed ~3x increase for any campaign.',
      'Avoid over-concentration.',
    ],
  },
  {
    title: 'EXPANSION LOGIC',
    type: 'unordered',
    list: [
      'Return 0–2 expansion opportunities using new budget only.',
      'Use scalingOpportunities or budgetScalingCandidates.',
      'Include only if strongly justified; otherwise return empty.',
      'Stay within maxAdditionalBudget when available.',
      'Assume diminishing returns.',
    ],
  },
  {
    title: 'EXPECTED IMPACT',
    type: 'unordered',
    list: [
      'Keep estimates conservative and non-linear.',
      'Use expectedRoiRetention when available.',
      'Reduce confidence and impact when evidence is weak.',
    ],
  },
  {
    title: 'NOISE CONTROL',
    type: 'unordered',
    list: [
      'Focus only on material opportunities.',
      'Avoid repeated reasoning or low-signal insights.',
    ],
  },
  {
    title: 'FINAL QUALITY CHECK',
    type: 'unordered',
    list: [
      'Ensure recommendations are distinct and high-quality.',
      'Remove weak, redundant, or speculative suggestions.',
    ],
  },
]

export const SELECTION_ANALYSIS_RULES: PromptRuleGroup[] = [
  {
    title: 'SCOPE',
    type: 'unordered',
    list: [
      'Selected subset analysis.',
      'Treat INPUT DATA as the only actionable scope.',
      'Use portfolioBenchmark only for comparison and context.',
      'Do not assume the selected subset represents the full portfolio.',
      'Do not recommend actions involving campaigns or channels outside INPUT DATA.',
    ],
  },
  {
    title: 'CRITICAL RULES',
    type: 'unordered',
    list: [
      'Use only the provided input data; do not invent entities, metrics, or constraints.',
      'Treat derivedSignals from INPUT DATA as authoritative.',
      'BUSINESS CONTEXT may influence prioritization, not override data.',
      'Use portfolioBenchmark only for comparison; never generate recommendations from benchmark-only data.',
      'Do not infer trends or time-based changes.',
      'Avoid generic or non-actionable advice.',
    ],
  },
  {
    title: 'DERIVED SIGNAL PRIORITY',
    type: 'unordered',
    list: [
      'transferCandidates → required source for reallocations within the selected subset',
      'inefficientCampaigns → funding sources within the selected subset',
      'budgetScalingCandidates → destinations within the selected subset',
      'scalingOpportunities → expansion signals within the selected subset',
      'Respect all min/max constraints.',
    ],
  },
  {
    title: 'RECOMMENDATION RULES',
    type: 'unordered',
    list: [
      'Return 0–3 distinct, high-impact recommendations using existing budget within the selected subset.',
      'Prefer reallocation; allow reduction only if no strong destination exists.',
      'Use ONLY transferCandidates pairs.',
      'Do not split one idea into multiple minor actions.',
      'If evidence is weak, return an empty array.',
    ],
  },
  {
    title: 'BUDGET CONSTRAINTS',
    type: 'unordered',
    list: [
      'Keep budgetShift within transferCandidate limits and available budget.',
      'Respect maxReducibleBudget and maxAdditionalBudget.',
      'Do not exceed ~3x increase for any campaign.',
      'Avoid over-concentration within the selected subset.',
    ],
  },
  {
    title: 'EXPANSION LOGIC',
    type: 'unordered',
    list: [
      'Return 0–2 expansion opportunities using new budget only.',
      'Use scalingOpportunities or budgetScalingCandidates from the selected subset.',
      'Include only if strongly justified relative to subset performance and portfolioBenchmark.',
      'Do not recommend expansion for entities outside the selected subset.',
      'Stay within maxAdditionalBudget when available.',
      'Assume diminishing returns.',
    ],
  },
  {
    title: 'EXPECTED IMPACT',
    type: 'unordered',
    list: [
      'Keep estimates conservative and non-linear.',
      'Use expectedRoiRetention when available.',
      'Reduce confidence and impact when evidence is weak.',
      'Expected impact must apply only to the selected subset.',
    ],
  },
  {
    title: 'NOISE CONTROL',
    type: 'unordered',
    list: [
      'Focus only on material opportunities within the selected subset.',
      'Avoid repeated reasoning or low-signal insights.',
    ],
  },
  {
    title: 'FINAL QUALITY CHECK',
    type: 'unordered',
    list: [
      'Ensure recommendations are distinct and high-quality.',
      'Remove weak, redundant, or speculative suggestions.',
      'Remove any recommendation involving entities outside the selected subset.',
    ],
  },
]

export const OUTPUT_SCHEMA = `{
  "summary": "string — one to two sentences describing the main optimization opportunity or why no strong action is recommended",
  "recommendations": [
    {
      "type": "reallocation | reduction",
      "fromCampaign": "string",
      "fromChannel": "string",
      "toCampaign": "string | null",
      "toChannel": "string | null",
      "budgetShift": number,
      "reason": "string",
      "expectedImpact": {
        "revenueChange": number | null,
        "conversionChange": number | null,
        "roiEstimate": number | null
      },
      "confidence": "High | Medium | Low",
      "executionRisk": "Low | Medium | High"
    }
  ],
  "expansions": [
    {
      "targetCampaign": "string | null",
      "targetChannel": "string",
      "additionalBudget": number,
      "reason": "string",
      "expectedImpact": {
        "revenueChange": number | null,
        "conversionChange": number | null,
        "roiEstimate": number | null
      },
      "confidence": "High | Medium | Low",
      "executionRisk": "Low | Medium | High"
    }
  ],
  "noRecommendationReason": "string | null"
}`
