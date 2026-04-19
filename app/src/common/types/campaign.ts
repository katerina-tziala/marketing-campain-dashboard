export interface Campaign {
  campaign: string
  channel: string
  budget: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
}

export interface CampaignPerformance extends Campaign {
  roi: number | null
  ctr: number | null
  cvr: number | null
  cac: number | null
}

export interface CampaignScope {
  campaigns: string[]
  selectedCampaigns: string[]
  selectedChannels: string[]
}

export interface CampaignKPIs {
  totalBudget: number
  totalRevenue: number
  roi: number
  ctr: number
  cvr: number
  cac: number | null
  totalImpressions: number
  totalClicks: number
  totalConversions: number
}
