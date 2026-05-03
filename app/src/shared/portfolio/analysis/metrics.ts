import type {
  Campaign,
  CampaignRawMetrics,
  CampaignPerformance,
  Channel,
  PerformanceMetrics,
} from '@/shared/data'
import type {
  PortfolioKPIs,
  ShareEfficiency,
} from '../types'
import { computeRoundedRatioOrNull, safeDivide } from '@/shared/utils'

export function computePerformanceMetrics(campaign: CampaignRawMetrics): PerformanceMetrics {
  const { budget, revenue, impressions, clicks, conversions } = campaign;

  return {
    roi: computeRoundedRatioOrNull(revenue - budget, budget),
    ctr: computeRoundedRatioOrNull(clicks, impressions),
    cvr: computeRoundedRatioOrNull(conversions, clicks),
    cpa: computeRoundedRatioOrNull(budget, conversions, 2),
  }
}

export function computeShareEfficiency(
  item: CampaignRawMetrics,
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

export function aggregateCampaignMetrics(campaigns: Campaign[] | Channel[]): CampaignRawMetrics {
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
  campaigns: Array<Pick<CampaignRawMetrics, 'revenue' | 'conversions'>>,
): Pick<CampaignRawMetrics, 'revenue' | 'conversions'> {
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
