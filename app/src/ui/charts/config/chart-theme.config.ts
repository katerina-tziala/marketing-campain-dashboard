export type ChartTheme = {
  baseOptions: {
    responsive: boolean
    maintainAspectRatio: boolean
  }
  colors: readonly string[]
  textColor: string
  arc: {
    separatorColor: string
  }
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

const TYPOGRAPHY_MUTED = 'rgb(170, 188, 212)'
const TYPOGRAPHY = 'rgb(221, 228, 238)'
const BORDER_STRONG = 'rgba(38, 52, 92, 0.9)'
const GRID_LINE_COLOR = 'rgba(255, 255, 255, 0.07)'

export const DEFAULT_CHART_THEME = {
  baseOptions: {
    responsive: true,
    maintainAspectRatio: false,
  },
  colors: [
    'rgb(99, 102, 241)',   // indigo-500
    'rgb(236, 72, 153)',   // pink-500
    'rgb(16, 185, 129)',   // emerald-500
    'rgb(249, 115, 22)',   // orange-500
    'rgb(139, 92, 246)',   // violet-500
    'rgb(6, 182, 212)',    // cyan-500
    'rgb(245, 158, 11)',   // amber-500
    'rgb(239, 68, 68)',    // red-500
    'rgb(20, 184, 166)',   // teal-500
    'rgb(168, 85, 247)',   // purple-500
    'rgb(34, 197, 94)',    // green-500
    'rgb(59, 130, 246)',   // blue-500
    'rgb(234, 179, 8)',    // yellow-500
    'rgb(217, 70, 239)',   // fuchsia-500
    'rgb(14, 165, 233)',   // sky-500
    'rgb(132, 204, 22)',   // lime-500
    'rgb(244, 63, 94)',    // rose-500
    // lighter
    'rgb(129, 140, 248)',  // indigo-400
    'rgb(244, 114, 182)',  // pink-400
    'rgb(52, 211, 153)',   // emerald-400
    'rgb(251, 146, 60)',   // orange-400
    'rgb(167, 139, 250)',  // violet-400
    'rgb(34, 211, 238)',   // cyan-400
    'rgb(251, 191, 36)',   // amber-400
    'rgb(248, 113, 113)',  // red-400
    'rgb(45, 212, 191)',   // teal-400
    'rgb(192, 132, 252)',  // purple-400
    'rgb(74, 222, 128)',   // green-400
    'rgb(96, 165, 250)',   // blue-400
    'rgb(250, 204, 21)',   // yellow-400
    'rgb(232, 121, 249)',  // fuchsia-400
    'rgb(56, 189, 248)',   // sky-400
    'rgb(163, 230, 53)',   // lime-400
    'rgb(251, 113, 133)',  // rose-400
    // darker
    'rgb(79, 70, 229)',    // indigo-600
    'rgb(219, 39, 119)',   // pink-600
    'rgb(5, 150, 105)',    // emerald-600
    'rgb(234, 88, 12)',    // orange-600
    'rgb(124, 58, 237)',   // violet-600
    'rgb(8, 145, 178)',    // cyan-600
    'rgb(217, 119, 6)',    // amber-600
    'rgb(220, 38, 38)',    // red-600
    'rgb(13, 148, 136)',   // teal-600
    'rgb(147, 51, 234)',   // purple-600
    'rgb(22, 163, 74)',    // green-600
    'rgb(37, 99, 235)',    // blue-600
    'rgb(202, 138, 4)',    // yellow-600
    'rgb(192, 38, 211)',   // fuchsia-600
    'rgb(2, 132, 199)',    // sky-600
    'rgb(101, 163, 13)',   // lime-600
    'rgb(225, 29, 72)',    // rose-600
  ],
  textColor: TYPOGRAPHY_MUTED,
  arc: {
    separatorColor: 'rgb(21, 27, 46)',
  },
  scales: {
    tickColor: TYPOGRAPHY_MUTED,
    titleColor: TYPOGRAPHY,
    gridColor: GRID_LINE_COLOR,
    borderColor: GRID_LINE_COLOR,
    tickFontSize: 11,
    titleFontSize: 11,
    maxTickRotation: 45,
  },
  legend: {
    labelColor: TYPOGRAPHY_MUTED,
    labelFontSize: 12,
    labelPadding: 16,
    boxWidth: 12,
    boxHeight: 12,
    borderRadius: 4,
  },
  tooltip: {
    backgroundColor: 'rgb(15, 23, 42)',
    titleColor: 'rgb(248, 250, 252)',
    bodyColor: TYPOGRAPHY_MUTED,
    borderColor: BORDER_STRONG,
  },
} as const satisfies ChartTheme
