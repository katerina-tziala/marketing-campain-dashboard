<script setup lang="ts">
defineProps<{
  active?: boolean;
  readonly?: boolean;
  count?: number;
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
      <span v-if="count !== undefined" class="chip-count">{{ count }}</span>
    </span>
  </button>
</template>

<style lang="scss" scoped>
.chip {
  @apply inline-block
    text-sm
    font-medium
    transition-colors
    outline-none
    shrink-0
    rounded-full
    border
    bg-surface
    text-typography-subtle;

  .chip-content {
    @apply inline-flex items-center gap-1.5 rounded-full px-2 py-1;
  }

  .chip-count {
    @apply inline-flex items-center justify-center
      rounded-full px-1.5 min-w-[1.25rem] h-5
      text-xs font-medium bg-on-primary/10;
  }

  &[aria-pressed="true"] {
    @apply bg-background border-info/65;
    > .chip-content {
      @apply bg-info/15 text-info-light;
    }
    .chip-count {
      @apply bg-background/80;
    }
  }

  &.readonly {
    @apply cursor-default pointer-events-none;
  }

  &:not(.readonly) {
    &:hover,
    &:focus-visible {
      @apply bg-surface border-info/65;
      > .chip-content {
        @apply text-info-light;
      }
    }

    &:focus-visible {
      @apply ring-2 ring-offset-1 ring-offset-background ring-info-dark;
    }
  }
}
</style>
