<script setup lang="ts">
import { provide, ref, watch } from 'vue'
import { BaseButton, UploadIcon } from '../ui'
import { ToastContainer } from '../ui/toast'
import { useCampaignStore } from '../stores/campaignStore'
import { useAiStore } from '../stores/aiStore'
import { useAiAnalysisStore } from '../stores/aiAnalysisStore'
import UploadModal from '../features/csv-file/components/UploadModal.vue'
import ReplaceDataModal from '../features/csv-file/components/ReplaceDataModal.vue'
import { AiToolsDrawer } from '../features/ai-tools'

const store = useCampaignStore()
const aiStore = useAiStore()
const analysisStore = useAiAnalysisStore()
const uploadModal = ref<InstanceType<typeof UploadModal> | null>(null)
const showReplaceConfirm = ref(false)

provide('openUploadModal', () => uploadModal.value?.open())
provide('openAiPanel', () => { aiStore.openPanel(); analysisStore.onPanelOpen() })

function onReplaceConfirm(): void {
  showReplaceConfirm.value = false
  uploadModal.value?.open()
}

function onCloseAiPanel(): void {
  aiStore.closePanel()
  analysisStore.onPanelClose()
}
</script>

<template>
  <div class="app-shell">
    <!-- Left column — header + content; compresses when drawer opens at lg+ -->
    <div class="app-shell__left">
      <header class="app-shell__header">
        <h1 class="app-shell__title">Marketing Campaign Dashboard</h1>
        <BaseButton v-if="store.campaigns.length > 0" variant="ghost" @click="showReplaceConfirm = true">
          <UploadIcon />
          Upload CSV
        </BaseButton>
      </header>
      <main class="app-shell__main">
        <slot />
      </main>
    </div>

    <!-- AI drawer — sibling to left column so it pushes everything left at lg+ -->
    <AiToolsDrawer :open="aiStore.aiPanelOpen" @close="onCloseAiPanel" />

    <UploadModal ref="uploadModal" />
    <ReplaceDataModal
      v-if="showReplaceConfirm"
      @confirm="onReplaceConfirm"
      @close="showReplaceConfirm = false"
    />
    <ToastContainer />
  </div>
</template>

<style lang="scss" scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;

  // At lg+: flip to flex row so the drawer pushes the entire left column
  @media (min-width: 1024px) {
    flex-direction: row;
  }

  // ── Left column (header + main content) ────────────────────────────────────

  &__left {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: theme('spacing.4');
    flex-shrink: 0;
    background-color: var(--color-header-bg);
    padding: theme('spacing.5') theme('spacing.6');
    border-bottom: 1px solid var(--color-border);
  }

  &__title {
    font-size: theme('fontSize.2xl');
    font-weight: 800;
    letter-spacing: -0.03em;
    margin: 0;
    background: linear-gradient(135deg, #818cf8 0%, #ec4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  &__main {
    display: flex;
    flex-direction: column;
    flex: 1;
    max-width: 1280px;
    width: 100%;
    margin: 0 auto;
    overflow-x: clip;
    padding: 0 24px;
  }
}
</style>
