<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useAiConnectionStore } from "@/features/ai-tools/ai-connection/stores/aiConnection.store";
import { Spinner, PasswordInput, RadioToggle, Button } from "@/ui";
import type { AiProviderType } from "@/features/ai-tools/types";
import {
  PROVIDER_OPTIONS,
  PROVIDER_HELP,
} from "@/features/ai-tools/providers/utils/providers-meta";
import {
  ERROR_MESSAGES,
  ERROR_HINTS,
} from "@/features/ai-tools/ai-connection/utils/error-handling";
import AiConnectionInstructions from "./AiConnectionInstructions.vue";

const store = useAiConnectionStore();

const selectedProvider = ref<AiProviderType>("groq");
const apiKey = ref("");

watch(selectedProvider, () => {
  store.connectionError = null;
  apiKey.value = "";
});

const providerHelp = computed(() => PROVIDER_HELP[selectedProvider.value]);

const errorMessage = computed(() =>
  store.connectionError
    ? ERROR_MESSAGES[store.connectionError.code](store.connectionError.provider)
    : null,
);

const errorHint = computed(() =>
  store.connectionError ? ERROR_HINTS[store.connectionError.code] : null,
);

async function handleConnect(): Promise<void> {
  if (!apiKey.value.trim()) return;
  await store.connect(selectedProvider.value, apiKey.value.trim());
}
</script>

<template>
  <div class="conn-form">
    <p class="conn-intro">
      Connect your AI API key to enable Executive Summary and Budget Optimizer
      features
    </p>
    <form class="form" @submit.prevent="handleConnect">
      <!-- Provider -->
      <fieldset class="field conn-fieldset">
        <legend class="field-label">Provider</legend>
        <RadioToggle
          v-model="selectedProvider"
          :options="PROVIDER_OPTIONS"
          name="ai-provider"
          :disabled="store.isConnecting"
        />
      </fieldset>
      <!-- API Key -->
      <div class="field">
        <label class="field-label" for="ai-key">API Key</label>
        <PasswordInput
          id="ai-key"
          v-model="apiKey"
          placeholder="Paste your API key"
          :disabled="store.isConnecting"
        >
          <template v-if="store.connectionError" #error>
            <p class="field-error" role="alert">{{ errorMessage }}</p>
            <p v-if="errorHint" class="field-error-hint">{{ errorHint }}</p>
          </template>
        </PasswordInput>
      </div>
      <!-- Connect -->
      <Button
        class="primary max-h-9"
        type="submit"
        :disabled="!apiKey.trim() || store.isConnecting"
      >
        <Spinner class="sm inverse" v-if="store.isConnecting" />
        {{ store.isConnecting ? "Connecting…" : "Connect" }}
      </Button>
      <!-- Instructions -->
      <AiConnectionInstructions :instructions="providerHelp" />
    </form>
  </div>
</template>

<style lang="scss" scoped>
.conn-form {
  @apply p-6 flex flex-col gap-5;
}

.conn-intro {
  @apply text-sm text-typography-soft leading-5;
}

.conn-fieldset {
  @apply pt-3;
}
</style>
