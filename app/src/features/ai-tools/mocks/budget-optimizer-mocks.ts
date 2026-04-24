import type { AiModel } from '../providers/types'
import type { BudgetOptimizerResponse } from '../ai-analysis/types'

const MOCK_GEMINI_FLASH: AiModel = {
  id: 'gemini-2.0-flash',
  displayName: 'Gemini 2.0 Flash',
  family: 'Gemini',
  strength: 'Fast and efficient for structured analysis tasks',
  strengthScore: 8,
  reason: 'Best balance of speed and accuracy for marketing budget analysis',
  limitReached: false,
}

const MOCK_GROQ_LLAMA: AiModel = {
  id: 'llama-3.3-70b-versatile',
  displayName: 'Llama 3.3 70B',
  family: 'Llama',
  strength: 'High-quality reasoning with detailed analytical depth',
  strengthScore: 9,
  reason: 'Strong analytical reasoning with comprehensive budget optimization insights',
  limitReached: false,
}

// ── Mock 1: Aggressive Reallocation ──────────────────────────────────────────

const aggressiveReallocation: BudgetOptimizerResponse = {
  model: MOCK_GEMINI_FLASH,
  summary:
    'Portfolio shows a 3.4x ROI spread — reallocating 35% of underperforming spend to proven winners could lift overall ROI from 2.1x to 2.8x.',
  recommendations: [
    {
      fromCampaign: 'Programmatic Display',
      toCampaign: 'Google Brand Search',
      budgetShift: 3500,
      reason: 'Brand Search delivers 3.4x ROI versus Display at 0.87x. Brand search converts consistently and has room to scale before diminishing returns.',
      expectedImpact: { revenueChange: 14200, conversionChange: 112, roiEstimate: 3.9 },
      confidence: 'High',
      executionRisk: 'Low',
    },
    {
      fromCampaign: 'TikTok Awareness',
      toCampaign: 'Instagram Retargeting',
      budgetShift: 2200,
      reason: 'TikTok drives high impressions but low conversions (0.47% CVR). Instagram Retargeting converts at 4.56% targeting warm audiences already in-funnel.',
      expectedImpact: { revenueChange: 8400, conversionChange: 68, roiEstimate: 3.5 },
      confidence: 'Medium',
      executionRisk: 'Low',
    },
    {
      fromCampaign: 'CTV Campaign',
      toCampaign: 'Win-Back Email',
      budgetShift: 4000,
      reason: 'Win-Back Email has the highest ROI in the portfolio (12x) with an extremely low current budget. A moderate increase yields outsized returns before saturation.',
      expectedImpact: { revenueChange: 18000, conversionChange: 240, roiEstimate: 12.0 },
      confidence: 'High',
      executionRisk: 'Low',
    },
  ],
}

// ── Mock 2: Conservative Optimization ────────────────────────────────────────

const conservativeOptimization: BudgetOptimizerResponse = {
  model: MOCK_GROQ_LLAMA,
  summary:
    'Portfolio is broadly healthy at 2.1x ROI. Small 10–15% shifts across two campaigns can improve returns by an estimated 0.4x without disrupting channel momentum.',
  recommendations: [
    {
      fromCampaign: 'Google Non-Brand Search',
      toCampaign: 'Newsletter Campaign',
      budgetShift: 1800,
      reason: 'Newsletter runs at 10.7x ROI on a €1,200 budget. Even a modest increase stays within audience saturation limits.',
      expectedImpact: { revenueChange: 9600, conversionChange: 150, roiEstimate: 10.7 },
      confidence: 'High',
      executionRisk: 'Low',
    },
    {
      fromCampaign: 'Native Content Ads',
      toCampaign: 'Partner Network',
      budgetShift: 1200,
      reason: 'Partner Network converts at 5% with 4.6x ROI. Native Ads deliver only 2.1x. Affiliates have capacity for additional volume.',
      expectedImpact: { revenueChange: 5400, conversionChange: 56, roiEstimate: 4.6 },
      confidence: 'Medium',
      executionRisk: 'Low',
    },
  ],
}

