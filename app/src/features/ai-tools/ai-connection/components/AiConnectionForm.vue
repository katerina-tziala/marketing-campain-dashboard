<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import {
  Button,
  Form,
  FormControl,
  PasswordInput,
  PlugIcon,
  RadioToggle,
  Spinner,
  validateRequired,
} from '@/ui';

import { PROVIDER_HELP, PROVIDER_OPTIONS } from '../../providers/utils';
import type { AiProviderType } from '../../types';
import { useAiConnectionStore } from '../stores';
import { CONNECTION_ERRORS } from '../utils/error-handling';
import AiConnectionInstructions from './AiConnectionInstructions.vue';

const props = defineProps<{
  resetKey?: number;
}>();

const store = useAiConnectionStore();
const defaultProvider: AiProviderType = 'gemini';

const selectedProvider = ref<AiProviderType>(defaultProvider);
const apiKey = ref('');
const apiKeyError = ref('');

watch(selectedProvider, () => {
  store.clearConnectionError();
  apiKeyError.value = '';
  apiKey.value = '';
});

watch(
  () => props.resetKey,
  () => {
    selectedProvider.value = defaultProvider;
    apiKey.value = '';
    apiKeyError.value = '';
    store.clearConnectionError();
  },
);

const providerHelp = computed(() => PROVIDER_HELP[selectedProvider.value]);

const connectionErrorDisplay = computed(() => {
  if (apiKeyError.value) {
    return {
      message: apiKeyError.value,
      hint: 'Paste your API key before connecting',
    };
  }

  if (!store.connectionError) {
    return null;
  }
  const { message, hint } = CONNECTION_ERRORS[store.connectionError.code];
  return { message: message(store.connectionError.provider), hint };
});

async function handleConnect(): Promise<void> {
  apiKeyError.value = validateRequired(apiKey.value).errorKey ? 'API key is required' : '';
  if (apiKeyError.value) {
    return;
  }

  await store.connect(selectedProvider.value, apiKey.value.trim());
}

function handleApiKeyUpdate(value: string): void {
  store.clearConnectionError();
  apiKeyError.value = '';
  apiKey.value = value;
}

function handleApiKeyBlur(): void {
  apiKeyError.value = validateRequired(apiKey.value).errorKey ? 'API key is required' : '';
}
</script>

<template>
  <div class="conn-form">
    <div class="scrollbar-on-surface conn-form-content">
      <p class="conn-intro">
        Connect your AI API key to enable Executive Summary and Budget Optimization features
      </p>
      <Form @submit.prevent="handleConnect">
        <!-- Provider -->
        <FormControl
          id="ai-provider"
          as="fieldset"
          label="Provider"
          class="conn-fieldset"
        >
          <RadioToggle
            v-model="selectedProvider"
            :options="PROVIDER_OPTIONS"
            name="ai-provider"
            :disabled="store.isConnecting"
          />
        </FormControl>
        <!-- API Key -->
        <FormControl
          id="ai-key"
          label="API Key"
          required
          :error-text="connectionErrorDisplay?.message"
          :error-hint-text="connectionErrorDisplay?.hint"
        >
          <template #default="{ id, invalid, describedBy }">
            <PasswordInput
              :id="id"
              :model-value="apiKey"
              placeholder="Paste your API key"
              :disabled="store.isConnecting"
              :invalid="invalid"
              :described-by="describedBy"
              @update:model-value="handleApiKeyUpdate"
              @blur="handleApiKeyBlur"
            />
          </template>
        </FormControl>
        <!-- Connect -->
        <Button
          variant="primary"
          type="submit"
          :disabled="store.isConnecting"
        >
          <Spinner
            v-if="store.isConnecting"
            size="sm"
            tone="inverse"
          />
          <PlugIcon v-else />
          {{ store.isConnecting ? 'Connecting…' : 'Connect' }}
        </Button>
        <!-- Instructions -->
        <AiConnectionInstructions :instructions="providerHelp" />
      </Form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.conn-form {
  @apply h-full
  	min-h-[50vh]
  	overflow-hidden
  	pb-2
  	pt-4
  	px-0
  	w-full;
}

.conn-form-content {
  @apply flex
  	flex-col
  	gap-6
  	h-full
  	mx-auto
  	overflow-auto
  	pl-6
  	pr-6
  	w-full;
}

.conn-intro {
  @apply leading-5
  	text-sm
  	text-typography-muted;
}

.conn-fieldset {
  @apply pt-3;
}
</style>
