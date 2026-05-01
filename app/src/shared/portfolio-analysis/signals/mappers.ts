import type { CampaignPerformance, Channel } from '../../types'
import { computeShareEfficiency } from '../metrics'
import type {
  CampaignSummary,
  ChannelStatusThresholds,
  ChannelSummary,
  SummaryMetricStatus,
} from '../types'
import {
  DEFAULT_CHANNEL_STATUS_THRESHOLDS,
} from './constants'

function computeChannelStatus(
  channelRoi: number | null,
  portfolioRoi: number | null,
  thresholds: ChannelStatusThresholds,
): SummaryMetricStatus {
  if (channelRoi === null || portfolioRoi === null) return 'Moderate'
  if (channelRoi > portfolioRoi * thresholds.strongStatusRoiFactor) return 'Strong'
  if (channelRoi < portfolioRoi * thresholds.weakStatusRoiFactor) return 'Weak'
  return 'Moderate'
}

export function toCampaignSummary(
  campaign: CampaignPerformance,
  totalBudget: number,
  totalRevenue: number,
): CampaignSummary {
  return {
    ...campaign,
    ...computeShareEfficiency(campaign, totalBudget, totalRevenue),
  }
}

export function toChannelSummary(
  channel: Channel,
  totalBudget: number,
  totalRevenue: number,
  portfolioRoi: number | null,
  thresholds: ChannelStatusThresholds = DEFAULT_CHANNEL_STATUS_THRESHOLDS,
): ChannelSummary {
  const { campaigns, id, name, ...metrics } = channel
  return {
    channel: name,
    ...metrics,
    ...computeShareEfficiency(channel, totalBudget, totalRevenue),
    status: computeChannelStatus(channel.roi, portfolioRoi, thresholds),
  }
}
