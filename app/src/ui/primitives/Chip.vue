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
  @apply inline-block
    text-sm
    font-medium
    font-semibold
    tracking-wide
    outline-none
    shrink-0
    rounded-full
    border
    bg-surface
    bg-primary-ink
    text-typography-subtle;

  .chip-content {
    @apply inline-flex
      items-center
      gap-1.5
      rounded-full
      px-2
      py-1;
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
        ring-offset-1
        ring-offset-background
        ring-info;
    }
  }
}
</style>
