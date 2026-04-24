import type { PortfolioAnalysis } from "../../../../common/portfolio-analysis/types";
import { generateBudgetOptimizationPrompt, generateExecutiveSummaryPrompt } from "../../prompts";
import { runProviderPrompt } from "../../providers";
import type { AiAnalysisType, BusinessContext, } from "../../types";
import type { AnalysisContext, AIProviderState, AnalysisResponse } from "../types";


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