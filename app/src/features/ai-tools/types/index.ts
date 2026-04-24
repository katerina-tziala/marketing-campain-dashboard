// ── AI Provider & Connection ──────────────────────────────────────────────────

export type AiProviderType = 'gemini' | 'groq';

export type AiErrorCode =
  | 'invalid-key'
  | 'network'
  | 'timeout'
  | 'rate-limit'
  | 'server-error'
  | 'no-models'
  | 'token-limit'
  | 'invalid-response'
  | 'parse-error'
  | 'unknown';

export type AiConnectionError = {
  code: AiErrorCode;
  provider: AiProviderType;
};

// ── AI Analysis meta-types ────────────────────────────────────────────────────

export type AiAnalysisType = 'budgetOptimizer' | 'executiveSummary';

export type AiAnalysisError = {
  code: AiErrorCode;
  message: string;
};
