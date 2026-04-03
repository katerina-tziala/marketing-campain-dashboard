import Papa from 'papaparse'
import type { Campaign } from '../../../common/types/campaign'
import type { CsvParseResult, CsvValidationError } from '../types'

const EXPECTED_HEADERS: (keyof Campaign)[] = [
  'campaign',
  'channel',
  'budget',
  'impressions',
  'clicks',
  'conversions',
  'revenue',
]

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // 2MB

export function parseCsv(file: File): Promise<CsvParseResult> {
  // ── File-level validation ────────────────────────────────────────────────────

  if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
    return Promise.resolve({
      campaigns: [],
      errors: [{ type: 'file_type', message: 'Only CSV files are accepted.' }],
    })
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return Promise.resolve({
      campaigns: [],
      errors: [{ type: 'file_size', message: 'File exceeds the 2MB size limit.' }],
    })
  }

  return new Promise((resolve) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete({ data, meta }) {
        // ── Column validation ──────────────────────────────────────────────────

        const actualHeaders = (meta.fields ?? []).map((h) => h.toLowerCase().trim())
        const missingColumns = EXPECTED_HEADERS.filter(
          (h) => !actualHeaders.includes(h.toLowerCase()),
        )

        if (missingColumns.length > 0) {
          return resolve({
            campaigns: [],
            errors: [
              {
                type: 'missing_columns',
                message: 'The CSV is missing required columns.',
                details: missingColumns.map((c) => `"${c}"`),
              },
            ],
          })
        }

        // ── Empty file ─────────────────────────────────────────────────────────

        if (data.length === 0) {
          return resolve({
            campaigns: [],
            errors: [{ type: 'empty_file', message: 'The CSV file contains no data rows.' }],
          })
        }

        // ── Build normalised header map (case-insensitive) ─────────────────────

        const headerMap: Record<string, string> = {}
        ;(meta.fields ?? []).forEach((h) => {
          headerMap[h.toLowerCase().trim()] = h
        })

        const get = (row: Record<string, string>, key: keyof Campaign): string =>
          (row[headerMap[key]] ?? '').trim()

        // ── Row validation ─────────────────────────────────────────────────────

        const campaigns: Campaign[] = []
        const rowErrors: string[] = []

        data.forEach((row, i) => {
          const rowNum = i + 2 // +2: 1-based + header row
          const errors: string[] = []

          const campaign = get(row, 'campaign')
          const channel = get(row, 'channel')
          const budget = Number(get(row, 'budget'))
          const impressions = Number(get(row, 'impressions'))
          const clicks = Number(get(row, 'clicks'))
          const conversions = Number(get(row, 'conversions'))
          const revenue = Number(get(row, 'revenue'))

          if (!campaign) errors.push('campaign is empty')
          if (!channel) errors.push('channel is empty')
          if (isNaN(budget) || budget <= 0) errors.push('budget must be a number greater than 0')
          if (isNaN(impressions) || impressions < 0 || !Number.isInteger(impressions))
            errors.push('impressions must be a non-negative integer')
          if (isNaN(clicks) || clicks < 0 || !Number.isInteger(clicks))
            errors.push('clicks must be a non-negative integer')
          if (clicks > impressions) errors.push('clicks cannot exceed impressions')
          if (isNaN(conversions) || conversions < 0 || !Number.isInteger(conversions))
            errors.push('conversions must be a non-negative integer')
          if (conversions > clicks) errors.push('conversions cannot exceed clicks')
          if (isNaN(revenue) || revenue < 0) errors.push('revenue must be a non-negative number')

          if (errors.length > 0) {
            rowErrors.push(`Row ${rowNum}: ${errors.join('; ')}`)
          } else {
            campaigns.push({ campaign, channel, budget, impressions, clicks, conversions, revenue })
          }
        })

        if (rowErrors.length > 0) {
          return resolve({
            campaigns: [],
            errors: [
              {
                type: 'invalid_rows',
                message: `${rowErrors.length} row${rowErrors.length > 1 ? 's' : ''} failed validation.`,
                details: rowErrors,
              },
            ],
          })
        }

        resolve({ campaigns, errors: [] })
      },
      error(err) {
        resolve({
          campaigns: [],
          errors: [{ type: 'file_type', message: `Failed to parse file: ${err.message}` }],
        })
      },
    })
  })
}
