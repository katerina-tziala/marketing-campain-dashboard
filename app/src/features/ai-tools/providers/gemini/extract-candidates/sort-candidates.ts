import type { GeminiModel } from '../types'
import { stabilityPenaltyByModelId } from '../../utils/stability-penalty-by-model-id'

function thinkingPriority(m: GeminiModel): number {
  return m.thinking ? 1 : 0
}

function byThinkingDesc(a: GeminiModel, b: GeminiModel): number {
  return thinkingPriority(b) - thinkingPriority(a)
}

function byContextWindowDesc(a: GeminiModel, b: GeminiModel): number {
  return b.inputTokenLimit - a.inputTokenLimit
}

function byOutputTokensDesc(a: GeminiModel, b: GeminiModel): number {
  return b.outputTokenLimit - a.outputTokenLimit
}

function byStabilityAsc(a: GeminiModel, b: GeminiModel): number {
  return stabilityPenaltyByModelId(a.name) - stabilityPenaltyByModelId(b.name)
}

function byVersionDesc(a: GeminiModel, b: GeminiModel): number {
  return b.version.localeCompare(a.version)
}

export function getSortedCandidates(models: GeminiModel[]): GeminiModel[] {
  return [...models].sort((a, b) =>
    byThinkingDesc(a, b) ||
    byContextWindowDesc(a, b) ||
    byOutputTokensDesc(a, b) ||
    byStabilityAsc(a, b) ||
    byVersionDesc(a, b)
  )
}
