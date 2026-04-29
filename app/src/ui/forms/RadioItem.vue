<script setup lang="ts">
defineProps<{
  name: string;
  value: string | number;
  checked: boolean;
  ariaLabel?: string;
  error?: boolean;
  disabled?: boolean;
}>();

defineEmits<{ change: [value: string | number] }>();
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

  .radio-indicator {
    @apply w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-300;

    &::before {
      @apply content-[''] block w-2 h-2 rounded-full bg-transparent transition-colors duration-300;
    }
  }
}

/* variant primary */
input[type="radio"] {
  /* not checked */
  + .radio-indicator {
    @apply border-primary-dark;
  }

  /*  checked */
  &:checked + .radio-indicator::before {
    @apply bg-primary-dark;
  }

  &:not(:disabled) {
    /* not checked */
    &:hover + .radio-indicator,
    &:focus-visible + .radio-indicator {
      @apply bg-surface-active border-primary-light;
    }

    &:focus-visible + .radio-indicator {
      @apply ring-2 ring-offset-1 ring-offset-background ring-primary;
    }

    /*  checked */
    &:checked:hover + .radio-indicator::before,
    &:checked:focus-visible + .radio-indicator::before {
      @apply bg-primary-light;
    }
  }
}

/* variant info-dimmed */
.radio-item.info > input[type="radio"] {
  /* not checked */
  + .radio-indicator {
    @apply border-info-dark;
  }

  /*  checked */
  &:checked + .radio-indicator::before {
    @apply bg-info-dark;
  }

  &:not(:disabled) {
    /* not checked */
    &:hover + .radio-indicator,
    &:focus-visible + .radio-indicator {
      @apply bg-surface-active border-info;
    }

    &:focus-visible + .radio-indicator {
      @apply ring-2 ring-offset-1 ring-offset-background ring-info-dark;
    }

    /*  checked */
    &:checked:hover + .radio-indicator::before,
    &:checked:focus-visible + .radio-indicator::before {
      @apply bg-info;
    }
  }
}

/* disabled */
.radio-item.disabled {
  @apply cursor-not-allowed opacity-50;
}
</style>
