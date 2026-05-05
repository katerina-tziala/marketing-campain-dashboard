import type { AiModelCandidate } from '../../types';
import type { GeminiModel } from '../types';
import { getAllowedCandidates } from './allowed-candidates';
import { getSortedCandidates } from './sort-candidates';

function stripPrefix(name: string): string {
  return name.replace(/^models\//, '');
}

function toAiModelCandidate(m: GeminiModel): AiModelCandidate {
  return {
    id: stripPrefix(m.name),
    provider: 'gemini',
    contextWindow: m.inputTokenLimit,
    maxOutputTokens: m.outputTokenLimit,
    supportsTextGeneration: true,
    thinking: m.thinking,
  };
}

export function extractCandidates(models: GeminiModel[]): AiModelCandidate[] {
  const allowed = getAllowedCandidates(models);
  const sorted = getSortedCandidates(allowed);
  return sorted.map(toAiModelCandidate);
}
