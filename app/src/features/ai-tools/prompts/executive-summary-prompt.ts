import type {
  BusinessContext,
  ExecutiveSummaryData,
  PromptInstructionStep,
  PromptInstructions,
  PromptScopeConfig,
} from "../types";
import { generateBusinessContextForPrompt } from "./business-context";
import {
  getAnalysisInstructions,
  getInterpretationRulesBlock,
  getOutputRulesBlock,
  getPromptInstructions,
  getPromptList,
  getScopeBlock,
} from "./prompt-utils";

const SUMMARY_INSTRUCTIONS: PromptInstructions = {
  role: [
    'You are a Chief Marketing Officer preparing a board-level executive summary for non-technical business leaders',
  ],
  task: [
    'Your audience needs to understand overall marketing performance, major risks, and the highest-priority actions in under 2 minutes.',
    'Your job is to turn the provided marketing summary data into a concise, commercially sharp, executive-friendly summary.',
  ],
  objectives: {
    title: 'Use the data to answer',
    list: [
      'What is working well?',
      'What is underperforming?',
      'How healthy is the provided analysis scope?',
      'Which channels or campaigns matter most?',
      'What should leadership do next?',
    ],
  },
};

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
      "so_what": "string — business implication"
    }
  ],
  "key_metrics": {
    "total_spend": "string",
    "total_revenue": "string",
    "overall_roi": "string",
    "total_conversions": "string",
    "best_channel": "string",
    "worst_channel": "string",
    "best_campaign": "string",
    "biggest_opportunity": "string"
  }
}`;

const SUMMARY_ANALYSIS_STEPS: PromptInstructionStep[] = [
  {
    title: "Write 5 to 7 high-signal insights in plain business language",
  },
  {
    title: "Each insight must be 1 to 2 sentences and include at least one specific supporting number",
  },
  {
    title: "Prioritize strategic interpretation over repeating raw metrics",
  },
  {
    title: "Use the provided top channels, top campaigns, underperforming campaigns, totals, and key findings to identify the most decision-relevant story",
  },
  {
    title: "Treat the provided topChannels list as the most material channels. Do not assume omitted channels are unimportant; use otherChannelsSummary only as a grouped residual view",
  },
  {
    title: "Score the overall health of the provided analysis scope from 0 to 100 using profitability, efficiency, allocation quality, concentration risk, and consistency of performance",
  },
  {
    title: "Identify exactly 3 priority actions, ordered by importance, with urgency and a measurable success metric",
  },
  {
    title: "Summarize only the provided top channels, one sentence per channel, and classify each as strong, moderate, or weak",
  },
  {
    title: "If patterns or correlations appear across channels or campaigns, include them only if they are clearly supported by the data",
  },
  {
    title: "End with a bottom line: the single most important takeaway for leadership",
  },
];

const INTERPRETATION_RULES = [
  'Include period only if it is explicitly provided in the context',
  'Do not infer or guess a period from the data',
  'Keep the tone executive-friendly and suitable for non-technical business stakeholders',
  'If performance is mixed, reflect that nuance honestly',
];

const HEALTH_SCORE_LIST = [
  '85 to 100 = Excellent: strong profitability, efficient allocation, limited major weaknesses',
  '70 to 84 = Good: generally healthy performance with some clear improvement opportunities',
  '50 to 69 = Needs Attention: mixed results, inefficient allocation, or visible performance weakness',
  '0 to 49 = Critical: major inefficiency, poor returns, or serious portfolio imbalance',
];

const SUMMARY_SCOPE_CONFIG: PromptScopeConfig = {
  label: "ANALYSIS SCOPE",
  filteredDescription: ["Filtered view."],
  unfilteredDescription: [
    "Full portfolio view.",
    "No channel filters applied.",
  ],
  filteredConstraints: [
    "Do not recommend reallocating budget to campaigns or channels outside the selected scope.",
    "Interpret findings only within this filtered subset.",
    "Do not generalize conclusions to the full portfolio unless explicitly supported by the data.",
  ],
};

export function generateExecutiveSummaryPrompt(
  summaryData: ExecutiveSummaryData,
  userContext?: BusinessContext,
  filteredChannels?: string[],
): string {
  const sections = [
    getPromptInstructions(SUMMARY_INSTRUCTIONS),
    `SUMMARY DATA:\n${JSON.stringify(summaryData, null, 2)}`,
    generateBusinessContextForPrompt(userContext),
    getScopeBlock(SUMMARY_SCOPE_CONFIG, filteredChannels),
    getAnalysisInstructions(SUMMARY_ANALYSIS_STEPS),
    getPromptList('HEALTH SCORE GUIDANCE', HEALTH_SCORE_LIST).join("\n"),
    getInterpretationRulesBlock(INTERPRETATION_RULES),
    getOutputRulesBlock('Keep the response concise and executive-friendly'),
    `Respond ONLY in this JSON schema:\n${OUTPUT_SCHEMA}`,
  ];

  return sections.join("\n\n");
}
