import type { ChannelSummary } from './types'
import type { ChannelGroups } from './types'
import { CLASSIFY_THRESHOLDS, getFunnelMedians } from './classify-utils'
import { rankByBudgetShareDesc, rankByEfficiencyGapDesc, rankByRoiDesc } from './ranking'

// ── Classification predicates ─────────────────────────────────────────────────

const t = CLASSIFY_THRESHOLDS

function isStrong(ch: ChannelSummary, portfolioRoi: number | null): boolean {
  // A channel is Strong when it outperforms the portfolio ROI by the top threshold
  // AND delivers more revenue than its budget share warrants. Both conditions together
  // ensure the channel is not just efficient in isolation but punches above its weight
  // relative to the whole portfolio.
  if (ch.roi === null || portfolioRoi === null) return false
  return ch.roi > portfolioRoi * t.topRoiFactor && ch.revenueShare >= ch.budgetShare
}

function isOpportunity(ch: ChannelSummary, portfolioRoi: number | null): boolean {
  // Revenue share meets or exceeds budget share — the channel delivers efficiently
  // for what it receives. ROI at or above the portfolio average confirms the
  // channel is performing well. Not reaching the Strong threshold typically signals
  // under-investment: the channel could absorb more budget and return proportionate
  // gains, but hasn't yet had the allocation to prove it at scale.
  if (ch.roi === null) return false
  const refRoi = portfolioRoi ?? 0
  return ch.roi >= refRoi && ch.revenueShare >= ch.budgetShare
}

function isWeak(ch: ChannelSummary, portfolioRoi: number | null): boolean {
  // Budget share significantly exceeds revenue share (large efficiencyGap) AND the
  // channel underperforms the portfolio average on ROI. Both conditions together
  // avoid penalising channels that are expensive but still above-average on returns.
  const roi = ch.roi !== null ? ch.roi : -Infinity
  const refRoi = portfolioRoi ?? 0
  return ch.efficiencyGap > t.gapThreshold && roi < refRoi
}

function isWatch(
  ch: ChannelSummary,
  portfolioRoi: number | null,
  medianCtr: number | null,
  medianCvr: number | null,
): boolean {
  // Funnel leak at channel level: when a channel shows high CTR but low CVR
  // relative to the dataset median across its aggregated campaigns, the issue
  // likely lies in channel-level audience fit or format rather than individual
  // campaign execution. High CTR means the channel reaches people who click;
  // low CVR means those people consistently fail to convert — a structural signal
  // worth investigating before investing further.
  const hasFunnelLeak =
    medianCtr !== null &&
    medianCvr !== null &&
    ch.ctr !== null &&
    ch.cvr !== null &&
    ch.ctr > medianCtr * t.watchCtrFactor &&
    ch.cvr < medianCvr * t.watchCvrFactor

  // Positive but underperforming ROI at channel level: the channel returns value
  // but consistently lags the portfolio average. At channel scale this may indicate
  // structural inefficiency — audience saturation, channel-level CPM inflation, or
  // a creative format that does not convert well for this product — rather than a
  // single campaign issue that can be fixed in isolation.
  const roi = ch.roi !== null ? ch.roi : -1
  const refRoi = portfolioRoi ?? 0
  const hasUnderperformingRoi = roi >= 0 && roi < refRoi * t.watchRoiFactor

  return hasFunnelLeak || hasUnderperformingRoi
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
): ChannelGroups {
  const { medianCtr, medianCvr } = getFunnelMedians(channels)

  const strong: ChannelSummary[] = []
  const opportunity: ChannelSummary[] = []
  const weak: ChannelSummary[] = []
  const watch: ChannelSummary[] = []

  for (const ch of channels) {
    if (isStrong(ch, portfolioRoi)) {
      strong.push(ch)
    } else if (isOpportunity(ch, portfolioRoi)) {
      opportunity.push(ch)
    } else if (isWeak(ch, portfolioRoi)) {
      weak.push(ch)
    } else if (isWatch(ch, portfolioRoi, medianCtr, medianCvr)) {
      watch.push(ch)
    }
  }

  return {
    strong: rankByRoiDesc(strong),
    opportunity: rankByRoiDesc(opportunity),
    weak: rankByEfficiencyGapDesc(weak),
    watch: rankByBudgetShareDesc(watch),
  }
}
