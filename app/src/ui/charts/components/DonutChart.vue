<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Doughnut } from "vue-chartjs";
import { useChartConfig, useChartTheme, useChartTooltip } from "../composables";
import type {
  DonutChartData,
  DonutChartOptions,
  DonutLegendLabelFilter,
  DonutTooltipCallbacks,
} from "../types";
import { formatCompactNumber } from "@/shared/utils";

const props = withDefaults(
  defineProps<{
    chartData: DonutChartData;
    showLegend?: boolean;
    legendLabelFilter?: DonutLegendLabelFilter;
    tooltipCallbacks?: DonutTooltipCallbacks;
  }>(),
  {
    showLegend: true,
  },
);

defineOptions({
  inheritAttrs: false,
});

const attrs = useAttrs();
const chartTheme = useChartTheme().value;
const { baseOptions, basePlugins } = useChartConfig<"doughnut">();

const defaultTooltipCallbacks: DonutTooltipCallbacks = {
  title: (items) => items[0]?.label ?? "",
  label: (ctx) => formatCompactNumber(Number(ctx.parsed)),
};

const donutTooltip = useChartTooltip<"doughnut">(
  props.tooltipCallbacks ?? defaultTooltipCallbacks,
);

function hasVisibleBorderWidth(borderWidth: unknown): boolean {
  if (Array.isArray(borderWidth)) {
    return borderWidth.some((width) => Number(width) > 0);
  }

  return Number(borderWidth ?? 0) > 0;
}

const chartDataWithDefaultBorders = computed<DonutChartData>(() => ({
  ...props.chartData,
  datasets: props.chartData.datasets.map((dataset) => {
    if (!hasVisibleBorderWidth(dataset.borderWidth) || dataset.borderColor) {
      return dataset;
    }

    return {
      ...dataset,
      borderColor: chartTheme.arc.separatorColor,
    };
  }),
}));

const options: DonutChartOptions = {
  ...baseOptions,
  cutout: "62%",
  plugins: {
    ...basePlugins,
    tooltip: donutTooltip,
    legend: {
      ...basePlugins.legend,
      display: props.showLegend,
      position: "bottom",
      labels: {
        ...basePlugins.legend.labels,
        borderRadius: 0,
        padding: 10,
        generateLabels: (chart) => {
          const { labels = [], datasets } = chart.data;
          if (!datasets.length) return [];
          const legendLabels = (labels as string[]).map((text, i) => {
            const bg = datasets[0].backgroundColor;
            const segColor = Array.isArray(bg)
              ? (bg[i] as string)
              : (bg as string);
            const hidden = !chart.getDataVisibility(i);
            return {
              text,
              fillStyle: segColor,
              strokeStyle: "transparent",
              lineWidth: 0,
              fontColor: chartTheme.textColor,
              hidden,
              index: i,
            };
          });

          return props.legendLabelFilter
            ? legendLabels.filter(props.legendLabelFilter)
            : legendLabels;
        },
      },
    },
  },
};

const chartAriaLabel = computed(() =>
  typeof attrs["aria-label"] === "string"
    ? attrs["aria-label"]
    : "Donut chart",
);
</script>

<template>
  <div
    v-bind="$attrs"
    class="w-full h-full min-h-64"
    role="img"
    :aria-label="chartAriaLabel"
  >
    <Doughnut :data="chartDataWithDefaultBorders" :options="options" />
  </div>
</template>
