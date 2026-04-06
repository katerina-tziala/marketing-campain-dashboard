import { defineStore } from 'pinia'
import { ref } from 'vue'

export type AiProvider = 'gemini' | 'grok'

export const PROVIDER_LABELS: Record<AiProvider, string> = {
  gemini: 'Google Gemini',
  grok: 'Grok',
}

async function testGemini(apiKey: string): Promise<void> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
  )
  if (!res.ok) {
    if (res.status === 400 || res.status === 403) throw new Error('Invalid API key.')
    throw new Error(`Connection failed (${res.status}).`)
  }
}

async function testGrok(apiKey: string): Promise<void> {
  const res = await fetch('https://api.x.ai/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) {
    if (res.status === 401) throw new Error('Invalid API key.')
    throw new Error(`Connection failed (${res.status}).`)
  }
}

export const useAiStore = defineStore('ai', () => {
  const provider = ref<AiProvider | null>(null)
  const apiKey = ref('')
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const connectionError = ref<string | null>(null)

  async function connect(p: AiProvider, key: string): Promise<void> {
    isConnecting.value = true
    connectionError.value = null
    try {
      if (p === 'gemini') await testGemini(key)
      else await testGrok(key)
      provider.value = p
      apiKey.value = key
      isConnected.value = true
    } catch (e) {
      connectionError.value =
        e instanceof Error ? e.message : 'Connection failed. Check your network.'
    } finally {
      isConnecting.value = false
    }
  }

  function disconnect(): void {
    provider.value = null
    apiKey.value = ''
    isConnected.value = false
    connectionError.value = null
  }

  return { provider, apiKey, isConnected, isConnecting, connectionError, connect, disconnect }
})
