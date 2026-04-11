import type { BusinessContext } from "../types";
import { getPromptList } from "./prompt-utils";

const CONTEXT_DICTIONARY: Record<keyof BusinessContext, string | undefined> = {
  period: 'Period',
  industry: 'Industry',
  goal: 'Business Goal',
  businessStage: 'Business stage',
  attributionModel: 'Attribution Model',
  riskTolerance: 'Risk Tolerance',
  scalingTolerance: 'Scaling Tolerance',
  constraints: undefined,
};

export function getBusinessContextLinesForPrompt(
  context: BusinessContext,
): string[] {
  const lines: string[] = ["BUSINESS CONTEXT:"];
  const { constraints, ...restContext } = context;

  Object.entries(restContext).forEach(([key, value]) => {
    const text = CONTEXT_DICTIONARY[key as keyof BusinessContext];
    if (text && value !== undefined) {
      lines.push(` - ${text}: ${value}`);
    }
  });

  if (constraints?.length) {
    lines.push('', ...getPromptList('Constraints', constraints));
  }

  return lines;
}

export function getBusinessContextForPrompt(lines: string[]): string {
  if (lines.length === 1) {
    lines.push(
      "No additional business context provided.",
      '',
      "Derive recommendations from the dataset only.",
      "Avoid assumptions about strategy, budget constraints, market conditions, or scaling tolerance beyond what the data clearly supports.",
    );
  }
 

  return lines.join("\n");
}

export function generateBusinessContextForPrompt(
  context?: BusinessContext,
): string {
  const lines: string[] = getBusinessContextLinesForPrompt(context ?? {});

  return getBusinessContextForPrompt(lines);
}
