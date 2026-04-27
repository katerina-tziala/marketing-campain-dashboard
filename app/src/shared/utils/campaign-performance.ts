import type { Campaign, CampaignMetrics, CampaignPerformance, PerformanceMetrics, PortfolioKPIs, ShareEfficiency } from '@/shared/types/campaign'
import type { Channel } from '@/shared/types/channel'
import { round2, round4, safeDivide } from './math'

export function computePerformanceMetrics(campain: CampaignMetrics): PerformanceMetrics {
  const { budget, revenue, impressions, clicks, conversions } = campain;

  return {
    roi: budget > 0 ? round4((revenue - budget) / budget) : null,
    ctr: impressions > 0 ? round4(clicks / impressions) : null,
    cvr: clicks > 0 ? round4(conversions / clicks) : null,
    cpa: conversions > 0 ? round2(budget / conversions) : null,
  }
}

export function computeShareEfficiency(
  item: CampaignMetrics,
  totalBudget: number,
  totalRevenue: number,
): ShareEfficiency {
  const budgetShare = safeDivide(item.budget, totalBudget)
  const revenueShare = safeDivide(item.revenue, totalRevenue)
  return {
    budgetShare,
    revenueShare,
    efficiencyGap: budgetShare - revenueShare,
    gapAmount: item.revenue - item.budget,
  }
}

export function toCampaignPerformance(campaign: Campaign): CampaignPerformance {
  return { ...campaign, ...computePerformanceMetrics(campaign) }
}

export function aggregateCampaignMetrics(campaigns: Campaign[] | Channel[]): CampaignMetrics {
  return campaigns.reduce(
    (acc, campaign) => ({
      budget: acc.budget + campaign.budget,
      revenue: acc.revenue + campaign.revenue,
      impressions: acc.impressions + campaign.impressions,
      clicks: acc.clicks + campaign.clicks,
      conversions: acc.conversions + campaign.conversions,
    }),
    { budget: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0 },
  )
}

export function computePortfolioKPIs(channels: Channel[]): PortfolioKPIs {
  const { budget, revenue, impressions, clicks, conversions } = aggregateCampaignMetrics(channels)
  const { roi, ctr, cvr, cpa } = computePerformanceMetrics({ budget, revenue, impressions, clicks, conversions })
  return {
    totalBudget: budget,
    totalRevenue: revenue,
    totalImpressions: impressions,
    totalClicks: clicks,
    totalConversions: conversions,
    aggregatedROI: roi,
    aggregatedCTR: ctr,
    aggregatedCVR: cvr,
    aggregatedCPA: cpa,
  }
}
