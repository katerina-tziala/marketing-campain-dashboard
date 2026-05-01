import { SAMPLE_CAMPAIGNS } from '@/shared/data'
import { usePortfolioDataStore } from '@/app/stores'

const DEV_PORTFOLIO_TITLE = 'Sample Campaign Data (Dev)'

export function activateDevPortfolioData(): void {
  const portfolioData = usePortfolioDataStore()
  if (portfolioData.portfolios.length > 0) return

  portfolioData.addPortfolio(SAMPLE_CAMPAIGNS, DEV_PORTFOLIO_TITLE)
}
