export type CsvValidationErrorType =
  | 'file_type'
  | 'file_size'
  | 'empty_file'
  | 'missing_columns'
  | 'invalid_rows'

export interface CsvValidationError {
  type: CsvValidationErrorType
  message: string
  details?: string[]
}

export interface CsvParseResult {
  campaigns: import('../../../common/types/campaign').Campaign[]
  errors: CsvValidationError[]
}
