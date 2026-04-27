<template>
  <button v-bind="$attrs" class="btn">
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.btn {
  @apply cursor-pointer
    outline-none
    border-2
    border-transparent
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
    gap-2 px-2.5 py-3
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

/* variant primary */
.btn.primary {
  @apply bg-primary-dark text-typography-strong;

  &:not(:disabled) {
    &:hover {
      @apply bg-primary-light text-primary-ink;
    }

    &:focus-visible {
      @apply bg-primary-dark text-on-primary ring-2 ring-offset-1 ring-offset-background ring-primary-dark;
    }

    &:active {
      @apply opacity-90;
    }
  }
}

/* variant text-only */
.btn.text-only {
  @apply text-primary-lighter/95;

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply bg-primary-light/15 text-primary-lighter;
    }

    &:not(.no-ring):focus-visible {
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

/* variant destructive */
.btn.destructive {
  @apply text-typography-soft;

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply bg-danger-darker/10 text-danger;
    }

    &:focus-visible {
      @apply ring-2 ring-danger-dark ring-offset-1 ring-offset-background;
    }

    &:active {
      @apply text-danger/80;
    }
  }
}
</style>
