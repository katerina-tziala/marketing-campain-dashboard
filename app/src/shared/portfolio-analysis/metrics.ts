import type {
  Campaign,
  CampaignMetrics,
  CampaignPerformance,
  Channel,
  PerformanceMetrics,
  PortfolioKPIs,
  ShareEfficiency,
} from '../types'
import { computeRoundedRatioOrNull, safeDivide } from '../utils'

export function computePerformanceMetrics(campain: CampaignMetrics): PerformanceMetrics {
  const { budget, revenue, impressions, clicks, conversions } = campain;

  return {
    roi: computeRoundedRatioOrNull(revenue - budget, budget),
    ctr: computeRoundedRatioOrNull(clicks, impressions),
    cvr: computeRoundedRatioOrNull(conversions, clicks),
    cpa: computeRoundedRatioOrNull(budget, conversions, 2),
  }
}

export function computeShareEfficiency(
  item: CampaignMetrics,
  totalBudget: number,
  totalRevenue: number,
): ShareEfficiency {
  const budgetShare = safeDivide(item.budget, totalBudget)
  const revenueShare = safeDivide(item.revenue, totalRevenue)
  const allocationGap = budgetShare - revenueShare

  return {
    budgetShare,
    revenueShare,
    allocationGap,
    efficiencyGap: -allocationGap,
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

export function aggregateCampaignOutcomes(
  campaigns: Array<Pick<CampaignMetrics, 'revenue' | 'conversions'>>,
): Pick<CampaignMetrics, 'revenue' | 'conversions'> {
  return campaigns.reduce(
    (totals, campaign) => ({
      revenue: totals.revenue + campaign.revenue,
      conversions: totals.conversions + campaign.conversions,
    }),
    { revenue: 0, conversions: 0 },
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
    aggregatedRoi: roi,
    aggregatedCtr: ctr,
    aggregatedCvr: cvr,
    aggregatedCpa: cpa,
  }
}
