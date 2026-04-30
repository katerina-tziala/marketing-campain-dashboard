<script setup lang="ts">
import { useAiAnalysisStore } from "@/features/ai-tools/ai-analysis/stores";
import BudgetOptimizationAnalysis from "./budget-optimization/BudgetOptimizationAnalysis.vue";
import ExecutiveSummaryAnalysis from "./executive-summary/ExecutiveSummaryAnalysis.vue";
import { FileTextIcon, SlidersIcon } from "@/ui/icons";
import type { AiAnalysisType } from "@/features/ai-tools/types";
import { type Tab, Tabs } from "@/ui";

const analysisStore = useAiAnalysisStore();

const tabs: Tab[] = [
  { id: "executiveSummary", label: "Summary", icon: FileTextIcon },
  { id: "budgetOptimizer", label: "Optimizer", icon: SlidersIcon },
];
</script>

<template>
  <Tabs
    :tabs="tabs"
    :active-tab="analysisStore.activeTab"
    @change="analysisStore.setActiveTab($event as AiAnalysisType)"
  />
  <div class="scrollbar-stable scrollbar-on-surface panel-container">
    <BudgetOptimizationAnalysis v-if="analysisStore.activeTab === 'budgetOptimizer'" />
    <ExecutiveSummaryAnalysis v-else />
  </div>
</template>

<style lang="scss" scoped>
.panel-container {
  @apply p-4
    pr-3 
    h-full
    overflow-y-auto
    overflow-x-hidden
    flex flex-col gap-6 
    text-sm
    text-typography;
}
</style>
