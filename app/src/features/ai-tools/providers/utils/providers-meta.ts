import type { AiProviderType } from '../../types';

export const PROVIDER_LABELS: Record<AiProviderType, string> = {
  gemini: 'Google Gemini',
  groq: 'Groq',
};

export const PROVIDER_HELP: Record<
  AiProviderType,
  { title: string; steps: string[]; note?: string }
> = {
  groq: {
    title: 'How to get your Groq API key',
    steps: [
      'Go to the Groq Console and sign in with your account',
      'Open API Keys from the left sidebar',
      'Click Create API Key',
      'Copy the key and paste it into the API key field above',
    ],
    note: 'Some models may require your organization admin to accept additional terms before use',
  },
  gemini: {
    title: 'How to get your Gemini API key',
    steps: [
      'Go to Google AI Studio and sign in with your account',
      'Open API Keys from the left sidebar',
      'Click Create API key',
      'Copy the key and paste it into the API key field above',
    ],
  },
};

export const PROVIDER_OPTIONS = [
  { value: 'gemini', label: PROVIDER_LABELS.gemini },
  { value: 'groq', label: PROVIDER_LABELS.groq },
];
