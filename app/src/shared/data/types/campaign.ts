export interface CampaignRawMetrics {
  budget: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface PerformanceMetrics {
  /** Decimal ratio — (revenue - budget) / budget. e.g. 1.68 = 168% ROI */
  roi: number | null;
  /** Decimal ratio — clicks / impressions. e.g. 0.05 = 5% CTR */
  ctr: number | null;
  /** Decimal ratio — conversions / clicks. e.g. 0.12 = 12% CVR */
  cvr: number | null;
  /** Currency (EUR) — budget / conversions */
  cpa: number | null;
}

export interface Campaign extends CampaignRawMetrics {
  rowId: number;
  campaign: string;
  channel: string;
}

export interface CampaignPerformance extends Campaign, PerformanceMetrics {}
