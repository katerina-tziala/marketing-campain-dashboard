import type { Campaign } from '../../../common/types/campaign'
import { safeDivide, round2 } from '../../../common/utils/math'
import type {
  ExecutiveSummaryData,
  ExecutiveSummaryChannel,
  ExecutiveSummaryCampaign,
  ExecutiveSummaryOtherChannelsSummary,
} from '../types'

const MAX_TOP_CHANNELS = 6
const MAX_TOP_CAMPAIGNS = 3
const MAX_UNDERPERFORMING = 3
const MAX_KEY_FINDINGS = 5

// ── Per-campaign derived metrics ────────────────────────────────────────────

function deriveCampaignMetrics(c: Campaign): ExecutiveSummaryCampaign {
  return {
    campaign: c.campaign,
    channel: c.channel,
    budget: round2(c.budget),
    revenue: round2(c.revenue),
    roi: round2(safeDivide(c.revenue - c.budget, c.budget) * 100),
    conversions: c.conversions,
    cac: c.conversions > 0 ? round2(c.budget / c.conversions) : null,
    ctr: round2(safeDivide(c.clicks, c.impressions) * 100),
    cvr: round2(safeDivide(c.conversions, c.clicks) * 100),
  }
}

// ── Channel aggregation ─────────────────────────────────────────────────────

type ChannelAccumulator = {
  budget: number
  revenue: number
  impressions: number
  clicks: number
  conversions: number
}

function aggregateChannels(
  rows: Campaign[],
  totalBudget: number,
  totalRevenue: number,
): ExecutiveSummaryChannel[] {
  const map = new Map<string, ChannelAccumulator>()

  for (const row of rows) {
    const acc = map.get(row.channel)
    if (acc) {
      acc.budget += row.budget
      acc.revenue += row.revenue
      acc.impressions += row.impressions
      acc.clicks += row.clicks
      acc.conversions += row.conversions
    } else {
      map.set(row.channel, {
        budget: row.budget,
        revenue: row.revenue,
        impressions: row.impressions,
        clicks: row.clicks,
        conversions: row.conversions,
      })
    }
  }

  const channels: ExecutiveSummaryChannel[] = []

  for (const [channel, acc] of map) {
    channels.push({
      channel,
      budget: round2(acc.budget),
      revenue: round2(acc.revenue),
      roi: round2(safeDivide(acc.revenue - acc.budget, acc.budget) * 100),
      conversions: acc.conversions,
      cac: acc.conversions > 0 ? round2(acc.budget / acc.conversions) : null,
      ctr: round2(safeDivide(acc.clicks, acc.impressions) * 100),
      cvr: round2(safeDivide(acc.conversions, acc.clicks) * 100),
      budgetShare: round2(safeDivide(acc.budget, totalBudget) * 100),
      revenueShare: round2(safeDivide(acc.revenue, totalRevenue) * 100),
    })
  }

  return channels
}

// ── Top / other channels split ──────────────────────────────────────────────

function splitChannels(channels: ExecutiveSummaryChannel[]): {
  topChannels: ExecutiveSummaryChannel[]
  otherChannelsSummary?: ExecutiveSummaryOtherChannelsSummary
} {
  const sorted = [...channels].sort((a, b) => b.budgetShare - a.budgetShare)
  const topChannels = sorted.slice(0, MAX_TOP_CHANNELS)
  const rest = sorted.slice(MAX_TOP_CHANNELS)

  if (rest.length === 0) {
    return { topChannels }
  }

  return {
    topChannels,
    otherChannelsSummary: {
      channelCount: rest.length,
      budgetShare: round2(rest.reduce((s, c) => s + c.budgetShare, 0)),
      revenueShare: round2(rest.reduce((s, c) => s + c.revenueShare, 0)),
    },
  }
}

// ── Top campaigns ───────────────────────────────────────────────────────────

function selectTopCampaigns(
  campaigns: ExecutiveSummaryCampaign[],
): ExecutiveSummaryCampaign[] {
  return [...campaigns]
    .sort((a, b) =>
      b.roi - a.roi
      || b.revenue - a.revenue
      || b.conversions - a.conversions,
    )
    .slice(0, MAX_TOP_CAMPAIGNS)
}

// ── Underperforming campaigns ───────────────────────────────────────────────

function selectUnderperformingCampaigns(
  campaigns: ExecutiveSummaryCampaign[],
): ExecutiveSummaryCampaign[] {
  return [...campaigns]
    .sort((a, b) =>
      a.roi - b.roi
      || b.budget - a.budget
      || a.revenue - b.revenue,
    )
    .slice(0, MAX_UNDERPERFORMING)
}

