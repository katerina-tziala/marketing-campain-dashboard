import { getDynamicThresholds } from '../classification/classification-utils'
import { DEFAULT_CAMPAIGN_CLASSIFICATION_THRESHOLDS } from '../classification/constants'
import { rankByAllocationGapDesc, rankByRoiDesc } from '../ranking'
import type {
  BudgetScalingCandidate,
  CampaignClassificationThresholds,
  CampaignSummary,
  CampaignSignalThresholds,
  DynamicClassificationThresholds,
  InefficientCampaignSignal,
  ScalingCandidateSignal,
} from '../types'
import {
  DEFAULT_CAMPAIGN_SIGNAL_THRESHOLDS,
  SIGNAL_REASONS,
} from './constants'
import {
  hasRevenueShareLead,
  hasRoiAbovePortfolio,
  isOverfundedUnderperformer,
} from '../checkers'

function hasCampaignScalingEfficiency(
  campaign: CampaignSummary,
  portfolioRoi: number | null,
): boolean {
  return (
    hasRoiAbovePortfolio(campaign, portfolioRoi) &&
    hasRevenueShareLead(campaign, 0)
  )
}

function isCampaignScalingOpportunity(
  campaign: CampaignSummary,
  portfolioRoi: number | null,
  thresholds: DynamicClassificationThresholds,
): boolean {
  return (
    campaign.roi !== null &&
    campaign.budget > 0 &&
    campaign.revenue >= thresholds.minRevenue &&
    campaign.conversions >= thresholds.minConversions &&
    hasCampaignScalingEfficiency(campaign, portfolioRoi)
  )
}

function isBudgetScalingCandidate(
  campaign: CampaignSummary,
  portfolioRoi: number | null,
): boolean {
  return campaign.budget > 0 && hasCampaignScalingEfficiency(campaign, portfolioRoi)
}


function isInefficientCampaign(
  campaign: CampaignSummary,
  portfolioRoi: number | null,
  thresholds: CampaignSignalThresholds,
): boolean {
  return campaign.budget > 0 && isOverfundedUnderperformer(campaign, portfolioRoi, thresholds)
}

export function toCampaignScalingSignals(
  campaigns: CampaignSummary[],
  portfolioRoi: number | null,
  classificationThresholds: CampaignClassificationThresholds = DEFAULT_CAMPAIGN_CLASSIFICATION_THRESHOLDS,
): ScalingCandidateSignal[] {
  const dynamicThresholds = getDynamicThresholds(campaigns, classificationThresholds)
  return campaigns
    .filter(campaign => isCampaignScalingOpportunity(campaign, portfolioRoi, dynamicThresholds))
    .map(({
      campaign,
      channel,
      roi,
      budgetShare,
      revenueShare,
      allocationGap,
      efficiencyGap,
      gapAmount,
    }) => ({
      name: campaign,
      type: 'campaign' as const,
      channel,
      roi: roi!,
      budgetShare,
      revenueShare,
      allocationGap,
      efficiencyGap,
      gapAmount,
      reason: SIGNAL_REASONS.campaign.scalingOpportunity,
    }))
}

export function getBudgetScalingCandidates(
  campaigns: CampaignSummary[],
  portfolioRoi: number | null,
  thresholds: CampaignSignalThresholds = DEFAULT_CAMPAIGN_SIGNAL_THRESHOLDS,
): BudgetScalingCandidate[] {
  const budgetScalingCandidates = campaigns
    .filter(campaign => isBudgetScalingCandidate(campaign, portfolioRoi))
    .map(({
      campaign,
      channel,
      roi,
      budget,
      budgetShare,
      revenueShare,
      allocationGap,
      efficiencyGap,
      gapAmount,
    }) => ({
      campaign,
      channel,
      roi: roi!,
      budgetShare,
      revenueShare,
      allocationGap,
      efficiencyGap,
      gapAmount,
      maxAdditionalBudget: budget * thresholds.maxAdditionalFraction,
      expectedRoiRetention: thresholds.baseRoiRetention,
      reason: SIGNAL_REASONS.campaign.budgetScalingCandidate,
    }))

  return rankByRoiDesc(budgetScalingCandidates)
}

export function getInefficientCampaigns(
  campaigns: CampaignSummary[],
  portfolioRoi: number | null,
  thresholds: CampaignSignalThresholds = DEFAULT_CAMPAIGN_SIGNAL_THRESHOLDS,
): InefficientCampaignSignal[] {
  const inefficientCampaigns = campaigns
    .filter(campaign => isInefficientCampaign(campaign, portfolioRoi, thresholds))
    .map(({
      campaign,
      channel,
      roi,
      budget,
      budgetShare,
      revenueShare,
      allocationGap,
      efficiencyGap,
      gapAmount,
    }) => ({
      campaign,
      channel,
      roi,
      budgetShare,
      revenueShare,
      allocationGap,
      efficiencyGap,
      gapAmount,
      maxReducibleBudget: budget * thresholds.maxReducibleFraction,
      reason: SIGNAL_REASONS.campaign.inefficient,
    }))

  return rankByAllocationGapDesc(inefficientCampaigns)
}
