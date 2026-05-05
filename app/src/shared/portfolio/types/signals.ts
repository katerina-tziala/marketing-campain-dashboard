import type { ShareEfficiency } from './summary';

export interface ScalingCandidateSignal extends ShareEfficiency {
  name: string;
  type: 'campaign' | 'channel';
  channel?: string;
  roi: number;
  reason: string;
  maxAdditionalBudget?: number;
}

export interface InefficientChannelSignal extends ShareEfficiency {
  channel: string;
  roi: number;
  reason: string;
}

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

export type ConcentrationLevel = 'Low' | 'Moderate' | 'High';

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
