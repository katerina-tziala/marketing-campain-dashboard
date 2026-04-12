import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AiProvider, AiConnectionError, AiModel } from '../features/ai-tools/types'
import { connectProvider } from '../features/ai-tools/ai-connection'

// TODO: DEV MOCK — revert before shipping.
// To revert: set DEV_MOCK_CONNECTED = false, then remove the MOCK_DEV_MODEL constant
// and the conditional initializers for provider, apiKey, isConnected, models, selectedModel.
const DEV_MOCK_CONNECTED = true

const MOCK_DEV_MODEL: AiModel = {
  id: 'gemini-2.0-flash',
  model: 'gemini-2.0-flash',
  display_name: 'Gemini 2.0 Flash',
  provider: 'gemini',
  strength: 'Fast and efficient for structured analysis tasks',
  strength_score: 8,
  reason: 'Best balance of speed and accuracy for marketing budget analysis',
  limitReached: false,
}

function isConnectionError(result: AiModel[] | AiConnectionError): result is AiConnectionError {
  return 'code' in result
}

function selectBestModel(models: AiModel[]): AiModel {
  console.log(models);

  return models.reduce((best, m) => m.strength_score > best.strength_score ? m : best)
}

export const useAiStore = defineStore('ai', () => {
  const provider = ref<AiProvider | null>(DEV_MOCK_CONNECTED ? 'gemini' : null)
  const apiKey = ref(DEV_MOCK_CONNECTED ? 'dev-mock-key' : '')
  const isConnected = ref(DEV_MOCK_CONNECTED)
  const isConnecting = ref(false)
  const connectionError = ref<AiConnectionError | null>(null)
  const models = ref<AiModel[]>(DEV_MOCK_CONNECTED ? [MOCK_DEV_MODEL] : [])
  const selectedModel = ref<AiModel | null>(DEV_MOCK_CONNECTED ? { ...MOCK_DEV_MODEL } : null)
  const aiPanelOpen = ref(false)

  async function connect(p: AiProvider, key: string): Promise<void> {
    isConnecting.value = true
    connectionError.value = null
    try {
      const result = await connectProvider(p, key)
      if (isConnectionError(result)) {
        connectionError.value = result
      } else {
        provider.value = p
        apiKey.value = key
        models.value = result
        selectedModel.value = selectBestModel(result)
        isConnected.value = true
      }
    } finally {
      isConnecting.value = false
    }
  }

  const selectedModelLimitReached = computed(() => selectedModel.value?.limitReached ?? false)

  const allModelsLimitReached = computed(() =>
    models.value.length > 0 && models.value.every((m) => m.limitReached),
  )

  function markModelLimitReached(modelId: string): void {
    const model = models.value.find((m) => m.model === modelId)
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
