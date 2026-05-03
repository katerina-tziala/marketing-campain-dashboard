import type { BusinessContext } from '@/shared/portfolio';
import type { PromptInstructions, PromptScopeConfig } from './types';

// ── Legacy local types ─────────────────────────────────────────────────────────

type CampainSummaryTotals = {
  budget: number;
  revenue: number;
  roi: number;
  conversions: number;
  cpa: number | null;
  ctr: number;
  cvr: number;
};

type AllocationShare = {
  budgetShare: number;
  revenueShare: number;
};

type FunnelMetrics = {
  impressions: number;
  clicks: number;
};

type PortfolioCount = {
  campaignCount: number;
  channelCount: number;
};

type BudgetOptimizerContextInput = BusinessContext & {
  goal?: string;
  businessStage?: string;
  attributionModel?: string;
  riskTolerance?: string;
  scalingTolerance?: string;
  constraints?: string[];
  allowBudgetExpansion?: boolean;
};

type BudgetOptimizerCampaign = CampainSummaryTotals & AllocationShare & FunnelMetrics & {
  campaign: string;
  channel: string;
  efficiencyScore?: number;
  spendTier?: 'high' | 'medium' | 'low';
};

type BudgetOptimizerChannel = CampainSummaryTotals & AllocationShare & FunnelMetrics & {
  channel: string;
  efficiencyScore?: number;
};

type BudgetOptimizerData = {
  totals: CampainSummaryTotals;
  campaigns: BudgetOptimizerCampaign[];
  channels: BudgetOptimizerChannel[];
  portfolio: PortfolioCount;
  keyFindings?: string[];
};
import { getBusinessContextForPrompt, getBusinessContextLinesForPrompt } from "./business-context";
import {
  DATA_INTERPRETATION_RULES,
  getPromptInstructions,
  getPromptList,
  getScopeBlock,
} from "./prompt-utils";

const BUDGET_INSTRUCTIONS: PromptInstructions = {
  role: [
    'You are a senior performance marketing analyst responsible for realistic budget optimization across the provided analysis scope.',
  ],
  task: [
    'Analyze the provided campaign performance data and recommend realistic budget reallocations that improve marketing efficiency while controlling execution risk.',
    'Your recommendations should prioritize measurable performance improvement while maintaining operational realism and portfolio balance.'
  ],
  objectives: {
    title: 'Focus on identifying',
    list: [
      'overfunded campaigns with weak efficiency',
      'underfunded campaigns with strong efficiency',
      'opportunities to reallocate budget toward higher-performing campaigns',
      'structural allocation imbalances across the marketing portfolio',
    ],
  },
};
 
const OUTPUT_SCHEMA = `{
  "period": "string — optional; include only if explicitly provided in the context",
  "executive_summary": "string — short overview of the main optimization opportunities",
  "recommendations": [
    {
      "action": "string",
      "from_campaign": "string",
      "to_campaign": "string",
      "amount": number,
      "expected_impact": {
        "additional_revenue": number,
        "additional_conversions": number,
        "new_roi_estimate": number
      },
      "confidence": "High | Medium | Low",
      "reasoning": "string",
      "timeline": "Immediate | This Month | Next Quarter",
      "success_metrics": {
        "what_to_measure": "string",
        "target": "string",
        "review_after": "string"
      }
    }
  ],
  "top_performers": [
    {
      "campaign": "string",
      "roi": number,
      "insight": "string",
      "unlock_potential": "string"
    }
  ],
  "underperformers": [
    {
      "campaign": "string",
      "roi": number,
      "insight": "string",
      "recommended_action": "Reduce | Pause | Restructure"
    }
  ],
  "quick_wins": [
    {
      "action": "string",
      "effort": "Low | Medium",
      "potential_impact": "string",
      "timeline": "string"
    }
  ],
  "correlations": [
    {
      "finding": "string",
      "implication": "string"
    }
  ],
  "risks": [
    {
      "risk": "string",
      "mitigation": "string"
    }
  ]
}`;
 
const OPTIMIZER_SCOPE_CONFIG: PromptScopeConfig = {
  label: "OPTIMIZATION SCOPE",
  filteredDescription: [
    "Scoped optimization.",
    "Channel filtering is active.",
    "Recommendations must only optimize budget within the filtered subset.",
  ],
  unfilteredDescription: [
    "Full portfolio optimization.",
    "No channel filters applied.",
    "Recommendations may consider all campaigns included in the dataset.",
  ],
  filteredConstraints: [
  "Treat the filtered dataset as the full analysis portfolio for this request.",
  "Do not recommend reallocating budget to campaigns or channels outside the selected scope.",
  "Interpret performance only within the provided subset.",
  "Do not generalize optimization conclusions to the full portfolio unless explicitly supported by the data.",
],
};

