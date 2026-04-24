import type {
  BusinessContext,
  ExecutiveSummaryData,
  PromptScopeConfig,
} from "../types";
import { generateBusinessContextForPrompt } from "./business-context";
import {
  DATA_INTERPRETATION_RULES,
  getPromptList,
  getScopeBlock,
} from "./prompt-utils";


const OUTPUT_SCHEMA = `{
  "period": "string — optional; include only if explicitly provided in the context",
  "health_score": {
    "score": number,
    "label": "Excellent | Good | Needs Attention | Critical",
    "reasoning": "string — one sentence explaining the score"
  },
  "bottom_line": "string — the single most important takeaway in one sentence",
  "insights": [
    {
      "type": "performance | opportunity | warning | achievement",
      "icon": "📊 | 🏆 | ⚠️ | 🎯 | 💡 | 📈 | 📉 | 🔥",
      "text": "string — concise executive insight with supporting numbers",
      "metric_highlight": {
        "label": "string",
        "value": "string"
      }
    }
  ],
  "priority_actions": [
    {
      "priority": number,
      "action": "string — clear, actionable next step",
      "expected_outcome": "string — expected business effect",
      "urgency": "Immediate | This Quarter | Next Quarter",
      "success_metric": "string — how success should be measured"
    }
  ],
  "channel_summary": [
    {
      "channel": "string",
      "status": "strong | moderate | weak",
      "budget_share": "string",
      "one_liner": "string — one-sentence executive verdict"
    }
  ],
  "additional_channels_note": "string — optional short note summarizing the remaining channels outside topChannels",
  "correlations": [
    {
      "finding": "string — supported pattern across channels or campaigns",
      "implication": "string — business implication"
    }
  ],
  "key_metrics": {
    "total_spend": number,
    "total_revenue": number,
    "overall_roi": number,
    "total_conversions": number,
    "best_channel": "string",
    "worst_channel": "string",
    "best_campaign": "string",
    "biggest_opportunity": "string"
  }
}`;

const SUMMARY_SCOPE_CONFIG: PromptScopeConfig = {
  label: "ANALYSIS SCOPE",
  filteredDescription: [
    "Filtered analysis scope.",
    "Channel filters are active.",
  ],
  unfilteredDescription: [
    "Full portfolio view.",
    "No channel filters applied.",
    'The dataset represents the complete marketing portfolio within the provided analysis scope.'
  ],
  filteredConstraints: [
    "Treat the filtered dataset as the full analysis portfolio for this request.",
    "Interpret findings only within this filtered subset.",
    "Do not generalize conclusions to the full portfolio unless explicitly supported by the data.",
  ],
};

const ROLE = [
  "You are a senior marketing strategist preparing an executive summary for company leadership.",
  "Be concise, analytical, and direct. Avoid presentation-style language and fluff."
];

const TASK = [
  'The audience must understand overall marketing performance, major risks, and the most important next actions in under two minutes.',
  'Transform the provided marketing dataset into a concise, executive-level performance summary.',
  'Focus on interpretation and business implications, not simply repeating raw metrics.'
];

const EXECUTIVE_QUESTIONS = [
  'What is working well in the marketing portfolio?',
  'What is underperforming or creating risk?',
  'How healthy is the overall marketing portfolio?',
  'Which channels or campaigns matter most?',
  'What actions should leadership prioritize next?'
];

const HEALTH_SCORE_LIST = [
  "85 to 100 = Excellent\nStrong profitability, efficient allocation, limited weaknesses.",
  "70 to 84 = Good\nHealthy overall performance with clear improvement opportunities.",
  "50 to 69 = Needs Attention\nMixed performance or inefficient allocation.",
  "0 to 49 = Critical\nSerious inefficiencies or major performance risks."
];

const INTERPRETATION_RULES = [
  'If the analysis scope is filtered, interpret the dataset as the complete portfolio for this request.',
  'Use only the provided dataset and optional business context.',
  'Do not invent metrics, assumptions, or unsupported conclusions.',
  'Describe relationships as correlations unless causality is clearly supported.',
  'Treat the topChannels list as the primary channels for analysis.',
  'Do not assume channels omitted from topChannels are unimportant unless the analysis scope explicitly indicates that no additional channels exist.',
  'Reflect mixed performance signals honestly and conservatively.',
  'If context is provided, use it to refine interpretation but not override the data.',
  'Include a time period only if explicitly provided in the context.',
  'Derive best_channel, worst_channel, best_campaign, and biggest_opportunity only from the provided dataset and current analysis scope.',
  'The health_score label must correspond to the defined score ranges in HEALTH SCORE GUIDANCE.'
];

