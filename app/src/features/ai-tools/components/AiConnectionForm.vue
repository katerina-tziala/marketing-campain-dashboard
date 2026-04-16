<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAiStore } from '../../../stores/aiStore'
import { Spinner } from '../../../ui'
import type { AiProvider, AiConnectionErrorCode } from '../types'
import { PROVIDER_LABELS } from '../types'

const store = useAiStore()

const selectedProvider = ref<AiProvider>('groq')
const apiKey = ref('')
const showKey = ref(false)
const showHelp = ref(false)

watch(selectedProvider, () => {
  store.connectionError = null
  apiKey.value = ''
  showKey.value = false
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
      <fieldset class="form-field">
        <legend class="form-field__label">Provider</legend>
        <div class="ai-conn__radios">
         <label class="block">
            <input
              type="radio"
              v-model="selectedProvider"
              value="groq"
              class="sr-only peer"
            />
            <span class="radio-text">Groq</span>
          </label>
            <label class="block">
            <input
              type="radio"
              v-model="selectedProvider"
              value="gemini"
              class="radio-input sr-only"
            />
            <span class="radio-text">Google Gemini</span>
          </label> 
        </div>
      </fieldset>

      <!-- API Key -->
      <div class="form-field">
        <div class="flex items-start justify-between">
          <label class="form-field__label" for="ai-key">API Key</label>
          <button type="button" class="btn-icon-secondary btn-small" @click="showHelp = !showHelp">
            {{ showHelp ? 'Hide instructions' : 'How to get your key?' }}
          </button>
        </div>
        <Transition name="help">
          <div v-if="showHelp" class="ai-conn__help-collapse">
            <div class="card-secondary bg-surface-secondary/50">
              <h5 class="card-secondary__title text-primary-300">
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
        <div class="ai-conn__key-wrap">
          <input
            id="ai-key"
            v-model="apiKey"
            :type="showKey ? 'text' : 'password'"
            class="form-control ai-conn__input"
            :class="{ 'form-control--error': store.connectionError, 
             }"
            placeholder="Paste your API key"
            autocomplete="off"
            spellcheck="false"
          />
          <button
            type="button"
            class="btn-icon-secondary btn-small ai-conn__toggle"
            :aria-label="showKey ? 'Hide key' : 'Show key'"
            @click="showKey = !showKey"
          >
            {{ showKey ? 'Hide' : 'Show' }}
          </button>
        </div>
        <div v-if="store.connectionError" class="form-field__error-container">
          <p class="form-field__error" role="alert">{{ errorMessage }}</p>
          <p v-if="errorHint" class="form-field__error-hint">{{ errorHint }}</p>
        </div>
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
 
  &__radios {
    @apply grid grid-rows-1 grid-cols-2 gap-0.5 rounded-md overflow-hidden bg-surface-secondary min-h-[2.625rem];
  }
  
  .radio-text {
    @apply w-full
      flex
      items-center
      justify-center
      h-full
      text-center
      cursor-pointer
      font-medium
      text-sm
      tracking-wider
      px-2
      py-2.5
      text-primary-400
      hover:bg-primary-500
      hover:text-white;
  }

    input[type='radio'] {
    &:checked + .radio-text {
      @apply bg-primary-600 text-white;
    }

    &:focus-visible + .radio-text {
      @apply bg-primary-500 text-white;
    }
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
 
  &__key-wrap {
    @apply relative flex items-center;
 
    &:hover > .form-control,
    &:focus-within > .form-control {
       @apply border-primary-500;  
    }
  }

  .ai-conn__input {
    @apply pr-20;
  }
 
  &__toggle {
    @apply absolute
      right-0
      w-16
      h-[2.625rem]
      border;

      &:not(:disabled) {
        &:focus-visible  {
          @apply border-transparent text-primary-400 bg-primary-500/20;
        }
     }
 
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
