import type { DateParseErrorKey } from '@/shared/utils';

export type FormSpacing = 'sm' | 'md' | 'lg';
export type FormControlVariant = 'primary' | 'secondary';
export type FormControlElement = 'div' | 'fieldset';
export type RadioItemVariant = 'primary' | 'info';
export type RadioToggleSize = 'default' | 'small' | 'tiny';

export type RequiredErrorKey = 'required';
export type FileValidationErrorKey = 'file-type' | 'file-size';

export interface FieldValidation<TKey extends string, TValue = string> {
  value: TValue;
  errorKey: TKey | null;
  valid: boolean;
}

export type DateFieldErrorKey = RequiredErrorKey | DateParseErrorKey;

export interface DateFieldValidation {
  value: string;
  date: Date | null;
  isoDate: string | null;
  errorKey: DateFieldErrorKey | null;
  valid: boolean;
}

export type FileFieldErrorKey = RequiredErrorKey | FileValidationErrorKey;

export interface FileFieldValidation {
  value: File | null;
  file: File | null;
  errorKey: FileFieldErrorKey | null;
  valid: boolean;
}