const INTERNAL_ANALYSIS_CHECKLIST = [
  'Before generating the final response, internally verify the following:',
  '',
  '1. Portfolio Performance',
  '   - Evaluate total revenue, ROI, conversions, and CAC.',
  '',
  '2. Channel Effectiveness',
  '   - Identify which channels outperform or underperform based on ROI, CAC, and revenue share.',
  '',
  '3. Campaign Drivers',
  '   - Identify the campaigns most responsible for strong or weak results.',
  '',
  '4. Allocation Efficiency',
  '   - Determine whether budget allocation aligns with revenue contribution.',
  '',
  '5. Risk Signals',
  '   - Identify any concentration risks or inefficient spend patterns.',
  '',
  '6. Strategic Opportunities',
  '   - Determine the most important leadership actions or strategic priorities supported by the data.',
  '',
  'After completing this internal analysis, generate the final JSON response.',
  '',
  'Do not include this reasoning in the output.',
];

const ANALYSIS_INSTRUCTIONS = [
  'Before generating the final response, internally analyze the dataset and determine the most important performance patterns, risks, and opportunities.',
  'Do not include internal reasoning in the output.',
  '',
  'Follow this reasoning process:',
  '',
  '1. Evaluate overall portfolio performance using totals such as revenue, ROI, CAC, conversions, CTR, and CVR.',
  '   Use portfolio totals as the primary signal when evaluating overall performance.',
  '2. Identify strong and weak marketing channels using ROI, CAC, revenue contribution, and budget share.',
  '3. Review top campaigns and underperforming campaigns to determine which initiatives drive results and which weaken performance.',
  '4. Evaluate allocation efficiency by comparing budget distribution with revenue contribution.',
  '5. Identify patterns or correlations across channels or campaigns only when clearly supported by the data.',
  '6. When forming insights, prioritize signals in the following order:',
  '    1. Overall portfolio metrics (ROI, revenue, CAC, conversions)',
  '    2. Channel-level performance',
  '    3. Campaign-level performance',
  '    4. Provided key findings',
  '',
  '   Focus only on high-impact signals that materially affect portfolio performance.',
  '   High-impact signals typically involve:',
  '   - large revenue contributions',
  '   - significant ROI differences between channels',
  '   - inefficient budget allocation',
  '   - unusually high or low CAC',
  '   - performance concentration in a small number of channels or campaigns.',
  '',
  '   Only include insights derived from these high-impact signals.',
  '   Exclude minor observations that do not materially affect revenue, ROI, or acquisition efficiency.',
  '7. Score the overall health of the marketing portfolio from 0 to 100 considering:',
  '    1. profitability',
  '    2. efficiency',
  '    3. allocation quality',
  '    4. concentration risk',
  '    5. consistency of performance',
  '   Estimate these factors using ROI, CAC, revenue contribution, and budget allocation.',
  "8. Produce between 5 and 7 high-signal insights summarizing the most important findings. Each insight must:",
  '    - be 1 to 2 sentences',
  '    - include at least one supporting number',
  '9. Identify exactly 3 priority actions, ordered by importance. Each action must include:',
  '    - urgency',
  '    - expected business outcome',
  '    - a measurable success metric',
  '10. Summarize each provided top channel in one sentence and classify it as:',
  '    - strong',
  '    - moderate',
  '    - weak',
  'Use this guidance:',
  'Strong',
  'ROI significantly above portfolio average with efficient CAC.',
  'Moderate',
  'ROI near portfolio average with stable performance.',
  'Weak',
  'ROI below portfolio average or inefficient CAC relative to peers.',
  '11. Conclude with a single bottom-line statement summarizing the most important takeaway for leadership.'
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
  'If correlations are not clearly supported by the dataset, return an empty array.',
  'If the provided scope contains no channels outside topChannels, return an empty string for additional_channels_note.',
];

export function generateExecutiveSummaryPrompt(
  summaryData: ExecutiveSummaryData,
  businessContext?: BusinessContext,
  filteredChannels?: string[],
): string {
  const sections = [
    `ROLE:\n${ROLE.join("\n")}`,
    `TASK:\n${TASK.join("\n")}`,
    `EXECUTIVE QUESTIONS:\n${getPromptList('Use the data to answer the following leadership questions', EXECUTIVE_QUESTIONS).join("\n")}`,
    `INPUT DATA:\nThe following dataset summarizes marketing performance for executive summary analysis.\nUse only the information contained in this dataset unless business context explicitly adds additional information.\n${JSON.stringify(summaryData, null, 2)}`,
    generateBusinessContextForPrompt(businessContext),
    getScopeBlock(SUMMARY_SCOPE_CONFIG, filteredChannels),
    `${getPromptList('DATA INTERPRETATION RULES', DATA_INTERPRETATION_RULES).join("\n")}`,
    `ANALYSIS INSTRUCTIONS:\n${ANALYSIS_INSTRUCTIONS.join("\n")}`,
    getPromptList('HEALTH SCORE GUIDANCE', HEALTH_SCORE_LIST).join("\n"),
    `INTERPRETATION RULES:\n${getPromptList('Use the following guardrails', INTERPRETATION_RULES).join("\n")}`,
    `INTERNAL ANALYSIS CHECKLIST:\n${INTERNAL_ANALYSIS_CHECKLIST.join("\n")}`,
    `OUTPUT RULES:\n${JSON_OUTPUT_RULES.join("\n")}`,
    `RESPONSE SCHEMA:\n${OUTPUT_SCHEMA}`,
  ];

  return sections.join("\n\n");
}
