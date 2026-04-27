import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import type { AiProviderType, AiConnectionError } from '@/features/ai-tools/types'
import { getErrorCode } from '@/features/ai-tools/ai-connection/utils/error-handling'
import { type AiModel, connectProvider, getAllModelsLimitReached, getModelById, getNextAvailableMode } from '@/features/ai-tools/providers'
import { PROVIDER_LABELS } from '@/features/ai-tools/providers/utils/providers-meta'
import { useToastStore } from '@/stores/toast.store'

// [DEV ONLY] — cleared by setDevConnectOverride(null) on deactivate
type DevConnectFn = (provider: AiProviderType) => Promise<AiModel[]>
let _devConnectOverride: DevConnectFn | null = null
export function setDevConnectOverride(fn: DevConnectFn | null): void {
  _devConnectOverride = fn
}

export const useAiConnectionStore = defineStore('aiConnection', () => {
  const provider = ref<AiProviderType | null>(null)
  const apiKey = ref('')
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const connectionError = ref<AiConnectionError | null>(null)
  const models = ref<AiModel[]>([])
  const selectedModel = ref<AiModel | null>(null)
  const aiPanelOpen = ref(false)

  async function connect(providerType: AiProviderType, APIkey: string): Promise<void> {
    const toastStore = useToastStore()
    isConnecting.value = true
    connectionError.value = null
    try {
      const providerModels = _devConnectOverride
        ? await _devConnectOverride(providerType)
        : await connectProvider(providerType, APIkey)
      provider.value = providerType
      apiKey.value = APIkey
      models.value = providerModels
      selectedModel.value = providerModels[0]
      isConnected.value = true
      if (!aiPanelOpen.value) {
        toastStore.showSuccessToast(`Connected to ${PROVIDER_LABELS[providerType]}`)
      }
    } catch (error) {
      const code = getErrorCode(error)
      connectionError.value = { code, provider: providerType }
      if (!aiPanelOpen.value) {
        toastStore.showErrorToast(`Connection to ${PROVIDER_LABELS[providerType]} failed. Reopen the panel for details.`)
      }
    } finally {
      isConnecting.value = false
    }
  }

  const selectedModelLimitReached = computed(() => selectedModel.value?.limitReached ?? false)

  const allModelsLimitReached = computed(() =>
    getAllModelsLimitReached(models.value),
  )

  const evaluationDisabled = computed(() =>
    !aiPanelOpen.value || !provider.value || !apiKey.value || !selectedModel.value || allModelsLimitReached.value,
  )

  function markModelLimitReached(modelId: string): void {
    const model = getModelById(models.value, modelId)
    if (model) model.limitReached = true
  }

  function selectNextAvailableModel(): boolean {
    const next = getNextAvailableMode(models.value)
    if (!next) return false
    selectedModel.value = next
    return true
  }

  function disconnect(): void {
    provider.value = null
    apiKey.value = ''
    isConnected.value = false
    connectionError.value = null
    models.value = []
    selectedModel.value = null
  }

  function openPanel(): void {
    aiPanelOpen.value = true
  }

  function closePanel(): void {
    aiPanelOpen.value = false
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
    evaluationDisabled,
    // actions
    connect,
    disconnect,
    markModelLimitReached,
    selectNextAvailableModel,
    openPanel,
    closePanel,
  }
})
