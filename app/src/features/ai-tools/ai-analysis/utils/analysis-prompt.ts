import type { PortfolioAnalysis } from '@/shared/portfolio-analysis/types';
import { generateBudgetOptimizationPrompt, generateExecutiveSummaryPrompt } from '@/features/ai-tools/prompts';
import { runProviderPrompt } from '@/features/ai-tools/providers';
import type { AiAnalysisType } from '@/features/ai-tools/types';
import type { BusinessContext } from '@/features/ai-tools/ai-analysis/types';
import type { AnalysisContext, AIProviderState, AnalysisResponse } from '@/features/ai-tools/ai-analysis/types';

// TODO: [DEV ONLY] Remove this override slot before shipping to production
type DevOverride = (type: AiAnalysisType, signal: AbortSignal) => Promise<AnalysisResponse | null>
let _devOverride: DevOverride | null = null
// TODO: [DEV ONLY] Remove this export before shipping to production
export function setDevAnalysisOverride(fn: DevOverride | null): void {
  _devOverride = fn
}


type PromptBuilder = (
  analysis: PortfolioAnalysis,
  isFiltered: boolean,
  businessContext?: BusinessContext,
) => string


const PROMPT_BUILDERS: Record<AiAnalysisType, PromptBuilder> = {
  budgetOptimizer: generateBudgetOptimizationPrompt,
  executiveSummary: generateExecutiveSummaryPrompt,
}

function buildAnalysisPrompt(
  analysisContext: AnalysisContext,
): string {
  const { type, analysis, isFiltered, businessContext } = analysisContext;

  const builder = PROMPT_BUILDERS[type]

  return builder(analysis, isFiltered, businessContext)
}

export async function runAnalysisPrompt(
  providerState: AIProviderState,
  analysisContext: AnalysisContext,
  signal: AbortSignal,
): Promise<AnalysisResponse | null> {
  // TODO: [DEV ONLY] Remove this branch before shipping to production
  if (_devOverride) return _devOverride(analysisContext.type, signal)

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