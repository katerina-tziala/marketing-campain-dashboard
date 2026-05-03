import type { Channel } from '@/shared/data'
import type { Campaign } from '@/shared/data'
import type { PortfolioAnalysis } from './analysis'

export interface Period {
  from: string
  to: string
}

export interface BusinessContext {
  period: Period
  industry?: string
}

export interface PortfolioDetails extends BusinessContext {
  name: string
}

export interface PortfolioInput extends PortfolioDetails {
  campaigns: Campaign[]
}

export interface PortfolioKPIs {
  totalBudget: number
  totalRevenue: number
  totalConversions: number
  totalImpressions: number
  totalClicks: number
  /** Decimal ratio — (totalRevenue - totalBudget) / totalBudget. e.g. 1.68 = 168% ROI */
  aggregatedRoi: number | null
  /** Currency (EUR) — totalBudget / totalConversions */
  aggregatedCpa: number | null
  /** Decimal ratio — totalClicks / totalImpressions */
  aggregatedCtr: number | null
  /** Decimal ratio — totalConversions / totalClicks */
  aggregatedCvr: number | null
}

export interface Portfolio {
  id: string
  name: string
  period: Period
  industry?: string
  channelMap: Map<string, Channel>
  analysis: PortfolioAnalysis
  uploadedAt: number
}
