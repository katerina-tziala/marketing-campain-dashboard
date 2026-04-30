import type { PortfolioKPIs } from '@/shared/types/campaign'
import type { Channel } from '@/shared/types/channel'
import { computeShareEfficiency } from '@/shared/utils/campaign-performance'
import { CAMPAIGN_PERFORMANCE_CHART_COLORS } from '../config'

export function getChannelEfficiencyGapPercent(
  channel: Channel,
  kpis: Pick<PortfolioKPIs, 'totalBudget' | 'totalRevenue'>,
): number {
  const { efficiencyGap } = computeShareEfficiency(
    channel,
    kpis.totalBudget,
    kpis.totalRevenue,
  )
  return -efficiencyGap * 100
}

export function getEfficiencyGapColor(gapPercent: number): string {
  return gapPercent >= 0
    ? CAMPAIGN_PERFORMANCE_CHART_COLORS.positiveGap
    : CAMPAIGN_PERFORMANCE_CHART_COLORS.negativeGap
}

export function getEfficiencyGapSignedAmount(
  channel: Channel,
  gapPercent: number,
): number {
  return Math.abs(channel.revenue - channel.budget) * Math.sign(gapPercent)
}
