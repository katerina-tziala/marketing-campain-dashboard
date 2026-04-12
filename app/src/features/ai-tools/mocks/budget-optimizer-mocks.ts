import type { BudgetOptimizerResponse } from '../types'

/**
 * 5 mock BudgetOptimizerResponse objects for UI development.
 * Each represents a different optimization scenario.
 */

// ── Mock 1: Aggressive Reallocation ──────────────────────────────────────────

const aggressiveReallocation: BudgetOptimizerResponse = {
  period: 'Q1 2026',
  executive_summary:
    'Your portfolio shows a 3.4x spread between best and worst ROI channels. ' +
    'Reallocating 35% of underperforming spend to proven winners could lift overall ROI from 2.1x to 2.8x ' +
    'while maintaining channel diversification.',
  recommendations: [
    {
      action: 'Shift budget from Programmatic Display to Google Brand Search',
      from_campaign: 'Programmatic Display',
      to_campaign: 'Google Brand Search',
      amount: 3500,
      expected_impact: {
        additional_revenue: 14200,
        additional_conversions: 112,
        new_roi_estimate: '3.9x',
      },
      confidence: 'High',
      reasoning:
        `Google Brand Search delivers 3.4x ROI vs Display's 0.87x. Brand search has consistent conversion rates and room to scale before hitting diminishing returns.`,
      timeline: 'Immediate',
      success_metrics: {
        what_to_measure: 'Incremental conversions from Brand Search',
        target: '+15% conversion volume within 2 weeks',
        review_after: '14 days',
      },
    },
    {
      action: 'Reallocate TikTok Awareness budget to Instagram Retargeting',
      from_campaign: 'TikTok Awareness',
      to_campaign: 'Instagram Retargeting',
      amount: 2200,
      expected_impact: {
        additional_revenue: 8400,
        additional_conversions: 68,
        new_roi_estimate: '3.5x',
      },
      confidence: 'Medium',
      reasoning:
        'TikTok drives high impressions but low conversions (0.47% CVR). Instagram Retargeting converts at 4.56% and targets warm audiences already in-funnel.',
      timeline: 'This Month',
      success_metrics: {
        what_to_measure: 'Retargeting ROAS and frequency cap performance',
        target: 'ROAS > 3.0x with frequency < 5',
        review_after: '21 days',
      },
    },
    {
      action: 'Reduce CTV Campaign and boost Email Win-Back',
      from_campaign: 'CTV Campaign',
      to_campaign: 'Win-Back Email',
      amount: 4000,
      expected_impact: {
        additional_revenue: 18000,
        additional_conversions: 240,
        new_roi_estimate: '12.0x',
      },
      confidence: 'High',
      reasoning:
        'Win-Back Email has the highest ROI in the portfolio (12.0x) and extremely low current budget. Even a moderate increase will yield outsized returns before saturation.',
      timeline: 'Immediate',
      success_metrics: {
        what_to_measure: 'Email open rate and conversion rate stability',
        target: 'Maintain CVR > 4% as volume scales',
        review_after: '10 days',
      },
    },
  ],
  top_performers: [
    {
      campaign: 'Web Push Re-engagement',
      roi: 19.0,
      insight: 'Highest ROI in portfolio at 19.0x with minimal budget. Push notifications reach already-engaged users at near-zero marginal cost.',
      unlock_potential: 'Expand push subscriber base by 30% through on-site opt-in prompts to scale this channel.',
    },
    {
      campaign: 'Win-Back Email',
      roi: 12.0,
      insight: 'Re-engaging lapsed customers at 12.0x ROI. High-intent audience responds well to personalized offers.',
      unlock_potential: 'Segment win-back audiences by recency and test tiered discount levels to maximize reactivation.',
    },
    {
      campaign: 'Referral Program',
      roi: 10.8,
      insight: 'Word-of-mouth channel delivering 10.8x ROI with 20% conversion rate — highest CVR in portfolio.',
      unlock_potential: 'Introduce tiered referral rewards to incentivize multi-referral advocates.',
    },
  ],
  underperformers: [
    {
      campaign: 'Programmatic Display',
      roi: 0.87,
      insight: 'Spending €5,500 to generate only €4,800 in revenue. Negative ROI with the lowest conversion rate (0.02%).',
      recommended_action: 'Reduce',
    },
    {
      campaign: 'CTV Campaign',
      roi: 0.87,
      insight: 'High CPM channel consuming €11,000 with sub-1x returns. Limited attribution visibility makes optimization difficult.',
      recommended_action: 'Restructure',
    },
    {
      campaign: 'TikTok Awareness',
      roi: 1.4,
      insight: 'Strong reach (320K impressions) but poor conversion. Functions as awareness-only with minimal direct revenue impact.',
      recommended_action: 'Reduce',
    },
  ],
  quick_wins: [
    {
      action: 'Pause lowest-performing Display placements and redirect to Brand Search',
      effort: 'Low',
      potential_impact: 'Save €2,000/month with no revenue loss',
      timeline: 'This week',
    },
    {
      action: 'Add urgency triggers to Win-Back Email subject lines',
      effort: 'Low',
      potential_impact: '+12% open rate based on industry benchmarks',
      timeline: '2-3 days',
    },
    {
      action: 'Implement frequency capping on Retargeting Display at 3 impressions/week',
      effort: 'Medium',
      potential_impact: 'Reduce wasted spend by 20% while maintaining conversion volume',
      timeline: '1 week',
    },
  ],
  correlations: [
    {
      finding: 'Channels with CVR > 3% all have budgets under €3,000',
      implication: 'Your most efficient converters are underfunded. Scaling these could yield disproportionate returns before saturation.',
    },
    {
      finding: 'High-impression channels (>200K) show an inverse relationship with ROI',
      implication: 'Awareness-heavy channels drive volume but not value. Consider shifting KPIs from impressions to cost-per-conversion.',
    },
  ],
  risks: [
    {
      risk: 'Reducing Display by 60% may impact top-of-funnel awareness pipeline',
      mitigation: 'Monitor organic search volume and direct traffic for 30 days post-change to detect any awareness drop.',
    },
    {
      risk: 'Email channel may hit deliverability limits if volume increases too quickly',
      mitigation: 'Ramp email volume gradually (20% per week) and monitor bounce rate and spam complaint rate.',
    },
  ],
}

