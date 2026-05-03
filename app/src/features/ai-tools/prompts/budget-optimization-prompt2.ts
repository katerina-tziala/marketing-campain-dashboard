import type { PortfolioAnalysis } from '@/shared/portfolio/types'
import type { BusinessContext } from '@/shared/portfolio'
import { getBusinessContextBlock } from './business-context'

const OUTPUT_SCHEMA = `{
  "summary": "string — one to two sentences describing the main optimization opportunity",
  "recommendations": [
    {
      "fromCampaign": "string",
      "toCampaign": "string",
      "budgetShift": number,
      "reason": "string",
      "expectedImpact": {
        "revenueChange": number,
        "conversionChange": number,
        "roiEstimate": number
      },
      "confidence": "High | Medium | Low",
      "executionRisk": "Low | Medium | High"
    }
  ]
}`

// ── Scope block ───────────────────────────────────────────────────────────────

function getScopeBlock(isFiltered: boolean): string {
  if (!isFiltered) {
    return `OPTIMIZATION SCOPE:
- Full portfolio optimization.
- Treat the provided dataset as the complete optimization universe for this request.`
  }

  return `OPTIMIZATION SCOPE:
- Filtered optimization scope.
- A subset of campaigns is selected.
- Treat the provided dataset as the complete optimization universe for this request.
- Do not assume campaigns outside the provided input.
- Do not recommend reallocations outside this subset.
- Do not generalize conclusions beyond this subset unless explicitly supported by the input.`
}

// ── Prompt generator ──────────────────────────────────────────────────────────

export function generateBudgetOptimizationPrompt(
  analysis: PortfolioAnalysis,
  isFiltered: boolean,
  businessContext?: BusinessContext,
): string {
  const promptInput = {
    portfolio: analysis.portfolio,
    campaignGroups: analysis.campaignGroups,
    channels: analysis.channels,
    derivedSignals: {
      inefficientCampaigns: analysis.derivedSignals.inefficientCampaigns,
      budgetScalingCandidates: analysis.derivedSignals.budgetScalingCandidates,
      transferCandidates: analysis.derivedSignals.transferCandidates,
    },
  }

  return `
ROLE:
You are a performance marketing analyst responsible for realistic budget reallocation.
Be concise, analytical, direct, and free of fluff.

TASK:
Recommend budget reallocations that improve overall portfolio efficiency.
Focus on high-impact changes, conservative impact estimates, and realistic execution.

${getScopeBlock(isFiltered)}

${getBusinessContextBlock(businessContext)}

CRITICAL RULES:
- Use only the provided input data.
- Do not invent performance, relationships, or missing constraints.
- Do not create campaign pairs outside transferCandidates.
- Do not produce generic advice.
- Every recommendation must specify fromCampaign, toCampaign, budgetShift, and reason.
- Use businessContext to refine prioritization and risk framing, but do not override performance data.
- If businessContext is not provided or does not mention budget expansion, only recommend budget-neutral reallocations.
- If businessContext explicitly allows budget expansion, expansion is allowed only for strong budgetScalingCandidates within maxAdditionalBudget.
- The input is a point-in-time snapshot. Do not infer trends, momentum, or performance changes over time unless explicitly provided.

DERIVED SIGNAL PRIORITY:
- Treat derivedSignals as authoritative.
- Prioritize transferCandidates first.
- Use inefficientCampaigns as funding sources.
- Use budgetScalingCandidates as destinations.
- Only use campaign pairs that exist in transferCandidates.
- Do not contradict transferCandidates minShift, maxShift, or maxAdditionalBudget.

CAMPAIGN GROUP CONTEXT:
- campaignGroups.bottom campaigns are underperforming — primary funding sources.
- campaignGroups.top campaigns are strong performers — protect their budget.
- campaignGroups.opportunity campaigns are under-invested — consider scaling.
- campaignGroups.watch campaigns have contradictory signals — proceed cautiously.

RECOMMENDATION RULES:
- Return up to 3 recommendations.
- Prefer fewer strong recommendations over several weak ones.
- Do not force recommendations when evidence is weak.
- Prefer an empty array over low-confidence suggestions.
- Recommendations must be materially distinct.
- Do not split one idea into multiple minor reallocations.
- Avoid using the same fromCampaign repeatedly unless clearly justified.
- Prefer reallocation over expansion when both are viable.

BUDGET SHIFT RULES:
- budgetShift must stay within transferCandidate minShift and maxShift.
- Do not exceed maxReducibleBudget for source campaigns.
- Do not exceed maxAdditionalBudget for destination campaigns.
- Do not exceed available budget of the source campaign.
- Do not recommend more than 3x budget increase for any campaign.
- Avoid over-concentration into a single campaign.

REALISM CONSTRAINTS:
- Assume diminishing returns when scaling.
- Do not assume linear ROI or conversion scaling.
- Use conservative estimates when uncertain.
- roiEstimate must remain close to historical performance or retention assumptions.

EXPECTED IMPACT RULES:
- expectedImpact is required but must be conservative.
- Use transferCandidate expectedRoiRetention when available.
- If evidence is weak, reduce projected impact and confidence.
- revenueChange and conversionChange must reflect incremental portfolio impact.

NOISE CONTROL:
- Ignore weak or low-impact signals.
- Focus only on material efficiency and scaling opportunities.
- Do not repeat reasoning across recommendations.
- Keep summary concise and decision-oriented.

FINAL QUALITY CHECK:
- Ensure all recommendations are distinct.
- Remove generic or reusable recommendations.
- Remove weak or speculative suggestions.
- If two recommendations are similar, keep only the stronger one.

OUTPUT REQUIREMENTS:
- Return only valid JSON matching the schema exactly.
- Do not add extra fields.
- Do not include markdown, commentary, or wrapper text.
- Use double quotes for all strings.
- Do not include trailing commas.
- All numeric values must remain numbers.
- roiEstimate must be a decimal (e.g. 1.8 = 180%).

OUTPUT SHAPE:
- exactly 1 summary
- up to 3 recommendations
- if no strong opportunity exists, return an empty recommendations array

RESPONSE SCHEMA:
${OUTPUT_SCHEMA}

INPUT DATA:
${JSON.stringify(promptInput, null, 2)}
`.trim()
}

// These overlap:

// CRITICAL RULES
// DERIVED SIGNAL PRIORITY
// BUDGET SHIFT RULES
// REALISM CONSTRAINTS

// They’re not bad — but you could compress ~15–20% later.

// 4. Missing “no self-reinforcing loops” guardrail

// Subtle but important.

// Sometimes models do:

// “Move budget from A to B because B is strong, and B is strong because it gets more budget”

// You want to prevent circular logic.

// Add:

// Do not justify a recommendation solely by restating the same efficiency signal. Each recommendation must include a distinct reason beyond simple ranking.
// 5. Summary could drift into fluff

// You say:

// summary: one to two sentences

// But no constraint like:

// must reflect top recommendation
// must be decision-oriented

// Better mental note (no need to change now):

// summary should compress the strongest reallocation idea
