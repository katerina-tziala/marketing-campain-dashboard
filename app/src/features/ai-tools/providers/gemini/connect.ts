import type { AiModel } from '../types';
import { evaluateModels } from '../utils';
import { fetchGeminiModels, requestGeminiChatCompletion } from './api';
import { extractCandidates } from './extract-candidates/index';

export async function connectGemini(apiKey: string): Promise<AiModel[]> {
  const models = await fetchGeminiModels(apiKey);
  const candidates = extractCandidates(models);
  return evaluateModels(apiKey, candidates, requestGeminiChatCompletion);
}
