export type AiModelCandidate = {
  id: string;
  contextWindow?: number;
  maxOutputTokens?: number;
  thinking?: boolean;
};

export type AiModel = {
  id: string;
  displayName: string;
  family: string;
  strength: string;
  strengthScore: number;
  reason: string;
  limitReached: boolean;
};

export type ModelsResponse = {
  models: AiModel[];
};
