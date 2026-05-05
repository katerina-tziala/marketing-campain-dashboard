import { computed, type ComputedRef } from 'vue'
import { resolveChartsThemeTokens, toChartColorPalette } from '../../theme/utils'
import { useTheme } from '../../theme/composables'
import type { ChartTheme } from '../config/chart-theme.config'
import { DEFAULT_CHART_THEME } from '../config/chart-theme.config'

/**
 * Runtime theme resolution boundary — maps resolved CSS var tokens into
 * the ChartTheme shape consumed by chart composables. Returns a ComputedRef
 * that re-evaluates automatically when the active theme changes.
 * DEFAULT_CHART_THEME is kept as a visual reference and SSR/test fallback.
 */
export function useChartTheme(): ComputedRef<ChartTheme> {
  const { currentTheme } = useTheme()

  return computed<ChartTheme>(() => {
    // currentTheme read here so this computed invalidates on theme switch
    void currentTheme.value
    const t = resolveChartsThemeTokens()

    if (!t.tooltipBg) return DEFAULT_CHART_THEME

    return {
      baseOptions: DEFAULT_CHART_THEME.baseOptions,
      colors: toChartColorPalette(t),
      textColor: t.textColor,
      arc: {
        separatorColor: t.arcSeparator,
      },
      scales: {
        tickColor:       t.tickColor,
        titleColor:      t.titleColor,
        gridColor:       t.gridLine,
        borderColor:     t.gridLine,
        tickFontSize:    parseInt(t.tickFontSize),
        titleFontSize:   parseInt(t.titleFontSize),
        maxTickRotation: parseInt(t.maxTickRotation),
      },
      legend: {
        labelColor:    t.legendLabelColor,
        labelFontSize: parseInt(t.legendLabelFontSize),
        labelPadding:  parseInt(t.legendPadding),
        boxWidth:      parseInt(t.legendBoxSize),
        boxHeight:     parseInt(t.legendBoxSize),
        borderRadius:  parseInt(t.legendBorderRadius),
      },
      tooltip: {
        backgroundColor: t.tooltipBg,
        titleColor:      t.tooltipTitleColor,
        bodyColor:       t.tooltipBodyColor,
        borderColor:     t.tooltipBorder,
      },
    }
  })
}
