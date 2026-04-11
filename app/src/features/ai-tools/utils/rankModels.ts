import type { AiModel, ModelSelectionResponse } from '../types'

/**
 * Processes the AI model evaluation response.
 * Always returns at least one model (the fallback if the response is empty).
 *
 * 1. Sorts models by strength_score descending
 * 2. Initialises limitReached to false on every model
 * 3. If the optimal model appears in the list, fixes its id/model identifiers
 *    while keeping the AI-assigned display_name, strength, etc.
 * 4. If the optimal model is NOT in the list, adds the fallback and re-sorts
 */
export function rankModels(
  parsed: ModelSelectionResponse, 
  fallback: AiModel,
): AiModel[] {
  const selected = parsed.selected_models ?? [];

  const optimalInList = selected.find(
    (m) => m.model === fallback.id || m.id === fallback.id,
  )

  if (!optimalInList) {
   selected.push(fallback)
  } 
 
  const sorted = [...selected]
    .sort((a, b) => b.strength_score - a.strength_score)
    .map((m) => ({ ...m, limitReached: false }))

  return sorted
}
