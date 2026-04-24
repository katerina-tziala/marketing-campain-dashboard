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
