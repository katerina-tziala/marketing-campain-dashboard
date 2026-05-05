import { toFinite } from '@/shared/utils';

import type {
  OverfundedUnderperformerThresholds,
  RoiComparable,
  ShareComparable,
  UnderfundedOutperformerThresholds,
} from '../types';

export function hasRoiAbovePortfolio(item: RoiComparable, portfolioRoi: number | null): boolean {
  return item.roi !== null && (portfolioRoi === null || item.roi > portfolioRoi);
}

export function hasRoiBelowPortfolio(item: RoiComparable, portfolioRoi: number | null): boolean {
  return portfolioRoi === null || toFinite(item.roi) < portfolioRoi;
}

export function hasMinimumBudgetShare(item: ShareComparable, minBudgetShare: number): boolean {
  return item.budgetShare >= minBudgetShare;
}

export function hasMinimumRevenueShare(item: ShareComparable, minRevenueShare: number): boolean {
  return item.revenueShare >= minRevenueShare;
}

export function hasBudgetShareLead(item: ShareComparable, minGap: number): boolean {
  return item.allocationGap > minGap;
}

export function hasRevenueShareLead(item: ShareComparable, minGap: number): boolean {
  return item.efficiencyGap > minGap;
}

export function isOverfundedUnderperformer(
  item: ShareComparable & RoiComparable,
  portfolioRoi: number | null,
  thresholds: OverfundedUnderperformerThresholds,
): boolean {
  return (
    hasMinimumBudgetShare(item, thresholds.minBudgetShareSignal) &&
    hasBudgetShareLead(item, thresholds.gapThreshold) &&
    hasRoiBelowPortfolio(item, portfolioRoi)
  );
}

export function isUnderfundedOutperformer(
  item: ShareComparable & RoiComparable,
  portfolioRoi: number | null,
  thresholds: UnderfundedOutperformerThresholds,
): boolean {
  return (
    hasMinimumRevenueShare(item, thresholds.minRevenueShareSignal) &&
    hasRevenueShareLead(item, thresholds.scalingGapThreshold) &&
    hasRoiAbovePortfolio(item, portfolioRoi)
  );
}
