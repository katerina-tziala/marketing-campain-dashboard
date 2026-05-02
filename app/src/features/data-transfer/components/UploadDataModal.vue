<script setup lang="ts">
import { ref, watch } from "vue";
import type { Campaign } from "@/shared/data";
import type { PortfolioDetails, PortfolioInput } from "@/shared/portfolio";
import { Modal } from "@/ui";
import type {
  CampaignDataDuplicateGroup,
  CampaignDataRowError,
} from "../types";
import { parseCsv, getValidationErrorMessage } from "../utils";
import { useDownloadTemplate } from "../composables";
import {
  ReviewErrorsComponent,
  ReviewDuplicatedCampaigns,
} from "./data-validation";
import UploadDataForm from "./UploadDataForm.vue";

const { downloadTemplate } = useDownloadTemplate();

const emit = defineEmits<{
  "upload-complete": [portfolio: PortfolioInput];
}>();

// ── Open / close ───────────────────────────────────────────────────────────────

const isOpen = ref(false);

function open(): void {
  isOpen.value = true;
}

function close(): void {
  isOpen.value = false;
  view.value = "form";
  title.value = "";
  periodFrom.value = "";
  periodTo.value = "";
  industry.value = "";
  file.value = null;
  parseError.value = "";
  rowErrors.value = [];
  validCampaigns.value = [];
  duplicateGroups.value = [];
  pendingPortfolioDetails.value = null;
}

defineExpose({ open });

// ── Form state (lifted so it survives view switches) ───────────────────────────

const title = ref("");
const periodFrom = ref("");
const periodTo = ref("");
const industry = ref("");
const file = ref<File | null>(null);
const parseError = ref("");
const isLoading = ref(false);

watch(file, () => {
  parseError.value = "";
});

// ── View state ─────────────────────────────────────────────────────────────────

const view = ref<"form" | "row-errors" | "duplicate-rows">("form");
const pendingPortfolioDetails = ref<PortfolioDetails | null>(null);
const validCampaigns = ref<Campaign[]>([]);
const rowErrors = ref<CampaignDataRowError[]>([]);
const duplicateGroups = ref<CampaignDataDuplicateGroup[]>([]);

// ── Handlers ───────────────────────────────────────────────────────────────────

function toPortfolioInput(campaigns: Campaign[], details: PortfolioDetails): PortfolioInput {
  return {
    ...details,
    campaigns,
  };
}

async function handleSubmit(details: PortfolioDetails): Promise<void> {
  parseError.value = "";
  pendingPortfolioDetails.value = details;
  isLoading.value = true;
  const result = await parseCsv(file.value!);
  isLoading.value = false;

  const invalidRowsError = result.errors.find((e) => e.type === "invalid_rows");
  const duplicateError = result.errors.find(
    (e) => e.type === "duplicate_campaigns",
  );

  if (!invalidRowsError && !duplicateError) {
    if (result.errors.length > 0) {
      parseError.value = getValidationErrorMessage(result.errors[0]);
      return;
    }
    emit("upload-complete", toPortfolioInput(result.campaigns, details));
    close();
    return;
  }

  validCampaigns.value = result.campaigns;
  duplicateGroups.value = duplicateError?.duplicateGroups ?? [];

  if (invalidRowsError) {
    rowErrors.value = invalidRowsError.rowErrors ?? [];
    view.value = "row-errors";
    return;
  }

  view.value = "duplicate-rows";
}

function handleBackFromErrors(): void {
  view.value = "form";
  rowErrors.value = [];
  validCampaigns.value = [];
  duplicateGroups.value = [];
}

function handleProceedFromErrors(): void {
  if (!pendingPortfolioDetails.value) return;

  if (duplicateGroups.value.length > 0) {
    view.value = "duplicate-rows";
    return;
  }
  emit(
    "upload-complete",
    toPortfolioInput(validCampaigns.value, pendingPortfolioDetails.value),
  );
  close();
}

function handleBackFromDuplicates(): void {
  if (rowErrors.value.length > 0) {
    view.value = "row-errors";
    return;
  }
  handleBackFromErrors();
}

function handleProceedFromDuplicates(selected: Campaign[]): void {
  if (!pendingPortfolioDetails.value) return;

  emit(
    "upload-complete",
    toPortfolioInput(
      [...validCampaigns.value, ...selected],
      pendingPortfolioDetails.value,
    ),
  );
  close();
}
</script>

<template>
  <Modal
    v-if="isOpen"
    title="Upload Campaign Data"
    :size="view === 'form' ? 'default' : 'large'"
    @close="close"
  >
    <UploadDataForm
      v-if="view === 'form'"
      v-model:title="title"
      v-model:period-from="periodFrom"
      v-model:period-to="periodTo"
      v-model:industry="industry"
      v-model:file="file"
      :parse-error="parseError"
      :is-loading="isLoading"
      @submit="handleSubmit"
      @close="close"
      @download-template="downloadTemplate"
    />
    <ReviewErrorsComponent
      v-else-if="view === 'row-errors'"
      :row-errors="rowErrors"
      :valid-campaigns="validCampaigns"
      :duplicate-group-count="duplicateGroups.length"
      @back="handleBackFromErrors"
      @proceed="handleProceedFromErrors"
      @close="close"
    />
    <ReviewDuplicatedCampaigns
      v-else
      :duplicate-groups="duplicateGroups"
      :valid-campaigns="validCampaigns"
      @back="handleBackFromDuplicates"
      @proceed="handleProceedFromDuplicates"
      @close="close"
    />
  </Modal>
</template>
