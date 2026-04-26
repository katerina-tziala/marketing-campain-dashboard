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
    inline-flex
    items-center
    justify-start
    capitalize
    gap-y-1
    py-1
    px-2
    text-xs
    font-semibold
    text-center
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
}

.badge.rounded-rectangle-sm {
  @apply rounded-sm;
}

.badge.text-only {
  @apply bg-transparent border-none;
  &::before {
    @apply hidden;
  }
}

.badge.dimmed {
  &.success {
    @apply border-success-dark/30 bg-success-dark/10 text-success-dark/90;
  }

  &.warning {
    @apply border-warning-dark/30 bg-warning-dark/10 text-warning-dark/90;
  }

  &.danger {
    @apply border-danger-lighter/30 bg-danger-lighter/10 text-danger-light/90;
  }

  &.info {
    @apply border-info-dark/30 bg-info-dark/10 text-info/90;
  }

  &.opportunity {
    @apply border-primary-light/30 bg-primary-light/10 text-primary-light/90;
  }
}
</style>
