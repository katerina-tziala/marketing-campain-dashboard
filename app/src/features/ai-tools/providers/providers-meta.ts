export const GROQ_PROVIDER_RULES: string[] = [
  'Provider is Groq.',
  'Infer displayName from the model identifier only.',
  'Infer family from the model identifier only.',
  'Use short, standardized family names such as "Llama", "Gemma", "Qwen", "Mixtral", or "Other".',
  'If family cannot be clearly inferred, return "Other".',
  'Generate concise, readable display names suitable for UI display.',
  'Do not use marketing language.',
  'Do not modify the id.',
]

export const GEMINI_PROVIDER_RULES: string[] = [
  'Provider is Gemini.',
  'Infer displayName from the model identifier only.',
  'Infer family as "Gemini".',
  'Generate concise, readable display names suitable for UI display.',
  'Do not use marketing language.',
  'Do not modify the id.',
]
