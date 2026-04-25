import type { CampaignPerformance, PortfolioScope } from '@/shared/types/campaign'
import type { PortfolioSummary } from './types'
import type { Channel } from '@/shared/types/channel'
import type { PortfolioAnalysis } from './types'
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
} from './utils'
import { classifyCampaigns } from './classify-campaigns'
import { classifyChannels } from './classify-channels'
import { computePortfolioKPIs } from '@/shared/utils/campaign-performance'

export function computePortfolioAnalysis(
  selectedChannels: Channel[],
  selectedChannelsIds: string[],
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
          reason: 'No data provided.',
        },
        correlations: [],
      },
    }
  }

  const { totalBudget, totalRevenue, aggregatedROI } = kpis

  const campaignSummaries = filteredCampaigns.map((campaign) =>
    toCampaignSummary(campaign, totalBudget, totalRevenue),
  )

  const channelSummaries = selectedChannels.map((channel) =>
    toChannelSummary(channel, totalBudget, totalRevenue, aggregatedROI),
  )

  const campaignGroups = classifyCampaigns(campaignSummaries, aggregatedROI)
  const channelGroups = classifyChannels(channelSummaries, aggregatedROI)

  const inefficientCampaigns = getInefficientCampaigns(campaignSummaries, aggregatedROI)
  const budgetScalingCandidates = getBudgetScalingCandidates(campaignSummaries, aggregatedROI)

  return {
    portfolio,
    scope,
    filteredChannels,
    channels: channelSummaries,
    campaignGroups,
    channelGroups,
    derivedSignals: {
      inefficientChannels: getInefficientChannels(channelSummaries, aggregatedROI),
      inefficientCampaigns,
      scalingOpportunities: getScalingOpportunities(campaignSummaries, channelSummaries, aggregatedROI),
      budgetScalingCandidates,
      transferCandidates: getTransferCandidates(inefficientCampaigns, budgetScalingCandidates),
      concentrationFlag: getConcentrationFlag(campaignSummaries),
      correlations: getCorrelations(campaignSummaries),
    },
  }
}
