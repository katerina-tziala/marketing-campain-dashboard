import type { PortfolioAnalysis } from '@/shared/portfolio'
import type { BusinessContext } from '@/shared/portfolio'
import type { AiModel } from '../../providers'
import type { AiAnalysisType, AiProviderType } from '../../types'

export type AnalysisPromptContext = {
  type: AiAnalysisType
  analysis: PortfolioAnalysis
  isFiltered: boolean
  businessContext: BusinessContext
}

export interface AnalysisProviderState {
  provider: AiProviderType
  apiKey: string
  selectedModel: AiModel
}

export interface AnalysisPortfolioContext {
  portfolioTitle: string
  channelCount: number
  campaignCount: number
  filtersActive: boolean
}

export interface AiAnalysisRequestContext extends AnalysisPortfolioContext {
  portfolioId: string
  selectedChannelIds: string[]
  portfolioAnalysis: PortfolioAnalysis
  businessContext: BusinessContext
}
