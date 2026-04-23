import type { AiModel } from '../providers/types'
import type { ExecutiveSummaryResponse } from '../types'

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

/**
 * 5 mock ExecutiveSummaryResponse objects for UI development.
 * Each represents a different portfolio health scenario.
 */

// ── Mock 1: Strong Portfolio ─────────────────────────────────────────────────

const strongPortfolio: ExecutiveSummaryResponse = {
  model: MOCK_GEMINI_FLASH,
  period: 'Q1 2026',
  health_score: {
    score: 82,
    label: 'Good',
    reasoning:
      'Portfolio delivers a healthy 2.1x overall ROI with strong performers in owned channels. Dragged down slightly by two negative-ROI campaigns consuming 16% of budget.',
  },
  bottom_line:
    'Your marketing portfolio is performing well overall, with owned channels (Email, Push, Referral) delivering exceptional returns. Immediate gains are available by reallocating budget from Display and CTV to proven winners.',
  insights: [
    {
      type: 'achievement',
      icon: '🏆',
      text: 'Web Push Re-engagement delivers 19x ROI — the highest in your entire portfolio — on just €600 budget.',
      metric_highlight: { label: 'Push ROI', value: '19.0x' },
    },
    {
      type: 'opportunity',
      icon: '💡',
      text: 'Your top 4 campaigns by ROI receive only 4.6% of total budget. Scaling these could transform portfolio returns.',
      metric_highlight: { label: 'Top 4 Budget Share', value: '4.6%' },
    },
    {
      type: 'warning',
      icon: '⚠️',
      text: 'Programmatic Display and CTV Campaign are both running at negative ROI (0.87x), consuming €16,500 combined.',
      metric_highlight: { label: 'Wasted Spend', value: '€16,500' },
    },
    {
      type: 'performance',
      icon: '📊',
      text: 'Paid Search accounts for 32% of total conversions while consuming only 23% of budget — your most balanced channel.',
      metric_highlight: { label: 'Paid Search CVR Share', value: '32%' },
    },
    {
      type: 'opportunity',
      icon: '🎯',
      text: 'Referral Program has a 20% conversion rate — highest in portfolio. Scaling referral incentives could yield outsized returns.',
      metric_highlight: { label: 'Referral CVR', value: '20%' },
    },
  ],
  priority_actions: [
    {
      priority: 1,
      action: 'Pause Programmatic Display and redirect €5,500 to high-ROI owned channels',
      expected_outcome: 'Eliminate negative-ROI spend and boost overall portfolio ROI by 0.3x',
      urgency: 'Immediate',
      success_metric: 'Portfolio ROI > 2.4x within 30 days',
    },
    {
      priority: 2,
      action: 'Scale Referral Program budget by 100% with tiered incentive structure',
      expected_outcome: 'Capture viral growth potential with 20% conversion rate',
      urgency: 'This Quarter',
      success_metric: 'Referral volume +60% while maintaining CVR > 15%',
    },
    {
      priority: 3,
      action: 'Restructure CTV Campaign — shift to performance-measurable formats or pause',
      expected_outcome: 'Free up €11,000 from attribution-challenged spend',
      urgency: 'This Quarter',
      success_metric: 'CTV ROI > 1.5x or budget reallocated to proven channels',
    },
  ],
  channel_summary: [
    { channel: 'Paid Search', status: 'strong', budget_share: '23.1%', one_liner: 'Reliable workhorse — 3.4x ROI on Brand, solid Non-Brand volume' },
    { channel: 'Email', status: 'strong', budget_share: '1.9%', one_liner: 'Highest efficiency at 11.2x combined ROI; severely underfunded' },
    { channel: 'Paid Social', status: 'moderate', budget_share: '23.7%', one_liner: 'Mixed bag — Instagram retargeting works, TikTok awareness burns cash' },
    { channel: 'Organic Search', status: 'strong', budget_share: '3.9%', one_liner: 'Compounding asset delivering 7x+ ROI with zero marginal cost' },
    { channel: 'Display', status: 'weak', budget_share: '5.4%', one_liner: 'Negative ROI on prospecting; only retargeting subset is viable' },
  ],
  additional_channels_note: '8 additional channels contribute 42% of budget — Affiliate (4.6x ROI) and Push (19x ROI) are standouts.',
  correlations: [
    {
      finding: 'Owned channels average 12.6x ROI versus 2.1x for paid channels',
      implication: 'Every euro shifted from paid to owned audience growth compounds long-term returns.',
    },
    {
      finding: 'Campaigns with CVR > 5% all have direct customer relationships (email, push, referral)',
      implication: 'First-party data drives the highest conversion rates — prioritize building these assets.',
    },
  ],
  key_metrics: {
    total_spend: 102800,
    total_revenue: 279540,
    overall_roi: 2.1,
    total_conversions: 5369,
    best_channel: 'Push Notifications (19.0x ROI)',
    worst_channel: 'Display (0.87x ROI)',
    best_campaign: 'Web Push Re-engagement',
    biggest_opportunity: 'Scale owned channels (Email, Push, Referral) — currently 4.6% of budget, delivering 12.6x average ROI',
  },
}

