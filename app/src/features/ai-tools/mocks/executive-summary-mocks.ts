import type { AiModel } from '../providers/types'
import type { ExecutiveSummaryResponse } from '../ai-analysis/types'

const MOCK_GEMINI_FLASH: AiModel = {
  id: 'gemini-2.0-flash',
  displayName: 'Gemini 2.0 Flash',
  family: 'Gemini',
  strength: 'Fast and efficient for structured analysis tasks',
  strengthScore: 8,
  reason: 'Best balance of speed and accuracy for executive summary generation',
  limitReached: false,
}

const MOCK_GROQ_LLAMA: AiModel = {
  id: 'llama-3.3-70b-versatile',
  displayName: 'Llama 3.3 70B',
  family: 'Llama',
  strength: 'High-quality reasoning with detailed analytical depth',
  strengthScore: 9,
  reason: 'Strong analytical reasoning with comprehensive portfolio insights',
  limitReached: false,
}

// ── Mock 1: Strong Portfolio ──────────────────────────────────────────────────

const strongPortfolio: ExecutiveSummaryResponse = {
  model: MOCK_GEMINI_FLASH,
  healthScore: {
    score: 82,
    label: 'Good',
    reasoning: 'Portfolio delivers a healthy overall ROI with strong owned-channel performers, offset by two negative-ROI campaigns consuming 16% of budget.',
  },
  bottomLine: 'Owned channels are generating exceptional returns; immediate gains are available by reallocating budget from Display and CTV to proven winners.',
  insights: [
    {
      type: 'Achievement',
      text: 'Web Push Re-engagement delivers the highest ROI in the portfolio on a minimal budget, signalling untapped scaling headroom.',
      metricHighlight: { label: 'Push ROI', value: '1,900%' },
    },
    {
      type: 'Opportunity',
      text: 'Email and Referral together contribute 42% of total revenue while consuming only 18% of budget, making them the strongest allocation opportunities.',
      metricHighlight: { label: 'Revenue share vs budget share', value: '+24 pp' },
    },
    {
      type: 'Warning',
      text: 'Display and CTV collectively absorb 16% of budget with negative ROI, representing a direct drag on portfolio efficiency.',
      metricHighlight: { label: 'Budget wasted on negative-ROI channels', value: '16%' },
    },
  ],
  priorityActions: [
    {
      priority: 1,
      action: 'Reduce Display and CTV budgets by at least 50% and reallocate to Email and Web Push.',
      expectedOutcome: 'Eliminate the primary efficiency drag and increase overall portfolio ROI by an estimated 8–12 points.',
      urgency: 'Immediate',
      successMetric: 'Portfolio ROI improves above 250% within 30 days of reallocation.',
    },
    {
      priority: 2,
      action: 'Scale Web Push Re-engagement budget from €600 to €2,000 to test volume capacity.',
      expectedOutcome: 'Capture additional high-ROI conversions from the highest-performing channel before saturation.',
      urgency: 'ThisQuarter',
      successMetric: 'Web Push ROI stays above 500% after scaling; incremental conversions tracked weekly.',
    },
    {
      priority: 3,
      action: 'Restructure CTV campaign targeting to focus on high-conversion audience segments.',
      expectedOutcome: 'Convert a negative-ROI channel into a break-even or positive contributor.',
      urgency: 'NextQuarter',
      successMetric: 'CTV ROI reaches 0% or above within the quarter.',
    },
  ],
  correlations: [
    {
      finding: 'Channels with budget share below 10% consistently deliver revenue share above 15%.',
      implication: 'Owned and niche channels are systematically underfunded relative to their contribution.',
    },
  ],
}

// ── Mock 2: Needs Attention ────────────────────────────────────────────────────

