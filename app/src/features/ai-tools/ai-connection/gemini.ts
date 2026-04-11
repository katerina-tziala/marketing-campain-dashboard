import type { GeminiModel, GeminiModelsResponse, AiModel, RankedModelsResponse } from '../types'
import { errorCodeFromStatus, parseJsonResponse } from './shared'
import { generateModelEvaluationPrompt } from '../prompts'
import { rankModels } from '../utils/rankModels'
import { PROVIDER_LABELS } from '../types'

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
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
  )
  if (!res.ok) throw new Error(errorCodeFromStatus(res.status))
  const body: GeminiModelsResponse = await res.json()
  return filterModels(body.models)
}

async function callGemini(apiKey: string, prompt: string, model: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0 },
      }),
    },
  )
  if (!res.ok) {
    throw new Error(`Gemini API error (${res.status})`)
  }
  const body = await res.json()
  return body.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

function buildFallbackModel(modelId: string): AiModel {
  const displayName = modelId.replace(/^models\//, '').replace(/-/g, ' ')
  return {
    id: modelId,
    model: modelId,
    display_name: displayName,
    provider: PROVIDER_LABELS.gemini,
    strength: 'general-purpose',
    strength_score: 7,
    reason: 'Selected as the optimal available model',
    limitReached: false,
  }
}

export async function connectGemini(apiKey: string): Promise<AiModel[]> {
  const models = await fetchModels(apiKey)

  if (models.length === 0) {
    throw new Error('no-models')
  }

  const optimal = getOptimalModel(models)

  try {
     console.log('filtered models', models);
    
    const prompt = generateModelEvaluationPrompt(models)
      console.log(prompt);
    const raw = await callGemini(apiKey, prompt, optimal)
    const parsed = parseJsonResponse(raw) as RankedModelsResponse
    return rankModels(parsed,  buildFallbackModel(optimal))
  } catch {
    // AI selection failed — fall back to optimal model
  }

  return [buildFallbackModel(optimal)]
}

