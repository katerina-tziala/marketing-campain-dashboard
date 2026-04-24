import type { CampaignSummary, ChannelSummary, ConcentrationFlagSignal, CorrelationSignal, InefficientChannelSignal, ScalingCandidateSignal } from "./executive-summary-analysis.types";

const MIN_REVENUE = 100;
const MIN_CONVERSIONS = 3;
const MIN_BUDGET_SHARE = 0.01; // 1% of portfolio budget — filters micro-campaigns from bottom list
const GAP_THRESHOLD = 0.05;   // 5% efficiency gap (decimal)

function n(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

// these 2 functions cannot return same campaign because of the different filtering criteria,
//  but we want to minimize overlap between the two lists to create clearer narrative for the AI and end user
export function getTopCampaigns(
  campaigns: CampaignSummary[],
): CampaignSummary[] {
  if (campaigns.length <= 2) return [];

  return [...campaigns]
    .filter(
      c =>
        n(c.budget) > 0 &&
        n(c.revenue) >= MIN_REVENUE &&
        n(c.conversions) >= MIN_CONVERSIONS &&
        c.roi !== null,
    )
    .sort((a, b) => {
      const roiDiff = n(b.roi) - n(a.roi);
      if (roiDiff !== 0) return roiDiff;
      return n(b.revenue) - n(a.revenue);
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
      c =>
        n(c.budget) > 0 &&
        n(c.budgetShare) >= MIN_BUDGET_SHARE &&
        !excludedNames?.has(c.campaign),
    )
    .sort((a, b) => {
      const gapA = n(a.budgetShare) - n(a.revenueShare);
      const gapB = n(b.budgetShare) - n(b.revenueShare);
      if (gapB !== gapA) return gapB - gapA;
      return n(a.roi) - n(b.roi);
    })
    .slice(0, 5);
}

export function getInefficientChannels(
  channels: ChannelSummary[],
  portfolioRoi: number | null,
): InefficientChannelSignal[] {
  return channels
    .map(channel => {
      const efficiencyGap = n(channel.budgetShare) - n(channel.revenueShare);
      return {
        channel: channel.channel,
        budgetShare: channel.budgetShare,
        revenueShare: channel.revenueShare,
        efficiencyGap,
        roi: n(channel.roi),
        reason: "Budget share exceeds revenue share with weaker efficiency.",
      };
    })
    .filter(
      channel =>
        channel.efficiencyGap > GAP_THRESHOLD &&
        (portfolioRoi === null || channel.roi < portfolioRoi),
    )
    .sort((a, b) => b.efficiencyGap - a.efficiencyGap);
}

export function getScalingCandidates(
  campaigns: CampaignSummary[],
  channels: ChannelSummary[],
  portfolioRoi: number | null,
): ScalingCandidateSignal[] {
  const campaignCandidates: ScalingCandidateSignal[] = campaigns
    .filter(
      c =>
        c.roi !== null &&
        n(c.budget) > 0 &&
        n(c.revenue) >= MIN_REVENUE &&
        n(c.conversions) >= MIN_CONVERSIONS &&
        (portfolioRoi === null || c.roi > portfolioRoi) &&
        n(c.revenueShare) > n(c.budgetShare),
    )
    .map(c => ({
      name: c.campaign,
      type: "campaign" as const,
      channel: c.channel,
      roi: n(c.roi),
      budgetShare: c.budgetShare,
      revenueShare: c.revenueShare,
      reason: "Strong efficiency with revenue share exceeding budget share.",
    }));

  const channelCandidates: ScalingCandidateSignal[] = channels
    .filter(
      c =>
        c.roi !== null &&
        (portfolioRoi === null || c.roi > portfolioRoi) &&
        n(c.revenueShare) > n(c.budgetShare),
    )
    .map(c => ({
      name: c.channel,
      type: "channel" as const,
      roi: n(c.roi),
      budgetShare: c.budgetShare,
      revenueShare: c.revenueShare,
      reason: "Channel outperforms its budget allocation.",
    }));

  return [...campaignCandidates, ...channelCandidates]
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

  const sorted = [...campaigns].sort((a, b) => n(b.revenue) - n(a.revenue));

  const top1RevenueShare = n(sorted[0]?.revenueShare);
  const top3RevenueShare = sorted
    .slice(0, 3)
    .reduce((sum, c) => sum + n(c.revenueShare), 0);

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
  const topCampaignNames = new Set(topCampaigns.map(c => c.campaign));

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
