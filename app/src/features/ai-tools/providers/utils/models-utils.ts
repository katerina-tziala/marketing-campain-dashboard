import type { AiModel } from '../types'
 
export function getModelById(models: AiModel[], modelId: string): AiModel | undefined {
  return models.find((model) => model.id === modelId)
}

export function getNextAvailableMode(models: AiModel[]): AiModel | undefined {
  return models.find((model) => !model.limitReached)
}

export function getAllModelsLimitReached(models: AiModel[]): boolean {
  return models.length > 0 && models.every((model) => model.limitReached)
}