<script setup lang="ts">
import { computed } from 'vue';

import type { AsyncStatus } from '@/shared/types';
import { Notification, Spinner } from '@/ui';

import type { AiAnalysisError } from '../types';
import { ANALYSIS_ERROR_MESSAGES, TOKEN_LIMIT_MESSAGE } from '../utils';

const props = defineProps<{
  status: AsyncStatus;
  error: AiAnalysisError | null;
  tokenLimitReached: boolean;
  hasResult: boolean;
}>();

const errorNotification = computed(() => {
  if (!props.error) {
    return null;
  }
  const entry = ANALYSIS_ERROR_MESSAGES[props.error.code] ?? ANALYSIS_ERROR_MESSAGES.unknown;
  return {
    title: entry.title ?? props.error.rawMessage ?? ANALYSIS_ERROR_MESSAGES.unknown.title,
    message: entry.message ?? null,
  };
});
</script>

<template>
  <div
    v-if="status === 'loading'"
    class="loader"
  >
    <Spinner size="xxl" />
    <p
      role="status"
      class="text-typography-muted tracking-wide"
    >
      <slot name="loading" />
    </p>
  </div>

  <template v-else>
    <Notification
      v-if="tokenLimitReached && status !== 'done'"
      variant="warning"
      :show-icon="false"
    >
      <template #title>
        <span class="message-title">{{ TOKEN_LIMIT_MESSAGE.title }}</span>
      </template>
      {{ TOKEN_LIMIT_MESSAGE.message }}
    </Notification>

    <div
      v-if="status === 'idle' && !tokenLimitReached"
      class="idle"
    >
      <slot name="idle" />
    </div>

    <Notification
      v-else-if="status === 'error' && error && !tokenLimitReached"
      variant="error"
      :show-icon="false"
    >
      <template #title>
        <span class="message-title">{{ errorNotification?.title }}</span>
      </template>
      {{ errorNotification?.message }}
    </Notification>

    <div
      v-else-if="hasResult"
      class="result"
    >
      <slot />
    </div>
  </template>
</template>

<style lang="scss" scoped>
.loader {
  @apply flex
  	flex-col
  	gap-4
  	items-center
  	pt-12;
}

.message-title {
  @apply font-normal
  	text-sm;
}

.idle {
  :deep(> p) {
    @apply leading-5
    	py-2
    	text-sm
    	text-typography-soft
    	tracking-wide;
  }
}

.result {
  @apply flex
  	flex-col
  	gap-8
  	grow;
}
</style>
