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
  'download-template': []
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
    <div class="form-field">
      <label class="form-field__label" for="campaign-title">Campaign Title</label>
      <input
        id="campaign-title"
        :value="title"
        class="field__input form-control"
        :class="{ 'form-control--error': titleError }"
        type="text"
        placeholder="e.g. Q2 2025 Campaign"
        autocomplete="off"
        @input="emit('update:title', ($event.target as HTMLInputElement).value)"
      />
      <p v-if="titleError" class="form-field__error">{{ titleError }}</p>
    </div>
    <!-- File drop zone -->
    <div class="form-field">
      <label class="form-field__label">CSV File</label>
      <label
        class="dropzone form-control"
        :class="{ 'dropzone--active': isDragging, 'form-control--error': fileError || parseError }"
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
      <p v-if="fileError || parseError" class="form-field__error">{{ fileError || parseError }}</p>
    </div>
  </div>
  <!-- Footer -->
  <div class="form-footer">
    <BaseButton variant="ghost" class="form-footer__download" @click="emit('download-template')">
      <DownloadIcon />
      Download Template
    </BaseButton>

    <BaseButton variant="ghost" class="form-footer__cancel" :disabled="isLoading" @click="emit('close')">Cancel</BaseButton>
    <BaseButton variant="primary" class="form-footer__upload" :disabled="isLoading" @click="handleSubmit">
      <UploadIcon />
      {{ isLoading ? 'Uploading…' : 'Upload' }}
    </BaseButton>
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
  max-width: 640px;
}

// ── Fields ─────────────────────────────────────────────────────────────────────

.field__input {
  border: 1px solid var(--control-border);
  padding: theme('spacing[2.5]') theme('spacing.3');
  width: 100%;

  &::placeholder {
    color: var(--color-text-secondary);
  }
}

.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: theme('spacing.2');
  padding: theme('spacing.8') theme('spacing.4');
  border: 1.5px dashed var(--control-border);
  cursor: pointer;
  text-align: center;

  &--active {
    --control-border: #6366f1;
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
  gap: theme('spacing.3');
  padding: theme('spacing.4') theme('spacing.6');
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;

  &__cancel {
    margin-left: auto;
  }

  @media (max-width: 479px) {
    flex-direction: column;
    padding: theme('spacing.4');

    .form-footer__upload   { order: 1; }
    .form-footer__download { order: 2; }
    .form-footer__cancel   { order: 3; }

    .form-footer__upload,
    .form-footer__download,
    .form-footer__cancel {
      width: 100%;
      margin-left: 0;
    }
  }
}
</style>
