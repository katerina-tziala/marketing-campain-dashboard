<script setup lang="ts">
import { computed } from "vue";
import type { ExecutiveSummaryResponse } from "@/features/ai-tools/ai-analysis/types";
import type { BadgeVariant } from "@/ui/types/badge-variant";
import { Badge } from "@/ui";

const props = defineProps<{
  healthScore: ExecutiveSummaryResponse["healthScore"];
}>();

const HEALTH_SCORE_MAP: Record<string, BadgeVariant> = {
  excellent: "success",
  good: "info",
  needsattention: "warning",
  critical: "danger",
};

const variant = computed<BadgeVariant>(
  () => HEALTH_SCORE_MAP[props.healthScore.label.toLowerCase()] ?? "info",
);
</script>

<template>
  <div class="health-container">
    <Badge class="rounded-rectangle" :class="variant">
      <span class="text-lg font-extrabold leading-none">{{ healthScore.score }}</span>
      <span class="leading-none">&nbsp;/&nbsp;100</span>
    </Badge>
    <Badge class="text-only" :class="variant">{{ healthScore.label }}</Badge>
  </div>
</template>

<style lang="scss" scoped>
.health-container {
  @apply flex flex-col gap-1 items-center justify-center;
}
</style>
