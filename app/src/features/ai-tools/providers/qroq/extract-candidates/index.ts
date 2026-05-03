import type { AiModelCandidate } from '../../types'
import type { GroqModel } from '../types'
import { getAllowedCandidates } from './allowed-candidates'
import { getSortedCandidates } from './sort-candidates'

function toAiModelCandidate(m: GroqModel): AiModelCandidate {
  return {
    id: m.id,
    provider: 'groq',
    contextWindow: m.context_window,
    maxOutputTokens: m.max_completion_tokens,
    supportsTextGeneration: true,
  }
}

export function extractCandidates(models: GroqModel[]): AiModelCandidate[] {
  const allowed = getAllowedCandidates(models)
  const sorted = getSortedCandidates(allowed)
  return sorted.map(toAiModelCandidate)
}
