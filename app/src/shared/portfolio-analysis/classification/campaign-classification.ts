import type { CampaignClassificationThresholds, CampaignSummary } from '../types'
import type { CampaignGroups } from '../types'
import { rankByAllocationGapDesc, rankByBudgetShareDesc, rankByRoiDesc } from '../ranking'
import {
  hasBudgetShareLead,
  hasMinimumBudgetShare,
  hasRoiBelowPortfolio,
} from '../checkers'
import {
  hasFunnelLeak,
  hasPositiveUnderperformingRoi,
  hasRoiAbovePortfolioFactor,
} from './classification-checkers'
import { DEFAULT_CAMPAIGN_CLASSIFICATION_THRESHOLDS } from './constants'
import { getDynamicThresholds, getFunnelMedians } from './classification-utils'

// ── Classification predicates ─────────────────────────────────────────────────

/**
 * 
 * Requires both strong ROI relative to the portfolio and sufficient absolute size.
 * The dynamic size gate (minRevenue, minConversions) prevents micro-campaigns
 * with small denominators inflating their ROI ratio from being mistaken for
 * genuine top performers.
 */
function isTop(
  c: CampaignSummary,
  portfolioRoi: number | null,
  minRevenue: number,
  minConversions: number,
  thresholds: CampaignClassificationThresholds,
): boolean {

  return (
    c.budget > 0 &&
    c.revenue >= minRevenue &&
    c.conversions >= minConversions &&
    hasRoiAbovePortfolioFactor(c, portfolioRoi, thresholds.topRoiFactor)
  )
}

/**
 * 
 * Revenue share meets or exceeds budget share — the campaign already delivers
 * efficiently for what it receives. ROI at or above the portfolio average confirms
 * genuine performance. Not reaching the Top threshold typically means the campaign
 * is under-invested rather than weak: increasing its budget allocation is likely
 * to return proportionate gains.
 */
function isOpportunity(
  c: CampaignSummary,
  portfolioRoi: number | null,
): boolean {

  const roi = c.roi ?? 0
  const refRoi = portfolioRoi ?? 0
  return c.budget > 0 && roi >= refRoi && c.revenueShare >= c.budgetShare
}

/**
 * Budget share significantly exceeds revenue share (large allocationGap) AND the
 * campaign underperforms the portfolio average on ROI. Both conditions together
 * avoid penalising campaigns that are expensive but still above-average on returns —
 * those are candidates for scaling, not cutting.
 */
function isBottom(
  c: CampaignSummary,
  portfolioRoi: number | null,
  thresholds: CampaignClassificationThresholds,
): boolean {

  return (
    c.budget > 0 &&
    hasMinimumBudgetShare(c, thresholds.minBudgetShare) &&
    hasBudgetShareLead(c, thresholds.gapThreshold) &&
    hasRoiBelowPortfolio(c, portfolioRoi ?? 0)
  )
}

/**
 * Watch captures either a funnel leak or positive ROI that lags the portfolio.
 * The concrete checks live in shared classification predicates because channels
 * and campaigns use the same descriptive rules.
 */
function isWatch(
  c: CampaignSummary,
  portfolioRoi: number | null,
  medianCtr: number | null,
  medianCvr: number | null,
  thresholds: CampaignClassificationThresholds,
): boolean {
  if (c.budget <= 0 || c.budgetShare < thresholds.minBudgetShare) return false


  return (
    hasFunnelLeak(c, medianCtr, medianCvr, thresholds) ||
    hasPositiveUnderperformingRoi(c, portfolioRoi, thresholds)
  )
}

// ── Classifier ────────────────────────────────────────────────────────────────

/**
 * Classifies campaigns into four mutually exclusive groups using a priority cascade:
 * Top → Opportunity → Bottom → Watch.
 *
 * Each campaign lands in exactly one group. Groups may be empty — no minimum
 * dataset size is required. Classification is per-item so small datasets (1, 2, 3
 * campaigns) are handled correctly without special-casing.
 */
export function classifyCampaigns(
  campaigns: CampaignSummary[],
  portfolioRoi: number | null,
  thresholds: CampaignClassificationThresholds = DEFAULT_CAMPAIGN_CLASSIFICATION_THRESHOLDS,
): CampaignGroups {
  const { medianCtr, medianCvr } = getFunnelMedians(campaigns)
  const { minRevenue, minConversions } = getDynamicThresholds(campaigns, thresholds)

  const top: CampaignSummary[] = []
  const opportunity: CampaignSummary[] = []
  const bottom: CampaignSummary[] = []
  const watch: CampaignSummary[] = []

  for (const c of campaigns) {
    if (isTop(c, portfolioRoi, minRevenue, minConversions, thresholds)) {
      top.push(c)
    } else if (isOpportunity(c, portfolioRoi)) {
      opportunity.push(c)
    } else if (isBottom(c, portfolioRoi, thresholds)) {
      bottom.push(c)
    } else if (isWatch(c, portfolioRoi, medianCtr, medianCvr, thresholds)) {
      watch.push(c)
    }
  }

  return {
    top: rankByRoiDesc(top),
    opportunity: rankByRoiDesc(opportunity),
    bottom: rankByAllocationGapDesc(bottom),
    watch: rankByBudgetShareDesc(watch),
  }
}
