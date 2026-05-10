<script setup lang="ts">
import type { FormControlVariant, RadioToggleSize } from './form.types';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: { value: string; label: string }[];
    name?: string;
    disabled?: boolean;
    variant?: FormControlVariant;
    size?: RadioToggleSize;
  }>(),
  {
    name: undefined,
    disabled: false,
    variant: 'primary',
    size: 'default',
  },
);

defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <div
    class="radio-toggle"
    :class="[props.variant, props.size]"
    :style="{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }"
  >
    <label
      v-for="option in options"
      :key="option.value"
      class="block"
    >
      <input
        type="radio"
        :name="name"
        :value="option.value"
        :checked="modelValue === option.value"
        :disabled="disabled"
        @change="
          $emit('update:modelValue', option.value);
          ($event.target as HTMLInputElement).blur();
        "
      />
      <span class="option-label">{{ option.label }}</span>
    </label>
  </div>
</template>

<style lang="scss" scoped>
.radio-toggle {
  @apply bg-surface
  	border
  	gap-0.5
  	grid
  	grid-rows-1
  	rounded-md;
}

.option-label {
  @apply cursor-pointer
  	flex
  	font-medium
  	h-full
  	items-center
  	justify-center
  	min-h-10
  	overflow-hidden
  	px-2
  	py-1.5
  	text-center
  	text-primary-lighter
  	text-sm
  	tracking-wide
  	w-full;
}

label {
  &:first-of-type > .option-label {
    @apply rounded-l-md;
  }

  &:last-of-type > .option-label {
    @apply rounded-r-md;
  }
}

.radio-toggle.small {
  .option-label {
    @apply min-h-9
    	py-1;
  }

  label {
    &:first-of-type > .option-label {
      @apply rounded-l;
    }

    &:last-of-type > .option-label {
      @apply rounded-r;
    }
  }
}

.radio-toggle.tiny {
  .option-label {
    @apply min-h-7
    	py-1;
  }

  label {
    &:first-of-type > .option-label {
      @apply rounded-l;
    }

    &:last-of-type > .option-label {
      @apply rounded-r;
    }
  }
}

/*
  position: fixed removes the input from document flow so mobile browsers
  have no scroll target when focus fires on tap — position: absolute (sr-only)
  gives the browser a real document position it tries to scroll into view.
*/
input[type='radio'] {
  position: fixed;
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;

  &:checked + .option-label {
    @apply bg-primary-dark
    	text-typography-strong;
  }

  &:disabled + .option-label {
    @apply cursor-not-allowed
    	opacity-50
    	text-on-primary;
  }

  &:not(:disabled) {
    &:hover + .option-label {
      @apply bg-primary-light
      	text-primary-ink;
    }

    &:focus-visible + .option-label {
      @apply bg-primary
      	ring-2
      	ring-offset-1
      	ring-offset-background
      	ring-primary-dark
      	text-on-primary;
    }
  }
}

.radio-toggle.secondary {
  @apply border-primary-light/60;

  input[type='radio'] {
    + .option-label {
      @apply text-primary-lighter/75;
    }

    &:checked + .option-label {
      @apply bg-primary-light
      	text-primary-ink;
    }

    &:not(:disabled) {
      &:hover + .option-label {
        @apply bg-primary-dark
        	text-typography-strong;
      }

      &:focus-visible + .option-label {
        @apply bg-primary
        	ring-2
        	ring-offset-1
        	ring-offset-background
        	ring-primary-dark
        	text-on-primary;
      }
    }
  }
}
</style>
