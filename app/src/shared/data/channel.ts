import type { CampaignMetrics, CampaignPerformance, PerformanceMetrics } from './campaign'

export interface Channel extends CampaignMetrics, PerformanceMetrics {
  id: string
  name: string
  campaigns: CampaignPerformance[]
}
