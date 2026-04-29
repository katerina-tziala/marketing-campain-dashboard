import type { PortfolioKPIs } from '@/shared/types/campaign'
import { formatCurrency, formatPercentage } from '@/shared/utils/formatters'
import { safeDivide } from '@/shared/utils/math'

type RoiAllocationTooltipItem = {
  roi: number | null
  revenue: number
  budget: number
}

export function formatBudgetTooltipLines(
  budget: number,
  totalBudget: number,
): string[] {
  return [
    `Budget: ${formatCurrency(budget)}`,
    `Budget Share: ${formatPercentage(safeDivide(budget, totalBudget))}`,
  ]
}

export function formatRoiAllocationTooltipLines(
  item: RoiAllocationTooltipItem,
  kpis: Pick<PortfolioKPIs, 'totalBudget' | 'totalRevenue'>,
): string[] {
  return [
    `ROI: ${formatPercentage(item.roi)}`,
    `Revenue: ${formatCurrency(item.revenue)}`,
    ...formatBudgetTooltipLines(item.budget, kpis.totalBudget),
    `Revenue Share: ${formatPercentage(safeDivide(item.revenue, kpis.totalRevenue))}`,
  ]
}
