export type PromptList = {
  title: string;
  list: string[];
};

export type PromptInstructions = {
  role: string[];
  task: string[];
  objectives: PromptList;
};

export type PromptInstructionStep = {
  title: string;
  bullets?: string[];
  notes?: string[];
};

export type PromptScopeConfig = {
  label: string;
  filteredDescription: string[];
  unfilteredDescription: string[];
  filteredConstraints: string[];
};
