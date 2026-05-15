import type { AiModel } from '../types';
import { evaluateModels } from '../utils';
import { fetchGroqModels, requestGroqChatCompletion } from './api';
import { extractCandidates } from './extract-candidates/index';

export async function connectGroq(apiKey: string): Promise<AiModel[]> {
  const models = await fetchGroqModels(apiKey);
  const candidates = extractCandidates(models);
  return evaluateModels(apiKey, candidates, requestGroqChatCompletion);
}
