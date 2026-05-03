import type { GeminiModel } from '../types'

const BANNED_MODEL_TERMS = [
  'embedding',
  'image',
  'audio',
  'tts',
  'veo',
  'imagen',
  'lyria',
  'robotics',
]

function supportsTextGeneration(m: GeminiModel): boolean {
  return m.supportedGenerationMethods?.includes('generateContent') ?? false
}

export function getAllowedCandidates(models: GeminiModel[]): GeminiModel[] {
  return models.filter((m) => {
    const id = m.name.toLowerCase()
    return supportsTextGeneration(m) && !BANNED_MODEL_TERMS.some((term) => id.includes(term))
  })
}
