export interface CampaignMetrics {
  budget: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
}

export interface PerformanceMetrics {
  roi: number | null
  ctr: number | null
  cvr: number | null
  cac: number | null
}

export interface CampaignKPIs extends CampaignMetrics, PerformanceMetrics {}

export interface Campaign extends CampaignMetrics {
  campaign: string
  channel: string
}
 
export interface CampaignPerformance extends Campaign, PerformanceMetrics {}

export interface CampaignScope {
  campaigns: string[]
  selectedCampaigns: string[]
  selectedChannels: string[]
}

