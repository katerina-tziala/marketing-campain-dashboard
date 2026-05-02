import type { DevModeConfig } from './types'
import { useDevAnalysisCycle } from './dev-analysis-cycle'
import { useDevConnectionCycle } from './dev-connection-cycle'
import { activateDevPortfolio } from './dev-portfolio-data'

export type { DevModeConfig } from './types'
export { DEV_MODE_CONFIG } from './config'

let deactivateActiveDevModes: Array<() => void> = []

function deactivateDevMode(): void {
  deactivateActiveDevModes.forEach((deactivate) => deactivate())
  deactivateActiveDevModes = []
}

export function activateDevMode(config: DevModeConfig): void {
  deactivateDevMode()

  if (!config.enabled) return
  if (config.aiTools.analysisCycle && config.aiTools.connectionCycle) {
    throw new Error('Enable either analysisCycle or connectionCycle dev mode, not both.')
  }

  if (config.portfolio.seedMockCampaigns) {
    activateDevPortfolio()
  }

  if (config.aiTools.analysisCycle) {
    const { activate, deactivate } = useDevAnalysisCycle()
    activate()
    deactivateActiveDevModes.push(deactivate)
  }

  if (config.aiTools.connectionCycle) {
    const { activate, deactivate } = useDevConnectionCycle()
    activate()
    deactivateActiveDevModes.push(deactivate)
  }
}
