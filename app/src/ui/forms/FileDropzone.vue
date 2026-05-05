<script setup lang="ts">
import { computed, ref } from 'vue';

import UploadIcon from '../icons/UploadIcon.vue';
import type { FileFieldValidation } from './form.types';
import { validateFile } from './validation';

const props = defineProps<{
  modelValue: File | null;
  accept: string;
  id?: string;
  hint?: string;
  required?: boolean;
  maxSizeBytes?: number;
  invalid?: boolean;
  describedBy?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: File | null];
  validate: [result: FileFieldValidation];
}>();

const dropzoneRef = ref<HTMLButtonElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const rejectedFileName = ref('');
const touched = ref(false);
const skipNextBlurValidation = ref(false);
const displayFileName = computed(() => props.modelValue?.name ?? rejectedFileName.value);

function open(): void {
  if (props.disabled) {
    return;
  }
  fileInputRef.value?.click();
}

function validate(value = props.modelValue): FileFieldValidation {
  const result = validateFile(value, {
    accept: props.accept,
    required: props.required,
    maxSizeBytes: props.maxSizeBytes,
  });
  emit('validate', result);
  return result;
}

function selectFile(file: File): void {
  const result = validate(file);
  touched.value = true;
  skipNextBlurValidation.value = true;
  rejectedFileName.value = result.valid ? '' : file.name;
  emit('update:modelValue', result.valid ? file : null);
  dropzoneRef.value?.blur();
}

function handleBlur(): void {
  if (skipNextBlurValidation.value) {
    skipNextBlurValidation.value = false;
    return;
  }

  if (!touched.value) {
    touched.value = true;
    return;
  }

  validate();
}

function onDrop(e: DragEvent): void {
  if (props.disabled) {
    return;
  }
  const f = e.dataTransfer?.files[0];
  if (f) {
    selectFile(f);
  }
}

function onChange(e: Event): void {
  const input = e.target as HTMLInputElement;
  if (input.files?.[0]) {
    selectFile(input.files[0]);
  }
  input.value = '';
}

defineExpose({
  validate,
});
</script>

<template>
  <button
    :id="id"
    ref="dropzoneRef"
    type="button"
    class="form-control dropzone"
    :class="{
      'input-error': invalid,
      empty: !displayFileName,
    }"
    :disabled="disabled"
    :aria-invalid="invalid ? 'true' : undefined"
    :aria-describedby="describedBy"
    @click="open"
    @dragover.prevent
    @drop.prevent="onDrop"
    @blur="handleBlur"
  >
    <UploadIcon class="text-xl mb-2" />
    <span
      v-if="displayFileName"
      class="block text-sm font-medium break-words"
      >{{ displayFileName }}</span
    >
    <span
      v-else
      class="block text-sm"
    >
      {{ hint ?? 'Drag & drop a file here or browse' }}
    </span>
  </button>
  <input
    :id="id ? `${id}-input` : undefined"
    ref="fileInputRef"
    type="file"
    :accept="accept"
    :disabled="disabled"
    tabindex="-1"
    class="sr-only"
    @change="onChange"
  />
</template>

<style lang="scss" scoped>
.dropzone {
  @apply flex
    flex-col
    items-center
    justify-center
    gap-2
    py-8
    px-4
    cursor-pointer
    text-center
    w-full;

  &:not(:disabled) {
    &:hover {
      @apply border-primary-light/60
        text-primary-light;
    }
  }

  &.empty,
  &.form-control.empty:not(:disabled):hover,
  &.form-control.empty:not(:disabled):focus {
    @apply text-typography-faint;
  }
}
</style>
