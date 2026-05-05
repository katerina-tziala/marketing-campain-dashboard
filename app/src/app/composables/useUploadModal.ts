import { computed, provide, type Ref, ref } from 'vue';

import type UploadDataModal from '@/features/data-transfer/components/UploadDataModal.vue';
import { type PortfolioInput, usePortfolioStore } from '@/shared/portfolio';

export function useUploadModal(modalRef: Ref<InstanceType<typeof UploadDataModal> | null>): {
  hasCampaigns: Readonly<Ref<boolean>>;
  showReplaceConfirm: Ref<boolean>;
  requestUpload: () => void;
  handleUploadComplete: (input: PortfolioInput) => void;
  onReplaceConfirm: () => void;
  closeReplaceConfirm: () => void;
} {
  const portfolioStore = usePortfolioStore();
  const showReplaceConfirm = ref(false);
  const hasCampaigns = computed(() => portfolioStore.portfolios.length > 0);

  function openUploadModal(): void {
    modalRef.value?.open();
  }

  function requestUpload(): void {
    if (hasCampaigns.value) {
      showReplaceConfirm.value = true;
    } else {
      openUploadModal();
    }
  }

  function handleUploadComplete(input: PortfolioInput): void {
    portfolioStore.loadPortfolio(input);
  }

  function onReplaceConfirm(): void {
    showReplaceConfirm.value = false;
    openUploadModal();
  }

  function closeReplaceConfirm(): void {
    showReplaceConfirm.value = false;
  }

  provide('openUploadModal', openUploadModal);

  return {
    hasCampaigns,
    showReplaceConfirm,
    requestUpload,
    handleUploadComplete,
    onReplaceConfirm,
    closeReplaceConfirm,
  };
}
