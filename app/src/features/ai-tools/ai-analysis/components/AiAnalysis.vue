<script setup lang="ts">
import { useAiAnalysisStore } from '../../../../stores/aiAnalysisStore'
import BudgetOptimizationAnalysis from './budget-optimization/BudgetOptimizationAnalysis.vue'
import ExecutiveSummaryAnalysis from './executive-summary/ExecutiveSummaryAnalysis.vue'
import { FileTextIcon, SlidersIcon } from '../../../../ui/icons'
import type { AiAnalysisTab } from '../../types'
import type { Tab } from '../../../../ui'
import { Tabs } from '../../../../ui'

const analysisStore = useAiAnalysisStore()
const tabs: Tab[] = [
  { id: 'summary', label: 'Summary', icon: FileTextIcon },
  { id: 'optimizer', label: 'Optimizer', icon: SlidersIcon },
]
</script>

<template>
  <Tabs :tabs="tabs" :active-tab="analysisStore.activeTab" @change="analysisStore.setActiveTab($event as AiAnalysisTab)" />
  <div class="scrollbar-stable scrollbar-on-surface panel-container">
    <BudgetOptimizationAnalysis v-if="analysisStore.activeTab === 'optimizer'" />
    <ExecutiveSummaryAnalysis v-else />
  </div>
</template>

<style lang="scss" scoped>
.panel-container {
  @apply p-4
    pr-3
    overflow-y-auto
    overflow-x-hidden;
}
</style>
