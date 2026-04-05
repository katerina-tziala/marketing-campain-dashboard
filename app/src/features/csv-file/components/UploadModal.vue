<script setup lang="ts">
import { ref, watch } from 'vue'
import { BaseModal } from '../../../ui'
import { parseCsv } from '../utils/parseCsv'
import { useCampaignStore } from '../../../stores/campaignStore'
import { useDownloadTemplate } from '../composables/useDownloadTemplate'
import type { Campaign } from '../../../common/types/campaign'
import type { CsvRowError } from '../types'
import CsvUploadForm from './CsvUploadForm.vue'
import CsvErrorTable from './CsvErrorTable.vue'

const campaignStore = useCampaignStore()
const { downloadTemplate } = useDownloadTemplate()

// ── Open / close ───────────────────────────────────────────────────────────────

const isOpen = ref(false)

function open(): void {
  isOpen.value = true
}

function close(): void {
  isOpen.value = false
  view.value = 'form'
  title.value = ''
  file.value = null
  parseError.value = ''
  rowErrors.value = []
  validCampaigns.value = []
}

defineExpose({ open })


// ── Form state (lifted so it survives view switches) ───────────────────────────

const title = ref('')
const file = ref<File | null>(null)
const parseError = ref('')
const isLoading = ref(false)

watch(file, () => { parseError.value = '' })

// ── Error view state ───────────────────────────────────────────────────────────

const view = ref<'form' | 'row-errors'>('form')
const pendingTitle = ref('')
const validCampaigns = ref<Campaign[]>([])
const rowErrors = ref<CsvRowError[]>([])

// ── Handlers ───────────────────────────────────────────────────────────────────

async function handleSubmit(): Promise<void> {
  parseError.value = ''
  isLoading.value = true
  const result = await parseCsv(file.value!)
  isLoading.value = false

  if (result.errors.length === 0) {
    campaignStore.loadCampaigns(title.value, result.campaigns)
    close()
    return
  }

  const err = result.errors[0]

  if (err.type === 'file_size' || err.type === 'empty_file') {
    parseError.value = err.message
    return
  }

  if (err.type === 'missing_columns') {
    const cols = (err.details ?? []).join(', ')
    parseError.value = `CSV file headers are missing: ${cols}. Please consult the template.`
    return
  }

  if (err.type === 'invalid_rows') {
    pendingTitle.value = title.value
    validCampaigns.value = result.campaigns
    rowErrors.value = err.rowErrors ?? []
    view.value = 'row-errors'
    return
  }

  // Fallback for file_type errors not caught by the inline check
  parseError.value = err.message
}

function handleBack(): void {
  view.value = 'form'
  rowErrors.value = []
  validCampaigns.value = []
}

function handleProceed(): void {
  campaignStore.loadCampaigns(pendingTitle.value, validCampaigns.value)
  close()
}
</script>

<template>
  <BaseModal v-if="isOpen" title="Upload Campaign Data" @close="close">
    <CsvUploadForm
      v-if="view === 'form'"
      v-model:title="title"
      v-model:file="file"
      :parse-error="parseError"
      :is-loading="isLoading"
      @submit="handleSubmit"
      @close="close"
      @download-template="downloadTemplate"
    />
    <CsvErrorTable
      v-else
      :row-errors="rowErrors"
      :valid-campaigns="validCampaigns"
      @back="handleBack"
      @proceed="handleProceed"
      @close="close"
    />
  </BaseModal>
</template>
