import { computed, provide, ref, type Ref } from 'vue'
import { useCampaignStore } from '../../../stores/campaignStore'
import type UploadModal from '../components/UploadModal.vue'

export function useUploadModal(modalRef: Ref<InstanceType<typeof UploadModal> | null>) {
  const campaignStore = useCampaignStore()
  const showReplaceConfirm = ref(false)
  const hasCampaigns = computed(() => campaignStore.campaigns.length > 0)

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
