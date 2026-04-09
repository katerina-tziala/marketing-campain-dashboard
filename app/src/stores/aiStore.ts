import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AiProvider, AiConnectionError, GeminiModel, GroqModel } from '../features/ai-tools/types'
import { connectProvider } from '../features/ai-tools/ai-connection'

function isConnectionError(result: GeminiModel[] | GroqModel[] | AiConnectionError): result is AiConnectionError {
  return 'code' in result
}

export const useAiStore = defineStore('ai', () => {
  const provider = ref<AiProvider | null>(null)
  const apiKey = ref('')
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const connectionError = ref<AiConnectionError | null>(null)
  const models = ref<GeminiModel[] | GroqModel[]>([])

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
        isConnected.value = true
      }
    } finally {
      isConnecting.value = false
    }
  }

  function disconnect(): void {
    provider.value = null
    apiKey.value = ''
    isConnected.value = false
    connectionError.value = null
    models.value = []
  }

  return { provider, apiKey, isConnected, isConnecting, connectionError, models, connect, disconnect }
})
