import type { ChannelClassificationThresholds, ChannelSummary } from '../types'
import type { ChannelGroups } from '../types'
import { rankByAllocationGapDesc, rankByBudgetShareDesc, rankByRoiDesc } from '../ranking'
import { hasBudgetShareLead, hasRoiBelowPortfolio } from '../checkers'
import {
  hasFunnelLeak,
  hasPositiveUnderperformingRoi,
  hasRoiAbovePortfolioFactor,
} from './classification-checkers'
import { DEFAULT_CHANNEL_CLASSIFICATION_THRESHOLDS } from './constants'
import { getFunnelMedians } from './classification-utils'

// ── Classification predicates ─────────────────────────────────────────────────

function hasRevenueShareAtLeastBudgetShare(channel: ChannelSummary): boolean {
  return channel.efficiencyGap >= 0
}

/**
 * A channel is Strong when it outperforms the portfolio ROI by the top threshold
 * AND delivers at least as much revenue share as its budget share warrants. Both
 * conditions together ensure the channel punches above its portfolio weight.
 */
function isStrong(
  channel: ChannelSummary,
  portfolioRoi: number | null,
  thresholds: ChannelClassificationThresholds,
): boolean {
  return (
    hasRoiAbovePortfolioFactor(channel, portfolioRoi, thresholds.topRoiFactor) &&
    hasRevenueShareAtLeastBudgetShare(channel)
  )
}

/**
 * Revenue share meets or exceeds budget share — the channel delivers efficiently
 * for what it receives. ROI at or above the portfolio average confirms the channel
 * is performing well. Not reaching the Strong threshold typically signals
 * under-investment rather than weakness.
 */
function isOpportunity(channel: ChannelSummary, portfolioRoi: number | null): boolean {
  if (channel.roi === null) return false
  const refRoi = portfolioRoi ?? 0
  return channel.roi >= refRoi && hasRevenueShareAtLeastBudgetShare(channel)
}

/**
 * Budget share significantly exceeds revenue share (large allocationGap) AND the
 * channel underperforms the portfolio average on ROI. Both conditions together
 * avoid penalising channels that are expensive but still above-average on returns.
 */
function isWeak(
  channel: ChannelSummary,
  portfolioRoi: number | null,
  thresholds: ChannelClassificationThresholds,
): boolean {
  return (
    hasBudgetShareLead(channel, thresholds.gapThreshold) &&
    hasRoiBelowPortfolio(channel, portfolioRoi ?? 0)
  )
}

/**
 * Watch captures either a funnel leak or positive ROI that lags the portfolio.
 * The concrete checks live in shared classification predicates because channels
 * and campaigns use the same descriptive rules.
 */
function isWatch(
  channel: ChannelSummary,
  portfolioRoi: number | null,
  medianCtr: number | null,
  medianCvr: number | null,
  thresholds: ChannelClassificationThresholds,
): boolean {
  return (
    hasFunnelLeak(channel, medianCtr, medianCvr, thresholds) ||
    hasPositiveUnderperformingRoi(channel, portfolioRoi, thresholds)
  )
}

// ── Classifier ────────────────────────────────────────────────────────────────

/**
 * Classifies channels into four mutually exclusive groups using a priority cascade:
 * Strong → Opportunity → Weak → Watch.
 *
 * Each channel lands in exactly one group. Groups may be empty — no minimum
 * dataset size is required. Classification is per-item so small datasets (1, 2, 3
 * channels) are handled correctly without special-casing.
 */
export function classifyChannels(
  channels: ChannelSummary[],
  portfolioRoi: number | null,
  thresholds: ChannelClassificationThresholds = DEFAULT_CHANNEL_CLASSIFICATION_THRESHOLDS,
): ChannelGroups {
  const { medianCtr, medianCvr } = getFunnelMedians(channels)

  const strong: ChannelSummary[] = []
  const opportunity: ChannelSummary[] = []
  const weak: ChannelSummary[] = []
  const watch: ChannelSummary[] = []

  for (const channel of channels) {
    if (isStrong(channel, portfolioRoi, thresholds)) {
      strong.push(channel)
    } else if (isOpportunity(channel, portfolioRoi)) {
      opportunity.push(channel)
    } else if (isWeak(channel, portfolioRoi, thresholds)) {
      weak.push(channel)
    } else if (isWatch(channel, portfolioRoi, medianCtr, medianCvr, thresholds)) {
      watch.push(channel)
    }
  }

  return {
    strong: rankByRoiDesc(strong),
    opportunity: rankByRoiDesc(opportunity),
    weak: rankByAllocationGapDesc(weak),
    watch: rankByBudgetShareDesc(watch),
  }
}
