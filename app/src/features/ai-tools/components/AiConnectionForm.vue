<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAiStore } from '../../../stores/aiStore'
import { BaseButton } from '../../../ui'
import type { AiProvider, AiConnectionErrorCode } from '../types'
import { PROVIDER_LABELS } from '../types'

const store = useAiStore()

const selectedProvider = ref<AiProvider>('gemini')
const apiKey = ref('')
const showKey = ref(false)

const ERROR_MESSAGES: Record<AiConnectionErrorCode, (provider: AiProvider) => string> = {
  'invalid-key': (p) => `Invalid API key for ${PROVIDER_LABELS[p]}.`,
  'network': () => 'Could not reach the server. Check your internet connection.',
  'timeout': () => 'Connection timed out. Check your network and try again.',
  'rate-limit': (p) => `${PROVIDER_LABELS[p]} rate limit reached. Please wait a moment and try again.`,
  'server-error': (p) => `${PROVIDER_LABELS[p]} is temporarily unavailable. Try again later.`,
  'unknown': (p) => `Connection to ${PROVIDER_LABELS[p]} failed.`,
}

const ERROR_HINTS: Record<AiConnectionErrorCode, string> = {
  'invalid-key': 'Double-check that you copied the full key and that it has not been revoked.',
  'network': 'Make sure you are connected to the internet and try again.',
  'timeout': 'The server took too long to respond. Try again in a moment.',
  'rate-limit': 'You have made too many requests. Wait a minute before trying again.',
  'server-error': 'This is a problem on the provider\u2019s side, not yours. Try again later.',
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
      <fieldset class="ai-conn__field ai-conn__fieldset">
        <legend class="ai-conn__label">Provider</legend>
        <div class="ai-conn__radios">
          <label class="ai-conn__radio" :class="{ 'ai-conn__radio--active': selectedProvider === 'gemini' }">
            <input type="radio" v-model="selectedProvider" value="gemini" class="ai-conn__radio-input" />
            <span class="ai-conn__radio-label">Google Gemini</span>
          </label>
          <label class="ai-conn__radio" :class="{ 'ai-conn__radio--active': selectedProvider === 'groq' }">
            <input type="radio" v-model="selectedProvider" value="groq" class="ai-conn__radio-input" />
            <span class="ai-conn__radio-label">Groq</span>
          </label>
        </div>
      </fieldset>

      <div class="ai-conn__field">
        <label class="ai-conn__label" for="ai-key">API Key</label>
        <div class="ai-conn__key-wrap">
          <input
            id="ai-key"
            v-model="apiKey"
            :type="showKey ? 'text' : 'password'"
            class="ai-conn__input"
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
      </div>

      <div v-if="store.connectionError" class="ai-conn__error" role="alert">
        <p class="ai-conn__error-message">{{ errorMessage }}</p>
        <p v-if="errorHint" class="ai-conn__error-hint">{{ errorHint }}</p>
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
    color: #cbd5e1;
    line-height: 1.55;
    margin: 0;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: theme('spacing.4');
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: theme('spacing[1.5]');
  }

  &__label {
    font-size: theme('fontSize.xs');
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #cbd5e1;
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
    gap: theme('spacing[1.5]');
    padding: theme('spacing[1.5]') theme('spacing.3');
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: theme('borderRadius.md');
    cursor: pointer;
    transition: border-color 150ms ease, background-color 150ms ease;

    &:hover {
      border-color: rgba(99, 102, 241, 0.4);
    }

    &--active {
      border-color: #6366f1;
      background-color: rgba(99, 102, 241, 0.08);
    }
  }

  &__radio-input {
    appearance: none;
    width: 0.875rem;
    height: 0.875rem;
    border: 2px solid var(--color-border);
    border-radius: 50%;
    flex-shrink: 0;
    position: relative;
    transition: border-color 150ms ease;

    &:checked {
      border-color: #6366f1;

      &::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 0.375rem;
        height: 0.375rem;
        border-radius: 50%;
        background-color: #6366f1;
      }
    }
  }

  &__radio-label {
    font-size: theme('fontSize.sm');
    color: var(--color-title);
    font-weight: 500;
  }

  &__input {
    width: 100%;
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: theme('borderRadius.md');
    color: var(--color-title);
    font-size: theme('fontSize.sm');
    padding: theme('spacing[1.5]') theme('spacing.3');
    outline: none;
    transition: border-color 150ms ease;

    &:focus {
      border-color: #6366f1;
    }
  }

  &__key-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__input {
    padding-right: theme('spacing.16');
  }

  &__toggle {
    position: absolute;
    right: theme('spacing.3');
    background: none;
    border: none;
    cursor: pointer;
    font-size: theme('fontSize.xs');
    font-weight: 500;
    color: #818cf8;
    padding: 0;

    &:hover {
      color: #a5b4fc;
    }
  }

  &__error {
    margin: 0;
    padding: theme('spacing.2') theme('spacing.3');
    background-color: rgba(248, 113, 113, 0.08);
    border: 1px solid rgba(248, 113, 113, 0.2);
    border-radius: theme('borderRadius.md');
    display: flex;
    flex-direction: column;
    gap: theme('spacing.1');
  }

  &__error-message {
    font-size: theme('fontSize.xs');
    color: #f87171;
    margin: 0;
    font-weight: 500;
  }

  &__error-hint {
    font-size: theme('fontSize.xs');
    color: #94a3b8;
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

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
