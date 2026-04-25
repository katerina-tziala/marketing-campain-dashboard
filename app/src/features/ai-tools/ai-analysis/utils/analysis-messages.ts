import type { AiErrorCode, AiAnalysisNoticeCode } from '@/features/ai-tools/types'

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
  'min-campaigns': 'Budget optimization requires at least 2 campaigns. Adjust the channel filter or add more campaign data.',
  'unknown': 'Something went wrong.',
}

export const ANALYSIS_NOTICE_MESSAGES: Record<AiAnalysisNoticeCode, string> = {
  'stale-result': 'The latest request failed. Showing the previous generated result.',
}

export const TOKEN_LIMIT_MESSAGES = {
  notice: 'AI generation is temporarily unavailable due to usage limits.',
  hint: 'Previously generated results are still available.',
}
