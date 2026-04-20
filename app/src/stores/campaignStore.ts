import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Campaign, CampaignKPIs, CampaignPerformance, CampaignScope } from '../common/types/campaign'
import type { Channel } from '../common/types/channel'
import { buildChannelMap } from '../common/utils/campaign-channel'
import { aggregateCampaignMetrics, computePerformanceMetrics } from '../common/utils/campaign-performance'
// TODO: DEV MOCK — remove this import when reverting DEV_MOCK_CAMPAIGNS
import { MOCK_CAMPAINS } from '../common/data/MOCK_CAMPAIN_DATA'

// TODO: DEV MOCK — revert before shipping.
// To revert: set DEV_MOCK_CAMPAIGNS = false, remove the MOCK_CAMPAINS import above,
// and reset the `title` and `portfolioChannels` refs to '' and new Map() respectively.
const DEV_MOCK_CAMPAIGNS = true

export const useCampaignStore = defineStore('campaigns', () => {
  // State
  const title = ref<string>(DEV_MOCK_CAMPAIGNS ? 'Mock Campaign Data (Dev)' : '')
  const portfolioChannels = ref<Map<string, Channel>>(
    DEV_MOCK_CAMPAIGNS ? buildChannelMap(MOCK_CAMPAINS) : new Map(),
  )
  const selectedChannelsIds = ref<string[]>([])

  // Getters
  const campaigns = computed<CampaignPerformance[]>(() =>
    [...portfolioChannels.value.values()].flatMap((ch) => ch.campaigns),
  )

  const selectedChannels = computed<Channel[]>(() =>
    selectedChannelsIds.value.length === 0
      ? [...portfolioChannels.value.values()]
      : selectedChannelsIds.value.flatMap((id) => {
          const ch = portfolioChannels.value.get(id)
          return ch ? [ch] : []
        }),
  )

  const filteredCampaigns = computed<CampaignPerformance[]>(() =>
    selectedChannels.value.flatMap((ch) => ch.campaigns),
  )

  const campaignScope = computed((): CampaignScope => ({
    campaigns: campaigns.value.map((c) => c.campaign),
    selectedCampaigns: filteredCampaigns.value.map((c) => c.campaign),
    selectedChannels: selectedChannelsIds.value.map((id) => portfolioChannels.value.get(id)?.name ?? id),
  }))

  const kpis = computed((): CampaignKPIs => {
    const totals = aggregateCampaignMetrics(selectedChannels.value)
    return { ...totals, ...computePerformanceMetrics(totals) }
  })

  // Actions
  function toggleChannel(channelId: string) {
    const idx = selectedChannelsIds.value.indexOf(channelId)
    if (idx === -1) {
      selectedChannelsIds.value.push(channelId)
    } else {
      selectedChannelsIds.value.splice(idx, 1)
    }
  }

  function clearFilters() {
    selectedChannelsIds.value = []
  }

  function loadCampaigns(newTitle: string, newCampaigns: Campaign[]): void {
    title.value = newTitle
    portfolioChannels.value = buildChannelMap(newCampaigns)
    selectedChannelsIds.value = []
  }

  return {
    campaigns,
    title,
    portfolioChannels,
    filteredCampaigns,
    selectedChannels,
    selectedChannelsIds,
    campaignScope,
    kpis,
    // actions
    toggleChannel,
    clearFilters,
    loadCampaigns,
  }
})
