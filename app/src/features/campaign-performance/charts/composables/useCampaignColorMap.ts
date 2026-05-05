import { computed, type ComputedRef, type MaybeRefOrGetter, toValue } from 'vue';

import type { Channel } from '@/shared/data';

import {
  sortCampaignsByRoiDesc,
  sortChannelsByRoiDesc,
} from '../../utils/campaign-performance-sorting';
import { useCampaignPerformanceTheme } from './useCampaignPerformanceTheme';

export function useCampaignColorMap(channels: MaybeRefOrGetter<Channel[]>): ComputedRef<{
  channelColorMap: Record<string, string>;
  campaignColorMap: Record<string, string>;
}> {
  const { paletteColors } = useCampaignPerformanceTheme();

  function getColor(index: number): string {
    return paletteColors[index % paletteColors.length];
  }

  const colorMaps = computed(() => {
    const channelColorMap: Record<string, string> = {};
    const campaignColorMap: Record<string, string> = {};

    const allCampaigns = toValue(channels).flatMap((channel) => channel.campaigns);
    sortCampaignsByRoiDesc(allCampaigns).forEach((campaign, i) => {
      campaignColorMap[String(campaign.rowId)] = getColor(i);
    });

    sortChannelsByRoiDesc(toValue(channels)).forEach((channel, i) => {
      channelColorMap[channel.id] = getColor(i);
    });

    return { channelColorMap, campaignColorMap };
  });

  return colorMaps;
}
