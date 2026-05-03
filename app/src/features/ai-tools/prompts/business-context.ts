import type { BusinessContext } from '@/shared/portfolio'

export function getBusinessContextBlock(context?: BusinessContext): string {
  if (!context) {
    return `BUSINESS CONTEXT:
- No additional business context provided.
- Base conclusions only on the input data.`;
  }

  const lines: string[] = ['BUSINESS CONTEXT:']

  if (context.period) {
    lines.push(`- Period: ${context.period.from} to ${context.period.to}`)
  }
  if (context.industry) lines.push(`- Industry: ${context.industry}`)
  // if (context.goal) lines.push(`- Goal: ${context.goal}`);
  // if (context.businessStage) lines.push(`- Business stage: ${context.businessStage}`);
  // if (context.attributionModel) lines.push(`- Attribution model: ${context.attributionModel}`);
  // if (context.riskTolerance) lines.push(`- Risk tolerance: ${context.riskTolerance}`);
  // if (context.scalingTolerance) lines.push(`- Scaling tolerance: ${context.scalingTolerance}`);
  // if (context.constraints?.length) {
  //   lines.push(`- Constraints: ${context.constraints.join("; ")}`);
  // }

  lines.push(
    `- Use this context to refine interpretation, prioritization, and risk framing, but do not let it override the performance signals in the input data.`,
  )

  return lines.join('\n')
}

export function getBusinessContextLinesForPrompt(
  context?: BusinessContext,
): string[] {
  const lines: string[] = ['BUSINESS CONTEXT:']
  // const { constraints, ...restContext } = context;

  if (context?.period) {
    lines.push(`- Period: ${context.period.from} to ${context.period.to}`)
  }
  if (context?.industry) lines.push(`- Industry: ${context.industry}`)

  // if (constraints?.length) {
  //   lines.push('', ...getPromptList('Constraints', constraints));
  // }

  return lines
}

export function getBusinessContextForPrompt(lines: string[]): string {
  if (lines.length === 1) {
    lines.push(
      'No additional business context provided.',
      'Derive recommendations from the dataset only.',
    )
  }

  return lines.join('\n')
}

export function generateBusinessContextForPrompt(
  context?: BusinessContext,
): string {
  const lines: string[] = getBusinessContextLinesForPrompt(context)

  return getBusinessContextForPrompt(lines)
}
