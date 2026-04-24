import type { PortfolioAnalysis } from "../../../../common/portfolio-analysis/types";
import type { AiModel } from "../../providers";
import type { AiAnalysisType, AiProviderType, BudgetOptimizerResponse, BusinessContext, ExecutiveSummaryResponse } from "../../types";

export type AnalysisResponse = BudgetOptimizerResponse | ExecutiveSummaryResponse

export type AnalysisContext = {
  type: AiAnalysisType;
  analysis: PortfolioAnalysis;
  isFiltered: boolean;
  businessContext?: BusinessContext;
}
 
export interface AIProviderState {
  provider: AiProviderType;
  apiKey: string;
  selectedModel: AiModel;
}
 