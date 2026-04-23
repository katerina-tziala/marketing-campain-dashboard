import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AiProviderType, AiConnectionError, AiErrorCode } from '../features/ai-tools/types'
import type { AiModel } from '../features/ai-tools/providers/types'
import { connectProvider } from '../features/ai-tools/providers'
import { normalizeConnectionError } from '../features/ai-tools/providers/utils'

const ERROR_CODES = new Set<AiErrorCode>([
  'invalid-key', 'network', 'timeout', 'rate-limit', 'token-limit', 'server-error', 'no-models', 'invalid-response', 'unknown',
])

function selectBestModel(models: AiModel[]): AiModel {
  return models.reduce((best, m) => m.strengthScore > best.strengthScore ? m : best)
}

export const useAiStore = defineStore('ai', () => {
  const provider = ref<AiProviderType | null>(null)
  const apiKey = ref('')
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const connectionError = ref<AiConnectionError | null>(null)
  const models = ref<AiModel[]>([])
  const selectedModel = ref<AiModel | null>(null)
  const aiPanelOpen = ref(false)

  async function connect(p: AiProviderType, key: string): Promise<void> {
    isConnecting.value = true
    connectionError.value = null
    try {
      const result = await connectProvider(p, key)
      provider.value = p
      apiKey.value = key
      models.value = result
      selectedModel.value = selectBestModel(result)
      isConnected.value = true
    } catch (error) {
      const normalized = normalizeConnectionError(error)
      const code = ERROR_CODES.has(normalized.message as AiErrorCode)
        ? (normalized.message as AiErrorCode)
        : 'unknown'
      connectionError.value = { code, provider: p }
    } finally {
      isConnecting.value = false
    }
  }

  const selectedModelLimitReached = computed(() => selectedModel.value?.limitReached ?? false)

  const allModelsLimitReached = computed(() =>
    models.value.length > 0 && models.value.every((m) => m.limitReached),
  )

  function markModelLimitReached(modelId: string): void {
    const model = models.value.find((m) => m.id === modelId)
    if (model) model.limitReached = true
  }

  function selectNextAvailableModel(): boolean {
    const next = models.value.find((m) => !m.limitReached)
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
    provider, apiKey, isConnected, isConnecting, connectionError, models, selectedModel,
    selectedModelLimitReached, allModelsLimitReached,
    aiPanelOpen, connect, disconnect, markModelLimitReached, selectNextAvailableModel, openPanel, closePanel,
  }
})
