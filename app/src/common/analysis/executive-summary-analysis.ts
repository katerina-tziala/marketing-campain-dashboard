import type { CampaignPerformance, PortfolioKPIs, PortfolioScope } from "../types/campaign";
import type { Channel } from "../types/channel";
import { computeShareEfficiency } from "../utils/campaign-performance";
import type {
  CampaignSummary,
  ChannelSummary,
  ConcentrationFlagSignal,
  CorrelationSignal,
  InefficientChannelSignal,
  PortfolioSummary,
  ScalingCandidateSignal,
  SummaryAnalysis,
  SummaryMetricStatus,
} from "./executive-summary-analysis.types";

const MIN_BUDGET_SHARE = 0.01; // 1% of portfolio budget — filters micro-campaigns from bottom list
const GAP_THRESHOLD = 0.05;   // 5% efficiency gap (decimal)

interface DynamicThresholds {
  minRevenue: number;
  minConversions: number;
}

function getDynamicThresholds(campaigns: CampaignSummary[]): DynamicThresholds {
  const totalRevenue = campaigns.reduce((sum, campaign) => sum + campaign.revenue, 0);
  const totalConversions = campaigns.reduce((sum, campaign) => sum + campaign.conversions, 0);
  return {
    minRevenue: Math.max(totalRevenue * 0.02, 50),
    minConversions: Math.max(totalConversions * 0.02, 2),
  };
}

// Coerces null/undefined/non-finite numbers to 0 — used only for nullable metric fields (roi, ctr, cvr, cac)
function toFinite(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

// these 2 functions cannot return same campaign because of the different filtering criteria,
//  but we want to minimize overlap between the two lists to create clearer narrative for the AI and end user
export function getTopCampaigns(
  campaigns: CampaignSummary[],
): CampaignSummary[] {
  if (campaigns.length <= 2) return [];

  const { minRevenue, minConversions } = getDynamicThresholds(campaigns);

  return [...campaigns]
    .filter(
      campaign =>
        campaign.budget > 0 &&
        campaign.revenue >= minRevenue &&
        campaign.conversions >= minConversions &&
        campaign.roi !== null,
    )
    .sort((a, b) => {
      const roiDiff = b.roi! - a.roi!;
      if (roiDiff !== 0) return roiDiff;
      return b.revenue - a.revenue;
    })
    .slice(0, 5);
}

export function getBottomCampaigns(
  campaigns: CampaignSummary[],
  excludedNames?: Set<string>,
): CampaignSummary[] {
  if (campaigns.length <= 2) return [];

  return [...campaigns]
    .filter(
      campaign =>
        campaign.budget > 0 &&
        campaign.budgetShare >= MIN_BUDGET_SHARE &&
        !excludedNames?.has(campaign.campaign),
    )
    .sort((a, b) => {
      const gapDiff = b.efficiencyGap - a.efficiencyGap;
      if (gapDiff !== 0) return gapDiff;
      return toFinite(a.roi) - toFinite(b.roi);
    })
    .slice(0, 5);
}

function isInefficientChannel(channel: ChannelSummary, portfolioRoi: number | null): boolean {
  return (
    channel.efficiencyGap > GAP_THRESHOLD &&
    (portfolioRoi === null || toFinite(channel.roi) < portfolioRoi)
  );
}

export function getInefficientChannels(
  channels: ChannelSummary[],
  portfolioRoi: number | null,
): InefficientChannelSignal[] {
  return channels
    .filter(channel => isInefficientChannel(channel, portfolioRoi))
    .map(channel => ({
      channel: channel.channel,
      budgetShare: channel.budgetShare,
      revenueShare: channel.revenueShare,
      efficiencyGap: channel.efficiencyGap,
      roi: toFinite(channel.roi),
      reason: "Budget share exceeds revenue share with weaker efficiency.",
    }))
    .sort((a, b) => b.efficiencyGap - a.efficiencyGap);
}

function hasCampaignScalingData(campaign: CampaignSummary, { minRevenue, minConversions }: DynamicThresholds): boolean {
  return (
    campaign.roi !== null &&
    campaign.budget > 0 &&
    campaign.revenue >= minRevenue &&
    campaign.conversions >= minConversions
  );
}

function campaignOutperformsPortfolio(campaign: CampaignSummary, portfolioRoi: number | null): boolean {
  return (
    (portfolioRoi === null || campaign.roi! > portfolioRoi) &&
    campaign.revenueShare > campaign.budgetShare
  );
}

function isChannelScalingCandidate(channel: ChannelSummary, portfolioRoi: number | null): boolean {
  return (
    channel.roi !== null &&
    (portfolioRoi === null || channel.roi > portfolioRoi) &&
    channel.revenueShare > channel.budgetShare
  );
}

function toCampaignScalingSignals(
  campaigns: CampaignSummary[],
  portfolioRoi: number | null,
): ScalingCandidateSignal[] {
  const thresholds = getDynamicThresholds(campaigns);
  return campaigns
    .filter(campaign => hasCampaignScalingData(campaign, thresholds) && campaignOutperformsPortfolio(campaign, portfolioRoi))
    .map(campaign => ({
      name: campaign.campaign,
      type: "campaign" as const,
      channel: campaign.channel,
      roi: campaign.roi!,
      budgetShare: campaign.budgetShare,
      revenueShare: campaign.revenueShare,
      reason: "Strong efficiency with revenue share exceeding budget share.",
    }));
}

function toChannelScalingSignals(
  channels: ChannelSummary[],
  portfolioRoi: number | null,
): ScalingCandidateSignal[] {
  return channels
    .filter(channel => isChannelScalingCandidate(channel, portfolioRoi))
    .map(channel => ({
      name: channel.channel,
      type: "channel" as const,
      roi: channel.roi!,
      budgetShare: channel.budgetShare,
      revenueShare: channel.revenueShare,
      reason: "Channel outperforms its budget allocation.",
    }));
}

export function getScalingCandidates(
  campaigns: CampaignSummary[],
  channels: ChannelSummary[],
  portfolioRoi: number | null,
): ScalingCandidateSignal[] {
  return [
    ...toCampaignScalingSignals(campaigns, portfolioRoi),
    ...toChannelScalingSignals(channels, portfolioRoi),
  ]
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 5);
}

