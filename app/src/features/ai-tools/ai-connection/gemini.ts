import type { GeminiModel, GeminiModelsResponse, AiModel, ModelSelectionResponse } from '../types'
import { fetchWithTimeout, errorCodeFromStatus, parseJsonResponse } from './shared'
import { generateModelSelectionPrompt } from '../prompts'

function filterModels(models: GeminiModel[]): GeminiModel[] {
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

function getOptimalModel(models: GeminiModel[]): string {
  const sorted = [...models].sort((a, b) => {
    const aFlash = a.name.toLowerCase().includes('flash') ? 1 : 0
    const bFlash = b.name.toLowerCase().includes('flash') ? 1 : 0
    if (bFlash !== aFlash) return bFlash - aFlash
    return b.version.localeCompare(a.version)
  })
  return sorted[0]?.name?.replace(/^models\//, '') ?? ''
}

async function fetchModels(apiKey: string): Promise<GeminiModel[]> {
  const res = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
  )
  if (!res.ok) throw new Error(errorCodeFromStatus(res.status))
  const body: GeminiModelsResponse = await res.json()
  return filterModels(body.models)
}

async function callGemini(apiKey: string, prompt: string, model: string): Promise<string> {
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

export async function connectGemini(apiKey: string): Promise<AiModel[]> {
  const models = await fetchModels(apiKey)

  if (models.length === 0) {
    throw new Error('no-models')
  }

  const prompt = generateModelSelectionPrompt(models)
  const optimal = getOptimalModel(models)
  const raw = await callGemini(apiKey, prompt, optimal)
  const parsed = parseJsonResponse(raw) as ModelSelectionResponse
  const selected = parsed.selected_models ?? []

  if (selected.length === 0) {
    throw new Error('no-models')
  }

  return selected
}

