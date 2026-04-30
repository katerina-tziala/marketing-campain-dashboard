<script setup lang="ts">
import { computed } from "vue";
import type { HealthScore, HealthLabel } from "@/features/ai-tools/ai-analysis/types";
import type { BadgeVariant } from "@/ui";
import { Badge } from "@/ui";

const props = defineProps<{
  healthScore: HealthScore;
}>();

const HEALTH_SCORE_MAP: Record<string, BadgeVariant> = {
  excellent: "success",
  good: "info",
  needsattention: "warning",
  critical: "danger",
};

const HEALTH_LABEL_MAP: Record<HealthLabel, string> = {
  Excellent: "Excellent",
  Good: "Good",
  NeedsAttention: "Needs Attention",
  Critical: "Critical",
};

const variant = computed<BadgeVariant>(
  () => HEALTH_SCORE_MAP[props.healthScore.label.toLowerCase()] ?? "info",
);

const readableLabel = computed(
  () => HEALTH_LABEL_MAP[props.healthScore.label] ?? props.healthScore.label,
);
</script>

<template>
  <div class="health-container">
    <Badge class="rounded-rectangle" :class="variant">
      <span class="text-lg font-extrabold leading-none">{{ healthScore.score }}</span>
      <span class="leading-none">&nbsp;/&nbsp;100</span>
    </Badge>
    <Badge class="text-only" :class="variant">{{ readableLabel }}</Badge>
  </div>
</template>

<style lang="scss" scoped>
.health-container {
  @apply flex flex-col gap-1 items-center justify-center;
}
</style>
