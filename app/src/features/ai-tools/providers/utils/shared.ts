import type { AiModel } from "../../types"

export function buildFallbackModel(modelId: string, provider: string): AiModel {
  const displayName = modelId.replace(/-/g, ' ')
  return {
    id: modelId,
    model: modelId,
    display_name: displayName,
    provider: provider,
    strength: 'general purpose',
    strength_score: 7,
    reason: 'Selected as the optimal available model',
    limitReached: false,
  }
}

export function rankModels(
  models: AiModel[],
  fallback: AiModel,
): AiModel[] {
  const selected = models ?? [];

  const optimalInList = selected.find(
    (model) => model.model === fallback.id || model.id === fallback.id,
  )

  if (!optimalInList) {
   selected.push(fallback)
  } 
 
  const sorted = [...selected]
    .filter((m) => m.strength_score >= 6)
    .sort((a, b) => b.strength_score - a.strength_score)
    .map((m) => ({ ...m, limitReached: false }))

  return sorted
}

export function parseJsonResponse<T>(text: string): T {
  const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim()
  return JSON.parse(cleaned)
}
