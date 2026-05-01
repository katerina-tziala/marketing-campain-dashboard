import { sortByValueDesc } from '@/shared/utils'

type RoiRanked = {
  roi: number | null
}

type AllocationGapRanked = {
  allocationGap: number
}

type BudgetShareRanked = {
  budgetShare: number
}

type RevenueRanked = {
  revenue: number
}

type MaxShiftRanked = {
  maxShift: number
}

// Analysis outputs are ranked before returning so downstream UI can safely cap
// highlighted items without inventing its own priority order.
export function rankByRoiDesc<T extends RoiRanked>(items: readonly T[]): T[] {
  return sortByValueDesc(items, (item) => item.roi)
}

export function rankByAllocationGapDesc<T extends AllocationGapRanked>(
  items: readonly T[],
): T[] {
  return sortByValueDesc(items, (item) => item.allocationGap)
}

export function rankByBudgetShareDesc<T extends BudgetShareRanked>(
  items: readonly T[],
): T[] {
  return sortByValueDesc(items, (item) => item.budgetShare)
}

export function rankByRevenueDesc<T extends RevenueRanked>(items: readonly T[]): T[] {
  return sortByValueDesc(items, (item) => item.revenue)
}

export function rankByMaxShiftDesc<T extends MaxShiftRanked>(items: readonly T[]): T[] {
  return sortByValueDesc(items, (item) => item.maxShift)
}