// ── Key findings ────────────────────────────────────────────────────────────

function generateKeyFindings(
  channels: ExecutiveSummaryChannel[],
  topCampaigns: ExecutiveSummaryCampaign[],
  totalBudget: number,
): string[] {
  const findings: string[] = []

  // Channel with disproportionate revenue relative to budget
  for (const ch of channels) {
    if (ch.revenueShare > ch.budgetShare * 1.5 && ch.budgetShare > 0) {
      findings.push(
        `${ch.channel} generates ${ch.revenueShare}% of revenue with only ${ch.budgetShare}% of budget.`,
      )
      break
    }
  }

  // Channel with high budget but weak ROI
  const highBudgetWeakRoi = [...channels]
    .filter((ch) => ch.budgetShare >= 10 && ch.roi < 0)
    .sort((a, b) => a.roi - b.roi)
  if (highBudgetWeakRoi.length > 0) {
    const ch = highBudgetWeakRoi[0]
    findings.push(
      `${ch.channel} consumes ${ch.budgetShare}% of budget but returns a negative ROI of ${ch.roi}%.`,
    )
  }

  // Top campaign with unusually strong ROI
  if (topCampaigns.length > 0) {
    const best = topCampaigns[0]
    if (best.roi > 200) {
      findings.push(
        `Campaign "${best.campaign}" achieves an ROI of ${best.roi}%, the strongest in the portfolio.`,
      )
    }
  }

  // Concentration risk — top 2 channels by budget
  if (channels.length >= 3) {
    const sorted = [...channels].sort((a, b) => b.budgetShare - a.budgetShare)
    const top2Share = sorted[0].budgetShare + sorted[1].budgetShare
    if (top2Share >= 60) {
      findings.push(
        `The top 2 channels (${sorted[0].channel}, ${sorted[1].channel}) account for ${round2(top2Share)}% of total budget.`,
      )
    }
  }

  // Channel with high budget share but low revenue share
  for (const ch of channels) {
    if (ch.budgetShare > ch.revenueShare * 1.5 && ch.revenueShare > 0) {
      findings.push(
        `${ch.channel} receives ${ch.budgetShare}% of budget but contributes only ${ch.revenueShare}% of revenue.`,
      )
      break
    }
  }

  return findings.slice(0, MAX_KEY_FINDINGS)
}

// ── Main builder ────────────────────────────────────────────────────────────

export function buildExecutiveSummaryData(
  rows: Campaign[],
  period?: string,
): ExecutiveSummaryData {
  // Portfolio totals (raw sums)
  const totalBudget = rows.reduce((s, c) => s + c.budget, 0)
  const totalRevenue = rows.reduce((s, c) => s + c.revenue, 0)
  const totalImpressions = rows.reduce((s, c) => s + c.impressions, 0)
  const totalClicks = rows.reduce((s, c) => s + c.clicks, 0)
  const totalConversions = rows.reduce((s, c) => s + c.conversions, 0)

  const totals = {
    budget: round2(totalBudget),
    revenue: round2(totalRevenue),
    roi: round2(safeDivide(totalRevenue - totalBudget, totalBudget) * 100),
    conversions: totalConversions,
    cac: totalConversions > 0 ? round2(totalBudget / totalConversions) : null,
    ctr: round2(safeDivide(totalClicks, totalImpressions) * 100),
    cvr: round2(safeDivide(totalConversions, totalClicks) * 100),
  }

  const uniqueChannels = new Set(rows.map((r) => r.channel))

  // Per-campaign derived metrics
  const campaignMetrics = rows.map(deriveCampaignMetrics)

  // Channel aggregation + split
  const allChannels = aggregateChannels(rows, totalBudget, totalRevenue)
  const { topChannels, otherChannelsSummary } = splitChannels(allChannels)

  // Campaign selection
  const topCampaigns = selectTopCampaigns(campaignMetrics)
  const underperformingCampaigns = selectUnderperformingCampaigns(campaignMetrics)

  // Key findings
  const keyFindings = generateKeyFindings(allChannels, topCampaigns, totalBudget)

  return {
    ...(period ? { period } : {}),
    totals,
    portfolio: {
      campaignCount: rows.length,
      channelCount: uniqueChannels.size,
    },
    topChannels,
    ...(otherChannelsSummary ? { otherChannelsSummary } : {}),
    topCampaigns,
    underperformingCampaigns,
    ...(keyFindings.length > 0 ? { keyFindings } : {}),
  }
}
