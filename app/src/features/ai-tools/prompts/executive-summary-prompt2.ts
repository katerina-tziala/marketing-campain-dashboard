import type { PortfolioAnalysis } from '@/shared/portfolio-analysis/types'
import type { BusinessContext } from '@/features/ai-tools/ai-analysis/types'
import { getBusinessContextBlock } from './business-context'

const OUTPUT_SCHEMA = `{
  "healthScore": {
    "score": number,
    "label": "Excellent | Good | NeedsAttention | Critical",
    "reasoning": "string — one sentence explaining the score"
  },
  "bottomLine": "string — one sentence with the most important executive takeaway",
  "insights": [
    {
      "type": "Performance | Opportunity | Warning | Achievement",
      "text": "string — one sentence, high-signal only",
      "metricHighlight": {
        "label": "string — specific supporting metric for this insight",
        "value": "string — formatted value"
      }
    }
  ],
  "priorityActions": [
    {
      "priority": number,
      "action": "string — specific, data-backed action",
      "expectedOutcome": "string — direct business effect",
      "urgency": "Immediate | ThisQuarter | NextQuarter",
      "successMetric": "string — measurable success indicator"
    }
  ],
  "correlations": [
    {
      "finding": "string — supported cross-entity pattern only",
      "implication": "string — why it matters"
    }
  ]
}`

// ── Scope block ───────────────────────────────────────────────────────────────

function getScopeBlock(isFiltered: boolean): string {
  if (!isFiltered) {
    return `ANALYSIS SCOPE:
- Full portfolio analysis.
- Treat the provided dataset as the complete marketing portfolio for this request.`
  }

  return `ANALYSIS SCOPE:
- Filtered analysis scope.
- A subset of campaigns and channels is selected.
- Treat the provided dataset as the complete portfolio for this request.
- Do not assume the existence of campaigns or channels outside the provided input.
- Do not generalize conclusions beyond the selected subset unless explicitly supported by the input.`
}

// ── Prompt generator ──────────────────────────────────────────────────────────