// ── Mock 2: Needs Attention ──────────────────────────────────────────────────

const needsAttention: ExecutiveSummaryResponse = {
  model: MOCK_GROQ_LLAMA,
  period: 'Q1 2026',
  health_score: {
    score: 48,
    label: 'Needs Attention',
    reasoning:
      'Portfolio ROI is below break-even at 0.9x. Over 60% of budget is allocated to channels with sub-1.5x ROI. Urgent rebalancing needed to prevent continued losses.',
  },
  bottom_line:
    'Your marketing spend is currently losing money overall. Three campaigns account for 45% of budget but deliver less than 1x ROI. Without intervention, you are projected to lose €12,000 this quarter.',
  insights: [
    {
      type: 'warning',
      icon: '📉',
      text: 'Overall portfolio ROI is 0.9x — you are spending more than you earn across all channels combined.',
      metric_highlight: { label: 'Portfolio ROI', value: '0.9x' },
    },
    {
      type: 'warning',
      icon: '⚠️',
      text: 'CTV Campaign alone consumes 18% of total budget while returning only 0.87x — the single largest drag on performance.',
      metric_highlight: { label: 'CTV Budget Share', value: '18%' },
    },
    {
      type: 'performance',
      icon: '🔥',
      text: 'Email and Push channels are bright spots with 11x+ ROI, but receive less than 3% of total budget.',
      metric_highlight: { label: 'Email+Push Budget', value: '2.5%' },
    },
    {
      type: 'warning',
      icon: '📉',
      text: 'Customer acquisition cost across paid channels averages €42 — 3x higher than owned channel CAC of €14.',
      metric_highlight: { label: 'Paid CAC', value: '€42' },
    },
  ],
  priority_actions: [
    {
      priority: 1,
      action: 'Immediately pause CTV Campaign and Programmatic Display — combined €16,500 at sub-1x ROI',
      expected_outcome: 'Stop bleeding €2,700/month in losses',
      urgency: 'Immediate',
      success_metric: 'Portfolio ROI > 1.0x within 2 weeks',
    },
    {
      priority: 2,
      action: 'Redirect paused budget to Email, Push, and Referral channels',
      expected_outcome: 'Shift from 0.9x to projected 1.8x overall ROI',
      urgency: 'Immediate',
      success_metric: 'Owned channel revenue doubles within 30 days',
    },
    {
      priority: 3,
      action: 'Audit all paid social campaigns — cut any with ROI < 1.2x',
      expected_outcome: 'Eliminate marginal performers diluting portfolio returns',
      urgency: 'This Quarter',
      success_metric: 'Paid social average ROI > 2.0x',
    },
  ],
  channel_summary: [
    { channel: 'Email', status: 'strong', budget_share: '1.9%', one_liner: 'Best performer at 11.2x ROI — dramatically underfunded' },
    { channel: 'Push Notifications', status: 'strong', budget_share: '0.6%', one_liner: 'Exceptional 19x ROI on minimal budget; scale immediately' },
    { channel: 'Paid Search', status: 'moderate', budget_share: '23.1%', one_liner: 'Brand search solid (3.4x); Non-Brand marginal (1.55x)' },
    { channel: 'CTV / OTT', status: 'weak', budget_share: '10.7%', one_liner: 'Largest single spend at 0.87x ROI — immediate pause recommended' },
    { channel: 'Display', status: 'weak', budget_share: '5.4%', one_liner: 'Negative ROI, low CVR — programmatic prospecting is not working' },
  ],
  additional_channels_note: '8 other channels represent 58.3% of budget with mixed results. Affiliate and Referral are strong; Influencer and Native need review.',
  correlations: [
    {
      finding: 'Budget allocation is inversely correlated with ROI — highest-spend channels have lowest returns',
      implication: 'The portfolio is structured to maximize reach rather than return. A fundamental rebalancing toward efficiency is needed.',
    },
    {
      finding: 'Campaigns targeting existing customers convert at 8x the rate of prospecting campaigns',
      implication: 'Retention and re-engagement spending should take priority over new customer acquisition until ROI stabilizes.',
    },
  ],
  key_metrics: {
    total_spend: 102800,
    total_revenue: 92520,
    overall_roi: 0.9,
    total_conversions: 3180,
    best_channel: 'Push Notifications (19.0x ROI)',
    worst_channel: 'CTV / OTT (0.87x ROI)',
    best_campaign: 'Web Push Re-engagement',
    biggest_opportunity: 'Pause CTV + Display (€16,500) and redirect to owned channels for immediate ROI recovery',
  },
}

