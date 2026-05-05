import type { CampaignGroups, ChannelGroups } from './groups';
import type {
  BudgetScalingCandidate,
  ConcentrationFlagSignal,
  CorrelationSignal,
  InefficientCampaignSignal,
  InefficientChannelSignal,
  ScalingCandidateSignal,
  TransferCandidate,
} from './signals';
import type { ChannelSummary, PortfolioSummary } from './summary';

export interface DerivedSignals {
  inefficientChannels: InefficientChannelSignal[];
  inefficientCampaigns: InefficientCampaignSignal[];
  scalingOpportunities: ScalingCandidateSignal[];
  budgetScalingCandidates: BudgetScalingCandidate[];
  transferCandidates: TransferCandidate[];
  concentrationFlag: ConcentrationFlagSignal;
  correlations?: CorrelationSignal[];
}

export interface ChannelContext {
  topByBudget: ChannelSummary[];
  topByRevenue: ChannelSummary[];
}

export interface PortfolioAnalysis {
  portfolio: PortfolioSummary;
  /** Flat list of all channel summaries — use for tables and raw enumeration. */
  channels: ChannelSummary[];
  /** Compact ranked channel context for analysis and prompts. */
  channelContext: ChannelContext;
  /** Mutually exclusive campaign classification groups. */
  campaignGroups: CampaignGroups;
  /** Mutually exclusive channel classification groups. */
  channelGroups: ChannelGroups;
  derivedSignals: DerivedSignals;
}
