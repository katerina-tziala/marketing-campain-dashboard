import type { PromptInstructionStep, PromptInstructions, PromptScopeConfig } from "../types";

export function getPromptList(title: string, list: string[]): string[] {
  const lines: string[] = [`${title}:`];

  for (const listItem of list) {
    lines.push(`- ${listItem}`);
  }

  return lines;
}

export function getOutputRulesBlock(responseDirection: string): string {
  const lines = getPromptList('OUTPUT RULES', [
    'Return ONLY valid JSON',
    'Do not include markdown',
    'Do not include commentary or explanations outside the JSON',
    'Do not include trailing commas',
    'Use double quotes for all strings',
    responseDirection,
    'If evidence in the dataset is limited, keep the wording conservative and avoid overconfident conclusions',
  ]);

  return lines.join("\n");
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

function renderNumberedInstructions(steps: PromptInstructionStep[]): string {
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
