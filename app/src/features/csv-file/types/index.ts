import type { Campaign } from "../../../common/types/campaign"

export type CsvRowIssueType =
  | 'empty'
  | 'positive_number'
  | 'non_negative_number'
  | 'non_negative_integer'
  | 'exceeds'

export interface CsvFieldIssue {
  column: string
  issue: CsvRowIssueType
  details?: string
}

export interface CsvRowError extends CsvFieldIssue {
  row: number
}

export interface CsvCampaign extends Campaign {
  rowNum: number
}

export interface CsvDuplicateGroup {
  campaignName: string
  rows: CsvCampaign[]
}

export type CsvValidationErrorType =
  | 'file_type'
  | 'file_size'
  | 'empty_file'
  | 'missing_columns'
  | 'invalid_rows'
  | 'parse_error'
  | 'duplicate_campaigns'

export interface CsvValidationError {
  type: CsvValidationErrorType
  detail?: string
  missingColumns?: string[]
  rowErrors?: CsvRowError[]
  duplicateGroups?: CsvDuplicateGroup[]
}

export interface CsvParseResult {
  campaigns: CsvCampaign[]
  errors: CsvValidationError[]
}

export interface ProcessRowsResult {
  campaigns: CsvCampaign[]
  errors: CsvRowError[]
}
