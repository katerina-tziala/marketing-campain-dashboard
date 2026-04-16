<script setup lang="ts">
defineProps<{
  modelValue: string
  options: { value: string; label: string }[]
  name?: string
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
        class="sr-only"
        @change="$emit('update:modelValue', option.value)"
      />
      <span class="option-label">{{ option.label }}</span>
    </label>
  </div>
</template>

<style lang="scss" scoped>
.radio-toggle {
  @apply grid grid-rows-1 gap-0.5 rounded-md overflow-hidden bg-surface-secondary min-h-[2.625rem];
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
    py-2.5
    text-primary-300
    hover:bg-primary-500
    hover:text-white;
}

input[type='radio'] {
  &:checked + .option-label {
    @apply bg-primary-600 text-white;
  }

  &:focus-visible + .option-label {
    @apply bg-primary-500 text-white;
  }
}
</style>
