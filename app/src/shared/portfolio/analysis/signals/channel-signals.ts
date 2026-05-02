import { toFinite } from '@/shared/utils'
import type {
  ChannelSignalThresholds,
  ChannelSummary,
  InefficientChannelSignal,
  ScalingCandidateSignal,
} from '../../types'
import { rankByAllocationGapDesc } from '../ranking'
import {
  DEFAULT_CHANNEL_SIGNAL_THRESHOLDS,
  SIGNAL_REASONS,
} from './constants'
import {
  isOverfundedUnderperformer,
  isUnderfundedOutperformer,
} from '../checkers'

function isInefficientChannel(
  channel: ChannelSummary,
  portfolioRoi: number | null,
  thresholds: ChannelSignalThresholds,
): boolean {
  return isOverfundedUnderperformer(channel, portfolioRoi, thresholds)
}

function isChannelScalingOpportunity(
  channel: ChannelSummary,
  portfolioRoi: number | null,
  thresholds: ChannelSignalThresholds,
): boolean {
  return isUnderfundedOutperformer(channel, portfolioRoi, thresholds)
}

export function getInefficientChannels(
  channels: ChannelSummary[],
  portfolioRoi: number | null,
  thresholds: ChannelSignalThresholds = DEFAULT_CHANNEL_SIGNAL_THRESHOLDS,
): InefficientChannelSignal[] {
  const inefficientChannels = channels
    .filter(channel => isInefficientChannel(channel, portfolioRoi, thresholds))
    .map(({ channel, budgetShare, revenueShare, allocationGap, efficiencyGap, gapAmount, roi }) => ({
      channel,
      budgetShare,
      revenueShare,
      allocationGap,
      efficiencyGap,
      gapAmount,
      roi: toFinite(roi),
      reason: SIGNAL_REASONS.channel.inefficient,
    }))

  return rankByAllocationGapDesc(inefficientChannels)
}

export function toChannelScalingSignals(
  channels: ChannelSummary[],
  portfolioRoi: number | null,
  thresholds: ChannelSignalThresholds = DEFAULT_CHANNEL_SIGNAL_THRESHOLDS,
): ScalingCandidateSignal[] {
  return channels
    .filter(channel => isChannelScalingOpportunity(channel, portfolioRoi, thresholds))
    .map(({ channel, roi, budgetShare, revenueShare, allocationGap, efficiencyGap, gapAmount }) => ({
      name: channel,
      type: 'channel' as const,
      roi: roi!,
      budgetShare,
      revenueShare,
      allocationGap,
      efficiencyGap,
      gapAmount,
      reason: SIGNAL_REASONS.channel.scalingOpportunity,
    }))
}
