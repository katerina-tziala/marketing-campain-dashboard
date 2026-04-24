<script setup lang="ts">
import type { ExecutiveSummaryResponse } from '../../../types'
import { urgencyVariant } from '../../../utils/analysis-badge-variants'

defineProps<{
  actions: ExecutiveSummaryResponse['priorityActions']
}>()
</script>

<template>
  <section class="ai-section">
    <h4 class="section-title">Priority Actions</h4>
    <div
      v-for="(action, i) in actions"
      :key="i"
      class="card-secondary"
    >
      <div class="card-head priority-head">
        <span class="priority-number">#{{ action.priority }}</span>
        <h5 class="card-title">{{ action.action }}</h5>
        <span class="badge" :class="urgencyVariant(action.urgency)">{{ action.urgency }}</span>
      </div>
      <p class="card-content px-2">{{ action.expectedOutcome }}</p>
      <p class="card-content priority-metric">
        <strong>Success metric:</strong> {{ action.successMetric }}
      </p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.priority-head {
  @apply items-start;
}

.priority-number {
  @apply font-extrabold text-sm min-w-5 text-primary-200;
}

.priority-metric {
  @apply bg-primary-700/10 border-primary-700/25 py-1 px-2;
}
</style>
