<script setup lang="ts">
import { useAiConnectionStore } from '@/features/ai-tools/ai-connection/stores/aiConnection.store'
import AiConnectionForm from '@/features/ai-tools/ai-connection/components/AiConnectionForm.vue'
import AiConnectedStatus from '@/features/ai-tools/ai-connection/components/AiConnectedStatus.vue'
import AiAnalysis from '@/features/ai-tools/ai-analysis/components/AiAnalysis.vue'
import { CloseIcon, SparklesIcon } from '@/ui/icons'

// TODO: [DEV ONLY] Uncomment ONE block below to test dev cycles. Use one at a time.
// ─────────────────────────────────────────────────────────────────────────────
// BLOCK A — Analysis cycle: auto-connects, cycles mock responses + error codes on Analyze.
import { onMounted, onUnmounted } from 'vue'
import { useDevAnalysisCycle } from '@/features/ai-tools/dev/dev-analysis-cycle'
const { activate, deactivate } = useDevAnalysisCycle()
onMounted(activate)
onUnmounted(deactivate)
// ─────────────────────────────────────────────────────────────────────────────
// BLOCK B — Connection cycle: each Connect click cycles through success + all
//           connection error codes (spinner always shows for ~1.5 s; success
//           auto-disconnects after 1.5 s so the next click continues the cycle).
// import { onMounted, onUnmounted } from 'vue'
// import { useDevConnectionCycle } from '@/features/ai-tools/dev/dev-connection-cycle'
// const { activate, deactivate } = useDevConnectionCycle()
// onMounted(activate)
// onUnmounted(deactivate)
// ─────────────────────────────────────────────────────────────────────────────

const store = useAiConnectionStore()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
    <div class="ai-tools-header">
      <SparklesIcon class="ai-tools-header-icon" />
      <h2 class="ai-tools-title">AI Tools</h2>
      <button class="btn-icon-secondary" aria-label="Close AI panel" @click="emit('close')">
        <CloseIcon />
      </button>
    </div>
    <div class="ai-tools-content">
    <!-- Not connected: show connection form -->
    <AiConnectionForm v-if="!store.isConnected" />
    <!-- Connected: status bar + tabs + tab content -->
    <template v-else>
      <div class="ai-tools-analysis">
        <AiConnectedStatus />
        <AiAnalysis />
      </div>
    </template>
    </div>
</template>

<style lang="scss" scoped>
.ai-tools-header {
   @apply flex
      items-center
      justify-start
      border
      border
      gap-2
      py-3
      px-4;
}

.ai-tools-header-icon {
  @apply text-primary-light text-lg shrink-0;
}

.ai-tools-title {
   @apply grow text-primary-light text-lg font-semibold m-0;
}

.ai-tools-content {
  @apply grow shrink-0 overflow-hidden;
}

.ai-tools-analysis {
   @apply h-full
    grid
    grid-cols-1
    grid-rows-[min-content_min-content_1fr]
    overflow-hidden
    pb-4
    ;
}
</style>
