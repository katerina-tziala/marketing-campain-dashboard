import type { FieldValidation, RequiredErrorKey } from '../form.types';

export function validateRequired(value: string): FieldValidation<RequiredErrorKey> {
  return {
    value,
    errorKey: value.trim() ? null : 'required',
    valid: Boolean(value.trim()),
  };
}
