import type {
  AnalysisSignalThresholds,
  CampaignSignalThresholds,
  ChannelSignalThresholds,
  ChannelStatusThresholds,
  PortfolioSignalThresholds,
} from '../types'

// Channel status uses a narrow ROI band around the portfolio average so the
// summary label stays stable unless a channel is meaningfully above or below it.
export const DEFAULT_CHANNEL_STATUS_THRESHOLDS: ChannelStatusThresholds = {
  strongStatusRoiFactor: 1.1,
  weakStatusRoiFactor: 0.9,
}

// Channel inefficiency is only actionable once budget/revenue imbalance is large
// enough to matter at portfolio level.
export const DEFAULT_CHANNEL_SIGNAL_THRESHOLDS: ChannelSignalThresholds = {
  gapThreshold: 0.05,
  // Channel scaling can be slightly more sensitive than inefficiency because it
  // points to upside rather than immediate budget reduction.
  scalingGapThreshold: 0.03,
  // Ignore tiny channel allocations where share-based ratios are too noisy to act on.
  minBudgetShareSignal: 0.03,
  minRevenueShareSignal: 0.03,
}

export const DEFAULT_CAMPAIGN_SIGNAL_THRESHOLDS: CampaignSignalThresholds = {
  // Campaign inefficiency ignores tiny allocations to avoid overreacting to small
  // experimental campaigns with noisy ratios.
  minBudgetShareSignal: 0.02,
  // Signals only treat budget/revenue imbalance as actionable once the gap is
  // large enough to matter at portfolio level.
  gapThreshold: 0.05,
  // Transfer recommendations never remove the full budget from a weak campaign.
  maxReducibleFraction: 0.5,
  // Scaling recommendations cap upside estimates so suggested increases stay bounded.
  maxAdditionalFraction: 2.0,
  // Expected retention assumes ROI decays slightly when extra budget is added.
  baseRoiRetention: 0.85,
}

export const DEFAULT_PORTFOLIO_SIGNAL_THRESHOLDS: PortfolioSignalThresholds = {
  // Transfer ranges start with a small meaningful shift, but never below the floor.
  minShiftFraction: 0.1,
  minShiftFloor: 50,
  // Concentration is only meaningful once there are enough campaigns to compare.
  minCampaignsForConcentration: 3,
  topRevenueCampaignCount: 3,
  // Revenue concentration flags identify when one or three campaigns dominate output.
  highTop1RevenueShare: 0.4,
  highTop3RevenueShare: 0.75,
  moderateTop1RevenueShare: 0.25,
  moderateTop3RevenueShare: 0.6,
  // Public signal lists are intentionally capped for AI prompt and UI scanability.
  maxScalingOpportunities: 5,
  maxTransferCandidates: 5,
  // Correlation signals need enough observations to avoid reporting coincidence.
  minCampaignsForCorrelations: 3,
}

export const DEFAULT_ANALYSIS_SIGNAL_THRESHOLDS: AnalysisSignalThresholds = {
  channelStatus: DEFAULT_CHANNEL_STATUS_THRESHOLDS,
  channelSignals: DEFAULT_CHANNEL_SIGNAL_THRESHOLDS,
  campaignSignals: DEFAULT_CAMPAIGN_SIGNAL_THRESHOLDS,
  portfolioSignals: DEFAULT_PORTFOLIO_SIGNAL_THRESHOLDS,
}

export const SIGNAL_REASONS = {
  campaign: {
    scalingOpportunity: 'Strong efficiency with revenue share exceeding budget share.',
    budgetScalingCandidate: 'Revenue share exceeds budget share with strong efficiency.',
    inefficient: 'Budget share exceeds revenue share with weaker efficiency than portfolio.',
  },
  channel: {
    scalingOpportunity: 'Channel outperforms its budget allocation.',
    inefficient: 'Budget share exceeds revenue share with weaker efficiency.',
  },
  portfolio: {
    concentrationUnavailable:
      'Concentration is not evaluated for datasets with fewer than 3 campaigns.',
    highConcentration: 'Revenue is highly concentrated in a small number of campaigns.',
    moderateConcentration:
      'Revenue is moderately concentrated in a limited number of campaigns.',
    lowConcentration: 'Revenue is reasonably distributed across campaigns.',
    transferCandidate: (sourceCampaign: string, targetCampaign: string) =>
      `Shift from ${sourceCampaign} (inefficient) to ${targetCampaign} (strong efficiency).`,
  },
} as const
