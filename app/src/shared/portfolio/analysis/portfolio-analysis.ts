import type { CampaignPerformance, Channel } from '@/shared/data';
import { computedMedianOrNull, roundTo } from '@/shared/utils';

import type {
  AnalysisClassificationThresholds,
  AnalysisSignalThresholds,
  CampaignSummary,
  ChannelContext,
  ChannelSummary,
  ConcentrationFlagSignal,
  DerivedSignals,
  PortfolioAnalysis,
  PortfolioSummary,
} from '../types';
import {
  classifyCampaigns,
  classifyChannels,
  DEFAULT_ANALYSIS_CLASSIFICATION_THRESHOLDS,
} from './classification';
import { computePortfolioKPIs } from './metrics';
import {
  DEFAULT_ANALYSIS_SIGNAL_THRESHOLDS,
  getBudgetScalingCandidates,
  getConcentrationFlag,
  getCorrelations,
  getInefficientCampaigns,
  getInefficientChannels,
  getScalingOpportunities,
  getTransferCandidates,
  toCampaignSummary,
  toChannelSummary,
} from './signals';

const DEFAULT_EMPTY_ANALYSIS_STATE = {
  channels: [],
  channelContext: { topByBudget: [], topByRevenue: [] },
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
};

const CHANNEL_CONTEXT_LIMIT = 5;

function getCampaignRoiBaselines(
  campaignSummaries: CampaignSummary[],
): Pick<PortfolioSummary, 'averageCampaignRoi' | 'medianCampaignRoi'> {
  const campaignRois = campaignSummaries
    .map((campaign) => campaign.roi)
    .filter((roi): roi is number => roi !== null && Number.isFinite(roi));

  if (campaignRois.length === 0) {
    return {
      averageCampaignRoi: null,
      medianCampaignRoi: null,
    };
  }

  const totalRoi = campaignRois.reduce((total, roi) => total + roi, 0);

  return {
    averageCampaignRoi: roundTo(totalRoi / campaignRois.length, 4),
    medianCampaignRoi: computedMedianOrNull(campaignRois),
  };
}

function getChannelContext(channelSummaries: ChannelSummary[]): ChannelContext {
  return {
    topByBudget: [...channelSummaries]
      .sort((a, b) => b.budget - a.budget)
      .slice(0, CHANNEL_CONTEXT_LIMIT),
    topByRevenue: [...channelSummaries]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, CHANNEL_CONTEXT_LIMIT),
  };
}

function getClassificationGroups(
  campaignSummaries: CampaignSummary[],
  channelSummaries: ChannelSummary[],
  aggregatedRoi: number | null,
  classificationThresholds: AnalysisClassificationThresholds,
): Pick<PortfolioAnalysis, 'campaignGroups' | 'channelGroups'> {
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
  };
}

function getDerivedSignals(
  campaignSummaries: CampaignSummary[],
  channelSummaries: ChannelSummary[],
  aggregatedRoi: number | null,
  thresholds: AnalysisSignalThresholds,
  classificationThresholds: AnalysisClassificationThresholds,
): DerivedSignals {
  const inefficientCampaigns = getInefficientCampaigns(
    campaignSummaries,
    aggregatedRoi,
    thresholds.campaignSignals,
  );
  const budgetScalingCandidates = getBudgetScalingCandidates(
    campaignSummaries,
    aggregatedRoi,
    thresholds.campaignSignals,
  );

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
    concentrationFlag: getConcentrationFlag(campaignSummaries, thresholds.portfolioSignals),
    correlations: getCorrelations(campaignSummaries, thresholds.portfolioSignals),
  };
}

export function computePortfolioAnalysis(
  selectedChannels: Channel[],
  thresholds: AnalysisSignalThresholds = DEFAULT_ANALYSIS_SIGNAL_THRESHOLDS,
  classificationThresholds: AnalysisClassificationThresholds = DEFAULT_ANALYSIS_CLASSIFICATION_THRESHOLDS,
): PortfolioAnalysis {
  const filteredCampaigns: CampaignPerformance[] = selectedChannels.flatMap(
    (channel) => channel.campaigns,
  );

  const kpis = computePortfolioKPIs(selectedChannels);

  const portfolio: PortfolioSummary = {
    ...kpis,
    campaignCount: filteredCampaigns.length,
    channelCount: selectedChannels.length,
    averageCampaignRoi: null,
    medianCampaignRoi: null,
  };

  if (filteredCampaigns.length === 0) {
    return {
      portfolio,
      ...DEFAULT_EMPTY_ANALYSIS_STATE,
    };
  }

  const { totalBudget, totalRevenue, aggregatedRoi } = kpis;

  const campaignSummaries = filteredCampaigns.map((campaign) =>
    toCampaignSummary(campaign, totalBudget, totalRevenue),
  );

  // Campaign-level ROI baselines require per-campaign summaries, so they are populated after summary mapping.
  const { averageCampaignRoi, medianCampaignRoi } = getCampaignRoiBaselines(campaignSummaries);
  portfolio.averageCampaignRoi = averageCampaignRoi;
  portfolio.medianCampaignRoi = medianCampaignRoi;

  const channelSummaries = selectedChannels.map((channel) =>
    toChannelSummary(channel, totalBudget, totalRevenue, aggregatedRoi, thresholds.channelStatus),
  );

  const channelContext = getChannelContext(channelSummaries);

  const { campaignGroups, channelGroups } = getClassificationGroups(
    campaignSummaries,
    channelSummaries,
    aggregatedRoi,
    classificationThresholds,
  );

  const derivedSignals = getDerivedSignals(
    campaignSummaries,
    channelSummaries,
    aggregatedRoi,
    thresholds,
    classificationThresholds,
  );

  return {
    portfolio,
    channels: channelSummaries,
    channelContext,
    campaignGroups,
    channelGroups,
    derivedSignals,
  };
}
