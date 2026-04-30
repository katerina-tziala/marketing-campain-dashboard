<script setup lang="ts">
import AiToolsContent from '@/features/ai-tools/components/AiToolsContent.vue'
import { ResponsiveDrawer, SparklesIcon } from '@/ui'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <ResponsiveDrawer
    :open="open"
    title="AI Assistant"
    side="right"
    close-label="Close AI panel"
    @close="emit('close')"
  >
    <template #icon>
      <SparklesIcon class="mt-1" />
    </template>

    <AiToolsContent />
  </ResponsiveDrawer>
</template>