// ── Mock 3: Excellent Performance ────────────────────────────────────────────

const excellentPerformance: ExecutiveSummaryResponse = {
  model: MOCK_GEMINI_FLASH,
  period: 'Q1 2026',
  health_score: {
    score: 91,
    label: 'Excellent',
    reasoning:
      'Portfolio delivers 3.8x overall ROI with no channel below break-even. Strong diversification across 13 channels with consistent performance. Minor optimization opportunities remain.',
  },
  bottom_line:
    'Your marketing engine is firing on all cylinders. Every channel delivers positive ROI, owned channels are well-funded, and paid acquisition costs are sustainable. Focus now shifts from fixing problems to maximizing upside.',
  insights: [
    {
      type: 'achievement',
      icon: '🏆',
      text: 'All 21 campaigns deliver positive ROI — zero budget waste across the entire portfolio.',
      metric_highlight: { label: 'Campaigns > 1x ROI', value: '21/21' },
    },
    {
      type: 'achievement',
      icon: '📈',
      text: 'Quarter-over-quarter revenue grew 28% while budget increased only 12% — improving efficiency at scale.',
      metric_highlight: { label: 'Revenue Growth', value: '+28%' },
    },
    {
      type: 'opportunity',
      icon: '🎯',
      text: 'SEO Content Hub ROI of 7x suggests content marketing has significant untapped potential for scaling.',
      metric_highlight: { label: 'SEO ROI', value: '7.0x' },
    },
    {
      type: 'performance',
      icon: '📊',
      text: 'Blended CAC of €19 is well within healthy range for the industry average of €35.',
      metric_highlight: { label: 'Blended CAC', value: '€19' },
    },
    {
      type: 'opportunity',
      icon: '💡',
      text: 'Instagram Retargeting shows 3x ROI with room to scale — retargeting pool is only at 40% capacity.',
      metric_highlight: { label: 'Retargeting Capacity', value: '40%' },
    },
  ],
  priority_actions: [
    {
      priority: 1,
      action: 'Double SEO Content Hub investment — compound returns make this the highest-ceiling channel',
      expected_outcome: 'Build durable organic traffic asset generating 200+ conversions/month',
      urgency: 'This Quarter',
      success_metric: 'Organic traffic +40% within 6 months',
    },
    {
      priority: 2,
      action: 'Expand retargeting pool through improved pixel coverage and audience segmentation',
      expected_outcome: 'Increase retargeting-eligible visitors by 50%, enabling higher spend at maintained ROI',
      urgency: 'This Quarter',
      success_metric: 'Retargeting pool size +50% with CVR > 3%',
    },
    {
      priority: 3,
      action: 'Test new channels (podcast, connected audio) with 5% experimental budget',
      expected_outcome: 'Identify next growth channel without risking core performance',
      urgency: 'Next Quarter',
      success_metric: 'At least one new channel achieving > 2x ROI',
    },
  ],
  channel_summary: [
    { channel: 'Email', status: 'strong', budget_share: '5.8%', one_liner: 'Star performer — 11x ROI with well-segmented audience and strong engagement' },
    { channel: 'Referral', status: 'strong', budget_share: '4.2%', one_liner: 'Viral loop working — 20% CVR and growing word-of-mouth flywheel' },
    { channel: 'Organic Search', status: 'strong', budget_share: '8.5%', one_liner: 'Compounding returns — 7x ROI and climbing as content library grows' },
    { channel: 'Paid Search', status: 'strong', budget_share: '25.0%', one_liner: 'Efficient at scale — 3.2x blended ROI with 90% impression share' },
    { channel: 'Paid Social', status: 'moderate', budget_share: '18.5%', one_liner: 'Good retargeting (3x), awareness campaigns could be tighter' },
  ],
  additional_channels_note: '8 additional channels contribute 38% of budget, all above break-even. Strongest are Affiliate (4.6x) and Push (19x).',
  correlations: [
    {
      finding: 'Revenue growth outpaces budget growth by 2.3x',
      implication: 'The portfolio is getting more efficient over time — a sign that optimization efforts and audience building are compounding.',
    },
    {
      finding: 'Channels with 6+ months of continuous investment show 40% higher ROI than newer ones',
      implication: 'Consistency pays off. Avoid frequent channel churn — let campaigns mature before judging them.',
    },
  ],
  key_metrics: {
    total_spend: 102800,
    total_revenue: 390640,
    overall_roi: 3.8,
    total_conversions: 7842,
    best_channel: 'Push Notifications (19.0x ROI)',
    worst_channel: 'TikTok Awareness (1.4x ROI)',
    best_campaign: 'Web Push Re-engagement',
    biggest_opportunity: 'Scale SEO Content Hub — 7x ROI with compounding returns and only 8.5% of budget',
  },
}