// ── Mock 2: Conservative Optimization ────────────────────────────────────────

const conservativeOptimization: BudgetOptimizerResponse = {
  period: 'Q1 2026',
  executive_summary:
    'Your marketing portfolio is broadly healthy with a 2.1x overall ROI. ' +
    'Small, targeted adjustments of 10-15% across three campaigns can improve returns by an estimated 0.4x ' +
    'without disrupting established channel momentum.',
  recommendations: [
    {
      action: 'Trim Google Non-Brand Search and reinvest in Newsletter Campaign',
      from_campaign: 'Google Non-Brand Search',
      to_campaign: 'Newsletter Campaign',
      amount: 1800,
      expected_impact: {
        additional_revenue: 9600,
        additional_conversions: 150,
        new_roi_estimate: '10.7x',
      },
      confidence: 'High',
      reasoning:
        'Newsletter Campaign runs at 10.7x ROI with a tiny €1,200 budget. Even a modest increase stays well within audience saturation limits.',
      timeline: 'This Month',
      success_metrics: {
        what_to_measure: 'Newsletter subscriber engagement rate',
        target: 'Maintain open rate > 22% as list grows',
        review_after: '30 days',
      },
    },
    {
      action: 'Shift partial Native Ads budget to Partner Network',
      from_campaign: 'Native Content Ads',
      to_campaign: 'Partner Network',
      amount: 1200,
      expected_impact: {
        additional_revenue: 5400,
        additional_conversions: 56,
        new_roi_estimate: '5.2x',
      },
      confidence: 'Medium',
      reasoning:
        'Partner Network converts at 5% with 4.6x ROI. Native Ads deliver only 2.1x. Affiliate partners have capacity for additional volume.',
      timeline: 'This Month',
      success_metrics: {
        what_to_measure: 'Affiliate partner activation rate and conversion quality',
        target: 'Maintain average order value within 10% of current',
        review_after: '30 days',
      },
    },
  ],
  top_performers: [
    {
      campaign: 'Referral Program',
      roi: 10.8,
      insight: 'Best cost-efficiency in the portfolio. Each €1 generates €10.80 in revenue with 20% conversion rate.',
      unlock_potential: 'Test double-sided referral incentives to accelerate word-of-mouth growth.',
    },
    {
      campaign: 'Newsletter Campaign',
      roi: 10.67,
      insight: 'Owned channel with near-zero marginal distribution cost. High engagement from an opted-in audience.',
      unlock_potential: 'Grow subscriber base through checkout opt-in and content upgrades.',
    },
  ],
  underperformers: [
    {
      campaign: 'Native Content Ads',
      roi: 2.12,
      insight: 'Moderate ROI but high cost per conversion (€23.56). Content-to-conversion path is too long.',
      recommended_action: 'Reduce',
    },
    {
      campaign: 'Podcast Mid-Roll',
      roi: 1.35,
      insight: 'Attribution challenges and long consideration cycles make this channel hard to optimize in the short term.',
      recommended_action: 'Restructure',
    },
  ],
  quick_wins: [
    {
      action: 'A/B test Newsletter subject lines with personalization tokens',
      effort: 'Low',
      potential_impact: '+8-15% open rate improvement',
      timeline: 'Next send cycle',
    },
    {
      action: 'Renegotiate affiliate commission tiers based on volume thresholds',
      effort: 'Medium',
      potential_impact: 'Reduce CPA by 10% on high-volume partners',
      timeline: '2 weeks',
    },
  ],
  correlations: [
    {
      finding: 'Owned channels (Email, Push, Referral) average 12.6x ROI vs 2.1x for paid channels',
      implication: 'Investing in owned audience growth compounds returns over time without increasing media spend.',
    },
  ],
  risks: [
    {
      risk: 'Reducing Non-Brand Search may lower new customer acquisition volume',
      mitigation: 'Monitor new-vs-returning customer ratio weekly. Set a floor of €9,000 for Non-Brand to maintain discovery.',
    },
  ],
}

