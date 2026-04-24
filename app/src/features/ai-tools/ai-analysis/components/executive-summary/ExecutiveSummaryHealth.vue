<script setup lang="ts">
import type { ExecutiveSummaryResponse } from '../../../types'
import type { PortfolioScope } from '../../../../../common/types/campaign'
import AnalysisSummary from '../shared/AnalysisSummary.vue'
import { healthScoreVariant } from '../../utils/analysis-badge-variants'

defineProps<{
  healthScore: ExecutiveSummaryResponse['healthScore']
  bottomLine: string
  scope: PortfolioScope
}>()
</script>

<template>
  <AnalysisSummary
    title="Portfolio Health"
    :scope="scope"
  >
    <template #badge>
      <div class="health-container">
        <div class="badge health-badge" :class="healthScoreVariant(healthScore.label)">
          <span class="health-score">{{ healthScore.score }}</span>
          <span>&nbsp;/&nbsp;100</span>
        </div>
        <p class="badge-text health-label" :class="healthScoreVariant(healthScore.label)">{{ healthScore.label }}</p>
      </div>
    </template>
    <p>{{ healthScore.reasoning }}</p>
    <h5 class="section-subtitle -mb-2">Bottom Line</h5>
    <p>{{ bottomLine }}</p>
  </AnalysisSummary>
</template>

<style lang="scss" scoped>
.health-container {
  @apply flex flex-col gap-1 items-center justify-center;
}

.health-badge {
  @apply rounded-md inline-flex items-center justify-self-center;
}

.health-score {
  @apply text-lg font-extrabold leading-none;
}

.health-label {
  @apply text-xs whitespace-nowrap font-bold text-center justify-self-center;
}
</style>
