import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Campaign, Channel } from '@/shared/types'
import type { PortfolioAnalysis } from '@/shared/portfolio-analysis'
import { computePortfolioAnalysis } from '@/shared/portfolio-analysis'
import { buildChannelMap } from '@/shared/utils'

export interface PortfolioEntry {
  id: string
  title: string
  channelMap: Map<string, Channel>
  fullAnalysis: PortfolioAnalysis
  uploadedAt: number
}

export const usePortfolioDataStore = defineStore('portfolioData', () => {
  const portfolios = ref<PortfolioEntry[]>([])
  const pendingSelectionId = ref<string | null>(null)
  const lastEvictedId = ref<string | null>(null)

  function getById(id: string): PortfolioEntry | undefined {
    return portfolios.value.find(p => p.id === id)
  }

  function buildEntry(campaigns: Campaign[], title: string): PortfolioEntry {
    const channelMap = buildChannelMap(campaigns)
    const channels = Array.from(channelMap.values())
    return {
      id: crypto.randomUUID(),
      title,
      channelMap,
      fullAnalysis: computePortfolioAnalysis(channels, []),
      uploadedAt: Date.now(),
    }
  }

  function addPortfolio(campaigns: Campaign[], title: string): void {
    const entry = buildEntry(campaigns, title)
    portfolios.value.push(entry)
    pendingSelectionId.value = entry.id
  }

  function replacePortfolio(campaigns: Campaign[], title: string): void {
    const entry = buildEntry(campaigns, title)
    portfolios.value.splice(0, portfolios.value.length, entry)
    pendingSelectionId.value = entry.id
  }

  function loadPortfolio(campaigns: Campaign[], title: string): void {
    if (portfolios.value.length > 0) replacePortfolio(campaigns, title)
    else addPortfolio(campaigns, title)
  }

  function deletePortfolio(id: string): void {
    const index = portfolios.value.findIndex(p => p.id === id)
    if (index !== -1) {
      portfolios.value.splice(index, 1)
      lastEvictedId.value = id
    }
  }

  return {
    portfolios,
    pendingSelectionId,
    lastEvictedId,
    // actions
    getById,
    addPortfolio,
    replacePortfolio,
    loadPortfolio,
    deletePortfolio,
  }
})