// ── Mock 3: Seasonal Pivot ───────────────────────────────────────────────────

const seasonalPivot: BudgetOptimizerResponse = {
  period: 'Q2 2026 (Summer)',
  executive_summary:
    'With summer approaching, consumer behavior shifts toward mobile and social channels. ' +
    'Recommend pivoting 25% of desktop-heavy budgets to mobile-first channels and increasing retargeting ' +
    'to capture seasonal browsing spikes. Projected ROI lift: 0.6x.',
  recommendations: [
    {
      action: 'Shift Bing Ads budget to Instagram Retargeting for summer mobile traffic',
      from_campaign: 'Bing Ads',
      to_campaign: 'Instagram Retargeting',
      amount: 2000,
      expected_impact: {
        additional_revenue: 7800,
        additional_conversions: 54,
        new_roi_estimate: '3.8x',
      },
      confidence: 'Medium',
      reasoning:
        'Summer months see 40% more mobile social usage. Instagram Retargeting already converts well and will benefit from increased mobile browsing.',
      timeline: 'This Month',
      success_metrics: {
        what_to_measure: 'Mobile conversion rate on Instagram placements',
        target: 'CVR > 3.5% on mobile devices',
        review_after: '21 days',
      },
    },
    {
      action: 'Boost Micro-Influencer Push with seasonal content budget',
      from_campaign: 'Programmatic Display',
      to_campaign: 'Micro-Influencer Push',
      amount: 3000,
      expected_impact: {
        additional_revenue: 6800,
        additional_conversions: 85,
        new_roi_estimate: '2.8x',
      },
      confidence: 'Medium',
      reasoning:
        'Influencer content performs 2.3x better in summer due to lifestyle-oriented browsing. Display CPMs rise in Q2, reducing its already-low efficiency.',
      timeline: 'This Month',
      success_metrics: {
        what_to_measure: 'Influencer post engagement rate and tracked conversions',
        target: 'Engagement > 3% with measurable conversion lift',
        review_after: '30 days',
      },
    },
    {
      action: 'Launch seasonal push notification series',
      from_campaign: 'CTV Campaign',
      to_campaign: 'Web Push Re-engagement',
      amount: 1500,
      expected_impact: {
        additional_revenue: 12000,
        additional_conversions: 190,
        new_roi_estimate: '19.0x',
      },
      confidence: 'High',
      reasoning:
        'Push notifications have the highest ROI (19x) and summer flash-sale messaging historically drives 30% higher click-through.',
      timeline: 'Immediate',
      success_metrics: {
        what_to_measure: 'Push notification CTR and opt-out rate',
        target: 'CTR > 12% with opt-out < 2%',
        review_after: '14 days',
      },
    },
  ],
  top_performers: [
    {
      campaign: 'Web Push Re-engagement',
      roi: 19.0,
      insight: 'Seasonal promotions via push historically spike engagement by 30% in summer months.',
      unlock_potential: 'Create a dedicated summer flash-sale push series with time-limited offers.',
    },
    {
      campaign: 'Instagram Retargeting',
      roi: 2.96,
      insight: 'Mobile-native format aligns perfectly with summer browsing patterns. Strong warm-audience conversion.',
      unlock_potential: 'Test Stories and Reels retargeting formats for higher engagement during summer.',
    },
    {
      campaign: 'SEO Content Hub',
      roi: 7.03,
      insight: 'Evergreen content continues to drive free organic traffic regardless of season.',
      unlock_potential: 'Publish seasonal buying guides to capture summer-specific search intent.',
    },
  ],
  underperformers: [
    {
      campaign: 'CTV Campaign',
      roi: 0.87,
      insight: 'TV viewership drops 20% in summer. Budget is better deployed in mobile channels during this period.',
      recommended_action: 'Pause',
    },
    {
      campaign: 'Programmatic Display',
      roi: 0.87,
      insight: 'Q2 CPM inflation makes Display even less efficient. Banner blindness increases during casual summer browsing.',
      recommended_action: 'Reduce',
    },
  ],
  quick_wins: [
    {
      action: 'Create summer-themed email templates for the Newsletter Campaign',
      effort: 'Low',
      potential_impact: '+10% seasonal click-through rate',
      timeline: '3-5 days',
    },
    {
      action: 'Set up geo-targeted push notifications for vacation hotspots',
      effort: 'Medium',
      potential_impact: '2x engagement in targeted regions',
      timeline: '1 week',
    },
  ],
  correlations: [
    {
      finding: 'Mobile-first channels see 35% higher engagement June through August',
      implication: 'Temporary budget shifts to mobile channels during summer yield outsized returns without long-term commitment.',
    },
    {
      finding: 'CTV and Display ROI drops 15-20% in Q2 historically',
      implication: 'Seasonal pauses on these channels free up budget without sacrificing annual performance.',
    },
  ],
  risks: [
    {
      risk: 'Pausing CTV may lose reserved inventory rates for Q3 restart',
      mitigation: 'Negotiate a minimum-spend hold with the CTV vendor to preserve rate cards.',
    },
    {
      risk: 'Influencer content quality is harder to control at higher volume',
      mitigation: 'Use a content approval workflow and limit to 5 vetted influencers for the initial push.',
    },
  ],
}

