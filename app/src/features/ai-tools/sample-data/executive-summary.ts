// [DEV ONLY]
import type { AiModel } from '../providers/types'
import type { ExecutiveSummaryResponse } from '../ai-analysis/types'

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

// ── Mock 1: Strong Portfolio ──────────────────────────────────────────────────

const strongPortfolio: ExecutiveSummaryResponse = {
  model: MOCK_GEMINI_FLASH,
  scope: 'fullPortfolio',
  healthScore: {
    score: 82,
    label: 'Good',
    reasoning: 'Portfolio delivers a healthy overall ROI with strong owned-channel performers, offset by two negative-ROI campaigns consuming 16% of budget.',
  },
  bottomLine: 'Owned channels are generating exceptional returns; immediate gains are available by reallocating budget from Display and CTV to proven winners.',
  overview: 'The portfolio shows a clear divide between high-efficiency owned channels and underperforming paid placements. Email and Referral together deliver 42% of revenue on 18% of budget, while Display and CTV absorb 16% of spend with negative ROI. Reallocation is low-risk given the performance gap.',
  executiveInsights: [
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
      metricHighlight: { label: 'Budget on negative-ROI channels', value: '16%' },
    },
  ],
  keyPriorities: [
    {
      priority: 1,
      title: 'Reallocate Display and CTV budget to Email and Web Push',
      rationale: 'Display and CTV are the primary efficiency drag — negative ROI at 16% of budget share with no conversion signal to justify the spend.',
      expectedOutcome: 'Eliminate the main portfolio drag and increase overall ROI by an estimated 8–12 points within 30 days.',
    },
    {
      priority: 2,
      title: 'Scale Web Push Re-engagement to test volume ceiling',
      rationale: 'Web Push runs at 1,900% ROI on a €600 budget — far below saturation. Even a 3× increase is unlikely to erode efficiency.',
      expectedOutcome: 'Capture additional high-ROI conversions before diminishing returns set in.',
    },
    {
      priority: 3,
      title: 'Restructure CTV targeting before next budget cycle',
      rationale: 'CTV negative ROI is structural if audience targeting remains broad — pausing or narrowing scope prevents further compounding loss.',
      expectedOutcome: 'Convert CTV from a net drag to break-even or positive contributor within the quarter.',
    },
  ],
  keyRisks: [
    {
      risk: 'Over-concentration in owned channels',
      severity: 'Medium',
      implication: 'Further reallocation to Email and Push increases dependency on channels with limited reach expansion — any deliverability issue or audience saturation would disproportionately impact revenue.',
    },
  ],
  growthOutlook: {
    label: 'Moderate',
    reasoning: 'Owned channels have clear headroom but limited total addressable audience. Growth beyond current trajectory requires activating new acquisition channels rather than purely optimizing existing allocation.',
  },
}

// ── Mock 2: Needs Attention ────────────────────────────────────────────────────

