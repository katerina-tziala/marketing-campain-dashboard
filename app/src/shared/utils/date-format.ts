export type DateParseErrorKey = 'invalid-format' | 'invalid-date'

export interface LocaleDateFormat {
  label: string
  example: string
}

export interface DateParseResult {
  date: Date | null
  isoDate: string | null
  errorKey: DateParseErrorKey | null
}

function formatDateExample(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

export const localeDateFormat: LocaleDateFormat = {
  label: 'DD/MM/YYYY',
  example: formatDateExample(new Date()),
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function hasExpectedDateParts(day: string, month: string, year: string): boolean {
  return day.length === 2 && month.length === 2 && year.length === 4
}

function validateDateFormat(
  dayText: string,
  monthText: string,
  yearText: string,
): DateParseResult {
  const day = Number(dayText)
  const month = Number(monthText)
  const year = Number(yearText)
  const date = new Date(Date.UTC(year, month - 1, day))

  const isValid =
    Number.isInteger(day) &&
    Number.isInteger(month) &&
    Number.isInteger(year) &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day

  return !isValid ? {
    date: null,
    isoDate: null,
    errorKey: 'invalid-date',
  } : {
    date,
    isoDate: toIsoDate(date),
    errorKey: null,
  }
}

export function parseLocaleDate(value: string): DateParseResult {
  const trimmedValue = value.trim()
  const dateParts = trimmedValue.split('/')

  if (dateParts.length !== 3) {
    return {
      date: null,
      isoDate: null,
      errorKey: 'invalid-format',
    }
  }

  const [dayText, monthText, yearText] = dateParts

  if (!hasExpectedDateParts(dayText, monthText, yearText)) {
    return {
      date: null,
      isoDate: null,
      errorKey: 'invalid-format',
    }
  }

  return validateDateFormat(dayText, monthText, yearText)
}
 
