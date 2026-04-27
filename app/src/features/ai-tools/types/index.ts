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
  | 'min-campaigns'
  | 'unknown';

export type AiConnectionErrorCode = Exclude<AiErrorCode, 'min-campaigns'>

export type AiConnectionError = {
  code: AiConnectionErrorCode;
  provider: AiProviderType;
};

// ── AI Analysis meta-types ────────────────────────────────────────────────────

export type AiAnalysisType = 'budgetOptimizer' | 'executiveSummary';

export type AiAnalysisError = {
  code: AiErrorCode;
  rawMessage?: string;
};

export type AiAnalysisNoticeCode = 'stale-result';

export type AiAnalysisNotice = {
  code: AiAnalysisNoticeCode;
};
