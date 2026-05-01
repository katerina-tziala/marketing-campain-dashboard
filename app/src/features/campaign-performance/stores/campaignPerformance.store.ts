import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { CampaignPerformance } from '@/shared/data'
import type { Channel } from '@/shared/data'
import { computePortfolioAnalysis, getPortfolioScope } from '@/shared/portfolio-analysis'
import { usePortfolioDataStore } from '@/app/stores'

export const useCampaignPerformanceStore = defineStore('campaignPerformance', () => {
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

  function getChannelsByIds(ids: string[]): Channel[] {
    return ids.flatMap(id => {
      const channel = portfolioChannels.value.get(id)
      return channel ? [channel] : []
    })
  }

  function getSelectedChannels(): Channel[] {
    return selectedChannelsIds.value.length === 0
      ? [...portfolioChannels.value.values()]
      : getChannelsByIds(selectedChannelsIds.value)
  }

  const selectedChannels = computed<Channel[]>(() => getSelectedChannels())

  const filteredCampaigns = computed<CampaignPerformance[]>(() =>
    selectedChannels.value.flatMap(channel => channel.campaigns),
  )

  const portfolioScope = computed(() =>
    getPortfolioScope(
      campaigns.value,
      filteredCampaigns.value,
      [...portfolioChannels.value.values()].map(channel => channel.name),
      selectedChannelsIds.value.map(
        id => portfolioChannels.value.get(id)?.name ?? id,
      ),
    ),
  )

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

  function onPendingSelection(id: string | null): void {
    if (id) {
      activePortfolioId.value = id
      selectedChannelsIds.value = []
    }
  }

  function onPortfolioEvicted(id: string | null): void {
    if (id && activePortfolioId.value === id) {
      activePortfolioId.value = null
      selectedChannelsIds.value = []
    }
  }

  // ── Watchers ──────────────────────────────────────────────────────────

  watch(
    () => portfolioData.pendingSelectionId,
    onPendingSelection,
    { immediate: true },
  )

  watch(
    () => portfolioData.lastEvictedId,
    onPortfolioEvicted,
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
