import { CAMPAIGNS_SAMPLE } from '@/shared/data'
import { usePortfolioStore } from '@/shared/portfolio'

const DEV_PORTFOLIO_INPUT = {
  name: 'Sample Campaign Data (Dev)',
  period: {
    from: '2025-01-01',
    to: '2025-03-31',
  },
  industry: 'Retail',
  campaigns: CAMPAIGNS_SAMPLE,
}

export function activateDevPortfolio(): void {
  const portfolioStore = usePortfolioStore()
  if (portfolioStore.portfolios.length > 0) return

  portfolioStore.addPortfolio(DEV_PORTFOLIO_INPUT)
}
