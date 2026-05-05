import type { FileFieldValidation } from '../form.types';

export interface FileValidationOptions {
  accept: string;
  required?: boolean;
  maxSizeBytes?: number;
}

function getAcceptedValues(accept: string): string[] {
  return accept
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function acceptsFileType(file: File, accept: string): boolean {
  const acceptedValues = getAcceptedValues(accept);
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  return acceptedValues.some((value) => {
    if (value.startsWith('.')) {
      return fileName.endsWith(value);
    }
    if (value.endsWith('/*')) {
      return fileType.startsWith(value.slice(0, -1));
    }
    return fileType === value;
  });
}

export function validateFile(
  file: File | null,
  options: FileValidationOptions,
): FileFieldValidation {
  if (!file) {
    return {
      value: file,
      file,
      errorKey: options.required ? 'required' : null,
      valid: !options.required,
    };
  }

  if (!acceptsFileType(file, options.accept)) {
    return {
      value: file,
      file,
      errorKey: 'file-type',
      valid: false,
    };
  }

  if (options.maxSizeBytes && file.size > options.maxSizeBytes) {
    return {
      value: file,
      file,
      errorKey: 'file-size',
      valid: false,
    };
  }

  return {
    value: file,
    file,
    errorKey: null,
    valid: true,
  };
}
