import { computed } from 'vue';

import { resolveChartsThemeTokens, resolvePaletteColors, useTheme, withAlpha } from '@/ui';

import type {
  CampaignPerformanceChartColors,
  CampaignPerformanceScalingColors,
  ScalingQuadrantColors,
} from '../types';

function toQuadrantColors(base: string): ScalingQuadrantColors {
  return {
    color: withAlpha(base, 0.75),
    dimmedColor: withAlpha(base, 0.6),
    border: base,
    backgroundColor: withAlpha(base, 0.12),
  };
}

export function useCampaignPerformanceTheme(): {
  readonly performanceChartColors: CampaignPerformanceChartColors;
  readonly scalingColors: CampaignPerformanceScalingColors;
  readonly paletteColors: string[];
  getFillColor: (color: string, alpha?: number) => string;
} {
  const { currentTheme } = useTheme();

  const theme = computed(() => {
    // currentTheme read here so computed invalidates on theme switch
    void currentTheme.value;
    const {
      budget,
      revenue,
      gapPositive,
      gapNegative,
      quadrantScaleUp,
      quadrantChampions,
      quadrantMonitor,
      quadrantOverspend,
      quadrantDivider,
    } = resolveChartsThemeTokens();

    const performanceChartColors: CampaignPerformanceChartColors = {
      budget,
      revenue,
      positiveGap: gapPositive,
      negativeGap: gapNegative,
    };

    const scalingColors: CampaignPerformanceScalingColors = {
      scaleUp: toQuadrantColors(quadrantScaleUp),
      champions: toQuadrantColors(quadrantChampions),
      underperforming: toQuadrantColors(quadrantMonitor),
      overspend: toQuadrantColors(quadrantOverspend),
      divider: quadrantDivider,
    };

    const paletteColors: string[] = resolvePaletteColors();

    return { performanceChartColors, scalingColors, paletteColors };
  });

  return {
    get performanceChartColors() {
      return theme.value.performanceChartColors;
    },
    get scalingColors() {
      return theme.value.scalingColors;
    },
    get paletteColors() {
      return theme.value.paletteColors;
    },
    getFillColor: (color: string, alpha = 0.75) => withAlpha(color, alpha),
  };
}
