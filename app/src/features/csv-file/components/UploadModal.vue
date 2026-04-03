<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BaseModal, DownloadIcon, UploadIcon } from '../../../ui'
import { parseCsv } from '../utils/parseCsv'
import { downloadCsv } from '../utils/downloadCsv'
import { MOCK_CAMPAINS } from '../../../common/data/MOCK_CAMPAIN_DATA'
import { useToastStore } from '../../../stores/toastStore'
import type { CsvValidationError } from '../types'
import type { Campaign } from '../../../common/types/campaign'

const toastStore = useToastStore()

function handleDownloadTemplate(): void {
  try {
    downloadCsv(MOCK_CAMPAINS, 'marketing_campain_sample')
  } catch {
    toastStore.addToast('Failed to generate the CSV template. Please try again.')
  }
}

const emit = defineEmits<{
  success: [payload: { title: string; campaigns: Campaign[] }]
  error: [errors: CsvValidationError[]]
  close: []
}>()

const title = ref('')
const file = ref<File | null>(null)
const isDragging = ref(false)
const isLoading = ref(false)
const titleError = ref('')
const fileError = ref('')

function onFileChange(e: Event): void {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) setFile(input.files[0])
}

function onDrop(e: DragEvent): void {
  isDragging.value = false
  const dropped = e.dataTransfer?.files[0]
  if (dropped) setFile(dropped)
}

function isValidCsvFile(f: File): boolean {
  return f.name.toLowerCase().endsWith('.csv') || f.type === 'text/csv'
}

function setFile(f: File): void {
  if (!isValidCsvFile(f)) {
    fileError.value = 'Only CSV files are accepted.'
    file.value = null
    return
  }
  file.value = f
  fileError.value = ''
}

function validate(): boolean {
  let valid = true
  titleError.value = ''
  fileError.value = ''

  if (!title.value.trim()) {
    titleError.value = 'Campaign title is required.'
    valid = false
  }
  if (!file.value) {
    fileError.value = 'Please select a CSV file.'
    valid = false
  }
  return valid
}

async function handleSubmit(): Promise<void> {
  if (!validate()) return

  isLoading.value = true
  const result = await parseCsv(file.value!)
  isLoading.value = false

  if (result.errors.length > 0) {
    emit('error', result.errors)
    return
  }

  emit('success', { title: title.value.trim(), campaigns: result.campaigns })
}
</script>

<template>
  <BaseModal title="Upload Campaign Data" @close="emit('close')">
    <template #body>
      <!-- Campaign title -->
      <div class="field">
        <label class="field__label" for="campaign-title">Campaign Title</label>
        <input
          id="campaign-title"
          v-model="title"
          class="field__input"
          :class="{ 'field__input--error': titleError }"
          type="text"
          placeholder="e.g. Q2 2025 Campaign"
          autocomplete="off"
        />
        <p v-if="titleError" class="field__error">{{ titleError }}</p>
      </div>

      <!-- File drop zone -->
      <div class="field">
        <label class="field__label">CSV File</label>
        <label
          class="dropzone"
          :class="{ 'dropzone--active': isDragging, 'dropzone--error': fileError }"
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
        <p v-if="fileError" class="field__error">{{ fileError }}</p>
      </div>
    </template>

    <template #footer>
      <BaseButton variant="ghost" @click="handleDownloadTemplate">
        <DownloadIcon />
        Download Template
      </BaseButton>
      <div class="footer-actions">
        <BaseButton variant="ghost" :disabled="isLoading" @click="emit('close')">
          Cancel
        </BaseButton>
        <BaseButton variant="primary" :disabled="isLoading" @click="handleSubmit">
          <UploadIcon />
          {{ isLoading ? 'Uploading…' : 'Upload' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<style lang="scss" scoped>
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

.footer-actions {
  display: flex;
  align-items: center;
  gap: theme('spacing.6');
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
</style>
