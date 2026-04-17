import type { Campaign } from '../../../common/types/campaign'
import type { CsvParseResult, CsvRowError, ProcessRowsResult } from '../types'
import { validateRow } from './validate-row-data'

const EXPECTED_HEADERS: (keyof Campaign)[] = [
  'campaign',
  'channel',
  'budget',
  'impressions',
  'clicks',
  'conversions',
  'revenue',
]

function buildHeaderMap(fields: string[]): Record<string, string> {
  return fields.reduce<Record<string, string>>((map, h) => {
    map[h.toLowerCase().trim()] = h
    return map
  }, {})
}

function extractCampaignFields(
  row: Record<string, string>,
  headerMap: Record<string, string>,
): Campaign {
  const get = (key: keyof Campaign): string => (row[headerMap[key]] ?? '').trim()
  return {
    campaign: get('campaign'),
    channel: get('channel'),
    budget: Number(get('budget')),
    impressions: Number(get('impressions')),
    clicks: Number(get('clicks')),
    conversions: Number(get('conversions')),
    revenue: Number(get('revenue')),
  }
}

function processRows(
  data: Record<string, string>[],
  headerMap: Record<string, string>,
): ProcessRowsResult {
  const campaigns: Campaign[] = []
  const errors: CsvRowError[] = []

  data.forEach((row, i) => {
    const rowNum = i + 2 // +2: 1-based index + header row
    const fields = extractCampaignFields(row, headerMap)
    const rowErrors = validateRow(fields, rowNum)

    if (rowErrors.length > 0) {
      errors.push(...rowErrors)
    } else {
      campaigns.push(fields)
    }
  })

  return { campaigns, errors }
}

export function validateCampaignData(
  data: Record<string, string>[],
  fields: string[],
): CsvParseResult {
  // ── Column validation ──────────────────────────────────────────────────────
  const headerMap = buildHeaderMap(fields)
  const actualHeaders = Object.values(headerMap)
  const missingColumns = EXPECTED_HEADERS.filter((h) => !actualHeaders.includes(h.toLowerCase()))

  if (missingColumns.length > 0) {
    return { campaigns: [], errors: [{ type: 'missing_columns', missingColumns }] }
  }

  // ── Empty file ─────────────────────────────────────────────────────────────
  if (data.length === 0) {
    return { campaigns: [], errors: [{ type: 'empty_file' }] }
  }

  // ── Row validation ─────────────────────────────────────────────────────────
  const { campaigns, errors: rowErrors } = processRows(data, headerMap)
  if (rowErrors.length > 0) {
    return { campaigns, errors: [{ type: 'invalid_rows', rowErrors }] }
  }

  return { campaigns, errors: [] }
}
