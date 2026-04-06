<script setup lang="ts">
import { ref } from 'vue'
import { useAiStore, type AiProvider } from '../../../stores/aiStore'
import { BaseButton } from '../../../ui'

const store = useAiStore()

const selectedProvider = ref<AiProvider>('gemini')
const apiKey = ref('')
const showKey = ref(false)

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
      <div class="ai-conn__field">
        <label class="ai-conn__label" for="ai-provider">Provider</label>
        <select id="ai-provider" v-model="selectedProvider" class="ai-conn__select">
          <option value="gemini">Google Gemini</option>
          <option value="grok">Grok</option>
        </select>
      </div>

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

      <p v-if="store.connectionError" class="ai-conn__error" role="alert">
        {{ store.connectionError }}
      </p>

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

  &__select,
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

  &__select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right theme('spacing.3') center;
    padding-right: theme('spacing.8');

    option {
      background-color: #1e2435;
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
    font-size: theme('fontSize.xs');
    color: #f87171;
    margin: 0;
    padding: theme('spacing.2') theme('spacing.3');
    background-color: rgba(248, 113, 113, 0.08);
    border: 1px solid rgba(248, 113, 113, 0.2);
    border-radius: theme('borderRadius.md');
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
