import type { AiProviderType } from '../../types';

export type ProviderHelpStep = { text: string; linkText?: string; href?: string };

export const PROVIDER_LABELS: Record<AiProviderType, string> = {
  gemini: 'Google Gemini',
  groq: 'Groq',
};

export const PROVIDER_HELP: Record<
  AiProviderType,
  { title: string; steps: ProviderHelpStep[]; note?: string }
> = {
  groq: {
    title: 'How to get your Groq API key',
    steps: [
      {
        text: 'Go to the {link} and sign in with your account',
        linkText: 'Groq Console',
        href: 'https://console.groq.com/',
      },
      { text: 'Open API Keys from the left sidebar' },
      { text: 'Click Create API Key' },
      { text: 'Copy the key and paste it into the API key field above' },
    ],
    note: 'Some models may require your organization admin to accept additional terms before use',
  },
  gemini: {
    title: 'How to get your Gemini API key',
    steps: [
      {
        text: 'Go to {link} and sign in with your account',
        linkText: 'Google AI Studio',
        href: 'https://aistudio.google.com/',
      },
      { text: 'Open API Keys from the left sidebar' },
      { text: 'Click Create API key' },
      { text: 'Copy the key and paste it into the API key field above' },
    ],
  },
};

export const PROVIDER_OPTIONS = [
  { value: 'gemini', label: PROVIDER_LABELS.gemini },
  { value: 'groq', label: PROVIDER_LABELS.groq },
];
