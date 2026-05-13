<script setup lang="ts">
import { ref } from 'vue';

import { useUploadModal } from '@/app/composables/useUploadModal';
import { useDashboardOrchestratorStore } from '@/app/stores';

import AiTools from '@/features/ai-tools/components/AiTools.vue';
import { CampaignPerformanceView } from '@/features/campaign-performance';
import { ReplaceDataModal, UploadDataModal, UploadDataPlaceholder } from '@/features/data-transfer';
import { AppLogo, Button, ResponsiveDrawer, SparklesIcon, SplitPaneLayout, UploadIcon } from '@/ui';

const dashboard = useDashboardOrchestratorStore();

const uploadModal = ref<InstanceType<typeof UploadDataModal> | null>(null);
const {
  hasCampaigns,
  showReplaceConfirm,
  requestUpload,
  handleUploadComplete,
  onReplaceConfirm,
  closeReplaceConfirm,
} = useUploadModal(uploadModal);
</script>

<template>
  <div class="dashboard-shell">
    <header class="dashboard-header">
      <AppLogo class="w-14" />
      <h1 class="dashboard-title">
        <span class="title-wrapper">Marketing Intelligence Dashboard</span>
      </h1>
      <Button
        v-if="hasCampaigns"
        variant="outline"
        size="small"
        class="shrink-0"
        @click="requestUpload"
      >
        <UploadIcon />
        Upload data
      </Button>
    </header>

    <main
      v-if="!dashboard.hasCampaigns"
      class="dashboard-main"
    >
      <UploadDataPlaceholder @upload="requestUpload" />
    </main>

    <SplitPaneLayout v-else>
      <!-- Main Dashboard view: Add overview / period comparison / what-if simulator switching here when the comparison view is introduced. -->
      <CampaignPerformanceView>
        <template #header-action>
          <div
            v-if="dashboard.showAiButton"
            class="relative shrink-0"
          >
            <Button
              variant="primary"
              size="small"
              @click="dashboard.openAiPanel"
            >
              <SparklesIcon />AI
            </Button>
            <span
              v-if="dashboard.showConnectedDot"
              class="connected-status"
              aria-hidden="true"
            >
              <span class="connected-status-dot" />
            </span>
          </div>
        </template>
      </CampaignPerformanceView>
      <!-- AI Tools -->
      <template #aside>
        <ResponsiveDrawer
          :open="dashboard.aiPanelOpen"
          title="AI Assistant"
          side="right"
          close-label="Close AI panel"
          modal-full-height
          @close="dashboard.closeAiPanel"
        >
          <template #icon>
            <SparklesIcon class="mt-1" />
          </template>
          <AiTools />
        </ResponsiveDrawer>
      </template>
    </SplitPaneLayout>

    <UploadDataModal
      ref="uploadModal"
      @upload-complete="handleUploadComplete"
    />
    <ReplaceDataModal
      v-if="showReplaceConfirm"
      @confirm="onReplaceConfirm"
      @close="closeReplaceConfirm"
    />
  </div>
</template>

<style lang="scss" scoped>
.dashboard-shell {
  @apply grid
  	grid-cols-1
  	grid-rows-[min-content_1fr]
  	h-screen
  	overflow-hidden
  	w-screen;
}

.dashboard-header {
  @apply bg-primary-ink
  	border-b
  	border-primary-deeper
  	flex
  	gap-x-2
  	items-center
  	justify-start
  	min-h-16
  	px-4
  	py-2.5
  	shadow-md
  	shrink-0
  	sm:px-6;
}

.dashboard-title {
  @apply font-semibold
  	grow;

  .title-wrapper {
    @apply bg-clip-text
    	bg-gradient-to-r
    	from-accent
    	leading-6
    	md:text-2xl
    	md:tracking-wide
    	sm:not-sr-only
    	sm:text-xl
    	sr-only
    	text-lg
    	text-transparent
    	to-secondary
    	via-info
    	via-info-darker
    	via-info-light
    	via-primary
    	via-primary-light;
  }
}

.dashboard-main {
  @apply flex
  	flex-col
  	items-center
  	justify-center
  	mx-auto
  	overflow-x-hidden
  	overflow-y-hidden
  	w-full;
}

.connected-status {
  @apply -right-1.5
  	-top-1.5
  	absolute
  	bg-surface
  	flex
  	h-3.5
  	items-center
  	justify-center
  	overflow-visible
  	rounded-full
  	w-3.5
  	z-10;

  animation: dot-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.connected-status-dot {
  @apply bg-success
  	block
  	h-2
  	rounded-full
  	shadow-connection
  	w-2;
}

@keyframes dot-pop {
  from {
    transform: scale(0);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
