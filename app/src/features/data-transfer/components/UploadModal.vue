<script setup lang="ts">
import { ref, watch } from 'vue'
import { BaseModal } from '../../../ui'
import { parseCsv } from '../utils/parse-csv'
import { getValidationErrorMessage } from '../utils/error-messages'
import { useCampaignStore } from '../../../stores/campaignStore'
import { useDownloadTemplate } from '../composables/useDownloadTemplate'
import type { Campaign } from '../../../common/types/campaign'
import type { CampainDataDuplicateGroup, CampainDataRowError } from '../types'
import UploadCampainData from './UploadCampainData.vue'
import DisplayUploadErrorsStep from './DisplayUploadErrorsStep.vue'
import ResolveDuplicationsStep from './ResolveDuplicationsStep.vue'

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
  duplicateGroups.value = []
}

defineExpose({ open })


// ── Form state (lifted so it survives view switches) ───────────────────────────

const title = ref('')
const file = ref<File | null>(null)
const parseError = ref('')
const isLoading = ref(false)

watch(file, () => { parseError.value = '' })

// ── View state ─────────────────────────────────────────────────────────────────

const view = ref<'form' | 'row-errors' | 'duplicate-rows'>('form')
const pendingTitle = ref('')
const validCampaigns = ref<Campaign[]>([])
const rowErrors = ref<CampainDataRowError[]>([])
const duplicateGroups = ref<CampainDataDuplicateGroup[]>([])

// ── Handlers ───────────────────────────────────────────────────────────────────

async function handleSubmit(): Promise<void> {
  parseError.value = ''
  isLoading.value = true
  const result = await parseCsv(file.value!)
  isLoading.value = false

  const invalidRowsError = result.errors.find((e) => e.type === 'invalid_rows')
  const duplicateError = result.errors.find((e) => e.type === 'duplicate_campaigns')

  if (!invalidRowsError && !duplicateError) {
    if (result.errors.length > 0) {
      parseError.value = getValidationErrorMessage(result.errors[0])
      return
    }
    campaignStore.loadCampaigns(title.value, result.campaigns)
    close()
    return
  }

  pendingTitle.value = title.value
  validCampaigns.value = result.campaigns
  duplicateGroups.value = duplicateError?.duplicateGroups ?? []

  if (invalidRowsError) {
    rowErrors.value = invalidRowsError.rowErrors ?? []
    view.value = 'row-errors'
    return
  }

  view.value = 'duplicate-rows'
}

function handleBackFromErrors(): void {
  view.value = 'form'
  rowErrors.value = []
  validCampaigns.value = []
  duplicateGroups.value = []
}

function handleProceedFromErrors(): void {
  if (duplicateGroups.value.length > 0) {
    view.value = 'duplicate-rows'
    return
  }
  campaignStore.loadCampaigns(pendingTitle.value, validCampaigns.value)
  close()
}

function handleBackFromDuplicates(): void {
  if (rowErrors.value.length > 0) {
    view.value = 'row-errors'
    return
  }
  view.value = 'form'
  validCampaigns.value = []
  duplicateGroups.value = []
}

function handleProceedFromDuplicates(selected: Campaign[]): void {
  campaignStore.loadCampaigns(pendingTitle.value, [...validCampaigns.value, ...selected])
  close()
}
</script>

<template>
  <BaseModal v-if="isOpen" title="Upload Campaign Data" @close="close">
    <UploadCampainData
      v-if="view === 'form'"
      v-model:title="title"
      v-model:file="file"
      :parse-error="parseError"
      :is-loading="isLoading"
      @submit="handleSubmit"
      @close="close"
      @download-template="downloadTemplate"
    />
    <DisplayUploadErrorsStep
      v-else-if="view === 'row-errors'"
      :row-errors="rowErrors"
      :valid-campaigns="validCampaigns"
      :duplicate-group-count="duplicateGroups.length"
      @back="handleBackFromErrors"
      @proceed="handleProceedFromErrors"
      @close="close"
    />
    <ResolveDuplicationsStep
      v-else
      :duplicate-groups="duplicateGroups"
      :valid-campaigns="validCampaigns"
      @back="handleBackFromDuplicates"
      @proceed="handleProceedFromDuplicates"
      @close="close"
    />
  </BaseModal>
</template>
