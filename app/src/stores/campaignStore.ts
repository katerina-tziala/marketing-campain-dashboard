import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Campaign, CampaignScope } from '../common/types/campaign'
import { safeDivide, round2 } from '../common/utils/math'
// TODO: DEV MOCK — remove this import when reverting DEV_MOCK_CAMPAIGNS
import { MOCK_CAMPAINS } from '../common/data/MOCK_CAMPAIN_DATA'

// TODO: DEV MOCK — revert before shipping.
// To revert: set DEV_MOCK_CAMPAIGNS = false, remove the MOCK_CAMPAINS import above,
// and reset the `campaigns` and `title` refs to [] and '' respectively.
const DEV_MOCK_CAMPAIGNS = true

export const useCampaignStore = defineStore('campaigns', () => {
  // State
  const campaigns = ref<Campaign[]>(DEV_MOCK_CAMPAIGNS ? MOCK_CAMPAINS : [])
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

  const totalBudget = computed(() =>
    filteredCampaigns.value.reduce((s, c) => s + c.budget, 0),
  )
  const totalRevenue = computed(() =>
    filteredCampaigns.value.reduce((s, c) => s + c.revenue, 0),
  )
  const totalImpressions = computed(() =>
    filteredCampaigns.value.reduce((s, c) => s + c.impressions, 0),
  )
  const totalClicks = computed(() =>
    filteredCampaigns.value.reduce((s, c) => s + c.clicks, 0),
  )
  const totalConversions = computed(() =>
    filteredCampaigns.value.reduce((s, c) => s + c.conversions, 0),
  )

  const campaignScope = computed((): CampaignScope => ({
    campaigns: campaigns.value.map((c) => c.campaign),
    selectedCampaigns: filteredCampaigns.value.map((c) => c.campaign),
    selectedChannels: selectedChannels.value,
  }))

  const kpis = computed(() => ({
    totalBudget: totalBudget.value,
    totalRevenue: totalRevenue.value,
    roi: round2(safeDivide(totalRevenue.value - totalBudget.value, totalBudget.value) * 100),
    ctr: round2(safeDivide(totalClicks.value, totalImpressions.value) * 100),
    cvr: round2(safeDivide(totalConversions.value, totalClicks.value) * 100),
    cac: totalConversions.value > 0 ? round2(totalBudget.value / totalConversions.value) : null,
    totalConversions: totalConversions.value,
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
    campaigns.value = newCampaigns
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
    totalImpressions,
    totalClicks,
    totalConversions,
    toggleChannel,
    clearFilters,
    loadCampaigns,
  }
})
