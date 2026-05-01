import type { AsyncStatus } from '@/shared/types'
import type { AiAnalysisType, AiAnalysisError, AiAnalysisNotice } from '../../types'
import type { AnalysisResponse, PortfolioContext } from '../types'

export type TabDisplay<T extends AnalysisResponse = AnalysisResponse> = {
  status: AsyncStatus
  response: T | null
  error: AiAnalysisError | null
  notice: AiAnalysisNotice | null
}

export const DEFAULT_STATE: TabDisplay = {
  status: 'idle',
  response: null,
  error: null,
  notice: null,
}

export const ALL_TABS: AiAnalysisType[] = ['budgetOptimizer', 'executiveSummary']

export const DEFAULT_PORTFOLIO_CONTEXT: PortfolioContext = {
  portfolioTitle: '',
  filtersActive: false,
  channelCount: 0,
  campaignCount: 0,
}

export function getOtherAnalysisType(type: AiAnalysisType): AiAnalysisType {
  return type === 'budgetOptimizer' ? 'executiveSummary' : 'budgetOptimizer'
}
