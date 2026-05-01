<script setup lang="ts">
import { provide, ref } from "vue";
import { Button, UploadIcon, ToastContainer } from "@/ui";
import { useDashboardOrchestratorStore } from "@/app/stores";
import { UploadDataModal, ReplaceDataModal } from "@/features/data-transfer";
import { useUploadModal } from "@/app/composables/useUploadModal";
import AiToolsDrawer from "./AiToolsDrawer.vue";

const dashboard = useDashboardOrchestratorStore();
const uploadModal = ref<InstanceType<typeof UploadDataModal> | null>(null);
const {
  hasCampaigns,
  showReplaceConfirm,
  requestUpload,
  onReplaceConfirm,
  closeReplaceConfirm,
} = useUploadModal(uploadModal);

provide("openAiPanel", dashboard.openAiPanel);
</script>

<template>
  <div class="app-shell">
    <!-- Header — full width, never compressed by drawer -->
    <header class="shell-header">
      <h1 class="shell-title">
        <span class="title-wrapper">Marketing Intelligence Dashboard</span>
      </h1>
      <div class="shrink-0 mt-1 inline-action-float min-h-9">
        <Button v-if="hasCampaigns" class="outline" @click="requestUpload">
          <UploadIcon />
          Upload CSV
        </Button>
      </div>
    </header>

    <!-- Body row — main content + AI drawer side by side -->
    <div class="shell-body">
      <main class="shell-main">
        <slot />
      </main>
      <!-- AI drawer — sibling to main only, so header stays full width -->
      <AiToolsDrawer
        :open="dashboard.aiPanelOpen"
        @close="dashboard.closeAiPanel"
      />
    </div>

    <UploadDataModal ref="uploadModal" />
    <ReplaceDataModal
      v-if="showReplaceConfirm"
      @confirm="onReplaceConfirm"
      @close="closeReplaceConfirm"
    />
    <ToastContainer />
  </div>
</template>

<style lang="scss" scoped>
.app-shell {
  @apply flex flex-col h-screen overflow-hidden;
}

.shell-header {
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

.shell-title {
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

.shell-body {
  @apply flex flex-row flex-1 overflow-hidden;
}

.shell-main {
  @apply flex flex-col w-full mx-auto overflow-x-hidden overflow-y-hidden;
}
</style>
