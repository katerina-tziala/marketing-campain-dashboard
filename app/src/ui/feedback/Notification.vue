<script setup lang="ts">
import { type Component, computed } from 'vue';

import { AlertTriangleIcon, BellIcon, CheckCircleIcon, InfoIcon, XPolygonIcon } from '../icons';
import type { NotificationSurface, NotificationVariant } from './notification.types';

const props = withDefaults(
  defineProps<{
    variant?: NotificationVariant;
    surface?: NotificationSurface;
    showIcon?: boolean;
  }>(),
  {
    variant: undefined,
    surface: 'default',
    showIcon: true,
  },
);

const ICON_MAP: Record<NotificationVariant, Component> = {
  success: CheckCircleIcon,
  error: XPolygonIcon,
  warning: AlertTriangleIcon,
  info: InfoIcon,
};

const iconComponent = computed(() => (props.variant ? ICON_MAP[props.variant] : BellIcon));

const ariaRole = computed(() => {
  if (props.variant === 'error') {
    return 'alert';
  }
  if (props.variant === 'success' || props.variant === 'warning' || props.variant === 'info') {
    return 'status';
  }
  return undefined;
});

const ariaLive = computed(() => {
  if (props.variant === 'error') {
    return 'assertive';
  }
  if (props.variant === 'success' || props.variant === 'warning' || props.variant === 'info') {
    return 'polite';
  }
  return undefined;
});
</script>

<template>
  <div
    class="notification"
    :class="[variant, props.surface]"
    :role="ariaRole"
    :aria-live="ariaLive"
  >
    <div class="notification-body">
      <div
        v-if="$slots.title || $slots.action"
        class="notification-head"
        :class="{ 'has-action': $slots.action }"
      >
        <span
          v-if="showIcon"
          class="notification-icon"
          aria-hidden="true"
        >
          <component :is="iconComponent" />
        </span>
        <h5
          v-if="$slots.title"
          class="notification-title"
        >
          <slot name="title" />
        </h5>
        <div
          v-if="$slots.action"
          class="notification-action"
        >
          <slot name="action" />
        </div>
      </div>
      <p class="text-sm text-typography-muted">
        <slot />
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.notification {
  @apply rounded-md;

  .notification-body {
    @apply bg-primary/10
      border
      border-primary/25
      p-3
      rounded-md;

    .notification-icon,
    .notification-title {
      @apply text-primary-light;
    }
  }

  &.success {
    .notification-body {
      @apply bg-success/10
        border-success/25;

      .notification-icon,
      .notification-title {
        @apply text-success-light;
      }
    }
  }

  &.error {
    .notification-body {
      @apply bg-danger/10
        border-danger/25;

      .notification-icon,
      .notification-title {
        @apply text-danger-light;
      }
    }
  }

  &.warning {
    .notification-body {
      @apply bg-warning/10
        border-warning/25;

      .notification-icon,
      .notification-title {
        @apply text-warning-light;
      }
    }
  }

  &.info {
    .notification-body {
      @apply bg-info/10
        border-info/25;

      .notification-icon,
      .notification-title {
        @apply text-info-light;
      }
    }
  }
}

.notification-body {
  @apply flex
    flex-1
    flex-col
    gap-0.5;
}

.notification-icon {
  @apply leading-none
    shrink-0
    text-lg
    text-typography-subtle;
}

.notification-head {
  @apply flex
    gap-2
    items-start
    justify-start;
}

.notification-title {
  @apply font-medium
    grow
    leading-5
    text-base
    tracking-wide;
}

.notification-action {
  @apply shrink-0;
}

.notification-head.has-action {
  .notification-icon,
  .notification-title {
    @apply pt-2;
  }
}

.notification.dense {
  @apply bg-surface-backdrop;
}
</style>
