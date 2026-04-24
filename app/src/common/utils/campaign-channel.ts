import type { Campaign, CampaignPerformance } from '@/common/types/campaign'
import type { Channel } from '@/common/types/channel'
import { aggregateCampaignMetrics, computePerformanceMetrics, toCampaignPerformance } from './campaign-performance'

type ChannelAccumulator = { id: string; name: string; campaigns: CampaignPerformance[] }

function toChannelId(name: string): string {
  return name.trim().toLowerCase().replace(/ /g, '-')
}

function groupCampaignsByChannel(campaigns: Campaign[]): Map<string, ChannelAccumulator> {
  const grouped = new Map<string, ChannelAccumulator>()

  for (const campaign of campaigns) {
    const performance = toCampaignPerformance(campaign)
    const id = toChannelId(campaign.channel)
    const existing = grouped.get(id) ?? { id, name: campaign.channel, campaigns: [] }

    grouped.set(id, { ...existing, campaigns: [...existing.campaigns, performance] })
  }

  return grouped
}

export function buildChannelMap(campaigns: Campaign[]): Map<string, Channel> {
  const grouped = groupCampaignsByChannel(campaigns)
  const sortedKeys = [...grouped.keys()].sort()

  return sortedKeys.reduce((map, key) => {
    const { id, name, campaigns: unsorted } = grouped.get(key)!
    const campaigns = [...unsorted].sort((a, b) => a.campaign.localeCompare(b.campaign))
    const metrics = aggregateCampaignMetrics(campaigns)
    return map.set(key, { id, name, campaigns, ...metrics, ...computePerformanceMetrics(metrics) })
  }, new Map<string, Channel>())
}
