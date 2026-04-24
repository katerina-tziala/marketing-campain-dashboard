<script setup lang="ts">
import { computed, type Component } from 'vue'
import type { NotificationVariant } from '../types/notification-variant'
import { AlertCircleIcon, AlertTriangleIcon, CheckCircleIcon, CloseIcon, InfoIcon } from '../icons'

const props = defineProps<{
  message: string
  variant: NotificationVariant
}>()

defineEmits<{
  dismiss: []
}>()

const ICON_MAP: Record<NotificationVariant, Component> = {
  success: CheckCircleIcon,
  error: AlertCircleIcon,
  warning: AlertTriangleIcon,
  info: InfoIcon,
}

const iconComponent = computed(() => ICON_MAP[props.variant])
</script>

<template>
  <div class="toast" :class="variant" role="alert" aria-live="assertive">
    <span class="toast-icon" aria-hidden="true">
      <component :is="iconComponent" />
    </span>
    <p class="toast-message">{{ message }}</p>
    <button class="btn-icon-tertiary-xs toast-close" aria-label="Dismiss notification" @click="$emit('dismiss')">
      <CloseIcon />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.toast {
  @apply flex
    items-start
    gap-3
    p-4
    rounded-md
    pointer-events-auto
    min-w-[17.5rem]
    max-w-[25rem]
    border
    // bg-surface-secondary
    shadow-lg;

  &.success {
    @apply border-success/50;
    .toast-icon { @apply text-success; }
  }

  &.error {
    @apply border-danger--5p/50;
    .toast-icon { @apply text-danger--5p; }
  }

  &.warning {
    @apply border-warning/50;
    .toast-icon { @apply text-warning; }
  }

  &.info {
    @apply border-primary-500/50;
    .toast-icon { @apply text-primary-400; }
  }
}

.toast-icon {
  @apply shrink-0 text-xl mt-px;
}

.toast-message {
  @apply flex-1 text-sm text-typography leading-relaxed m-0;
}

.toast-close {
  @apply shrink-0 -mt-0.5 -mr-0.5;
}
</style>
