import type { Campaign } from '@/shared/data'

export type CampaignDataRowIssueType =
  | 'empty'
  | 'positive_number'
  | 'non_negative_number'
  | 'non_negative_integer'
  | 'exceeds'

export interface CampaignDataFieldIssue {
  column: string
  issue: CampaignDataRowIssueType
  details?: string
}

export interface CampaignDataRowError extends CampaignDataFieldIssue {
  row: number
}

export interface CampaignDataDuplicateGroup {
  campaignName: string
  rows: Campaign[]
}

export type CampaignDataValidationErrorType =
  | 'file_type'
  | 'file_size'
  | 'empty_file'
  | 'missing_columns'
  | 'invalid_rows'
  | 'parse_error'
  | 'duplicate_campaigns'

export interface CampaignDataValidationError {
  type: CampaignDataValidationErrorType
  detail?: string
  missingColumns?: string[]
  rowErrors?: CampaignDataRowError[]
  duplicateGroups?: CampaignDataDuplicateGroup[]
}

export interface CampaignDataParseResult {
  campaigns: Campaign[]
  errors: CampaignDataValidationError[]
}

export interface CampaignDataProcessRowsResult {
  campaigns: Campaign[]
  errors: CampaignDataRowError[]
}

export interface RowErrorSummaryWords {
  rowWord: string
  verb: string
  wasWord: string
  totalRowWord: string
  validRowWord: string
}
