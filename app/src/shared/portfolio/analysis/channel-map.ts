import type { Campaign, CampaignPerformance, Channel } from '@/shared/data';

import {
  aggregateCampaignMetrics,
  computePerformanceMetrics,
  toCampaignPerformance,
} from './metrics';

type ChannelAccumulator = { id: string; name: string; campaigns: CampaignPerformance[] };

function toChannelId(name: string): string {
  return name.trim().toLowerCase().replace(/ /g, '-');
}

function groupCampaignsByChannel(campaigns: Campaign[]): Map<string, ChannelAccumulator> {
  const grouped = new Map<string, ChannelAccumulator>();

  for (const campaign of campaigns) {
    const performance = toCampaignPerformance(campaign);
    const id = toChannelId(campaign.channel);
    const existing = grouped.get(id);
    if (existing) {
      existing.campaigns.push(performance);
    } else {
      grouped.set(id, { id, name: campaign.channel, campaigns: [performance] });
    }
  }

  return grouped;
}

export function buildChannelMap(campaigns: Campaign[]): Map<string, Channel> {
  const grouped = groupCampaignsByChannel(campaigns);
  const sortedKeys = [...grouped.keys()].sort();

  return sortedKeys.reduce((map, key) => {
    const channel = grouped.get(key);
    if (!channel) {
      return map;
    }
    const { id, name, campaigns: unsorted } = channel;
    const campaigns = [...unsorted].sort((a, b) => a.campaign.localeCompare(b.campaign));
    const metrics = aggregateCampaignMetrics(campaigns);
    return map.set(key, { id, name, campaigns, ...metrics, ...computePerformanceMetrics(metrics) });
  }, new Map<string, Channel>());
}
