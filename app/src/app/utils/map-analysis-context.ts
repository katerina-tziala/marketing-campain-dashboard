import type { AiAnalysisRequestContext } from '@/features/ai-tools/ai-analysis/types'
import type { CampaignPerformance, Channel } from '@/shared/data'
import type { BusinessContext, PortfolioAnalysis } from '@/shared/portfolio'

type DashboardAnalysisContext = Omit<AiAnalysisRequestContext, 'portfolioId' | 'businessContext'> & {
  portfolioId: string | null
  businessContext: BusinessContext | null
}

interface CampaignPerformanceContextSource {
  activePortfolioId: string | null
  title: string
  selectedChannelsIds: string[]
  portfolioChannels: Map<string, Channel>
  filteredCampaigns: CampaignPerformance[]
  portfolioAnalysis: PortfolioAnalysis
  businessContext: BusinessContext | null
}

export function mapAnalysisContext(
  campaignPerformance: CampaignPerformanceContextSource,
): DashboardAnalysisContext {
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
    businessContext: campaignPerformance.businessContext,
  }
}
