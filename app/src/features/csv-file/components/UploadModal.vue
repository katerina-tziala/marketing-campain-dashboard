<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseButton, BaseModal, DownloadIcon, UploadIcon } from '../../../ui'
import { parseCsv } from '../utils/parseCsv'
import { downloadCsv } from '../utils/downloadCsv'
import { MOCK_CAMPAINS } from '../../../common/data/MOCK_CAMPAIN_DATA'
import { useToastStore } from '../../../stores/toastStore'
import type { CsvRowError } from '../types'
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
  close: []
}>()

// ── Form state ─────────────────────────────────────────────────────────────────

const title = ref('')
const file = ref<File | null>(null)
const isDragging = ref(false)
const isLoading = ref(false)
const titleError = ref('')
const fileError = ref('')

// ── Error view state ───────────────────────────────────────────────────────────

const view = ref<'form' | 'row-errors'>('form')
const validCampaigns = ref<Campaign[]>([])
const rowErrors = ref<CsvRowError[]>([])

const invalidRowCount = computed(() => new Set(rowErrors.value.map((e) => e.row)).size)
const totalRows = computed(() => invalidRowCount.value + validCampaigns.value.length)

// ── File handling ──────────────────────────────────────────────────────────────

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

// ── Submit ─────────────────────────────────────────────────────────────────────

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

  if (result.errors.length === 0) {
    emit('success', { title: title.value.trim(), campaigns: result.campaigns })
    return
  }

  const err = result.errors[0]

  if (err.type === 'file_size' || err.type === 'empty_file') {
    fileError.value = err.message
    return
  }

  if (err.type === 'missing_columns') {
    const cols = (err.details ?? []).join(', ')
    fileError.value = `CSV file headers are missing: ${cols}. Please consult the template.`
    return
  }

  if (err.type === 'invalid_rows') {
    validCampaigns.value = result.campaigns
    rowErrors.value = err.rowErrors ?? []
    view.value = 'row-errors'
    return
  }

  // Fallback for file_type errors not caught by the inline check
  fileError.value = err.message
}

// ── Error view actions ─────────────────────────────────────────────────────────

function handleBack(): void {
  view.value = 'form'
  file.value = null
  fileError.value = ''
  rowErrors.value = []
  validCampaigns.value = []
}

function handleProceed(): void {
  emit('success', { title: title.value.trim(), campaigns: validCampaigns.value })
}
</script>

<template>
  <BaseModal title="Upload Campaign Data" @close="emit('close')">
    <template #body>

      <!-- ── Form view ─────────────────────────────────────────────────────── -->
      <template v-if="view === 'form'">
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

      <!-- ── Row errors view ───────────────────────────────────────────────── -->
      <template v-else>
        <p v-if="validCampaigns.length === 0" class="error-summary">
          <strong>{{ invalidRowCount }} {{ invalidRowCount === 1 ? 'row' : 'rows' }}</strong>
          {{ invalidRowCount === 1 ? 'contains' : 'contain' }} errors and could not be imported.
          Please fix the issues below and upload the file again.
        </p>
        <p v-else class="error-summary">
          <strong>{{ invalidRowCount }} of {{ totalRows }} {{ totalRows === 1 ? 'row' : 'rows' }}</strong>
          {{ invalidRowCount === 1 ? 'contains' : 'contain' }} errors and
          {{ invalidRowCount === 1 ? 'was' : 'were' }} skipped.
          You can proceed with the
          <strong>{{ validCampaigns.length }} valid {{ validCampaigns.length === 1 ? 'row' : 'rows' }}</strong>,
          or go back and fix the file.
        </p>

        <div class="error-table-wrapper">
          <table class="error-table">
            <thead>
              <tr>
                <th class="error-table__th error-table__th--row">Row</th>
                <th class="error-table__th error-table__th--col">Column</th>
                <th class="error-table__th">Issue</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(err, i) in rowErrors" :key="i" class="error-table__row">
                <td class="error-table__td error-table__td--row">{{ err.row }}</td>
                <td class="error-table__td error-table__td--col">{{ err.column }}</td>
                <td class="error-table__td">{{ err.issue }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

    </template>

    <template #footer>
      <BaseButton variant="ghost" @click="handleDownloadTemplate">
        <DownloadIcon />
        Download Template
      </BaseButton>

      <div class="footer-actions">
        <BaseButton variant="ghost" :disabled="isLoading" @click="emit('close')">Cancel</BaseButton>

        <template v-if="view === 'form'">
          <BaseButton variant="primary" :disabled="isLoading" @click="handleSubmit">
            <UploadIcon />
            {{ isLoading ? 'Uploading…' : 'Upload' }}
          </BaseButton>
        </template>

        <template v-else>
          <BaseButton variant="ghost" @click="handleBack">Back</BaseButton>
          <BaseButton
            v-if="validCampaigns.length > 0"
            variant="primary"
            @click="handleProceed"
          >
            Proceed with {{ validCampaigns.length }} valid
            {{ validCampaigns.length === 1 ? 'row' : 'rows' }}
          </BaseButton>
        </template>
      </div>
    </template>
  </BaseModal>
</template>

<style lang="scss" scoped>
// ── Form ───────────────────────────────────────────────────────────────────────

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

// ── Row errors view ────────────────────────────────────────────────────────────

.error-summary {
  font-size: theme('fontSize.sm');
  color: var(--color-text);
  line-height: 1.6;
  margin: 0;
}

.error-table-wrapper {
  border: 1px solid var(--color-border);
  border-radius: theme('borderRadius.md');
  overflow: hidden;
  overflow-y: auto;
  max-height: 260px;
}

.error-table {
  width: 100%;
  border-collapse: collapse;
  font-size: theme('fontSize.sm');

  &__th {
    text-align: left;
    padding: theme('spacing.2') theme('spacing.3');
    font-size: theme('fontSize.xs');
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-secondary);
    background-color: var(--color-bg);
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;

    &--row { width: 56px; }
    &--col { width: 110px; }
  }

  &__row {
    &:not(:last-child) td {
      border-bottom: 1px solid var(--color-border);
    }
  }

  &__td {
    padding: theme('spacing.2') theme('spacing.3');
    color: var(--color-text);
    vertical-align: top;

    &--row {
      color: var(--color-text-secondary);
      font-variant-numeric: tabular-nums;
    }

    &--col {
      font-weight: 500;
      color: #f43f5e;
    }
  }
}

// ── Footer ─────────────────────────────────────────────────────────────────────

.footer-actions {
  display: flex;
  align-items: center;
  gap: theme('spacing.6');
}
</style>
