export type AiModel = {
  id: string;
  model: string;
  display_name: string;
  provider: string;
  strength: string;
  strength_score: number;
  reason: string;
  limitReached: boolean;
};

export type ModelsResponse = {
  models: AiModel[];
};
