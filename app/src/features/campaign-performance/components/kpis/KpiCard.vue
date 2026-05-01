<script setup lang="ts">
import { Card, MetaRow } from "@/ui";

defineProps<{
  label: string;
  value: string | null | undefined;
}>();
</script>

<template>
  <Card class="kpi-card">
    <h3 class="kpi-label">{{ label }}</h3>
    <p class="kpi-value">{{ value ?? "N/A" }}</p>
    <MetaRow
      v-if="$slots.default"
      separator="divider"
      tone="primary-lighter"
      class="kpi-meta"
    >
      <slot />
    </MetaRow>
  </Card>
</template>

<style lang="scss" scoped>
.kpi-card {
  @apply py-3 px-3.5 w-full gap-1;
}

.kpi-label {
  @apply text-xs font-medium text-primary-lighter;
}

.kpi-value {
  @apply text-3xl font-semibold text-on-primary;
}

.kpi-meta {
  @apply text-xs text-typography-soft;
}
</style>
