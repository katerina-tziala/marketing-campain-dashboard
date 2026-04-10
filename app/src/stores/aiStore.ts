import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AiProvider, AiConnectionError, AiModel } from '../features/ai-tools/types'
import { connectProvider } from '../features/ai-tools/ai-connection'

function isConnectionError(result: AiModel[] | AiConnectionError): result is AiConnectionError {
  return 'code' in result
}

function selectBestModel(models: AiModel[]): AiModel {
  console.log(models);
  
  return models.reduce((best, m) => m.strength_score > best.strength_score ? m : best)
}

export const useAiStore = defineStore('ai', () => {
  const provider = ref<AiProvider | null>(null)
  const apiKey = ref('')
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const connectionError = ref<AiConnectionError | null>(null)
  const models = ref<AiModel[]>([])
  const selectedModel = ref<AiModel | null>(null)
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
    aiPanelOpen, connect, disconnect, markModelLimitReached, openPanel, closePanel,
  }
})
