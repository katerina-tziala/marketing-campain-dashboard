import type { AiModel } from '../../providers'

export type ConfidenceLevel = 'High' | 'Medium' | 'Low'
export type ExecutionRisk = 'Low' | 'Medium' | 'High'
export type HealthLabel = 'Excellent' | 'Good' | 'NeedsAttention' | 'Critical'
export type InsightType = 'Performance' | 'Opportunity' | 'Warning' | 'Achievement'
export type ActionUrgency = 'Immediate' | 'ThisQuarter' | 'NextQuarter'

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

export type BudgetOptimizerResponse = BudgetOptimizerOutput & {
  model?: AiModel
  timestamp?: number
}

export type ExecutiveSummaryResponse = ExecutiveSummaryOutput & {
  model?: AiModel
  timestamp?: number
}

export type AnalysisResponse = BudgetOptimizerResponse | ExecutiveSummaryResponse
