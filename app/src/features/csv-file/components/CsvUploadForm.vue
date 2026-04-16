<script setup lang="ts">
import { ref } from 'vue'
import { DownloadIcon, UploadIcon, FileDropzone } from '../../../ui'

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

const titleError = ref('')
const fileError = ref('')

function isValidCsvFile(f: File): boolean {
  return f.name.toLowerCase().endsWith('.csv') || f.type === 'text/csv'
}

function handleFileSelect(f: File): void {
  if (!isValidCsvFile(f)) {
    fileError.value = 'Only CSV files are accepted.'
    emit('update:file', null)
    return
  }
  fileError.value = ''
  emit('update:file', f)
}

function handleSubmit(): void {
  titleError.value = ''
  fileError.value = ''
  let valid = true

  if (!props.title.trim()) {
    titleError.value = 'Campaign title is required'
    valid = false
  }
  if (!props.file) {
    fileError.value = 'Please select a CSV file'
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
      <label class="field-label" for="campaign-title">Campaign Title</label>
      <input
        id="campaign-title"
        :value="title"
        class="form-control"
        :class="{ 'input-error': titleError }"
        type="text"
        placeholder="e.g. Q2 2025 Campaign"
        autocomplete="off"
        @input="emit('update:title', ($event.target as HTMLInputElement).value)"
      />
      <p v-if="titleError" class="field-error">{{ titleError }}</p>
    </div>
    <!-- File drop zone -->
    <div class="field">
      <label class="field-label" for="csv-file">CSV File</label>
      <FileDropzone
        id="csv-file"
        :modelValue="file"
        accept=".csv,text/csv"
        hint="CSV"
        @update:modelValue="handleFileSelect"
      >
        <template v-if="fileError || parseError" #error>
          <p class="field-error">{{ fileError || parseError }}</p>
        </template>
      </FileDropzone>
    </div>
  </div>
  <!-- Footer -->
  <div class="form-footer">
    <button class="btn-secondary-outline form-footer__download" @click="emit('download-template')">
      <DownloadIcon />
      Download Template
    </button>

    <button class="btn-secondary-outline form-footer__cancel" :disabled="isLoading" @click="emit('close')">Cancel</button>
    <button class="btn-primary form-footer__upload" :disabled="isLoading" @click="handleSubmit">
      <UploadIcon />
      {{ isLoading ? 'Uploading…' : 'Upload' }}
    </button>
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