function generateBudgetOptimizerContext(
  context?: BudgetOptimizerContextInput,
): string {
  if (!context) return getBusinessContextForPrompt(getBusinessContextLinesForPrompt());

  const { allowBudgetExpansion, ...businessContext } = context;

  const lines = getBusinessContextLinesForPrompt(businessContext);
  if (allowBudgetExpansion === true) {
    lines.push(` - Budget expansion is allowed.`);
    lines.push(`Total portfolio budget may increase if performance signals clearly support additional investment.`);
  }

  return getBusinessContextForPrompt(lines);
}


 const ANALYSIS_INSTRUCTIONS = [
  'Before generating the final response, internally analyze the dataset and determine the most realistic optimization opportunities.',
  'Do not include internal reasoning in the output.', 
  '',
  'Follow this reasoning process:',
  '',
  '1. Evaluate overall portfolio performance using totals such as revenue, ROI, CPA, conversions, CTR, and CVR.',
  '',
  '2. Evaluate campaign efficiency using the following signals:',
  '   - ROI',
  '   - Conversion Rate (CVR)',
  '   - Customer Acquisition Cost (CPA)',
  '',
  '   Treat ROI as the primary efficiency signal, with CPA and CVR used to confirm efficiency.',
  '   Use portfolio totals as reference benchmarks when evaluating CPA, CVR, and ROI differences across campaigns.',
  '',
  '3. Identify budget-to-performance mismatches such as:',
  '   - high spend with relatively weak ROI',
  '   - low spend with strong ROI',
  '   - high CPA relative to portfolio benchmarks',
  '   - conversion inefficiencies despite strong engagement',
  '',
  '4. Compare budget share with revenue contribution to detect allocation inefficiencies.',
  '',
  '5. Identify campaigns that may support controlled budget increases based on strong efficiency signals.',
  '',
  '6. Identify campaigns where reducing spend, pausing, or restructuring would improve portfolio efficiency.',
  '',
  '7. Determine the optimization direction by identifying:',
  '',
  '   - campaigns that should act as funding sources (weak efficiency relative to peers)',
  '   - campaigns that should receive additional budget (strong efficiency signals)',
  '',
  '   Funding sources should typically exhibit:',
  '',
  '   - relatively weaker ROI',
  '   - higher CPA compared with portfolio benchmarks',
  '   - budget share exceeding revenue contribution',
  '',
  '   Scaling targets should typically exhibit:',
  '',
  '   - strong ROI relative to peers',
  '   - efficient CPA',
  '   - revenue contribution exceeding budget share',
  '',
  '8. Consider portfolio balance when recommending reallocations.',
  '',
  '   Avoid concentrating excessive budget into a single campaign unless the efficiency signal is exceptionally strong.',
  '',
  '9. Prioritize recommendations that produce meaningful performance improvements rather than optimizing minor inefficiencies.', 
];
   
const GUARDRAILS_LIST = [ 
  "Do not recommend more than a 3x increase in budget for any campaign.",
  "Avoid trivial reallocations unless framing a small adjustment as a test.", 
  'Budget increases should assume performance efficiency may decline as scale increases.',
  'Keep recommendations operationally realistic and implementable.',
  'Do not recommend reallocations smaller than 5% of the source campaign budget unless explicitly framed as a test.'
];

const ESTIMATION_RULES = [ 
  "Assume diminishing returns as budget increases.",
  "Do not assume perfect linear scaling of ROI or conversions.",
  'Use conservative estimates based on existing campaign efficiency signals.',
  'If evidence is limited, estimate only partial performance retention rather than full proportional scaling.',
  'Avoid unrealistic projections that exceed the historical efficiency signals observed in the dataset.',
  'Impact estimates should remain directionally realistic rather than optimistic.',
  'Projected ROI estimates should remain within a reasonable range of the historical ROI observed for the destination campaign.'
];
 
 
const INTERPRETATION_RULES = [
  'If the optimization scope is filtered, recommendations must remain entirely within the provided channel subset.',
  'If performance evidence is limited, use conservative language and emphasize testing rather than scaling.',
  'A campaign should not appear in both top_performers and underperformers unless mixed performance is explicitly explained.',
  'Use ROI as the efficiency metric throughout the response. Do not introduce ROAS unless it is explicitly present in the provided dataset or business context.',
];

