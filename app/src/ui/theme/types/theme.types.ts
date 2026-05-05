export type AppTheme = 'dark' | 'light'

export interface ChartThemeTokens {
  // ─── Tooltip ──────────────────────────────────────────────────────────────
  /** Tooltip panel background */
  tooltipBg: string
  /** Tooltip title text color */
  tooltipTitleColor: string
  /** Tooltip body / label text color */
  tooltipBodyColor: string
  /** Tooltip panel border color */
  tooltipBorder: string
  /** Tooltip corner radius in px */
  tooltipBorderRadius: string
  /** Tooltip inner padding in px */
  tooltipPadding: string
  /** Tooltip color marker box size in px */
  tooltipMarkerSize: string

  // ─── Axes & grid ──────────────────────────────────────────────────────────
  /** Tick label color on all axes */
  tickColor: string
  /** Axis title label color */
  titleColor: string
  /** Grid line color */
  gridLine: string
  /** Tick font size in px */
  tickFontSize: string
  /** Axis title font size in px */
  titleFontSize: string
  /** Maximum tick label rotation in degrees */
  maxTickRotation: string

  // ─── Arc (donut separator) ─────────────────────────────────────────────────
  /** Arc / donut segment separator color — should match the card surface */
  arcSeparator: string

  // ─── Text ─────────────────────────────────────────────────────────────────
  /** Generic chart text color (used for plugin-drawn labels) */
  textColor: string

  // ─── Legend ───────────────────────────────────────────────────────────────
  /** Legend item label color */
  legendLabelColor: string
  /** Legend label font size in px */
  legendLabelFontSize: string
  /** Spacing between legend items in px */
  legendPadding: string
  /** Legend color box width and height in px */
  legendBoxSize: string
  /** Legend color box border radius in px */
  legendBorderRadius: string

  // ─── Campaign performance — bar charts ────────────────────────────────────
  /** Budget bar / donut slice color */
  budget: string
  /** Revenue bar color */
  revenue: string
  /** Positive efficiency gap bar color */
  gapPositive: string
  /** Negative efficiency gap bar color */
  gapNegative: string

  // ─── ROI vs Budget scaling quadrant colors ────────────────────────────────
  /** Scale Up quadrant highlight color */
  quadrantScaleUp: string
  /** Champions quadrant highlight color */
  quadrantChampions: string
  /** Monitor quadrant highlight color */
  quadrantMonitor: string
  /** Overspend quadrant highlight color */
  quadrantOverspend: string
  /** Quadrant divider line color */
  quadrantDivider: string

  // ─── Palette — 500 (base) ─────────────────────────────────────────────────
  colorIndigo: string
  colorPink: string
  colorEmerald: string
  colorOrange: string
  colorViolet: string
  colorCyan: string
  colorAmber: string
  colorRed: string
  colorTeal: string
  colorPurple: string
  colorGreen: string
  colorBlue: string
  colorYellow: string
  colorFuchsia: string
  colorSky: string
  colorLime: string
  colorRose: string

  // ─── Palette — 400 (lighter) ──────────────────────────────────────────────
  colorIndigoLight: string
  colorPinkLight: string
  colorEmeraldLight: string
  colorOrangeLight: string
  colorVioletLight: string
  colorCyanLight: string
  colorAmberLight: string
  colorRedLight: string
  colorTealLight: string
  colorPurpleLight: string
  colorGreenLight: string
  colorBlueLight: string
  colorYellowLight: string
  colorFuchsiaLight: string
  colorSkyLight: string
  colorLimeLight: string
  colorRoseLight: string

  // ─── Palette — 600 (darker) ───────────────────────────────────────────────
  colorIndigoDark: string
  colorPinkDark: string
  colorEmeraldDark: string
  colorOrangeDark: string
  colorVioletDark: string
  colorCyanDark: string
  colorAmberDark: string
  colorRedDark: string
  colorTealDark: string
  colorPurpleDark: string
  colorGreenDark: string
  colorBlueDark: string
  colorYellowDark: string
  colorFuchsiaDark: string
  colorSkyDark: string
  colorLimeDark: string
  colorRoseDark: string
}
