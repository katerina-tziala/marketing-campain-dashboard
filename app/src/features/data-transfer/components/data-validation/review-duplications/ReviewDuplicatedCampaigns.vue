<script setup lang="ts">
import { computed, ref } from 'vue';

import type { Campaign } from '@/shared/data';
import { Button, ModalBody, ModalFooter } from '@/ui';

import type { CampaignDataDuplicateGroup } from '../../../types';
import { DuplicateSummary } from '../shared';
import CampaignDuplicationsTable from './CampaignDuplicationsTable.vue';

const props = defineProps<{
  duplicateGroups: CampaignDataDuplicateGroup[];
  validCampaigns: Campaign[];
  hasPreviousErrors: boolean;
}>();

const emit = defineEmits<{
  back: [];
  proceed: [selectedCampaigns: Campaign[]];
  close: [];
}>();

const selectedCampaigns = ref<Campaign[]>([]);

const requiredSelection = computed(() => props.validCampaigns.length === 0);
const resolvedCount = computed(() => selectedCampaigns.value.length);
const allResolved = computed(() => resolvedCount.value === props.duplicateGroups.length);
const backLabel = computed(() => (props.hasPreviousErrors ? 'Review errors' : 'Fix file'));
const importLabel = computed(() => {
  if (selectedCampaigns.value.length > 0) {
    return `Import selected rows (${selectedCampaigns.value.length})`;
  }
  if (requiredSelection.value) {
    return 'Import selected rows';
  }
  return 'Import without duplicates';
});

const canProceed = computed(
  () => props.validCampaigns.length > 0 || selectedCampaigns.value.length > 0,
);

function onSelectionChange(campaigns: Campaign[]): void {
  selectedCampaigns.value = campaigns;
}

function handleProceed(): void {
  emit('proceed', selectedCampaigns.value);
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
      <p
        class="resolve-indicator"
        :class="{ resolved: allResolved }"
      >
        <span>Resolve duplicates ({{ resolvedCount }}/{{ duplicateGroups.length }})</span>
      </p>
      <CampaignDuplicationsTable
        :duplicate-groups="duplicateGroups"
        :required-selection="requiredSelection"
        @change="onSelectionChange"
      />
    </div>
  </ModalBody>
  <ModalFooter>
    <Button
      variant="outline"
      class="min-w-24 sm:mr-auto"
      @click="emit('close')"
      >Cancel</Button
    >
    <Button
      variant="outline"
      :disabled="!canProceed"
      @click="handleProceed"
      >{{ importLabel }}</Button
    >
    <Button
      variant="primary"
      class="min-w-24"
      @click="emit('back')"
      >{{ backLabel }}</Button
    >
  </ModalFooter>
</template>

<style lang="scss" scoped>
.body-content {
  @apply w-full
    max-w-full
    grid
    grid-rows-[min-content_1fr]
    grid-cols-1
    gap-4;
}

.resolve-indicator {
  @apply flex
    items-center
    gap-2
    text-sm
    font-semibold
    text-typography-subtle
    -mb-3;

  &.resolved {
    @apply text-primary-light;
  }
}
</style>
