<template>
  <span class="badge">
    <slot />
  </span>
</template>

<style lang="scss" scoped>
.badge {
  @apply relative
    rounded-full
    border
    flex-shrink-0
    inline-flex
    items-center
    justify-center
    capitalize
    whitespace-nowrap
    py-1
    px-2
    text-xs
    font-semibold
    leading-none
    text-primary-lighter
    overflow-hidden;

  &::before {
    content: "";
    @apply absolute inset-0 bg-background -z-[1];
  }

  &.success {
    @apply border-success/35 bg-success/10 text-success;
  }

  &.warning {
    @apply border-warning/35 bg-warning/10 text-warning;
  }

  &.danger {
    @apply border-danger-lighter/35 bg-danger-lighter/10 text-danger-light;
  }
  
  &.info {
    @apply border-info/35 bg-info/10 text-info-light;
  }

  &.opportunity {
    @apply border-primary-lighter/35 bg-primary-lighter/10 text-primary-lighter;
  }

  &.rounded-rectangle {
    @apply rounded-md;
  }

  &.text-only {
    @apply bg-transparent border-none;
    &::before {
      @apply hidden;
    }
  }

  &.lighter {
    &::before {
      @apply bg-transparent;
    }
  }
}
</style>
