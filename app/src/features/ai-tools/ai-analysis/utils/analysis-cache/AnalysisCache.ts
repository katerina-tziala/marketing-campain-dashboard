import type { AnalysisResponse } from '../../types'
import { getCacheKey } from './cache-key'

export type CacheEntry = {
  response: AnalysisResponse
  timestamp: number
  cooldownUntil: number
}

export class AnalysisCache {
  private readonly store = new Map<string, Map<string, CacheEntry>>()
  private lastVisibleCacheKey: string | null = null

  get(portfolioId: string, channelIds: string[], provider: string): CacheEntry | undefined {
    const key = getCacheKey(channelIds, provider)
    const entry = this.store.get(portfolioId)?.get(key)
    if (entry) this.lastVisibleCacheKey = key
    return entry
  }

  getLastVisible(portfolioId: string): CacheEntry | null {
    if (!this.lastVisibleCacheKey) return null
    return this.store.get(portfolioId)?.get(this.lastVisibleCacheKey) ?? null
  }

  set(portfolioId: string, channelIds: string[], provider: string, entry: CacheEntry): void {
    const key = getCacheKey(channelIds, provider)
    let portfolioCache = this.store.get(portfolioId)
    if (!portfolioCache) {
      portfolioCache = new Map()
      this.store.set(portfolioId, portfolioCache)
    }
    portfolioCache.set(key, entry)
    this.lastVisibleCacheKey = key
  }

  deletePortfolio(portfolioId: string): void {
    this.store.delete(portfolioId)
  }

  clear(): void {
    this.store.clear()
    this.lastVisibleCacheKey = null
  }
}
