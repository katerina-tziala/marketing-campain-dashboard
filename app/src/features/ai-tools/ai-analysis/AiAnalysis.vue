<script setup lang="ts">
import { FileTextIcon, SlidersIcon, type Tab, Tabs } from '@/ui';

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
  <div class="scrollbar-stable-both scrollbar-on-surface panel-container">
    <BudgetOptimizationAnalysis v-if="analysisStore.activeTab === 'budgetOptimizer'" />
    <ExecutiveSummaryAnalysis v-else />
  </div>
</template>

<style lang="scss" scoped>
.panel-container {
  @apply flex
    flex-col
    gap-6
    h-full
    overflow-x-hidden
    overflow-y-auto
    pb-2
    pt-5
    px-2
    text-sm
    text-typography;
}
</style>