// ── Mock 4: Critical State ───────────────────────────────────────────────────

const criticalState: ExecutiveSummaryResponse = {
  model: MOCK_GROQ_LLAMA,
  period: 'Q1 2026',
  health_score: {
    score: 25,
    label: 'Critical',
    reasoning:
      'Portfolio is deeply unprofitable at 0.4x overall ROI. 14 of 21 campaigns fail to break even. Burn rate is unsustainable — immediate intervention required to prevent further losses.',
  },
  bottom_line:
    'Your marketing spend is destroying value. For every €1 spent, only €0.40 comes back. Without drastic action this week, projected quarterly losses will exceed €60,000. This requires an emergency audit and budget freeze on all underperforming channels.',
  insights: [
    {
      type: 'warning',
      icon: '🔥',
      text: 'You are losing €0.60 on every euro spent across the portfolio. 14 of 21 campaigns have negative ROI.',
      metric_highlight: { label: 'Loss per €1', value: '-€0.60' },
    },
    {
      type: 'warning',
      icon: '📉',
      text: 'Customer acquisition cost has spiked to €87 — 4x the industry benchmark of €22.',
      metric_highlight: { label: 'CAC', value: '€87' },
    },
    {
      type: 'warning',
      icon: '⚠️',
      text: 'Only 3 campaigns (Email, Push, Referral) are profitable. Together they receive just 3.5% of total budget.',
      metric_highlight: { label: 'Profitable Campaigns', value: '3 of 21' },
    },
    {
      type: 'performance',
      icon: '📊',
      text: 'Conversion rates have dropped 45% across paid channels compared to last quarter, suggesting audience fatigue or targeting issues.',
      metric_highlight: { label: 'CVR Decline', value: '-45%' },
    },
  ],
  priority_actions: [
    {
      priority: 1,
      action: 'Emergency budget freeze — pause all campaigns with ROI < 0.5x immediately',
      expected_outcome: 'Stop €48,000/quarter in losses within 48 hours',
      urgency: 'Immediate',
      success_metric: 'Active spend reduced by 60% this week',
    },
    {
      priority: 2,
      action: 'Consolidate remaining budget into Email, Push, and Referral — the only profitable channels',
      expected_outcome: 'Shift from 0.4x to ~3x ROI on active spend',
      urgency: 'Immediate',
      success_metric: 'Active portfolio ROI > 2.0x within 14 days',
    },
    {
      priority: 3,
      action: 'Conduct root-cause analysis on paid channel CVR decline before restarting any paused campaign',
      expected_outcome: 'Identify whether the issue is targeting, creative fatigue, or market shift',
      urgency: 'This Quarter',
      success_metric: 'Documented diagnosis with remediation plan for each channel',
    },
    {
      priority: 4,
      action: 'Review and renegotiate all media contracts — current CPMs are 2x market rate',
      expected_outcome: 'Reduce cost basis by 30-40% before reactivating paid channels',
      urgency: 'This Quarter',
      success_metric: 'New CPM agreements within 15% of market benchmark',
    },
  ],
  channel_summary: [
    { channel: 'Email', status: 'strong', budget_share: '1.9%', one_liner: 'One of only 3 profitable channels — 11x ROI, needs immediate scaling' },
    { channel: 'Push Notifications', status: 'strong', budget_share: '0.6%', one_liner: 'Tiny budget, huge returns (19x) — the lifeline of this portfolio' },
    { channel: 'Paid Search', status: 'weak', budget_share: '23.1%', one_liner: 'Brand still works (1.8x), but Non-Brand has collapsed to 0.3x' },
    { channel: 'Paid Social', status: 'weak', budget_share: '23.7%', one_liner: 'All four campaigns below break-even; creative fatigue suspected' },
    { channel: 'CTV / OTT', status: 'weak', budget_share: '10.7%', one_liner: 'Burning €11,000/quarter with 0.2x ROI — pause immediately' },
  ],
  additional_channels_note: '8 remaining channels are a mix — Referral (10.8x) is profitable but the rest hover between 0.3x and 0.8x ROI.',
  correlations: [
    {
      finding: 'Paid channel CPMs have increased 65% quarter-over-quarter while conversion rates fell 45%',
      implication: 'You are paying more to reach fewer converting customers — a classic sign of audience saturation or misaligned targeting.',
    },
    {
      finding: 'The 3 profitable campaigns all target existing customers; all 14 loss-making campaigns target cold audiences',
      implication: 'Cold acquisition is broken across every channel. Until fixed, all incremental budget should go to retention and re-engagement.',
    },
  ],
  key_metrics: {
    total_spend: 102800,
    total_revenue: 41120,
    overall_roi: 0.4,
    total_conversions: 1182,
    best_channel: 'Push Notifications (19.0x ROI)',
    worst_channel: 'CTV / OTT (0.2x ROI)',
    best_campaign: 'Web Push Re-engagement',
    biggest_opportunity: 'Emergency stop on 14 unprofitable campaigns saves €48,000/quarter in losses',
  },
}

