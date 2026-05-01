import type {
  CampaignMetrics,
  CampaignPerformance,
  PerformanceMetrics,
  PortfolioKPIs,
  ShareEfficiency,
} from '../../types'

export interface PortfolioSummary extends PortfolioKPIs {
  campaignCount: number;
  channelCount: number;
}

export type SummaryMetricStatus = 'Strong' | 'Moderate' | 'Weak';

export interface ChannelSummary extends CampaignMetrics, PerformanceMetrics, ShareEfficiency {
  channel: string;
  status: SummaryMetricStatus;
}

export interface CampaignSummary extends CampaignPerformance, ShareEfficiency { }
