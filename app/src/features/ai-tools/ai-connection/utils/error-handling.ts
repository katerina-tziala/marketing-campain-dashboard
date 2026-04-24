import type { AiErrorCode, AiProviderType } from '../../types'
import { PROVIDER_LABELS } from '../../providers/providers-meta'
import { normalizeConnectionError } from '../../providers/utils'

const ERROR_CODES = new Set<AiErrorCode>([
  'invalid-key', 'network', 'timeout', 'rate-limit', 'token-limit', 'server-error', 'no-models', 'invalid-response', 'unknown',
])

export const ERROR_MESSAGES: Record<AiErrorCode, (provider: AiProviderType) => string> = {
  'invalid-key': (p) => `Invalid API key for ${PROVIDER_LABELS[p]}`,
  'network': () => 'Could not reach the server. Check your internet connection.',
  'timeout': () => 'Connection timed out. Check your network and try again.',
  'rate-limit': (p) => `${PROVIDER_LABELS[p]} rate limit reached. Please wait a moment and try again.`,
  'server-error': (p) => `${PROVIDER_LABELS[p]} is temporarily unavailable. Try again later.`,
  'no-models': (p) => `No suitable models found for ${PROVIDER_LABELS[p]}.`,
  'unknown': (p) => `Connection to ${PROVIDER_LABELS[p]} failed`,
  'token-limit': () => 'The provider’s token limit was exceeded. Try again.',
  'invalid-response': () => 'The provider returned an unexpected response. Try again, and if the problem persists, try a different provider.',
  'parse-error': () => 'The provider returned an unexpected response. Try again, and if the problem persists, try a different provider.',
}

export const ERROR_HINTS: Record<AiErrorCode, string> = {
  'invalid-key': 'Double-check that you copied the full key and that it has not been revoked',
  'network': 'Make sure you are connected to the internet and try again',
  'timeout': 'The server took too long to respond. Try again in a moment.',
  'rate-limit': 'You have made too many requests. Wait a minute before trying again.',
  'server-error': 'This is a problem on the provider’s side, not yours. Try again later.',
  'no-models': 'The provider returned no models compatible with this application. Try a different provider.',
  'unknown': 'If this persists, try a different provider or check the provider’s status page',
  'token-limit': 'The provider has limits on how many tokens can be processed in a given time frame. Wait a moment and try again.',
  'invalid-response': 'The provider returned an unexpected response. Try again, and if the problem persists, try a different provider.',
  'parse-error': 'The provider returned an unexpected response. Try again, and if the problem persists, try a different provider.',
}


export function getErrorCode(error: unknown): AiErrorCode {
  const normalized = normalizeConnectionError(error)
  const code = ERROR_CODES.has(normalized.message as AiErrorCode)
    ? (normalized.message as AiErrorCode)
    : 'unknown'
  return code
}
