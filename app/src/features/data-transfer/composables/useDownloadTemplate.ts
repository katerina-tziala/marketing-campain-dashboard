import { downloadCsv } from '../utils/download-csv'
import { MOCK_CAMPAINS } from '../../../common/data/MOCK_CAMPAIN_DATA'
import { useToastStore } from '../../../stores/toastStore'

export function useDownloadTemplate() {
  const toastStore = useToastStore()

  function downloadTemplate(): void {
    try {
      downloadCsv(MOCK_CAMPAINS, 'marketing_campain_sample')
    } catch {
      toastStore.showErrorToast('Failed to generate the CSV template. Please try again.')
    }
  }

  return { downloadTemplate }
}
