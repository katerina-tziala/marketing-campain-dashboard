<script setup lang="ts">
import { ref } from 'vue'
import { DownloadIcon, UploadIcon, FileDropzone } from '../../../ui'
import { isValidCsvFile } from '../utils/parse-csv'

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
  <div class="form form-body">
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
  <div class="modal-footer">
     <button class="btn-primary" :disabled="isLoading" @click="handleSubmit">
      <UploadIcon />
      {{ isLoading ? 'Uploading…' : 'Upload' }}
    </button>
    <button class="btn-secondary-outline xs:order-3 xs:mr-auto" @click="emit('download-template')">
      <DownloadIcon />
      Download Template
    </button>
    <button class="btn-secondary-outline min-w-24 xs:order-2" @click="emit('close')">Cancel</button>
  </div>
</template>

<style lang="scss" scoped>
.form-body {
  @apply p-6 overflow-y-auto w-[90vw] max-w-2xl;
}
</style>
