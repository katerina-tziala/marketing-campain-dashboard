import { generateBudgetOptimizationPrompt, generateExecutiveSummaryPrompt } from '../../prompts';
import { runProviderPrompt } from '../../providers';
import type { AiAnalysisType } from '../../types';
import type { AiAnalysisContext, AnalysisPromptContext, AnalysisProviderState, AnalysisResponse } from '../types';

type AnalysisPromptRunnerOverride = (type: AiAnalysisType, signal: AbortSignal) => Promise<AnalysisResponse | null>
let _analysisPromptRunnerOverride: AnalysisPromptRunnerOverride | null = null

// App-level extension point used by dev-mode to replace external prompt calls.
// Feature code should not call this directly.
export function setAnalysisPromptRunnerOverride(fn: AnalysisPromptRunnerOverride | null): void {
  _analysisPromptRunnerOverride = fn
}


type PromptBuilder = (
  context: AiAnalysisContext,
) => string


const PROMPT_BUILDERS: Record<AiAnalysisType, PromptBuilder> = {
  budgetOptimizer: generateBudgetOptimizationPrompt,
  executiveSummary: generateExecutiveSummaryPrompt,
}

function buildAnalysisPrompt(
  analysisContext: AnalysisPromptContext,
): string {
  const { type, context } = analysisContext;

  const builder = PROMPT_BUILDERS[type]

  return builder(context)
}

export async function runAnalysisPrompt(
  providerState: AnalysisProviderState,
  analysisContext: AnalysisPromptContext,
  signal: AbortSignal,
): Promise<AnalysisResponse | null> {
  if (_analysisPromptRunnerOverride) {
    return _analysisPromptRunnerOverride(analysisContext.type, signal)
  }

  const prompt = buildAnalysisPrompt(analysisContext)

  const { provider, apiKey, selectedModel } = providerState

  const result = await runProviderPrompt<AnalysisResponse>(
    provider, apiKey,
    selectedModel.id,
    prompt,
    signal,
  )

  // Check if this request was cancelled (stale)
  if (signal.aborted) {
    return null
  }

  return {
    ...result,
    model: { ...selectedModel },
    timestamp: Date.now(),
  }
}
