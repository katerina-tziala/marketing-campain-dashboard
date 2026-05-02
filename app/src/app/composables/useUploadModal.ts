import { computed, provide, ref, type Ref } from 'vue'
import { usePortfolioStore, type PortfolioInput } from '@/shared/portfolio'
import type UploadDataModal from '@/features/data-transfer/components/UploadDataModal.vue'

export function useUploadModal(modalRef: Ref<InstanceType<typeof UploadDataModal> | null>) {
  const portfolioStore = usePortfolioStore()
  const showReplaceConfirm = ref(false)
  const hasCampaigns = computed(() => portfolioStore.portfolios.length > 0)

  function openUploadModal(): void {
    modalRef.value?.open()
  }

  function requestUpload(): void {
    if (hasCampaigns.value) showReplaceConfirm.value = true
    else openUploadModal()
  }

  function handleUploadComplete(input: PortfolioInput): void {
    portfolioStore.loadPortfolio(input)
  }

  function onReplaceConfirm(): void {
    showReplaceConfirm.value = false
    openUploadModal()
  }

  function closeReplaceConfirm(): void {
    showReplaceConfirm.value = false
  }

  provide('openUploadModal', openUploadModal)

  return { hasCampaigns, showReplaceConfirm, requestUpload, handleUploadComplete, onReplaceConfirm, closeReplaceConfirm }
}
