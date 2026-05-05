import type { CampaignPerformance, CampaignRawMetrics, PerformanceMetrics } from './campaign';

export interface Channel extends CampaignRawMetrics, PerformanceMetrics {
  id: string;
  name: string;
  campaigns: CampaignPerformance[];
}
