import { assertResponseOk, normalizeConnectionError, assertChatResponseOk } from '@/features/ai-tools/providers/utils'
import type { GeminiModel, GeminiModelsResponse } from "./types"

const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

export async function fetchGeminiModels(apiKey: string, signal?: AbortSignal): Promise<GeminiModel[]> {
    try {
        const response = await fetch(
            `${API_BASE_URL}?key=${encodeURIComponent(apiKey)}`,
            { signal },
        )

        await assertResponseOk(response)

        const json: GeminiModelsResponse = await response.json()
        return json.models
    } catch (error) {
        throw normalizeConnectionError(error)
    }
}
 
export async function requestGeminiChatCompletion(
  apiKey: string,
  model: string,
  prompt: string,
  signal?: AbortSignal,
): Promise<string> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0 },
        }),
        signal,
      },
    )

    await assertChatResponseOk(response)

    const json = await response.json()
    return json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  } catch (error) {
    throw normalizeConnectionError(error)
  }
}