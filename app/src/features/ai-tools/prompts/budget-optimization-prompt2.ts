// ===============================
// Shared Business Context
// ===============================




// ===============================
// Core Enums / Value Types
// ===============================

/**
 * Confidence level attached to a recommendation.
 * This reflects how strongly the input data supports the move.
 */
export type ConfidenceLevel = "High" | "Medium" | "Low";

/**
 * Execution risk of a recommendation.
 * This reflects operational and scaling risk, not model certainty.
 */
export type ExecutionRisk = "Low" | "Medium" | "High";


// ===============================
// Input Types
// ===============================

/**
 * Full input passed into the budget optimization prompt.
 * This should already be recomputed for the selected scope.
 *
 * Important:
 * - If the user selected a subset of campaigns, all values here
 *   must represent that subset only.
 * - Do not pass full-file totals with subset campaign rows.
 */
export interface BudgetOptimizerInput {
  /**
   * Portfolio-level totals used as optimization context.
   * These should be recomputed for the active scope.
   */
  portfolio: {
    totalBudget: number; // total available budget in scope
    totalRevenue: number; // total revenue in scope
    aggregatedRoi: number; // decimal, e.g. 1.68 = 168%
    totalConversions: number; // total conversions in scope
    campaignCount: number; // number of campaigns in scope 
  };

  /**
   * Campaign-level data available to the optimizer.
   * Keep this scoped to the active selection only.
   */
  campaigns: CampaignInput[];

  /**
   * Precomputed optimization signals.
   * These are authoritative and should be generated before AI runs.
   */
  derivedSignals: {
    inefficientCampaigns: InefficientCampaignSignal[];
    scalingCandidates: ScalingCandidateSignal[];
    transferCandidates: TransferCandidateSignal[];
  };

  /**
   * Optional business context used to refine prioritization and risk framing.
   * Data remains the primary source of truth.
   */
  // businessContext?: BudgetOptimizerBusinessContext;
}

/**
 * Core campaign row passed into the optimizer.
 * Uses budget terminology instead of spend because this feature
 * is about reallocation, expansion, and allocation decisions.
 */
export interface CampaignInput {
  campaign: string;
  channel: string;

  budget: number; // current campaign budget
  revenue: number; // current attributed revenue
  roi: number; // decimal, e.g. 0.8 = 80%
  conversions: number; // current conversions

  budgetShare: number; // share of total scoped budget, decimal
  revenueShare: number; // share of total scoped revenue, decimal
  efficiencyGap: number; // budgetShare - revenueShare
}

/**
 * Campaigns identified as likely funding sources.
 * These are candidates from which budget may be reduced.
 */
export interface InefficientCampaignSignal {
  campaign: string;
  roi: number; // current ROI
  budgetShare: number; // share of scoped budget
  revenueShare: number; // share of scoped revenue
  efficiencyGap: number; // budgetShare - revenueShare
  reason: string; // short deterministic explanation of inefficiency

  /**
   * Optional hard cap on how much budget can be removed safely.
   * If present, AI should not exceed it.
   */
  maxReducibleBudget?: number;
}

/**
 * Campaigns identified as likely destinations for more budget.
 * These are candidates to receive reallocated or expanded budget.
 */
export interface ScalingCandidateSignal {
  campaign: string;
  roi: number; // current ROI
  budgetShare: number; // share of scoped budget
  revenueShare: number; // share of scoped revenue
  reason: string; // short deterministic explanation of why it can scale

  /**
   * Optional hard cap on how much additional budget may be added safely.
   * If present, AI should not exceed it.
   */
  maxAdditionalBudget?: number;
}

/**
 * FE-computed source -> destination pair candidates.
 * These are the preferred and allowed reallocation pairs.
 *
 * Important:
 * - AI should only recommend pairs that exist here.
 * - This is the strongest anti-hallucination guardrail in the optimizer.
 */
export interface TransferCandidateSignal {
  fromCampaign: string; // budget source
  toCampaign: string; // budget destination

  /**
   * Allowed range for this shift.
   * AI must stay within these bounds.
   */
  minShift: number;
  maxShift: number;

  reason: string; // why this pair is viable
  priority: number; // lower = higher priority

  /**
   * Optional retention assumption for conservative scaling.
   * Example: 0.8 means destination campaign is assumed to retain 80%
   * of its historical ROI under additional budget.
   */
  expectedRoiRetention?: number;

  /**
   * Optional FE-computed confidence in this transfer pair.
   */
  confidence?: ConfidenceLevel;
}


// ===============================
// Output Types
// ===============================

/**
 * Full structured response returned by the model.
 * This is intentionally narrow: one summary + up to 3 recommendations.
 */
export interface BudgetOptimizerOutput {
  summary: string; // one-sentence overview of the main optimization opportunity
  recommendations: BudgetRecommendation[];
}

