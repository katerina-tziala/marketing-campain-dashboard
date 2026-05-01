import { MOCK_CAMPAINS } from '@/shared/data/MOCK_CAMPAIN_DATA'
import { usePortfolioDataStore } from '@/shared/portfolio-data'

const MOCK_PORTFOLIO_TITLE = 'Mock Campaign Data (Dev)'

export function activateDevPortfolioData(): void {
  const portfolioData = usePortfolioDataStore()
  if (portfolioData.portfolios.length > 0) return

  portfolioData.addPortfolio(MOCK_CAMPAINS, MOCK_PORTFOLIO_TITLE)
}
