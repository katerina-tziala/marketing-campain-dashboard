
import type { AiProviderType } from '@/features/ai-tools/types'
import { requestGeminiChatCompletion } from "./gemini"
import { requestGroqChatCompletion } from "./qroq"
import { parseJsonResponse } from "./utils/shared"

type ProviderCaller = (
  apiKey: string,
  model: string,
  prompt: string,
  signal?: AbortSignal,
) => Promise<string>

const PROVIDER_CALLERS: Record<AiProviderType, ProviderCaller> = {
  gemini: requestGeminiChatCompletion,
  groq: requestGroqChatCompletion,
}

export async function runProviderPrompt<T>(
  provider: AiProviderType,
  apiKey: string,
  model: string,
  prompt: string,
  signal?: AbortSignal,
): Promise<T> {
  const raw = await PROVIDER_CALLERS[provider](apiKey, model, prompt, signal)

  try {
    return parseJsonResponse<T>(raw)
  } catch {
    throw new Error('invalid-response')
  }
}