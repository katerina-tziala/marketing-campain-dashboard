<script setup lang="ts">
import { ref, computed, useSlots, Comment } from 'vue'
import UploadIcon from './icons/UploadIcon.vue'

const props = defineProps<{
  modelValue: File | null
  id?: string
  accept?: string
  hint?: string
  disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: File] }>()

const slots = useSlots()
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const hintId = computed(() => props.id ? `${props.id}-hint` : undefined)

const hintText = computed(() =>
  `Drag & drop a ${props.hint ? props.hint : ''} file here or browse`
)

function hasError(): boolean {
  const nodes = slots.error?.()
  return nodes?.some((n) => n.type !== Comment) ?? false
}

function open(): void {
  if (props.disabled) return
  fileInputRef.value?.click()
}

function onDrop(e: DragEvent): void {
  isDragging.value = false
  if (props.disabled) return
  const f = e.dataTransfer?.files[0]
  if (f) emit('update:modelValue', f)
}

function onChange(e: Event): void {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) emit('update:modelValue', input.files[0])
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <button
      type="button"
      class="dropzone form-control"
      :class="{ 'dropzone-active': isDragging, 'input-error': hasError() }"
      :disabled="disabled"
      :aria-describedby="!modelValue && hintId ? hintId : undefined"
      @click="open"
      @dragover.prevent="!disabled && (isDragging = true)"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <UploadIcon class="upload-icon" />
      <span v-if="modelValue" class="filename">{{ modelValue.name }}</span>
      <span v-else :id="hintId" class="hint">{{ hintText }}</span>
    </button>
    <input
      :id="id"
      ref="fileInputRef"
      type="file"
      :accept="accept"
      :disabled="disabled"
      tabindex="-1"
      class="sr-only"
      @change="onChange"
    />
    <slot name="error" />
  </div>
</template>

<style lang="scss" scoped>
.dropzone {
  @apply flex flex-col items-center justify-center gap-2 py-8 px-4 cursor-pointer text-center w-full;
}

.dropzone-active {
  @apply border-primary-500;
}

.upload-icon {
  @apply w-7 h-7 text-typography-subtle text-xl;
}

.filename {
  @apply text-sm font-medium break-all text-typography-subtle;
}

.hint {
  @apply text-sm text-typography-subtle;
}

</style>
