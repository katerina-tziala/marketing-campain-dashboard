import type { CampaignMetrics, CampaignPerformance, PerformanceMetrics, PortfolioKPIs, PortfolioScope, ShareEfficiency } from '@/shared/types'

// ── Portfolio summary types ───────────────────────────────────────────────────

export interface PortfolioSummary extends PortfolioKPIs {
  campaignCount: number;
  channelCount: number;
}

export type SummaryMetricStatus = 'Strong' | 'Moderate' | 'Weak';

export interface ChannelSummary extends CampaignMetrics, PerformanceMetrics, ShareEfficiency {
  channel: string;
  status: SummaryMetricStatus;
}

export interface CampaignSummary extends CampaignPerformance, ShareEfficiency { }

export interface ScalingCandidateSignal extends ShareEfficiency {
  name: string;
  type: 'campaign' | 'channel';
  channel?: string;
  roi: number;
  reason: string;
  maxAdditionalBudget?: number;
}

// ── Channel signals ───────────────────────────────────────────────────────────

export interface InefficientChannelSignal extends ShareEfficiency {
  channel: string
  roi: number
  reason: string
}

// ── Campaign signals ──────────────────────────────────────────────────────────

export interface InefficientCampaignSignal extends ShareEfficiency {
  campaign: string
  channel: string
  roi: number | null
  maxReducibleBudget: number
  reason: string
}

export interface BudgetScalingCandidate extends ShareEfficiency {
  campaign: string
  channel: string
  roi: number
  maxAdditionalBudget: number
  expectedRoiRetention: number
  reason: string
}

export interface TransferCandidate {
  fromCampaign: string
  toCampaign: string
  minShift: number
  maxShift: number
  expectedRoiRetention: number
  reason: string
}

// ── Concentration ─────────────────────────────────────────────────────────────

export type ConcentrationLevel = 'Low' | 'Moderate' | 'High'

export interface ConcentrationFlagSignal {
  flagged: boolean
  level: ConcentrationLevel
  top1RevenueShare: number
  top3RevenueShare: number
  reason: string
}

// ── Correlations ──────────────────────────────────────────────────────────────

export interface CorrelationSignal {
  finding: string
  evidence: string
  implication: string
}

// ── Signal thresholds ─────────────────────────────────────────────────────────

export interface ChannelStatusThresholds {
  strongStatusRoiFactor: number
  weakStatusRoiFactor: number
}

export interface ChannelSignalThresholds {
  gapThreshold: number
  scalingGapThreshold: number
  minBudgetShareSignal: number
  minRevenueShareSignal: number
}

export interface CampaignSignalThresholds {
  gapThreshold: number
  minBudgetShareSignal: number
  maxReducibleFraction: number
  maxAdditionalFraction: number
  baseRoiRetention: number
}

export interface PortfolioSignalThresholds {
  minShiftFraction: number
  minShiftFloor: number
  minCampaignsForConcentration: number
  topRevenueCampaignCount: number
  highTop1RevenueShare: number
  highTop3RevenueShare: number
  moderateTop1RevenueShare: number
  moderateTop3RevenueShare: number
  maxScalingOpportunities: number
  maxTransferCandidates: number
  minCampaignsForCorrelations: number
}

export interface AnalysisSignalThresholds {
  channelStatus: ChannelStatusThresholds
  channelSignals: ChannelSignalThresholds
  campaignSignals: CampaignSignalThresholds
  portfolioSignals: PortfolioSignalThresholds
}

// ── Classification groups ─────────────────────────────────────────────────────

/**
 * Four mutually exclusive campaign performance buckets.
 * Each campaign appears in exactly one group; all groups may be empty.
 * See classify-campaigns.ts for full classification logic and rationale.
 */
export interface CampaignGroups {
  /** ROI significantly above portfolio average; meets size thresholds. */
  top: CampaignSummary[]
  /** ROI at or above portfolio average, revenue share ≥ budget share — under-invested. */
  opportunity: CampaignSummary[]
  /** Budget share significantly exceeds revenue share; ROI below portfolio average. */
  bottom: CampaignSummary[]
  /** Contradictory signals: funnel leak or positive-but-underperforming ROI. */
  watch: CampaignSummary[]
}

/**
 * Four mutually exclusive channel performance buckets.
 * Each channel appears in exactly one group; all groups may be empty.
 * See classify-channels.ts for full classification logic and rationale.
 */
export interface ChannelGroups {
  /** ROI significantly above portfolio average; revenue share ≥ budget share. */
  strong: ChannelSummary[]
  /** ROI at or above portfolio average, revenue share ≥ budget share — under-invested. */
  opportunity: ChannelSummary[]
  /** Budget share significantly exceeds revenue share; ROI below portfolio average. */
  weak: ChannelSummary[]
  /** Contradictory signals: funnel leak or positive-but-underperforming ROI. */
  watch: ChannelSummary[]
}

// ── Portfolio analysis ────────────────────────────────────────────────────────

export interface PortfolioAnalysis {
  portfolio: PortfolioSummary
  scope: PortfolioScope
  filteredChannels: boolean
  /** Flat list of all channel summaries — use for tables and raw enumeration. */
  channels: ChannelSummary[]
  /** Mutually exclusive campaign classification groups. */
  campaignGroups: CampaignGroups
  /** Mutually exclusive channel classification groups. */
  channelGroups: ChannelGroups
  derivedSignals: {
    inefficientChannels: InefficientChannelSignal[]
    inefficientCampaigns: InefficientCampaignSignal[]
    scalingOpportunities: ScalingCandidateSignal[]
    budgetScalingCandidates: BudgetScalingCandidate[]
    transferCandidates: TransferCandidate[]
    concentrationFlag: ConcentrationFlagSignal
    correlations?: CorrelationSignal[]
  }
}
