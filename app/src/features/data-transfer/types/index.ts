import type { Campaign } from '@/shared/data'

export type CampainDataRowIssueType =
  | 'empty'
  | 'positive_number'
  | 'non_negative_number'
  | 'non_negative_integer'
  | 'exceeds'

export interface CampainDataFieldIssue {
  column: string
  issue: CampainDataRowIssueType
  details?: string
}

export interface CampainDataRowError extends CampainDataFieldIssue {
  row: number
}

export interface CampainDataDuplicateGroup {
  campaignName: string
  rows: Campaign[]
}

export type CampainDataValidationErrorType =
  | 'file_type'
  | 'file_size'
  | 'empty_file'
  | 'missing_columns'
  | 'invalid_rows'
  | 'parse_error'
  | 'duplicate_campaigns'

export interface CampainDataValidationError {
  type: CampainDataValidationErrorType
  detail?: string
  missingColumns?: string[]
  rowErrors?: CampainDataRowError[]
  duplicateGroups?: CampainDataDuplicateGroup[]
}

export interface CampainDataParseResult {
  campaigns: Campaign[]
  errors: CampainDataValidationError[]
}

export interface CampainDataProcessRowsResult {
  campaigns: Campaign[]
  errors: CampainDataRowError[]
}
