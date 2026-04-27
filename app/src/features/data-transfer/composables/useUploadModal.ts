import { computed, provide, ref, type Ref } from 'vue'
import { usePortfolioDataStore } from '@/stores/portfolioData.store'
import type UploadDataModal from '@/features/data-transfer/components/UploadDataModal.vue'

export function useUploadModal(modalRef: Ref<InstanceType<typeof UploadDataModal> | null>) {
  const portfolioData = usePortfolioDataStore()
  const showReplaceConfirm = ref(false)
  const hasCampaigns = computed(() => portfolioData.portfolios.length > 0)

  function openUploadModal(): void {
    modalRef.value?.open()
  }

  function requestUpload(): void {
    if (hasCampaigns.value) showReplaceConfirm.value = true
    else openUploadModal()
  }

  function onReplaceConfirm(): void {
    showReplaceConfirm.value = false
    openUploadModal()
  }

  function closeReplaceConfirm(): void {
    showReplaceConfirm.value = false
  }

  provide('openUploadModal', openUploadModal)

  return { hasCampaigns, showReplaceConfirm, requestUpload, onReplaceConfirm, closeReplaceConfirm }
}
