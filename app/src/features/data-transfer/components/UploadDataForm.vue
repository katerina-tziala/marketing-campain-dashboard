<script setup lang="ts">
import { ref } from "vue";
import type { PortfolioDetails } from "@/shared/portfolio";
import {
  Button,
  DownloadIcon,
  UploadIcon,
  FileDropzone,
  Form,
  FormControl,
  ModalBody,
  ModalFooter,
  PeriodFields,
} from "@/ui";
import type { FileFieldErrorKey, FileFieldValidation } from "@/ui";
import { validateRequired } from "@/ui";
import { MAX_CSV_FILE_SIZE_BYTES } from "../utils";

const props = defineProps<{
  title: string;
  periodFrom: string;
  periodTo: string;
  industry: string;
  file: File | null;
  parseError: string;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  "update:title": [value: string];
  "update:periodFrom": [value: string];
  "update:periodTo": [value: string];
  "update:industry": [value: string];
  "update:file": [value: File | null];
  submit: [details: PortfolioDetails];
  close: [];
  downloadTemplate: [];
}>();

const titleError = ref("");
const fileErrorKey = ref<FileFieldErrorKey | null>(null);
const periodFieldsRef = ref<InstanceType<typeof PeriodFields> | null>(null);
const fileDropzoneRef = ref<InstanceType<typeof FileDropzone> | null>(null);

const fileErrorMessages: Record<FileFieldErrorKey, string> = {
  required: "CSV file is required",
  "file-type": "Only CSV files are accepted",
  "file-size": "File exceeds the 2 MB size limit",
};

function getRequiredFieldError(value: string, label: string): string {
  return validateRequired(value).errorKey ? `${label} is required` : "";
}

function handleFileValidate(result: FileFieldValidation): void {
  fileErrorKey.value = result.errorKey;
}

function handleTitleInput(value: string): void {
  titleError.value = "";
  emit("update:title", value);
}

function handleTitleValidate(): void {
  titleError.value = getRequiredFieldError(props.title, "Report name");
}

function handleSubmit(): void {
  titleError.value = "";
  fileErrorKey.value = null;
  let valid = true;
  const period = periodFieldsRef.value?.validate() ?? null;
  const fileResult = fileDropzoneRef.value?.validate() ?? null;

  titleError.value = getRequiredFieldError(props.title, "Report name");
  if (titleError.value) {
    valid = false;
  }

  if (!period) valid = false;

  if (!fileResult || !fileResult.valid) {
    if (fileResult) fileErrorKey.value = fileResult.errorKey;
    valid = false;
  }

  if (valid && period) {
    emit("submit", {
      name: props.title.trim(),
      period,
      industry: props.industry.trim() || undefined,
    });
  }
}
</script>

<template>
  <ModalBody>
    <Form class="form-body" @submit.prevent="handleSubmit">
      <FormControl
        id="campaign-title"
        label="Campaign Report Name"
        required
        hint-text="Use a name you will recognize later in the dashboard"
        :invalid="Boolean(titleError)"
      >
        <template #default="{ id, invalid, describedBy }">
          <input
            :id="id"
            :value="title"
            class="form-control"
            :class="{ 'input-error': invalid }"
            type="text"
            placeholder="e.g. Q2 2025 Marketing Data"
            autocomplete="off"
            :disabled="isLoading"
            :aria-invalid="invalid ? 'true' : undefined"
            :aria-describedby="describedBy"
            @input="handleTitleInput(($event.target as HTMLInputElement).value)"
            @blur="handleTitleValidate"
          />
        </template>
        <template #error-content>
          {{ titleError }}
        </template>
        <template #error-hint-content>
          Enter a clear name for this report (e.g. Q2 2025 Marketing Data)
        </template>
      </FormControl>

      <PeriodFields
        ref="periodFieldsRef"
        id-prefix="campaign-period"
        :period-from="periodFrom"
        :period-to="periodTo"
        :disabled="isLoading"
        @update:period-from="emit('update:periodFrom', $event)"
        @update:period-to="emit('update:periodTo', $event)"
      />

      <FormControl
        id="campaign-industry"
        label="Industry"
        hint-text="Used to improve recommendations"
      >
        <template #default="{ id, describedBy }">
          <input
            :id="id"
            :value="industry"
            class="form-control"
            type="text"
            placeholder="e.g. Retail, SaaS, Finance"
            autocomplete="organization"
            :disabled="isLoading"
            :aria-describedby="describedBy"
            @input="
              emit('update:industry', ($event.target as HTMLInputElement).value)
            "
          />
        </template>
      </FormControl>
      <FormControl
        id="csv-file"
        label="Upload Data"
        required
        hint-text="Upload a CSV file (max 2 MB)"
        :invalid="Boolean(fileErrorKey || parseError)"
      >
        <template #default="{ id, invalid, describedBy }">
          <FileDropzone
            :id="id"
            ref="fileDropzoneRef"
            :model-value="file"
            :disabled="isLoading"
            required
            accept=".csv,text/csv"
            :max-size-bytes="MAX_CSV_FILE_SIZE_BYTES"
            :invalid="invalid"
            :described-by="describedBy"
            @update:model-value="emit('update:file', $event)"
            @validate="handleFileValidate"
          />
        </template>
        <template #error-content>
          {{ fileErrorKey ? fileErrorMessages[fileErrorKey] : parseError }}
        </template>
        <template #error-hint-content>
          Upload a valid CSV file using the provided template if needed
        </template>
      </FormControl>
    </Form>
  </ModalBody>
  <ModalFooter>
    <Button
      variant="ghost-outline"
      class="sm:mr-auto"
      @click="emit('downloadTemplate')"
    >
      <DownloadIcon />
      Download Template
    </Button>
    <Button variant="outline" class="min-w-24" @click="emit('close')"
      >Cancel</Button
    >
    <Button variant="primary" :disabled="isLoading" @click="handleSubmit">
      <UploadIcon />
      {{ isLoading ? "Uploading data…" : "Upload data" }}
    </Button>
  </ModalFooter>
</template>

<style lang="scss" scoped>
.optional-label {
  @apply text-xs text-typography-subtle font-normal;
}
</style>
