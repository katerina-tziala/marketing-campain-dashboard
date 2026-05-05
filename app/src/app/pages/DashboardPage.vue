<script setup lang="ts">
import { ref } from "vue";
import { useDashboardOrchestratorStore } from "@/app/stores";
import { CampaignPerformanceView } from "@/features/campaign-performance";
import {
  ReplaceDataModal,
  UploadDataModal,
  UploadDataPlaceholder,
} from "@/features/data-transfer";
import { useUploadModal } from "@/app/composables/useUploadModal";
import AiTools from "@/features/ai-tools/components/AiTools.vue";
import {
  Button,
  ResponsiveDrawer,
  SparklesIcon,
  SplitPaneLayout,
  UploadIcon,
} from "@/ui";
import logoUrl from "@/assets/logo-v2.svg";
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
      <img
        :src="logoUrl"
        alt=""
        width="69"
        height="auto"
        class="inline-block -mr-3"
      />
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

    <main v-if="!dashboard.hasCampaigns" class="dashboard-main">
      <UploadDataPlaceholder @upload="requestUpload" />
    </main>

    <SplitPaneLayout v-else>
      <!-- Main Dashboard view: Add overview / period comparison / what-if simulator switching here when the comparison view is introduced. -->
      <CampaignPerformanceView>
        <template #header-action>
          <div v-if="dashboard.showAiButton" class="relative shrink-0">
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
  @apply h-screen w-screen grid grid-cols-1 grid-rows-[min-content_1fr] overflow-hidden;
}

.dashboard-header {
  @apply flex
    items-center
    justify-start
    gap-x-2
    shrink-0
    px-6
    py-2.5
    shadow-md
    border-b
    border-primary-deeper
    bg-primary-ink
    min-h-16;
}

.dashboard-title {
  @apply font-semibold grow;

  .title-wrapper {
    @apply bg-gradient-to-r 
    from-accent 
    via-info-light 
    via-info 
    via-info-darker  
    via-primary  
    via-primary-light 
    to-secondary 
    bg-clip-text
    text-transparent
    text-lg
    leading-6
    sm:text-xl
    md:text-2xl md:tracking-wide
    sr-only sm:not-sr-only;
  }
}

.dashboard-main {
  @apply flex flex-col justify-center items-center w-full mx-auto overflow-x-hidden overflow-y-hidden;
}

.connected-status {
  @apply absolute
    -top-1.5
    -right-1.5
    z-10
    w-3.5
    h-3.5
    rounded-full
    bg-surface
    flex
    items-center
    justify-center
    overflow-visible;
  animation: dot-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.connected-status-dot {
  @apply block w-2 h-2 rounded-full bg-success shadow-connection;
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
