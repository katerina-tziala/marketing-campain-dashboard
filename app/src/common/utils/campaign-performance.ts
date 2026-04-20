import type { Campaign, CampaignMetrics, CampaignPerformance, PerformanceMetrics } from '../types/campaign'
import type { Channel } from '../types/channel'
import { round2 } from './math'

export function percentageClass(value: number | null): string {
  if (value === null) return ''
  if (value <= 0) return 'negative'
  if (value <= 50) return 'warning'
  return 'positive'
}
 
export function computePerformanceMetrics(campain: CampaignMetrics): PerformanceMetrics {
  const { budget, revenue, impressions, clicks, conversions } = campain;
  
  return {
    roi: budget > 0 ? round2(((revenue - budget) / budget) * 100) : null,
    ctr: impressions > 0 ? round2((clicks / impressions) * 100) : null,
    cvr: clicks > 0 ? round2((conversions / clicks) * 100) : null,
    cac: conversions > 0 ? round2(budget / conversions) : null,
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
