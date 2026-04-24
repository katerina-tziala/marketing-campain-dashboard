import type { CampaignPerformance, PortfolioKPIs, PortfolioScope, PortfolioSummary } from '../types/campaign'
import type { Channel } from '../types/channel'
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

export function computePortfolioAnalysis(
  campaigns: CampaignPerformance[],
  channels: Channel[],
  kpis: PortfolioKPIs,
  scope: PortfolioScope,
  filteredChannels: boolean,
): PortfolioAnalysis {
  const portfolio: PortfolioSummary = {
    ...kpis,
    campaignCount: scope.selectedCampaigns.length,
    channelCount: scope.selectedChannels.length,
  }

  const emptyGroups = {
    campaignGroups: { top: [], opportunity: [], bottom: [], watch: [] },
    channelGroups: { strong: [], opportunity: [], weak: [], watch: [] },
  }

  if (campaigns.length === 0) {
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

  const campaignSummaries = campaigns.map(c =>
    toCampaignSummary(c, totalBudget, totalRevenue),
  )

  const channelSummaries = channels.map(ch =>
    toChannelSummary(ch, totalBudget, totalRevenue, aggregatedROI),
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
