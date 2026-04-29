import type { PortfolioKPIs } from '@/shared/types/campaign'
import { formatCurrency, formatPercentage } from '@/shared/utils/formatters'
import { safeDivide } from '@/shared/utils/math'

type RoiAllocationTooltipItem = {
  roi: number | null
  revenue: number
  budget: number
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
    `ROI: ${formatPercentage(item.roi)}`,
    budgetLabel,
    formatRevenueTooltip(item.revenue),
    budgetShareLabel,
    `Revenue Share: ${formatPercentage(safeDivide(item.revenue, kpis.totalRevenue))}`,
  ]
}
