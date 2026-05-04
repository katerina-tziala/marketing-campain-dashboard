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
import logoUrl from "@/assets/logo.svg";
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
        alt="Marketing Intelligence Dashboard Logo"
        width="69"
        height="auto"
        class="inline-block -mr-2"
      />
      <h1 class="dashboard-title">
        <span class="title-wrapper">Marketing Intelligence Dashboard</span>
      </h1>
      <div class="shrink-0 mt-1 min-h-9">
        <Button
          v-if="hasCampaigns"
          variant="outline"
          size="small"
          @click="requestUpload"
        >
          <UploadIcon />
          Upload data
        </Button>
      </div>
    </header>

    <main v-if="!dashboard.hasCampaigns" class="dashboard-main">
      <UploadDataPlaceholder @upload="requestUpload" />
    </main>

    <SplitPaneLayout v-else>
      <!-- TODO: Add overview / period comparison / what-if simulator switching here when the comparison view is introduced. -->
      <CampaignPerformanceView
        :show-ai-button="dashboard.showAiButton"
        :show-connected-dot="dashboard.showConnectedDot"
        @ai-click="dashboard.openAiPanel"
      />

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
          <AiTools :panel-open="dashboard.aiPanelOpen" />
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
  @apply font-extrabold
   grow
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

.dashboard-main {
  @apply flex flex-col justify-center items-center w-full mx-auto overflow-x-hidden overflow-y-hidden;
}
</style>