// ── Mock 4: Channel Consolidation ────────────────────────────────────────────

const channelConsolidation: BudgetOptimizerResponse = {
  period: 'Q1 2026',
  executive_summary:
    'Your budget is spread across 13 channels, diluting focus and making optimization difficult. ' +
    'Consolidating to 8 core channels and eliminating sub-2x ROI performers would increase average ROI from 2.1x to 3.2x ' +
    'while reducing management overhead by 40%.',
  recommendations: [
    {
      action: 'Consolidate Podcast Mid-Roll budget into SEO Content Hub',
      from_campaign: 'Podcast Mid-Roll',
      to_campaign: 'SEO Content Hub',
      amount: 5200,
      expected_impact: {
        additional_revenue: 22400,
        additional_conversions: 280,
        new_roi_estimate: '7.0x',
      },
      confidence: 'High',
      reasoning:
        'SEO delivers 7x ROI with compounding returns over time. Podcast attribution is unreliable and the 1.35x ROI doesn\'t justify the spend.',
      timeline: 'Next Quarter',
      success_metrics: {
        what_to_measure: 'Organic traffic growth and content-attributed conversions',
        target: '+25% organic conversions within one quarter',
        review_after: '90 days',
      },
    },
    {
      action: 'Merge Programmatic Display into Retargeting Display',
      from_campaign: 'Programmatic Display',
      to_campaign: 'Retargeting Display',
      amount: 4000,
      expected_impact: {
        additional_revenue: 13500,
        additional_conversions: 140,
        new_roi_estimate: '4.2x',
      },
      confidence: 'High',
      reasoning:
        'Prospecting Display (0.87x ROI) wastes budget on cold audiences. Retargeting Display (3.4x ROI) targets warm visitors with proven intent.',
      timeline: 'Immediate',
      success_metrics: {
        what_to_measure: 'Retargeting pool size and conversion rate',
        target: 'Maintain CVR > 3% as retargeting budget doubles',
        review_after: '21 days',
      },
    },
    {
      action: 'Redirect Facebook Awareness to LinkedIn B2B',
      from_campaign: 'Facebook Awareness',
      to_campaign: 'LinkedIn B2B',
      amount: 3500,
      expected_impact: {
        additional_revenue: 8200,
        additional_conversions: 36,
        new_roi_estimate: '2.7x',
      },
      confidence: 'Medium',
      reasoning:
        'LinkedIn delivers higher-value B2B conversions (€228 AOV vs Facebook\'s €53). Despite lower volume, the revenue impact per conversion is 4x higher.',
      timeline: 'This Month',
      success_metrics: {
        what_to_measure: 'LinkedIn lead quality score and pipeline value',
        target: 'Maintain average deal value > €200',
        review_after: '30 days',
      },
    },
  ],
  top_performers: [
    {
      campaign: 'Google Brand Search',
      roi: 3.4,
      insight: 'Captures high-intent branded traffic efficiently. Consistent performer with predictable returns.',
      unlock_potential: 'Expand brand keyword coverage to include misspellings and competitor brand terms.',
    },
    {
      campaign: 'SEO Content Hub',
      roi: 7.03,
      insight: 'Compounding asset — content published today continues generating traffic for months. Zero marginal distribution cost.',
      unlock_potential: 'Double content production cadence and target long-tail keywords with high purchase intent.',
    },
  ],
  underperformers: [
    {
      campaign: 'Facebook Awareness',
      roi: 1.26,
      insight: 'Broad targeting yields low-quality traffic. High impressions but poor downstream conversion.',
      recommended_action: 'Pause',
    },
    {
      campaign: 'Podcast Mid-Roll',
      roi: 1.35,
      insight: 'Hard to attribute and optimize. Long sales cycles make ROI measurement unreliable.',
      recommended_action: 'Pause',
    },
    {
      campaign: 'Programmatic Display',
      roi: 0.87,
      insight: 'Negative ROI channel. Cold audience targeting with banner ads is increasingly ineffective.',
      recommended_action: 'Pause',
    },
  ],
  quick_wins: [
    {
      action: 'Pause Programmatic Display and reallocate immediately to Retargeting',
      effort: 'Low',
      potential_impact: 'Eliminate €700/month in losses; gain €2,700 in additional revenue',
      timeline: 'Today',
    },
    {
      action: 'Consolidate social media management to Instagram + LinkedIn only',
      effort: 'Medium',
      potential_impact: 'Save 15 hours/week in campaign management overhead',
      timeline: '2 weeks',
    },
  ],
  correlations: [
    {
      finding: 'Top 5 channels generate 78% of revenue but receive only 52% of budget',
      implication: 'Nearly half the budget goes to channels producing minimal returns. Consolidation aligns spend with value.',
    },
    {
      finding: 'Channels with fewer than 200 conversions have an average ROI of 1.4x',
      implication: 'Low-volume channels lack the data needed for effective optimization. Consider minimum viability thresholds.',
    },
  ],
  risks: [
    {
      risk: 'Pausing 3 channels simultaneously may create blind spots in the funnel',
      mitigation: 'Phase exits over 6 weeks. Monitor overall traffic and lead volume weekly for unexpected drops.',
    },
    {
      risk: 'Consolidation reduces diversification — performance becomes dependent on fewer channels',
      mitigation: 'Maintain a 10% experimental budget for testing new channels quarterly.',
    },
  ],
}

