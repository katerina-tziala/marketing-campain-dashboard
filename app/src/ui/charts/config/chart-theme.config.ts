export type ChartTheme = {
  baseOptions: {
    responsive: boolean
    maintainAspectRatio: boolean
  }
  colors: readonly string[]
  textColor: string
  scales: {
    tickColor: string
    titleColor: string
    gridColor: string
    borderColor: string
    tickFontSize: number
    titleFontSize: number
    maxTickRotation: number
  }
  legend: {
    labelColor: string
    labelFontSize: number
    labelPadding: number
    boxWidth: number
    boxHeight: number
    borderRadius: number
  }
  tooltip: {
    backgroundColor: string
    titleColor: string
    bodyColor: string
    borderColor: string
  }
}

export const DEFAULT_CHART_THEME = {
  baseOptions: {
    responsive: true,
    maintainAspectRatio: false,
  },
  colors: [
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f97316', // orange
    '#10b981', // emerald
    '#06b6d4', // cyan
    '#f59e0b', // amber
    '#ef4444', // red
    '#14b8a6', // teal
    '#a855f7', // purple
    '#84cc16', // lime
    '#3b82f6', // blue
  ],
  textColor: '#cbd5e1',
  scales: {
    tickColor: '#cbd5e1',
    titleColor: '#cbd5e1',
    gridColor: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.07)',
    tickFontSize: 11,
    titleFontSize: 11,
    maxTickRotation: 45,
  },
  legend: {
    labelColor: '#cbd5e1',
    labelFontSize: 12,
    labelPadding: 16,
    boxWidth: 12,
    boxHeight: 12,
    borderRadius: 4,
  },
  tooltip: {
    backgroundColor: '#0f172a',
    titleColor: '#f8fafc',
    bodyColor: '#cbd5e1',
    borderColor: 'rgba(255,255,255,0.15)',
  },
} as const satisfies ChartTheme
