import type { GroqModel, GroqModelsResponse, AiModel, ModelSelectionResponse } from '../types'
import { fetchWithTimeout, errorCodeFromStatus, parseJsonResponse } from './shared'
import { generateModelSelectionPrompt } from '../prompts'

function filterModels(models: GroqModel[]): GroqModel[] {
  const banned = [
    "whisper",
    "audio",
    "guard",
    "safeguard",
    "moderation",
    "orpheus",
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
  const res = await fetchWithTimeout('https://api.groq.com/openai/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) throw new Error(errorCodeFromStatus(res.status))
  const body: GroqModelsResponse = await res.json()
  return filterModels(body.data)
}

async function callGroq(apiKey: string, prompt: string, model: string): Promise<string> {
  const res = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  })
  if (!res.ok) {
    throw new Error(`Groq API error (${res.status})`)
  }
  const body = await res.json()
  return body.choices?.[0]?.message?.content ?? ''
}

export async function connectGroq(apiKey: string): Promise<AiModel[]> {
  const models = await fetchModels(apiKey)

  if (models.length === 0) {
    throw new Error('no-models')
  }

  const prompt = generateModelSelectionPrompt(models)
  const optimal = getOptimalModel(models)
  const raw = await callGroq(apiKey, prompt, optimal)
  const parsed = parseJsonResponse(raw) as ModelSelectionResponse
  const selected = parsed.selected_models ?? []

  if (selected.length === 0) {
    throw new Error('no-models')
  }

  return selected
}

