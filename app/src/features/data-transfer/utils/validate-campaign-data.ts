import type { Campaign } from '@/shared/data';

import type {
  CampaignDataParseResult,
  CampaignDataProcessRowsResult,
  CampaignDataRowError,
  CampaignDataValidationError,
} from '../types';
import { detectCampaignDuplication } from './detect-campaign-duplication';
import { validateRow } from './validate-row-data';

const EXPECTED_HEADERS: (keyof Campaign)[] = [
  'campaign',
  'channel',
  'budget',
  'impressions',
  'clicks',
  'conversions',
  'revenue',
];

function buildHeaderMap(fields: string[]): Record<string, string> {
  return fields.reduce<Record<string, string>>((map, header) => {
    map[header.toLowerCase().trim()] = header;
    return map;
  }, {});
}

function extractCampaignFields(
  row: Record<string, string>,
  headerMap: Record<string, string>,
  rowId: number,
): Campaign {
  const get = (key: keyof Campaign): string => (row[headerMap[key]] ?? '').trim();
  return {
    rowId,
    campaign: get('campaign'),
    channel: get('channel'),
    budget: Number(get('budget')),
    impressions: Number(get('impressions')),
    clicks: Number(get('clicks')),
    conversions: Number(get('conversions')),
    revenue: Number(get('revenue')),
  };
}

function processRows(
  data: Record<string, string>[],
  headerMap: Record<string, string>,
): CampaignDataProcessRowsResult {
  const campaigns: Campaign[] = [];
  const errors: CampaignDataRowError[] = [];

  data.forEach((row, index) => {
    const rowNum = index + 2; // +2: 1-based index + header row
    const fields = extractCampaignFields(row, headerMap, rowNum);
    const rowErrors = validateRow(fields, rowNum);

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
    } else {
      campaigns.push(fields);
    }
  });

  return { campaigns, errors };
}

export function validateCampaignData(
  data: Record<string, string>[],
  fields: string[],
): CampaignDataParseResult {
  // ── Column validation ──────────────────────────────────────────────────────
  const headerMap = buildHeaderMap(fields);
  const missingColumns = EXPECTED_HEADERS.filter((header) => !(header in headerMap));

  if (missingColumns.length > 0) {
    return { campaigns: [], errors: [{ type: 'missing_columns', missingColumns }] };
  }

  // ── Empty file ─────────────────────────────────────────────────────────────
  if (data.length === 0) {
    return { campaigns: [], errors: [{ type: 'empty_file' }] };
  }

  // ── Row validation ─────────────────────────────────────────────────────────
  const { campaigns: validCampaigns, errors: rowErrors } = processRows(data, headerMap);

  // ── Duplicate detection ────────────────────────────────────────────────────
  const { unique, groups } = detectCampaignDuplication(validCampaigns);

  const errors: CampaignDataValidationError[] = [];
  if (rowErrors.length > 0) {
    errors.push({ type: 'invalid_rows', rowErrors });
  }
  if (groups.length > 0) {
    errors.push({ type: 'duplicate_campaigns', duplicateGroups: groups });
  }

  return { campaigns: unique, errors };
}
