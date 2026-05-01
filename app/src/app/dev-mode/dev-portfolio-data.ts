import { CAMPAIGNS_SAMPLE } from '@/shared/data'
import { usePortfolioDataStore } from '@/app/stores'

const DEV_PORTFOLIO_TITLE = 'Sample Campaign Data (Dev)'

export function activateDevPortfolioData(): void {
  const portfolioData = usePortfolioDataStore()
  if (portfolioData.portfolios.length > 0) return

  portfolioData.addPortfolio(CAMPAIGNS_SAMPLE, DEV_PORTFOLIO_TITLE)
}
