import type { AiModel } from '../providers/types'

// ── AI Provider & Connection ──────────────────────────────────────────────

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

// ── Legacy Budget Optimizer types (used by old prompt files) ──────────────

export type BudgetOptimizerCampaign = CampainSummaryTotals & AllocationShare & FunnelMetrics & {
  campaign: string;
  channel: string;
  efficiencyScore?: number;
  spendTier?: 'high' | 'medium' | 'low';
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

// ── AI Analysis types ─────────────────────────────────────────────────────

export type AiAnalysisType = 'budgetOptimizer' | 'executiveSummary';

export type AiAnalysisError = {
  code: AiErrorCode;
  message: string;
};

// ── AI response literal types ─────────────────────────────────────────────

export type ConfidenceLevel = 'High' | 'Medium' | 'Low'
export type ExecutionRisk = 'Low' | 'Medium' | 'High'
export type HealthLabel = 'Excellent' | 'Good' | 'NeedsAttention' | 'Critical'
export type InsightType = 'Performance' | 'Opportunity' | 'Warning' | 'Achievement'
export type ActionUrgency = 'Immediate' | 'ThisQuarter' | 'NextQuarter'

// ── Executive Summary output types ────────────────────────────────────────

export interface ExecutiveInsight {
  type: InsightType
  text: string
  metricHighlight: {
    label: string
    value: string
  }
}

export interface PriorityAction {
  priority: number
  action: string
  expectedOutcome: string
  urgency: ActionUrgency
  successMetric: string
}

export interface ExecutiveCorrelation {
  finding: string
  implication: string
}

export interface ExecutiveSummaryOutput {
  healthScore: {
    score: number
    label: HealthLabel
    reasoning: string
  }
  bottomLine: string
  insights: ExecutiveInsight[]
  priorityActions: PriorityAction[]
  correlations: ExecutiveCorrelation[]
}

// ── Budget Optimizer output types ─────────────────────────────────────────

export interface BudgetRecommendation {
  fromCampaign: string
  toCampaign: string
  budgetShift: number
  reason: string
  expectedImpact: {
    revenueChange: number
    conversionChange: number
    roiEstimate: number
  }
  confidence: ConfidenceLevel
  executionRisk: ExecutionRisk
}

export interface BudgetOptimizerOutput {
  summary: string
  recommendations: BudgetRecommendation[]
}

// ── Response types ────────────────────────────────────────────────────────

export type BudgetOptimizerResponse = BudgetOptimizerOutput & {
  model?: AiModel;
  timestamp?: number;
};

export type ExecutiveSummaryResponse = ExecutiveSummaryOutput & {
  model?: AiModel;
  timestamp?: number;
};
