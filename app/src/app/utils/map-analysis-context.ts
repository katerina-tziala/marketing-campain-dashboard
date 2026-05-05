import type { AiAnalysisRequestContext } from '@/features/ai-tools/ai-analysis/types';
import type { CampaignPerformance, Channel } from '@/shared/data';
import type { BusinessContext, PortfolioAnalysis, PortfolioSummary } from '@/shared/portfolio';

type DashboardAnalysisContext = Omit<
  AiAnalysisRequestContext,
  'portfolioId' | 'businessContext'
> & {
  portfolioId: string | null;
  businessContext: BusinessContext | null;
};

interface CampaignPerformanceContextSource {
  activePortfolioId: string | null;
  title: string;
  selectedChannelsIds: string[];
  portfolioChannels: Map<string, Channel>;
  filteredCampaigns: CampaignPerformance[];
  portfolioAnalysis: PortfolioAnalysis;
  portfolioBenchmark: PortfolioSummary | null;
  businessContext: BusinessContext | null;
}

export function mapAnalysisContext(
  campaignPerformance: CampaignPerformanceContextSource,
): DashboardAnalysisContext {
  const filtersActive = campaignPerformance.selectedChannelsIds.length > 0;

  return {
    portfolioId: campaignPerformance.activePortfolioId,
    portfolioTitle: campaignPerformance.title,
    selectedChannelIds: [...campaignPerformance.selectedChannelsIds],
    channelCount: filtersActive
      ? campaignPerformance.selectedChannelsIds.length
      : campaignPerformance.portfolioChannels.size,
    campaignCount: campaignPerformance.filteredCampaigns.length,
    filtersActive,
    portfolioAnalysis: campaignPerformance.portfolioAnalysis,
    portfolioBenchmark: filtersActive
      ? (campaignPerformance.portfolioBenchmark ?? undefined)
      : undefined,
    businessContext: campaignPerformance.businessContext,
  };
}
