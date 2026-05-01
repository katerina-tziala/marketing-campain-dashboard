import { CAMPAIGNS_SAMPLE } from '@/shared/data'
import { useToastStore } from '@/app/stores'
import { downloadCsv } from '../utils'

export function useDownloadTemplate() {
  const toastStore = useToastStore()

  function downloadTemplate(): void {
    try {
      downloadCsv(CAMPAIGNS_SAMPLE, 'marketing_campain_sample')
    } catch {
      toastStore.showErrorToast('Failed to generate the CSV template.', 'Please try again.')
    }
  }

  return { downloadTemplate }
}
