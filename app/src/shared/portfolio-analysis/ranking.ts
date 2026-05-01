import { sortByValueDesc } from '../utils'
import type { RoiComparable, ShareComparable } from './types'

type RevenueRanked = {
  revenue: number
}

type BudgetRanked = {
  budget: number
}

type MaxShiftRanked = {
  maxShift: number
}

// Analysis outputs are ranked before returning so downstream UI can safely cap
// highlighted items without inventing its own priority order.
export function rankByRoiDesc<T extends RoiComparable>(items: readonly T[]): T[] {
  return sortByValueDesc(items, (item) => item.roi)
}

export function rankByAllocationGapDesc<T extends Pick<ShareComparable, 'allocationGap'>>(
  items: readonly T[],
): T[] {
  return sortByValueDesc(items, (item) => item.allocationGap)
}

export function rankByBudgetShareDesc<T extends Pick<ShareComparable, 'budgetShare'>>(
  items: readonly T[],
): T[] {
  return sortByValueDesc(items, (item) => item.budgetShare)
}

export function rankByBudgetDesc<T extends BudgetRanked>(items: readonly T[]): T[] {
  return sortByValueDesc(items, (item) => item.budget)
}

export function rankByRevenueDesc<T extends RevenueRanked>(items: readonly T[]): T[] {
  return sortByValueDesc(items, (item) => item.revenue)
}

export function rankByMaxShiftDesc<T extends MaxShiftRanked>(items: readonly T[]): T[] {
  return sortByValueDesc(items, (item) => item.maxShift)
}
