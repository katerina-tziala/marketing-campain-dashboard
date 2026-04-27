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
    text-sm font-medium leading-none text-center tracking-wide
    gap-2 px-2.5 py-2;

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

/* variant primary */
.btn.primary {
  @apply bg-primary-dark text-typography;

  &:not(:disabled) {
    @apply bg-gradient-to-br
        from-primary-dark from-5%
        via-primary
        to-secondary;

    &::after {
      @apply bg-gradient-to-br from-accent from-10% via-info-light via-primary to-primary-dark;
    }

    &:hover {
      @apply text-typography-strong;
    }

    &:focus-visible {
      @apply ring-2 ring-primary ring-offset-1 ring-offset-background text-typography-strong;
    }

    &:active {
      @apply text-typography/80;
      &::after {
        @apply opacity-90;
      }
    }
  }
}

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
 
//  @layer components {

//   .btn {
//     @apply
//       inline-flex
//       items-center
//       justify-center
//       cursor-pointer
//       outline-none
//       border-2
//       border-transparent
//       rounded-md
//       transition-colors
//       duration-150
//       ease-in-out
//       whitespace-nowrap
//       gap-2
//       py-1
//       px-2.5
//       text-sm
//       font-medium
//       leading-6
//       tracking-wide
//       text-center;

//       > svg {
//         @apply text-lg;
//       }

//       &:disabled {
//         @apply cursor-not-allowed opacity-50;
//       }
//   }

//   .btn-primary {
//     @extend .btn;
//     @apply bg-primary-dark text-on-primary;

//     &:not(:disabled)  {
//       &:focus-visible, &:hover  {
//         @apply border-primary bg-primary;
//       }

//       &:active {
//         @apply border-primary-dark bg-primary-darker;
//       }
//     }
//   }

//   .btn-icon-secondary {
//     @extend .btn;

//     @apply text-xl
//       bg-none
//       p-1.5
//       text-primary-light;

//      > span {
//       @apply sr-only;
//      }

//      &:not(:disabled) {
//        &:hover {
//         @apply text-primary-light bg-primary/20;
//       }

//       &:focus-visible  {
//         @apply border-primary-light;
//       }
//      }
//   }

//     .btn-secondary {
//     @extend .btn;

//     @apply text-xl
//       bg-none
//       p-1.5
//       text-primary-light;

//      &:not(:disabled) {
//        &:hover {
//         @apply text-primary-light bg-primary/20;
//       }

//       &:focus-visible  {
//         @apply border-primary-light;
//       }
//      }
//   }

//   .btn-secondary-outline {
//     @extend .btn;
//      @apply text-primary-lighter border-primary-lighter border;

//     &:not(:disabled) {
//        &:focus-visible, &:hover  {
//         @apply text-primary-light border-primary-light;
//       }
//     }
//   }

//   .btn-small {
//     @apply text-xs px-2 py-1;
//   }

//   .btn-destructive-small {
//      @extend .btn;
//      @extend .btn-small;

//    &:not(:disabled) {
//      &:hover {
//       @apply text-danger bg-danger/10;
//     }

//     &:focus-visible  {
//       @apply border-danger text-danger bg-danger/10;
//     }
//    }
//   }

//    .btn-icon-tertiary-xs {
//     @extend .btn-icon-secondary;
//     @extend .btn-small;
//     @apply  py-1 px-1 text-typography;
//   }
// }
</style>
