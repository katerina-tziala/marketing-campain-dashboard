import type { CampaignPerformance, PortfolioKPIs } from '@/shared/types/campaign'
import type { Channel } from '@/shared/types/channel'
import { sortByValueDesc } from '@/shared/utils/sorting'

// ROI ranking charts should put the strongest performers first; unavailable ROI stays last.
export function sortCampaignsByRoiDesc(
  campaigns: readonly CampaignPerformance[],
): CampaignPerformance[] {
  return sortByValueDesc(campaigns, (campaign) => campaign.roi)
}

// ROI ranking charts should put the strongest channels first; unavailable ROI stays last.
export function sortChannelsByRoiDesc(channels: readonly Channel[]): Channel[] {
  return sortByValueDesc(channels, (channel) => channel.roi)
}

// Allocation charts should lead with the largest spend areas.
export function sortCampaignsByBudgetDesc(
  campaigns: readonly CampaignPerformance[],
): CampaignPerformance[] {
  return sortByValueDesc(campaigns, (campaign) => campaign.budget)
}

function getChannelEfficiencyGapImpact(channel: Channel, kpis: PortfolioKPIs): number | null {
  if (kpis.totalBudget === 0 || kpis.totalRevenue === 0) return null
  const budgetShare = channel.budget / kpis.totalBudget
  const revenueShare = channel.revenue / kpis.totalRevenue
  return Math.abs(revenueShare - budgetShare)
}

// Revenue vs budget charts should surface the channels with the largest allocation mismatch first.
export function sortChannelsByEfficiencyGapImpactDesc(
  channels: readonly Channel[],
  kpis: PortfolioKPIs,
): Channel[] {
  return sortByValueDesc(channels, (channel) => getChannelEfficiencyGapImpact(channel, kpis))
}
