import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Campaign, CampaignKPIs, CampaignPerformance, CampaignScope } from '../common/types/campaign'
import { groupByChannel } from '../common/utils/campaign-aggregation'
import { aggregateCampaignMetrics, computePerformanceMetrics, toCampaignPerformance } from '../common/utils/campaign-performance'
// TODO: DEV MOCK — remove this import when reverting DEV_MOCK_CAMPAIGNS
import { MOCK_CAMPAINS } from '../common/data/MOCK_CAMPAIN_DATA'

// TODO: DEV MOCK — revert before shipping.
// To revert: set DEV_MOCK_CAMPAIGNS = false, remove the MOCK_CAMPAINS import above,
// and reset the `campaigns` and `title` refs to [] and '' respectively.
const DEV_MOCK_CAMPAIGNS = true

export const useCampaignStore = defineStore('campaigns', () => {
  // State
  const campaigns = ref<CampaignPerformance[]>(
    DEV_MOCK_CAMPAIGNS ? MOCK_CAMPAINS.map(toCampaignPerformance) : [],
  )
  const title = ref<string>(DEV_MOCK_CAMPAIGNS ? 'Mock Campaign Data (Dev)' : '')
  const selectedChannels = ref<string[]>([])

  // Getters
  const availableChannels = computed(() =>
    [...new Set(campaigns.value.map((c) => c.channel))].sort(),
  )

  const filteredCampaigns = computed(() =>
    selectedChannels.value.length === 0
      ? campaigns.value
      : campaigns.value.filter((c) => selectedChannels.value.includes(c.channel)),
  )

  const filteredTotals = computed(() => aggregateCampaignMetrics(filteredCampaigns.value))

  const channelTotals = computed(() => groupByChannel(filteredCampaigns.value))

  const campaignScope = computed((): CampaignScope => ({
    campaigns: campaigns.value.map((c) => c.campaign),
    selectedCampaigns: filteredCampaigns.value.map((c) => c.campaign),
    selectedChannels: selectedChannels.value,
  }))

  const kpis = computed((): CampaignKPIs => ({
    ...filteredTotals.value,
    ...computePerformanceMetrics(filteredTotals.value),
  }))

  // Actions
  function toggleChannel(channel: string) {
    const idx = selectedChannels.value.indexOf(channel)
    if (idx === -1) {
      selectedChannels.value.push(channel)
    } else {
      selectedChannels.value.splice(idx, 1)
    }
  }

  function clearFilters() {
    selectedChannels.value = []
  }

  function loadCampaigns(newTitle: string, newCampaigns: Campaign[]): void {
    title.value = newTitle
    campaigns.value = newCampaigns.map(toCampaignPerformance)
    selectedChannels.value = []
  }

  return {
    campaigns,
    title,
    filteredCampaigns,
    selectedChannels,
    availableChannels,
    campaignScope,
    kpis,
    channelTotals,
    // actions
    toggleChannel,
    clearFilters,
    loadCampaigns,
  }
})
