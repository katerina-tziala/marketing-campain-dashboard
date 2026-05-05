import type { ChartThemeTokens } from '../types';

function readVar(token: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
}

export function toChartColorPalette(t: ChartThemeTokens): string[] {
  return [
    // 500 (base)
    t.colorIndigo,
    t.colorPink,
    t.colorEmerald,
    t.colorOrange,
    t.colorViolet,
    t.colorCyan,
    t.colorAmber,
    t.colorRed,
    t.colorTeal,
    t.colorPurple,
    t.colorYellow,
    t.colorGreen,
    t.colorBlue,
    t.colorRose,
    t.colorSky,
    t.colorLime,
    t.colorFuchsia,
    // 400 (lighter)
    t.colorIndigoLight,
    t.colorPinkLight,
    t.colorEmeraldLight,
    t.colorOrangeLight,
    t.colorVioletLight,
    t.colorCyanLight,
    t.colorAmberLight,
    t.colorRedLight,
    t.colorTealLight,
    t.colorGreenLight,
    t.colorPurpleLight,
    t.colorBlueLight,
    t.colorYellowLight,
    t.colorRoseLight,
    t.colorSkyLight,
    t.colorLimeLight,
    t.colorFuchsiaLight,
    // 600 (darker)
    t.colorIndigoDark,
    t.colorPinkDark,
    t.colorEmeraldDark,
    t.colorOrangeDark,
    t.colorVioletDark,
    t.colorCyanDark,
    t.colorAmberDark,
    t.colorRedDark,
    t.colorTealDark,
    t.colorGreenDark,
    t.colorPurpleDark,
    t.colorBlueDark,
    t.colorYellowDark,
    t.colorRoseDark,
    t.colorSkyDark,
    t.colorLimeDark,
    t.colorFuchsiaDark,
  ];
}

export function resolvePaletteColors(): string[] {
  return toChartColorPalette(resolveChartsThemeTokens());
}

export function resolveChartsThemeTokens(): ChartThemeTokens {
  return {
    // Tooltip
    tooltipBg: readVar('--chart-tooltip-bg'),
    tooltipTitleColor: readVar('--chart-tooltip-title-color'),
    tooltipBodyColor: readVar('--chart-tooltip-body-color'),
    tooltipBorder: readVar('--chart-tooltip-border'),
    tooltipBorderRadius: readVar('--chart-tooltip-border-radius'),
    tooltipPadding: readVar('--chart-tooltip-padding'),
    tooltipMarkerSize: readVar('--chart-tooltip-marker-size'),

    // Axes & grid
    tickColor: readVar('--chart-tick-color'),
    titleColor: readVar('--chart-title-color'),
    gridLine: readVar('--chart-grid-line'),
    tickFontSize: readVar('--chart-tick-font-size'),
    titleFontSize: readVar('--chart-title-font-size'),
    maxTickRotation: readVar('--chart-max-tick-rotation'),

    // Arc
    arcSeparator: readVar('--chart-arc-separator'),

    // Text
    textColor: readVar('--chart-text-color'),

    // Legend
    legendLabelColor: readVar('--chart-legend-label-color'),
    legendLabelFontSize: readVar('--chart-legend-font-size'),
    legendPadding: readVar('--chart-legend-padding'),
    legendBoxSize: readVar('--chart-legend-box-size'),
    legendBorderRadius: readVar('--chart-legend-border-radius'),

    // Campaign performance
    budget: readVar('--chart-budget'),
    revenue: readVar('--chart-revenue'),
    gapPositive: readVar('--chart-gap-positive'),
    gapNegative: readVar('--chart-gap-negative'),

    // Quadrants
    quadrantScaleUp: readVar('--chart-quadrant-scale-up'),
    quadrantChampions: readVar('--chart-quadrant-champions'),
    quadrantMonitor: readVar('--chart-quadrant-monitor'),
    quadrantOverspend: readVar('--chart-quadrant-overspend'),
    quadrantDivider: readVar('--chart-quadrant-divider'),

    // Palette 500
    colorIndigo: readVar('--chart-color-indigo'),
    colorPink: readVar('--chart-color-pink'),
    colorEmerald: readVar('--chart-color-emerald'),
    colorOrange: readVar('--chart-color-orange'),
    colorViolet: readVar('--chart-color-violet'),
    colorCyan: readVar('--chart-color-cyan'),
    colorAmber: readVar('--chart-color-amber'),
    colorRed: readVar('--chart-color-red'),
    colorTeal: readVar('--chart-color-teal'),
    colorPurple: readVar('--chart-color-purple'),
    colorGreen: readVar('--chart-color-green'),
    colorBlue: readVar('--chart-color-blue'),
    colorYellow: readVar('--chart-color-yellow'),
    colorFuchsia: readVar('--chart-color-fuchsia'),
    colorSky: readVar('--chart-color-sky'),
    colorLime: readVar('--chart-color-lime'),
    colorRose: readVar('--chart-color-rose'),

    // Palette 400
    colorIndigoLight: readVar('--chart-color-indigo-light'),
    colorPinkLight: readVar('--chart-color-pink-light'),
    colorEmeraldLight: readVar('--chart-color-emerald-light'),
    colorOrangeLight: readVar('--chart-color-orange-light'),
    colorVioletLight: readVar('--chart-color-violet-light'),
    colorCyanLight: readVar('--chart-color-cyan-light'),
    colorAmberLight: readVar('--chart-color-amber-light'),
    colorRedLight: readVar('--chart-color-red-light'),
    colorTealLight: readVar('--chart-color-teal-light'),
    colorPurpleLight: readVar('--chart-color-purple-light'),
    colorGreenLight: readVar('--chart-color-green-light'),
    colorBlueLight: readVar('--chart-color-blue-light'),
    colorYellowLight: readVar('--chart-color-yellow-light'),
    colorFuchsiaLight: readVar('--chart-color-fuchsia-light'),
    colorSkyLight: readVar('--chart-color-sky-light'),
    colorLimeLight: readVar('--chart-color-lime-light'),
    colorRoseLight: readVar('--chart-color-rose-light'),

    // Palette 600
    colorIndigoDark: readVar('--chart-color-indigo-dark'),
    colorPinkDark: readVar('--chart-color-pink-dark'),
    colorEmeraldDark: readVar('--chart-color-emerald-dark'),
    colorOrangeDark: readVar('--chart-color-orange-dark'),
    colorVioletDark: readVar('--chart-color-violet-dark'),
    colorCyanDark: readVar('--chart-color-cyan-dark'),
    colorAmberDark: readVar('--chart-color-amber-dark'),
    colorRedDark: readVar('--chart-color-red-dark'),
    colorTealDark: readVar('--chart-color-teal-dark'),
    colorPurpleDark: readVar('--chart-color-purple-dark'),
    colorGreenDark: readVar('--chart-color-green-dark'),
    colorBlueDark: readVar('--chart-color-blue-dark'),
    colorYellowDark: readVar('--chart-color-yellow-dark'),
    colorFuchsiaDark: readVar('--chart-color-fuchsia-dark'),
    colorSkyDark: readVar('--chart-color-sky-dark'),
    colorLimeDark: readVar('--chart-color-lime-dark'),
    colorRoseDark: readVar('--chart-color-rose-dark'),
  };
}
