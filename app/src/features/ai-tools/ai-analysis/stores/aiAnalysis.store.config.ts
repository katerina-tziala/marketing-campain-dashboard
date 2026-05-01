import type { AiAnalysisError } from '../../types'

export const DEBOUNCE_MS = 350
export const COOLDOWN_MS = 5_000
export const MIN_OPTIMIZER_CAMPAIGNS = 2

export const OPTIMIZER_MIN_CAMPAIGNS_ERROR: AiAnalysisError = {
  code: 'min-campaigns',
}
