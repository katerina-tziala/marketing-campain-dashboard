import { computed, watch } from 'vue';
import { defineStore } from 'pinia';

import { useAiAnalysisStore } from '@/features/ai-tools/ai-analysis/stores';
import { useAiConnectionStore } from '@/features/ai-tools/ai-connection/stores';
import { PROVIDER_LABELS } from '@/features/ai-tools/providers/utils/providers-meta';
import type { AiConnectionEvent } from '@/features/ai-tools/types';
import { useCampaignPerformanceStore } from '@/features/campaign-performance/stores';
import {
  type BusinessContext,
  type PortfolioAnalysis,
  type PortfolioSummary,
  usePortfolioStore,
} from '@/shared/portfolio';

// Dev mode
import { activateDevMode, DEV_MODE_CONFIG } from '../dev-mode';
import { mapAnalysisContext } from '../utils';
import { useToastStore } from './toast.store';

// App-level mediator for the dashboard page.
// It is allowed to compose feature stores so those features do not import each other.
export const useDashboardOrchestratorStore = defineStore('dashboardOrchestrator', () => {
  const aiConnection = useAiConnectionStore();
  const aiAnalysis = useAiAnalysisStore();
  const campaignPerformance = useCampaignPerformanceStore();
  const portfolioStore = usePortfolioStore();
  const toastStore = useToastStore();

  // DEV MODE
  // Configure local/demo behavior in app/dev-mode/config.ts.
  activateDevMode(DEV_MODE_CONFIG);

  // Page state derived from the composed features.
  const hasCampaigns = computed(() => campaignPerformance.campaigns.length > 0);
  const showAiButton = computed(() => !aiConnection.aiPanelOpen);
  const showConnectedDot = computed(() => aiConnection.isConnected && !aiConnection.aiPanelOpen);

  const aiPanelOpen = computed(() => aiConnection.aiPanelOpen);

  function openAiPanel(): void {
    aiConnection.openPanel();
    aiAnalysis.onPanelOpen();
  }

  function closeAiPanel(): void {
    aiConnection.closePanel();
    aiAnalysis.onPanelClose();
  }

  function onAnalysisContextChange(context: {
    portfolioId: string | null;
    portfolioTitle: string;
    selectedChannelIds: string[];
    channelCount: number;
    campaignCount: number;
    filtersActive: boolean;
    portfolioAnalysis: PortfolioAnalysis;
    portfolioBenchmark?: PortfolioSummary;
    businessContext: BusinessContext | null;
  }): void {
    if (!context.portfolioId || !context.businessContext) {
      aiAnalysis.setAnalysisContext(null);
      return;
    }

    aiAnalysis.setAnalysisContext({
      ...context,
      portfolioId: context.portfolioId,
      businessContext: context.businessContext,
    });
  }

  function onPortfolioEvicted(id: string | null): void {
    if (id) {
      aiAnalysis.clearCacheForPortfolio(id);
    }
  }

  function onConnectionEventChange(event: AiConnectionEvent | null): void {
    if (!event || aiConnection.aiPanelOpen) {
      return;
    }

    const providerLabel = PROVIDER_LABELS[event.provider];
    if (event.status === 'success') {
      toastStore.showSuccessToast(`Connected to ${providerLabel}`);
      return;
    }

    toastStore.showErrorToast(
      `Connection to ${providerLabel} failed`,
      'Reopen the panel for details',
    );
  }

  // Keep AI analysis feature-agnostic by pushing plain dashboard context into it.
  // Campaign performance owns filters; AI analysis owns request/cache behavior.
  watch(() => mapAnalysisContext(campaignPerformance), onAnalysisContextChange, {
    immediate: true,
  });

  // Portfolio data is shared app state; the orchestrator translates its lifecycle
  // into feature-specific cleanup so AI analysis does not read campaign data stores.
  watch(() => portfolioStore.lastEvictedId, onPortfolioEvicted);

  watch(() => aiConnection.lastConnectionEvent, onConnectionEventChange);

  return {
    hasCampaigns,
    aiPanelOpen,
    showAiButton,
    showConnectedDot,
    // actions
    openAiPanel,
    closeAiPanel,
  };
});
