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
const MIN_CONVERSIONS = 10
const MIN_BUDGET_SHARE_PERCENT = 2

// ── Portfolio benchmarks ──────────────────────────────────────────────────

type PortfolioBenchmarks = {
  roi: number
  cac: number // Infinity when totalConversions = 0
  cvr: number
}

// ── Helpers ───────────────────────────────────────────────────────────────

// Returns Infinity for zero conversions — enables correct comparison logic
// (Infinity > any threshold → zero-conversion items are never classified as efficient).
// Serializes to null in JSON for the AI prompt.
function computeCAC(budget: number, conversions: number): number {
  return conversions > 0 ? round2(budget / conversions) : Infinity
}

function computeCacDelta(campaignCac: number, portfolioCac: number): number | null {
  const d = campaignCac - portfolioCac
  return isFinite(d) ? round2(d) : null
}

function meetsMinSample(conversions: number, budget: number, totalBudget: number): boolean {
  return conversions >= MIN_CONVERSIONS
    || (totalBudget > 0 && (budget / totalBudget) * 100 >= MIN_BUDGET_SHARE_PERCENT)
}

// ── Per-campaign derived metrics ──────────────────────────────────────────

function deriveCampaignMetrics(
  c: Campaign,
  benchmarks: PortfolioBenchmarks,
): ExecutiveSummaryCampaign {
  const roi = round2(safeDivide(c.revenue - c.budget, c.budget) * 100)
  const cac = computeCAC(c.budget, c.conversions)
  const cvr = round2(safeDivide(c.conversions, c.clicks) * 100)

  return {
    campaign: c.campaign,
    channel: c.channel,
    budget: round2(c.budget),
    revenue: round2(c.revenue),
    roi,
    conversions: c.conversions,
    cac,
    ctr: round2(safeDivide(c.clicks, c.impressions) * 100),
    cvr,
    roiDelta: round2(roi - benchmarks.roi),
    cacDelta: computeCacDelta(cac, benchmarks.cac),
    cvrDelta: round2(cvr - benchmarks.cvr),
  }
}

// ── Channel aggregation ─────────────────────────────────────────────────

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
  benchmarks: PortfolioBenchmarks,
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
    const roi = round2(safeDivide(acc.revenue - acc.budget, acc.budget) * 100)
    const cac = computeCAC(acc.budget, acc.conversions)
    const cvr = round2(safeDivide(acc.conversions, acc.clicks) * 100)

    channels.push({
      channel,
      budget: round2(acc.budget),
      revenue: round2(acc.revenue),
      roi,
      conversions: acc.conversions,
      cac,
      ctr: round2(safeDivide(acc.clicks, acc.impressions) * 100),
      cvr,
      budgetShare: round2(safeDivide(acc.budget, totalBudget) * 100),
      revenueShare: round2(safeDivide(acc.revenue, totalRevenue) * 100),
      roiDelta: round2(roi - benchmarks.roi),
      cacDelta: computeCacDelta(cac, benchmarks.cac),
      cvrDelta: round2(cvr - benchmarks.cvr),
    })
  }

  return channels
}

// ── Top / other channels split (materiality score ranking) ────────────────

function splitChannels(channels: ExecutiveSummaryChannel[]): {
  topChannels: ExecutiveSummaryChannel[]
  otherChannelsSummary?: ExecutiveSummaryOtherChannelsSummary
} {
  const sorted = [...channels].sort((a, b) => {
    const aMat = a.budgetShare * 0.6 + a.revenueShare * 0.4
    const bMat = b.budgetShare * 0.6 + b.revenueShare * 0.4
    return bMat - aMat
  })

  const topChannels = sorted.slice(0, MAX_TOP_CHANNELS)
  const rest = sorted.slice(MAX_TOP_CHANNELS)

  if (rest.length === 0) return { topChannels }

  return {
    topChannels,
    otherChannelsSummary: {
      channelCount: rest.length,
      budgetShare: round2(rest.reduce((s, c) => s + c.budgetShare, 0)),
      revenueShare: round2(rest.reduce((s, c) => s + c.revenueShare, 0)),
    },
  }
}

