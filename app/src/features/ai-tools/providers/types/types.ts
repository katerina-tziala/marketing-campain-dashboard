export type AiModelCandidate = {
  id: string
  provider: 'gemini' | 'groq'
  contextWindow?: number
  maxOutputTokens?: number
  supportsTextGeneration?: boolean
  thinking?: boolean
}

export type AiModel = {
  id: string;
  displayName: string;
  family: string;
  strengthScore: number;
  limitReached: boolean;
}

export type ModelsResponse = {
  models: AiModel[];
}
