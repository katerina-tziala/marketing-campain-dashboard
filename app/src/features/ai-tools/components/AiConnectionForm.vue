<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAiStore } from '../../../stores/aiStore'
import { Spinner, PasswordInput, RadioToggle } from '../../../ui'
import type { AiProvider, AiConnectionErrorCode } from '../types'
import { PROVIDER_LABELS } from '../types'

const store = useAiStore()

const selectedProvider = ref<AiProvider>('groq')
const apiKey = ref('')
const showHelp = ref(false)

watch(selectedProvider, () => {
  store.connectionError = null
  apiKey.value = ''
})

const ERROR_MESSAGES: Record<AiConnectionErrorCode, (provider: AiProvider) => string> = {
  'invalid-key': (p) => `Invalid API key for ${PROVIDER_LABELS[p]}`,
  'network': () => 'Could not reach the server. Check your internet connection.',
  'timeout': () => 'Connection timed out. Check your network and try again.',
  'rate-limit': (p) => `${PROVIDER_LABELS[p]} rate limit reached. Please wait a moment and try again.`,
  'server-error': (p) => `${PROVIDER_LABELS[p]} is temporarily unavailable. Try again later.`,
  'no-models': (p) => `No suitable models found for ${PROVIDER_LABELS[p]}.`,
  'unknown': (p) => `Connection to ${PROVIDER_LABELS[p]} failed`,
}

const ERROR_HINTS: Record<AiConnectionErrorCode, string> = {
  'invalid-key': 'Double-check that you copied the full key and that it has not been revoked',
  'network': 'Make sure you are connected to the internet and try again',
  'timeout': 'The server took too long to respond. Try again in a moment.',
  'rate-limit': 'You have made too many requests. Wait a minute before trying again.',
  'server-error': 'This is a problem on the provider\u2019s side, not yours. Try again later.',
  'no-models': 'The provider returned no models compatible with this application. Try a different provider.',
  'unknown': 'If this persists, try a different provider or check the provider\u2019s status page',
}

const errorMessage = computed(() =>
  store.connectionError
    ? ERROR_MESSAGES[store.connectionError.code](store.connectionError.provider)
    : null,
)

const errorHint = computed(() =>
  store.connectionError ? ERROR_HINTS[store.connectionError.code] : null,
)

const providerOptions = [
  { value: 'groq', label: PROVIDER_LABELS.groq },
  { value: 'gemini', label: PROVIDER_LABELS.gemini },
]

async function handleConnect(): Promise<void> {
  if (!apiKey.value.trim()) return
  await store.connect(selectedProvider.value, apiKey.value.trim())
}

const providerHelp: Record<string, { title: string; steps: string[]; note?: string }> = {
  groq: {
    title: "How to get your Groq API key",
    steps: [
      "Go to the Groq Console and sign in with your account.",
      "Open API Keys from the left sidebar.",
      "Click Create API Key.",
      "Copy the key and paste it into the field below."
    ],
    note: "Some models may require your organization admin to accept additional terms before use."
  },

  gemini: {
    title: "How to get your Gemini API key",
    steps: [
      "Go to Google AI Studio and sign in with your account.",
      "Open API Keys from the left sidebar.",
      "Click Create API key.",
      "Copy the key and paste it into the field below."
    ]
  }
};
</script>

<template>
  <div class="ai-conn">
    <p class="ai-conn__intro">
      Connect your AI API key to enable Executive Summary and Budget Optimizer features.
    </p>
    <form class="form" @submit.prevent="handleConnect">
      <!-- Provider -->
      <fieldset class="field">
        <legend class="field-label">Provider</legend>
        <RadioToggle v-model="selectedProvider" :options="providerOptions" name="ai-provider" />
      </fieldset>

      <!-- API Key -->
      <div class="field">
        <div class="flex items-center justify-between">
          <label class="field-label" for="ai-key">API Key</label>
          <button type="button" class="btn-icon-secondary btn-small" @click="showHelp = !showHelp">
            {{ showHelp ? 'Hide instructions' : 'How to get your key?' }}
          </button>
        </div>
        <Transition name="help">
          <div v-if="showHelp" class="ai-conn__help-collapse">
            <div class="card-secondary bg-surface-secondary/50">
              <h5 class="card-title text-primary-300">
                {{ providerHelp[selectedProvider].title }}
              </h5>
              <ol class="ai-conn__help-steps">
                <li
                  v-for="step in providerHelp[selectedProvider].steps"
                  :key="step"
                >
                  {{ step }}
                </li>
              </ol>
              <p  v-if="providerHelp[selectedProvider].note" class="ai-conn__help-note" >
                {{ providerHelp[selectedProvider].note }}
              </p> 
              <p class="ai-conn__help-note">Keep your API key private and never share it publicly.</p>
            </div>
          </div>
        </Transition>
        <PasswordInput id="ai-key" v-model="apiKey" placeholder="Paste your API key">
          <template v-if="store.connectionError" #error>
            <p class="field-error" role="alert">{{ errorMessage }}</p>
            <p v-if="errorHint" class="field-error-hint">{{ errorHint }}</p>
          </template>
        </PasswordInput>
      </div>
      <button class="btn-primary" type="submit" :disabled="!apiKey.trim() || store.isConnecting">
        <Spinner v-if="store.isConnecting" size="sm" variant="secondary" />
        {{ store.isConnecting ? 'Connecting…' : 'Connect' }}
      </button>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.ai-conn {
  padding: theme('spacing.6');
  display: flex;
  flex-direction: column;
  gap: theme('spacing.5');

  &__intro {
    @apply text-sm text-typography leading-6;
  }

 fieldset {
    @apply pt-3.5;
  }
 
  &__help-steps {
    @apply text-sm
      text-typography
      list-inside
      list-decimal
      leading-6; 
  }

  &__help-note {
     @apply text-sm
      text-typography
      leading-5; 
  }
 
  .help-enter-active,
  .help-leave-active {
    @apply transition-all duration-300 ease-in-out overflow-hidden;
  }

  .help-enter-from,
  .help-leave-to {
    @apply opacity-0 max-h-0;
  }

  .help-enter-to,
  .help-leave-from {
    @apply opacity-100 max-h-96;
  }
}
 

</style>