// ── Campaign classification ───────────────────────────────────────────────

function selectTopCampaigns(
  campaigns: ExecutiveSummaryCampaign[],
  benchmarks: PortfolioBenchmarks,
  totalBudget: number,
): ExecutiveSummaryCampaign[] {
  return campaigns
    .filter((c) => {
      if (!meetsMinSample(c.conversions, c.budget, totalBudget)) return false
      const cacOk = c.cac !== null && c.cac <= benchmarks.cac
      return c.roi >= benchmarks.roi && cacOk
    })
    .sort((a, b) =>
      b.roi - a.roi
      || b.revenue - a.revenue
      || b.conversions - a.conversions,
    )
    .slice(0, MAX_TOP_CAMPAIGNS)
}

function countUnderperformingSignals(
  c: ExecutiveSummaryCampaign,
  benchmarks: PortfolioBenchmarks,
  totalBudget: number,
  totalRevenue: number,
): number {
  let signals = 0

  // 1. ROI < 80% portfolio or ROI < 10%
  if (c.roi < benchmarks.roi * 0.8 || c.roi < 10) signals++

  // 2. CAC > 125% portfolio (only when conversions >= 10)
  if (
    c.conversions >= MIN_CONVERSIONS
    && c.cac !== null
    && isFinite(c.cac)
    && isFinite(benchmarks.cac)
    && c.cac > benchmarks.cac * 1.25
  ) signals++

  // 3. Revenue share < 75% budget share (when budget share >= 5%)
  const budgetPct = totalBudget > 0 ? (c.budget / totalBudget) * 100 : 0
  const revenuePct = totalRevenue > 0 ? (c.revenue / totalRevenue) * 100 : 0
  if (budgetPct >= 5 && revenuePct < budgetPct * 0.75) signals++

  // 4. CVR < 80% portfolio
  if (c.cvr < benchmarks.cvr * 0.8) signals++

  return signals
}

function selectUnderperformingCampaigns(
  campaigns: ExecutiveSummaryCampaign[],
  benchmarks: PortfolioBenchmarks,
  totalBudget: number,
  totalRevenue: number,
  topCampaignNames: Set<string>,
): ExecutiveSummaryCampaign[] {
  return campaigns
    .filter((c) => {
      if (topCampaignNames.has(c.campaign)) return false
      if (!meetsMinSample(c.conversions, c.budget, totalBudget)) return false
      return countUnderperformingSignals(c, benchmarks, totalBudget, totalRevenue) >= 2
    })
    .sort((a, b) =>
      a.roi - b.roi
      || b.budget - a.budget
      || a.revenue - b.revenue,
    )
    .slice(0, MAX_UNDERPERFORMING)
}

// ── Key findings ──────────────────────────────────────────────────────────

