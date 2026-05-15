import { generateModelEvaluationPrompt } from '../../prompts';
import type { AiModel, AiModelCandidate, ModelsResponse } from '../types';
import { parseJsonResponse, toValidModels } from './shared';

export type ChatCompletionFn = (apiKey: string, model: string, prompt: string) => Promise<string>;

const MAX_RUNNER_ATTEMPTS = 3;

async function tryWithModel(
  apiKey: string,
  runner: AiModelCandidate,
  candidates: AiModelCandidate[],
  completionFn: ChatCompletionFn,
): Promise<AiModel[]> {
  const prompt = generateModelEvaluationPrompt(candidates);
  const raw = await completionFn(apiKey, runner.id, prompt);
  return toValidModels(
    new Set(candidates.map((c) => c.id)),
    parseJsonResponse<ModelsResponse>(raw).models,
  );
}

export function evaluateModels(
  apiKey: string,
  candidates: AiModelCandidate[],
  completionFn: ChatCompletionFn,
  failCount = new Map<string, number>(),
): Promise<AiModel[]> {
  const runner = candidates.find((c) => (failCount.get(c.id) ?? 0) < MAX_RUNNER_ATTEMPTS);
  if (!runner) {
    throw new Error('no-models');
  }

  return tryWithModel(apiKey, runner, candidates, completionFn).catch((error) => {
    const withoutRunner = candidates.filter((c) => c.id !== runner.id);

    if (error instanceof Error && error.message === 'token-limit') {
      return evaluateModels(apiKey, withoutRunner, completionFn, failCount);
    }

    const count = (failCount.get(runner.id) ?? 0) + 1;
    failCount.set(runner.id, count);

    if (count >= MAX_RUNNER_ATTEMPTS) {
      return evaluateModels(apiKey, withoutRunner, completionFn, failCount);
    }

    return evaluateModels(apiKey, [...withoutRunner, runner], completionFn, failCount);
  });
}
