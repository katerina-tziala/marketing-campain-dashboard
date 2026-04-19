<script setup lang="ts">
import type { BudgetOptimizerResponse } from '../../../types'

defineProps<{
  performers: BudgetOptimizerResponse['top_performers']
}>()
</script>

<template>
  <section class="ai-section">
    <h4 class="section-title">Top Performers</h4>
    <div
      v-for="(perf, i) in performers"
      :key="i"
      class="card-secondary"
    >
      <div class="card-head items-center">
        <h5 class="card-title pt-1">{{ perf.campaign }}</h5>
        <span class="performer-roi text-success">{{ perf.roi }}x&nbsp;ROI</span>
      </div>
      <p class="card-content">{{ perf.insight }}</p>
      <p class="card-content performer-unlock">
        <strong>Unlock:</strong> {{ perf.unlock_potential }}
      </p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.performer-roi {
  @apply text-xs font-bold pt-1 whitespace-nowrap;
}

.performer-unlock {
  strong {
    @apply font-semibold;
  }
}
</style>
