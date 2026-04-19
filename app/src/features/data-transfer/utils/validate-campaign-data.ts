import type { Campaign } from '../../../common/types/campaign'
import type { CampainDataParseResult, CampainDataProcessRowsResult, CampainDataRowError, CampainDataValidationError } from '../types'
import { validateRow } from './validate-row-data'
import { detectCampaignDuplication } from './detect-campaign-duplication'

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
  rowId: number,
): Campaign {
  const get = (key: keyof Campaign): string => (row[headerMap[key]] ?? '').trim()
  return {
    rowId,
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
): CampainDataProcessRowsResult {
  const campaigns: Campaign[] = []
  const errors: CampainDataRowError[] = []

  data.forEach((row, i) => {
    const rowNum = i + 2 // +2: 1-based index + header row
    const fields = extractCampaignFields(row, headerMap, rowNum)
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
): CampainDataParseResult {
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
  const { campaigns: validCampaigns, errors: rowErrors } = processRows(data, headerMap)

  // ── Duplicate detection ────────────────────────────────────────────────────
  const { unique, groups } = detectCampaignDuplication(validCampaigns)

  const errors: CampainDataValidationError[] = []
  if (rowErrors.length > 0) errors.push({ type: 'invalid_rows', rowErrors })
  if (groups.length > 0) errors.push({ type: 'duplicate_campaigns', duplicateGroups: groups })

  return { campaigns: unique, errors }
}
