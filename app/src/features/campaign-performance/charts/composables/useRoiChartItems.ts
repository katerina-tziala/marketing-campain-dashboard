import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { CampaignPerformance } from '@/shared/types'
import type { Channel } from '@/shared/types'
import type { RoiBarChartItem } from '../types'

export function useCampaignRoiChartItems(
  campaigns: MaybeRefOrGetter<CampaignPerformance[]>,
  getColor: (campaign: CampaignPerformance, index: number) => string,
) {
  return computed<RoiBarChartItem[]>(() =>
    toValue(campaigns).map((campaign, index) => ({
      label: campaign.campaign,
      roi: campaign.roi,
      budget: campaign.budget,
      revenue: campaign.revenue,
      color: getColor(campaign, index),
    })),
  )
}

export function useChannelRoiChartItems(
  channels: MaybeRefOrGetter<Channel[]>,
  getColor: (channel: Channel, index: number) => string,
) {
  return computed<RoiBarChartItem[]>(() =>
    toValue(channels).map((channel, index) => ({
      label: channel.name,
      roi: channel.roi,
      budget: channel.budget,
      revenue: channel.revenue,
      color: getColor(channel, index),
    })),
  )
}
