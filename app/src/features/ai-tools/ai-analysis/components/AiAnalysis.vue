<script setup lang="ts">
import { type Tab, Tabs, FileTextIcon, SlidersIcon } from "@/ui";
import { useAiAnalysisStore } from "../stores";
import type { AiAnalysisType } from "../../types";
import { BudgetOptimizationAnalysis } from "../budget-optimization";
import { ExecutiveSummaryAnalysis } from "../executive-summary";

const analysisStore = useAiAnalysisStore();

const tabs: Tab[] = [
  { id: "executiveSummary", label: "Summary", icon: FileTextIcon },
  { id: "budgetOptimizer", label: "Optimizer", icon: SlidersIcon },
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
    <BudgetOptimizationAnalysis
      v-if="analysisStore.activeTab === 'budgetOptimizer'"
    />
    <ExecutiveSummaryAnalysis v-else />
  </div>
</template>

<style lang="scss" scoped>
.panel-container {
  @apply pt-4
    px-2
    h-full
    overflow-y-auto
    overflow-x-hidden
    flex
    flex-col
    gap-6
    pb-2
    text-sm
    text-typography;

    // container query parent
}
</style>
