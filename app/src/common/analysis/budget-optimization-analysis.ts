import type { CampaignPerformance, CampaignSummary, ChannelSummary, PortfolioKPIs, PortfolioScope, PortfolioSummary, SummaryMetricStatus } from "../types/campaign";
import type { Channel } from "../types/channel";
import { computeShareEfficiency } from "../utils/campaign-performance";
import type {
  BudgetOptimizerAnalysis,
  BudgetScalingCandidate,
  InefficientCampaignSignal,
  TransferCandidate,
} from "./budget-optimization-analysis.types";

const GAP_THRESHOLD = 0.05;
const MIN_BUDGET_SHARE = 0.02;
const MAX_REDUCIBLE_FRACTION = 0.5;
const MAX_ADDITIONAL_FRACTION = 2.0;
const BASE_ROI_RETENTION = 0.85;
const MIN_SHIFT_FRACTION = 0.1; // 10% of maxReducibleBudget = 5% of campaign budget
const MIN_SHIFT_FLOOR = 50;

function toFinite(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

// ── Derived signal computation ────────────────────────────────────────────────

export function getInefficientCampaigns(
  campaigns: CampaignSummary[],
  portfolioRoi: number | null,
): InefficientCampaignSignal[] {
  return campaigns
    .filter(c =>
      c.budget > 0 &&
      c.budgetShare >= MIN_BUDGET_SHARE &&
      c.efficiencyGap > GAP_THRESHOLD &&
      (portfolioRoi === null || toFinite(c.roi) < portfolioRoi),
    )
    .map(c => ({
      campaign: c.campaign,
      channel: c.channel,
      roi: c.roi,
      budgetShare: c.budgetShare,
      revenueShare: c.revenueShare,
      efficiencyGap: c.efficiencyGap,
      maxReducibleBudget: c.budget * MAX_REDUCIBLE_FRACTION,
      reason: "Budget share exceeds revenue share with weaker efficiency than portfolio.",
    }))
    .sort((a, b) => b.efficiencyGap - a.efficiencyGap);
}

export function getBudgetScalingCandidates(
  campaigns: CampaignSummary[],
  portfolioRoi: number | null,
): BudgetScalingCandidate[] {
  return campaigns
    .filter(c =>
      c.budget > 0 &&
      c.roi !== null &&
      (portfolioRoi === null || c.roi > portfolioRoi) &&
      c.revenueShare > c.budgetShare,
    )
    .map(c => ({
      campaign: c.campaign,
      channel: c.channel,
      roi: c.roi!,
      budgetShare: c.budgetShare,
      revenueShare: c.revenueShare,
      efficiencyGap: c.efficiencyGap,
      maxAdditionalBudget: c.budget * MAX_ADDITIONAL_FRACTION,
      expectedRoiRetention: BASE_ROI_RETENTION,
      reason: "Revenue share exceeds budget share with strong efficiency.",
    }))
    .sort((a, b) => b.roi - a.roi);
}

export function getTransferCandidates(
  inefficient: InefficientCampaignSignal[],
  scaling: BudgetScalingCandidate[],
): TransferCandidate[] {
  const candidates: TransferCandidate[] = [];

  for (const source of inefficient) {
    for (const target of scaling) {
      if (source.campaign === target.campaign) continue;

      const minShift = Math.max(MIN_SHIFT_FLOOR, source.maxReducibleBudget * MIN_SHIFT_FRACTION);
      const maxShift = Math.min(source.maxReducibleBudget, target.maxAdditionalBudget);

      if (maxShift <= minShift) continue;

      candidates.push({
        fromCampaign: source.campaign,
        toCampaign: target.campaign,
        minShift: Math.round(minShift),
        maxShift: Math.round(maxShift),
        expectedRoiRetention: target.expectedRoiRetention,
        reason: `Shift from ${source.campaign} (inefficient) to ${target.campaign} (strong efficiency).`,
      });
    }
  }

  return candidates
    .sort((a, b) => b.maxShift - a.maxShift)
    .slice(0, 5);
}

// ── Summary assembly ──────────────────────────────────────────────────────────

function computeChannelStatus(
  channelRoi: number | null,
  portfolioRoi: number | null,
): SummaryMetricStatus {
  if (channelRoi === null || portfolioRoi === null) return "Moderate";
  if (channelRoi > portfolioRoi * 1.1) return "Strong";
  if (channelRoi < portfolioRoi * 0.9) return "Weak";
  return "Moderate";
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

export function computeBudgetOptimizerAnalysis(
  campaigns: CampaignPerformance[],
  channels: Channel[],
  kpis: PortfolioKPIs,
  scope: PortfolioScope,
): BudgetOptimizerAnalysis {
  const portfolio: PortfolioSummary = {
    ...kpis,
    campaignCount: scope.selectedCampaigns.length,
    channelCount: scope.selectedChannels.length,
  };

  if (campaigns.length === 0) {
    return {
      portfolio,
      campaigns: [],
      channels: [],
      derivedSignals: {
        inefficientCampaigns: [],
        scalingCandidates: [],
        transferCandidates: [],
      },
    };
  }

  const { totalBudget, totalRevenue, aggregatedROI } = kpis;

  const campaignSummaries = campaigns.map(c =>
    toCampaignSummary(c, totalBudget, totalRevenue),
  );

  const channelSummaries = channels.map(ch =>
    toChannelSummary(ch, totalBudget, totalRevenue, aggregatedROI),
  );

  const inefficientCampaigns = getInefficientCampaigns(campaignSummaries, aggregatedROI);
  const scalingCandidates = getBudgetScalingCandidates(campaignSummaries, aggregatedROI);
  const transferCandidates = getTransferCandidates(inefficientCampaigns, scalingCandidates);

  return {
    portfolio,
    campaigns: campaignSummaries,
    channels: channelSummaries,
    derivedSignals: {
      inefficientCampaigns,
      scalingCandidates,
      transferCandidates,
    },
  };
}
