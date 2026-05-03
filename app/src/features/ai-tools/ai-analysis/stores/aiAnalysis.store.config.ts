import type { AsyncStatus } from '@/shared/types'
import type { AiAnalysisType, AiAnalysisError, AiAnalysisNotice } from '../../types'
import type { AnalysisResponse, AnalysisPortfolioContext } from '../types'

export const DEBOUNCE_MS = 350
export const COOLDOWN_MS = 5_000
export const MIN_OPTIMIZER_CAMPAIGNS = 2

export const OPTIMIZER_MIN_CAMPAIGNS_ERROR: AiAnalysisError = {
  code: 'min-campaigns',
}

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

export function createTabDisplay<T extends AnalysisResponse>(): TabDisplay<T> {
  return {
    status: DEFAULT_STATE.status,
    response: null,
    error: null,
    notice: null,
  }
}

export const ALL_TABS: AiAnalysisType[] = ['budgetOptimizer', 'executiveSummary']

export const DEFAULT_PORTFOLIO_CONTEXT: AnalysisPortfolioContext = {
  portfolioTitle: '',
  filtersActive: false,
  channelCount: 0,
  campaignCount: 0,
  businessContext: null,
}

export function getOtherAnalysisType(type: AiAnalysisType): AiAnalysisType {
  return type === 'budgetOptimizer' ? 'executiveSummary' : 'budgetOptimizer'
}
