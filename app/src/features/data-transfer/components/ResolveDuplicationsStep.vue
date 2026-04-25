<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Campaign } from '@/shared/types/campaign'
import type { CampainDataDuplicateGroup } from '@/features/data-transfer/types'
import DuplicateSummary from './validation/DuplicateSummary.vue'
import CampainDuplicationsTable from './validation/CampainDuplicationsTable.vue'

const props = defineProps<{
  duplicateGroups: CampainDataDuplicateGroup[]
  validCampaigns: Campaign[]
}>()

const emit = defineEmits<{
  back: []
  proceed: [selectedCampaigns: Campaign[]]
  close: []
}>()

const selectedCampaigns = ref<Campaign[]>([])

const resolvedCount = computed(() => selectedCampaigns.value.length)
const allResolved = computed(() => resolvedCount.value === props.duplicateGroups.length)

const canProceed = computed(
  () => props.validCampaigns.length > 0 || selectedCampaigns.value.length > 0,
)

function onSelectionChange(campaigns: Campaign[]): void {
  selectedCampaigns.value = campaigns
}

function handleProceed(): void {
  emit('proceed', selectedCampaigns.value)
}
</script>

<template>
  <div class="duplicate-body">
    <DuplicateSummary
      :count="duplicateGroups.length"
      variant="resolve"
      :has-valid-campaigns="validCampaigns.length > 0"
    />
    <p class="resolve-indicator" :class="{ resolved: allResolved }">
      <span>Resolve duplicates ({{ resolvedCount }}/{{ duplicateGroups.length }})</span>
    </p>
    <CampainDuplicationsTable :duplicate-groups="duplicateGroups" @change="onSelectionChange" />
  </div>
  <!-- Footer -->
  <div class="modal-footer">
    <button class="btn-primary min-w-24 xs:order-1" @click="emit('back')">Back</button>
    <button class="btn-secondary-outline xs:order-3 xs:mr-auto" :disabled="!canProceed" @click="handleProceed">Proceed with selection</button>
    <button class="btn-secondary-outline min-w-24 xs:order-2" @click="emit('close')">Cancel</button>
  </div>
</template>

<style lang="scss" scoped>
.duplicate-body {
  @apply w-[90vw]
    max-w-4xl
    max-h-screen
    grid
    grid-cols-1
    grid-rows-[min-content_min-content_1fr]
    gap-6
    p-6
    h-fit
    max-h-[75vh]
    xs:max-h-[50vh];
}

.resolve-indicator {
  @apply flex items-center gap-2 text-sm font-semibold text-typography-subtle -mb-3;

  &.resolved {
    @apply text-primary-light;
  }
}
</style>
