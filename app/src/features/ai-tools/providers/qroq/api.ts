 import type { GroqModel, GroqModelsResponse } from './types'
import {
  assertChatResponseOk,
  assertResponseOk,
  normalizeConnectionError,
} from '../utils'

const API_BASE_URL = 'https://api.groq.com/openai/v1'

export async function fetchGroqModels(
  apiKey: string,
  signal?: AbortSignal,
): Promise<GroqModel[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal,
    })

    await assertResponseOk(response)

    const json: GroqModelsResponse = await response.json()
    return json.data
  } catch (error) {
    throw normalizeConnectionError(error)
  }
}

export async function requestGroqChatCompletion(
  apiKey: string,
  model: string,
  prompt: string,
  signal?: AbortSignal,
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
      signal,
    })

    await assertChatResponseOk(response)

    const json = await response.json()
    return json.choices?.[0]?.message?.content ?? ''
  } catch (error) {
    throw normalizeConnectionError(error)
  }
}