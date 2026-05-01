import { defineStore } from 'pinia'
import { computed, watch } from 'vue'
import { useAiAnalysisStore } from '@/features/ai-tools/ai-analysis/stores'
import { useAiConnectionStore } from '@/features/ai-tools/ai-connection/stores'
import { useCampaignPerformanceStore } from '@/features/campaign-performance/stores'
import { PROVIDER_LABELS } from '@/features/ai-tools/providers/utils/providers-meta'
import { usePortfolioDataStore } from '@/shared/portfolio-data'
import { DEV_MODE_CONFIG, activateDevMode } from '@/app/dev-mode'
import { useToastStore } from './toast.store'

// App-level mediator for the dashboard page.
// It is allowed to compose feature stores so those features do not import each other.
export const useDashboardOrchestratorStore = defineStore('dashboardOrchestrator', () => {
  const aiConnection = useAiConnectionStore()
  const aiAnalysis = useAiAnalysisStore()
  const campaignPerformance = useCampaignPerformanceStore()
  const portfolioData = usePortfolioDataStore()
  const toastStore = useToastStore()

  // DEV MODE
  // Configure local/demo behavior in app/dev-mode/config.ts.
  activateDevMode(DEV_MODE_CONFIG)

  // Page state derived from the composed features.
  const hasCampaigns = computed(() => campaignPerformance.campaigns.length > 0)
  const showAiButton = computed(() => !aiConnection.aiPanelOpen)
  const showConnectedDot = computed(
    () => aiConnection.isConnected && !aiConnection.aiPanelOpen,
  )

  const aiPanelOpen = computed(() => aiConnection.aiPanelOpen)

  function openAiPanel(): void {
    aiConnection.openPanel()
    aiAnalysis.onPanelOpen()
  }

  function closeAiPanel(): void {
    aiConnection.closePanel()
    aiAnalysis.onPanelClose()
  }

  // Keep AI analysis feature-agnostic by pushing plain dashboard context into it.
  // Campaign performance owns filters; AI analysis owns request/cache behavior.
  watch(
    () => ({
      portfolioId: campaignPerformance.activePortfolioId,
      portfolioTitle: campaignPerformance.title,
      selectedChannelIds: [...campaignPerformance.selectedChannelsIds],
      channelCount:
        campaignPerformance.selectedChannelsIds.length > 0
          ? campaignPerformance.selectedChannelsIds.length
          : campaignPerformance.portfolioChannels.size,
      campaignCount: campaignPerformance.filteredCampaigns.length,
      filtersActive: campaignPerformance.selectedChannelsIds.length > 0,
      portfolioAnalysis: campaignPerformance.portfolioAnalysis,
    }),
    (context) => {
      if (!context.portfolioId) {
        aiAnalysis.setAnalysisContext(null)
        return
      }

      aiAnalysis.setAnalysisContext({
        ...context,
        portfolioId: context.portfolioId,
      })
    },
    { immediate: true },
  )

  // Portfolio data is shared app state; the orchestrator translates its lifecycle
  // into feature-specific cleanup so AI analysis does not read campaign data stores.
  watch(
    () => portfolioData.lastEvictedId,
    (id) => {
      if (id) aiAnalysis.clearCacheForPortfolio(id)
    },
  )

  watch(
    () => aiConnection.lastConnectionEvent,
    (event) => {
      if (!event || aiConnection.aiPanelOpen) return

      const providerLabel = PROVIDER_LABELS[event.provider]
      if (event.status === 'success') {
        toastStore.showSuccessToast(`Connected to ${providerLabel}`)
        return
      }

      toastStore.showErrorToast(
        `Connection to ${providerLabel} failed`,
        'Reopen the panel for details',
      )
    },
  )

  return {
    hasCampaigns,
    aiPanelOpen,
    showAiButton,
    showConnectedDot,
    // actions
    openAiPanel,
    closeAiPanel,
  }
})
