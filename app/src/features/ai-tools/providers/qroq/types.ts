export type GroqModel = {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  active: boolean;
  context_window: number;
  public_apps: unknown;
  max_completion_tokens: number;
};

export type GroqModelsResponse = {
  object: string;
  data: GroqModel[];
};