function generateKeyFindings(
  channels: ExecutiveSummaryChannel[],
  topCampaigns: ExecutiveSummaryCampaign[],
): string[] {
  const findings: string[] = []

  // Priority 1: Budget inefficiency (budget share >= 10% AND revenue share < 70% budget share)
  const budgetInefficient = [...channels]
    .filter((ch) => ch.budgetShare >= 10 && ch.revenueShare < ch.budgetShare * 0.7)
    .sort((a, b) => (a.revenueShare / a.budgetShare) - (b.revenueShare / b.budgetShare))
  if (budgetInefficient.length > 0) {
    const ch = budgetInefficient[0]
    findings.push(
      `${ch.channel} receives ${ch.budgetShare}% of budget but contributes only ${ch.revenueShare}% of revenue.`,
    )
  }

  // Priority 2: Disproportionate revenue (revenue share >= 1.4× budget share AND budget share >= 5%)
  const disproportionate = [...channels]
    .filter((ch) => ch.revenueShare >= ch.budgetShare * 1.4 && ch.budgetShare >= 5)
    .sort((a, b) => (b.revenueShare / b.budgetShare) - (a.revenueShare / a.budgetShare))
  if (disproportionate.length > 0) {
    const ch = disproportionate[0]
    findings.push(
      `${ch.channel} generates ${ch.revenueShare}% of revenue with only ${ch.budgetShare}% of budget.`,
    )
  }

  // Priority 3: Major campaign outperformance
  if (topCampaigns.length > 0 && topCampaigns[0].roi > 200) {
    findings.push(
      `Campaign "${topCampaigns[0].campaign}" achieves an ROI of ${topCampaigns[0].roi}%, the strongest in the portfolio.`,
    )
  }

  // Priority 4: Channel concentration risk (top 2 channels >= 60% budget, when >= 2 channels)
  if (channels.length >= 2) {
    const sorted = [...channels].sort((a, b) => b.budgetShare - a.budgetShare)
    const top2Share = sorted[0].budgetShare + sorted[1].budgetShare
    if (top2Share >= 60) {
      findings.push(
        `The top 2 channels (${sorted[0].channel}, ${sorted[1].channel}) account for ${round2(top2Share)}% of total budget.`,
      )
    }
  }

  return findings.slice(0, MAX_KEY_FINDINGS)
}

// ── Main builder ──────────────────────────────────────────────────────────

export function buildExecutiveSummaryData(
  rows: Campaign[],
  period?: string,
): ExecutiveSummaryData {
  // Empty dataset — return zeroed structure
  if (rows.length === 0) {
    return {
      ...(period ? { period } : {}),
      totals: { budget: 0, revenue: 0, roi: 0, conversions: 0, cac: null, ctr: 0, cvr: 0 },
      portfolio: { campaignCount: 0, channelCount: 0 },
      topChannels: [],
      topCampaigns: [],
      underperformingCampaigns: [],
    }
  }

  // Portfolio raw sums
  const totalBudget = rows.reduce((s, c) => s + c.budget, 0)
  const totalRevenue = rows.reduce((s, c) => s + c.revenue, 0)
  const totalImpressions = rows.reduce((s, c) => s + c.impressions, 0)
  const totalClicks = rows.reduce((s, c) => s + c.clicks, 0)
  const totalConversions = rows.reduce((s, c) => s + c.conversions, 0)

  // Portfolio benchmarks — baseline for all delta and classification logic
  const benchmarks: PortfolioBenchmarks = {
    roi: round2(safeDivide(totalRevenue - totalBudget, totalBudget) * 100),
    cac: computeCAC(totalBudget, totalConversions),
    cvr: round2(safeDivide(totalConversions, totalClicks) * 100),
  }

  const totals = {
    budget: round2(totalBudget),
    revenue: round2(totalRevenue),
    roi: benchmarks.roi,
    conversions: totalConversions,
    cac: benchmarks.cac as number | null,
    ctr: round2(safeDivide(totalClicks, totalImpressions) * 100),
    cvr: benchmarks.cvr,
  }

  const uniqueChannels = new Set(rows.map((r) => r.channel))

  // Derived campaign metrics with deltas
  const campaignMetrics = rows.map((c) => deriveCampaignMetrics(c, benchmarks))

  // Channel aggregation with deltas + materiality-ranked split
  const allChannels = aggregateChannels(rows, totalBudget, totalRevenue, benchmarks)
  const { topChannels, otherChannelsSummary } = splitChannels(allChannels)

  // Campaign classification (top takes precedence, no overlap)
  const topCampaigns = selectTopCampaigns(campaignMetrics, benchmarks, totalBudget)
  const topCampaignNames = new Set(topCampaigns.map((c) => c.campaign))
  const underperformingCampaigns = selectUnderperformingCampaigns(
    campaignMetrics, benchmarks, totalBudget, totalRevenue, topCampaignNames,
  )

  // Key findings (priority-ordered)
  const keyFindings = generateKeyFindings(allChannels, topCampaigns)

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
