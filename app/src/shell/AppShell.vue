<script setup lang="ts">
import { provide, ref } from "vue";
import { Button, UploadIcon } from "@/ui";
import { ToastContainer } from "@/ui/toast";
import { useAiConnectionStore } from "@/features/ai-tools/ai-connection/stores/aiConnection.store";
import { useAiAnalysisStore } from "@/stores/aiAnalysis.store";
import {
  useUploadModal,
  UploadDataModal,
  ReplaceDataModal,
} from "@/features/data-transfer";
import AiToolsDrawer from "./AiToolsDrawer.vue";

const aiStore = useAiConnectionStore();
const analysisStore = useAiAnalysisStore();
const uploadModal = ref<InstanceType<typeof UploadDataModal> | null>(null);
const {
  hasCampaigns,
  showReplaceConfirm,
  requestUpload,
  onReplaceConfirm,
  closeReplaceConfirm,
} = useUploadModal(uploadModal);

provide("openAiPanel", () => {
  aiStore.openPanel();
  analysisStore.onPanelOpen();
});

function onCloseAiPanel(): void {
  aiStore.closePanel();
  analysisStore.onPanelClose();
}
</script>

<template>
  <div class="app-shell">
    <!-- Header — full width, never compressed by drawer -->
    <header class="shell-header">
      <h1 class="shell-title">
        <span class="title-wrapper">Marketing Campaign Dashboard</span>
      </h1>
      <Button
        v-if="hasCampaigns"
        class="outline shrink-0 float-right ml-2 mb-1"
        @click="requestUpload"
      >
        <UploadIcon />
        Upload CSV
      </Button>
    </header>

    <!-- Body row — main content + AI drawer side by side -->
    <div class="shell-body">
      <main class="shell-main">
        <slot />
      </main>
      <!-- AI drawer — sibling to main only, so header stays full width -->
      <AiToolsDrawer :open="aiStore.aiPanelOpen" @close="onCloseAiPanel" />
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
    py-3
    shadow-md
    border-b
    border-primary-deeper
    bg-primary-ink;
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
