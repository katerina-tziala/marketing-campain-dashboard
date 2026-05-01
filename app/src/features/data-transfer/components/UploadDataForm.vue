<script setup lang="ts">
import { ref } from 'vue'
import { Button, DownloadIcon, UploadIcon, FileDropzone, ModalFooter } from '@/ui'
import { isValidCsvFile } from '@/features/data-transfer/utils/parse-csv'


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
        :disabled="isLoading"
        @input="emit('update:title', ($event.target as HTMLInputElement).value)"
      />
      <p v-if="titleError" class="field-error">{{ titleError }}</p>
    </div>
    <!-- File drop zone -->
    <div class="field">
      <label class="field-label" for="csv-file">CSV File</label>
      <FileDropzone
        id="csv-file"
        :model-value="file"
        :disabled="isLoading"
        accept=".csv,text/csv"
        hint="CSV"
        @update:model-value="handleFileSelect"
      >
        <template v-if="fileError || parseError" #error>
          <p class="field-error">{{ fileError || parseError }}</p>
        </template>
      </FileDropzone>
    </div>
  </div>
  <ModalFooter>
    <Button class="primary" :disabled="isLoading" @click="handleSubmit">
      <UploadIcon />
      {{ isLoading ? 'Uploading…' : 'Upload' }}
    </Button>
    <Button class="outline xs:order-3 xs:mr-auto" @click="emit('downloadTemplate')">
      <DownloadIcon />
      Download Template
    </Button>
    <Button class="outline min-w-24 xs:order-2" @click="emit('close')">Cancel</Button>
  </ModalFooter>
</template>

<style lang="scss" scoped>
.form-body {
  @apply p-6 overflow-y-auto w-[90vw] max-w-2xl;
}
</style>
