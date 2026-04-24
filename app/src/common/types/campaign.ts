export interface CampaignMetrics {
  budget: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
}

export interface PerformanceMetrics {
  /** Decimal ratio — (revenue - budget) / budget. e.g. 1.68 = 168% ROI */
  roi: number | null
  /** Decimal ratio — clicks / impressions. e.g. 0.05 = 5% CTR */
  ctr: number | null
  /** Decimal ratio — conversions / clicks. e.g. 0.12 = 12% CVR */
  cvr: number | null
  /** Currency (EUR) — budget / conversions */
  cac: number | null
}

export interface Campaign extends CampaignMetrics {
  rowId: number
  campaign: string
  channel: string
}

export interface CampaignPerformance extends Campaign, PerformanceMetrics { }

export interface PortfolioKPIs {
  totalBudget: number;
  totalRevenue: number;
  totalConversions: number;
  totalImpressions: number
  totalClicks: number
  aggregatedROI: number | null; // decimal, e.g. 1.68 = 168%
  aggregatedCAC: number | null; // decimal, 
  aggregatedCTR: number | null; // decimal, e.g. 1.68 = 168%
  aggregatedCVR: number | null; // decimal, e.g. 1.68 = 168%
}

export interface PortfolioScope {
  campaigns: string[]
  channels: string[]
  selectedCampaigns: string[]
  selectedChannels: string[]
}

export interface ShareEfficiency {
  /** Decimal — item budget / total budget */
  budgetShare: number
  /** Decimal — item revenue / total revenue */
  revenueShare: number
  /** Decimal — budgetShare - revenueShare; negative means revenue outperforms budget weight */
  efficiencyGap: number
}

export interface PortfolioSummary extends PortfolioKPIs {
  campaignCount: number;
  channelCount: number;
}


export type SummaryMetricStatus = "Strong" | "Moderate" | "Weak";

export interface ChannelSummary extends CampaignMetrics, PerformanceMetrics, ShareEfficiency {
  channel: string;
  status: SummaryMetricStatus;
}

export interface CampaignSummary extends CampaignPerformance, ShareEfficiency { }

 export interface ScalingCandidateSignal extends ShareEfficiency {
  name: string;
  type: "campaign" | "channel";
  channel?: string;
  roi: number;
  reason: string;
    /**
   * Optional hard cap on how much additional budget may be added safely.
   * If present, AI should not exceed it.
   */
  maxAdditionalBudget?: number;
}
