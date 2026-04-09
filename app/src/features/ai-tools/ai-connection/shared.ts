import type { AiConnectionErrorCode } from '../types'

const CONNECTION_TIMEOUT_MS = 10_000

export async function fetchWithTimeout(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT_MS)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

export function errorCodeFromStatus(status: number): AiConnectionErrorCode {
  if (status === 400 || status === 401 || status === 403) return 'invalid-key'
  if (status === 429) return 'rate-limit'
  if (status >= 500) return 'server-error'
  return 'unknown'
}

export function errorCodeFromException(e: unknown): AiConnectionErrorCode {
  if (e instanceof DOMException && e.name === 'AbortError') return 'timeout'
  if (e instanceof TypeError) return 'network'
  return 'unknown'
}

export function parseJsonResponse(text: string): unknown {
  const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim()
  return JSON.parse(cleaned)
}
