import type { PromptInstructionStep, PromptInstructions, PromptScopeConfig } from './types';

export const JSON_SCHEMA_LABEL = 'Respond ONLY in this JSON schema:';

export const OUTPUT_RULES_LABEL = 'OUTPUT RULES';


export const DATA_INTERPRETATION_RULES: string[] = [
  'Use only the provided dataset and optional business context.',
  'Do not invent metrics or unsupported conclusions.',
  'If performance signals are mixed, reflect the uncertainty rather than forcing conclusions.',
  'Interpret performance only within the provided analysis scope.',
  'If the dataset is filtered, treat it as the full portfolio for this request.',
  'Do not assume strategy, market conditions, or operational constraints beyond what the data supports.',
];
 


export function getPromptList(title: string, list: string[]): string[] {
  const lines: string[] = [`${title}:`];

  for (const listItem of list) {
    lines.push(` - ${listItem}`);
  }

  return lines;
}

export function getPromptNumberedList(title: string, list: string[]): string[] {
  const lines: string[] = [`${title}:`];

 
  list.forEach((listItem, index) => {
    lines.push(` ${index +1} ${listItem}`);
  });

  return lines;
}
 
export function getPromptInstructions(instructions: PromptInstructions): string {
  const { role, task, objectives: { title, list } } = instructions;

  const lines: string[] = [
    "ROLE:",
    ...role,
    '',
    "TASK:",
    ...task,
    '',
    "OBJECTIVES:",
  ];

  const objectivesList = getPromptList(title, list);

  return [...lines, ...objectivesList, ''].join("\n");
}

export function getInterpretationRulesBlock(additionalRules: string[]): string {
  const lines = getPromptList('IMPORTANT INTERPRETATION RULES', [
    'Use only the provided dataset and optional context',
    'Do not invent missing metrics, unsupported conclusions, or external assumptions',
    'Do not overstate causality; describe patterns as correlations unless the data clearly supports stronger language',
    'If business context is provided, use it to sharpen interpretation, not to override the numbers',
    'If performance signals are mixed, reflect that nuance honestly',
    'Mention campaign or channel names only when materially relevant',
    ...additionalRules,
  ]);

  return lines.join("\n");
}

export function renderNumberedInstructions(steps: PromptInstructionStep[]): string {
  return steps
    .map((step, i) => {
      const number = i + 1;

      const bullets = step.bullets
        ? "\n" + step.bullets.map((b: string) => `   - ${b}`).join("\n")
        : "";

      const notes = step.notes
        ? "\n\n   " + step.notes.join("\n\n   ")
        : "";

      return `${number}. ${step.title}${bullets}${notes}`;
    })
    .join("\n\n");
}

export function getAnalysisInstructions(steps: PromptInstructionStep[]): string {
  return `ANALYSIS INSTRUCTIONS:\n${renderNumberedInstructions(steps)}`;
}

export function getScopeBlock(
  config: PromptScopeConfig,
  includedChannels: string[] = [],
): string {
  const { label, filteredDescription, unfilteredDescription, filteredConstraints } = config;

  if (includedChannels.length === 0) {
    return [`${label}:`, ...unfilteredDescription].join("\n");
  }

  const channelList = includedChannels.map((ch) => `- ${ch}`);

  return [
    `${label}:`,
    ...filteredDescription,
    "Included channels:",
    ...channelList,
    ...filteredConstraints,
  ].join("\n");
}