// ── Mock 3: Seasonal Pivot ───────────────────────────────────────────────────

const seasonalPivot: BudgetOptimizerResponse = {
  model: MOCK_GEMINI_FLASH,
  summary:
    'Summer shifts behaviour toward mobile and social — pivoting 25% of desktop-heavy spend to mobile-first channels projects a 0.6x ROI lift.',
  recommendations: [
    {
      fromCampaign: 'Bing Ads',
      toCampaign: 'Instagram Retargeting',
      budgetShift: 2000,
      reason: 'Summer months drive 40% more mobile social usage. Instagram Retargeting already converts well and will benefit from the seasonal browsing spike.',
      expectedImpact: { revenueChange: 7800, conversionChange: 54, roiEstimate: 3.8 },
      confidence: 'Medium',
      executionRisk: 'Low',
    },
    {
      fromCampaign: 'Programmatic Display',
      toCampaign: 'Micro-Influencer Push',
      budgetShift: 3000,
      reason: 'Influencer content performs 2.3x better in summer due to lifestyle-oriented browsing. Display CPMs rise in Q2, reducing its already-low efficiency.',
      expectedImpact: { revenueChange: 6800, conversionChange: 85, roiEstimate: 2.8 },
      confidence: 'Medium',
      executionRisk: 'Medium',
    },
    {
      fromCampaign: 'CTV Campaign',
      toCampaign: 'Web Push Re-engagement',
      budgetShift: 1500,
      reason: 'Push notifications have the highest ROI (19x) and summer flash-sale messaging historically drives 30% higher click-through.',
      expectedImpact: { revenueChange: 12000, conversionChange: 190, roiEstimate: 19.0 },
      confidence: 'High',
      executionRisk: 'Low',
    },
  ],
}

// ── Mock 4: Channel Consolidation ────────────────────────────────────────────

const channelConsolidation: BudgetOptimizerResponse = {
  model: MOCK_GROQ_LLAMA,
  summary:
    'Budget spread across 13 channels dilutes focus. Consolidating to 8 core channels would increase average ROI from 2.1x to 3.2x and reduce management overhead by 40%.',
  recommendations: [
    {
      fromCampaign: 'Podcast Mid-Roll',
      toCampaign: 'SEO Content Hub',
      budgetShift: 5200,
      reason: 'SEO delivers 7x ROI with compounding returns. Podcast attribution is unreliable and the 1.35x ROI does not justify the spend.',
      expectedImpact: { revenueChange: 22400, conversionChange: 280, roiEstimate: 7.0 },
      confidence: 'High',
      executionRisk: 'Low',
    },
    {
      fromCampaign: 'Programmatic Display',
      toCampaign: 'Retargeting Display',
      budgetShift: 4000,
      reason: 'Prospecting Display (0.87x ROI) wastes budget on cold audiences. Retargeting Display (3.4x ROI) targets warm visitors with proven intent.',
      expectedImpact: { revenueChange: 13500, conversionChange: 140, roiEstimate: 4.2 },
      confidence: 'High',
      executionRisk: 'Low',
    },
  ],
}

// ── Mock 5: No Strong Opportunity ────────────────────────────────────────────

const noStrongOpportunity: BudgetOptimizerResponse = {
  model: MOCK_GEMINI_FLASH,
  summary:
    'Portfolio efficiency is well-balanced across active channels. No material reallocation opportunity meets the confidence threshold at current performance levels.',
  recommendations: [],
}

export const BUDGET_OPTIMIZER_MOCKS: BudgetOptimizerResponse[] = [
  aggressiveReallocation,
  conservativeOptimization,
  seasonalPivot,
  channelConsolidation,
  noStrongOpportunity,
]
