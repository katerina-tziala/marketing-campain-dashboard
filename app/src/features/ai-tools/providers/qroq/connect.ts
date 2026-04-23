import { generateModelEvaluationPrompt } from '../../prompts'
import type { AiModel, AiModelCandidate, ModelsResponse } from '../types'
import { parseJsonResponse, toValidModels } from '../utils/shared'
import { fetchGroqModels, requestGroqChatCompletion } from './api'
import type { GroqModel } from './types'
import { GROQ_PROVIDER_RULES } from '../providers-meta'

const BANNED = ['whisper', 'audio', 'guard', 'safeguard', 'moderation', 'orpheus']

function isAllowed(m: GroqModel): boolean {
  return m.active === true && !BANNED.some((x) => (m.id || '').toLowerCase().includes(x))
}

function filterModels(models: GroqModel[]): GroqModel[] {
  return models.filter(isAllowed)
}

function byCreatedDesc(a: GroqModel, b: GroqModel): number {
  return b.created - a.created
}

function getSortedCandidates(models: GroqModel[]): GroqModel[] {
  return [...models].sort(byCreatedDesc)
}

function buildValidIds(candidates: GroqModel[]): Set<string> {
  return new Set(candidates.map((c) => c.id))
}

function toAiModelCandidate(m: GroqModel): AiModelCandidate {
  return {
    id: m.id,
    contextWindow: m.context_window,
    maxOutputTokens: m.max_completion_tokens,
  }
}

async function tryWithModel(
  apiKey: string,
  runner: GroqModel,
  candidates: GroqModel[],
): Promise<AiModel[]> {
  const prompt = generateModelEvaluationPrompt(candidates.map(toAiModelCandidate), GROQ_PROVIDER_RULES)
  const raw = await requestGroqChatCompletion(apiKey, runner.id, prompt)
  return toValidModels(buildValidIds(candidates), parseJsonResponse<ModelsResponse>(raw).models)
}

function evaluateModels(apiKey: string, candidates: GroqModel[]): Promise<AiModel[]> {
  if (candidates.length === 0) throw new Error('no-models')
  const [runner, ...remaining] = candidates
  return tryWithModel(apiKey, runner, candidates)
    .catch(() => evaluateModels(apiKey, remaining))
}

export async function connectGroq(apiKey: string): Promise<AiModel[]> {
  const models = await fetchGroqModels(apiKey)
  const filteredModels = filterModels(models)
  if (filteredModels.length === 0) throw new Error('no-models')
  return evaluateModels(apiKey, getSortedCandidates(filteredModels))
}
