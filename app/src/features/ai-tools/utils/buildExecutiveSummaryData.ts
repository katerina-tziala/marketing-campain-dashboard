import type { CampaignPerformance } from '../../../common/types/campaign'
import type { Channel } from '../../../common/types/channel'
import { safeDivide, round2, round4 } from '../../../common/utils/math'
import { getExecutiveSummaryDerivedInputs } from '../../../common/analysis/executive-summary-analysis'
import type {
  ExecutiveSummaryInput,
  CampaignSummary,
  ChannelSummary,
  SummaryMetricStatus,
} from '../../../common/analysis/executive-summary-analysis.types'

// ── Helpers ───────────────────────────────────────────────────────────────

function computeChannelStatus(
  roi: number | null,
  portfolioRoi: number | null,
): SummaryMetricStatus {
  if (roi === null || portfolioRoi === null) return 'Moderate'
  if (roi > portfolioRoi * 1.1) return 'Strong'
  if (roi < portfolioRoi * 0.9) return 'Weak'
  return 'Moderate'
}

function toCampaignSummary(
  c: CampaignPerformance,
  totalBudget: number,
  totalRevenue: number,
): CampaignSummary {
  const budgetShare = safeDivide(c.budget, totalBudget)
  const revenueShare = safeDivide(c.revenue, totalRevenue)
  return {
    ...c,
    budgetShare,
    revenueShare,
    efficiencyGap: budgetShare - revenueShare,
  }
}

function toChannelSummary(
  ch: Channel,
  totalBudget: number,
  totalRevenue: number,
  portfolioRoi: number | null,
): ChannelSummary {
  const budgetShare = safeDivide(ch.budget, totalBudget)
  const revenueShare = safeDivide(ch.revenue, totalRevenue)
  return {
    channel: ch.name,
    budget: ch.budget,
    impressions: ch.impressions,
    clicks: ch.clicks,
    conversions: ch.conversions,
    revenue: ch.revenue,
    roi: ch.roi,
    ctr: ch.ctr,
    cvr: ch.cvr,
    cac: ch.cac,
    budgetShare,
    revenueShare,
    efficiencyGap: budgetShare - revenueShare,
    status: computeChannelStatus(ch.roi, portfolioRoi),
  }
}

// ── Main builder ──────────────────────────────────────────────────────────

export function buildExecutiveSummaryInput(
  campaigns: CampaignPerformance[],
  channels: Channel[],
): ExecutiveSummaryInput {
  if (campaigns.length === 0) {
    return {
      portfolio: {
        totalBudget: 0,
        totalRevenue: 0,
        aggregatedROI: 0,
        totalConversions: 0,
        aggregatedCAC: null,
        campaignCount: 0,
        channelCount: 0,
      },
      channels: [],
      topCampaigns: [],
      bottomCampaigns: [],
      derivedSignals: {
        inefficientChannels: [],
        scalingCandidates: [],
        concentrationFlag: {
          flagged: false,
          level: 'Low',
          top1RevenueShare: 0,
          top3RevenueShare: 0,
          reason: 'No data provided.',
        },
        correlations: [],
      },
    }
  }

  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0)
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0)
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0)

  const portfolioRoi = totalBudget > 0
    ? round4(safeDivide(totalRevenue - totalBudget, totalBudget))
    : null

  const aggregatedCAC = totalConversions > 0
    ? round2(totalBudget / totalConversions)
    : null

  const campaignSummaries = campaigns.map(c =>
    toCampaignSummary(c, totalBudget, totalRevenue),
  )

  const channelSummaries = channels.map(ch =>
    toChannelSummary(ch, totalBudget, totalRevenue, portfolioRoi),
  )

  const { topCampaigns, bottomCampaigns, derivedSignals } =
    getExecutiveSummaryDerivedInputs({
      campaigns: campaignSummaries,
      channels: channelSummaries,
      portfolioRoi,
    })

  return {
    portfolio: {
      totalBudget: round2(totalBudget),
      totalRevenue: round2(totalRevenue),
      aggregatedROI: portfolioRoi ?? 0,
      totalConversions,
      aggregatedCAC,
      campaignCount: campaigns.length,
      channelCount: channels.length,
    },
    channels: channelSummaries,
    topCampaigns,
    bottomCampaigns,
    derivedSignals,
  }
}

// add 
//  totalImpressions: number
//  totalClicks: number 
//  aggregatedCTR: number | null
//  aggregatedCVR: number | null  
// in ExecutiveSummaryInput.portfolio

// use functions from campaign-performance to perform same calculations and use object destructuring to reassing
// check if we can derive those from campain level faster
// create and reuse ShareAnsEfficiency {
//   budgetShare: number;
//   revenueShare: number;
//   efficiencyGap: number;
// }
// interface

// implement dynamic thressholds
// function getDynamicThresholds(campaigns: CampaignSummaryInput[]) {
//   const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
//   const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);

//   return {
//     minRevenue: Math.max(totalRevenue * 0.02, 50),
//     minConversions: Math.max(totalConversions * 0.02, 2),
//   };
// }

// remove function n. we use number or null. update it with a meaningfull name
