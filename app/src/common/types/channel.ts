import type { CampaignMetrics, CampaignPerformance } from './campaign'

export interface Channel extends CampaignMetrics {
  id: string
  name: string
  campaigns: CampaignPerformance[]
}
