import type { ConfidenceLevel, ExecutionRisk } from "../../../../common/analysis/budget-optimization-analysis.types";
import type { ActionUrgency, HealthLabel, InsightType } from "../../../../common/analysis/executive-summary-analysis.types";
 
export interface ExecutiveInsight {
  type: InsightType;
  text: string;
  metricHighlight: {
    label: string;
    value: string;
  };
}

export interface PriorityAction {
  priority: number;
  action: string;
  expectedOutcome: string;
  urgency: ActionUrgency;
  successMetric: string;
}

export interface ExecutiveCorrelation {
  finding: string;
  implication: string;
}

export interface ExecutiveSummaryOutput {
  healthScore: {
    score: number;
    label: HealthLabel;
    reasoning: string;
  };
  bottomLine: string;
  insights: ExecutiveInsight[];
  priorityActions: PriorityAction[];
  correlations: ExecutiveCorrelation[];
}

/**
 * A single budget reallocation or expansion recommendation.
 *
 * Notes:
 * - fromCampaign and toCampaign define the move
 * - budgetShift is absolute numeric amount
 * - expectedImpact should stay conservative
 */
export interface BudgetRecommendation {
  fromCampaign: string; // source of budget
  toCampaign: string; // destination of budget
  budgetShift: number; // absolute budget amount being moved or added
  reason: string; // why this change improves efficiency
  expectedImpact: {
    revenueChange: number; // incremental expected revenue impact
    conversionChange: number; // incremental expected conversion impact
    roiEstimate: number; // projected ROI after the move, decimal
  }; 
  confidence: ConfidenceLevel; // confidence in recommendation quality
  executionRisk: ExecutionRisk; // operational/scaling risk of executing the move
}

/**
 * Full structured response returned by the model.
 * This is intentionally narrow: one summary + up to 3 recommendations.
 */
export interface BudgetOptimizerOutput {
  summary: string; // one-sentence overview of the main optimization opportunity
  recommendations: BudgetRecommendation[];
}
