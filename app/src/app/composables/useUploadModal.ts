import { provide, type Ref, ref } from 'vue';

import type UploadDataModal from '@/features/data-transfer/components/UploadDataModal.vue';
import { type PortfolioInput, usePortfolioStore } from '@/shared/portfolio';

import { useDashboardOrchestratorStore } from '../stores';

export function useUploadModal(modalRef: Ref<InstanceType<typeof UploadDataModal> | null>): {
  showReplaceConfirm: Ref<boolean>;
  requestUpload: () => void;
  handleUploadComplete: (input: PortfolioInput) => void;
  onReplaceConfirm: () => void;
  closeReplaceConfirm: () => void;
} {
  const portfolioStore = usePortfolioStore();
  const dashboard = useDashboardOrchestratorStore();
  const showReplaceConfirm = ref(false);

  function openUploadModal(): void {
    modalRef.value?.open();
  }

  function requestUpload(): void {
    if (dashboard.hasCampaigns) {
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
    showReplaceConfirm,
    requestUpload,
    handleUploadComplete,
    onReplaceConfirm,
    closeReplaceConfirm,
  };
}
