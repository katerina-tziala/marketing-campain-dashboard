import type { CampaignPerformance, Channel } from '@/shared/data';
import type { PortfolioKPIs } from '@/shared/portfolio';
import { computeShareEfficiency, rankByBudgetDesc, rankByRoiDesc } from '@/shared/portfolio';
import { sortByValueDesc } from '@/shared/utils';

// ROI ranking charts should put the strongest performers first; unavailable ROI stays last.
export function sortCampaignsByRoiDesc(
  campaigns: readonly CampaignPerformance[],
): CampaignPerformance[] {
  return rankByRoiDesc(campaigns);
}

// ROI ranking charts should put the strongest channels first; unavailable ROI stays last.
export function sortChannelsByRoiDesc(channels: readonly Channel[]): Channel[] {
  return rankByRoiDesc(channels);
}

// Allocation charts should lead with the largest spend areas.
export function sortCampaignsByBudgetDesc(
  campaigns: readonly CampaignPerformance[],
): CampaignPerformance[] {
  return rankByBudgetDesc(campaigns);
}

function getChannelEfficiencyGapImpact(channel: Channel, kpis: PortfolioKPIs): number | null {
  if (kpis.totalBudget === 0 || kpis.totalRevenue === 0) {
    return null;
  }
  const { efficiencyGap } = computeShareEfficiency(channel, kpis.totalBudget, kpis.totalRevenue);
  return Math.abs(efficiencyGap);
}

// Revenue vs budget charts should surface the channels with the largest allocation mismatch first.
export function sortChannelsByEfficiencyGapImpactDesc(
  channels: readonly Channel[],
  kpis: PortfolioKPIs,
): Channel[] {
  return sortByValueDesc(channels, (channel) => getChannelEfficiencyGapImpact(channel, kpis));
}
