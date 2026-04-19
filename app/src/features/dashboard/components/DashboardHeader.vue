<script setup lang="ts">
import { computed } from 'vue'
import { SparklesIcon } from '../../../ui'
import { useCampaignStore } from '../../../stores/campaignStore'
import { useAiStore } from '../../../stores/aiStore'

const store = useCampaignStore()
const aiStore = useAiStore()

const emit = defineEmits<{ 'aiClick': [] }>()

const selectedChannelCount = computed(() =>
  store.selectedChannels.length === 0
    ? store.availableChannels.length
    : store.selectedChannels.length,
)

const showConnectedDot = computed(() => aiStore.isConnected && !aiStore.aiPanelOpen)
</script>

<template>
  <div class="dashboard-title-row">
    <h2 class="dashboard-title">Campaign Performance</h2>
    <div class="ai-btn-wrapper">
      <button
        class="btn-primary"
        :disabled="aiStore.aiPanelOpen"
        @click="emit('aiClick')"
      >
        <SparklesIcon />AI
      </button>
      <span v-if="showConnectedDot" class="connected-dot connected-status" aria-hidden="true" />
    </div>
  </div>
  <p class="dashboard-details">
    <span class="detail-item">{{ store.title }}</span>
    <span class="detail-item">{{ store.filteredCampaigns.length }} of {{ store.campaigns.length }} campaigns</span>
    <span class="detail-item">{{ selectedChannelCount }} of {{ store.availableChannels.length }} channels</span>
  </p>
</template>

<style lang="scss" scoped>
.dashboard-title-row {
  @apply flex items-start justify-center gap-x-4 gap-y-2;

  .dashboard-title {
    @apply grow text-lg font-semibold tracking-wider text-primary-400 pt-1;
  }
}

.dashboard-details {
  @apply text-sm text-typography;
}

.ai-btn-wrapper {
  @apply relative shrink-0;
}

.connected-status {
  @apply
  absolute
  -top-1
  -right-1
  w-3
  h-3
  rounded-full
  bg-surface
  flex
  items-center
  justify-center
  overflow-visible;
}
</style>
