export type ExecutiveSummaryTotals = {
  budget: number;
  revenue: number;
  roi: number;
  conversions: number;
  cac: number;
  ctr: number;
  cvr: number;
};

export type ExecutiveSummaryPortfolio = {
  campaignCount: number;
  channelCount: number;
};

export type ExecutiveSummaryChannel = {
  channel: string;
  budget: number;
  revenue: number;
  roi: number;
  conversions: number;
  cac: number;
  ctr: number;
  cvr: number;
  budgetShare: number;
  revenueShare: number;
};

export type ExecutiveSummaryCampaign = {
  campaign: string;
  channel: string;
  budget: number;
  revenue: number;
  roi: number;
  conversions: number;
  cac: number;
  ctr: number;
  cvr: number;
};

export type ExecutiveSummaryOtherChannelsSummary = {
  channelCount: number;
  budgetShare: number;
  revenueShare: number;
};

export type ExecutiveSummaryData = {
  period?: string;
  totals: ExecutiveSummaryTotals;
  portfolio: ExecutiveSummaryPortfolio;
  topChannels: ExecutiveSummaryChannel[];
  otherChannelsSummary?: ExecutiveSummaryOtherChannelsSummary;
  topCampaigns: ExecutiveSummaryCampaign[];
  underperformingCampaigns: ExecutiveSummaryCampaign[];
  keyFindings?: string[];
};

 
export type ExecutiveSummaryContextInput = {
  period?: string;
  industry?: string;
  goal?: string;
  businessStage?: string;
  attributionModel?: string;
  riskTolerance?: string;
  scalingTolerance?: string;
  constraints?: string[];
};

 
export type ExecutiveSummaryScopeInput = {
  isFiltered: boolean;
  includedChannels?: string[];
};

export type BudgetOptimizerContextInput = {
  period?: string;
  industry?: string;
  goal?: string;
  businessStage?: string;
  attributionModel?: string;
  riskTolerance?: string;
  scalingTolerance?: string;
  constraints?: string[];
  allowBudgetExpansion?: boolean;
};

export type BudgetOptimizerTotals = {
  budget: number;
  revenue: number;
  roi: number;
  conversions: number;
  cac: number;
  ctr: number;
  cvr: number;
};

export type BudgetOptimizerScopeInput = {
  isFiltered: boolean;
  includedChannels?: string[];
};
 

export type BudgetOptimizerCampaign = {
  campaign: string;
  channel: string;

  budget: number;
  revenue: number;

  impressions: number;
  clicks: number;
  conversions: number;

  roi: number;
  ctr: number;
  cvr: number;
  cac: number;

  budgetShare: number;
  revenueShare: number;
   efficiencyScore?: number;
  spendTier?: "high" | "medium" | "low";
};

export type BudgetOptimizerChannel = {
channel: string;

  budget: number;
  revenue: number;

  impressions: number;
  clicks: number;
  conversions: number;

  roi: number;
  ctr: number;
  cvr: number;
  cac: number;

  budgetShare: number;
  revenueShare: number;

  efficiencyScore?: number;
};

export type BudgetOptimizerData = {
  totals: BudgetOptimizerTotals;
  campaigns: BudgetOptimizerCampaign[];
  channels: BudgetOptimizerChannel[];
  portfolio: {
    campaignCount: number;
    channelCount: number;
  };
  keyFindings?: string[];
};