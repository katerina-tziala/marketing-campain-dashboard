<script setup lang="ts">
import type { ExecutiveSummaryResponse } from "@/features/ai-tools/ai-analysis/types";
import type { PortfolioScope } from "@/shared/types/campaign";
import { healthScoreVariant } from "@/features/ai-tools/ai-analysis/utils/analysis-badge-variants";
import { Badge } from "@/ui";

defineProps<{
  healthScore: ExecutiveSummaryResponse["healthScore"];
  bottomLine: string;
  scope: PortfolioScope;
}>();
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-nowrap items-start gap-2">
      <p>{{ healthScore.reasoning }}</p>
      <div class="health-container">
        <Badge
          class="rounded-rectangle"
          :class="healthScoreVariant(healthScore.label)"
        >
          <span class="text-lg font-extrabold leading-none">{{
            healthScore.score
          }}</span>
          <span class="leading-none">&nbsp;/&nbsp;100</span>
        </Badge>
        <Badge class="text-only" :class="healthScoreVariant(healthScore.label)">
          {{ healthScore.label }}
        </Badge>
      </div>
    </div>
    <h5 class="text-sm tracking-wide font-semibold text-primary-soft -mb-2">
      Bottom Line
    </h5>
    <p>{{ bottomLine }}</p>
  </div>
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

  &.success {
    @apply text-success;
  }
  &.warning {
    @apply text-warning;
  }
  &.danger {
    @apply text-danger-light;
  }
  &.info {
    @apply text-info-light;
  }
  &.opportunity {
    @apply text-primary-lighter;
  }
}
</style>
