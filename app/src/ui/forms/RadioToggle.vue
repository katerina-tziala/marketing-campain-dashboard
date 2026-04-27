<script setup lang="ts">
defineProps<{
  modelValue: string;
  options: { value: string; label: string }[];
  name?: string;
  disabled?: boolean;
}>();

defineEmits<{ "update:modelValue": [value: string] }>();
</script>

<template>
  <div
    class="radio-toggle"
    :style="{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }"
  >
    <label v-for="option in options" :key="option.value" class="block">
      <input
        type="radio"
        :name="name"
        :value="option.value"
        :checked="modelValue === option.value"
        :disabled="disabled"
        class="sr-only"
        @change="$emit('update:modelValue', option.value)"
      />
      <span class="option-label">{{ option.label }}</span>
    </label>
  </div>
</template>

<style lang="scss" scoped>
.radio-toggle {
  @apply grid grid-rows-1 gap-0.5 bg-surface border rounded-md;
}

.option-label {
  @apply w-full
    flex
    items-center
    justify-center
    h-full
    text-center
    cursor-pointer
    font-medium 
    tracking-wide
    text-sm
    px-2 
    min-h-9
    text-primary-lighter
    overflow-hidden;
}

label {
  &:first-of-type > .option-label {
    @apply rounded-l-md;
  }

  &:last-of-type > .option-label {
    @apply rounded-r-md;
  }
}

input[type="radio"] {
  &:checked + .option-label {
    @apply bg-primary-dark text-typography-strong;
  }

  &:disabled + .option-label {
    @apply opacity-50 cursor-not-allowed text-on-primary;
  }

  &:not(:disabled) {
    &:hover + .option-label {
      @apply bg-primary-light text-primary-ink;
    }

    &:focus-visible + .option-label {
      @apply bg-primary-dark text-on-primary ring-2 ring-offset-1 ring-offset-background ring-primary-dark;
    }
  }
}
</style>
