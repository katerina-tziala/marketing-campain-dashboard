import { generateModelEvaluationPrompt } from "../../prompts"
import type { AiModel, ModelsResponse } from "../types"
import { parseJsonResponse, toValidModels } from "../utils/shared"
import { fetchGroqModels, requestGroqChatCompletion } from "./api"
import type { GroqModel } from "./types"

const BANNED = ['whisper', 'audio', 'guard', 'safeguard', 'moderation', 'orpheus']

function isAllowed(m: GroqModel): boolean {
  return !BANNED.some((x) => (m.id || '').toLowerCase().includes(x))
}
// remove inactive ones too
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

async function tryWithModel(
  apiKey: string,
  runner: GroqModel,
  candidates: GroqModel[],
): Promise<AiModel[]> {
        // TODO: consider whether we want to include more info in the prompt, 
    // such as model capabilities or strengths (currently we just include the model IDs).
    // This would require changes to the prompt template and response parsing, 
    // but could potentially lead to better model selection by providing more context to the AI.
    // customize prompt to DTO of provider
    // perform a mapping on our side first???
  const prompt = generateModelEvaluationPrompt(candidates)
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
