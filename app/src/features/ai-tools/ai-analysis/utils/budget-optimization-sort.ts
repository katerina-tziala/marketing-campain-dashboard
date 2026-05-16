import type { BudgetRecommendation } from '../types';

export function sortReallocationsByRevenueDesc(
  recommendations: BudgetRecommendation[],
): BudgetRecommendation[] {
  return recommendations.slice().sort((a, b) => {
    const aRev = a.expectedImpact.revenueChange;
    const bRev = b.expectedImpact.revenueChange;
    if (aRev === null && bRev === null) {
      return 0;
    }
    if (aRev === null) {
      return 1;
    }
    if (bRev === null) {
      return -1;
    }
    return bRev - aRev;
  });
}
