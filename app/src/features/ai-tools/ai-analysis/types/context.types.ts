import type { PortfolioAnalysis } from '@/shared/portfolio-analysis'
import type { AiModel } from '../../providers'
import type { AiAnalysisType, AiProviderType } from '../../types'

export type BusinessContext = {
  period?: string
  industry?: string
  goal?: string
  businessStage?: string
  attributionModel?: string
  riskTolerance?: string
  scalingTolerance?: string
  constraints?: string[]
}

export type AnalysisContext = {
  type: AiAnalysisType
  analysis: PortfolioAnalysis
  isFiltered: boolean
  businessContext?: BusinessContext
}

export interface AIProviderState {
  provider: AiProviderType
  apiKey: string
  selectedModel: AiModel
}

export interface PortfolioContext {
  portfolioTitle: string
  channelCount: number
  campaignCount: number
  filtersActive: boolean
}

export interface AiAnalysisContext extends PortfolioContext {
  portfolioId: string
  selectedChannelIds: string[]
  portfolioAnalysis: PortfolioAnalysis
}
