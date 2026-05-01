import type { AiProviderType } from '../types'
import type { AiModel } from "./types"
import { connectGemini } from "./gemini"
import { connectGroq } from "./qroq"

const CONNECTORS: Record<AiProviderType, (apiKey: string) => Promise<AiModel[]>> = {
  gemini: connectGemini,
  groq: connectGroq,
}

function byStrengthDesc(a: AiModel, b: AiModel): number {
  return b.strengthScore - a.strengthScore
}

function withLimitReset(m: AiModel): AiModel {
  return { ...m, limitReached: false }
}

function rankModels(models: AiModel[]): AiModel[] {
  const ranked = models
    .filter((m) => m.strengthScore >= 6)
    .sort(byStrengthDesc)
    .map(withLimitReset)
  if (ranked.length === 0) throw new Error('no-models')
  return ranked
}

export async function connectProvider(
  provider: AiProviderType,
  apiKey: string,
): Promise<AiModel[]> {
  return rankModels(await CONNECTORS[provider](apiKey))
}
