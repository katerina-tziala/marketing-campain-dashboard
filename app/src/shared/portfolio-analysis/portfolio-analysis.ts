import type { CampaignPerformance, Channel, PortfolioScope } from '../types'
import type { PortfolioSummary, CampaignSummary, ChannelSummary } from './types'
import type {
  AnalysisClassificationThresholds,
  AnalysisSignalThresholds,
  PortfolioAnalysis,
} from './types'
import type { ConcentrationFlagSignal } from './types/signals'
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

const DEFAULT_EMPTY_ANALYSIS_STATE = {
  channels: [],
  campaignGroups: { top: [], opportunity: [], bottom: [], watch: [] },
  channelGroups: { strong: [], opportunity: [], weak: [], watch: [] },
  derivedSignals: {
    inefficientChannels: [],
    inefficientCampaigns: [],
    scalingOpportunities: [],
    budgetScalingCandidates: [],
    transferCandidates: [],
    concentrationFlag: {
      flagged: false,
      level: 'Low' as ConcentrationFlagSignal['level'],
      top1RevenueShare: 0,
      top3RevenueShare: 0,
      reason: 'No data provided',
    },
    correlations: [],
  },
}

export function getPortfolioScope(
  allCampaigns: CampaignPerformance[],
  selectedCampaigns: CampaignPerformance[],
  allChannelNames: string[],
  selectedChannelNames: string[],
): PortfolioScope {
  return {
    campaigns: allCampaigns.map((campaign) => campaign.campaign),
    channels: allChannelNames,
    selectedCampaigns: selectedCampaigns.map((campaign) => campaign.campaign),
    selectedChannels: selectedChannelNames,
  }
}

function getClassificationGroups(
  campaignSummaries: CampaignSummary[],
  channelSummaries: ChannelSummary[],
  aggregatedRoi: number | null,
  classificationThresholds: AnalysisClassificationThresholds,
) {
  return {
    campaignGroups: classifyCampaigns(
      campaignSummaries,
      aggregatedRoi,
      classificationThresholds.campaigns,
    ),
    channelGroups: classifyChannels(
      channelSummaries,
      aggregatedRoi,
      classificationThresholds.channels,
    ),
  }
}

function getDerivedSignals(
  campaignSummaries: CampaignSummary[],
  channelSummaries: ChannelSummary[],
  aggregatedRoi: number | null,
  thresholds: AnalysisSignalThresholds,
  classificationThresholds: AnalysisClassificationThresholds,
) {
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
  }
}

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

  const scope: PortfolioScope = getPortfolioScope(
    filteredCampaigns,
    filteredCampaigns,
    selectedChannels.map((channel) => channel.name),
    selectedChannels.map((channel) => channel.name),
  )

  const portfolio: PortfolioSummary = {
    ...kpis,
    campaignCount: filteredCampaigns.length,
    channelCount: selectedChannels.length,
  }

  const filteredChannels = selectedChannelsIds.length > 0

  if (filteredCampaigns.length === 0) {
    return {
      portfolio,
      scope,
      filteredChannels,
      ...DEFAULT_EMPTY_ANALYSIS_STATE,
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

  const { campaignGroups, channelGroups } = getClassificationGroups(
    campaignSummaries,
    channelSummaries,
    aggregatedRoi,
    classificationThresholds,
  )

  const derivedSignals = getDerivedSignals(
    campaignSummaries,
    channelSummaries,
    aggregatedRoi,
    thresholds,
    classificationThresholds,
  )

  return {
    portfolio,
    scope,
    filteredChannels,
    channels: channelSummaries,
    campaignGroups,
    channelGroups,
    derivedSignals,
  }
}
