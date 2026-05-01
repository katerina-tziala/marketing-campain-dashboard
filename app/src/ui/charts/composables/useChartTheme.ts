import type { ChartTheme } from '../config/chart-theme.config'
import { DEFAULT_CHART_THEME } from '../config/chart-theme.config'

// Runtime theme resolution boundary. Future CSS variable extraction belongs here.
export function useChartTheme(): ChartTheme {
  return DEFAULT_CHART_THEME
}