/**
 * A single budget reallocation or expansion recommendation.
 *
 * Notes:
 * - fromCampaign and toCampaign define the move
 * - budgetShift is absolute numeric amount
 * - expectedImpact should stay conservative
 */
export interface BudgetRecommendation {
  fromCampaign: string; // source of budget
  toCampaign: string; // destination of budget
  budgetShift: number; // absolute budget amount being moved or added
  reason: string; // why this change improves efficiency
  expectedImpact: {
    revenueChange: number; // incremental expected revenue impact
    conversionChange: number; // incremental expected conversion impact
    roiEstimate: number; // projected ROI after the move, decimal
  };

  confidence: ConfidenceLevel; // confidence in recommendation quality
  executionRisk: ExecutionRisk; // operational/scaling risk of executing the move
}
const OUTPUT_SCHEMA = `{
  "summary": "string — one to two sentences describing the main optimization opportunity",
  "recommendations": [
    {
      "fromCampaign": "string — source campaign providing budget",
      "toCampaign": "string — destination campaign receiving budget",
      "budgetShift": number — absolute budget amount being reallocated or added,
      "reason": "string — why this reallocation improves efficiency or performance",
      "expectedImpact": {
        "revenueChange": number — incremental expected revenue impact,
        "conversionChange": number — incremental expected conversion impact,
        "roiEstimate": number — projected ROI after the change (decimal, e.g. 1.8 = 180%)
      },
      "confidence": "High | Medium | Low — confidence in this recommendation",
      "executionRisk": "Low | Medium | High — operational or scaling risk"
    }
  ]
}`;

export function generateBudgetOptimizationPrompt(
  input: BudgetOptimizerInput
): string {
  return `
ROLE:
You are a performance marketing analyst responsible for realistic budget reallocation.
Be concise, analytical, direct, and free of fluff.

TASK:
Recommend budget reallocations that improve overall portfolio efficiency.
Focus on high-impact changes, conservative impact estimates, and realistic execution.

OPTIMIZATION SCOPE:
${input.scope?.isFiltered
  ? `- Filtered optimization scope.
- ${input.scope.description ?? "A subset of campaigns is selected."}
- Treat the provided dataset as the complete optimization universe for this request.
- Do not assume campaigns outside the provided input.
- Do not recommend reallocations outside this subset.
- Do not generalize conclusions beyond this subset unless explicitly supported by the input.`
  : `- Full portfolio optimization.
- Treat the provided dataset as the complete optimization universe for this request.`}

CRITICAL RULES:
- Use only the provided input data.
- Do not invent performance, relationships, or missing constraints.
- Do not create new campaign pairs outside transferCandidates.
- Do not produce generic advice.
- Every recommendation must specify:
  - fromCampaign
  - toCampaign
  - budgetShift
  - reason

DERIVED SIGNAL PRIORITY:
- Treat derivedSignals as authoritative.
- Prioritize transferCandidates first.
- Use inefficientCampaigns as funding sources.
- Use scalingCandidates as destinations.
- Only use campaign pairs that exist in transferCandidates.
- Do not contradict transferCandidates, minShift, maxShift, maxReducibleBudget, or maxAdditionalBudget.

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
- Do not recommend more than 3x increase for any campaign.
- Avoid over-concentration into a single campaign.

REALISM CONSTRAINTS:
- Assume diminishing returns when scaling.
- Do not assume linear ROI or conversion scaling.
- Use conservative estimates when uncertain.
- roiEstimate must remain close to historical performance or retention assumptions.

EXPECTED IMPACT RULES:
- expectedImpact is required but must be conservative.
- Use transferCandidate.expectedRoiRetention when available.
- If evidence is weak, reduce projected impact and confidence.
- revenueChange and conversionChange must reflect incremental portfolio impact.

BUSINESS CONTEXT:
- Use businessContext to refine prioritization and risk framing, but do not override performance data.
- If allowBudgetExpansion is false or not provided:
  - Only recommend budget-neutral reallocations.
- If allowBudgetExpansion is true:
  - Expansion is allowed only for strong scalingCandidates.
  - Do not expand outside scalingCandidates.
  - Do not exceed maxAdditionalBudget.
  - Expansion must be conservative and justified.
  - Do not recommend multiple expansion moves unless clearly supported.
  - Do not use expansion if strong reallocation exists.

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
- Return only valid JSON.
- Follow schema exactly.
- No markdown, no commentary.
- Use double quotes.
- No trailing commas.
- All numeric values must remain numbers.
- roiEstimate must be a decimal (e.g. 1.8 = 180%).
- The period field must only be included if present in the input or businessContext.

OUTPUT SHAPE:
- exactly 1 summary
- up to 3 recommendations
- if no strong opportunity exists, return an empty recommendations array

RESPONSE SCHEMA:
${OUTPUT_SCHEMA}

INPUT DATA:
${JSON.stringify(input, null, 2)}
`.trim();
}