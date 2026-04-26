<script setup lang="ts">
import { computed } from 'vue'
import { SparklesIcon, MetaRow, MetaItem } from '@/ui'
import { useCampaignStore } from '@/stores/campaign.store'
import { useAiConnectionStore } from '@/features/ai-tools/ai-connection/stores/aiConnection.store'
 
// inputs ?
const store = useCampaignStore()
const aiStore = useAiConnectionStore()

const emit = defineEmits<{ 'aiClick': [] }>()

const selectedChannelCount = computed(() =>
  store.selectedChannelsIds.length === 0
    ? store.portfolioChannels.size
    : store.selectedChannelsIds.length,
)

const showConnectedDot = computed(() => aiStore.isConnected && !aiStore.aiPanelOpen)
</script>

<template>
  <div class="dashboard-title-row">
    <h2 class="grow pt-1">Campaign Performance</h2>
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
  <MetaRow class="bullet text-typography-subtle">
    <MetaItem>{{ store.title }}</MetaItem>
    <MetaItem>{{ selectedChannelCount }} of {{ store.portfolioChannels.size }} channels</MetaItem>
    <MetaItem>{{ store.filteredCampaigns.length }} of {{ store.campaigns.length }} campaigns</MetaItem>
  </MetaRow>
</template>

<style lang="scss" scoped>
.dashboard-title-row {
  @apply flex items-start justify-center gap-x-4 gap-y-2;

  // .dashboard-title {
  //   @apply grow text-lg font-semibold tracking-wider text-primary-light pt-1;
  // }
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
  animation: dot-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes dot-pop {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
</style>
