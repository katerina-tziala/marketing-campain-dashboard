import type { AiProvider, AiAnalysisErrorCode } from '../types'
import { parseJsonResponse } from '../ai-connection/shared'

const TOKEN_LIMIT_PATTERNS = [
  'resource_exhausted',
  'rate_limit',
  'quota',
  'tokens',
  'too many requests',
]

function isTokenLimitError(status: number, body: string): boolean {
  if (status === 429) return true
  const lower = body.toLowerCase()
  return TOKEN_LIMIT_PATTERNS.some((p) => lower.includes(p))
}

function errorCodeFromStatus(status: number): AiAnalysisErrorCode {
  if (status === 429) return 'token-limit'
  if (status >= 500) return 'server-error'
  return 'unknown'
}

function errorCodeFromException(e: unknown): AiAnalysisErrorCode {
  if (e instanceof DOMException && e.name === 'AbortError') return 'timeout'
  if (e instanceof TypeError) return 'network'
  return 'unknown'
}

async function callGemini(
  apiKey: string,
  model: string,
  prompt: string,
  signal: AbortSignal,
): Promise<string> {
  const modelId = model.replace(/^models\//, '')
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0 },
      }),
      signal,
    },
  )

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    if (isTokenLimitError(res.status, body)) throw new Error('token-limit')
    throw new Error(errorCodeFromStatus(res.status))
  }

  const body = await res.json()
  return body.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

async function callGroq(
  apiKey: string,
  model: string,
  prompt: string,
  signal: AbortSignal,
): Promise<string> {
  const res = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
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
      signal,
    },
  )

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    if (isTokenLimitError(res.status, body)) throw new Error('token-limit')
    throw new Error(errorCodeFromStatus(res.status))
  }

  const body = await res.json()
  return body.choices?.[0]?.message?.content ?? ''
}

export async function callProviderForAnalysis<T>(
  provider: AiProvider,
  apiKey: string,
  model: string,
  prompt: string,
  signal: AbortSignal,
): Promise<T> {
  try {
    const raw = provider === 'gemini'
      ? await callGemini(apiKey, model, prompt, signal)
      : await callGroq(apiKey, model, prompt, signal)

    return parseJsonResponse(raw) as T
  } catch (e) {
    if (e instanceof Error && (
      e.message === 'token-limit'
      || e.message === 'server-error'
      || e.message === 'network'
      || e.message === 'timeout'
    )) {
      throw e
    }

    if (signal.aborted) {
      throw new Error('timeout')
    }

    const code = errorCodeFromException(e)
    throw new Error(code)
  }
}
