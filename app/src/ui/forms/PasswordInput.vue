<script setup lang="ts">
import { ref, computed, useSlots, Comment } from 'vue'
import EyeIcon from '@/ui/icons/EyeIcon.vue'
import EyeOffIcon from '@/ui/icons/EyeOffIcon.vue'

const props = withDefaults(defineProps<{
  modelValue: string
  id?: string
  placeholder?: string
  disabled?: boolean
  autocomplete?: string
}>(), {
  autocomplete: 'off',
})

defineEmits<{ 'update:modelValue': [value: string] }>()

const slots = useSlots()
const visible = ref(false)

const hasError = computed(() => {
  if (!slots.error) return false
  return slots.error().some(vnode => vnode.type !== Comment)
})
</script>

<template>
  <div class="password-input" :class="{ 'password-input-error': hasError, 'disabled': disabled }">
    <input
      :id="id"
      :value="modelValue"
      :type="visible ? 'text' : 'password'"
      class="form-control input-field"
      :class="{ 'input-error': hasError }"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :disabled="disabled"
      spellcheck="false"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button
      type="button"
      class="btn-icon-secondary btn-small toggle-btn"
      :aria-label="visible ? 'Hide' : 'Show'"
      :disabled="disabled"
      @click="visible = !visible"
    >
      <EyeOffIcon v-if="visible" />
      <EyeIcon v-else />
    </button>
  </div>
  <slot name="error" />
</template>

<style lang="scss" scoped>
.password-input {
  @apply relative flex items-center overflow-hidden;

  &:not(.disabled) {
    &:hover > .form-control,
    &:focus-within > .form-control {
      @apply border-primary;
    }
  }
}

.input-field {
  @apply pr-12;
}

.toggle-btn {
  @apply absolute right-0 w-10 h-[2.625rem] border border-transparent flex items-center justify-center text-base rounded-l-none rounded-r-sm;

  &:not(:disabled) {
    &:focus,
    &:focus-visible {
      @apply border-primary/20 text-primary-light bg-primary/20;
    }
  }
}
</style>
