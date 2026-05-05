import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';

import type { CampaignPerformance, Channel } from '@/shared/data';
import {
  type BusinessContext,
  computePortfolioAnalysis,
  type PortfolioSummary,
  usePortfolioStore,
} from '@/shared/portfolio';

export const useCampaignPerformanceStore = defineStore('campaignPerformance', () => {
  const portfolioStore = usePortfolioStore();

  // ── State ─────────────────────────────────────────────────────────────

  const activePortfolioId = ref<string | null>(null);
  const selectedChannelsIds = ref<string[]>([]);

  // ── Derived from active portfolio ─────────────────────────────────────

  const portfolioChannels = computed<Map<string, Channel>>(
    () => portfolioStore.getById(activePortfolioId.value ?? '')?.channelMap ?? new Map(),
  );

  const title = computed<string>(
    () => portfolioStore.getById(activePortfolioId.value ?? '')?.name ?? '',
  );

  const businessContext = computed<BusinessContext | null>(() => {
    const portfolio = portfolioStore.getById(activePortfolioId.value ?? '');
    if (!portfolio) {
      return null;
    }

    return {
      period: portfolio.period,
      industry: portfolio.industry,
    };
  });

  // ── Getters ───────────────────────────────────────────────────────────

  const allChannels = computed<Channel[]>(() => [...portfolioChannels.value.values()]);

  const campaigns = computed<CampaignPerformance[]>(() =>
    allChannels.value.flatMap((channel) => channel.campaigns),
  );

  function getChannelsByIds(ids: string[]): Channel[] {
    return ids.flatMap((id) => {
      const channel = portfolioChannels.value.get(id);
      return channel ? [channel] : [];
    });
  }

  function getSelectedChannels(): Channel[] {
    return selectedChannelsIds.value.length === 0
      ? [...portfolioChannels.value.values()]
      : getChannelsByIds(selectedChannelsIds.value);
  }

  const selectedChannels = computed<Channel[]>(() => getSelectedChannels());

  const filteredCampaigns = computed<CampaignPerformance[]>(() =>
    selectedChannels.value.flatMap((channel) => channel.campaigns),
  );

  const portfolioAnalysis = computed(() => {
    const portfolio = portfolioStore.getById(activePortfolioId.value ?? '');
    if (!portfolio) {
      return computePortfolioAnalysis([]);
    }
    if (selectedChannelsIds.value.length === 0) {
      return portfolio.analysis;
    }
    return computePortfolioAnalysis(selectedChannels.value);
  });

  const portfolioBenchmark = computed<PortfolioSummary | null>(() => {
    const portfolio = portfolioStore.getById(activePortfolioId.value ?? '');
    return portfolio?.analysis.portfolio ?? null;
  });

  // ── Actions ───────────────────────────────────────────────────────────

  function setChannelFilter(ids: string[]): void {
    selectedChannelsIds.value = ids;
  }

  function onPendingSelection(id: string | null): void {
    if (id) {
      activePortfolioId.value = id;
      selectedChannelsIds.value = [];
    }
  }

  function onPortfolioEvicted(id: string | null): void {
    if (id && activePortfolioId.value === id) {
      activePortfolioId.value = null;
      selectedChannelsIds.value = [];
    }
  }

  // ── Watchers ──────────────────────────────────────────────────────────

  watch(() => portfolioStore.pendingSelectionId, onPendingSelection, { immediate: true });

  watch(() => portfolioStore.lastEvictedId, onPortfolioEvicted);

  return {
    title,
    businessContext,
    activePortfolioId,
    portfolioChannels,
    allChannels,
    campaigns,
    selectedChannels,
    selectedChannelsIds,
    filteredCampaigns,
    portfolioAnalysis,
    portfolioBenchmark,
    // actions
    setChannelFilter,
  };
});
