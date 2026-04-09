import type { GroqModel, GroqModelsResponse, AiConnectionErrorCode } from '../types'
import { fetchWithTimeout, errorCodeFromStatus } from './shared'

function filterGroqModels(models: GroqModel[]): GroqModel[] {
  const banned = [
    "whisper",
    "audio",
    "guard",
    "safeguard",
    "moderation",
    "orpheus" // gated model
  ];

  return models.filter((m) => {
    const id = (m.id || '').toLowerCase()

    return !banned.some((x) => id.includes(x))
  })
}

export function getOptimalGroqModel(models: GroqModel[]): string {
  const sorted = [...models].sort((a, b) => b.created - a.created)
  return sorted[0]?.id ?? ''
}

export async function connectGroq(apiKey: string): Promise<GroqModel[] | AiConnectionErrorCode> {
  const res = await fetchWithTimeout('https://api.groq.com/openai/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) return errorCodeFromStatus(res.status)
  const body: GroqModelsResponse = await res.json()
  return filterGroqModels(body.data)
}

export async function callGroq(apiKey: string, prompt: string, model: string): Promise<string> {
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
