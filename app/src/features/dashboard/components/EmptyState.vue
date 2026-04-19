<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { FileTextIcon } from '../../../ui'
import { FileActions } from '../../data-transfer'

onMounted(() => { document.body.style.overflow = 'hidden' })
onUnmounted(() => { document.body.style.overflow = '' })

const emit = defineEmits<{ upload: [] }>()
</script>

<template>
  <div class="empty-state">
    <FileTextIcon class="text-4xl inline-block text-primary-400/60" />
    <h2 class="empty-state-title">No campaign data yet</h2>
    <p class="empty-state-description">
      Upload a CSV file to generate your campaign performance dashboard.<br />
      Need a starting point? Download our sample template.
    </p>
    <FileActions @upload="emit('upload')" />
  </div>
</template>

<style lang="scss" scoped>

.empty-state {
  @apply flex flex-col items-center justify-center text-center p-8 gap-6 m-auto;
}

.empty-state-title {
  @apply text-primary-400 text-xl font-semibold leading-6 tracking-wide;
}

.empty-state-description {
  @apply text-typography text-sm leading-6 tracking-wide;
}
</style>
