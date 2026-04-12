import type { AiProvider, AiConnectionError, AiConnectionErrorCode, AiModel } from '../types'
import { errorCodeFromException } from './shared'
import { connectGemini } from './gemini'
import { connectGroq } from './groq'

const ERROR_CODES: Set<string> = new Set<AiConnectionErrorCode>([
  'invalid-key', 'network', 'timeout', 'rate-limit', 'server-error', 'no-models', 'unknown',
])

export async function connectProvider(
  provider: AiProvider,
  apiKey: string,
): Promise<AiModel[] | AiConnectionError> {
  try {
    return provider === 'gemini'
      ? await connectGemini(apiKey)
      : await connectGroq(apiKey)
  } catch (e) {
    const message = e instanceof Error ? e.message : ''
    const code = ERROR_CODES.has(message) ? message as AiConnectionErrorCode : errorCodeFromException(e)
    return { code, provider }
  }
}
