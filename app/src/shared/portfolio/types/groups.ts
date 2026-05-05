import type { CampaignSummary, ChannelSummary } from './summary';

/**
 * Four mutually exclusive campaign performance buckets.
 * Each campaign appears in exactly one group; all groups may be empty.
 * See classification/campaign-classification.ts for full classification logic and rationale.
 */
export interface CampaignGroups {
  /** ROI significantly above portfolio average; meets size thresholds. */
  top: CampaignSummary[];
  /** ROI at or above portfolio average, revenue share ≥ budget share — under-invested. */
  opportunity: CampaignSummary[];
  /** Budget share significantly exceeds revenue share; ROI below portfolio average. */
  bottom: CampaignSummary[];
  /** Contradictory signals: funnel leak or positive-but-underperforming ROI. */
  watch: CampaignSummary[];
}

/**
 * Four mutually exclusive channel performance buckets.
 * Each channel appears in exactly one group; all groups may be empty.
 * See classification/channel-classification.ts for full classification logic and rationale.
 */
export interface ChannelGroups {
  /** ROI significantly above portfolio average; revenue share ≥ budget share. */
  strong: ChannelSummary[];
  /** ROI at or above portfolio average, revenue share ≥ budget share — under-invested. */
  opportunity: ChannelSummary[];
  /** Budget share significantly exceeds revenue share; ROI below portfolio average. */
  weak: ChannelSummary[];
  /** Contradictory signals: funnel leak or positive-but-underperforming ROI. */
  watch: ChannelSummary[];
}
