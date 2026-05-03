import { parseLocaleDate } from '@/shared/utils'
import type { DateFieldValidation } from '../form.types'
import { validateRequired } from './required.validation'

const DEFAULT_DATE_VALIDATION = {
  value: null,
  date: null,
  isoDate: null,
  errorKey: null,
  valid: false,
}

export function validateDateField(
  value: string,
  options: { required?: boolean } = {},
): DateFieldValidation {
  const trimmedValue = value.trim()
  const requiredResult = validateRequired(value)

  if (options.required && !requiredResult.valid) {
    return {
      ...DEFAULT_DATE_VALIDATION,
      value,
      errorKey: requiredResult.errorKey,
    }
  }

  if (!trimmedValue) {
    return {
      ...DEFAULT_DATE_VALIDATION,
      value,
      valid: true,
    }
  }

  const { date, isoDate, errorKey } = parseLocaleDate(trimmedValue)

  return {
    value,
    date,
    isoDate,
    errorKey,
    valid: errorKey === null,
  }
}
