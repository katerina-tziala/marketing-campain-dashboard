import type { CampaignSummary } from '../types/campaign'
import type { CampaignGroups } from './types'
import { CLASSIFY_THRESHOLDS, getDynamicThresholds, getFunnelMedians } from './classify-utils'

// ── Classification predicates ─────────────────────────────────────────────────

const t = CLASSIFY_THRESHOLDS

function isTop(
  c: CampaignSummary,
  portfolioRoi: number | null,
  minRevenue: number,
  minConversions: number,
): boolean {
  // Requires both strong ROI relative to the portfolio and sufficient absolute size.
  // The dynamic size gate (minRevenue, minConversions) prevents micro-campaigns
  // with small denominators inflating their ROI ratio from being mistaken for
  // genuine top performers.
  if (c.roi === null || portfolioRoi === null) return false
  return (
    c.budget > 0 &&
    c.revenue >= minRevenue &&
    c.conversions >= minConversions &&
    c.roi > portfolioRoi * t.topRoiFactor
  )
}

function isOpportunity(c: CampaignSummary, portfolioRoi: number | null): boolean {
  // Revenue share meets or exceeds budget share — the campaign already delivers
  // efficiently for what it receives. ROI at or above the portfolio average confirms
  // genuine performance. Not reaching the Top threshold typically means the campaign
  // is under-invested rather than weak: increasing its budget allocation is likely
  // to return proportionate gains.
  const roi = c.roi ?? 0
  const refRoi = portfolioRoi ?? 0
  return c.budget > 0 && roi >= refRoi && c.revenueShare >= c.budgetShare
}

function isBottom(c: CampaignSummary, portfolioRoi: number | null): boolean {
  // Budget share significantly exceeds revenue share (large efficiencyGap) AND the
  // campaign underperforms the portfolio average on ROI. Both conditions together
  // avoid penalising campaigns that are expensive but still above-average on returns —
  // those are candidates for scaling, not cutting.
  const roi = c.roi !== null ? c.roi : -Infinity
  const refRoi = portfolioRoi ?? 0
  return (
    c.budget > 0 &&
    c.budgetShare >= t.minBudgetShare &&
    c.efficiencyGap > t.gapThreshold &&
    roi < refRoi
  )
}

function isWatch(
  c: CampaignSummary,
  portfolioRoi: number | null,
  medianCtr: number | null,
  medianCvr: number | null,
): boolean {
  if (c.budget <= 0 || c.budgetShare < t.minBudgetShare) return false

  // Funnel leak: high CTR relative to the dataset median signals that creative
  // and targeting are working — the ad earns the click. But low CVR relative to
  // the median signals that the post-click experience breaks conversion: the landing
  // page, offer, or checkout flow loses the user. This contradictory pattern is
  // detectable in a single snapshot because it is a within-campaign ratio
  // comparison, not a trend.
  const hasFunnelLeak =
    medianCtr !== null &&
    medianCvr !== null &&
    c.ctr !== null &&
    c.cvr !== null &&
    c.ctr > medianCtr * t.watchCtrFactor &&
    c.cvr < medianCvr * t.watchCvrFactor

  // Positive but underperforming ROI: the campaign is not losing money but lags
  // clearly behind the portfolio average — too good to cut, too weak to scale.
  // A 10% buffer below the average (watchRoiFactor = 0.9) avoids flagging campaigns
  // that are simply average performers; the signal only fires for a meaningful,
  // consistent underperformance.
  const roi = c.roi !== null ? c.roi : -1
  const refRoi = portfolioRoi ?? 0
  const hasUnderperformingRoi = roi >= 0 && roi < refRoi * t.watchRoiFactor

  return hasFunnelLeak || hasUnderperformingRoi
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
): CampaignGroups {
  const { medianCtr, medianCvr } = getFunnelMedians(campaigns)
  const { minRevenue, minConversions } = getDynamicThresholds(campaigns)

  const top: CampaignSummary[] = []
  const opportunity: CampaignSummary[] = []
  const bottom: CampaignSummary[] = []
  const watch: CampaignSummary[] = []

  for (const c of campaigns) {
    if (isTop(c, portfolioRoi, minRevenue, minConversions)) {
      top.push(c)
    } else if (isOpportunity(c, portfolioRoi)) {
      opportunity.push(c)
    } else if (isBottom(c, portfolioRoi)) {
      bottom.push(c)
    } else if (isWatch(c, portfolioRoi, medianCtr, medianCvr)) {
      watch.push(c)
    }
  }

  // Sort each group so the most actionable items appear first.
  top.sort((a, b) => (b.roi ?? 0) - (a.roi ?? 0))
  opportunity.sort((a, b) => (b.roi ?? 0) - (a.roi ?? 0))
  bottom.sort((a, b) => b.efficiencyGap - a.efficiencyGap)
  watch.sort((a, b) => b.budgetShare - a.budgetShare)

  return { top, opportunity, bottom, watch }
}
