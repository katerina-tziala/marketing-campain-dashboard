import type { AiModel } from '../../providers';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';
export type ExecutionRisk = 'Low' | 'Medium' | 'High';
export type HealthLabel = 'Excellent' | 'Good' | 'NeedsAttention' | 'Critical';
export type InsightType = 'Performance' | 'Opportunity' | 'Warning' | 'Achievement';
export type RiskSeverity = 'Low' | 'Medium' | 'High';
export type GrowthOutlookLabel = 'High' | 'Moderate' | 'Limited';
export type PortfolioScope = 'fullPortfolio' | 'selectedSubset';

export interface ExecutiveInsight {
  type: InsightType;
  text: string;
  metricHighlight: {
    label: string;
    value: string;
  };
}

export interface KeyPriority {
  priority: number;
  title: string;
  rationale: string;
  expectedOutcome: string;
}

export interface KeyRisk {
  risk: string;
  severity: RiskSeverity;
  implication: string;
}

export interface GrowthOutlook {
  label: GrowthOutlookLabel;
  reasoning: string;
}

export interface HealthScore {
  score: number;
  label: HealthLabel;
  reasoning: string;
}

export interface ExecutiveSummaryOutput {
  scope: PortfolioScope;
  healthScore: HealthScore;
  bottomLine: string;
  overview: string;
  executiveInsights: ExecutiveInsight[];
  keyPriorities: KeyPriority[];
  keyRisks: KeyRisk[];
  growthOutlook: GrowthOutlook;
}

export interface ExpectedImpact {
  revenueChange: number | null;
  conversionChange: number | null;
  roiEstimate: number | null;
}

export interface BudgetRecommendation {
  type: 'reallocation' | 'reduction';
  fromCampaign: string;
  fromChannel: string;
  toCampaign: string | null;
  toChannel: string | null;
  budgetShift: number;
  reason: string;
  expectedImpact: ExpectedImpact;
  confidence: ConfidenceLevel;
  executionRisk: ExecutionRisk;
}

export interface BudgetExpansion {
  targetCampaign: string | null;
  targetChannel: string;
  additionalBudget: number;
  reason: string;
  expectedImpact: ExpectedImpact;
  confidence: ConfidenceLevel;
  executionRisk: ExecutionRisk;
}

export interface BudgetOptimizerOutput {
  summary: string;
  recommendations: BudgetRecommendation[];
  expansions: BudgetExpansion[];
  noRecommendationReason: string | null;
}

export type BudgetOptimizerResponse = BudgetOptimizerOutput & {
  model?: AiModel;
  timestamp?: number;
};

export type ExecutiveSummaryResponse = ExecutiveSummaryOutput & {
  model?: AiModel;
  timestamp?: number;
};

export type AnalysisResponse = BudgetOptimizerResponse | ExecutiveSummaryResponse;
