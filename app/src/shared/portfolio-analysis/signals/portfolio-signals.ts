import type {
  CampaignClassificationThresholds,
  CampaignSummary,
  ChannelSignalThresholds,
  ChannelSummary,
  CorrelationSignal,
  PortfolioSignalThresholds,
  ScalingCandidateSignal,
} from '../types'
import { rankByRoiDesc } from '../ranking'
import { toCampaignScalingSignals } from './campaign-signals'
import { toChannelScalingSignals } from './channel-signals'
import { DEFAULT_CAMPAIGN_CLASSIFICATION_THRESHOLDS } from '../classification/constants'
import {
  DEFAULT_CHANNEL_SIGNAL_THRESHOLDS,
  DEFAULT_PORTFOLIO_SIGNAL_THRESHOLDS,
} from './constants'

export function getScalingOpportunities(
  campaigns: CampaignSummary[],
  channels: ChannelSummary[],
  portfolioRoi: number | null,
  thresholds: PortfolioSignalThresholds = DEFAULT_PORTFOLIO_SIGNAL_THRESHOLDS,
  campaignClassificationThresholds: CampaignClassificationThresholds = DEFAULT_CAMPAIGN_CLASSIFICATION_THRESHOLDS,
  channelSignalThresholds: ChannelSignalThresholds = DEFAULT_CHANNEL_SIGNAL_THRESHOLDS,
): ScalingCandidateSignal[] {
  const scalingOpportunities = [
    ...toCampaignScalingSignals(campaigns, portfolioRoi, campaignClassificationThresholds),
    ...toChannelScalingSignals(channels, portfolioRoi, channelSignalThresholds),
  ]

  return rankByRoiDesc(scalingOpportunities).slice(0, thresholds.maxScalingOpportunities)
}

export function getCorrelations(
  campaigns: CampaignSummary[],
  thresholds: PortfolioSignalThresholds = DEFAULT_PORTFOLIO_SIGNAL_THRESHOLDS,
): CorrelationSignal[] {
  if (campaigns.length < thresholds.minCampaignsForCorrelations) return []
  return []
}
