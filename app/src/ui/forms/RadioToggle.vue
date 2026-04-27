<script setup lang="ts">
defineProps<{
  modelValue: string
  options: { value: string; label: string }[]
  name?: string
  disabled?: boolean
}>()

defineEmits<{ 'update:modelValue': [value: string] }>()
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
  @apply grid grid-rows-1 gap-0.5 rounded-md overflow-hidden bg-surface border;
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
    text-sm
    tracking-wider
    px-2
    py-2
    text-primary-lighter;
}

input[type='radio'] {
  &:not(:disabled)+ .option-label {
    @apply hover:bg-primary-dark hover:text-on-primary;
  }

  &:checked + .option-label {
    @apply bg-primary text-on-primary;
  }

  &:focus-visible + .option-label {
    @apply bg-primary text-on-primary;
  }

  &:disabled + .option-label {
    @apply opacity-50 cursor-not-allowed text-on-primary;
  }
}
 
</style>
