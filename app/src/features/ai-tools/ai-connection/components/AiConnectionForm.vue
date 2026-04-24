<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAiConnectionStore } from '../stores'
import { Spinner, PasswordInput, RadioToggle } from '../../../../ui'
import type { AiProviderType } from '../../types'
import { PROVIDER_OPTIONS, PROVIDER_HELP } from '../../providers/providers-meta'
import { ERROR_MESSAGES, ERROR_HINTS } from '../utils'

const store = useAiConnectionStore()

const selectedProvider = ref<AiProviderType>('groq')
const apiKey = ref('')
const showHelp = ref(false)

watch(selectedProvider, () => {
  store.connectionError = null
  apiKey.value = ''
})

const providerHelp = computed(() => PROVIDER_HELP[selectedProvider.value])

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
</script>

<template>
  <div class="conn-form">
    <p class="conn-intro">
      Connect your AI API key to enable Executive Summary and Budget Optimizer features.
    </p>
    <form class="form" @submit.prevent="handleConnect">
      <!-- Provider -->
      <fieldset class="field conn-fieldset">
        <legend class="field-label">Provider</legend>
        <RadioToggle v-model="selectedProvider" :options="PROVIDER_OPTIONS" name="ai-provider" :disabled="store.isConnecting"/>
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
          <div v-if="showHelp" class="help-collapse">
            <div class="card-secondary bg-surface-secondary/50">
              <h5 class="card-title text-primary-300">
                {{ providerHelp.title }}
              </h5>
              <ol class="help-steps">
                <li
                  v-for="step in providerHelp.steps"
                  :key="step"
                >
                  {{ step }}
                </li>
              </ol>
              <p v-if="providerHelp.note" class="help-note">
                {{ providerHelp.note }}
              </p>
              <p class="help-note">Keep your API key private and never share it publicly.</p>
            </div>
          </div>
        </Transition>
        <PasswordInput id="ai-key" v-model="apiKey" placeholder="Paste your API key" :disabled="store.isConnecting">
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
.conn-form {
  @apply p-6 flex flex-col gap-5;
}

.conn-intro {
  @apply text-sm text-typography leading-6;
}

.conn-fieldset {
  @apply pt-3.5;
}

.help-steps {
  @apply text-sm text-typography list-inside list-decimal leading-6;
}

.help-note {
  @apply text-sm text-typography leading-5;
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
</style>
