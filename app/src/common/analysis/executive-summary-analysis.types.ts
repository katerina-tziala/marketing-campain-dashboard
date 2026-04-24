import type { BusinessContext } from "../../features/ai-tools/types";
import type { CampaignMetrics, CampaignPerformance, PerformanceMetrics, PortfolioKPIs, ShareEfficiency } from "../types/campaign";

export type SummaryMetricStatus = "Strong" | "Moderate" | "Weak";
export type HealthLabel = "Excellent" | "Good" | "NeedsAttention" | "Critical";
export type InsightType = "Performance" | "Opportunity" | "Warning" | "Achievement";
export type ActionUrgency = "Immediate" | "ThisQuarter" | "NextQuarter";
export type ConcentrationLevel = "Low" | "Moderate" | "High";

export interface ChannelSummary extends CampaignMetrics, PerformanceMetrics, ShareEfficiency {
  channel: string;
  status: SummaryMetricStatus;
}

export interface CampaignSummary extends CampaignPerformance, ShareEfficiency {}

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

export interface PortfolioSummary extends PortfolioKPIs {
  campaignCount: number;
  channelCount: number;
}

export interface SummaryAnalysis {
  portfolio: PortfolioSummary;
  channels: ChannelSummary[];
  topCampaigns: CampaignSummary[];
  bottomCampaigns: CampaignSummary[];
  derivedSignals: {
    inefficientChannels: InefficientChannelSignal[];
    scalingCandidates: ScalingCandidateSignal[];
    concentrationFlag: ConcentrationFlagSignal;
    correlations?: CorrelationSignal[];
  };
  businessContext?: BusinessContext;
}
