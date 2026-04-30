import type { CampaignSummary } from './types'
import { getMedian } from '@/shared/utils/math'

/**
 * Classification thresholds — all numeric decision boundaries live here.
 *
 * Grouped in one place to serve as the natural seam for future user configurability:
 * if thresholds become user-defined, this object is the only thing that needs
 * to accept external input. Each threshold is documented with its marketing rationale
 * so the intent survives across refactors.
 */
export const CLASSIFY_THRESHOLDS = {
  // ── Top / Strong ────────────────────────────────────────────────────────────

  // A campaign/channel is "Top" / "Strong" when its ROI exceeds the portfolio
  // average by this factor. 1.1 = 10% above average — meaningful outperformance
  // rather than noise, without requiring an unrealistic gap.
  topRoiFactor: 1.1,

  // ── Watch — funnel leak ──────────────────────────────────────────────────────

  // A funnel leak is detected when CTR is significantly above the dataset median
  // (creative/targeting successfully drives clicks) but CVR is significantly below
  // (the post-click experience — landing page, offer, checkout — breaks conversion).
  // Both conditions must hold simultaneously to avoid false positives from
  // independent, unrelated variance in either metric.
  watchCtrFactor: 1.2,  // CTR > median × 1.2  →  20% above median
  watchCvrFactor: 0.8,  // CVR < median × 0.8  →  20% below median

  // ── Watch — underperforming ROI ──────────────────────────────────────────────

  // A campaign/channel with positive but clearly below-average ROI is worth
  // monitoring: it is spending and returning value, but not efficiently enough
  // to scale or safely cut. The 0.9 factor creates a 10% buffer below the
  // portfolio average — campaigns right at the average are normal; campaigns
  // 10%+ below it show a consistent pattern worth flagging.
  watchRoiFactor: 0.9,

  // ── Size gate ────────────────────────────────────────────────────────────────

  // Minimum budget share for a campaign/channel to enter any classification bucket.
  // Below this threshold the spend is too small to draw statistically reliable
  // conclusions — micro-budgets often show extreme ratios (ROI, CTR, CVR) that
  // are artefacts of small denominators, not genuine signals.
  minBudgetShare: 0.01,

  // ── Bottom / Weak ────────────────────────────────────────────────────────────

  // Campaigns/channels where budgetShare − revenueShare exceeds this threshold
  // are consuming disproportionate budget relative to the revenue they generate.
  // Used together with a below-average ROI check to avoid penalising campaigns
  // that are expensive but still outperform the portfolio on returns.
  gapThreshold: 0.05,
} as const

// ── Shared math helpers ───────────────────────────────────────────────────────

/**
 * Returns median CTR and CVR across any collection of items that carry those fields.
 * Used by both campaign and channel classifiers to establish dataset baselines
 * for funnel-leak detection. Returns null for each metric when no non-null values exist.
 */
export function getFunnelMedians(items: Array<{ ctr: number | null; cvr: number | null }>): {
  medianCtr: number | null
  medianCvr: number | null
} {
  const ctrs = items.map(i => i.ctr).filter((v): v is number => v !== null)
  const cvrs = items.map(i => i.cvr).filter((v): v is number => v !== null)
  return {
    medianCtr: ctrs.length > 0 ? getMedian(ctrs) : null,
    medianCvr: cvrs.length > 0 ? getMedian(cvrs) : null,
  }
}

/**
 * Computes dynamic revenue and conversion floors from the portfolio totals.
 * Used to prevent micro-campaigns with inflated ROI (due to small denominators)
 * from crowding out genuinely significant performers in Top classification.
 * Floors are portfolio-relative (2% of total) with hard minimums (€50 / 2 conversions).
 */
export function getDynamicThresholds(campaigns: CampaignSummary[]): {
  minRevenue: number
  minConversions: number
} {
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0)
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0)
  return {
    minRevenue: Math.max(totalRevenue * 0.02, 50),
    minConversions: Math.max(totalConversions * 0.02, 2),
  }
}
