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
  cpa: number | null
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
  aggregatedRoi: number | null; // decimal, e.g. 1.68 = 168%
  aggregatedCpa: number | null; // EUR — budget / conversions
  aggregatedCtr: number | null; // decimal, e.g. 1.68 = 168%
  aggregatedCvr: number | null; // decimal, e.g. 1.68 = 168%
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
  /** Decimal — budgetShare - revenueShare; positive means budget is over-allocated */
  allocationGap: number
  /** Decimal — revenueShare - budgetShare; positive means revenue outperforms budget weight */
  efficiencyGap: number
  /** Currency (EUR) — revenue - budget; positive means profitable */
  gapAmount: number
}