export function generateExecutiveSummaryPrompt(
  analysis: PortfolioAnalysis,
  isFiltered: boolean,
  businessContext?: BusinessContext,
): string {
  const promptInput = {
    portfolio: analysis.portfolio,
    campaignGroups: {
      top: analysis.campaignGroups.top,
      bottom: analysis.campaignGroups.bottom,
      watch: analysis.campaignGroups.watch,
    },
    channels: analysis.channels,
    channelGroups: analysis.channelGroups,
    derivedSignals: {
      inefficientChannels: analysis.derivedSignals.inefficientChannels,
      scalingOpportunities: analysis.derivedSignals.scalingOpportunities,
      concentrationFlag: analysis.derivedSignals.concentrationFlag,
      correlations: analysis.derivedSignals.correlations,
    },
  }

  return `
ROLE:
You are a senior marketing strategist preparing an executive summary for company leadership.
Be concise, analytical, direct, and free of fluff.

TASK:
Generate a concise executive summary from the provided marketing data.
Focus on interpretation, material risks, trade-offs, and priority actions.
Add meaning, not repetition.

${getScopeBlock(isFiltered)}

${getBusinessContextBlock(businessContext)}

CRITICAL RULES:
- Use only the provided input data.
- Do not invent metrics, assumptions, causes, or unsupported conclusions.
- Use businessContext to refine interpretation, prioritization, and risk framing, but do not let it override the performance signals in the input data.
- Do not restate dashboard-visible metrics or rankings unless required to support a non-obvious conclusion.
- Do not summarize channels or campaigns one by one.
- Do not include fluff, filler language, generic executive phrasing, or presentation-style language.
- Every sentence must add decision-making value.
- Prefer implications, risks, concentration, allocation quality, scalability, and strategic trade-offs over description.
- Treat derivedSignals as authoritative computed inputs.
- Prioritize derivedSignals when forming insights and priorityActions.
- Do not recompute, contradict, or ignore derivedSignals without clear evidence in the provided input.
- Treat relationships as correlations, not causation.
- Because the input is a point-in-time snapshot, do not infer trends, momentum, improvement, decline, seasonality, or sustained performance unless explicitly provided.

CAMPAIGN GROUP CONTEXT:
- campaignGroups.top campaigns are strong performers — reference as key revenue drivers.
- campaignGroups.bottom campaigns are underperforming — primary inefficiency sources.
- campaignGroups.watch campaigns have contradictory signals — flag for investigation.

CHANNEL GROUP CONTEXT:
- channelGroups.strong channels outperform on ROI and revenue share — protect allocation.
- channelGroups.weak channels consume budget without proportionate returns — flag for reduction.
- channelGroups.opportunity channels are under-invested but efficient — scaling candidates.
- channelGroups.watch channels show contradictory funnel signals — investigate before scaling.

SMALL DATASET AND LIMITED SCOPE RULES:
- If the dataset contains only 1 campaign:
  - Treat this as an individual campaign performance review, not a portfolio analysis.
  - Do not create comparisons, correlations, concentration insights, best/worst language, or allocation-efficiency claims.
  - Focus only on absolute performance, efficiency, risks, and whether the campaign appears scalable or inefficient based on its own metrics.

- If the dataset contains exactly 2 campaigns:
  - Comparisons between the two campaigns are allowed only when directly supported by the data.
  - Do not rely on broad portfolio language, distribution claims, concentration-risk claims, or correlation claims.
  - Do not use strong language such as "clear winner" unless the performance gap is material.
  - Focus on relative efficiency, risk, and possible optimization between the two campaigns.

- If the dataset contains campaigns from only 1 channel:
  - Do not generate cross-channel comparisons or channel allocation insights.
  - Interpret findings only within the provided channel.
  - Avoid statements about channel diversification, channel mix, or cross-channel strategy.

NOISE CONTROL:
- Ignore minor observations, weak patterns, and low-impact details.
- Focus only on signals that materially affect revenue, ROI, CPA, allocation efficiency, concentration risk, or scaling potential.
- Use numbers only when necessary to support a non-obvious conclusion.
- Do not include KPI-style summaries such as "ROI is strong" or "revenue is high" unless they directly support a deeper implication.
- Do not repeat the same idea across healthScore.reasoning, bottomLine, insights, priorityActions, and correlations.
- Do not restate a single-entity fact as if it were a broad strategic insight.
- If a statement can be understood directly from the dashboard without interpretation, exclude it.

PRIORITIZATION ORDER:
1. derivedSignals related to inefficiency, scaling opportunity, and concentration risk
2. cross-channel patterns from channelGroups
3. campaign-level drivers and drags from campaignGroups
4. portfolio-level implications

Favor higher-priority signals when selecting insights and actions.

ANALYSIS APPROACH:
1. Evaluate portfolio health using profitability, efficiency, allocation quality, concentration risk, and consistency.
2. Use channels and channelGroups to assess allocation efficiency and relative performance.
3. Use campaignGroups.top and campaignGroups.bottom to identify major drivers and drags.
4. Use derivedSignals to identify inefficiency, scaling opportunities, and concentration risks.
5. Select only the findings that materially affect leadership decisions.
6. Convert those findings into concise implications and actions.

HEALTH SCORE GUIDANCE:
- 85 to 100 = Excellent: strong profitability, efficient allocation, minimal risk
- 70 to 84 = Good: solid performance with clear optimization opportunities
- 50 to 69 = NeedsAttention: mixed performance or meaningful inefficiencies
- 0 to 49 = Critical: significant performance weakness or structural risk

INSIGHT RULES:
- Return 2 to 3 insights.
- Each insight must be one sentence.
- Each insight must be non-obvious and require interpretation.
- Each insight must explain why the finding matters for leadership.
- Each insight must include a required metricHighlight.
- The insight text must state the implication, not just the observed metric.
- metricHighlight must support the insight with a specific and relevant metric.
- metricHighlight must add supporting evidence, not restate the same conclusion in shorter form.
- metricHighlight must not use generic portfolio totals or dashboard headline KPIs.
- Do not use totalBudget, totalRevenue, aggregatedROI, totalConversions, or channelCount/campaignCount as metricHighlight values unless absolutely necessary to support a non-obvious conclusion.
- Prefer concentration metrics, efficiency gaps, budget vs revenue share mismatches, CPA differences, ROI gaps, or campaign/channel-specific evidence.
- metricHighlight must add specificity through a share, gap, delta, count, or comparison.
- Do not use the same wording, noun phrase, or conclusion in both insight text and metricHighlight.label.
- Do not include more than one insight about the same underlying issue.
- If only 1 campaign is provided, insights must describe that campaign's absolute performance, not portfolio structure.

PRIORITY ACTION RULES:
- Return exactly 3 priorityActions, ordered by importance.
- Each action must be specific, data-backed, and directly connected to a signal in the input.
- Each action must reference a specific channel, campaign, or derived signal from the input.
- Each action must describe what should change, where, and why.
- Do not produce vague actions such as "optimize budget", "improve performance", or "scale what works" without specifying what and why.
- Do not use generic verbs without an object and rationale.
- If an action is about reallocation, specify the inefficiency or opportunity it addresses.
- If an action is about scaling, specify the entity and the reason it is a candidate.
- Each expectedOutcome must describe a concrete business effect.
- Each successMetric must be measurable and relevant to the action.

CORRELATION RULES:
- Return 0 to 2 correlations only.
- Correlations are optional and lower priority than insights and priorityActions.
- Include a correlation only if it is clearly supported by repeated patterns in the provided data.
- A correlation must identify a repeated pattern across multiple channels or campaigns.
- A correlation must describe a cross-channel or cross-campaign pattern, not a single-entity observation.
- Do not restate a single insight using broader language and label it as a correlation.
- If a correlation materially overlaps with an insight, exclude it.
- Do not repeat an insight as a correlation.
- Do not claim causation.
- If no strong correlation is supported, return an empty array.
- If fewer than 3 campaigns are provided, return an empty correlations array.

FINAL QUALITY CHECK:
- Before returning the JSON, verify that each insight, priorityAction, and correlation is distinct.
- Remove any item that repeats a dashboard fact without adding interpretation.
- Remove any action that could apply to any dataset without changing the wording.
- Remove any correlation that is not a true multi-entity pattern.
- If two items express the same underlying idea, keep only the stronger one.

OUTPUT REQUIREMENTS:
- Return only valid JSON matching the schema exactly.
- Do not add extra fields.
- Do not include markdown, commentary, or wrapper text.
- Use double quotes for all strings.
- Do not include trailing commas.
- Include "period" only if present in the input or businessContext.

OUTPUT SHAPE:
- exactly 1 healthScore
- exactly 1 bottomLine
- 2 to 3 insights
- 1 to 3 priorityActions
- 0 to 2 correlations

RESPONSE SCHEMA:
${OUTPUT_SCHEMA}

INPUT DATA:
${JSON.stringify(promptInput, null, 2)}
`.trim()
}

// ROLE
// TASK

// SCOPE
// BUSINESS CONTEXT

// CORE RULES (merged):
// - use only input
// - no fluff
// - no restating dashboard
// - focus on implications
// - treat derivedSignals as authoritative

// DATA LIMITATIONS:
// - snapshot → no trends
// - small dataset rules

// SIGNAL PRIORITY (short)

// INSIGHT RULES

// PRIORITY ACTION RULES

// CORRELATION RULES

// OUTPUT REQUIREMENTS
// SCHEMA
// INPUT