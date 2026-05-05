import type { GroqModel } from '../types';

const BANNED_MODEL_TERMS = ['whisper', 'audio', 'guard', 'safeguard', 'moderation', 'orpheus'];

function looksLikeTextModel(id: string): boolean {
  const lower = id.toLowerCase();

  // exclude obvious non-text
  if (BANNED_MODEL_TERMS.some((term) => lower.includes(term))) {
    return false;
  }

  // basic heuristic: most chat models include size or version markers
  return /\d/.test(lower); // e.g. 7b, 8x7b, 70b, v1, etc.
}

export function getAllowedCandidates(models: GroqModel[]): GroqModel[] {
  return models.filter((m) => {
    const id = (m.id || '').toLowerCase();

    return m.active === true && looksLikeTextModel(id);
  });
}
