<script setup lang="ts">
import { ref } from "vue";

const buttonRef = ref<HTMLButtonElement>();

function getRootEl(): HTMLButtonElement | undefined {
  return buttonRef.value;
}

defineExpose({
  getRootEl,
});
</script>

<template>
  <button ref="buttonRef" v-bind="$attrs" class="btn">
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.btn {
  @apply cursor-pointer
    outline-none
    border-2
    relative
    overflow-hidden
    inline-flex
    items-center
    justify-center
    whitespace-nowrap
    transition ease-in-out duration-150
    rounded-md
    opacity-85
    text-sm font-medium leading-none text-center
    tracking-wide
    gap-1.5 px-2.5 py-3
    max-h-9;

  &:deep(svg) {
    @apply text-lg;
  }

  &:disabled {
    @apply cursor-not-allowed opacity-50;
  }
}

/* variant icon-only */
.btn.icon-only {
  @apply h-8 w-8 min-h-8 min-w-8 p-0;
}

/* variant small */
.btn.small {
  @apply text-xs px-2 py-1 leading-4;
}

/* variant medium */
.btn.medium {
  @apply px-2 py-1.5;
}

/* variant primary */
.btn.primary {
  @apply bg-primary-dark border-primary-dark text-typography-strong;

  &:not(:disabled) {
    &:hover {
      @apply border-primary-light bg-primary-light text-primary-ink;
    }

    &:focus-visible {
      @apply bg-primary-dark text-on-primary ring-2 ring-offset-1 ring-offset-background ring-primary;
    }

    &:active {
      @apply opacity-90;
    }
  }
}

/* variant text-only */
.btn.text-only {
  @apply border-transparent text-primary-lighter/95;

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply bg-primary-light/15 text-primary-lighter;
    }

    &:focus-visible {
      @apply ring-2 ring-offset-1 ring-offset-background ring-primary-lighter;
    }

    &:active {
      @apply text-primary-light;
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

    &:focus-visible {
      @apply ring-2 ring-offset-1 ring-offset-background ring-primary;
    }

    &:active {
      @apply text-primary-light;
    }
  }
}

/* variant info outline */
.btn.info-outline {
  @apply text-typography-subtle
    border
    bg-surface
    opacity-100
    tracking-normal;

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply bg-surface border-info/65 text-info-light;
    }

    &:focus-visible {
      @apply ring-2 ring-offset-1 ring-offset-background ring-info-dark;
    }
  }
}

/* variant ghost */
.btn.ghost {
  @apply border-transparent text-typography-soft;

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply bg-typography/10 text-typography;
    }

    &:focus-visible {
      @apply ring-2 ring-offset-1 ring-offset-background ring-typography-soft;
    }

    &:active {
      @apply opacity-70;
    }
  }
}

/* variant destructive */
.btn.destructive {
  @apply border-transparent text-typography-soft;

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply bg-danger-darker/10 text-danger;
    }

    &:focus-visible {
      @apply ring-2 ring-danger/60 ring-offset-1 ring-offset-background;
    }

    &:active {
      @apply text-danger/80;
    }
  }
}

.btn.paddingless {
  @apply p-0;
}
</style>