const INTERNAL_ANALYSIS_CHECKLIST = [
  'Before generating the final JSON response, internally verify the following:',
  '',
  '1. Portfolio Efficiency',
  '   - Evaluate overall ROI, CPA, and conversion performance.',
  '',
  '2. Campaign Efficiency',
  '   - Identify campaigns with the strongest and weakest efficiency signals.',
  '',
  '3. Allocation Efficiency',
  '   - Determine whether budget allocation aligns with revenue contribution.',
  '',
  '4. Scaling Opportunities',
  '   - Identify campaigns that could support increased budget with controlled risk.',
  '',
  '5. Optimization Risks',
  '   - Identify areas where aggressive budget changes may introduce risk.',
  '',
  'After completing this internal analysis, generate the final JSON response.',
  '',
  'Do not include this reasoning in the output.',
  '',
  'When generating recommendations, ensure each recommendation clearly identifies:',
  '  - the source campaign providing budget',
  '  - the destination campaign receiving budget',
  '  - the budget amount being transferred',
  '  - the expected performance improvement'
];
 
 
const JSON_OUTPUT_RULES: string[] = [
  'Return ONLY valid JSON',
  'The JSON response must strictly match the schema.',
  'Do not add fields, rename fields, or omit required fields.',
  '',
  'Strict requirements:',
  'Do not include markdown',
  'Do not include commentary or explanations outside the JSON',
  'Do not include trailing commas',
  'Use double quotes for all strings',
  'The final response must contain only the JSON object defined in the schema.',
  'Do not wrap the JSON in text.',
  '',
  'Formatting rules:',
  'All monetary values must be returned as numbers.',
  'Do not include currency symbols in numeric fields.',
  'Numeric fields defined as numbers in the schema must remain numeric.',
  'Percentages may include the percent symbol only when the schema field is a string.',
  'new_roi_estimate must be returned as a decimal multiplier. Example: 4.9 for a 490% return.',
  'Keep the response compact and decision-oriented',
  'If correlations are not clearly supported by the dataset, return an empty array.',
  `Include the "period" field only if a time period is explicitly provided in the business context.`,
  '',
  'Array size guidelines:',
  '- recommendations: maximum 3',
  '- top_performers: maximum 3',
  '- underperformers: maximum 3',
  '- quick_wins: maximum 3',
  '- correlations: maximum 2',
  '- risks: maximum 2',
  '',
  'If fewer items exist, return only the supported ones.',
  'These are upper limits, not required counts.',
  'Do not fabricate entries to fill arrays.',
  '',
  'If the dataset does not support a credible reallocation opportunity, return an empty recommendations array.'
];

export function generateBudgetOptimizationPrompt(
  data: BudgetOptimizerData,
  businessContext?: BudgetOptimizerContextInput,
  filteredChannels?: string[],
): string {
 
  const sections = [
    getPromptInstructions(BUDGET_INSTRUCTIONS),
    `INPUT DATA:\nThe following dataset summarizes campaign performance for budget optimization.\nUse only the information contained in this dataset unless business context explicitly adds additional information.\n${JSON.stringify(data, null, 2)}`,
    generateBudgetOptimizerContext(businessContext),
    getScopeBlock(OPTIMIZER_SCOPE_CONFIG, filteredChannels),
    `${getPromptList('DATA INTERPRETATION RULES', DATA_INTERPRETATION_RULES).join("\n")}`,
    `ANALYSIS INSTRUCTIONS:\n${ANALYSIS_INSTRUCTIONS.join("\n")}`,
    getPromptList('OPTIMIZATION GUARDRAILS:\nFollow these operational constraints when recommending budget changes.', GUARDRAILS_LIST).join("\n"),
    `IMPACT ESTIMATION RULES:\n${getPromptList('When estimating expected impact from budget reallocations', ESTIMATION_RULES).join("\n")}`,
    `INTERNAL ANALYSIS CHECKLIST:\n${INTERNAL_ANALYSIS_CHECKLIST.join("\n")}`,
    `INTERPRETATION RULES:\n${getPromptList('Use the following guardrails', INTERPRETATION_RULES).join("\n")}`,
    `OUTPUT RULES:\n${JSON_OUTPUT_RULES.join("\n")}`,
    `RESPONSE SCHEMA:\n${OUTPUT_SCHEMA}`,
  ];

  return sections.join("\n\n");
}
 
