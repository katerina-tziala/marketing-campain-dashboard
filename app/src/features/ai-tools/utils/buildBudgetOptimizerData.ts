import type { Campaign } from '../../../common/types/campaign'
import { safeDivide, round2 } from '../../../common/utils/math'
import type {
  BudgetOptimizerData,
  BudgetOptimizerCampaign,
  BudgetOptimizerChannel,
} from '../types'

// ── Per-campaign derived metrics ────────────────────────────────────────────

function deriveCampaignMetrics(
  c: Campaign,
  totalBudget: number,
  totalRevenue: number,
): BudgetOptimizerCampaign {
  return {
    campaign: c.campaign,
    channel: c.channel,
    budget: round2(c.budget),
    revenue: round2(c.revenue),
    impressions: c.impressions,
    clicks: c.clicks,
    conversions: c.conversions,
    roi: round2(safeDivide(c.revenue - c.budget, c.budget) * 100),
    ctr: round2(safeDivide(c.clicks, c.impressions) * 100),
    cvr: round2(safeDivide(c.conversions, c.clicks) * 100),
    cac: round2(safeDivide(c.budget, c.conversions)),
    budgetShare: round2(safeDivide(c.budget, totalBudget) * 100),
    revenueShare: round2(safeDivide(c.revenue, totalRevenue) * 100),
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
): BudgetOptimizerChannel[] {
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

  const channels: BudgetOptimizerChannel[] = []

  for (const [channel, acc] of map) {
    channels.push({
      channel,
      budget: round2(acc.budget),
      revenue: round2(acc.revenue),
      impressions: acc.impressions,
      clicks: acc.clicks,
      conversions: acc.conversions,
      roi: round2(safeDivide(acc.revenue - acc.budget, acc.budget) * 100),
      ctr: round2(safeDivide(acc.clicks, acc.impressions) * 100),
      cvr: round2(safeDivide(acc.conversions, acc.clicks) * 100),
      cac: round2(safeDivide(acc.budget, acc.conversions)),
      budgetShare: round2(safeDivide(acc.budget, totalBudget) * 100),
      revenueShare: round2(safeDivide(acc.revenue, totalRevenue) * 100),
    })
  }

  return channels
}

// ── Main builder ────────────────────────────────────────────────────────────

export function buildBudgetOptimizerData(
  rows: Campaign[],
): BudgetOptimizerData {
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
    cac: round2(safeDivide(totalBudget, totalConversions)),
    ctr: round2(safeDivide(totalClicks, totalImpressions) * 100),
    cvr: round2(safeDivide(totalConversions, totalClicks) * 100),
  }

  const campaigns = rows
    .map((c) => deriveCampaignMetrics(c, totalBudget, totalRevenue))
    .sort((a, b) => b.budget - a.budget)

  const channels = aggregateChannels(rows, totalBudget, totalRevenue)
    .sort((a, b) => b.budget - a.budget)

  const uniqueChannels = new Set(rows.map((r) => r.channel))

  return {
    totals,
    campaigns,
    channels,
    portfolio: {
      campaignCount: rows.length,
      channelCount: uniqueChannels.size,
    },
  }
}
