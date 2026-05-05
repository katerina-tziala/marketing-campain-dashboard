import { computed, type ComputedRef, type MaybeRefOrGetter, toValue } from 'vue';

import type { CampaignPerformance, Channel } from '@/shared/data';

import type { RoiBarChartItem } from '../types';

export function useCampaignRoiChartItems(
  campaigns: MaybeRefOrGetter<CampaignPerformance[]>,
  getColor: (campaign: CampaignPerformance, index: number) => string,
): ComputedRef<RoiBarChartItem[]> {
  return computed<RoiBarChartItem[]>(() =>
    toValue(campaigns).map((campaign, index) => ({
      label: campaign.campaign,
      roi: campaign.roi,
      budget: campaign.budget,
      revenue: campaign.revenue,
      color: getColor(campaign, index),
    })),
  );
}

export function useChannelRoiChartItems(
  channels: MaybeRefOrGetter<Channel[]>,
  getColor: (channel: Channel, index: number) => string,
): ComputedRef<RoiBarChartItem[]> {
  return computed<RoiBarChartItem[]>(() =>
    toValue(channels).map((channel, index) => ({
      label: channel.name,
      roi: channel.roi,
      budget: channel.budget,
      revenue: channel.revenue,
      color: getColor(channel, index),
    })),
  );
}
