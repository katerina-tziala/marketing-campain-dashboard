import type { Channel } from '@/shared/data';
import type { PortfolioKPIs } from '@/shared/portfolio';
import { computeShareEfficiency } from '@/shared/portfolio';

import type { CampaignPerformanceChartColors } from '../types';

export function getChannelEfficiencyGapPercent(
  channel: Channel,
  kpis: Pick<PortfolioKPIs, 'totalBudget' | 'totalRevenue'>,
): number {
  const { efficiencyGap } = computeShareEfficiency(channel, kpis.totalBudget, kpis.totalRevenue);
  return efficiencyGap * 100;
}

export function getEfficiencyGapColor(
  gapPercent: number,
  colors: Pick<CampaignPerformanceChartColors, 'positiveGap' | 'negativeGap'>,
): string {
  return gapPercent >= 0 ? colors.positiveGap : colors.negativeGap;
}

export function getEfficiencyGapSignedAmount(channel: Channel, gapPercent: number): number {
  return Math.abs(channel.revenue - channel.budget) * Math.sign(gapPercent);
}