const needsAttention: ExecutiveSummaryResponse = {
  model: MOCK_GROQ_LLAMA,
  scope: 'fullPortfolio',
  healthScore: {
    score: 58,
    label: 'NeedsAttention',
    reasoning: 'Mixed performance with several high-spend channels underperforming on ROI and CPA, and budget allocation misaligned with revenue contribution.',
  },
  bottomLine: 'Budget is concentrated in channels that underdeliver; three reallocation moves could materially improve portfolio efficiency this quarter.',
  overview: 'The portfolio is generating revenue but at poor capital efficiency. Paid Social absorbs 28% of budget while contributing only 14% of revenue, and its CPA is 3.2× the portfolio average. SEO and Email outperform their budget share significantly but remain underfunded. Structural misalignment between allocation and contribution is the primary issue.',
  executiveInsights: [
    {
      type: 'Warning',
      text: 'Paid Social consumes 28% of budget but generates only 14% of revenue, creating the largest efficiency gap in the portfolio.',
      metricHighlight: { label: 'Paid Social efficiency gap', value: '−14 pp' },
    },
    {
      type: 'Performance',
      text: 'SEO delivers 22% of revenue on 9% of budget, making it the most capital-efficient channel despite limited investment.',
      metricHighlight: { label: 'SEO revenue vs budget share', value: '+13 pp' },
    },
    {
      type: 'Opportunity',
      text: 'CPA across Paid Social is 3.2× the portfolio average, indicating poor conversion quality that warrants audience review before any budget increase.',
      metricHighlight: { label: 'Paid Social CPA vs portfolio average', value: '3.2×' },
    },
  ],
  keyPriorities: [
    {
      priority: 1,
      title: 'Cut Paid Social budget by 30% and redirect to SEO',
      rationale: 'Paid Social CPA at 3.2× portfolio average signals a conversion quality problem, not a reach problem — more budget will not fix it.',
      expectedOutcome: 'Reduce the highest-CPA channel drag and amplify the most efficient acquisition channel; overall CPA expected to fall 15% within 60 days.',
    },
    {
      priority: 2,
      title: 'Audit Paid Social audience targeting and creative before next cycle',
      rationale: 'The CPA gap could be structural or fixable — determining which prevents either premature channel abandonment or continued waste.',
      expectedOutcome: 'Clear go/no-go decision on Paid Social with a revised targeting brief or deactivation plan.',
    },
    {
      priority: 3,
      title: 'Increase SEO budget by 20% to test linear scaling',
      rationale: 'SEO is the strongest efficiency performer but underfunded — validating whether it scales linearly unlocks the next reallocation decision.',
      expectedOutcome: 'SEO revenue share reaches 30% without ROI degradation; result determines future allocation ceiling.',
    },
  ],
  keyRisks: [
    {
      risk: 'Paid Social spend continuing without creative refresh',
      severity: 'High',
      implication: 'Each cycle without addressing the CPA gap compounds the allocation inefficiency — delay has a direct and measurable cost.',
    },
    {
      risk: 'SEO scaling assumption untested',
      severity: 'Low',
      implication: 'If SEO performance does not scale linearly, the reallocation thesis breaks and an alternative channel must be identified before budget is shifted.',
    },
  ],
  growthOutlook: {
    label: 'Moderate',
    reasoning: 'Growth is available through reallocation rather than new spend — fixing the Paid Social drag and scaling SEO could improve portfolio ROI materially without increasing total budget.',
  },
}

// ── Mock 3: Excellent Portfolio ───────────────────────────────────────────────

