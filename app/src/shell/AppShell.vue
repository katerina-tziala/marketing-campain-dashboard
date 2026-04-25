<script setup lang="ts">
import { provide, ref } from 'vue'
import { UploadIcon } from '@/ui'
import { ToastContainer } from '@/ui/toast'
import { useAiConnectionStore } from '@/features/ai-tools/ai-connection/stores/aiConnection.store'
import { useAiAnalysisStore } from '@/stores/aiAnalysis.store'
import { useUploadModal, UploadModal, ReplaceDataModal } from '@/features/data-transfer'
import AiToolsDrawer from './AiToolsDrawer.vue'

const aiStore = useAiConnectionStore()
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
    <!-- Header — full width, never compressed by drawer -->
    <header class="shell-header">
      <h1 class="shell-title">Marketing Campaign Dashboard</h1>
      <button v-if="hasCampaigns" class="btn-secondary-outline" @click="requestUpload">
        <UploadIcon />
        Upload CSV
      </button>
    </header>

    <!-- Body row — main content + AI drawer side by side -->
    <div class="shell-body">
      <main class="shell-main">
        <slot />
      </main>
      <!-- AI drawer — sibling to main only, so header stays full width -->
      <AiToolsDrawer :open="aiStore.aiPanelOpen" @close="onCloseAiPanel" />
    </div>

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
    border-primary-900;
}

.shell-title {
  @apply text-2xl
    font-extrabold
    m-0
    leading-9
    bg-gradient-to-r
    from-primary-500 via-purple-500 to-secondary-500
    bg-clip-text
    text-transparent;
}

.shell-body {
  @apply flex flex-row flex-1 overflow-hidden;
}

.shell-main {
  @apply flex flex-col w-full mx-auto overflow-x-hidden overflow-y-hidden;
}
</style>
