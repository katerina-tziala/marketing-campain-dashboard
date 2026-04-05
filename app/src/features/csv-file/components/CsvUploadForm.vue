<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, DownloadIcon, UploadIcon } from '../../../ui'

const props = defineProps<{
  title: string
  file: File | null
  parseError: string
  isLoading: boolean
}>()

const emit = defineEmits<{
  'update:title': [value: string]
  'update:file': [value: File | null]
  submit: []
  close: []
  downloadTemplate: []
}>()

const isDragging = ref(false)
const titleError = ref('')
const fileError = ref('')

function isValidCsvFile(f: File): boolean {
  return f.name.toLowerCase().endsWith('.csv') || f.type === 'text/csv'
}

function setFile(f: File): void {
  if (!isValidCsvFile(f)) {
    fileError.value = 'Only CSV files are accepted.'
    emit('update:file', null)
    return
  }
  fileError.value = ''
  emit('update:file', f)
}

function onFileChange(e: Event): void {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) setFile(input.files[0])
}

function onDrop(e: DragEvent): void {
  isDragging.value = false
  const dropped = e.dataTransfer?.files[0]
  if (dropped) setFile(dropped)
}

function handleSubmit(): void {
  titleError.value = ''
  fileError.value = ''
  let valid = true

  if (!props.title.trim()) {
    titleError.value = 'Campaign title is required.'
    valid = false
  }
  if (!props.file) {
    fileError.value = 'Please select a CSV file.'
    valid = false
  }
  if (valid) emit('submit')
}
</script>

<template>
  <!-- Body -->
  <div class="form-body">
    <!-- Campaign title -->
    <div class="field">
      <label class="field__label" for="campaign-title">Campaign Title</label>
      <input
        id="campaign-title"
        :value="title"
        class="field__input"
        :class="{ 'field__input--error': titleError }"
        type="text"
        placeholder="e.g. Q2 2025 Campaign"
        autocomplete="off"
        @input="emit('update:title', ($event.target as HTMLInputElement).value)"
      />
      <p v-if="titleError" class="field__error">{{ titleError }}</p>
    </div>

    <!-- File drop zone -->
    <div class="field">
      <label class="field__label">CSV File</label>
      <label
        class="dropzone"
        :class="{ 'dropzone--active': isDragging, 'dropzone--error': fileError || parseError }"
        for="csv-file-input"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
      >
        <UploadIcon class="dropzone__icon" />
        <span v-if="file" class="dropzone__filename">{{ file.name }}</span>
        <span v-else class="dropzone__hint">
          Drag & drop a CSV file here, or <span class="dropzone__link">browse</span>
        </span>
        <input
          id="csv-file-input"
          type="file"
          accept=".csv,text/csv"
          class="dropzone__input"
          @change="onFileChange"
        />
      </label>
      <p v-if="fileError || parseError" class="field__error">{{ fileError || parseError }}</p>
    </div>
  </div>

  <!-- Footer -->
  <div class="form-footer">
    <BaseButton variant="ghost" @click="emit('downloadTemplate')">
      <DownloadIcon />
      Download Template
    </BaseButton>

    <div class="form-footer__actions">
      <BaseButton variant="ghost" :disabled="isLoading" @click="emit('close')">Cancel</BaseButton>
      <BaseButton variant="primary" :disabled="isLoading" @click="handleSubmit">
        <UploadIcon />
        {{ isLoading ? 'Uploading…' : 'Upload' }}
      </BaseButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// ── Body ───────────────────────────────────────────────────────────────────────

.form-body {
  padding: theme('spacing.6');
  display: flex;
  flex-direction: column;
  gap: theme('spacing.5');
  flex: 1;
  min-height: 0;
  overflow-y: auto;
   width: 90vw;
  max-width: 800px;
}

// ── Fields ─────────────────────────────────────────────────────────────────────

.field {
  display: flex;
  flex-direction: column;
  gap: theme('spacing[1.5]');

  &__label {
    font-size: theme('fontSize.sm');
    font-weight: 500;
    color: var(--color-title);
  }

  &__input {
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: theme('borderRadius.md');
    padding: theme('spacing[2.5]') theme('spacing.3');
    font-size: theme('fontSize.sm');
    color: var(--color-text);
    width: 100%;
    transition: border-color 150ms ease;

    &::placeholder {
      color: var(--color-text-secondary);
    }

    &:focus {
      outline: none;
      border-color: #6366f1;
    }

    &--error {
      border-color: #f43f5e;
    }
  }

  &__error {
    font-size: theme('fontSize.xs');
    color: #f43f5e;
    margin: 0;
  }
}

.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: theme('spacing.2');
  padding: theme('spacing.8') theme('spacing.4');
  border: 1.5px dashed var(--color-border);
  border-radius: theme('borderRadius.md');
  cursor: pointer;
  transition: border-color 150ms ease, background-color 150ms ease;
  text-align: center;

  &:hover,
  &--active {
    border-color: #6366f1;
    background-color: rgba(99, 102, 241, 0.05);
  }

  &--error {
    border-color: #f43f5e;
  }

  &__icon {
    width: 1.75rem;
    height: 1.75rem;
    color: var(--color-text-secondary);
  }

  &__filename {
    font-size: theme('fontSize.sm');
    color: var(--color-title);
    font-weight: 500;
    word-break: break-all;
  }

  &__hint {
    font-size: theme('fontSize.sm');
    color: var(--color-text-secondary);
  }

  &__link {
    color: #6366f1;
    text-decoration: underline;
  }

  &__input {
    display: none;
  }
}

// ── Footer ─────────────────────────────────────────────────────────────────────

.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: theme('spacing.3');
  padding: theme('spacing.4') theme('spacing.6');
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;

  &__actions {
    display: flex;
    align-items: center;
    gap: theme('spacing.6');
  }
}
</style>
