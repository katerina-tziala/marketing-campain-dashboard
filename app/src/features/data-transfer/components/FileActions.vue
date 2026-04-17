<script setup lang="ts">
import { DownloadIcon, UploadIcon } from '../../../ui'
import { useDownloadTemplate } from '../composables/useDownloadTemplate'

const emit = defineEmits<{ upload: [] }>()
const { downloadTemplate } = useDownloadTemplate()
</script>

<template>
  <div class="file-actions">
    <button class="btn-primary grow w-full" @click="emit('upload')">
      <UploadIcon />
      Upload
    </button>
    <button class="btn-secondary-outline grow w-full" @click="downloadTemplate">
      <DownloadIcon />
      Download Template
    </button>
  </div>
</template>

<style lang="scss" scoped>
.file-actions {
  @apply flex
  items-center
  gap-6
  mt-2
  w-full
  flex-col
  max-w-md
  xs:flex-row-reverse;
}
</style>
