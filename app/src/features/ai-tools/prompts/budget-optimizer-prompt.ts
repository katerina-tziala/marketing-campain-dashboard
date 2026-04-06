import type {
  BudgetOptimizerContextInput,
  BudgetOptimizerData,
  PromptInstructionStep,
  PromptInstructions,
  PromptScopeConfig,
} from "../types";
import { getBusinessContextForPrompt, getBusinessContextLinesForPrompt } from "./business-context";
import {
  getAnalysisInstructions,
  getInterpretationRulesBlock,
  getOutputRulesBlock,
  getPromptInstructions,
  getPromptList,
  getScopeBlock,
} from "./prompt-utils";

const BUDGET_INSTRUCTIONS: PromptInstructions = {
  role: [
    'You are a senior performance marketing analyst responsible for realistic budget optimization across the provided analysis scope.',
  ],
  task: [
    'Your task is to analyze the provided campaign performance data and recommend realistic budget reallocations that improve marketing efficiency while controlling execution risk.',
  ],
  objectives: {
    title: 'Focus on identifying',
    list: [
      'overfunded campaigns with weak efficiency',
      'underfunded campaigns with strong efficiency',
      'opportunities to reallocate spend to higher-performing campaigns',
      'patterns across channels that indicate allocation imbalance',
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
        "new_roi_estimate": "string"
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

const BUDGET_OPTIMIZER_ANALYSIS_STEPS: PromptInstructionStep[] = [
  {
    title: "Evaluate campaign efficiency using a combination of:",
    bullets: [
      "ROI",
      "Conversion Rate (CVR)",
      "Customer Acquisition Cost (CAC)",
    ],
    notes: [
      "Prioritize actions that materially improve overall portfolio performance rather than optimizing minor inefficiencies.",
    ],
  },
  {
    title: "Use the following conceptual weighting when comparing campaigns:",
    bullets: [
      "ROI weight: 40%",
      "CVR weight: 30%",
      "inverse CAC weight: 30%",
    ],
  },
  {
    title: "Identify budget-to-performance mismatches such as:",
    bullets: [
      "high spend with weak ROI",
      "low spend with strong ROI",
      "strong CTR but weak CVR",
      "unusually high CAC",
    ],
    notes: [
      "If weak performance is caused by poor conversion efficiency rather than insufficient spend, recommend restructuring instead of increasing budget.",
    ],
  },
  {
    title: "Recommend reallocations from weaker campaigns to stronger campaigns when supported by the data.",
    notes: [
      "Return no more than 3 recommendations. Prioritize the highest-impact opportunities only.",
    ],
  },
  {
    title: "Treat strong performance on low volume cautiously.",
    notes: [
      "Prefer controlled tests over aggressive scaling when evidence is limited.",
    ],
  },
  {
    title: "Do not recommend more than a 3x budget increase for any campaign.",
    notes: [
      "Avoid trivial reallocations.",
      "Recommend only meaningful budget changes unless framing a small change as a test.",
      "Assume diminishing returns when increasing budget.",
    ],
  },
  {
    title: "Consider overall portfolio balance when evaluating reallocations.",
    notes: [
      "Avoid concentrating excessive budget in a single campaign unless the efficiency signal is exceptionally strong.",
    ],
  },
  {
    title: "Avoid reallocations that rely on unrealistic performance scaling.",
    notes: [
      "Assume performance efficiency may decline as budget increases.",
    ],
  },
  {
    title: "Unless business context explicitly allows it, assume the total budget should remain constant.",
  },
  {
    title: "Prefer conservative reallocations when evidence is uncertain.",
  },
  {
    title: "Each recommendation must clearly explain:",
    bullets: [
      "why the move makes sense",
      "what metric improvement is expected",
      "how success should be measured",
    ],
  },
  {
    title: "Estimate expected impact conservatively and avoid assuming perfect linear scaling.",
  },
  {
    title: "If signals are mixed, recommend tests or staged adjustments instead of aggressive reallocations.",
  },
];

const INTERPRETATION_RULES = [
  'If optimization scope is filtered, recommendations must stay entirely inside the filtered subset',
  'Keep recommendations realistic and operationally practical',
  'Use explicit campaign names when suggesting budget movements',
  'Do not recommend reallocations smaller than 5% of the source campaign budget unless explicitly framed as a test',
  'Amount values must always be positive numbers',
];

const ARRAY_SIZE_LIST = [
  'recommendations: maximum 3',
  'top_performers: maximum 3',
  'underperformers: maximum 3',
  'quick_wins: maximum 3',
  'correlations: maximum 2',
  'risks: maximum 2',
];

const ARRAY_SIZE_NOTES = [
  'If fewer items exist, return only the supported ones.',
  'These are upper limits, not required counts.',
  'Do not fabricate entries just to fill the list.',
];

const OPTIMIZER_SCOPE_CONFIG: PromptScopeConfig = {
  label: "OPTIMIZATION SCOPE",
  filteredDescription: [
    "Scoped optimization.",
    "Channel filters are active.",
    "Recommendations must only optimize budget within the filtered subset.",
  ],
  unfilteredDescription: [
    "Full portfolio optimization.",
    "No channel filters applied.",
    "Recommendations may consider all campaigns included in the dataset.",
  ],
  filteredConstraints: [
    "Do not recommend reallocating budget to campaigns or channels outside the selected scope.",
    "Interpret performance only within the provided subset.",
    "Do not generalize optimization conclusions to the full portfolio unless explicitly supported by the data.",
  ],
};

function generateBudgetOptimizerContext(
  context?: BudgetOptimizerContextInput,
): string {
  const { allowBudgetExpansion, ...businessContext } = context ?? {};

  const lines = getBusinessContextLinesForPrompt(businessContext ?? {});
  if (typeof allowBudgetExpansion === "boolean") {
    lines.push(`ALLOW_BUDGET_EXPANSION: ${allowBudgetExpansion ? "true" : "false"}`);
  }

  return getBusinessContextForPrompt(lines);
}

export function generateBudgetOptimizerPrompt(
  data: BudgetOptimizerData,
  userContext?: BudgetOptimizerContextInput,
  filteredChannels?: string[],
): string {
  const arraySizeBlock = [
    ...getPromptList('ARRAY SIZE GUIDELINES', ARRAY_SIZE_LIST),
    '',
    ...ARRAY_SIZE_NOTES,
  ].join("\n");

  const sections = [
    getPromptInstructions(BUDGET_INSTRUCTIONS),
    `OPTIMIZATION DATA:\n${JSON.stringify(data, null, 2)}`,
    generateBudgetOptimizerContext(userContext),
    getScopeBlock(OPTIMIZER_SCOPE_CONFIG, filteredChannels),
    getAnalysisInstructions(BUDGET_OPTIMIZER_ANALYSIS_STEPS),
    getInterpretationRulesBlock(INTERPRETATION_RULES),
    getOutputRulesBlock('Keep the response compact and decision-oriented'),
    arraySizeBlock,
    `Respond ONLY in this JSON schema:\n${OUTPUT_SCHEMA}`,
  ];

  return sections.join("\n\n");
}