export function getConcentrationFlag(
  campaigns: CampaignSummary[],
): ConcentrationFlagSignal {
  if (campaigns.length < 3) {
    return {
      flagged: false,
      level: "Low",
      top1RevenueShare: campaigns.length === 1 ? 1 : 0,
      top3RevenueShare: campaigns.length > 0 ? 1 : 0,
      reason: "Concentration is not evaluated for datasets with fewer than 3 campaigns.",
    };
  }

  const sorted = [...campaigns].sort((a, b) => b.revenue - a.revenue);

  const top1RevenueShare = sorted[0]?.revenueShare ?? 0;
  const top3RevenueShare = sorted
    .slice(0, 3)
    .reduce((sum, campaign) => sum + campaign.revenueShare, 0);

  if (top1RevenueShare > 0.4 || top3RevenueShare > 0.75) {
    return {
      flagged: true,
      level: "High",
      top1RevenueShare,
      top3RevenueShare,
      reason: "Revenue is highly concentrated in a small number of campaigns.",
    };
  }

  if (top1RevenueShare > 0.25 || top3RevenueShare > 0.6) {
    return {
      flagged: true,
      level: "Moderate",
      top1RevenueShare,
      top3RevenueShare,
      reason: "Revenue is moderately concentrated in a limited number of campaigns.",
    };
  }

  return {
    flagged: false,
    level: "Low",
    top1RevenueShare,
    top3RevenueShare,
    reason: "Revenue is reasonably distributed across campaigns.",
  };
}

export function getCorrelations(
  campaigns: CampaignSummary[],
): CorrelationSignal[] {
  if (campaigns.length < 3) return [];
  return [];
}

export function getExecutiveSummaryDerivedInputs(params: {
  campaigns: CampaignSummary[];
  channels: ChannelSummary[];
  portfolioRoi: number | null;
}) {
  const { campaigns, channels, portfolioRoi } = params;

  const topCampaigns = getTopCampaigns(campaigns);
  const topCampaignNames = new Set(topCampaigns.map(campaign => campaign.campaign));

  return {
    topCampaigns,
    bottomCampaigns: getBottomCampaigns(campaigns, topCampaignNames),
    derivedSignals: {
      inefficientChannels: getInefficientChannels(channels, portfolioRoi),
      scalingCandidates: getScalingCandidates(campaigns, channels, portfolioRoi),
      concentrationFlag: getConcentrationFlag(campaigns),
      correlations: getCorrelations(campaigns),
    },
  };
}

// ── Summary assembly ──────────────────────────────────────────────────────────

function computeChannelStatus(
  channelRoi: number | null,
  portfolioRoi: number | null,
): SummaryMetricStatus {
  if (channelRoi === null || portfolioRoi === null) return 'Moderate';
  if (channelRoi > portfolioRoi * 1.1) return 'Strong';
  if (channelRoi < portfolioRoi * 0.9) return 'Weak';
  return 'Moderate';
}

function toCampaignSummary(
  campaign: CampaignPerformance,
  totalBudget: number,
  totalRevenue: number,
): CampaignSummary {
  return {
    ...campaign,
    ...computeShareEfficiency(campaign, totalBudget, totalRevenue),
  };
}

function toChannelSummary(
  channel: Channel,
  totalBudget: number,
  totalRevenue: number,
  portfolioRoi: number | null,
): ChannelSummary {
  const { campaigns, id, name, ...metrics } = channel;

  return {
    channel: name,
    ...metrics,
    ...computeShareEfficiency(channel, totalBudget, totalRevenue),
    status: computeChannelStatus(channel.roi, portfolioRoi),
  };
}

export function computeSummaryAnalysis(
  campaigns: CampaignPerformance[],
  channels: Channel[],
  kpis: PortfolioKPIs,
  scope: PortfolioScope,
): SummaryAnalysis {
  const portfolio: PortfolioSummary = {
    ...kpis,
    campaignCount: scope.selectedCampaigns.length,
    channelCount: scope.selectedChannels.length,
  };

  if (campaigns.length === 0) {
    return {
      portfolio,
      channels: [],
      topCampaigns: [],
      bottomCampaigns: [],
      derivedSignals: {
        inefficientChannels: [],
        scalingCandidates: [],
        concentrationFlag: {
          flagged: false,
          level: 'Low',
          top1RevenueShare: 0,
          top3RevenueShare: 0,
          reason: 'No data provided.',
        },
        correlations: [],
      },
    };
  }

  const { totalBudget, totalRevenue, aggregatedROI } = kpis;

  const campaignSummaries = campaigns.map(
    (campaign) => toCampaignSummary(campaign, totalBudget, totalRevenue),
  );

  const channelSummaries = channels.map(
    (channel) => toChannelSummary(channel, totalBudget, totalRevenue, aggregatedROI),
  );

  const { topCampaigns, bottomCampaigns, derivedSignals } =
    getExecutiveSummaryDerivedInputs({
      campaigns: campaignSummaries,
      channels: channelSummaries,
      portfolioRoi: aggregatedROI,
    });

  return {
    portfolio,
    channels: channelSummaries,
    topCampaigns,
    bottomCampaigns,
    derivedSignals,
  };
}
