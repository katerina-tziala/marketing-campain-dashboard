<script setup lang="ts">
import type { RadioItemVariant } from './form.types';

const props = withDefaults(
  defineProps<{
    name: string;
    value: string | number;
    checked: boolean;
    ariaLabel?: string;
    error?: boolean;
    disabled?: boolean;
    variant?: RadioItemVariant;
  }>(),
  {
    ariaLabel: undefined,
    error: false,
    disabled: false,
    variant: 'primary',
  },
);

defineEmits<{ change: [value: string | number] }>();
</script>

<template>
  <label
    class="radio-item"
    :class="[props.variant, { error, disabled }]"
  >
    <input
      class="sr-only-scroll-safe"
      type="radio"
      :name="name"
      :value="value"
      :checked="checked"
      :disabled="disabled"
      :aria-label="ariaLabel"
      @change="$emit('change', value)"
    />
    <span class="radio-indicator" />
  </label>
</template>

<style lang="scss" scoped>
.radio-item {
  @apply cursor-pointer
  	inline-flex
  	items-center
  	justify-center;

  .radio-indicator {
    @apply border-2
    	duration-300
    	flex
    	h-6
    	items-center
    	justify-center
    	rounded-full
    	transition-colors
    	w-6;

    &::before {
      @apply bg-transparent
      	block
      	content-['']
      	duration-300
      	h-3
      	rounded-full
      	transition-colors
      	w-3;
    }
  }
}

/* variant primary */
input[type='radio'] {
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
      @apply bg-surface-active
      	border-primary-light;
    }

    &:focus-visible + .radio-indicator {
      @apply ring-2
      	ring-offset-1
      	ring-offset-background
      	ring-primary;
    }

    /*  checked */
    &:checked:hover + .radio-indicator::before,
    &:checked:focus-visible + .radio-indicator::before {
      @apply bg-primary-light;
    }
  }
}

/* variant info-dimmed */
.radio-item.info > input[type='radio'] {
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
      @apply bg-surface-active
      	border-info;
    }

    &:focus-visible + .radio-indicator {
      @apply ring-2
      	ring-info-dark
      	ring-offset-1
      	ring-offset-background;
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
  @apply cursor-not-allowed
  	opacity-50;
}
</style>
