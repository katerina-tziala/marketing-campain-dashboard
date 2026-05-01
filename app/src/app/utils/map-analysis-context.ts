import type { AiAnalysisContext } from '@/features/ai-tools/ai-analysis/stores'
import type { CampaignPerformanceStore } from '@/features/campaign-performance/stores'

export function mapAnalysisContext(
  campaignPerformance: ReturnType<CampaignPerformanceStore>,
): AiAnalysisContext {
  return {
    portfolioId: campaignPerformance.activePortfolioId,
    portfolioTitle: campaignPerformance.title,
    selectedChannelIds: [...campaignPerformance.selectedChannelsIds],
    channelCount:
      campaignPerformance.selectedChannelsIds.length > 0
        ? campaignPerformance.selectedChannelsIds.length
        : campaignPerformance.portfolioChannels.size,
    campaignCount: campaignPerformance.filteredCampaigns.length,
    filtersActive: campaignPerformance.selectedChannelsIds.length > 0,
    portfolioAnalysis: campaignPerformance.portfolioAnalysis,
  }
}
