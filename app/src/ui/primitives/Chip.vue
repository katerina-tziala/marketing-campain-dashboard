<script setup lang="ts">
defineProps<{
  active?: boolean;
  readonly?: boolean;
}>();
</script>

<template>
  <button
    type="button"
    class="chip"
    :class="{ readonly }"
    :aria-pressed="active"
  >
    <span class="chip-content">
      <slot />
    </span>
  </button>
</template>

<style lang="scss" scoped>
.chip {
  @apply bg-primary-ink
    bg-surface
    border
    font-medium
    font-semibold
    inline-block
    outline-none
    rounded-full
    shrink-0
    text-sm
    text-typography-subtle
    tracking-wide;

  .chip-content {
    @apply gap-1.5
      inline-flex
      items-center
      px-2
      py-1
      rounded-full;
  }

  &[aria-pressed='true'] {
    @apply border-info-darker;

    > .chip-content {
      @apply bg-info-dark/10
        text-info/90;
    }
  }

  &.readonly {
    @apply cursor-default
      pointer-events-none;
  }

  &:not(.readonly) {
    &:hover,
    &:focus-visible {
      @apply bg-surface
        border-info;

      > .chip-content {
        @apply bg-transparent
          text-info-light;
      }
    }

    &:focus-visible {
      @apply ring-2
        ring-info
        ring-offset-1
        ring-offset-background;
    }
  }
}
</style>
