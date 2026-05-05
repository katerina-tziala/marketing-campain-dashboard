import type { BusinessContext, PortfolioAnalysis, PortfolioSummary } from '@/shared/portfolio';

import type { AiModel } from '../../providers';
import type { AiAnalysisType, AiProviderType } from '../../types';

export interface AiAnalysisContext {
  analysis: PortfolioAnalysis;
  businessContext: BusinessContext;
  portfolioBenchmark?: PortfolioSummary;
}

export type AnalysisPromptContext = {
  type: AiAnalysisType;
  context: AiAnalysisContext;
};

export interface AnalysisProviderState {
  provider: AiProviderType;
  apiKey: string;
  selectedModel: AiModel;
}

export interface AnalysisPortfolioContext {
  portfolioTitle: string;
  channelCount: number;
  campaignCount: number;
  filtersActive: boolean;
  businessContext: BusinessContext | null;
}

export interface AiAnalysisRequestContext extends AnalysisPortfolioContext {
  portfolioId: string;
  selectedChannelIds: string[];
  portfolioAnalysis: PortfolioAnalysis;
  portfolioBenchmark?: PortfolioSummary;
  businessContext: BusinessContext;
}
