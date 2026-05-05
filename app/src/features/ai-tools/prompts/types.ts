export type PromptRuleListType = 'ordered' | 'unordered' | 'none';

export interface PromptRuleGroup {
  title: string;
  preamble?: string;
  list: string[];
  type: PromptRuleListType;
  notes?: string[];
}