const needsAttention: ExecutiveSummaryResponse = {
  model: MOCK_GROQ_LLAMA,
  healthScore: {
    score: 58,
    label: 'NeedsAttention',
    reasoning: 'Mixed performance with several high-spend channels underperforming on ROI and CAC, and budget allocation misaligned with revenue contribution.',
  },
  bottomLine: 'Budget is concentrated in channels that underdeliver; three reallocation moves could materially improve portfolio efficiency this quarter.',
  insights: [
    {
      type: 'Warning',
      text: 'Paid Social consumes 28% of the budget but generates only 14% of revenue, creating the largest efficiency gap in the portfolio.',
      metricHighlight: { label: 'Paid Social efficiency gap', value: '−14 pp' },
    },
    {
      type: 'Performance',
      text: 'SEO delivers 22% of revenue on 9% of budget, making it the most capital-efficient channel despite limited investment.',
      metricHighlight: { label: 'SEO revenue vs budget share', value: '+13 pp' },
    },
    {
      type: 'Opportunity',
      text: 'CAC across Paid Social is 3.2× the portfolio average, indicating poor conversion quality that warrants audience or creative review before any budget increase.',
      metricHighlight: { label: 'Paid Social CAC vs portfolio average', value: '3.2×' },
    },
  ],
  priorityActions: [
    {
      priority: 1,
      action: 'Cut Paid Social budget by 30% and redirect to SEO content investment.',
      expectedOutcome: 'Reduce the highest-CAC channel's drag and amplify the most efficient acquisition channel.',
      urgency: 'Immediate',
      successMetric: 'Overall CAC decreases by 15% within 60 days; SEO organic traffic grows 10%.',
    },
    {
      priority: 2,
      action: 'Audit Paid Social audience targeting and creative assets before the next cycle.',
      expectedOutcome: 'Identify whether the CAC gap is structural or fixable through optimisation.',
      urgency: 'ThisQuarter',
      successMetric: 'Paid Social CAC falls within 1.5× of portfolio average after creative refresh.',
    },
    {
      priority: 3,
      action: 'Increase SEO budget allocation by 20% to test whether organic performance scales linearly.',
      expectedOutcome: 'Determine the scaling ceiling of the most efficient channel before further reallocation.',
      urgency: 'NextQuarter',
      successMetric: 'SEO revenue share reaches 30% without ROI degradation.',
    },
  ],
  correlations: [
    {
      finding: 'Channels with the highest CAC also have the largest gap between budget share and revenue share.',
      implication: 'Inefficient acquisition cost and poor capital efficiency co-occur, suggesting systemic targeting or funnel issues rather than isolated campaign failures.',
    },
  ],
}

// ── Mock 3: Excellent Portfolio ───────────────────────────────────────────────

const excellentPortfolio: ExecutiveSummaryResponse = {
  model: MOCK_GEMINI_FLASH,
  healthScore: {
    score: 91,
    label: 'Excellent',
    reasoning: 'Strong profitability across all major channels, efficient CAC, and well-distributed revenue with no significant concentration risk.',
  },
  bottomLine: 'The portfolio is performing at a high level with efficient allocation; the primary focus should be scaling top performers before market conditions shift.',
  insights: [
    {
      type: 'Achievement',
      text: 'All six primary channels are ROI-positive, with the lowest-performing channel still delivering 85% of the portfolio average.',
      metricHighlight: { label: 'Minimum channel ROI vs portfolio average', value: '85%' },
    },
    {
      type: 'Opportunity',
      text: 'Affiliate and Influencer combined account for 11% of budget but 19% of revenue — the clearest scaling opportunity in the portfolio.',
      metricHighlight: { label: 'Affiliate + Influencer revenue surplus', value: '+8 pp' },
    },
    {
      type: 'Performance',
      text: 'CVR is 2.1× the industry benchmark, suggesting strong funnel conversion that should be preserved during any scaling effort.',
      metricHighlight: { label: 'Portfolio CVR vs benchmark', value: '2.1×' },
    },
  ],
  priorityActions: [
    {
      priority: 1,
      action: 'Increase Affiliate and Influencer combined budget by 40% to exploit their disproportionate revenue contribution.',
      expectedOutcome: 'Grow high-efficiency revenue share while maintaining current portfolio ROI level.',
      urgency: 'ThisQuarter',
      successMetric: 'Affiliate + Influencer revenue share reaches 25% without ROI falling below portfolio average.',
    },
    {
      priority: 2,
      action: 'Establish a revenue concentration monitor: flag any single channel exceeding 40% revenue share.',
      expectedOutcome: 'Prevent over-dependence on any single channel as scaling continues.',
      urgency: 'ThisQuarter',
      successMetric: 'No channel exceeds 40% revenue share for two consecutive months.',
    },
    {
      priority: 3,
      action: 'Document and replicate the conversion funnel approach from the top CVR campaigns across lower-performing ones.',
      expectedOutcome: 'Bring underperforming campaign CVR closer to the portfolio average, increasing conversion volume without added spend.',
      urgency: 'NextQuarter',
      successMetric: 'Bottom-quartile campaign CVR improves by 25% over baseline.',
    },
  ],
  correlations: [],
}

// ── Mock 4: Critical Portfolio ────────────────────────────────────────────────

