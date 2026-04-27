<script setup lang="ts">
defineProps<{
  name: string
  value: string | number
  checked: boolean
  ariaLabel?: string
  error?: boolean
  disabled?: boolean
}>()

defineEmits<{ change: [value: string | number] }>()
</script>

<template>
  <label class="radio-item" :class="{ error, disabled }">
    <input
      type="radio"
      :name="name"
      :value="value"
      :checked="checked"
      :disabled="disabled"
      :aria-label="ariaLabel"
      class="sr-only"
      @change="$emit('change', value)"
    />
    <span class="radio-indicator" />
  </label>
</template>

<style lang="scss" scoped>
.radio-item {
  @apply inline-flex items-center justify-center cursor-pointer;

  &.disabled {
    @apply cursor-not-allowed opacity-40;
  }
}

.radio-indicator {
  @apply w-4 h-4 rounded-full border-2 flex items-center justify-center
    border-primary transition-colors;

  &::before {
    @apply content-[''] block w-2 h-2 rounded-full bg-transparent transition-colors;
  }
}

input[type='radio'] {
  &:checked + .radio-indicator {
    @apply border-primary bg-primary-deep/30;

    &::before {
      @apply bg-primary;
    }
  }

  &:not(:disabled) {
    &:hover + .radio-indicator {
      @apply border-primary-light bg-primary/10;
    }

    &:checked:hover + .radio-indicator {
      @apply border-primary-light bg-primary-deep/50;

      &::before {
        @apply bg-primary-light;
      }
    }

    &:focus-visible + .radio-indicator {
      @apply border-primary-light bg-primary/10
        ring-2 ring-offset-1 ring-offset-background ring-primary;
    }
  }
}

.radio-item.error {
  .radio-indicator {
    @apply border-danger-lighter;
  }

  input[type='radio'] {
    &:checked + .radio-indicator {
      @apply border-danger-lighter bg-danger-lighter/10;

      &::before {
        @apply bg-danger-lighter;
      }
    }

    &:not(:disabled) {
      &:hover + .radio-indicator {
        @apply border-danger bg-danger/10;
      }

      &:checked:hover + .radio-indicator {
        @apply border-danger bg-danger/20;

        &::before {
          @apply bg-danger;
        }
      }

      &:focus-visible + .radio-indicator {
        @apply border-danger bg-danger/10
          ring-2 ring-offset-1 ring-offset-background ring-danger-lighter;
      }
    }
  }
}
</style>
