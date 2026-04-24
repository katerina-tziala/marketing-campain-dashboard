import type { BusinessContext } from "../../features/ai-tools/types";
import type { CampaignMetrics, CampaignPerformance, PerformanceMetrics } from "../types/campaign";

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
 
export interface CampaignSummary extends CampaignPerformance {
  budgetShare: number; // campaign budget / filtered total budget, decimal
  revenueShare: number; // campaign revenue / filtered total revenue, decimal
  efficiencyGap: number; // budgetShare - revenueShare, decimal
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

export interface ExecutiveSummaryInput {
  portfolio: {
    totalBudget: number;
    totalRevenue: number;
    totalConversions: number;
    aggregatedROI: number; // decimal, e.g. 1.68 = 168%
    aggregatedCAC: number | null;
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


 