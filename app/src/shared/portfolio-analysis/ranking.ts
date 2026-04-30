import { sortByValueDesc } from '@/shared/utils/sorting'

type RoiRanked = {
  roi: number | null
}

type EfficiencyGapRanked = {
  efficiencyGap: number
}

type BudgetShareRanked = {
  budgetShare: number
}

// Analysis outputs are ranked before returning so downstream UI can safely cap
// highlighted items without inventing its own priority order.
export function rankByRoiDesc<T extends RoiRanked>(items: readonly T[]): T[] {
  return sortByValueDesc(items, (item) => item.roi)
}

export function rankByEfficiencyGapDesc<T extends EfficiencyGapRanked>(
  items: readonly T[],
): T[] {
  return sortByValueDesc(items, (item) => item.efficiencyGap)
}

export function rankByBudgetShareDesc<T extends BudgetShareRanked>(
  items: readonly T[],
): T[] {
  return sortByValueDesc(items, (item) => item.budgetShare)
}