const excellentPortfolio: ExecutiveSummaryResponse = {
  model: MOCK_GEMINI_FLASH,
  scope: 'fullPortfolio',
  healthScore: {
    score: 91,
    label: 'Excellent',
    reasoning: 'Strong profitability across all major channels, efficient CPA, and well-distributed revenue with no significant concentration risk.',
  },
  bottomLine: 'The portfolio is performing at a high level with efficient allocation; the primary focus should be scaling top performers before market conditions shift.',
  overview: 'All six primary channels are ROI-positive and operating within acceptable CPA range. Revenue is distributed across channels with no single source exceeding 35%. CVR is 2.1× the industry benchmark. The main opportunity is incremental scaling of Affiliate and Influencer, which are currently under-invested relative to their returns.',
  executiveInsights: [
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
  keyPriorities: [
    {
      priority: 1,
      title: 'Scale Affiliate and Influencer budget by 40%',
      rationale: 'Both channels deliver revenue share well above their budget share with no saturation signal — scaling now captures returns before the efficiency window closes.',
      expectedOutcome: 'Combined revenue share reaches 25% without ROI falling below portfolio average.',
    },
    {
      priority: 2,
      title: 'Establish a revenue concentration monitoring threshold',
      rationale: 'As Affiliate and Influencer scale, concentration risk increases — a formal threshold prevents over-dependence from developing silently.',
      expectedOutcome: 'No single channel exceeds 40% revenue share for two consecutive months.',
    },
    {
      priority: 3,
      title: 'Replicate top CVR campaign funnel approach across lower performers',
      rationale: 'Portfolio CVR at 2.1× benchmark is a structural advantage — transferring the approach to underperforming campaigns captures conversion volume without added spend.',
      expectedOutcome: 'Bottom-quartile campaign CVR improves by 25% over baseline within the quarter.',
    },
  ],
  keyRisks: [],
  growthOutlook: {
    label: 'High',
    reasoning: 'With all channels ROI-positive and two clearly under-invested, the portfolio has room to scale efficiently. The main constraint is audience saturation timing rather than structural inefficiency.',
  },
}

// ── Mock 4: Critical Portfolio ────────────────────────────────────────────────

const criticalPortfolio: ExecutiveSummaryResponse = {
  model: MOCK_GROQ_LLAMA,
  scope: 'fullPortfolio',
  healthScore: {
    score: 34,
    label: 'Critical',
    reasoning: 'Negative overall ROI, severe budget misallocation, and three channels with zero conversions consuming 35% of total spend.',
  },
  bottomLine: 'The portfolio is in a critical state requiring immediate triage — 35% of budget is generating no conversions and must be paused before further spend occurs.',
  overview: 'Three channels — Video, Programmatic, and OOH — have produced zero conversions while absorbing 35% of budget. Email is the only positive-ROI channel and currently accounts for 71% of all revenue. This single-channel dependency combined with the zero-conversion spend creates both an immediate financial drain and a structural fragility risk.',
  executiveInsights: [
    {
      type: 'Warning',
      text: 'Three channels have produced zero conversions while absorbing 35% of total budget, making them the primary cause of portfolio underperformance.',
      metricHighlight: { label: 'Budget with zero conversions', value: '35%' },
    },
    {
      type: 'Performance',
      text: 'Email is the only positive-ROI channel and is bearing the entire conversion output of the portfolio on 8% of budget.',
      metricHighlight: { label: 'Email ROI', value: '178%' },
    },
    {
      type: 'Warning',
      text: 'Revenue concentration in a single channel creates structural fragility — any disruption to Email eliminates the only positive contributor.',
      metricHighlight: { label: 'Revenue from Email', value: '71%' },
    },
  ],
  keyPriorities: [
    {
      priority: 1,
      title: 'Immediately pause Video, Programmatic, and OOH spend',
      rationale: 'Zero conversions on 35% of budget is not an optimization problem — it is an active drain that must be stopped before any reallocation can be meaningful.',
      expectedOutcome: 'Stop budget loss and free 35% of spend for redistribution within 7 days.',
    },
    {
      priority: 2,
      title: 'Reallocate 50% of freed budget to Email',
      rationale: 'Email is the only channel with proven conversion performance — increasing its budget is the only immediately safe move while other channels are under review.',
      expectedOutcome: 'Email conversion volume increases by at least 30% within 30 days.',
    },
    {
      priority: 3,
      title: 'Conduct root-cause audit on paused channels before any reactivation',
      rationale: 'Zero conversion rate may be structural (wrong audience, wrong format) or operational (tracking failure, creative issues) — determining which shapes whether to reactivate or replace.',
      expectedOutcome: 'Go/no-go decision per paused channel within 6 weeks with documented rationale.',
    },
  ],
  keyRisks: [
    {
      risk: 'Email single-channel dependency',
      severity: 'High',
      implication: 'With 71% of revenue from one channel, any deliverability issue, list fatigue, or algorithm change would eliminate the portfolio\'s only positive contributor with no fallback.',
    },
    {
      risk: 'Zero-conversion channels may have tracking failures rather than performance failures',
      severity: 'Medium',
      implication: 'If the zero-conversion signal is a measurement error rather than a true performance signal, pausing those channels based on bad data would destroy attribution and complicate recovery.',
    },
  ],
  growthOutlook: {
    label: 'Limited',
    reasoning: 'Growth is not viable until the zero-conversion channels are resolved and Email dependency is reduced. The immediate priority is stabilization, not scaling.',
  },
}

// ── Mock 5: Growth Phase ──────────────────────────────────────────────────────

const growthPhase: ExecutiveSummaryResponse = {
  model: MOCK_GEMINI_FLASH,
  scope: 'selectedSubset',
  healthScore: {
    score: 74,
    label: 'Good',
    reasoning: 'Solid overall profitability with strong new-channel performance, though budget concentration and early-stage CPA instability limit the score.',
  },
  bottomLine: 'Growth channels are validating quickly; the portfolio is healthy but needs concentration risk management before budget is increased further.',
  overview: 'Paid Search has confirmed scalability with ROI improving from 140% to 210% as spend increased from €5k to €22k. TikTok Ads is showing strong early efficiency at 18% revenue share on 7% budget share. However, the top two channels now absorb 61% of total budget, creating concentration risk that limits resilience if either shifts in performance.',
  executiveInsights: [
    {
      type: 'Achievement',
      text: 'Paid Search has scaled from €5k to €22k with ROI improving from 140% to 210%, confirming it as a scalable channel with positive efficiency momentum.',
      metricHighlight: { label: 'Paid Search ROI improvement at scale', value: '+70 pp' },
    },
    {
      type: 'Opportunity',
      text: 'TikTok Ads delivers 18% of revenue on 7% of budget in its first full quarter, suggesting strong early traction worth accelerating before the channel matures.',
      metricHighlight: { label: 'TikTok revenue vs budget share', value: '+11 pp' },
    },
    {
      type: 'Warning',
      text: 'Top two channels account for 61% of total budget, creating concentration risk that limits resilience if either channel shifts.',
      metricHighlight: { label: 'Budget in top 2 channels', value: '61%' },
    },
  ],
  keyPriorities: [
    {
      priority: 1,
      title: 'Increase TikTok Ads budget by 50% to validate scalability',
      rationale: 'Early efficiency signal is strong but unconfirmed at higher volume — testing now while the channel is in its growth phase maximizes the window before audience saturation.',
      expectedOutcome: 'TikTok ROI stays above 150% post-increase; CPA remains within 1.2× portfolio average.',
    },
    {
      priority: 2,
      title: 'Cap top two channels at 55% combined budget share',
      rationale: 'Current 61% concentration means a single channel disruption has outsized portfolio impact — a structural cap enforces diversification without requiring a full reallocation.',
      expectedOutcome: 'Top two channel budget share falls below 55% by end of quarter with no overall ROI degradation.',
    },
    {
      priority: 3,
      title: 'Establish a quarterly channel review cadence as new channels mature',
      rationale: 'TikTok and Affiliate are early-stage — allocation decisions made now based on limited data risk over-indexing on noise rather than signal.',
      expectedOutcome: 'Budget allocation reviewed and adjusted quarterly with documented performance rationale per channel.',
    },
  ],
  keyRisks: [
    {
      risk: 'TikTok efficiency does not hold at scale',
      severity: 'Medium',
      implication: 'If TikTok CPA degrades above 1.5× portfolio average after budget increase, the growth thesis collapses and the incremental spend becomes difficult to redeploy quickly.',
    },
  ],
  growthOutlook: {
    label: 'High',
    reasoning: 'Two validated or validating channels with efficiency surplus provide a strong basis for growth. Concentration risk is manageable with a budget cap — the primary constraint is TikTok scalability confirmation.',
  },
}

export const EXECUTIVE_SUMMARY_SAMPLES: ExecutiveSummaryResponse[] = [
  strongPortfolio,
  needsAttention,
  excellentPortfolio,
  criticalPortfolio,
  growthPhase,
]
