import type {   CampaignSummary, ChannelSummary, PortfolioSummary, ScalingCandidateSignal, ShareEfficiency,   } from "../types/campaign";

export type HealthLabel = "Excellent" | "Good" | "NeedsAttention" | "Critical";
export type InsightType = "Performance" | "Opportunity" | "Warning" | "Achievement";
export type ActionUrgency = "Immediate" | "ThisQuarter" | "NextQuarter";
export type ConcentrationLevel = "Low" | "Moderate" | "High";
 
 
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

export interface InefficientChannelSignal extends ShareEfficiency {
  channel: string;
  roi: number;
  reason: string;
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
}
