<template>
  <button v-bind="$attrs" class="btn">
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.btn {
  @apply cursor-pointer
    outline-none
    border-none
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

  &:deep(*) {
    @apply z-10;
  }

  &::after {
    content: "";
    @apply block
      w-full
      h-full
      absolute
      inset-0
      -z-[1]
      transition ease-in-out duration-300;
  }

  &:disabled {
    @apply cursor-not-allowed opacity-50;

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
}

/* variant square */
.btn.icon-only {
  @apply h-8 w-8 min-h-8 min-w-8 p-0;

  &:deep(svg) {
    @apply text-lg;
  }
}

/* variant small */
.btn.small {
  @apply text-xs px-2 py-1 leading-4;
}

.btn.primary {
  @apply bg-primary-dark text-typography-strong;
  &::after {
    @apply hidden;
  }

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
  @apply transition-none text-primary-lighter/95;

  &::after {
    @apply -z-[1] transition-none bg-background opacity-0;
  }

  &::after {
    @apply opacity-0;
  }

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply bg-background text-primary-lighter;

      &::after {
        @apply opacity-25 bg-primary-light;
      }
    }

    &:not(.no-ring):focus-visible {
      @apply ring-2 ring-offset-1 ring-offset-background ring-primary-lighter;
    }

    &:active {
      @apply text-primary-light;
    }
  }
}

/* variant destructive */
.btn.destructive {
  @apply transition-none text-typography-soft;

  &::after {
    @apply -z-[1] transition-none bg-background opacity-0;
  }

  &::after {
    @apply opacity-0;
  }

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply bg-background text-danger;

      &::after {
        @apply opacity-25 bg-danger;
      }
    }

    &:focus-visible {
      @apply ring-2 ring-danger-dark ring-offset-1 ring-offset-background;
    }

    &:active {
      @apply text-danger/80;
    }
  }
}



// /* variant primary */
// .btn.primary {
//   @apply bg-primary-dark text-typography-strong;

//   &:not(:disabled) {
//     @apply bg-gradient-to-br
//         from-primary-dark from-5%
//         via-primary
//         to-secondary;

//     &::after {
//       @apply bg-gradient-to-br from-accent via-info-dark to-primary;
//     }

//     &:focus-visible {
//       @apply ring-2 ring-primary ring-offset-1 ring-offset-background;
//     }

//     &:active {
//       @apply text-typography-strong/80;
//       &::after {
//         @apply opacity-90;
//       }
//     }
//   }
// }

</style>
