<script setup lang="ts">
import { FileTextIcon, SlidersIcon, type Tab, TabPanels, Tabs } from '@/ui';

import type { AiAnalysisType } from '../types';
import { BudgetOptimizationAnalysis } from './budget-optimization';
import { ExecutiveSummaryAnalysis } from './executive-summary';
import { useAiAnalysisStore } from './stores';

const analysisStore = useAiAnalysisStore();

const tabs: Tab[] = [
  { id: 'executiveSummary', label: 'Summary', icon: FileTextIcon },
  { id: 'budgetOptimizer', label: 'Optimization', icon: SlidersIcon },
];
</script>

<template>
  <Tabs
    aria-label="AI Tools"
    :tabs="tabs"
    :active-tab="analysisStore.activeTab"
    @change="analysisStore.setActiveTab($event as AiAnalysisType)"
  />
  <TabPanels
    class="ai-analysis-container"
    :active-tab="analysisStore.activeTab"
  >
    <template #executiveSummary>
      <ExecutiveSummaryAnalysis />
    </template>
    <template #budgetOptimizer>
      <BudgetOptimizationAnalysis />
    </template>
  </TabPanels>
</template>

<style lang="scss" scoped>
.ai-analysis-container {
  @apply h-full
  	overflow-hidden
  	py-4
  	px-0
  	text-sm
  	text-typography
  	w-full;
}

.ai-analysis-content {
  @apply flex
  	flex-col
  	gap-6
  	py-0
  	px-6
  	w-full
  	h-full
  	overflow-x-hidden
  	overflow-y-auto;
}
</style>
