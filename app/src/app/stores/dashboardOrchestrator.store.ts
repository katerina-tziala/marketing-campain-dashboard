import { defineStore } from 'pinia'
import { computed, watch } from 'vue'
import { useAiAnalysisStore } from '@/features/ai-tools/ai-analysis/stores'
import { useAiConnectionStore } from '@/features/ai-tools/ai-connection/stores/aiConnection.store'
import { useCampaignPerformanceStore } from '@/features/campaign-performance/stores/campaignPerformance.store'

// App-level mediator for the dashboard page.
// It is allowed to compose feature stores so those features do not import each other.
export const useDashboardOrchestratorStore = defineStore('dashboardOrchestrator', () => {
  const aiConnection = useAiConnectionStore()
  const aiAnalysis = useAiAnalysisStore()
  const campaignPerformance = useCampaignPerformanceStore()

  // Page chrome state derived from the composed features.
  const hasCampaigns = computed(() => campaignPerformance.campaigns.length > 0)
  const showAiButton = computed(() => !aiConnection.aiPanelOpen)
  const showConnectedDot = computed(
    () => aiConnection.isConnected && !aiConnection.aiPanelOpen,
  )

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

  return {
    hasCampaigns,
    showAiButton,
    showConnectedDot,
    openAiPanel,
    closeAiPanel,
  }
})
