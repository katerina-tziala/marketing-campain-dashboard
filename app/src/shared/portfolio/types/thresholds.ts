export interface ChannelStatusThresholds {
  strongStatusRoiFactor: number;
  weakStatusRoiFactor: number;
}

export interface ChannelSignalThresholds {
  gapThreshold: number;
  scalingGapThreshold: number;
  minBudgetShareSignal: number;
  minRevenueShareSignal: number;
}

export interface CampaignSignalThresholds {
  gapThreshold: number;
  minBudgetShareSignal: number;
  maxReducibleFraction: number;
  maxAdditionalFraction: number;
  baseRoiRetention: number;
}

export interface PortfolioSignalThresholds {
  minShiftFraction: number;
  minShiftFloor: number;
  minCampaignsForConcentration: number;
  topRevenueCampaignCount: number;
  highTop1RevenueShare: number;
  highTop3RevenueShare: number;
  moderateTop1RevenueShare: number;
  moderateTop3RevenueShare: number;
  maxScalingOpportunities: number;
  maxTransferCandidates: number;
  minCampaignsForCorrelations: number;
}

export interface AnalysisSignalThresholds {
  channelStatus: ChannelStatusThresholds;
  channelSignals: ChannelSignalThresholds;
  campaignSignals: CampaignSignalThresholds;
  portfolioSignals: PortfolioSignalThresholds;
}

export interface BaseClassificationThresholds {
  topRoiFactor: number;
  watchCtrFactor: number;
  watchCvrFactor: number;
  watchRoiFactor: number;
  gapThreshold: number;
}

export interface CampaignClassificationThresholds extends BaseClassificationThresholds {
  minBudgetShare: number;
  minRevenueShare: number;
  minRevenueFloor: number;
  minConversionShare: number;
  minConversionFloor: number;
}

export type ChannelClassificationThresholds = BaseClassificationThresholds;

export interface AnalysisClassificationThresholds {
  campaigns: CampaignClassificationThresholds;
  channels: ChannelClassificationThresholds;
}

export interface DynamicClassificationThresholds {
  minRevenue: number;
  minConversions: number;
}

export interface FunnelLeakThresholds {
  watchCtrFactor: number;
  watchCvrFactor: number;
}

export interface UnderperformingRoiThresholds {
  watchRoiFactor: number;
}
