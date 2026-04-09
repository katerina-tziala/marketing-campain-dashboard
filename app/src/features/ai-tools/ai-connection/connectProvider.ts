import type {
  AiProvider,
  AiConnectionError,
  AiConnectionErrorCode,
  GeminiModel,
  GeminiModelsResponse,
  GroqModel,
  GroqModelsResponse,
} from '../types'

const CONNECTION_TIMEOUT_MS = 10_000

async function fetchWithTimeout(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT_MS)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

function errorCodeFromStatus(status: number): AiConnectionErrorCode {
  if (status === 400 || status === 401 || status === 403) return 'invalid-key'
  if (status === 429) return 'rate-limit'
  if (status >= 500) return 'server-error'
  return 'unknown'
}

function errorCodeFromException(e: unknown): AiConnectionErrorCode {
  if (e instanceof DOMException && e.name === 'AbortError') return 'timeout'
  if (e instanceof TypeError) return 'network'
  return 'unknown'
}

async function connectGemini(apiKey: string): Promise<GeminiModel[] | AiConnectionErrorCode> {
  const res = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
  )
  if (!res.ok) return errorCodeFromStatus(res.status)
  const body: GeminiModelsResponse = await res.json()
  return body.models
}

async function connectGroq(apiKey: string): Promise<GroqModel[] | AiConnectionErrorCode> {
  const res = await fetchWithTimeout('https://api.groq.com/openai/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) return errorCodeFromStatus(res.status)
  const body: GroqModelsResponse = await res.json()
  return body.data
}

export async function connectProvider(
  provider: AiProvider,
  apiKey: string,
): Promise<GeminiModel[] | GroqModel[] | AiConnectionError> {
  try {
    const result = provider === 'gemini'
      ? await connectGemini(apiKey)
      : await connectGroq(apiKey)

    if (typeof result === 'string') {
      return { code: result, provider }
    }
    return result
  } catch (e) {
    return { code: errorCodeFromException(e), provider }
  }
}
