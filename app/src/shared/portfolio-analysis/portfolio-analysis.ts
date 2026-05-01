import type { CampaignPerformance, Channel, PortfolioScope } from '../types'
import type { PortfolioSummary } from './types'
import type {
  AnalysisClassificationThresholds,
  AnalysisSignalThresholds,
  PortfolioAnalysis,
} from './types'
import {
  toCampaignSummary,
  toChannelSummary,
  getInefficientChannels,
  getInefficientCampaigns,
  getScalingOpportunities,
  getBudgetScalingCandidates,
  getTransferCandidates,
  getConcentrationFlag,
  getCorrelations,
  DEFAULT_ANALYSIS_SIGNAL_THRESHOLDS,
} from './signals'
import {
  classifyCampaigns,
  classifyChannels,
  DEFAULT_ANALYSIS_CLASSIFICATION_THRESHOLDS,
} from './classification'
import { computePortfolioKPIs } from './metrics'

export function computePortfolioAnalysis(
  selectedChannels: Channel[],
  selectedChannelsIds: string[],
  thresholds: AnalysisSignalThresholds = DEFAULT_ANALYSIS_SIGNAL_THRESHOLDS,
  classificationThresholds: AnalysisClassificationThresholds = DEFAULT_ANALYSIS_CLASSIFICATION_THRESHOLDS,
): PortfolioAnalysis {
  const filteredCampaigns: CampaignPerformance[] = selectedChannels.flatMap(
    (channel) => channel.campaigns,
  )

  const kpis = computePortfolioKPIs(selectedChannels)

  const scope: PortfolioScope = {
    campaigns: filteredCampaigns.map((campaign) => campaign.campaign),
    channels: selectedChannels.map((channel) => channel.name),
    selectedCampaigns: filteredCampaigns.map((campaign) => campaign.campaign),
    selectedChannels: selectedChannels.map((channel) => channel.name),
  }

  const portfolio: PortfolioSummary = {
    ...kpis,
    campaignCount: filteredCampaigns.length,
    channelCount: selectedChannels.length,
  }

  const filteredChannels = selectedChannelsIds.length > 0

  const emptyGroups = {
    campaignGroups: { top: [], opportunity: [], bottom: [], watch: [] },
    channelGroups: { strong: [], opportunity: [], weak: [], watch: [] },
  }

  if (filteredCampaigns.length === 0) {
    return {
      portfolio,
      scope,
      filteredChannels,
      channels: [],
      ...emptyGroups,
      derivedSignals: {
        inefficientChannels: [],
        inefficientCampaigns: [],
        scalingOpportunities: [],
        budgetScalingCandidates: [],
        transferCandidates: [],
        concentrationFlag: {
          flagged: false,
          level: 'Low',
          top1RevenueShare: 0,
          top3RevenueShare: 0,
          reason: 'No data provided',
        },
        correlations: [],
      },
    }
  }

  const { totalBudget, totalRevenue, aggregatedRoi } = kpis

  const campaignSummaries = filteredCampaigns.map((campaign) =>
    toCampaignSummary(campaign, totalBudget, totalRevenue),
  )

  const channelSummaries = selectedChannels.map((channel) =>
    toChannelSummary(
      channel,
      totalBudget,
      totalRevenue,
      aggregatedRoi,
      thresholds.channelStatus,
    ),
  )

  const campaignGroups = classifyCampaigns(
    campaignSummaries,
    aggregatedRoi,
    classificationThresholds.campaigns,
  )
  const channelGroups = classifyChannels(
    channelSummaries,
    aggregatedRoi,
    classificationThresholds.channels,
  )

  const inefficientCampaigns = getInefficientCampaigns(
    campaignSummaries,
    aggregatedRoi,
    thresholds.campaignSignals,
  )
  const budgetScalingCandidates = getBudgetScalingCandidates(
    campaignSummaries,
    aggregatedRoi,
    thresholds.campaignSignals,
  )

  return {
    portfolio,
    scope,
    filteredChannels,
    channels: channelSummaries,
    campaignGroups,
    channelGroups,
    derivedSignals: {
      inefficientChannels: getInefficientChannels(
        channelSummaries,
        aggregatedRoi,
        thresholds.channelSignals,
      ),
      inefficientCampaigns,
      scalingOpportunities: getScalingOpportunities(
        campaignSummaries,
        channelSummaries,
        aggregatedRoi,
        thresholds.portfolioSignals,
        classificationThresholds.campaigns,
        thresholds.channelSignals,
      ),
      budgetScalingCandidates,
      transferCandidates: getTransferCandidates(
        inefficientCampaigns,
        budgetScalingCandidates,
        thresholds.portfolioSignals,
      ),
      concentrationFlag: getConcentrationFlag(
        campaignSummaries,
        thresholds.portfolioSignals,
      ),
      correlations: getCorrelations(campaignSummaries, thresholds.portfolioSignals),
    },
  }
}
