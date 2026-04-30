<script setup lang="ts">
import { computed, type Component } from "vue";
import type { NotificationVariant } from "./notification.types";
import {
  AlertTriangleIcon,
  BellIcon,
  CheckCircleIcon,
  InfoIcon,
  XPolygonIcon,
} from "@/ui/icons";

const props = withDefaults(
  defineProps<{
    variant?: NotificationVariant;
    showIcon?: boolean;
  }>(),
  {
    showIcon: true,
  },
);

const ICON_MAP: Record<NotificationVariant, Component> = {
  success: CheckCircleIcon,
  error: XPolygonIcon,
  warning: AlertTriangleIcon,
  info: InfoIcon,
};

const iconComponent = computed(() =>
  props.variant ? ICON_MAP[props.variant] : BellIcon,
);

const ariaRole = computed(() => {
  if (props.variant === "error") return "alert";
  if (
    props.variant === "success" ||
    props.variant === "warning" ||
    props.variant === "info"
  )
    return "status";
  return undefined;
});

const ariaLive = computed(() => {
  if (props.variant === "error") return "assertive";
  if (
    props.variant === "success" ||
    props.variant === "warning" ||
    props.variant === "info"
  )
    return "polite";
  return undefined;
});
</script>

<template>
  <div
    class="notification"
    :class="variant"
    :role="ariaRole"
    :aria-live="ariaLive"
  >
    <div class="notification-body">
      <div v-if="$slots.title || $slots.action" class="notification-head">
        <span v-if="showIcon" class="notification-icon" aria-hidden="true">
          <component :is="iconComponent" />
        </span>
        <h5 v-if="$slots.title" class="notification-title">
          <slot name="title" />
        </h5>
        <div v-if="$slots.action" class="notification-action">
          <slot name="action" />
        </div>
      </div>
      <p class="text-sm text-typography-muted" :class="{ 'pl-1': showIcon }">
        <slot />
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.notification {
  @apply rounded-md;

  .notification-body {
    @apply p-3 rounded-md border bg-primary/10 border-primary/25;

    .notification-icon,
    .notification-title {
      @apply text-primary-light;
    }
  }

  &.success {
    .notification-body {
      @apply bg-success/10 border-success/25;

      .notification-icon,
      .notification-title {
        @apply text-success-light;
      }
    }
  }

  &.error {
    .notification-body {
      @apply bg-danger/10 border-danger/25;

      .notification-icon,
      .notification-title {
        @apply text-danger-light;
      }
    }
  }

  &.warning {
    .notification-body {
      @apply bg-warning/10 border-warning/25;

      .notification-icon,
      .notification-title {
        @apply text-warning-light;
      }
    }
  }

  &.info {
    .notification-body {
      @apply bg-info/10 border-info/25;

      .notification-icon,
      .notification-title {
        @apply text-info-light;
      }
    }
  }
}

.notification-body {
  @apply flex-1 flex flex-col gap-0.5;
}

.notification-icon {
  @apply leading-none shrink-0 text-lg text-typography-subtle;
}

.notification-head {
  @apply flex items-center justify-between gap-2;
}

.notification-title {
  @apply leading-5 tracking-wide text-base font-medium;
}

.notification-action {
  @apply shrink-0;
}

/* variant darket bg */
.notification.dense-bg {
  @apply bg-surface-backdrop;
}
</style>
