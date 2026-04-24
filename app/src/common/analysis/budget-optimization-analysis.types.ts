import type { CampaignSummary, ChannelSummary, PortfolioSummary, ShareEfficiency } from "../types/campaign";

export type ConfidenceLevel = "High" | "Medium" | "Low";
export type ExecutionRisk = "Low" | "Medium" | "High";

export interface InefficientCampaignSignal extends ShareEfficiency {
  campaign: string;
  channel: string;
  roi: number | null;
  maxReducibleBudget: number;
  reason: string;
}

export interface BudgetScalingCandidate extends ShareEfficiency {
  campaign: string;
  channel: string;
  roi: number;
  maxAdditionalBudget: number;
  expectedRoiRetention: number;
  reason: string;
}

export interface TransferCandidate {
  fromCampaign: string;
  toCampaign: string;
  minShift: number;
  maxShift: number;
  expectedRoiRetention: number;
  reason: string;
}

export interface BudgetOptimizerAnalysis {
  portfolio: PortfolioSummary;
  campaigns: CampaignSummary[];
  channels: ChannelSummary[];
  derivedSignals: {
    inefficientCampaigns: InefficientCampaignSignal[];
    scalingCandidates: BudgetScalingCandidate[];
    transferCandidates: TransferCandidate[];
  };
}
