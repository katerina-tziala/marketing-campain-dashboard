import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Campaign, CampaignPerformance, PortfolioScope } from '../common/types/campaign'
import type { Channel } from '../common/types/channel'
import { buildChannelMap } from '../common/utils/campaign-channel'
import { computePortfolioAnalysis } from '../common/portfolio-analysis/portfolio-analysis'
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
    [...portfolioChannels.value.values()].flatMap((channel) => channel.campaigns),
  )

  const selectedChannels = computed<Channel[]>(() =>
    selectedChannelsIds.value.length === 0
      ? [...portfolioChannels.value.values()]
      : selectedChannelsIds.value.flatMap((id) => {
          const channel = portfolioChannels.value.get(id)
          return channel ? [channel] : []
        }),
  )

  const filteredCampaigns = computed<CampaignPerformance[]>(() =>
    selectedChannels.value.flatMap((channel) => channel.campaigns),
  )

  const portfolioScope = computed((): PortfolioScope => ({
    campaigns: campaigns.value.map((campaign) => campaign.campaign),
    channels: [...portfolioChannels.value.values()].map((channel) => channel.name),
    selectedCampaigns: filteredCampaigns.value.map((campaign) => campaign.campaign),
    selectedChannels: selectedChannelsIds.value.map(
      (id) => portfolioChannels.value.get(id)?.name ?? id,
    ),
  }))

  const portfolioAnalysis = computed(() =>
    computePortfolioAnalysis(selectedChannels.value, selectedChannelsIds.value),
  )

  // Actions
  function toggleChannel(channelId: string) {
    const index = selectedChannelsIds.value.indexOf(channelId)
    if (index === -1) {
      selectedChannelsIds.value.push(channelId)
    } else {
      selectedChannelsIds.value.splice(index, 1)
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
    title,
    portfolioChannels,
    campaigns,
    selectedChannels,
    selectedChannelsIds,
    filteredCampaigns,
    portfolioScope,
    portfolioAnalysis,
    // actions
    toggleChannel,
    clearFilters,
    loadCampaigns,
  }
})
