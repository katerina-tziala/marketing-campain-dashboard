import type { AiProviderType, AiConnectionError, AiConnectionErrorCode, AiModel } from '../types'
import { connectGemini, connectGroq } from '../providers'
import { normalizeConnectionError } from '../providers/utils'

const ERROR_CODES: Set<string> = new Set<AiConnectionErrorCode>([
  'invalid-key', 'network', 'timeout', 'rate-limit', 'token-limit', 'server-error', 'no-models', 'unknown',
])

const CONNECTORS: Record<AiProviderType, (apiKey: string) => Promise<AiModel[]>> = {
  gemini: connectGemini,
  groq: connectGroq,
}

export async function connectProvider(
  provider: AiProviderType,
  apiKey: string,
): Promise<AiModel[] | AiConnectionError> {
  try {
    return await CONNECTORS[provider](apiKey)
  } catch (error) {
    const normalized = normalizeConnectionError(error)
    const code = ERROR_CODES.has(normalized.message)
      ? (normalized.message as AiConnectionErrorCode)
      : 'unknown'

    return { code, provider }
  }
}
