import type {
  CampaignSummary,
  ConcentrationFlagSignal,
  PortfolioSignalThresholds,
} from '../../types';
import { rankByRevenueDesc } from '../ranking';
import { DEFAULT_PORTFOLIO_SIGNAL_THRESHOLDS, SIGNAL_REASONS } from './constants';

function hasEnoughCampaignsForConcentration(
  campaigns: CampaignSummary[],
  thresholds: PortfolioSignalThresholds,
): boolean {
  return campaigns.length >= thresholds.minCampaignsForConcentration;
}

function getTopRevenueShares(
  campaigns: CampaignSummary[],
  thresholds: PortfolioSignalThresholds,
): Pick<ConcentrationFlagSignal, 'top1RevenueShare' | 'top3RevenueShare'> {
  const sorted = rankByRevenueDesc(campaigns);

  return {
    top1RevenueShare: sorted[0]?.revenueShare ?? 0,
    top3RevenueShare: sorted
      .slice(0, thresholds.topRevenueCampaignCount)
      .reduce((sum, campaign) => sum + campaign.revenueShare, 0),
  };
}

function isHighlyConcentrated(
  shares: Pick<ConcentrationFlagSignal, 'top1RevenueShare' | 'top3RevenueShare'>,
  thresholds: PortfolioSignalThresholds,
): boolean {
  return (
    shares.top1RevenueShare > thresholds.highTop1RevenueShare ||
    shares.top3RevenueShare > thresholds.highTop3RevenueShare
  );
}

function isModeratelyConcentrated(
  shares: Pick<ConcentrationFlagSignal, 'top1RevenueShare' | 'top3RevenueShare'>,
  thresholds: PortfolioSignalThresholds,
): boolean {
  return (
    shares.top1RevenueShare > thresholds.moderateTop1RevenueShare ||
    shares.top3RevenueShare > thresholds.moderateTop3RevenueShare
  );
}

export function getConcentrationFlag(
  campaigns: CampaignSummary[],
  thresholds: PortfolioSignalThresholds = DEFAULT_PORTFOLIO_SIGNAL_THRESHOLDS,
): ConcentrationFlagSignal {
  const shares = getTopRevenueShares(campaigns, thresholds);

  if (!hasEnoughCampaignsForConcentration(campaigns, thresholds)) {
    return {
      flagged: false,
      level: 'Low',
      ...shares,
      reason: SIGNAL_REASONS.portfolio.concentrationUnavailable,
    };
  }

  if (isHighlyConcentrated(shares, thresholds)) {
    return {
      flagged: true,
      level: 'High',
      ...shares,
      reason: SIGNAL_REASONS.portfolio.highConcentration,
    };
  }

  if (isModeratelyConcentrated(shares, thresholds)) {
    return {
      flagged: true,
      level: 'Moderate',
      ...shares,
      reason: SIGNAL_REASONS.portfolio.moderateConcentration,
    };
  }

  return {
    flagged: false,
    level: 'Low',
    ...shares,
    reason: SIGNAL_REASONS.portfolio.lowConcentration,
  };
}
