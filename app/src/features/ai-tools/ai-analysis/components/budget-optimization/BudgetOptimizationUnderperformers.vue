<script setup lang="ts">
import type { BudgetOptimizerResponse } from '../../../types'
import { actionVariant } from '../../../utils/analysis-badge-variants'

defineProps<{
  underperformers: BudgetOptimizerResponse['underperformers']
}>()
</script>

<template>
  <section class="ai-section">
    <h4 class="section-title">Underperformers</h4>
    <div
      v-for="(perf, i) in underperformers"
      :key="i"
      class="card-secondary"
    >
      <div class="card-head items-center">
        <h5 class="card-title pt-1">{{ perf.campaign }}</h5>
        <span class="performer-roi text-danger--5p">{{ perf.roi }}x&nbsp;ROI</span>
        <span class="badge" :class="actionVariant(perf.recommended_action)">{{ perf.recommended_action }}</span>
      </div>
      <p class="card-content">{{ perf.insight }}</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.performer-roi {
  @apply text-xs leading-7 font-bold whitespace-nowrap;
}
</style>