// ── Mock 5: Growth Expansion ─────────────────────────────────────────────────

const growthExpansion: BudgetOptimizerResponse = {
  period: 'Q1 2026',
  executive_summary:
    'Your top performers have significant headroom for scaling. Analysis suggests a 20% total budget increase ' +
    'concentrated on the 5 highest-ROI channels would generate an estimated €45,000 in additional revenue — ' +
    'a 2.8x return on the incremental spend. Current efficiency metrics support expansion before diminishing returns.',
  recommendations: [
    {
      action: 'Scale Google Brand Search with expanded keyword coverage',
      from_campaign: 'Google Non-Brand Search',
      to_campaign: 'Google Brand Search',
      amount: 4000,
      expected_impact: {
        additional_revenue: 13600,
        additional_conversions: 108,
        new_roi_estimate: '3.4x',
      },
      confidence: 'High',
      reasoning:
        'Brand Search impression share is at 72%, meaning 28% of branded queries go to competitors. Capturing this gap is high-confidence revenue.',
      timeline: 'Immediate',
      success_metrics: {
        what_to_measure: 'Branded impression share and absolute top position rate',
        target: 'Impression share > 90%',
        review_after: '14 days',
      },
    },
    {
      action: 'Double Referral Program incentives and budget',
      from_campaign: 'Native Content Ads',
      to_campaign: 'Referral Program',
      amount: 2000,
      expected_impact: {
        additional_revenue: 21600,
        additional_conversions: 240,
        new_roi_estimate: '10.8x',
      },
      confidence: 'Medium',
      reasoning:
        'Referral has a 20% conversion rate — best in portfolio. Increasing incentives by 50% typically drives 80% more referral volume in SaaS/e-commerce.',
      timeline: 'This Month',
      success_metrics: {
        what_to_measure: 'Referral volume growth and referred customer LTV',
        target: '+60% referral volume while maintaining 90-day retention > 70%',
        review_after: '30 days',
      },
    },
    {
      action: 'Invest in SEO Content Hub editorial expansion',
      from_campaign: 'Programmatic Display',
      to_campaign: 'SEO Content Hub',
      amount: 3500,
      expected_impact: {
        additional_revenue: 15000,
        additional_conversions: 190,
        new_roi_estimate: '7.0x',
      },
      confidence: 'Medium',
      reasoning:
        'SEO has a 3-6 month payback window but compounds. Current content covers only 15% of addressable keywords. The investment builds a durable traffic asset.',
      timeline: 'Next Quarter',
      success_metrics: {
        what_to_measure: 'Indexed pages, ranking keywords, and organic conversion volume',
        target: '+40% organic traffic within 6 months',
        review_after: '90 days',
      },
    },
    {
      action: 'Expand Partner Network with 3 new affiliate tiers',
      from_campaign: 'CTV Campaign',
      to_campaign: 'Partner Network',
      amount: 3000,
      expected_impact: {
        additional_revenue: 13800,
        additional_conversions: 144,
        new_roi_estimate: '4.6x',
      },
      confidence: 'Medium',
      reasoning:
        'Current affiliate pool is at 60% capacity. Adding mid-tier and niche affiliates typically grows channel volume by 40-50% with stable conversion rates.',
      timeline: 'This Month',
      success_metrics: {
        what_to_measure: 'New affiliate activation rate and quality score',
        target: '3+ new affiliates generating > 20 conversions/month each',
        review_after: '45 days',
      },
    },
  ],
  top_performers: [
    {
      campaign: 'Web Push Re-engagement',
      roi: 19.0,
      insight: 'Extraordinary efficiency — nearly free distribution to an engaged audience. The ceiling is subscriber base size, not budget.',
      unlock_potential: 'Invest in push subscriber acquisition through on-site prompts, checkout opt-ins, and content gating.',
    },
    {
      campaign: 'Win-Back Email',
      roi: 12.0,
      insight: 'Reactivation engine running at 12x. Each churned customer re-engaged saves the cost of acquiring a new one.',
      unlock_potential: 'Build predictive churn models to trigger win-back earlier in the disengagement cycle.',
    },
    {
      campaign: 'Referral Program',
      roi: 10.8,
      insight: 'Viral loop with 20% conversion. Referred customers typically have 25% higher LTV than paid-acquired ones.',
      unlock_potential: 'Gamify referrals with milestone rewards (3, 5, 10 referrals) to create power advocates.',
    },
    {
      campaign: 'Newsletter Campaign',
      roi: 10.67,
      insight: 'Owned audience at scale. Zero marginal distribution cost means every optimization flows directly to bottom line.',
      unlock_potential: 'Implement behavioral segmentation to deliver hyper-personalized content and offers.',
    },
  ],
  underperformers: [
    {
      campaign: 'Programmatic Display',
      roi: 0.87,
      insight: 'Losing money. Cold prospecting via banner ads in a privacy-first era yields declining returns.',
      recommended_action: 'Pause',
    },
    {
      campaign: 'CTV Campaign',
      roi: 0.87,
      insight: 'Premium pricing without premium results. Attribution gaps make optimization impossible.',
      recommended_action: 'Reduce',
    },
  ],
  quick_wins: [
    {
      action: 'Add a referral prompt to post-purchase confirmation emails',
      effort: 'Low',
      potential_impact: '+30% referral program entries with zero additional ad spend',
      timeline: '2 days',
    },
    {
      action: 'Create 5 new long-tail SEO articles targeting high-intent keywords',
      effort: 'Medium',
      potential_impact: 'Estimated 800 additional organic visits/month within 90 days',
      timeline: '2-3 weeks',
    },
    {
      action: 'Set up automated win-back email triggers based on 30/60/90 day inactivity',
      effort: 'Medium',
      potential_impact: 'Recover 5-8% of churning customers automatically',
      timeline: '1 week',
    },
  ],
  correlations: [
    {
      finding: 'Owned channels (Email, Push, Referral) deliver 6x the average ROI of paid channels',
      implication: 'Every euro invested in growing owned audiences creates a compounding advantage that reduces long-term dependency on paid media.',
    },
    {
      finding: 'Top 4 campaigns by ROI consume only 4.6% of total budget',
      implication: 'Your best performers are severely underfunded. Even modest scaling could transform portfolio-level returns.',
    },
    {
      finding: 'Campaigns with CVR > 5% all have direct relationship with the customer (email, push, referral)',
      implication: 'First-party data and existing relationships drive the highest conversion rates. Prioritize building these assets.',
    },
  ],
  risks: [
    {
      risk: 'Scaling Brand Search may trigger competitor bidding wars, inflating CPCs',
      mitigation: 'Set CPC ceiling at 120% of current average. Monitor auction insights weekly for competitor entry.',
    },
    {
      risk: 'Referral fraud risk increases with higher incentives',
      mitigation: 'Implement referral verification (email confirmation + first purchase) before awarding credits.',
    },
    {
      risk: 'SEO investment has a delayed payoff — no revenue impact for 3-6 months',
      mitigation: 'Fund SEO expansion from Display/CTV savings, not from high-performing channels, so there is no near-term revenue drag.',
    },
  ],
}

export const BUDGET_OPTIMIZER_MOCKS: BudgetOptimizerResponse[] = [
  aggressiveReallocation,
  conservativeOptimization,
  seasonalPivot,
  channelConsolidation,
  growthExpansion,
]
