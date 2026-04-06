
import type { BusinessContext } from "../types";
import { getPromptList } from "./prompt-utils";

const CONTEXT_DICTIONARY: Record<keyof BusinessContext, string | undefined> = {
  period: 'PERIOD',
  industry: 'INDUSTRY',
  goal: 'BUSINESS_GOAL',
  businessStage: 'BUSINESS_STAGE',
  attributionModel: 'ATTRIBUTION_MODEL',
  riskTolerance: 'RISK_TOLERANCE',
  scalingTolerance: 'SCALING_TOLERANCE',
  constraints: undefined
}

export function getBusinessContextLinesForPrompt(
  context: BusinessContext
): string[] {
  let lines: string[] = ["BUSINESS CONTEXT:"];

  const { constraints, ...restContext } = context

  Object.entries(restContext).forEach(([key, value]) => {
    const text = CONTEXT_DICTIONARY[key as keyof BusinessContext];
    if (text && value !== undefined) {
      lines.push(`${text}: ${value}`);
    }
  });

  if (constraints?.length) {
    const constraintsList = getPromptList('CONSTRAINTS', constraints);
    lines = [...lines, ...constraintsList];
  }

  return lines;
}

export function getBusinessContextForPrompt(
  lines: string[]
): string {
  if (lines.length === 1) {
    lines.push(
      "No additional business context provided.",
      "Derive recommendations from the dataset only.",
      "Keep assumptions conservative and avoid inferring strategy, constraints, or scaling tolerance beyond what the data clearly supports.",
    );
  }

  return lines.join("\n");
}

export function generateBusinessContextForPrompt(
  context?: BusinessContext
): string {
  const lines: string[] = getBusinessContextLinesForPrompt(context ?? {});
 
  return getBusinessContextForPrompt(lines);
}
