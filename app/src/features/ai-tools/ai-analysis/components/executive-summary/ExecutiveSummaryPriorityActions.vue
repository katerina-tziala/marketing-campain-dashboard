<script setup lang="ts">
import type { ExecutiveSummaryResponse } from '@/features/ai-tools/ai-analysis/types'
import { urgencyVariant } from '@/features/ai-tools/ai-analysis/utils/analysis-badge-variants'
import { Badge } from '@/ui'

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
        <Badge :class="urgencyVariant(action.urgency)">{{ action.urgency }}</Badge>
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
  @apply font-extrabold text-sm min-w-5 text-primary-soft;
}

.priority-metric {
  @apply bg-primary-darker/10 border-primary-darker/25 py-1 px-2;
}
</style>
