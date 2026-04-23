// ── AI Provider & Connection ──────────────────────────────────────────────

export type AiProviderType = 'gemini' | 'groq';

export type AiConnectionErrorCode =
  | 'invalid-key'
  | 'network'
  | 'timeout'
  | 'rate-limit'
  | 'server-error'
  | 'no-models'
  | 'token-limit'
  | 'invalid-response'
  | 'unknown';
 

export type AiConnectionError = {
  code: AiConnectionErrorCode;
  provider: AiProviderType;
};

 
 
// ── AI Model (from model evaluation prompt) ──────────────────────────────

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
  cac: number | null;
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

export type PerformanceDeltas = {
  roiDelta: number;
  cacDelta: number | null;
  cvrDelta: number;
};

export type ExecutiveSummaryChannel = CampainSummaryTotals & AllocationShare & PerformanceDeltas & {
  channel: string;
};

export type ExecutiveSummaryCampaign = CampainSummaryTotals & PerformanceDeltas & {
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

export type Correlation = { 
    finding: string;
    implication: string;
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
      new_roi_estimate: number;
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
  correlations: Correlation[];
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
  correlations: Correlation[];
  key_metrics: {
    total_spend: number;
    total_revenue: number;
    overall_roi: number;
    total_conversions: number;
    best_channel: string;
    worst_channel: string;
    best_campaign: string;
    biggest_opportunity: string;
  };
};