import type {
  CampaignClassificationThresholds,
  CampaignSummary,
  DynamicClassificationThresholds,
} from '../../types'
import { DEFAULT_CAMPAIGN_CLASSIFICATION_THRESHOLDS } from './constants'
import { computedMedianOrNull } from '@/shared/utils'
import { aggregateCampaignOutcomes } from '../metrics'

// ── Shared math helpers ───────────────────────────────────────────────────────


function filterOutNullish(values: Array<number | null>): number[] {
  return values.filter((value): value is number => value !== null)
}

/**
 * Returns median CTR and CVR across any collection of items that carry those fields.
 * Used by both campaign and channel classifiers to establish dataset baselines
 * for funnel-leak detection. Returns null for each metric when no non-null values exist.
 */
export function getFunnelMedians(items: Array<{ ctr: number | null; cvr: number | null }>): {
  medianCtr: number | null
  medianCvr: number | null
} {
  const ctrs = filterOutNullish(items.map(item => item.ctr))
  const cvrs = filterOutNullish(items.map(item => item.cvr))
  return {
    medianCtr: computedMedianOrNull(ctrs),
    medianCvr: computedMedianOrNull(cvrs),
  }
}

/**
 * Computes dynamic revenue and conversion floors from the portfolio totals.
 * Used to prevent micro-campaigns with inflated ROI (due to small denominators)
 * from crowding out genuinely significant performers in Top classification.
 * Floors are portfolio-relative (2% of total) with hard minimums (€50 / 2 conversions).
 */
export function getDynamicThresholds(
  campaigns: CampaignSummary[],
  thresholds: CampaignClassificationThresholds = DEFAULT_CAMPAIGN_CLASSIFICATION_THRESHOLDS,
): DynamicClassificationThresholds {
  const { revenue, conversions } = aggregateCampaignOutcomes(campaigns)

  return {
    minRevenue: Math.max(revenue * thresholds.minRevenueShare, thresholds.minRevenueFloor),
    minConversions: Math.max(
      conversions * thresholds.minConversionShare,
      thresholds.minConversionFloor,
    ),
  }
}
