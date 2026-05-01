<script setup lang="ts">
import { ref } from "vue";
import { useDashboardOrchestratorStore } from "@/app/stores";
import { CampaignPerformanceView } from "@/features/campaign-performance";
import { EmptyState, ReplaceDataModal, UploadDataModal } from "@/features/data-transfer";
import { useUploadModal } from "@/app/composables/useUploadModal";
import AiTools from "@/features/ai-tools/components/AiTools.vue";
import { Button, ResponsiveDrawer, SparklesIcon, UploadIcon } from "@/ui";

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
      <h1 class="dashboard-title">
        <span class="title-wrapper">Marketing Intelligence Dashboard</span>
      </h1>
      <div class="shrink-0 mt-1 inline-action-float min-h-9">
        <Button v-if="hasCampaigns" class="outline" @click="requestUpload">
          <UploadIcon />
          Upload CSV
        </Button>
      </div>
    </header>

    <div class="dashboard-body">
      <main class="dashboard-main">
        <EmptyState v-if="!dashboard.hasCampaigns" @upload="requestUpload" />
        <!-- TODO: Add overview / period comparison switching here when the comparison view is introduced. -->
        <CampaignPerformanceView
          v-else
          :show-ai-button="dashboard.showAiButton"
          :show-connected-dot="dashboard.showConnectedDot"
          @ai-click="dashboard.openAiPanel"
        />
      </main>

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
    </div>

    <UploadDataModal ref="uploadModal" @upload-complete="handleUploadComplete" />
    <ReplaceDataModal
      v-if="showReplaceConfirm"
      @confirm="onReplaceConfirm"
      @close="closeReplaceConfirm"
    />
  </div>
</template>

<style lang="scss" scoped>
.dashboard-shell {
  @apply flex flex-col h-screen overflow-hidden;
}

.dashboard-header {
  @apply flex
    items-center
    justify-between
    gap-4
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
  @apply font-extrabold
    m-0;

  .title-wrapper {
    @apply bg-gradient-to-r

    from-accent 
    via-info 
    via-info-light 
    via-primary 
    via-primary-light 
    to-secondary

    bg-clip-text
    text-transparent
    text-lg
    leading-6
    xs:text-2xl;
  }
}

.dashboard-body {
  @apply flex flex-row flex-1 overflow-hidden;
}

.dashboard-main {
  @apply flex flex-col w-full mx-auto overflow-x-hidden overflow-y-hidden;
}
</style>
