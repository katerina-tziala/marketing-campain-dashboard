import type { CacheEntry } from './analysis-cache';
import { AnalysisCache } from './analysis-cache';

export class TabState {
  controller: AbortController | null = null;
  debounceTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly cache = new AnalysisCache();

  cancelRequest(): void {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  reset(): void {
    this.cancelRequest();
  }

  getCached(portfolioId: string, channelIds: string[], provider: string): CacheEntry | undefined {
    return this.cache.get(portfolioId, channelIds, provider);
  }

  setCached(portfolioId: string, channelIds: string[], provider: string, entry: CacheEntry): void {
    this.cache.set(portfolioId, channelIds, provider, entry);
  }

  getLastVisible(portfolioId: string): CacheEntry | null {
    return this.cache.getLastVisible(portfolioId);
  }

  clearCache(): void {
    this.cache.clear();
  }

  deletePortfolioCache(portfolioId: string): void {
    this.cache.deletePortfolio(portfolioId);
  }
}
