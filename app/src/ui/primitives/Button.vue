<script setup lang="ts">
import { computed, ref, useAttrs } from "vue";
import type { ButtonSize, ButtonVariant } from "./button.types";

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    iconOnly?: boolean;
    noRing?: boolean;
  }>(),
  {
    variant: "primary",
    size: "default",
    iconOnly: false,
    noRing: false,
  },
);

const attrs = useAttrs();
const buttonRef = ref<HTMLButtonElement>();
const buttonClasses = computed(() => [
  props.variant,
  props.size,
  props.iconOnly ? "icon-only" : undefined,
  props.noRing ? "no-ring" : undefined,
]);
const buttonTitle = computed(() => {
  if (typeof attrs.title === "string") return attrs.title;
  const ariaLabel = attrs["aria-label"];
  return props.iconOnly && typeof ariaLabel === "string" ? ariaLabel : undefined;
});

function getRootEl(): HTMLButtonElement | undefined {
  return buttonRef.value;
}

defineExpose({
  getRootEl,
});
</script>

<template>
  <button
    ref="buttonRef"
    v-bind="$attrs"
    class="btn"
    :class="buttonClasses"
    :title="buttonTitle"
  >
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.btn {
  @apply cursor-pointer
    outline-none
    relative
    overflow-hidden
    inline-flex
    items-center
    justify-center
    whitespace-nowrap
    transition ease-in-out duration-150
    rounded-md
    opacity-85
    tracking-wide
    gap-1.5 px-2.5 py-3
    h-10 
    border border-transparent
    text-base font-medium leading-none text-center;

  &:deep(svg) {
    @apply text-xl;
  }

  &:disabled {
    @apply cursor-not-allowed opacity-50;
  }

  &:active {
    @apply opacity-75;
  }

  /* variant small */
  &.btn.small {
    @apply text-sm px-3 h-9 py-0 leading-4;
  }
}

/* variant icon-only */
.btn.icon-only {
  @apply p-0 size-10;
  &:deep(svg) {
    @apply text-2xl;
  }

  &.btn.small {
    @apply p-0 size-9;
    &:deep(svg) {
      @apply text-xl;
    }
  }
}

/* variant primary */
.btn.primary {
  @apply bg-primary-dark text-typography-strong;

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply bg-primary-light text-primary-ink;
    }

    &:not(.no-ring):focus-visible {
      @apply ring-2 ring-offset-1 ring-offset-background ring-primary-light;
    }
  }
}

/* variant outline */
.btn.outline {
  @apply text-primary-lighter/95 border border-primary-lighter;

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply bg-surface text-primary-light border-primary-light;
    }

    &:not(.no-ring):focus-visible {
      @apply ring-2 ring-offset-1 ring-offset-background ring-primary-light;
    }
  }
}

/* variant text-only */
.btn.text-only {
  @apply border-transparent text-primary-lighter/80;

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply bg-primary-light/[12%] text-primary-light;
    }

    &:not(.no-ring):focus-visible {
      @apply ring-2 ring-offset-1 ring-offset-background ring-primary-lighter;
    }
  }
}

/* variant info-text-only */
.btn.info-text-only {
  @apply text-typography-subtle
    border
    border-transparent
    bg-transparent;

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply bg-surface text-info;
    }

    &:not(.no-ring):focus-visible {
      @apply ring-2 ring-offset-1 ring-offset-background ring-info-dark;
    }
  }
}

/* variant ghost */
.btn.ghost {
  @apply border-transparent text-typography-muted;

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply bg-typography/10 text-typography;
    }

    &:not(.no-ring):focus-visible {
      @apply ring-2 ring-offset-1 ring-offset-background ring-typography-soft;
    }
  }
}

/* variant info-outline */
.btn.info-outline {
  @apply border-info-dark text-info bg-surface;

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply bg-info-dark text-info text-primary-ink;
    }

    &:not(.no-ring):focus-visible {
      @apply ring-2 ring-offset-1 ring-offset-background ring-info;
    }
  }
}

/* variant destructive */
.btn.destructive {
  @apply border-transparent text-typography-subtle font-normal;

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply bg-danger-darker/10 text-danger;
    }

    &:not(.no-ring):focus-visible {
      @apply ring-2 ring-danger/60 ring-offset-1 ring-offset-background;
    }
  }
}
</style>
