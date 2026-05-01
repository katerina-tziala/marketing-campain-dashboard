import type { PortfolioAnalysis } from '@/shared/portfolio-analysis'
import type { AiModel } from '../../providers'
import type { AiAnalysisType, AiProviderType } from '../../types'

// ── Business context ──────────────────────────────────────────────────────────

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

// ── AI response literal types ─────────────────────────────────────────────────

export type ConfidenceLevel = 'High' | 'Medium' | 'Low'
export type ExecutionRisk = 'Low' | 'Medium' | 'High'
export type HealthLabel = 'Excellent' | 'Good' | 'NeedsAttention' | 'Critical'
export type InsightType = 'Performance' | 'Opportunity' | 'Warning' | 'Achievement'
export type ActionUrgency = 'Immediate' | 'ThisQuarter' | 'NextQuarter'

// ── Executive Summary output types ────────────────────────────────────────────

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

export interface HealthScore {
  score: number
  label: HealthLabel
  reasoning: string
}

export interface ExecutiveSummaryOutput {
  healthScore: HealthScore
  bottomLine: string
  insights: ExecutiveInsight[]
  priorityActions: PriorityAction[]
  correlations: ExecutiveCorrelation[]
}

// ── Budget Optimizer output types ─────────────────────────────────────────────

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

// ── Response types ────────────────────────────────────────────────────────────

export type BudgetOptimizerResponse = BudgetOptimizerOutput & {
  model?: AiModel;
  timestamp?: number;
};

export type ExecutiveSummaryResponse = ExecutiveSummaryOutput & {
  model?: AiModel;
  timestamp?: number;
};

// ── Shared analysis orchestration types ──────────────────────────────────────

export type AnalysisResponse = BudgetOptimizerResponse | ExecutiveSummaryResponse

export type AnalysisContext = {
  type: AiAnalysisType;
  analysis: PortfolioAnalysis;
  isFiltered: boolean;
  businessContext?: BusinessContext;
}

export interface AIProviderState {
  provider: AiProviderType;
  apiKey: string;
  selectedModel: AiModel;
}

// ── Store context types ───────────────────────────────────────────────────────

export interface PortfolioContext {
  portfolioTitle: string
  channelCount: number
  campaignCount: number
  filtersActive: boolean
}

export interface AiAnalysisContext extends PortfolioContext {
  portfolioId: string
  selectedChannelIds: string[]
  portfolioAnalysis: PortfolioAnalysis
}
