import type {
  BudgetScalingCandidate,
  InefficientCampaignSignal,
  PortfolioSignalThresholds,
  TransferCandidate,
} from '../../types';
import { rankByMaxShiftDesc } from '../ranking';
import { DEFAULT_PORTFOLIO_SIGNAL_THRESHOLDS, SIGNAL_REASONS } from './constants';

function getMinShiftBudget(
  maxReducibleBudget: number,
  thresholds: PortfolioSignalThresholds,
): number {
  return Math.max(thresholds.minShiftFloor, maxReducibleBudget * thresholds.minShiftFraction);
}

function toTransferCandidatesForTarget(
  target: BudgetScalingCandidate,
  inefficient: InefficientCampaignSignal[],
  thresholds: PortfolioSignalThresholds,
): TransferCandidate[] {
  return inefficient.flatMap(({ campaign, maxReducibleBudget }) => {
    if (campaign === target.campaign) {
      return [];
    }

    const minShift = getMinShiftBudget(maxReducibleBudget, thresholds);
    const maxShift = Math.min(maxReducibleBudget, target.maxAdditionalBudget);
    if (maxShift <= minShift) {
      return [];
    }

    return {
      fromCampaign: campaign,
      toCampaign: target.campaign,
      minShift: Math.round(minShift),
      maxShift: Math.round(maxShift),
      expectedRoiRetention: target.expectedRoiRetention,
      reason: SIGNAL_REASONS.portfolio.transferCandidate(campaign, target.campaign),
    };
  });
}

export function getTransferCandidates(
  inefficient: InefficientCampaignSignal[],
  scaling: BudgetScalingCandidate[],
  thresholds: PortfolioSignalThresholds = DEFAULT_PORTFOLIO_SIGNAL_THRESHOLDS,
): TransferCandidate[] {
  const candidates = scaling.flatMap((target) =>
    toTransferCandidatesForTarget(target, inefficient, thresholds),
  );

  return rankByMaxShiftDesc(candidates).slice(0, thresholds.maxTransferCandidates);
}
