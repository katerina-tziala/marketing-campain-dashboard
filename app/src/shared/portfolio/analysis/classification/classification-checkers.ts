import type {
  FunnelComparable,
  FunnelLeakThresholds,
  RoiComparable,
  UnderperformingRoiThresholds,
} from '../../types';

export function hasFunnelLeak(
  item: FunnelComparable,
  medianCtr: number | null,
  medianCvr: number | null,
  thresholds: FunnelLeakThresholds,
): boolean {
  return (
    medianCtr !== null &&
    medianCvr !== null &&
    item.ctr !== null &&
    item.cvr !== null &&
    item.ctr > medianCtr * thresholds.watchCtrFactor &&
    item.cvr < medianCvr * thresholds.watchCvrFactor
  );
}

export function hasPositiveUnderperformingRoi(
  item: RoiComparable,
  portfolioRoi: number | null,
  thresholds: UnderperformingRoiThresholds,
): boolean {
  const roi = item.roi !== null ? item.roi : -1;
  const refRoi = portfolioRoi ?? 0;
  return roi >= 0 && roi < refRoi * thresholds.watchRoiFactor;
}

export function hasRoiAbovePortfolioFactor(
  item: RoiComparable,
  portfolioRoi: number | null,
  factor: number,
): boolean {
  return item.roi !== null && portfolioRoi !== null && item.roi > portfolioRoi * factor;
}
