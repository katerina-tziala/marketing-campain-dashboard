import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { CampaignPerformance, PortfolioScope } from '@/shared/types/campaign'
import type { Channel } from '@/shared/types/channel'
import { computePortfolioAnalysis } from '@/shared/portfolio-analysis'
import { usePortfolioDataStore } from './portfolioData.store'

export const useCampaignStore = defineStore('campaigns', () => {
  const portfolioData = usePortfolioDataStore()

  // ── State ─────────────────────────────────────────────────────────────

  const activePortfolioId = ref<string | null>(null)
  const selectedChannelsIds = ref<string[]>([])

  // ── Derived from active portfolio ─────────────────────────────────────

  const portfolioChannels = computed<Map<string, Channel>>(
    () => portfolioData.getById(activePortfolioId.value ?? '')?.channelMap ?? new Map(),
  )

  const title = computed<string>(
    () => portfolioData.getById(activePortfolioId.value ?? '')?.title ?? '',
  )

  // ── Getters ───────────────────────────────────────────────────────────

  const campaigns = computed<CampaignPerformance[]>(() =>
    [...portfolioChannels.value.values()].flatMap(channel => channel.campaigns),
  )

  const selectedChannels = computed<Channel[]>(() => {
    return selectedChannelsIds.value.length === 0
      ? [...portfolioChannels.value.values()]
      : selectedChannelsIds.value.flatMap(id => {
          const channel = portfolioChannels.value.get(id)
          return channel ? [channel] : []
        })
  })

  const filteredCampaigns = computed<CampaignPerformance[]>(() =>
    selectedChannels.value.flatMap(channel => channel.campaigns),
  )

  const portfolioScope = computed((): PortfolioScope => ({
    campaigns: campaigns.value.map(campaign => campaign.campaign),
    channels: [...portfolioChannels.value.values()].map(channel => channel.name),
    selectedCampaigns: filteredCampaigns.value.map(campaign => campaign.campaign),
    selectedChannels: selectedChannelsIds.value.map(
      id => portfolioChannels.value.get(id)?.name ?? id,
    ),
  }))

  const portfolioAnalysis = computed(() => {
    const portfolio = portfolioData.getById(activePortfolioId.value ?? '')
    if (!portfolio) return computePortfolioAnalysis([], [])
    if (selectedChannelsIds.value.length === 0) return portfolio.fullAnalysis
    return computePortfolioAnalysis(selectedChannels.value, selectedChannelsIds.value)
  })

  const fullPortfolioKpis = computed(() => {
    const portfolio = portfolioData.getById(activePortfolioId.value ?? '')
    return portfolio?.fullAnalysis.portfolio ?? null
  })

  // ── Actions ───────────────────────────────────────────────────────────

  function setChannelFilter(ids: string[]): void {
    selectedChannelsIds.value = ids
  }

  // ── Watchers ──────────────────────────────────────────────────────────

  watch(
    () => portfolioData.pendingSelectionId,
    (id) => {
      if (id) {
        activePortfolioId.value = id
        selectedChannelsIds.value = []
      }
    },
    { immediate: true },
  )

  watch(
    () => portfolioData.lastEvictedId,
    (id) => {
      if (id && activePortfolioId.value === id) {
        activePortfolioId.value = null
        selectedChannelsIds.value = []
      }
    },
  )

  return {
    title,
    activePortfolioId,
    portfolioChannels,
    campaigns,
    selectedChannels,
    selectedChannelsIds,
    filteredCampaigns,
    portfolioScope,
    portfolioAnalysis,
    fullPortfolioKpis,
    // actions
    setChannelFilter,
  }
})
