import type { CsvFieldIssue, CsvRowIssueType, CsvValidationError, CsvValidationErrorType } from '../types'

const ROW_ISSUE_MESSAGES: Record<CsvRowIssueType, string> = {
  empty: 'Cannot be empty',
  positive_number: 'Must be a number greater than 0',
  non_negative_number: 'Must be a non-negative number',
  non_negative_integer: 'Must be a non-negative integer',
  exceeds: 'Cannot exceed',
}

const VALIDATION_ERROR_MESSAGES: Record<CsvValidationErrorType, string> = {
  file_type: 'Only CSV files are accepted.',
  file_size: 'File exceeds the 2 MB size limit.',
  empty_file: 'The CSV file contains no data rows.',
  missing_columns: 'CSV file headers are missing: {cols}. Please consult the template.',
  invalid_rows: '{count} {rows} failed validation.',
  parse_error: 'Failed to parse file: {detail}.',
}

function replacePlaceholders(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '')
}

export function getRowErrorMessage(error: CsvFieldIssue): string {
  const base = ROW_ISSUE_MESSAGES[error.issue]
  return error.details ? `${base} ${error.details}` : base
}

export interface RowErrorSummaryWords {
  rowWord: string
  verb: string
  wasWord: string
  totalRowWord: string
  validRowWord: string
}

export function getRowErrorSummaryWords(invalidCount: number, validCount: number): RowErrorSummaryWords {
  const totalCount = invalidCount + validCount
  return {
    rowWord: invalidCount === 1 ? 'row' : 'rows',
    verb: invalidCount === 1 ? 'contains' : 'contain',
    wasWord: invalidCount === 1 ? 'was' : 'were',
    totalRowWord: totalCount === 1 ? 'row' : 'rows',
    validRowWord: validCount === 1 ? 'row' : 'rows',
  }
}

export function getValidationErrorMessage(error: CsvValidationError): string {
  const template = VALIDATION_ERROR_MESSAGES[error.type]

  if (error.type === 'missing_columns') {
    return replacePlaceholders(template, { cols: (error.missingColumns ?? []).join(', ') })
  }

  if (error.type === 'invalid_rows') {
    const count = (error.rowErrors ?? []).length
    return replacePlaceholders(template, { count: String(count), rows: count > 1 ? 'rows' : 'row' })
  }

  if (error.type === 'parse_error') {
    return replacePlaceholders(template, { detail: error.detail ?? 'Unknown error.' })
  }

  return template
}
