import type { CampaignPerformance } from '@/shared/types/campaign'
import type { CampaignSummary, ChannelSummary, ScalingCandidateSignal, SummaryMetricStatus } from './types'
import type { Channel } from '@/shared/types/channel'
import { computeShareEfficiency } from '@/shared/utils/campaign-performance'
import type {
  BudgetScalingCandidate,
  ConcentrationFlagSignal,
  CorrelationSignal,
  InefficientCampaignSignal,
  InefficientChannelSignal,
  TransferCandidate,
} from './types'
import { getDynamicThresholds } from './classify-utils'
import { rankByEfficiencyGapDesc, rankByRoiDesc } from './ranking'

// ── Constants ─────────────────────────────────────────────────────────────────

const GAP_THRESHOLD = 0.05
const MIN_BUDGET_SHARE_SIGNAL = 0.02
const MAX_REDUCIBLE_FRACTION = 0.5
const MAX_ADDITIONAL_FRACTION = 2.0
const BASE_ROI_RETENTION = 0.85
const MIN_SHIFT_FRACTION = 0.1
const MIN_SHIFT_FLOOR = 50

// ── Shared helpers ────────────────────────────────────────────────────────────

export function toFinite(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

// ── Summary mapping ───────────────────────────────────────────────────────────

function computeChannelStatus(
  channelRoi: number | null,
  portfolioRoi: number | null,
): SummaryMetricStatus {
  if (channelRoi === null || portfolioRoi === null) return 'Moderate'
  if (channelRoi > portfolioRoi * 1.1) return 'Strong'
  if (channelRoi < portfolioRoi * 0.9) return 'Weak'
  return 'Moderate'
}

export function toCampaignSummary(
  campaign: CampaignPerformance,
  totalBudget: number,
  totalRevenue: number,
): CampaignSummary {
  return {
    ...campaign,
    ...computeShareEfficiency(campaign, totalBudget, totalRevenue),
  }
}

export function toChannelSummary(
  channel: Channel,
  totalBudget: number,
  totalRevenue: number,
  portfolioRoi: number | null,
): ChannelSummary {
  const { campaigns, id, name, ...metrics } = channel
  return {
    channel: name,
    ...metrics,
    ...computeShareEfficiency(channel, totalBudget, totalRevenue),
    status: computeChannelStatus(channel.roi, portfolioRoi),
  }
}

// ── Channel signals ───────────────────────────────────────────────────────────

export function getInefficientChannels(
  channels: ChannelSummary[],
  portfolioRoi: number | null,
): InefficientChannelSignal[] {
  const inefficientChannels = channels
    .filter(ch =>
      ch.efficiencyGap > GAP_THRESHOLD &&
      (portfolioRoi === null || toFinite(ch.roi) < portfolioRoi),
    )
    .map(ch => ({
      channel: ch.channel,
      budgetShare: ch.budgetShare,
      revenueShare: ch.revenueShare,
      efficiencyGap: ch.efficiencyGap,
      gapAmount: ch.gapAmount,
      roi: toFinite(ch.roi),
      reason: 'Budget share exceeds revenue share with weaker efficiency.',
    }))

  return rankByEfficiencyGapDesc(inefficientChannels)
}

// ── Scaling opportunities (mixed campaign + channel) ──────────────────────────

function toCampaignScalingSignals(
  campaigns: CampaignSummary[],
  portfolioRoi: number | null,
): ScalingCandidateSignal[] {
  const thresholds = getDynamicThresholds(campaigns)
  return campaigns
    .filter(c =>
      c.roi !== null &&
      c.budget > 0 &&
      c.revenue >= thresholds.minRevenue &&
      c.conversions >= thresholds.minConversions &&
      (portfolioRoi === null || c.roi! > portfolioRoi) &&
      c.revenueShare > c.budgetShare,
    )
    .map(c => ({
      name: c.campaign,
      type: 'campaign' as const,
      channel: c.channel,
      roi: c.roi!,
      budgetShare: c.budgetShare,
      revenueShare: c.revenueShare,
      efficiencyGap: c.efficiencyGap,
      gapAmount: c.gapAmount,
      reason: 'Strong efficiency with revenue share exceeding budget share.',
    }))
}

function toChannelScalingSignals(
  channels: ChannelSummary[],
  portfolioRoi: number | null,
): ScalingCandidateSignal[] {
  return channels
    .filter(ch =>
      ch.roi !== null &&
      (portfolioRoi === null || ch.roi! > portfolioRoi) &&
      ch.revenueShare > ch.budgetShare,
    )
    .map(ch => ({
      name: ch.channel,
      type: 'channel' as const,
      roi: ch.roi!,
      budgetShare: ch.budgetShare,
      revenueShare: ch.revenueShare,
      efficiencyGap: ch.efficiencyGap,
      gapAmount: ch.gapAmount,
      reason: 'Channel outperforms its budget allocation.',
    }))
}

export function getScalingOpportunities(
  campaigns: CampaignSummary[],
  channels: ChannelSummary[],
  portfolioRoi: number | null,
): ScalingCandidateSignal[] {
  const scalingOpportunities = [
    ...toCampaignScalingSignals(campaigns, portfolioRoi),
    ...toChannelScalingSignals(channels, portfolioRoi),
  ]

  return rankByRoiDesc(scalingOpportunities).slice(0, 5)
}

// ── Budget scaling candidates (campaign-only) ─────────────────────────────────

export function getBudgetScalingCandidates(
  campaigns: CampaignSummary[],
  portfolioRoi: number | null,
): BudgetScalingCandidate[] {
  const budgetScalingCandidates = campaigns
    .filter(c =>
      c.budget > 0 &&
      c.roi !== null &&
      (portfolioRoi === null || c.roi! > portfolioRoi) &&
      c.revenueShare > c.budgetShare,
    )
    .map(c => ({
      campaign: c.campaign,
      channel: c.channel,
      roi: c.roi!,
      budgetShare: c.budgetShare,
      revenueShare: c.revenueShare,
      efficiencyGap: c.efficiencyGap,
      gapAmount: c.gapAmount,
      maxAdditionalBudget: c.budget * MAX_ADDITIONAL_FRACTION,
      expectedRoiRetention: BASE_ROI_RETENTION,
      reason: 'Revenue share exceeds budget share with strong efficiency.',
    }))

  return rankByRoiDesc(budgetScalingCandidates)
}

// ── Inefficient campaigns ─────────────────────────────────────────────────────

export function getInefficientCampaigns(
  campaigns: CampaignSummary[],
  portfolioRoi: number | null,
): InefficientCampaignSignal[] {
  const inefficientCampaigns = campaigns
    .filter(c =>
      c.budget > 0 &&
      c.budgetShare >= MIN_BUDGET_SHARE_SIGNAL &&
      c.efficiencyGap > GAP_THRESHOLD &&
      (portfolioRoi === null || toFinite(c.roi) < portfolioRoi),
    )
    .map(c => ({
      campaign: c.campaign,
      channel: c.channel,
      roi: c.roi,
      budgetShare: c.budgetShare,
      revenueShare: c.revenueShare,
      efficiencyGap: c.efficiencyGap,
      gapAmount: c.gapAmount,
      maxReducibleBudget: c.budget * MAX_REDUCIBLE_FRACTION,
      reason: 'Budget share exceeds revenue share with weaker efficiency than portfolio.',
    }))

  return rankByEfficiencyGapDesc(inefficientCampaigns)
}

// ── Transfer candidates ───────────────────────────────────────────────────────

export function getTransferCandidates(
  inefficient: InefficientCampaignSignal[],
  scaling: BudgetScalingCandidate[],
): TransferCandidate[] {
  const candidates: TransferCandidate[] = []
  for (const source of inefficient) {
    for (const target of scaling) {
      if (source.campaign === target.campaign) continue
      const minShift = Math.max(MIN_SHIFT_FLOOR, source.maxReducibleBudget * MIN_SHIFT_FRACTION)
      const maxShift = Math.min(source.maxReducibleBudget, target.maxAdditionalBudget)
      if (maxShift <= minShift) continue
      candidates.push({
        fromCampaign: source.campaign,
        toCampaign: target.campaign,
        minShift: Math.round(minShift),
        maxShift: Math.round(maxShift),
        expectedRoiRetention: target.expectedRoiRetention,
        reason: `Shift from ${source.campaign} (inefficient) to ${target.campaign} (strong efficiency).`,
      })
    }
  }
  return candidates.sort((a, b) => b.maxShift - a.maxShift).slice(0, 5)
}

// ── Concentration flag ────────────────────────────────────────────────────────

export function getConcentrationFlag(campaigns: CampaignSummary[]): ConcentrationFlagSignal {
  if (campaigns.length < 3) {
    return {
      flagged: false,
      level: 'Low',
      top1RevenueShare: campaigns.length === 1 ? 1 : 0,
      top3RevenueShare: campaigns.length > 0 ? 1 : 0,
      reason: 'Concentration is not evaluated for datasets with fewer than 3 campaigns.',
    }
  }
  const sorted = [...campaigns].sort((a, b) => b.revenue - a.revenue)
  const top1RevenueShare = sorted[0]?.revenueShare ?? 0
  const top3RevenueShare = sorted.slice(0, 3).reduce((sum, c) => sum + c.revenueShare, 0)
  if (top1RevenueShare > 0.4 || top3RevenueShare > 0.75) {
    return { flagged: true, level: 'High', top1RevenueShare, top3RevenueShare, reason: 'Revenue is highly concentrated in a small number of campaigns.' }
  }
  if (top1RevenueShare > 0.25 || top3RevenueShare > 0.6) {
    return { flagged: true, level: 'Moderate', top1RevenueShare, top3RevenueShare, reason: 'Revenue is moderately concentrated in a limited number of campaigns.' }
  }
  return { flagged: false, level: 'Low', top1RevenueShare, top3RevenueShare, reason: 'Revenue is reasonably distributed across campaigns.' }
}

// ── Correlations (stub) ───────────────────────────────────────────────────────

export function getCorrelations(campaigns: CampaignSummary[]): CorrelationSignal[] {
  if (campaigns.length < 3) return []
  return []
}
