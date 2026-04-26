import type { AiErrorCode, AiAnalysisNoticeCode } from '@/features/ai-tools/types'

const TRY_AGAIN_LATER = 'Please try again in a moment'
const UNUSABLE_RESPONSE = {
  title: 'The AI returned an unusable response',
  message: 'The result could not be processed, please try again',
}

export const ANALYSIS_ERROR_MESSAGES: Record<AiErrorCode, { title: string; message: string }> = {
  'network': { title: 'Unable to reach the AI provider', message: 'Please check your connection and try again' },
  'timeout': { title: 'The request took too long to complete', message: TRY_AGAIN_LATER },
  'rate-limit': { title: 'Rate limit reached', message: 'Please wait a moment before trying again' },
  'token-limit': { title: 'Token limit reached', message: 'Please disconnect and reconnect to start a new session' },
  'server-error': { title: 'The AI provider is experiencing issues', message: TRY_AGAIN_LATER },
  'parse-error': UNUSABLE_RESPONSE,
  'invalid-response': UNUSABLE_RESPONSE,
  'invalid-key': { title: 'Your API key is no longer valid', message: 'Please disconnect and reconnect with a valid key' },
  'no-models': { title: 'No suitable AI models are available', message: 'Please disconnect and reconnect to refresh available models' },
  'min-campaigns': { title: 'Budget optimization requires at least 2 campaigns', message: 'Please adjust the channel filters' },
  'unknown': { title: 'An unexpected error occurred', message: 'Please try again or disconnect and reconnect' },
}

export const ANALYSIS_NOTICE_MESSAGES: Record<AiAnalysisNoticeCode, { title: string; message: string }> = {
  'stale-result': { title: 'Showing previous result', message: 'The latest request failed' },
}

export const TOKEN_LIMIT_MESSAGE = {
  title: 'Token limit reached. No further analysis is available for this session',
  message: 'Disconnect and reconnect to start a new session',
}
