import type { BusinessContext } from ".";
import type { CampaignMetrics, CampaignPerformance, PerformanceMetrics } from "../../../common/types/campaign";

export type SummaryMetricStatus = "Strong" | "Moderate" | "Weak";
export type HealthLabel = "Excellent" | "Good" | "NeedsAttention" | "Critical";
export type InsightType = "Performance" | "Opportunity" | "Warning" | "Achievement";
export type ActionUrgency = "Immediate" | "ThisQuarter" | "NextQuarter";
export type ConcentrationLevel = "Low" | "Moderate" | "High";


export interface ChannelSummary extends CampaignMetrics, PerformanceMetrics {
  channel: string;
  budgetShare: number; // decimal
  revenueShare: number; // decimal
  efficiencyGap: number; // budgetShare - revenueShare
  status: SummaryMetricStatus;
}

// efficiencyGap = budgetShare - revenueShare
// budgetShare = campaign budget / filtered total budget
// revenueShare = campaign revenue / filtered total revenue

export interface CampaignSummary extends CampaignPerformance {
  budgetShare: number; // share of total scoped budget, decimal
  revenueShare: number; // share of total scoped revenue, decimal
  efficiencyGap: number; // budgetShare - revenueShare
}

export interface ExecutiveSummaryInput {
  portfolio: {
    totalBudget: number;
    totalRevenue: number;
    aggregatedRoi: number; // decimal, e.g. 1.68 = 168%
    totalConversions: number;
    totalCac?: number | null;
    campaignCount: number;
    channelCount: number;
  };
  channels: ChannelSummary[];
  topCampaigns: CampaignSummary[]; // recommended: 3-5
  bottomCampaigns: CampaignSummary[]; // recommended: 3-5
  derivedSignals: {
    inefficientChannels: InefficientChannelSignal[];
    scalingCandidates: ScalingCandidateSignal[];
    concentrationFlag: ConcentrationFlagSignal;
    correlations?: CorrelationSignal[];
  };
  businessContext?: BusinessContext;
}

export interface InefficientChannelSignal {
  channel: string;
  budgetShare: number;
  revenueShare: number;
  efficiencyGap: number;
  roi: number;
  reason: string;
}

export interface ScalingCandidateSignal {
  name: string;
  type: "campaign" | "channel";
  channel?: string;
  roi: number;
  budgetShare: number;
  revenueShare?: number;
  reason: string;
}

export interface ConcentrationFlagSignal {
  flagged: boolean;
  level: ConcentrationLevel;
  top1RevenueShare: number;
  top3RevenueShare: number;
  reason: string;
}

export interface CorrelationSignal {
  finding: string;
  evidence: string;
  implication: string;
}


// ===============================
// Output Types
// ===============================

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
