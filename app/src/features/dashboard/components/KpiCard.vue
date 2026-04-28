<script setup lang="ts">
import { Card } from "@/ui";

defineProps<{
  label: string;
  value: string | null | undefined;
}>();
</script>

<template>
  <Card class="kpi-card">
    <h3 class="kpi-label">{{ label }}</h3>
    <p class="kpi-value">{{ value ?? "N/A" }}</p>
    <div v-if="$slots.secondary" class="kpi-secondary">
      <slot name="secondary" />
    </div>
  </Card>
</template>

<style lang="scss" scoped>
.kpi-card {
  @apply p-3 w-full gap-1;
  // @include cq-container("kpi-card");
}

.kpi-label {
  @apply text-xs font-medium text-primary-lighter;
}

.kpi-value {
  @apply text-3xl font-semibold text-on-primary;

  // @include cq-up(tiny, "kpi-card") {
  //   @apply text-3xl;
  // }
}

.kpi-secondary {
  @apply text-xs text-typography-soft flex flex-wrap items-baseline gap-x-1.5;
}
</style>
