export interface RoiComparable {
  roi: number | null;
}

export interface FunnelComparable {
  ctr: number | null;
  cvr: number | null;
}

export interface ShareComparable {
  budgetShare: number;
  revenueShare: number;
  allocationGap: number;
  efficiencyGap: number;
}

export interface OverfundedUnderperformerThresholds {
  gapThreshold: number;
  minBudgetShareSignal: number;
}

export interface UnderfundedOutperformerThresholds {
  scalingGapThreshold: number;
  minRevenueShareSignal: number;
}
