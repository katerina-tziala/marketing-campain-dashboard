<script setup lang="ts">
import { provide, ref } from 'vue'
import { UploadIcon } from '../ui'
import { ToastContainer } from '../ui/toast'
import { useAiStore } from '../stores/aiStore'
import { useAiAnalysisStore } from '../stores/aiAnalysisStore'
import { useUploadModal } from '../features/csv-file/composables/useUploadModal'
import UploadModal from '../features/csv-file/components/UploadModal.vue'
import ReplaceDataModal from '../features/csv-file/components/ReplaceDataModal.vue'
import AiToolsDrawer from './AiToolsDrawer.vue'

const aiStore = useAiStore()
const analysisStore = useAiAnalysisStore()
const uploadModal = ref<InstanceType<typeof UploadModal> | null>(null)
const { hasCampaigns, showReplaceConfirm, requestUpload, onReplaceConfirm, closeReplaceConfirm } = useUploadModal(uploadModal)

provide('openAiPanel', () => { aiStore.openPanel(); analysisStore.onPanelOpen() })

function onCloseAiPanel(): void {
  aiStore.closePanel()
  analysisStore.onPanelClose()
}
</script>

<template>
  <div class="app-shell">
    <!-- Left column — header + content; compresses when drawer opens at lg+ -->
    <div class="shell-left">
      <header class="shell-header">
        <h1 class="shell-title">Marketing Campaign Dashboard</h1>
        <button v-if="hasCampaigns" class="btn-secondary-outline" @click="requestUpload">
          <UploadIcon />
          Upload CSV
        </button>
      </header>
      <main class="shell-main">
        <slot />
      </main>
    </div>

    <!-- AI drawer — sibling to left column so it pushes everything left at lg+ -->
    <AiToolsDrawer :open="aiStore.aiPanelOpen" @close="onCloseAiPanel" />

    <UploadModal ref="uploadModal" />
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

  @media (min-width: 1024px) {
    @apply flex-row;
  }
}

.shell-left {
  @apply flex flex-col flex-1 min-w-0 overflow-y-auto;
}

.shell-header {
  @apply flex items-center justify-between gap-4 shrink-0 px-6 py-5;
  background-color: var(--color-header-bg);
  border-bottom: 1px solid var(--color-border);
}

.shell-title {
  @apply text-2xl font-extrabold tracking-tight m-0;
  background: linear-gradient(135deg, #818cf8 0%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.shell-main {
  @apply flex flex-col flex-1 w-full mx-auto overflow-x-clip px-6;
  max-width: 1280px;
}
</style>
