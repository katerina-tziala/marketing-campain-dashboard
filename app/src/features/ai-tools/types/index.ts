// ── AI Provider & Connection ──────────────────────────────────────────────

export type AiProvider = 'gemini' | 'groq';

export const PROVIDER_LABELS: Record<AiProvider, string> = {
  gemini: 'Google Gemini',
  groq: 'Groq',
};

export type AiConnectionErrorCode =
  | 'invalid-key'
  | 'network'
  | 'timeout'
  | 'rate-limit'
  | 'server-error'
  | 'no-models'
  | 'unknown';

export type AiConnectionError = {
  code: AiConnectionErrorCode;
  provider: AiProvider;
};

// ── Provider model types ──────────────────────────────────────────────────

export type GeminiModel = {
  name: string;
  version: string;
  displayName: string;
  description: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  supportedGenerationMethods: string[];
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTemperature?: number;
  thinking?: boolean;
};

export type GeminiModelsResponse = {
  models: GeminiModel[];
};

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

// ── AI Model (from model selection prompt) ────────────────────────────────

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

export type ModelSelectionResponse = {
  selected_models: AiModel[];
};

// ── Prompt types ──────────────────────────────────────────────────────────

export type PromptList = {
   title: string, 
    list: string[] 
};

export type PromptInstructions = {
  role: string[],
  task: string[],
  objectives: PromptList
};

export type PromptInstructionStep = {
  title: string
  bullets?: string[]
  notes?: string[]
};

export type PromptScopeConfig = {
  label: string;
  filteredDescription: string[];
  unfilteredDescription: string[];
  filteredConstraints: string[];
};

export type BusinessContext = {
  period?: string;
  industry?: string;
  goal?: string;
  businessStage?: string;
  attributionModel?: string;
  riskTolerance?: string;
  scalingTolerance?: string;
  constraints?: string[];
};

export type BudgetOptimizerContextInput = BusinessContext & {
  allowBudgetExpansion?: boolean;
};

// ── Reusable building blocks ───────────────────────────────────────────────

export type CampainSummaryTotals = {
  budget: number;
  revenue: number;
  roi: number;
  conversions: number;
  cac: number;
  ctr: number;
  cvr: number;
};

export type AllocationShare = {
  budgetShare: number;
  revenueShare: number;
};

export type FunnelMetrics = {
  impressions: number;
  clicks: number;
};

export type PortfolioCount = {
  campaignCount: number;
  channelCount: number;
};

export type ConfidenceLevel = "High" | "Medium" | "Low";

// ── Executive Summary types ────────────────────────────────────────────────

export type ExecutiveSummaryChannel = CampainSummaryTotals & AllocationShare & {
  channel: string;
};

export type ExecutiveSummaryCampaign = CampainSummaryTotals & {
  campaign: string;
  channel: string;
};

export type ExecutiveSummaryOtherChannelsSummary = AllocationShare & {
  channelCount: number;
};

export type ExecutiveSummaryData = {
  period?: string;
  totals: CampainSummaryTotals;
  portfolio: PortfolioCount;
  topChannels: ExecutiveSummaryChannel[];
  otherChannelsSummary?: ExecutiveSummaryOtherChannelsSummary;
  topCampaigns: ExecutiveSummaryCampaign[];
  underperformingCampaigns: ExecutiveSummaryCampaign[];
  keyFindings?: string[];
};

// ── Budget Optimizer types ─────────────────────────────────────────────────

export type BudgetOptimizerCampaign = CampainSummaryTotals & AllocationShare & FunnelMetrics & {
  campaign: string;
  channel: string;
  efficiencyScore?: number;
  spendTier?: Lowercase<ConfidenceLevel>;
};

export type BudgetOptimizerChannel = CampainSummaryTotals & AllocationShare & FunnelMetrics & {
  channel: string;
  efficiencyScore?: number;
};

export type BudgetOptimizerData = {
  totals: CampainSummaryTotals;
  campaigns: BudgetOptimizerCampaign[];
  channels: BudgetOptimizerChannel[];
  portfolio: PortfolioCount;
  keyFindings?: string[];
};

export type BudgetOptimizerResponse = {
  model?: AiModel;
  period?: string;
  executive_summary: string;
  recommendations: {
    action: string;
    from_campaign: string;
    to_campaign: string;
    amount: number;
    expected_impact: {
      additional_revenue: number;
      additional_conversions: number;
      new_roi_estimate: string;
    };
    confidence: ConfidenceLevel;
    reasoning: string;
    timeline: "Immediate" | "This Month" | "Next Quarter";
    success_metrics: {
      what_to_measure: string;
      target: string;
      review_after: string;
    };
  }[];
  top_performers: {
    campaign: string;
    roi: number;
    insight: string;
    unlock_potential: string;
  }[];
  underperformers: {
    campaign: string;
    roi: number;
    insight: string;
    recommended_action: "Reduce" | "Pause" | "Restructure";
  }[];
  quick_wins: {
    action: string;
    effort: Exclude<ConfidenceLevel, "High">;
    potential_impact: string;
    timeline: string;
  }[];
  correlations: {
    finding: string;
    implication: string;
  }[];
  risks: {
    risk: string;
    mitigation: string;
  }[];
};

// ── AI Analysis types ─────────────────────────────────────────────────────

export type AiAnalysisTab = 'optimizer' | 'summary';

export type AiAnalysisStatus = 'idle' | 'loading' | 'done' | 'error';

export type AiAnalysisErrorCode =
  | 'network'
  | 'timeout'
  | 'rate-limit'
  | 'token-limit'
  | 'server-error'
  | 'parse-error'
  | 'unknown';

export type AiAnalysisError = {
  code: AiAnalysisErrorCode;
  message: string;
};

export type ExecutiveSummaryResponse = {
  model?: AiModel;
  period?: string;
  health_score: {
    score: number;
    label: "Excellent" | "Good" | "Needs Attention" | "Critical";
    reasoning: string;
  };
  bottom_line: string;
  insights: {
    type: "performance" | "opportunity" | "warning" | "achievement";
    icon: "📊" | "🏆" | "⚠️" | "🎯" | "💡" | "📈" | "📉" | "🔥";
    text: string;
    metric_highlight: {
      label: string;
      value: string;
    };
  }[];
  priority_actions: {
    priority: number;
    action: string;
    expected_outcome: string;
    urgency: "Immediate" | "This Quarter" | "Next Quarter";
    success_metric: string;
  }[];
  channel_summary: {
    channel: string;
    status: "strong" | "moderate" | "weak";
    budget_share: string;
    one_liner: string;
  }[];
  additional_channels_note?: string;
  correlations: {
    finding: string;
    so_what: string;
  }[];
  key_metrics: {
    total_spend: string;
    total_revenue: string;
    overall_roi: string;
    total_conversions: string;
    best_channel: string;
    worst_channel: string;
    best_campaign: string;
    biggest_opportunity: string;
  };
};