// ── Mock 5: Growth Phase ─────────────────────────────────────────────────────

const growthPhase: ExecutiveSummaryResponse = {
  model: MOCK_GEMINI_FLASH,
  period: 'Q2 2026',
  health_score: {
    score: 73,
    label: 'Good',
    reasoning:
      'Portfolio ROI of 2.7x is solid and improving. Strong foundation in owned channels with healthy paid acquisition economics. Score is tempered by 3 underperforming campaigns that need attention.',
  },
  bottom_line:
    'Your marketing is in a healthy growth phase — ROI is strong and improving quarter-over-quarter. The portfolio is well-diversified across 13 channels with clear winners to scale. Three underperformers need restructuring to unlock the next performance tier.',
  insights: [
    {
      type: 'achievement',
      icon: '📈',
      text: 'Portfolio ROI improved from 2.1x to 2.7x quarter-over-quarter — a 29% efficiency gain while budget grew 15%.',
      metric_highlight: { label: 'ROI Improvement', value: '+29%' },
    },
    {
      type: 'opportunity',
      icon: '💡',
      text: 'Google Brand Search is capturing only 72% of branded impressions — 28% of your brand traffic goes to competitors.',
      metric_highlight: { label: 'Brand Impression Share', value: '72%' },
    },
    {
      type: 'performance',
      icon: '📊',
      text: 'Newsletter subscriber base grew 40% this quarter, driving Email channel revenue up 55% at stable conversion rates.',
      metric_highlight: { label: 'Email Revenue Growth', value: '+55%' },
    },
    {
      type: 'achievement',
      icon: '🎯',
      text: 'Blended CAC decreased from €28 to €22 — now 37% below industry benchmark.',
      metric_highlight: { label: 'CAC Trend', value: '€28 → €22' },
    },
    {
      type: 'warning',
      icon: '⚠️',
      text: 'TikTok Awareness CVR dropped to 0.3% — possible audience saturation after 6 months of same creative.',
      metric_highlight: { label: 'TikTok CVR', value: '0.3%' },
    },
  ],
  priority_actions: [
    {
      priority: 1,
      action: 'Increase Brand Search budget to capture the 28% impression share gap',
      expected_outcome: 'Recover branded traffic currently going to competitors',
      urgency: 'Immediate',
      success_metric: 'Brand impression share > 90%',
    },
    {
      priority: 2,
      action: 'Refresh TikTok creative assets — current set has been running for 6 months',
      expected_outcome: 'Address audience fatigue and restore CVR to > 0.8%',
      urgency: 'This Quarter',
      success_metric: 'TikTok CVR recovery to > 0.8% within 30 days of new creative launch',
    },
    {
      priority: 3,
      action: 'Launch a loyalty program integrated with Referral to boost repeat purchase rate',
      expected_outcome: 'Increase customer LTV by 20% and referral volume by 40%',
      urgency: 'Next Quarter',
      success_metric: 'Repeat purchase rate +15% within 90 days of launch',
    },
  ],
  channel_summary: [
    { channel: 'Email', status: 'strong', budget_share: '4.2%', one_liner: 'Growth engine — 55% revenue increase driven by subscriber expansion' },
    { channel: 'Paid Search', status: 'strong', budget_share: '22.0%', one_liner: 'Solid 3.2x ROI with clear headroom on Brand impression share' },
    { channel: 'Referral', status: 'strong', budget_share: '5.1%', one_liner: 'Viral flywheel accelerating — CVR steady at 20% as volume grows' },
    { channel: 'Organic Search', status: 'strong', budget_share: '7.8%', one_liner: 'Content library compounding — 7x ROI and climbing' },
    { channel: 'Paid Social', status: 'moderate', budget_share: '20.5%', one_liner: 'Instagram retargeting strong (3x); TikTok needs creative refresh' },
  ],
  additional_channels_note: '8 other channels account for 40.4% of budget. Affiliate (4.6x) and Push (19x) lead; Native Ads (2.1x) and Podcast (1.35x) trail.',
  correlations: [
    {
      finding: 'Channels with fresh creative (< 90 days old) convert at 2.4x the rate of stale campaigns',
      implication: 'Creative refresh cadence directly impacts conversion rates. Budget for quarterly creative production across all channels.',
    },
    {
      finding: 'Subscriber-based channels (Email, Push) show zero CAC increase as volume scales',
      implication: 'Owned audiences are the most scalable asset — investment in subscriber growth has compounding returns with no marginal cost inflation.',
    },
  ],
  key_metrics: {
    total_spend: 118220,
    total_revenue: 319194,
    overall_roi: 2.7,
    total_conversions: 6450,
    best_channel: 'Push Notifications (19.0x ROI)',
    worst_channel: 'Podcast (1.35x ROI)',
    best_campaign: 'Web Push Re-engagement',
    biggest_opportunity: 'Capture 28% branded impression share gap — estimated €8,500 in recovered revenue',
  },
}

export const EXECUTIVE_SUMMARY_MOCKS: ExecutiveSummaryResponse[] = [
  strongPortfolio,
  needsAttention,
  excellentPerformance,
  criticalState,
  growthPhase,
]
