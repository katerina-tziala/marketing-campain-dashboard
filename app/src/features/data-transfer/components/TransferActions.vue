<script setup lang="ts">
import { Button, DownloadIcon, UploadIcon } from '@/ui'
import { useDownloadTemplate } from '../composables'

const emit = defineEmits<{ upload: [] }>()
const { downloadTemplate } = useDownloadTemplate()
</script>

<template>
  <div class="file-actions">
    <Button variant="primary" class="grow w-full" @click="emit('upload')">
      <UploadIcon />
      Upload
    </Button>
    <Button variant="outline" class="grow w-full" @click="downloadTemplate">
      <DownloadIcon />
      Download Template
    </Button>
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
