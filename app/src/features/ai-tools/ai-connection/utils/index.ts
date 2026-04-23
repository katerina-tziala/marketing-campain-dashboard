import type { AiProviderType, AiConnectionErrorCode } from '../../types'

export const PROVIDER_LABELS: Record<AiProviderType, string> = {
  gemini: 'Google Gemini',
  groq: 'Groq',
}

export const PROVIDER_HELP: Record<AiProviderType, { title: string; steps: string[]; note?: string }> = {
  groq: {
    title: "How to get your Groq API key",
    steps: [
      "Go to the Groq Console and sign in with your account.",
      "Open API Keys from the left sidebar.",
      "Click Create API Key.",
      "Copy the key and paste it into the field below."
    ],
    note: "Some models may require your organization admin to accept additional terms before use."
  },
  gemini: {
    title: "How to get your Gemini API key",
    steps: [
      "Go to Google AI Studio and sign in with your account.",
      "Open API Keys from the left sidebar.",
      "Click Create API key.",
      "Copy the key and paste it into the field below."
    ]
  }
}

export const ERROR_MESSAGES: Record<AiConnectionErrorCode, (provider: AiProviderType) => string> = {
  'invalid-key': (p) => `Invalid API key for ${PROVIDER_LABELS[p]}`,
  'network': () => 'Could not reach the server. Check your internet connection.',
  'timeout': () => 'Connection timed out. Check your network and try again.',
  'rate-limit': (p) => `${PROVIDER_LABELS[p]} rate limit reached. Please wait a moment and try again.`,
  'server-error': (p) => `${PROVIDER_LABELS[p]} is temporarily unavailable. Try again later.`,
  'no-models': (p) => `No suitable models found for ${PROVIDER_LABELS[p]}.`,
  'unknown': (p) => `Connection to ${PROVIDER_LABELS[p]} failed`,
  'token-limit': () => 'The provider\u2019s token limit was exceeded. Try again.',
  'invalid-response': () => 'The provider returned an unexpected response. Try again, and if the problem persists, try a different provider.', 
}

export const ERROR_HINTS: Record<AiConnectionErrorCode, string> = {
  'invalid-key': 'Double-check that you copied the full key and that it has not been revoked',
  'network': 'Make sure you are connected to the internet and try again',
  'timeout': 'The server took too long to respond. Try again in a moment.',
  'rate-limit': 'You have made too many requests. Wait a minute before trying again.',
  'server-error': 'This is a problem on the provider\u2019s side, not yours. Try again later.',
  'no-models': 'The provider returned no models compatible with this application. Try a different provider.',
  'unknown': 'If this persists, try a different provider or check the provider\u2019s status page',
  'token-limit': ' .',
  'invalid-response': 'The provider returned an unexpected response. Try again, and if the problem persists, try a different provider.', 
}

export const PROVIDER_OPTIONS = [
  { value: 'groq', label: PROVIDER_LABELS.groq },
  { value: 'gemini', label: PROVIDER_LABELS.gemini },
]
