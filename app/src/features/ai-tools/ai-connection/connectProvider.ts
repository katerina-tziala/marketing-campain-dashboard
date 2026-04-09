import type { AiProvider, AiConnectionError, AiModel, GeminiModel, GroqModel, ModelSelectionResponse } from '../types'
import { errorCodeFromException, parseJsonResponse } from './shared'
import { connectGemini, callGemini, getOptimalGeminiModel } from './gemini'
import { connectGroq, callGroq, getOptimalGroqModel } from './groq'
import { generateModelSelectionPrompt } from '../prompts'

function getOptimalModel(provider: AiProvider, models: GeminiModel[] | GroqModel[]): string {
  return provider === 'gemini'
    ? getOptimalGeminiModel(models as GeminiModel[])
    : getOptimalGroqModel(models as GroqModel[])
}

function callAi(provider: AiProvider, apiKey: string, prompt: string, model: string): Promise<string> {
  return provider === 'gemini'
    ? callGemini(apiKey, prompt, model)
    : callGroq(apiKey, prompt, model)
}

async function selectModels(
  provider: AiProvider,
  apiKey: string,
  filteredModels: GeminiModel[] | GroqModel[],
): Promise<AiModel[]> {
  const prompt = generateModelSelectionPrompt(filteredModels)
  const optimalModel = getOptimalModel(provider, filteredModels)
  const raw = await callAi(provider, apiKey, prompt, optimalModel)
  const parsed = parseJsonResponse(raw) as ModelSelectionResponse
  return parsed.selected_models ?? []
}

export async function connectProvider(
  provider: AiProvider,
  apiKey: string,
): Promise<AiModel[] | AiConnectionError> {
  try {
    const result = provider === 'gemini'
      ? await connectGemini(apiKey)
      : await connectGroq(apiKey)

    if (typeof result === 'string') {
      return { code: result, provider }
    }

    if (result.length === 0) {
      return { code: 'no-models', provider }
    }

    const selectedModels = await selectModels(provider, apiKey, result)

    if (selectedModels.length === 0) {
      return { code: 'no-models', provider }
    }

    return selectedModels
  } catch (e) {
    return { code: errorCodeFromException(e), provider }
  }
}
