<script setup lang="ts">
import { computed } from 'vue';

import { useChartTheme } from '../composables';
import type { ChartLegendItem } from '../types';

defineProps<{
  items: ChartLegendItem[];
}>();

const chartTheme = useChartTheme();

const swatchBaseStyle = computed(() => ({
  width: `${chartTheme.value.legend.boxWidth}px`,
  height: `${chartTheme.value.legend.boxHeight}px`,
  flexShrink: '0',
}));

function getSwatchStyle(item: ChartLegendItem): Record<string, string> {
  return {
    ...swatchBaseStyle.value,
    backgroundColor: item.color,
    ...(item.borderColor && {
      borderColor: item.borderColor,
      borderWidth: '1px',
      borderStyle: 'solid',
    }),
  };
}

const labelStyle = computed(() => ({
  color: chartTheme.value.legend.labelColor,
  fontSize: `${chartTheme.value.legend.labelFontSize}px`,
}));
</script>

<template>
  <ul
    v-if="items.length"
    role="list"
    class="legend"
  >
    <li
      v-for="item in items"
      :key="item.id"
      class="legend-item"
    >
      <span
        :style="getSwatchStyle(item)"
        aria-hidden="true"
      />
      <span :style="labelStyle">{{ item.name }}</span>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.legend {
  @apply flex
  	flex-wrap
  	justify-center
  	gap-x-4
  	gap-y-1.5
  	list-none
  	p-0
  	m-0;
}

.legend-item {
  @apply flex
  	items-center
  	gap-1.5;
}
</style>
