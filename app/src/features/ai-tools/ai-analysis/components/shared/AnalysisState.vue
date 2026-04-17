<script setup lang="ts">
import { computed } from 'vue'
import { Spinner } from '../../../../../ui'
import { SparklesIcon } from '../../../../../ui/icons'
import type { AiAnalysisStatus, AiAnalysisError } from '../../../types'

const props = defineProps<{
  title: string
  actionLabel: string
  idleText: string
  loadingText: string
  status: AiAnalysisStatus
  error: AiAnalysisError | null
  errorFallback: string | null
  tokenLimitReached: boolean
  isButtonDisabled: boolean
  hasResult: boolean
  cacheTimestamp: string | number | null
  modelName?: string
}>()

const emit = defineEmits<{ analyze: [] }>()

const formattedCacheTime = computed(() => {
  if (!props.cacheTimestamp) return null
  return new Date(props.cacheTimestamp).toLocaleTimeString('en-IE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
})
</script>

<template>
  <div class="ai-panel">
    <!-- Header -->
    <div class="panel-head">
      <h3 class="panel-title">{{ title }}</h3>
      <button class="btn-primary" :disabled="isButtonDisabled" @click="emit('analyze')">
        <SparklesIcon />
        {{ actionLabel }}
      </button>
    </div>

    <!-- Token limit notice -->
    <div v-if="tokenLimitReached && status !== 'done'" class="notice" role="status">
      <p class="notice-text">AI generation is temporarily unavailable due to usage limits.</p>
      <p class="notice-hint">Previously generated results are still available.</p>
    </div>

    <!-- Idle -->
    <p v-if="status === 'idle' && !tokenLimitReached" class="idle-text">{{ idleText }}</p>

    <!-- Loading -->
    <div v-else-if="status === 'loading'" class="loader">
      <Spinner size="xxl" />
      <p class="loader-text">{{ loadingText }}</p>
    </div>

    <!-- Error (no cached result) -->
    <div v-else-if="status === 'error' && error" class="error-box" role="alert">
      <p class="error-message">{{ error.message }}</p>
      <p class="error-hint">Click "{{ actionLabel }}" to try again.</p>
    </div>

    <!-- Result -->
    <div v-else-if="hasResult" class="result">
      <div class="response-meta">
        <p v-if="formattedCacheTime" class="response-meta-text" role="status">
          Generated at {{ formattedCacheTime }}<template v-if="modelName"> with {{ modelName }}</template>
        </p>
        <p class="response-meta-disclaimer">AI can make mistakes</p>
        <p v-if="errorFallback" class="response-meta-fallback" role="status">{{ errorFallback }}</p>
      </div>
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.panel-head {
  @apply flex items-center justify-center gap-3;
}

.panel-title {
  @apply grow m-0 font-bold text-base text-primary-400;
}

.idle-text {
  @apply text-typography-intense text-sm py-2 leading-5;
}

.loader {
  @apply flex flex-col items-center gap-4 p-8;
}

.loader-text,
.notice-hint,
.error-hint {
  @apply text-typography text-sm;
}

.notice {
  @apply flex
    flex-col
    gap-1.5
    text-center
    p-4
    rounded-lg
    bg-warning/10
    border
    border-warning/15;
}

.notice-text {
  @apply text-warning font-medium text-sm;
}

.error-box {
  @apply flex
    flex-col
    gap-1.5
    text-center
    p-4
    rounded-lg
    bg-danger/10
    border
    border-danger/15;
}

.error-message {
  @apply text-danger font-medium text-sm;
}

.result {
  @apply flex flex-col gap-6 pb-4;
}

.response-meta {
  @apply flex flex-col gap-1 text-xs text-typography;
}

.response-meta-text,
.response-meta-disclaimer {
  @apply italic;
}

.response-meta-fallback {
  @apply text-warning font-medium;
}
</style>
