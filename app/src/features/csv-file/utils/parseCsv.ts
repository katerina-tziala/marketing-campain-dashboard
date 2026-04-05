import Papa from 'papaparse'
import type { Campaign } from '../../../common/types/campaign'
import type { CsvParseResult, CsvRowError } from '../types'

const EXPECTED_HEADERS: (keyof Campaign)[] = [
  'campaign',
  'channel',
  'budget',
  'impressions',
  'clicks',
  'conversions',
  'revenue',
]

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB

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
      errors: [{ type: 'file_size', message: 'File exceeds the 2 MB size limit.' }],
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
                message: 'CSV file headers are missing.',
                details: missingColumns,
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
        const rowErrors: CsvRowError[] = []

        data.forEach((row, i) => {
          const rowNum = i + 2 // +2: 1-based index + header row
          const errors: CsvRowError[] = []

          const campaign = get(row, 'campaign')
          const channel = get(row, 'channel')
          const budget = Number(get(row, 'budget'))
          const impressions = Number(get(row, 'impressions'))
          const clicks = Number(get(row, 'clicks'))
          const conversions = Number(get(row, 'conversions'))
          const revenue = Number(get(row, 'revenue'))

          if (!campaign)
            errors.push({ row: rowNum, column: 'campaign', issue: 'Cannot be empty' })

          if (!channel)
            errors.push({ row: rowNum, column: 'channel', issue: 'Cannot be empty' })

          if (isNaN(budget) || budget <= 0)
            errors.push({ row: rowNum, column: 'budget', issue: 'Must be a number greater than 0' })

          const impressionsValid = !isNaN(impressions) && impressions >= 0 && Number.isInteger(impressions)
          if (!impressionsValid)
            errors.push({ row: rowNum, column: 'impressions', issue: 'Must be a non-negative integer' })

          const clicksValid = !isNaN(clicks) && clicks >= 0 && Number.isInteger(clicks)
          if (!clicksValid) {
            errors.push({ row: rowNum, column: 'clicks', issue: 'Must be a non-negative integer' })
          } else if (impressionsValid && clicks > impressions) {
            errors.push({ row: rowNum, column: 'clicks', issue: 'Cannot exceed impressions' })
          }

          const conversionsValid = !isNaN(conversions) && conversions >= 0 && Number.isInteger(conversions)
          if (!conversionsValid) {
            errors.push({ row: rowNum, column: 'conversions', issue: 'Must be a non-negative integer' })
          } else if (clicksValid && conversions > clicks) {
            errors.push({ row: rowNum, column: 'conversions', issue: 'Cannot exceed clicks' })
          }

          if (isNaN(revenue) || revenue < 0)
            errors.push({ row: rowNum, column: 'revenue', issue: 'Must be a non-negative number' })

          if (errors.length > 0) {
            rowErrors.push(...errors)
          } else {
            campaigns.push({ campaign, channel, budget, impressions, clicks, conversions, revenue })
          }
        })

        if (rowErrors.length > 0) {
          const invalidRowCount = new Set(rowErrors.map((e) => e.row)).size
          return resolve({
            campaigns,
            errors: [
              {
                type: 'invalid_rows',
                message: `${invalidRowCount} row${invalidRowCount > 1 ? 's' : ''} failed validation.`,
                rowErrors,
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
