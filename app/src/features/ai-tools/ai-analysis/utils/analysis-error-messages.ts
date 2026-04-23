import type { AiErrorCode } from "../../types";


export const ANALYSIS_ERROR_MESSAGES: Record<AiErrorCode, string> = {
  'network': 'Network error. Check your connection and try again.',
  'timeout': 'The request timed out. Try again.',
  'rate-limit': 'Too many requests. Please wait and try again.',
  'token-limit': 'AI generation is temporarily unavailable due to usage limits.',
  'server-error': 'The AI provider is experiencing issues. Try again later.',
  'parse-error': 'Could not parse the AI response. Try again.',
  'invalid-response': 'Could not parse the AI response. Try again.',
  'invalid-key': 'Something went wrong.',
  'no-models': 'Something went wrong.',
  'unknown': 'Something went wrong.',
}
