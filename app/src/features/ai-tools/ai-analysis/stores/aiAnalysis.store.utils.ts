import type { AsyncStatus } from '@/shared/types'
import type { AiAnalysisType, AiAnalysisError, AiAnalysisNotice } from '../../types'
import type { AnalysisResponse } from '../types'

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

export function createTabState() {
  return {
    firstAnalyzeCompleted: false,
    controller: null as AbortController | null,
    debounceTimer: null as ReturnType<typeof setTimeout> | null,
  }
}

export function getOtherAnalysisType(type: AiAnalysisType): AiAnalysisType {
  return type === 'budgetOptimizer' ? 'executiveSummary' : 'budgetOptimizer'
}