const criticalPortfolio: ExecutiveSummaryResponse = {
  model: MOCK_GROQ_LLAMA,
  healthScore: {
    score: 34,
    label: 'Critical',
    reasoning: 'Negative overall ROI, severe budget misallocation, and three channels with zero conversions consuming 35% of total spend.',
  },
  bottomLine: 'The portfolio is in a critical state requiring immediate triage — 35% of budget is generating no conversions and must be paused or restructured before further spend occurs.',
  insights: [
    {
      type: 'Warning',
      text: 'Three channels (Video, Programmatic, OOH) have produced zero conversions while absorbing 35% of the total budget, making them the primary cause of portfolio underperformance.',
      metricHighlight: { label: 'Budget with zero conversions', value: '35%' },
    },
    {
      type: 'Performance',
      text: 'Email is the only channel with a positive ROI, delivering 178% on 8% of budget — it is bearing the full weight of the portfolio\'s conversion output.',
      metricHighlight: { label: 'Email ROI', value: '178%' },
    },
    {
      type: 'Warning',
      text: 'Revenue concentration in a single channel creates structural fragility — any disruption to Email would eliminate the only positive contributor.',
      metricHighlight: { label: 'Revenue from single channel (Email)', value: '71%' },
    },
  ],
  priorityActions: [
    {
      priority: 1,
      action: 'Immediately pause Video, Programmatic, and OOH spending pending a root-cause review.',
      expectedOutcome: 'Stop the active budget drain and free up 35% of spend for redistribution to proven channels.',
      urgency: 'Immediate',
      successMetric: 'Zero budget allocated to zero-conversion channels within 7 days.',
    },
    {
      priority: 2,
      action: 'Reallocate 50% of freed budget to Email to increase volume from the only positive-ROI channel.',
      expectedOutcome: 'Grow Email revenue contribution while the remaining channels are reviewed.',
      urgency: 'Immediate',
      successMetric: 'Email conversion volume increases by at least 30% within 30 days.',
    },
    {
      priority: 3,
      action: 'Conduct a creative and targeting audit on paused channels before considering reactivation.',
      expectedOutcome: 'Determine whether underperformance is structural or fixable before committing further budget.',
      urgency: 'ThisQuarter',
      successMetric: 'Audit completed with a go/no-go decision per channel within 6 weeks.',
    },
  ],
  correlations: [],
}

// ── Mock 5: Growth Phase ──────────────────────────────────────────────────────

const growthPhase: ExecutiveSummaryResponse = {
  model: MOCK_GEMINI_FLASH,
  healthScore: {
    score: 74,
    label: 'Good',
    reasoning: 'Solid overall profitability with strong new-channel performance, though budget concentration and early-stage CAC instability in two channels limit the score.',
  },
  bottomLine: 'Growth channels are validating quickly; the portfolio is healthy but needs concentration risk management before budget is increased further.',
  insights: [
    {
      type: 'Achievement',
      text: 'Paid Search has scaled from €5k to €22k spend with ROI improving from 140% to 210%, confirming it as a scalable channel.',
      metricHighlight: { label: 'Paid Search ROI improvement at scale', value: '+70 pp' },
    },
    {
      type: 'Opportunity',
      text: 'TikTok Ads delivers 18% of revenue on 7% of budget in its first full quarter, suggesting strong early traction worth accelerating.',
      metricHighlight: { label: 'TikTok revenue vs budget share', value: '+11 pp' },
    },
    {
      type: 'Warning',
      text: 'Top 2 channels account for 61% of total budget, creating concentration risk that limits resilience if either channel performance shifts.',
      metricHighlight: { label: 'Budget concentration in top 2 channels', value: '61%' },
    },
  ],
  priorityActions: [
    {
      priority: 1,
      action: 'Increase TikTok Ads budget by 50% to determine whether early-stage efficiency holds at higher volume.',
      expectedOutcome: 'Validate TikTok as a scalable acquisition channel before committing to a larger structural reallocation.',
      urgency: 'ThisQuarter',
      successMetric: 'TikTok ROI remains above 150% after budget increase; CAC stays within 1.2× portfolio average.',
    },
    {
      priority: 2,
      action: 'Cap the top 2 channels\' combined budget share at 55% and reallocate the difference to TikTok and Affiliate.',
      expectedOutcome: 'Reduce concentration risk while directing incremental spend to the two highest-efficiency growth channels.',
      urgency: 'ThisQuarter',
      successMetric: 'Top 2 channel budget share falls below 55% by end of quarter with no overall ROI degradation.',
    },
    {
      priority: 3,
      action: 'Set a quarterly review cadence to reassess channel budget allocation as TikTok and Affiliate data matures.',
      expectedOutcome: 'Ensure allocation decisions are driven by performance signals rather than inertia as the portfolio evolves.',
      urgency: 'NextQuarter',
      successMetric: 'Budget allocation reviewed and adjusted quarterly with documented performance rationale.',
    },
  ],
  correlations: [
    {
      finding: 'Newer channels (TikTok, Affiliate) show a consistent pattern of revenue share exceeding budget share in their first full quarter.',
      implication: 'Early-stage efficiency signals are a reliable indicator for scaling candidates in this portfolio — new channel performance should be reviewed monthly in the first two quarters.',
    },
  ],
}

export const EXECUTIVE_SUMMARY_MOCKS: ExecutiveSummaryResponse[] = [
  strongPortfolio,
  needsAttention,
  excellentPortfolio,
  criticalPortfolio,
  growthPhase,
]
