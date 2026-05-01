<script setup lang="ts">
import { Spinner, Notification } from "@/ui";
import type { AsyncStatus } from "@/shared/types";
import type { AiAnalysisError } from "../types";
import { ANALYSIS_ERROR_MESSAGES, TOKEN_LIMIT_MESSAGE } from "../utils";
import { computed } from "vue";

const props = defineProps<{
  status: AsyncStatus;
  error: AiAnalysisError | null;
  tokenLimitReached: boolean;
  hasResult: boolean;
}>();

const errorNotification = computed(() => {
  if (!props.error) return null;
  const entry =
    ANALYSIS_ERROR_MESSAGES[props.error.code] ??
    ANALYSIS_ERROR_MESSAGES.unknown;
  return {
    title:
      entry.title ??
      props.error.rawMessage ??
      ANALYSIS_ERROR_MESSAGES.unknown.title,
    message: entry.message ?? null,
  };
});
</script>

<template>
  <div v-if="status === 'loading'" class="loader">
    <Spinner class="xxl" />
    <p role="status" class="text-typography-muted tracking-wide">
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

    <slot v-if="status === 'idle' && !tokenLimitReached" name="state" />

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

    <slot v-else-if="hasResult" />
  </template>
</template>

<style lang="scss" scoped>
.loader {
  @apply flex flex-col items-center gap-4 p-8;
}

.message-title {
  @apply text-sm font-normal;
}
</style>
