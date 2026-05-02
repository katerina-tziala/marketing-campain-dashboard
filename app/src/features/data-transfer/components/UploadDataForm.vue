<script setup lang="ts">
import { ref } from 'vue'
import type { PortfolioDetails } from '@/shared/portfolio'
import { APP_LOCALE } from '@/shared/utils'
import { Button, DownloadIcon, UploadIcon, FileDropzone, ModalFooter } from '@/ui'
import { isValidCsvFile } from '../utils'

const props = defineProps<{
  title: string
  periodFrom: string
  periodTo: string
  industry: string
  file: File | null
  parseError: string
  isLoading: boolean
}>()

const emit = defineEmits<{
  'update:title': [value: string]
  'update:periodFrom': [value: string]
  'update:periodTo': [value: string]
  'update:industry': [value: string]
  'update:file': [value: File | null]
  submit: [details: PortfolioDetails]
  close: []
  downloadTemplate: []
}>()

const titleError = ref('')
const periodError = ref('')
const fileError = ref('')

const dateFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const dateParts = dateFormatter.formatToParts(new Date(2025, 0, 31))
const dateFormatLabel = dateParts
  .map(part => {
    if (part.type === 'day') return 'DD'
    if (part.type === 'month') return 'MM'
    if (part.type === 'year') return 'YYYY'
    return part.value
  })
  .join('')
const dateFormatExample = dateFormatter.format(new Date(2025, 0, 31))

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function parseLocaleDate(value: string): Date | null {
  const trimmedValue = value.trim()
  const pattern = dateParts
    .map(part => {
      if (part.type === 'day' || part.type === 'month') return '(\\d{2})'
      if (part.type === 'year') return '(\\d{4})'
      return escapeRegExp(part.value)
    })
    .join('')
  const match = new RegExp(`^${pattern}$`).exec(trimmedValue)

  if (!match) return null

  const dateValues: Partial<Record<'day' | 'month' | 'year', number>> = {}
  let matchIndex = 1

  for (const part of dateParts) {
    if (part.type !== 'day' && part.type !== 'month' && part.type !== 'year') continue
    dateValues[part.type] = Number(match[matchIndex])
    matchIndex += 1
  }

  const day = dateValues.day
  const month = dateValues.month
  const year = dateValues.year

  if (!day || !month || !year) return null

  const date = new Date(Date.UTC(year, month - 1, day))
  const isValid =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day

  return isValid ? date : null
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
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
  periodError.value = ''
  fileError.value = ''
  let valid = true
  const periodFrom = parseLocaleDate(props.periodFrom)
  const periodTo = parseLocaleDate(props.periodTo)

  if (!props.title.trim()) {
    titleError.value = 'Campaign title is required'
    valid = false
  }
  if (!props.periodFrom.trim() || !props.periodTo.trim()) {
    periodError.value = `Campaign period is required. Use ${dateFormatLabel}.`
    valid = false
  } else if (!periodFrom || !periodTo) {
    periodError.value = `Enter a valid campaign period using ${dateFormatLabel}.`
    valid = false
  } else if (periodFrom.getTime() > periodTo.getTime()) {
    periodError.value = 'From date must be before or equal to To date.'
    valid = false
  }
  if (!props.file) {
    fileError.value = 'Please select a CSV file'
    valid = false
  }
  if (valid && periodFrom && periodTo) {
    emit('submit', {
      name: props.title.trim(),
      period: {
        from: toIsoDate(periodFrom),
        to: toIsoDate(periodTo),
      },
      industry: props.industry.trim() || undefined,
    })
  }
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
    <fieldset
      class="period-fieldset"
      :aria-invalid="periodError ? 'true' : undefined"
      :aria-describedby="periodError ? 'campaign-period-hint campaign-period-error' : 'campaign-period-hint'"
    >
      <legend class="field-label">Period</legend>
      <p id="campaign-period-hint" class="field-error-hint">
        Use {{ dateFormatLabel }}, for example {{ dateFormatExample }}.
      </p>
      <div class="period-fields">
        <div class="field">
          <label class="field-label" for="campaign-period-from">From</label>
          <input
            id="campaign-period-from"
            :value="periodFrom"
            class="form-control"
            :class="{ 'input-error': periodError }"
            type="text"
            inputmode="numeric"
            :placeholder="dateFormatExample"
            autocomplete="off"
            required
            :aria-describedby="periodError ? 'campaign-period-hint campaign-period-error' : 'campaign-period-hint'"
            :disabled="isLoading"
            @input="emit('update:periodFrom', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div class="field">
          <label class="field-label" for="campaign-period-to">To</label>
          <input
            id="campaign-period-to"
            :value="periodTo"
            class="form-control"
            :class="{ 'input-error': periodError }"
            type="text"
            inputmode="numeric"
            :placeholder="dateFormatExample"
            autocomplete="off"
            required
            :aria-describedby="periodError ? 'campaign-period-hint campaign-period-error' : 'campaign-period-hint'"
            :disabled="isLoading"
            @input="emit('update:periodTo', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
      <p
        v-if="periodError"
        id="campaign-period-error"
        class="field-error"
        role="alert"
      >
        {{ periodError }}
      </p>
    </fieldset>
    <div class="field">
      <label class="field-label" for="campaign-industry">Industry <span class="optional-label">(optional)</span></label>
      <input
        id="campaign-industry"
        :value="industry"
        class="form-control"
        type="text"
        placeholder="e.g. Retail"
        autocomplete="organization"
        :disabled="isLoading"
        @input="emit('update:industry', ($event.target as HTMLInputElement).value)"
      />
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
    <Button variant="primary" :disabled="isLoading" @click="handleSubmit">
      <UploadIcon />
      {{ isLoading ? 'Uploading…' : 'Upload' }}
    </Button>
    <Button
      variant="outline"
      class="xs:order-3 xs:mr-auto"
      @click="emit('downloadTemplate')"
    >
      <DownloadIcon />
      Download Template
    </Button>
    <Button variant="outline" class="min-w-24 xs:order-2" @click="emit('close')">Cancel</Button>
  </ModalFooter>
</template>

<style lang="scss" scoped>
.form-body {
  @apply p-6 overflow-y-auto w-[90vw] max-w-2xl;
}

.period-fieldset {
  @apply border-0 p-0 m-0 flex flex-col gap-2.5;
}

.period-fields {
  @apply grid grid-cols-1 gap-3 xs:grid-cols-2;
}

.optional-label {
  @apply text-typography-subtle font-normal;
}
</style>
