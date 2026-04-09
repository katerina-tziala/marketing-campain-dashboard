import type { GeminiModel, GeminiModelsResponse, AiConnectionErrorCode } from '../types'
import { fetchWithTimeout, errorCodeFromStatus } from './shared'

function filterGeminiModels(models: GeminiModel[]): GeminiModel[] {
  const banned = [
    'embedding',
    'image',
    'audio',
    'tts',
    'veo',
    'imagen',
    'lyria',
    'robotics',
  ]

  return models.filter((m) => {
    const name = (m.name || '').toLowerCase()

    return (
      m.supportedGenerationMethods?.includes('generateContent') &&
      !banned.some((x) => name.includes(x))
    )
  })
}

export function getOptimalGeminiModel(models: GeminiModel[]): string {
  const sorted = [...models].sort((a, b) => {
    const aFlash = a.name.toLowerCase().includes('flash') ? 1 : 0
    const bFlash = b.name.toLowerCase().includes('flash') ? 1 : 0
    if (bFlash !== aFlash) return bFlash - aFlash
    return b.version.localeCompare(a.version)
  })
  return sorted[0]?.name?.replace(/^models\//, '') ?? ''
}

export async function connectGemini(apiKey: string): Promise<GeminiModel[] | AiConnectionErrorCode> {
  const res = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
  )
  if (!res.ok) return errorCodeFromStatus(res.status)
  const body: GeminiModelsResponse = await res.json()
  return filterGeminiModels(body.models)
}

export async function callGemini(apiKey: string, prompt: string, model: string): Promise<string> {
  const res = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    },
  )
  if (!res.ok) {
    throw new Error(`Gemini API error (${res.status})`)
  }
  const body = await res.json()
  return body.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}
