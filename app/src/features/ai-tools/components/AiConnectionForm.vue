<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAiStore } from '../../../stores/aiStore'
import { BaseButton } from '../../../ui'
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
  'invalid-key': (p) => `Invalid API key for ${PROVIDER_LABELS[p]}.`,
  'network': () => 'Could not reach the server. Check your internet connection.',
  'timeout': () => 'Connection timed out. Check your network and try again.',
  'rate-limit': (p) => `${PROVIDER_LABELS[p]} rate limit reached. Please wait a moment and try again.`,
  'server-error': (p) => `${PROVIDER_LABELS[p]} is temporarily unavailable. Try again later.`,
  'no-models': (p) => `No suitable models found for ${PROVIDER_LABELS[p]}.`,
  'unknown': (p) => `Connection to ${PROVIDER_LABELS[p]} failed.`,
}

const ERROR_HINTS: Record<AiConnectionErrorCode, string> = {
  'invalid-key': 'Double-check that you copied the full key and that it has not been revoked.',
  'network': 'Make sure you are connected to the internet and try again.',
  'timeout': 'The server took too long to respond. Try again in a moment.',
  'rate-limit': 'You have made too many requests. Wait a minute before trying again.',
  'server-error': 'This is a problem on the provider\u2019s side, not yours. Try again later.',
  'no-models': 'The provider returned no models compatible with this application. Try a different provider.',
  'unknown': 'If this persists, try a different provider or check the provider\u2019s status page.',
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
</script>

<template>
  <div class="ai-conn">
    <p class="ai-conn__intro">
      Connect your AI API key to enable Budget Optimizer and Executive Summary features.
    </p>

    <form class="ai-conn__form" @submit.prevent="handleConnect">
      <!-- Provider -->
      <fieldset class="form-field ai-conn__fieldset">
        <legend class="form-field__label">Provider</legend>
        <div class="ai-conn__radios">
          <label class="ai-conn__radio" :class="{ 'ai-conn__radio--active': selectedProvider === 'groq' }">
            <input type="radio" v-model="selectedProvider" value="groq" class="ai-conn__radio-input" />
            Groq
          </label>
          <label class="ai-conn__radio" :class="{ 'ai-conn__radio--active': selectedProvider === 'gemini' }">
            <input type="radio" v-model="selectedProvider" value="gemini" class="ai-conn__radio-input" />
            Google Gemini
          </label>
        </div>
      </fieldset>

      <!-- API Key -->
      <div class="form-field">
        <div class="ai-conn__key-header">
          <label class="form-field__label" for="ai-key">API Key</label>
          <button type="button" class="ai-conn__help-toggle" @click="showHelp = !showHelp">
            {{ showHelp ? 'Hide instructions' : 'How to get your key?' }}
          </button>
        </div>
        <Transition name="help">
          <div v-if="showHelp" class="ai-conn__help-collapse">
            <div class="ai-conn__help">
              <template v-if="selectedProvider === 'groq'">
                <p class="ai-conn__help-title">How to get your Groq API key</p>
                <ol class="ai-conn__help-steps">
                  <li>Go to the <strong>Groq Console</strong> and sign in.</li>
                  <li>Open <strong>API Keys</strong> from the left sidebar.</li>
                  <li>Click <strong>Create API Key</strong> and give it a name.</li>
                  <li>Copy the key and paste it into the field below.</li>
                </ol>
                <p class="ai-conn__help-note">Some models may require your organization admin to accept additional terms before use.</p>
              </template>
              <template v-else>
                <p class="ai-conn__help-title">How to get your Gemini API key</p>
                <ol class="ai-conn__help-steps">
                  <li>Go to <strong>Google AI Studio</strong> and sign in.</li>
                  <li>Open <strong>API Keys</strong> from the left sidebar.</li>
                  <li>Click <strong>Create API key</strong>.</li>
                  <li>Copy the key and paste it into the field below.</li>
                </ol>
              </template>
              <p class="ai-conn__help-note">Keep your API key private — never share it publicly.</p>
            </div>
          </div>
        </Transition>
        <div class="ai-conn__key-wrap">
          <input
            id="ai-key"
            v-model="apiKey"
            :type="showKey ? 'text' : 'password'"
            class="ai-conn__input form-control"
            :class="{ 'form-control--error': store.connectionError }"
            placeholder="Paste your API key"
            autocomplete="off"
            spellcheck="false"
          />
          <button
            type="button"
            class="ai-conn__toggle"
            :aria-label="showKey ? 'Hide key' : 'Show key'"
            @click="showKey = !showKey"
          >
            {{ showKey ? 'Hide' : 'Show' }}
          </button>
        </div>
        <template v-if="store.connectionError">
          <p class="form-field__error" role="alert">{{ errorMessage }}</p>
          <p v-if="errorHint" class="ai-conn__error-hint">{{ errorHint }}</p>
        </template>
      </div>

      <BaseButton
        type="submit"
        class="ai-conn__submit"
        :disabled="!apiKey.trim() || store.isConnecting"
      >
        <span v-if="store.isConnecting" class="ai-conn__spinner" aria-hidden="true" />
        {{ store.isConnecting ? 'Connecting…' : 'Connect' }}
      </BaseButton>
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
    font-size: theme('fontSize.sm');
    color: var(--color-text);
    line-height: 1.55;
    margin: 0;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: theme('spacing.4');
  }

  &__fieldset {
    border: none;
    padding: 0;
    margin: 0;
  }

  &__radios {
    display: flex;
    gap: theme('spacing.2');
  }

  &__radio {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: theme('spacing[2.5]') theme('spacing.3');
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: theme('borderRadius.md');
    cursor: pointer;
    font-size: theme('fontSize.sm');
    font-weight: 500;
    color: var(--color-text);
    transition: border-color 150ms ease, background-color 150ms ease, color 150ms ease;

    &:hover:not(.ai-conn__radio--active) {
      border-color: color-mix(in srgb, theme('colors.primary.500') 50%, transparent);
      color: var(--color-text);
    }

    &--active {
      background-color: theme('colors.primary.500');
      border-color: theme('colors.primary.500');
      color: white;
    }
  }

  &__radio-input {
    display: none;
  }

  &__input {
    padding: theme('spacing[2.5]') theme('spacing.16') theme('spacing[2.5]') theme('spacing.3');
  }

  &__key-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__help-toggle {
    background: none;
    border: none;
    cursor: pointer;
    font-size: theme('fontSize.xs');
    font-weight: 500;
    color: theme('colors.primary.400');
    padding: 0;
    line-height: 1;

    &:hover {
      color: theme('colors.primary.300');
    }
  }

  &__help-collapse {
    display: grid;
    grid-template-rows: 1fr;
    overflow: hidden;
  }

  &__help {
    background-color: color-mix(in srgb, var(--color-surface) 80%, transparent);
    border: 1px solid var(--color-border);
    border-radius: theme('borderRadius.md');
    padding: theme('spacing.3') theme('spacing.4');
    display: flex;
    flex-direction: column;
    gap: theme('spacing.2');
    min-height: 0;
    overflow: hidden;
  }

  &__help-title {
    font-size: theme('fontSize.xs');
    font-weight: 600;
    color: var(--color-title);
    margin: 0;
  }

  &__help-steps {
    font-size: theme('fontSize.xs');
    color: var(--color-text);
    margin: 0;
    padding-left: theme('spacing.4');
    line-height: 1.6;
    list-style-type: decimal;

    li + li {
      margin-top: theme('spacing.1');
    }

    strong {
      font-weight: 600;
    }
  }

  &__help-note {
    font-size: theme('fontSize.xs');
    color: var(--color-text-secondary);
    margin: theme('spacing.1') 0 0;
    line-height: 1.4;
  }

  &__key-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__toggle {
    position: absolute;
    right: theme('spacing.3');
    background: none;
    border: none;
    cursor: pointer;
    font-size: theme('fontSize.xs');
    font-weight: 500;
    color: theme('colors.primary.400');
    padding: 0;

    &:hover {
      color: theme('colors.primary.300');
    }
  }

  &__error-hint {
    font-size: theme('fontSize.xs');
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.4;
  }

  &__submit {
    width: 100%;
    justify-content: center;
  }

  &__spinner {
    display: inline-block;
    width: 0.875rem;
    height: 0.875rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }
}

.help-enter-active,
.help-leave-active {
  transition: grid-template-rows 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 250ms ease;
}

.help-enter-from,
.help-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
