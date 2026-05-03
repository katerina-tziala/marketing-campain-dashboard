import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Portfolio, PortfolioInput } from './types'
import { buildChannelMap, computePortfolioAnalysis } from './analysis'

export const usePortfolioStore = defineStore('portfolio', () => {
  const portfolios = ref<Portfolio[]>([])
  const pendingSelectionId = ref<string | null>(null)
  const lastEvictedId = ref<string | null>(null)

  function getById(id: string): Portfolio | undefined {
    return portfolios.value.find(p => p.id === id)
  }

  function buildEntry(input: PortfolioInput): Portfolio {
    const channelMap = buildChannelMap(input.campaigns)
    const channels = Array.from(channelMap.values())
    return {
      id: crypto.randomUUID(),
      name: input.name,
      period: input.period,
      industry: input.industry,
      channelMap,
      analysis: computePortfolioAnalysis(channels),
      uploadedAt: Date.now(),
    }
  }

  function addPortfolio(input: PortfolioInput): void {
    const entry = buildEntry(input)
    portfolios.value.push(entry)
    pendingSelectionId.value = entry.id
  }

  function replacePortfolio(input: PortfolioInput): void {
    const entry = buildEntry(input)
    portfolios.value.splice(0, portfolios.value.length, entry)
    pendingSelectionId.value = entry.id
  }

  function loadPortfolio(input: PortfolioInput): void {
    if (portfolios.value.length > 0) replacePortfolio(input)
    else addPortfolio(input)
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
