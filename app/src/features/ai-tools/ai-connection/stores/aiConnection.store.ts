import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import {
  type AiModel,
  connectProvider,
  getAllModelsLimitReached,
  getModelById,
  getNextAvailableMode,
} from '../../providers';
import type { AiConnectionError, AiConnectionEvent, AiProviderType } from '../../types';
import { getErrorCode } from '../utils/error-handling';

type ConnectProviderOverride = (provider: AiProviderType) => Promise<AiModel[]>;
let _connectProviderOverride: ConnectProviderOverride | null = null;

// App-level extension point used by dev-mode to replace external provider calls.
// Feature code should not call this directly.
export function setConnectProviderOverride(fn: ConnectProviderOverride | null): void {
  _connectProviderOverride = fn;
}

export const useAiConnectionStore = defineStore('aiConnection', () => {
  const provider = ref<AiProviderType | null>(null);
  const apiKey = ref('');
  const isConnected = ref(false);
  const isConnecting = ref(false);
  const connectionError = ref<AiConnectionError | null>(null);
  const models = ref<AiModel[]>([]);
  const selectedModel = ref<AiModel | null>(null);
  const aiPanelOpen = ref(false);
  const lastConnectionEvent = ref<AiConnectionEvent | null>(null);

  function handleConnectionError(error: unknown, providerType: AiProviderType): void {
    const code = getErrorCode(error);
    connectionError.value = { code, provider: providerType };
    lastConnectionEvent.value = {
      id: Date.now(),
      status: 'error',
      provider: providerType,
    };
  }

  function setProviderModels(
    providerType: AiProviderType,
    apiKeyValue: string,
    providerModels: AiModel[],
  ): void {
    provider.value = providerType;
    apiKey.value = apiKeyValue;
    models.value = providerModels;
    selectedModel.value = providerModels[0];
    isConnected.value = true;
    lastConnectionEvent.value = {
      id: Date.now(),
      status: 'success',
      provider: providerType,
    };
  }

  async function connect(providerType: AiProviderType, APIkey: string): Promise<void> {
    isConnecting.value = true;
    connectionError.value = null;
    try {
      const providerModels = _connectProviderOverride
        ? await _connectProviderOverride(providerType)
        : await connectProvider(providerType, APIkey);
      setProviderModels(providerType, APIkey, providerModels);
    } catch (error) {
      handleConnectionError(error, providerType);
    } finally {
      isConnecting.value = false;
    }
  }

  const selectedModelLimitReached = computed(() => selectedModel.value?.limitReached ?? false);

  const allModelsLimitReached = computed(() => getAllModelsLimitReached(models.value));

  const evaluationDisabled = computed(
    () =>
      !aiPanelOpen.value ||
      !provider.value ||
      !apiKey.value ||
      !selectedModel.value ||
      allModelsLimitReached.value,
  );

  function markModelLimitReached(modelId: string): void {
    const model = getModelById(models.value, modelId);
    if (model) {
      model.limitReached = true;
    }
  }

  function selectNextAvailableModel(): boolean {
    const next = getNextAvailableMode(models.value);
    if (!next) {
      return false;
    }
    selectedModel.value = next;
    return true;
  }

  function disconnect(): void {
    provider.value = null;
    apiKey.value = '';
    isConnected.value = false;
    connectionError.value = null;
    models.value = [];
    selectedModel.value = null;
  }

  function openPanel(): void {
    aiPanelOpen.value = true;
  }

  function closePanel(): void {
    aiPanelOpen.value = false;
  }

  return {
    provider,
    apiKey,
    isConnected,
    isConnecting,
    connectionError,
    models,
    selectedModel,
    selectedModelLimitReached,
    allModelsLimitReached,
    aiPanelOpen,
    lastConnectionEvent,
    evaluationDisabled,
    // actions
    connect,
    disconnect,
    markModelLimitReached,
    selectNextAvailableModel,
    openPanel,
    closePanel,
  };
});
