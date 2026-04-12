import type { GroqModel, GroqModelsResponse, AiModel, RankedModelsResponse } from '../types'
import { errorCodeFromStatus, parseJsonResponse } from './shared'
import { generateModelEvaluationPrompt } from '../prompts'
import { rankModels } from '../utils/rankModels'
import { PROVIDER_LABELS } from '../types'

function filterModels(models: GroqModel[]): GroqModel[] {
  const banned = [
    "whisper",
    "audio",
    "guard",
    "safeguard",
    "moderation",
    "orpheus", // guarded
  ]

  return models.filter((m) => {
    const id = (m.id || '').toLowerCase()

    return !banned.some((x) => id.includes(x))
  })
}

function getOptimalModel(models: GroqModel[]): string {
  const sorted = [...models].sort((a, b) => b.created - a.created)
  return sorted[0]?.id ?? ''
}

async function fetchModels(apiKey: string): Promise<GroqModel[]> {
  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) throw new Error(errorCodeFromStatus(res.status))
  const body: GroqModelsResponse = await res.json()
  return filterModels(body.data)
}

async function callGroq(apiKey: string, prompt: string, model: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    }),
  })
  if (!res.ok) {
    throw new Error(`Groq API error (${res.status})`)
  }
  const body = await res.json()
  return body.choices?.[0]?.message?.content ?? ''
}

function buildFallbackModel(modelId: string): AiModel {
  const displayName = modelId.replace(/-/g, ' ')
  return {
    id: modelId,
    model: modelId,
    display_name: displayName,
    provider: PROVIDER_LABELS.groq,
    strength: 'general-purpose',
    strength_score: 7,
    reason: 'Selected as the optimal available model',
    limitReached: false,
  }
}

export async function connectGroq(apiKey: string): Promise<AiModel[]> {
  const models = await fetchModels(apiKey)

  if (models.length === 0) {
    throw new Error('no-models')
  }

  const optimal = getOptimalModel(models)

  try {
    console.log('filtered models', models);
    
    const prompt = generateModelEvaluationPrompt(models)

    console.log(prompt);
    
    const raw = await callGroq(apiKey, prompt, optimal)
    const parsed = parseJsonResponse(raw) as RankedModelsResponse
    return rankModels(parsed, buildFallbackModel(optimal))
  } catch {
    // AI selection failed — fall back to optimal model
  }

  return [buildFallbackModel(optimal)]
}

