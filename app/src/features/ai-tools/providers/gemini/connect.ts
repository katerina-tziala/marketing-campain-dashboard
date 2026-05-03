import { generateModelEvaluationPrompt } from '../../prompts'
import type { AiModel, AiModelCandidate, ModelsResponse } from '../types'
import { parseJsonResponse, toValidModels } from '../utils/shared'
import { fetchGeminiModels, requestGeminiChatCompletion } from './api'
import type { GeminiModel } from './types'

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

function stripPrefix(name: string): string {
  return name.replace(/^models\//, '')
}

function buildValidIds(candidates: GeminiModel[]): Set<string> {
  return new Set(candidates.map((c) => stripPrefix(c.name)))
}

function toAiModelCandidate(m: GeminiModel): AiModelCandidate {
  return {
    id: stripPrefix(m.name),
    provider: 'gemini',
    contextWindow: m.inputTokenLimit,
    maxOutputTokens: m.outputTokenLimit,
    supportsTextGeneration: m.supportedGenerationMethods?.includes('generateContent') ?? false,
    thinking: m.thinking,
  }
}

async function tryWithModel(
  apiKey: string,
  runner: GeminiModel,
  candidates: GeminiModel[],
): Promise<AiModel[]> {
  const modelId = stripPrefix(runner.name)
  const prompt = generateModelEvaluationPrompt(candidates.map(toAiModelCandidate))
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
  console.log({ models, filteredModels });
  if (filteredModels.length === 0) throw new Error('no-models')
  return evaluateModels(apiKey, getSortedCandidates(filteredModels))
}
