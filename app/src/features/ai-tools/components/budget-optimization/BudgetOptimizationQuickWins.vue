<script setup lang="ts">
import type { BudgetOptimizerResponse } from '../../types'
import { effortVariant } from '../../utils/analysis-badge-variants'

defineProps<{
  quickWins: BudgetOptimizerResponse['quick_wins']
}>()
</script>

<template>
  <section class="ai-section">
    <h4 class="section-title">Quick Wins</h4>
    <div
      v-for="(qw, i) in quickWins"
      :key="i"
      class="card-secondary"
    >
      <div class="card-content flex items-start gap-x-2">
        <p class="grow">{{ qw.action }}</p>
        <span class="badge" :class="effortVariant(qw.effort)">{{ qw.effort }} effort</span>
      </div>
      <div class="quick-win-details badge-background badge-text opportunity">
        <span class="quick-win-impact">{{ qw.potential_impact }}</span>
        <span class="quick-win-timeline">{{ qw.timeline }}</span>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.quick-win-details {
  @apply flex items-start justify-between gap-3 py-1 px-2 rounded-sm;
}

.quick-win-impact {
  @apply grow;
}

.quick-win-timeline {
  @apply font-semibold whitespace-nowrap;
}
</style>
