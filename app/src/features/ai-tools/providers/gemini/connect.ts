import { generateModelEvaluationPrompt } from '../../prompts'
import type { AiModel, AiModelCandidate, ModelsResponse } from '../types'
import { parseJsonResponse, toValidModels } from '../utils/shared'
import { fetchGeminiModels, requestGeminiChatCompletion } from './api'
import { extractCandidates } from './extract-candidates/index'

async function tryWithModel(
  apiKey: string,
  runner: AiModelCandidate,
  candidates: AiModelCandidate[],
): Promise<AiModel[]> {
  const prompt = generateModelEvaluationPrompt(candidates)
  const raw = await requestGeminiChatCompletion(apiKey, runner.id, prompt)
  return toValidModels(new Set(candidates.map((c) => c.id)), parseJsonResponse<ModelsResponse>(raw).models)
}

function evaluateModels(apiKey: string, candidates: AiModelCandidate[]): Promise<AiModel[]> {
  if (candidates.length === 0) throw new Error('no-models')
  const [runner, ...remaining] = candidates
  return tryWithModel(apiKey, runner, candidates)
    .catch(() => evaluateModels(apiKey, remaining))
}

export async function connectGemini(apiKey: string): Promise<AiModel[]> {
  const models = await fetchGeminiModels(apiKey)
  const candidates = extractCandidates(models) 
  return evaluateModels(apiKey, candidates)
}
