import type { CampaignPerformance, CampaignRawMetrics, PerformanceMetrics } from '@/shared/data';

import type { PortfolioKPIs } from './portfolio';

export interface ShareEfficiency {
  /** Decimal — item budget / total budget */
  budgetShare: number;
  /** Decimal — item revenue / total revenue */
  revenueShare: number;
  /** Decimal — budgetShare - revenueShare; positive means budget is over-allocated */
  allocationGap: number;
  /** Decimal — revenueShare - budgetShare; positive means revenue outperforms budget weight */
  efficiencyGap: number;
  /** Currency (EUR) — revenue - budget; positive means profitable */
  gapAmount: number;
}

export interface PortfolioSummary extends PortfolioKPIs {
  campaignCount: number;
  channelCount: number;
  /** Decimal ratio — average ROI across campaigns with valid ROI values. */
  averageCampaignRoi?: number | null;
  /** Decimal ratio — median ROI across campaigns with valid ROI values. */
  medianCampaignRoi?: number | null;
}

export type SummaryMetricStatus = 'Strong' | 'Moderate' | 'Weak';

export interface ChannelSummary extends CampaignRawMetrics, PerformanceMetrics, ShareEfficiency {
  channel: string;
  status: SummaryMetricStatus;
}

export interface CampaignSummary extends CampaignPerformance, ShareEfficiency {}
