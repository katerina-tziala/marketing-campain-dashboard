// [DEV ONLY]
import type { AiModel } from '../providers/types'
import type { BudgetOptimizerResponse } from '../ai-analysis/types'

const MOCK_GEMINI_FLASH: AiModel = {
  id: 'gemini-2.0-flash',
  displayName: 'Gemini 2.0 Flash',
  family: 'Gemini',
  strengthScore: 8,
  limitReached: false,
}

const MOCK_GROQ_LLAMA: AiModel = {
  id: 'llama-3.3-70b-versatile',
  displayName: 'Llama 3.3 70B',
  family: 'Llama', 
  strengthScore: 9, 
  limitReached: false,
}

// ── Mock 1: Aggressive Reallocation ──────────────────────────────────────────

const aggressiveReallocation: BudgetOptimizerResponse = {
  model: MOCK_GEMINI_FLASH,
  summary:
    'Portfolio shows a 3.4x ROI spread — reallocating 35% of underperforming spend to proven winners could lift overall ROI from 2.1x to 2.8x.',
  recommendations: [
    {
      type: 'reallocation',
      fromCampaign: 'Programmatic Display',
      fromChannel: 'Display',
      toCampaign: 'Google Brand Search',
      toChannel: 'Search',
      budgetShift: 3500,
      reason: 'Brand Search delivers 3.4x ROI versus Display at 0.87x. Brand search converts consistently and has room to scale before diminishing returns.',
      expectedImpact: { revenueChange: 14200, conversionChange: 112, roiEstimate: 3.9 },
      confidence: 'High',
      executionRisk: 'Low',
    },
    {
      type: 'reallocation',
      fromCampaign: 'TikTok Awareness',
      fromChannel: 'Social',
      toCampaign: 'Instagram Retargeting',
      toChannel: 'Social',
      budgetShift: 2200,
      reason: 'TikTok drives high impressions but low conversions (0.47% CVR). Instagram Retargeting converts at 4.56% targeting warm audiences already in-funnel.',
      expectedImpact: { revenueChange: 8400, conversionChange: 68, roiEstimate: 3.5 },
      confidence: 'Medium',
      executionRisk: 'Low',
    },
    {
      type: 'reallocation',
      fromCampaign: 'CTV Campaign',
      fromChannel: 'Video',
      toCampaign: 'Win-Back Email',
      toChannel: 'Email',
      budgetShift: 4000,
      reason: 'Win-Back Email has the highest ROI in the portfolio (12x) with an extremely low current budget. A moderate increase yields outsized returns before saturation.',
      expectedImpact: { revenueChange: 18000, conversionChange: 240, roiEstimate: 12.0 },
      confidence: 'High',
      executionRisk: 'Low',
    },
  ],
  expansions: [],
  noRecommendationReason: null,
}

// ── Mock 2: Conservative Optimization with Expansions ──────────────────────

const conservativeOptimization: BudgetOptimizerResponse = {
  model: MOCK_GROQ_LLAMA,
  summary:
    'Portfolio is broadly healthy at 2.1x ROI. Strategic small shifts and targeted expansions can improve returns by 0.4x without disrupting channel momentum.',
  recommendations: [
    {
      type: 'reallocation',
      fromCampaign: 'Google Non-Brand Search',
      fromChannel: 'Search',
      toCampaign: 'Newsletter Campaign',
      toChannel: 'Email',
      budgetShift: 1800,
      reason: 'Newsletter runs at 10.7x ROI on a €1,200 budget. Even a modest increase stays within audience saturation limits.',
      expectedImpact: { revenueChange: 9600, conversionChange: 150, roiEstimate: 10.7 },
      confidence: 'High',
      executionRisk: 'Low',
    },
  ],
  expansions: [
    {
      targetCampaign: null,
      targetChannel: 'Affiliate',
      additionalBudget: 2500,
      reason: 'Affiliate partners report capacity for 30% volume increase. Historical data shows consistent 4.8x ROI with minimal ramp-up time.',
      expectedImpact: { revenueChange: 12000, conversionChange: 156, roiEstimate: 4.8 },
      confidence: 'High',
      executionRisk: 'Low',
    },
  ],
  noRecommendationReason: null,
}

// ── Mock 3: Seasonal Pivot ───────────────────────────────────────────────────

const seasonalPivot: BudgetOptimizerResponse = {
  model: MOCK_GEMINI_FLASH,
  summary:
    'Summer shifts behaviour toward mobile and social — pivoting 25% of desktop-heavy spend to mobile-first channels projects a 0.6x ROI lift.',
  recommendations: [
    {
      type: 'reallocation',
      fromCampaign: 'Bing Ads',
      fromChannel: 'Search',
      toCampaign: 'Instagram Retargeting',
      toChannel: 'Social',
      budgetShift: 2000,
      reason: 'Summer months drive 40% more mobile social usage. Instagram Retargeting already converts well and will benefit from the seasonal browsing spike.',
      expectedImpact: { revenueChange: 7800, conversionChange: 54, roiEstimate: 3.8 },
      confidence: 'Medium',
      executionRisk: 'Low',
    },
    {
      type: 'reallocation',
      fromCampaign: 'Programmatic Display',
      fromChannel: 'Display',
      toCampaign: 'Micro-Influencer Push',
      toChannel: 'Social',
      budgetShift: 3000,
      reason: 'Influencer content performs 2.3x better in summer due to lifestyle-oriented browsing. Display CPMs rise in Q2, reducing its already-low efficiency.',
      expectedImpact: { revenueChange: 6800, conversionChange: 85, roiEstimate: 2.8 },
      confidence: 'Medium',
      executionRisk: 'Medium',
    },
    {
      type: 'reallocation',
      fromCampaign: 'CTV Campaign',
      fromChannel: 'Video',
      toCampaign: 'Web Push Re-engagement',
      toChannel: 'Email',
      budgetShift: 1500,
      reason: 'Push notifications have the highest ROI (19x) and summer flash-sale messaging historically drives 30% higher click-through.',
      expectedImpact: { revenueChange: 12000, conversionChange: 190, roiEstimate: 19.0 },
      confidence: 'High',
      executionRisk: 'Low',
    },
  ],
  expansions: [],
  noRecommendationReason: null,
}

// ── Mock 4: No Recommendations with Reason ──────────────────────────────────

const noRecommendationsWithReason: BudgetOptimizerResponse = {
  model: MOCK_GROQ_LLAMA,
  summary:
    'Current portfolio allocation is optimized for the campaign mix and market conditions.',
  recommendations: [],
  expansions: [],
  noRecommendationReason: 'All high-performing channels are near saturation, and reallocation would introduce execution risk without sufficient upside. Consider revisiting after Q3 performance data arrives.',
}

// ── Mock 5: No Recommendations, No Reason ────────────────────────────────────

const noRecommendationsNoReason: BudgetOptimizerResponse = {
  model: MOCK_GEMINI_FLASH,
  summary:
    'Portfolio is running efficiently. No immediate optimization opportunities identified.',
  recommendations: [],
  expansions: [],
  noRecommendationReason: null,
}

export const BUDGET_OPTIMIZATION_SAMPLES: BudgetOptimizerResponse[] = [
  aggressiveReallocation,
  conservativeOptimization,
  seasonalPivot,
  noRecommendationsWithReason,
  noRecommendationsNoReason,
]
