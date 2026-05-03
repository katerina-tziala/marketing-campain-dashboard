<script setup lang="ts">
import { localeDateFormat } from '@/shared/utils'
import type { DateFieldValidation } from './form.types'
import { validateDateField } from './validation'

const props = withDefaults(
  defineProps<{
    modelValue: string
    id: string
    required?: boolean
    disabled?: boolean
    invalid?: boolean
    describedBy?: string
    placeholder?: string
  }>(),
  {
    required: false,
    disabled: false,
    invalid: false,
    describedBy: undefined,
    placeholder: localeDateFormat.example,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  validate: [result: DateFieldValidation]
}>()

function validate(value = props.modelValue): DateFieldValidation {
  const result = validateDateField(value, { required: props.required })
  emit('validate', result)
  return result
}

function handleInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', value)
}

defineExpose({
  validate,
})
</script>

<template>
  <input
    :id="id"
    :value="modelValue"
    class="form-control"
    :class="{ 'input-error': invalid }"
    type="text"
    inputmode="numeric"
    :placeholder="placeholder"
    autocomplete="off"
    :required="required"
    :aria-invalid="invalid ? 'true' : undefined"
    :aria-describedby="describedBy"
    :disabled="disabled"
    @input="handleInput"
    @blur="validate()"
  />
</template>
