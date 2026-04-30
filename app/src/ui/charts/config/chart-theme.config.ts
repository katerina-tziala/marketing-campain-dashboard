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

export const DEFAULT_CHART_THEME = {
  baseOptions: {
    responsive: true,
    maintainAspectRatio: false,
  },
  colors: [
    '#6366f1', // indigo-500
    '#ec4899', // pink-500
    '#10b981', // emerald-500
    '#f97316', // orange-500
    '#8b5cf6', // violet-500
    '#06b6d4', // cyan-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#14b8a6', // teal-500
    '#a855f7', // purple-500
    '#84cc16', // lime-500
    '#3b82f6', // blue-500 
    '#22c55e', // green-500
    '#d946ef', // fuchsia-500
    '#0ea5e9', // sky-500
    '#f43f5e', // rose-500
    '#eab308', // yellow-500
    // lighter
    '#818cf8', // indigo-400
    '#f472b6', // pink-400
    '#34d399', // emerald-400
    '#fb923c', // orange-400
    '#a78bfa', // violet-400
    '#22d3ee', // cyan-400
    '#fbbf24', // amber-400
    '#f87171', // red-400
    '#2dd4bf', // teal-400
    '#c084fc', // purple-400
    '#a3e635', // lime-400
    '#60a5fa', // blue-400
    '#4ade80', // green-400
    '#e879f9', // fuchsia-400
    '#38bdf8', // sky-400
    '#fb7185', // rose-400
    '#facc15', // yellow-400 
    // darker
    '#4f46e5', // indigo-600
    '#db2777', // pink-600
    '#059669', // emerald-600
    '#ea580c', // orange-600
    '#7c3aed', // violet-600
    '#0891b2', // cyan-600
    '#d97706', // amber-600
    '#dc2626', // red-600
    '#0d9488', // teal-600
    '#9333ea', // purple-600
    '#65a30d', // lime-600
    '#2563eb', // blue-600
    '#16a34a', // green-600
    '#c026d3', // fuchsia-600
    '#0284c7', // sky-600
    '#e11d48', // rose-600
    '#ca8a04', // yellow-600 
  ],
  textColor: '#cbd5e1',
  arc: {
    separatorColor: '#151b2e',
  },
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
