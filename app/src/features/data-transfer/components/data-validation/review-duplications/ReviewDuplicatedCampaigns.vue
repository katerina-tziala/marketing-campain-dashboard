<script setup lang="ts">
import { ref, computed } from "vue";
import type { Campaign } from "@/shared/data";
import { Button, ModalBody, ModalFooter } from "@/ui";
import type { CampainDataDuplicateGroup } from "../../../types";
import { DuplicateSummary } from "../shared";
import CampainDuplicationsTable from "./CampainDuplicationsTable.vue";

const props = defineProps<{
  duplicateGroups: CampainDataDuplicateGroup[];
  validCampaigns: Campaign[];
}>();

const emit = defineEmits<{
  back: [];
  proceed: [selectedCampaigns: Campaign[]];
  close: [];
}>();

const selectedCampaigns = ref<Campaign[]>([]);

const resolvedCount = computed(() => selectedCampaigns.value.length);
const allResolved = computed(
  () => resolvedCount.value === props.duplicateGroups.length,
);

const canProceed = computed(
  () => props.validCampaigns.length > 0 || selectedCampaigns.value.length > 0,
);

function onSelectionChange(campaigns: Campaign[]): void {
  selectedCampaigns.value = campaigns;
}

function handleProceed(): void {
  emit("proceed", selectedCampaigns.value);
}
</script>

<template>
  <ModalBody>
    <div class="body-content">
      <DuplicateSummary
        :count="duplicateGroups.length"
        variant="resolve"
        :has-valid-campaigns="validCampaigns.length > 0"
      />
      <p class="resolve-indicator" :class="{ resolved: allResolved }">
        <span
          >Resolve duplicates ({{ resolvedCount }}/{{
            duplicateGroups.length
          }})</span
        >
      </p>
      <CampainDuplicationsTable
        :duplicate-groups="duplicateGroups"
        :required-selection="validCampaigns.length === 0"
        @change="onSelectionChange"
      />
    </div>
  </ModalBody>
  <ModalFooter>
    <Button class="primary min-w-24 xs:order-1" @click="emit('back')"
      >Back</Button
    >
    <Button
      class="outline xs:order-3 xs:mr-auto"
      :disabled="!canProceed"
      @click="handleProceed"
      >Proceed with selection</Button
    >
    <Button class="outline min-w-24 xs:order-2" @click="emit('close')"
      >Cancel</Button
    >
  </ModalFooter>
</template>

<style lang="scss" scoped>
.body-content {
  @apply w-full max-w-full grid grid-rows-[min-content_1fr] grid-cols-1 gap-4;
}
.resolve-indicator {
  @apply flex items-center gap-2 text-sm font-semibold text-typography-subtle -mb-3;

  &.resolved {
    @apply text-primary-light;
  }
}
</style>
