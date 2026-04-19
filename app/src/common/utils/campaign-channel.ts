import type { Campaign } from '../types/campaign'
import type { Channel } from '../types/channel'
import { aggregateCampaignMetrics, toCampaignPerformance } from './campaign-performance'

function toChannelId(name: string): string {
  return name.trim().toLowerCase().replace(/ /g, '-')
}

function groupCampaignsByChannel(campaigns: Campaign[]): Map<string, Channel> {
  const grouped = new Map<string, Channel>()

  for (const campaign of campaigns) {
    const performance = toCampaignPerformance(campaign)
    const id = toChannelId(campaign.channel)
    const existing = grouped.get(id)

    if (existing) {
      const updatedCampaigns = [...existing.campaigns, performance]
      grouped.set(id, {
        ...existing,
        ...aggregateCampaignMetrics(updatedCampaigns),
        campaigns: updatedCampaigns,
      })
    } else {
      const { channel, budget, impressions, clicks, conversions, revenue } = campaign
      grouped.set(id, {
        id, budget, impressions, clicks, conversions, revenue,
        name: channel,
        campaigns: [performance],
      })
    }
  }

  return grouped
}

export function buildChannelMap(campaigns: Campaign[]): Map<string, Channel> {
  const grouped = groupCampaignsByChannel(campaigns)
  const sortedKeys = [...grouped.keys()].sort()

  return sortedKeys.reduce((map, key) => {
    const channel = grouped.get(key)!
    return map.set(key, {
      ...channel,
      campaigns: [...channel.campaigns].sort((a, b) => a.campaign.localeCompare(b.campaign)),
    })
  }, new Map<string, Channel>())
}
