<script setup lang="ts">
import { computed } from "vue";
import { Spinner, Notification } from "@/ui";
import type { AsyncStatus } from "@/shared/types/async-status";
import type {
  AiAnalysisError,
  AiAnalysisNotice,
} from "@/features/ai-tools/types";
import {
  ANALYSIS_ERROR_MESSAGES,
  ANALYSIS_NOTICE_MESSAGES,
  TOKEN_LIMIT_MESSAGE,
} from "@/features/ai-tools/ai-analysis/utils/analysis-messages";

const props = defineProps<{
  status: AsyncStatus;
  error: AiAnalysisError | null;
  notice: AiAnalysisNotice | null;
  tokenLimitReached: boolean;
  hasResult: boolean;
  cacheTimestamp: string | number | null;
  modelName?: string;
}>();

const formattedCacheTime = computed(() => {
  if (!props.cacheTimestamp) return null;
  return new Date(props.cacheTimestamp).toLocaleTimeString("en-IE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
});

const errorNotification = computed(() => {
  if (!props.error) return null;
  const entry = ANALYSIS_ERROR_MESSAGES[props.error.code] ?? ANALYSIS_ERROR_MESSAGES.unknown;
  return {
    title: entry.title ?? props.error.rawMessage ?? ANALYSIS_ERROR_MESSAGES.unknown.title,
    message: entry.message ?? null,
  };
});

const noticeEntry = computed(() =>
  props.notice ? ANALYSIS_NOTICE_MESSAGES[props.notice.code] : null,
);
</script>

<template>
  <!-- Loading always takes exclusive priority -->
  <div v-if="status === 'loading'" class="loader">
    <Spinner class="xxl" />
    <p role="status" class="loader-text">
      <slot name="loading" />
    </p>
  </div>

  <template v-else>
    <!-- Token limit notice -->
    <Notification
      v-if="tokenLimitReached && status !== 'done'"
      variant="warning"
      class="mt-6"
      :show-icon="false"
    >
      <template #title>
        <span class="message-title">{{ TOKEN_LIMIT_MESSAGE.title }}</span>
      </template>
      {{ TOKEN_LIMIT_MESSAGE.message }}
    </Notification>

    <!-- Idle — projected content from parent -->
    <div v-if="status === 'idle' && !tokenLimitReached" class="idle-text">
      <slot name="idle" />
    </div>

    <!-- Error (no cached result) -->
    <Notification
      v-else-if="status === 'error' && error && !tokenLimitReached"
      variant="error"
      class="mt-6"
      :show-icon="false"
    >
      <template #title>
        <span class="message-title">{{ errorNotification?.title }}</span>
      </template>
      {{ errorNotification?.message }}
    </Notification>

    <!-- Result -->
    <div v-else-if="hasResult" class="result">
      <div class="response-meta">
        <p
          v-if="formattedCacheTime"
          class="italic text-typography-subtle"
          role="status"
        >
          Generated at {{ formattedCacheTime
          }}<template v-if="modelName"> with {{ modelName }}</template>
          <span class="block italic text-typography-subtle"
            >AI can make mistakes</span
          >
        </p>
        <p v-if="noticeEntry" class="text-typography-subtle" role="status">
          <span class="font-medium">{{ noticeEntry.title }}</span>
          {{ noticeEntry.message }}
        </p>
      </div>
      <slot />
    </div>
  </template>
</template>

<style lang="scss" scoped>
.idle-text {
  @apply text-typography text-sm py-2 leading-5;
}

.loader {
  @apply flex flex-col items-center gap-4 p-8;
}

.message-title {
  @apply text-sm font-normal;
}
</style>
