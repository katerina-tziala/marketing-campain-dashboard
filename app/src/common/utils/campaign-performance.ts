import type { Campaign, CampaignPerformance } from '../types/campaign'
import { round2 } from './math'

export function percentageClass(value: number | null): string {
  if (value === null) return ''
  if (value <= 0) return 'negative'
  if (value <= 50) return 'warning'
  return 'positive'
}

export function toCampaignPerformance(c: Campaign): CampaignPerformance {
  return {
    ...c,
    roi: c.budget > 0 ? round2(((c.revenue - c.budget) / c.budget) * 100) : null,
    ctr: c.impressions > 0 ? round2((c.clicks / c.impressions) * 100) : null,
    cvr: c.clicks > 0 ? round2((c.conversions / c.clicks) * 100) : null,
    cac: c.conversions > 0 ? round2(c.budget / c.conversions) : null,
  }
}
