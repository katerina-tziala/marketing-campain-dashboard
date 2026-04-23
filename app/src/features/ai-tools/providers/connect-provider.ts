import type { AiProviderType, AiModel } from "../types"
import { connectGemini } from "./gemini"
import { connectGroq } from "./qroq"

const CONNECTORS: Record<AiProviderType, (apiKey: string) => Promise<AiModel[]>> = {
  gemini: connectGemini,
  groq: connectGroq,
}

export async function connectProvider(
  provider: AiProviderType,
  apiKey: string,
): Promise<AiModel[]> {
  return await CONNECTORS[provider](apiKey)
}
