import { stabilityPenaltyByModelId } from '../../utils/stability-penalty-by-model-id';
import type { GroqModel } from '../types';

function safeNumber(value: number | undefined | null): number {
  return typeof value === 'number' ? value : 0;
}

function byContextWindowDesc(a: GroqModel, b: GroqModel): number {
  return safeNumber(b.context_window) - safeNumber(a.context_window);
}

function byOutputTokensDesc(a: GroqModel, b: GroqModel): number {
  return safeNumber(b.max_completion_tokens) - safeNumber(a.max_completion_tokens);
}

function byStabilityAsc(a: GroqModel, b: GroqModel): number {
  return stabilityPenaltyByModelId(a.id) - stabilityPenaltyByModelId(b.id);
}

function byCreatedDesc(a: GroqModel, b: GroqModel): number {
  return safeNumber(b.created) - safeNumber(a.created);
}

function byIdAsc(a: GroqModel, b: GroqModel): number {
  return a.id.localeCompare(b.id);
}

export function getSortedCandidates(models: GroqModel[]): GroqModel[] {
  return [...models].sort(
    (a, b) =>
      byContextWindowDesc(a, b) ||
      byOutputTokensDesc(a, b) ||
      byStabilityAsc(a, b) ||
      byCreatedDesc(a, b) ||
      byIdAsc(a, b),
  );
}
