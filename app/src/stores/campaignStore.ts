import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Campaign } from '../common/types/campaign'

export const useCampaignStore = defineStore('campaigns', () => {
  // State
  const campaigns = ref<Campaign[]>([])
  const title = ref<string>('')
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

  const kpis = computed(() => ({
    totalBudget: totalBudget.value,
    totalRevenue: totalRevenue.value,
    roi:
      totalBudget.value > 0
        ? ((totalRevenue.value - totalBudget.value) / totalBudget.value) * 100
        : 0,
    ctr:
      totalImpressions.value > 0
        ? (totalClicks.value / totalImpressions.value) * 100
        : 0,
    cvr:
      totalClicks.value > 0
        ? (totalConversions.value / totalClicks.value) * 100
        : 0,
    cac:
      totalConversions.value > 0
        ? totalBudget.value / totalConversions.value
        : 0,
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
    kpis,
    totalImpressions,
    totalClicks,
    totalConversions,
    toggleChannel,
    clearFilters,
    loadCampaigns,
  }
})
