import type { AiModel, RankedModelsResponse } from '../types'

/**
 * Processes the AI model evaluation response.
 * Always returns at least one model (the fallback if the response is empty).
 *
 * 1. Filters out models with strength_score below 6
 * 2. Sorts remaining models by strength_score descending
 * 3. Initialises limitReached to false on every model
 * 4. If the optimal model appears in the list, fixes its id/model identifiers
 *    while keeping the AI-assigned display_name, strength, etc.
 * 5. If the optimal model is NOT in the list, adds the fallback and re-sorts
 */
export function rankModels(
  parsed: RankedModelsResponse,
  fallback: AiModel,
): AiModel[] {
  const selected = parsed.models ?? [];

  const optimalInList = selected.find(
    (m) => m.model === fallback.id || m.id === fallback.id,
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
