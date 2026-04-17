import type { Campaign } from '../types/campaign'

export type ChannelTotals = {
  budget: number
  revenue: number
  impressions: number
  clicks: number
  conversions: number
}

export function groupByChannel(campaigns: Campaign[]): Record<string, ChannelTotals> {
  const result: Record<string, ChannelTotals> = {}
  for (const c of campaigns) {
    const acc = result[c.channel]
    if (acc) {
      acc.budget += c.budget
      acc.revenue += c.revenue
      acc.impressions += c.impressions
      acc.clicks += c.clicks
      acc.conversions += c.conversions
    } else {
      result[c.channel] = {
        budget: c.budget,
        revenue: c.revenue,
        impressions: c.impressions,
        clicks: c.clicks,
        conversions: c.conversions,
      }
    }
  }
  return result
}
