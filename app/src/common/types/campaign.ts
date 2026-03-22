export interface Campaign {
  campaign: string
  channel: string
  budget: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
}

export interface CampaignKPIs {
  totalBudget: number
  totalRevenue: number
  roi: number
  ctr: number
  cvr: number
  cac: number
}
