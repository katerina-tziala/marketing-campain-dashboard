import type {
  AnalysisClassificationThresholds,
  CampaignClassificationThresholds,
  ChannelClassificationThresholds,
} from '../types'

/**
 * Classification thresholds are descriptive UI buckets, not action signals.
 * They intentionally stay separate from signal thresholds so tuning a label
 * never changes which recommendations are generated.
 */
export const DEFAULT_CAMPAIGN_CLASSIFICATION_THRESHOLDS: CampaignClassificationThresholds = {
  // 10% above portfolio ROI is meaningful outperformance without demanding an unrealistic gap.
  topRoiFactor: 1.1,

  // Funnel leak: strong click intent, weak conversion follow-through.
  watchCtrFactor: 1.2,
  watchCvrFactor: 0.8,

  // Positive ROI but at least 10% below portfolio average is worth monitoring.
  watchRoiFactor: 0.9,

  // Ignore tiny budget slices when placing campaigns in weaker buckets.
  minBudgetShare: 0.01,

  // Budget share exceeds revenue share by 5 percentage points.
  gapThreshold: 0.05,

  // Dynamic Top gates prevent micro-campaigns from winning on small denominators.
  minRevenueShare: 0.02,
  minRevenueFloor: 50,
  minConversionShare: 0.02,
  minConversionFloor: 2,
}

export const DEFAULT_CHANNEL_CLASSIFICATION_THRESHOLDS: ChannelClassificationThresholds = {
  // 10% above portfolio ROI is meaningful channel-level outperformance.
  topRoiFactor: 1.1,

  // Funnel leak: strong click intent, weak conversion follow-through.
  watchCtrFactor: 1.2,
  watchCvrFactor: 0.8,

  // Positive ROI but at least 10% below portfolio average is worth monitoring.
  watchRoiFactor: 0.9,

  // Budget share exceeds revenue share by 5 percentage points.
  gapThreshold: 0.05,
}

export const DEFAULT_ANALYSIS_CLASSIFICATION_THRESHOLDS: AnalysisClassificationThresholds = {
  campaigns: DEFAULT_CAMPAIGN_CLASSIFICATION_THRESHOLDS,
  channels: DEFAULT_CHANNEL_CLASSIFICATION_THRESHOLDS,
}
