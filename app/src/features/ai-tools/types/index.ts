import type { AiModel } from '../providers/types'
import type { BudgetOptimizerOutput, ExecutiveSummaryOutput } from '../ai-analysis/types/executive-summary.types'

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
  period?: string; // e.g. "Last 90 days"
  industry?: string; // e.g. "E-commerce"
  goal?: string; // e.g. "Improve efficiency" or "Scale qualified demand"
  businessStage?: string; // e.g. "Growth", "Mature", "Launch"
  attributionModel?: string; // e.g. "Last click", "Data-driven"
  riskTolerance?: string; // e.g. "Low", "Moderate", "High"
  scalingTolerance?: string; // e.g. "Conservative", "Balanced", "Aggressive"
  constraints?: string[]; // strategic or operational constraints
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

export type BudgetOptimizerResponse = BudgetOptimizerOutput & {
  model?: AiModel;
  timestamp?: number;
};

// ── AI Analysis types ─────────────────────────────────────────────────────

export type AiAnalysisTab = 'optimizer' | 'summary';

export type AiAnalysisError = {
  code: AiErrorCode;
  message: string;
};

export type ExecutiveSummaryResponse = ExecutiveSummaryOutput & {
  model?: AiModel;
  timestamp?: number;
};
