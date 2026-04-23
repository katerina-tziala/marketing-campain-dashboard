import { generateModelEvaluationPrompt } from "../../prompts";
import type { AiModel, ModelsResponse } from "../../types";
import { parseJsonResponse, toValidModels } from "../utils/shared";
import { fetchGeminiModels, requestGeminiChatCompletion } from "./api";
import type { GeminiModel } from "./types";

const BANNED = ['embedding', 'image', 'audio', 'tts', 'veo', 'imagen', 'lyria', 'robotics']

function isAllowed(m: GeminiModel): boolean {
  const name = (m.name || '').toLowerCase()
  return !!(m.supportedGenerationMethods?.includes('generateContent')) && !BANNED.some((x) => name.includes(x))
}

function filterModels(models: GeminiModel[]): GeminiModel[] {
  return models.filter(isAllowed)
}

function flashPriority(name: string): number {
  return name.toLowerCase().includes('flash') ? 1 : 0
}

function getSortedCandidates(models: GeminiModel[]): GeminiModel[] {
  return [...models].sort((a, b) => {
    const flashDiff = flashPriority(b.name) - flashPriority(a.name)
    return flashDiff !== 0 ? flashDiff : b.version.localeCompare(a.version)
  })
}

function buildValidIds(candidates: GeminiModel[]): Set<string> {
  const ids = new Set<string>()
  for (const c of candidates) {
    ids.add(c.name)
    ids.add(c.name.replace(/^models\//, ''))
  }
  return ids
}

async function tryWithModel(
  apiKey: string,
  runner: GeminiModel,
  candidates: GeminiModel[],
): Promise<AiModel[]> {
  const modelId = runner.name.replace(/^models\//, '')
    // TODO: consider whether we want to include more info in the prompt, 
    // such as model capabilities or strengths (currently we just include the model IDs).
    // This would require changes to the prompt template and response parsing, 
    // but could potentially lead to better model selection by providing more context to the AI.
    // customize prompt to DTO of provider
    // perform a mapping on our side first???
  const prompt = generateModelEvaluationPrompt(candidates)
  const raw = await requestGeminiChatCompletion(apiKey, modelId, prompt)
  return toValidModels(buildValidIds(candidates), parseJsonResponse<ModelsResponse>(raw).models)
}

function evaluateModels(apiKey: string, candidates: GeminiModel[]): Promise<AiModel[]> {
  if (candidates.length === 0) throw new Error('no-models')
  const [runner, ...remaining] = candidates
  return tryWithModel(apiKey, runner, candidates)
    .catch(() => evaluateModels(apiKey, remaining))
}

export async function connectGemini(apiKey: string): Promise<AiModel[]> {
  const models = await fetchGeminiModels(apiKey)
  const filteredModels = filterModels(models)
  if (filteredModels.length === 0) throw new Error('no-models')
  return evaluateModels(apiKey, getSortedCandidates(filteredModels))
}
