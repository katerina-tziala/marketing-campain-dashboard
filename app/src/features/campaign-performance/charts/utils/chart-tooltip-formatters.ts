import type { PortfolioKPIs } from '@/shared/portfolio'
import { formatCurrency, formatPercentage } from '@/shared/utils'
import { safeDivide } from '@/shared/utils'

type RoiAllocationTooltipItem = {
  roi: number | null
  revenue: number
  budget: number
}

type RoiBudgetScalingTooltipItem = RoiAllocationTooltipItem & {
  channel: string
}

export function formatChannelTooltip(
  channel: string,
): string {
  return `Channel: ${channel}`
}

export function formatRoiTooltip(
  roi: number | null,
): string {
  return `ROI: ${formatPercentage(roi)}`
}

export function formatBudgetTooltip(
  budget: number,
): string {
  return `Budget: ${formatCurrency(budget)}`;
}

export function formatRevenueTooltip(
  revenue: number,
): string {
  return `Revenue: ${formatCurrency(revenue)}`;
}

export function formatRoiBudgetScalingTooltipLines(
  item: RoiBudgetScalingTooltipItem,
): string[] {
  return [
    formatChannelTooltip(item.channel),
    formatRoiTooltip(item.roi),
    formatBudgetTooltip(item.budget),
    formatRevenueTooltip(item.revenue),
  ]
}

export function formatBudgetTooltipLines(
  budget: number,
  totalBudget: number,
): string[] {
  return [
    formatBudgetTooltip(budget),
    `Budget Share: ${formatPercentage(safeDivide(budget, totalBudget))}`,
  ]
}

export function formatRoiAllocationTooltipLines(
  item: RoiAllocationTooltipItem,
  kpis: Pick<PortfolioKPIs, 'totalBudget' | 'totalRevenue'>,
): string[] {
  const [budgetLabel, budgetShareLabel] = formatBudgetTooltipLines(item.budget, kpis.totalBudget)
  return [
    formatRoiTooltip(item.roi),
    budgetLabel,
    formatRevenueTooltip(item.revenue),
    budgetShareLabel,
    `Revenue Share: ${formatPercentage(safeDivide(item.revenue, kpis.totalRevenue))}`,
  ]
}
