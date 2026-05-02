import Papa from 'papaparse'
import type { CampaignDataParseResult } from '../types'
import { validateCampaignData } from './validate-campaign-data'

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB

export function isValidCsvFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv'
}

export function parseCsv(file: File): Promise<CampaignDataParseResult> {
  if (!isValidCsvFile(file)) {
    return Promise.resolve({
      campaigns: [],
      errors: [{ type: 'file_type' }],
    })
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return Promise.resolve({
      campaigns: [],
      errors: [{ type: 'file_size' }],
    })
  }

  return new Promise((resolve) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete({ data, meta }) {
        resolve(validateCampaignData(data, meta.fields ?? []))
      },
      error(err) {
        resolve({
          campaigns: [],
          errors: [{ type: 'parse_error', detail: err.message }],
        })
      },
    })
  })
}
