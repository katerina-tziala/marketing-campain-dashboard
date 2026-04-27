import type { AiConnectionErrorCode, AiProviderType } from '@/features/ai-tools/types'
import { PROVIDER_LABELS } from '@/features/ai-tools/providers/utils/providers-meta'
import { normalizeConnectionError } from '@/features/ai-tools/providers/utils'

type ConnectionErrorEntry = {
  message: (provider: AiProviderType) => string
  hint: string
}

export const CONNECTION_ERRORS: Record<AiConnectionErrorCode, ConnectionErrorEntry> = {
  'invalid-key': {
    message: (p) => `Your ${PROVIDER_LABELS[p]} API key doesn't seem to be working`,
    hint: "Make sure you copied the full key and that it hasn't expired or been revoked.",
  },
  'network': {
    message: () => "We couldn't reach the server",
    hint: 'Check your internet connection and try again',
  },
  'timeout': {
    message: () => 'The connection took too long',
    hint: 'This can happen on slow connections. Try again in a moment',
  },
  'rate-limit': {
    message: (p) => `Too many requests to ${PROVIDER_LABELS[p]} in a short time`,
    hint: 'Wait a minute or two, then try again',
  },
  'server-error': {
    message: (p) => `${PROVIDER_LABELS[p]} is having trouble right now`,
    hint: "This is a temporary issue on the provider's side. Try again in a few minutes",
  },
  'no-models': {
    message: (p) => `No compatible AI models were found for ${PROVIDER_LABELS[p]}`,
    hint: 'Try connecting with a different provider',
  },
  'token-limit': {
    message: () => "You've reached your usage limit for this session",
    hint: 'Wait a while before trying again, or switch to a different provider',
  },
  'invalid-response': {
    message: () => 'Something unexpected came back from the provider',
    hint: 'Please try again. If it keeps happening, switch to a different provider',
  },
  'parse-error': {
    message: () => 'Something unexpected came back from the provider',
    hint: 'Please try again. If it keeps happening, switch to a different provider',
  },
  'unknown': {
    message: (p) => `Something went wrong while connecting to ${PROVIDER_LABELS[p]}`,
    hint: 'Please try again. If the problem continues, switch to a different provider',
  },
}

export function getErrorCode(error: unknown): AiConnectionErrorCode {
  const normalized = normalizeConnectionError(error)
  const code = normalized.message
  return code in CONNECTION_ERRORS ? (code as AiConnectionErrorCode) : 'unknown'
}
