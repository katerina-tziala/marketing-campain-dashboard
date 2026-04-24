import type { AiProviderType } from '@/features/ai-tools/types'

export const PROVIDER_LABELS: Record<AiProviderType, string> = {
  gemini: 'Google Gemini',
  groq: 'Groq',
}

export const PROVIDER_HELP: Record<AiProviderType, { title: string; steps: string[]; note?: string }> = {
  groq: {
    title: 'How to get your Groq API key',
    steps: [
      'Go to the Groq Console and sign in with your account.',
      'Open API Keys from the left sidebar.',
      'Click Create API Key.',
      'Copy the key and paste it into the field below.',
    ],
    note: 'Some models may require your organization admin to accept additional terms before use.',
  },
  gemini: {
    title: 'How to get your Gemini API key',
    steps: [
      'Go to Google AI Studio and sign in with your account.',
      'Open API Keys from the left sidebar.',
      'Click Create API key.',
      'Copy the key and paste it into the field below.',
    ],
  },
}

export const PROVIDER_OPTIONS = [
  { value: 'groq', label: PROVIDER_LABELS.groq },
  { value: 'gemini', label: PROVIDER_LABELS.gemini },
]

export const GROQ_PROVIDER_RULES: string[] = [
  'Provider is Groq.',
  'Infer displayName from the model identifier only.',
  'Infer family from the model identifier only.',
  'Use short, standardized family names such as "Llama", "Gemma", "Qwen", "Mixtral", or "Other".',
  'If family cannot be clearly inferred, return "Other".',
  'Generate concise, readable display names suitable for UI display.',
  'Do not use marketing language.',
  'Do not modify the id.',
]

export const GEMINI_PROVIDER_RULES: string[] = [
  'Provider is Gemini.',
  'Infer displayName from the model identifier only.',
  'Infer family as "Gemini".',
  'Generate concise, readable display names suitable for UI display.',
  'Do not use marketing language.',
  'Do not modify the id.',
]
