<template>
  <button v-bind="$attrs" class="btn">
    <span class="content-wrapper">
      <slot />
    </span>
  </button>
</template>

<style lang="scss" scoped>
.btn {
  @apply 
    cursor-pointer
    outline-none
    border-none
    rounded-md
    relative
    overflow-hidden
    p-0
    m-0;

  .content-wrapper {
    @apply relative
    z-[2]
    inline-flex
    items-center
    justify-center
    whitespace-nowrap
    text-sm
    font-medium
    leading-none
    text-center
    tracking-wide
    transition ease-in-out duration-150
    opacity-85
    gap-2 px-2.5 py-2;

    &:deep(svg) {
      @apply text-lg;
    }
  }

  &::after {
    content: '';
    @apply block
    w-full
    h-full
    absolute
    inset-0
    transition ease-in-out duration-300
  }

  &:disabled {
    @apply cursor-not-allowed opacity-70;

    &::after { 
      @apply hidden;
    }
  }

  &:not(:disabled):focus-visible,
  &:not(:disabled):hover {
     &::after { 
      @apply opacity-0;
    }
    .content-wrapper {
      @apply opacity-100;
    }
  }
  
  /* variant primary */
  &.primary {
    @apply bg-primary-dark text-typography-inverse;
 
    &:not(:disabled) {
      @apply bg-gradient-to-br
        from-primary-dark
        via-primary
        to-secondary;

      &::after {
        @apply bg-gradient-to-br from-accent from-5% via-info-light via-primary to-primary-dark;
      }

      &:focus-visible {
        @apply ring-2 ring-primary ring-offset-1	ring-offset-background;
      }

      &:active {
         &::after {
          @apply opacity-60;
        }

      }
    }
  }

  &.square {
    @apply h-9 w-9 min-h-9 min-w-9;
  }

}
</style>
