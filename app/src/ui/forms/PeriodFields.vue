<script setup lang="ts">
import { ref } from 'vue';

import type { Period } from '@/shared/portfolio';
import { localeDateFormat } from '@/shared/utils';
import { DateField, FormControl, FormFieldFeedback } from '@/ui';

import type { DateFieldErrorKey, DateFieldValidation } from '@/ui';

withDefaults(
  defineProps<{
    periodFrom: string;
    periodTo: string;
    disabled?: boolean;
    idPrefix?: string;
  }>(),
  {
    disabled: false,
    idPrefix: 'period',
  },
);

const emit = defineEmits<{
  'update:periodFrom': [value: string];
  'update:periodTo': [value: string];
}>();

const periodFromError = ref('');
const periodToError = ref('');
const periodRangeError = ref('');
const periodFromFieldRef = ref<InstanceType<typeof DateField> | null>(null);
const periodToFieldRef = ref<InstanceType<typeof DateField> | null>(null);
const periodFromValidation = ref<DateFieldValidation | null>(null);
const periodToValidation = ref<DateFieldValidation | null>(null);
const dateFormatPlaceholder = localeDateFormat.label;

const periodDateErrorMessages: Record<DateFieldErrorKey, (label: string) => string> = {
  required: (label) => `${label} is required`,
  'invalid-format': (label) =>
    `${label} must be in ${localeDateFormat.label} format (e.g. ${localeDateFormat.example})`,
  'invalid-date': (label) => `${label} must be a real date (e.g. ${localeDateFormat.example})`,
};

function getPeriodDateError(result: DateFieldValidation, label: string): string {
  return result.errorKey ? periodDateErrorMessages[result.errorKey](label) : '';
}

function getPeriodRangeError(from: DateFieldValidation, to: DateFieldValidation): string {
  if (from.date && to.date && from.date.getTime() > to.date.getTime()) {
    return 'Start date must be before or equal to End date';
  }
  return '';
}

function updatePeriodRangeError(): void {
  if (
    periodFromValidation.value &&
    periodToValidation.value &&
    !periodFromValidation.value.errorKey &&
    !periodToValidation.value.errorKey
  ) {
    periodRangeError.value = getPeriodRangeError(
      periodFromValidation.value,
      periodToValidation.value,
    );
    return;
  }

  periodRangeError.value = '';
}

function handlePeriodFromValidate(result: DateFieldValidation): void {
  periodFromValidation.value = result;
  periodFromError.value = getPeriodDateError(result, 'Start date');
  updatePeriodRangeError();
}

function handlePeriodToValidate(result: DateFieldValidation): void {
  periodToValidation.value = result;
  periodToError.value = getPeriodDateError(result, 'End date');
  updatePeriodRangeError();
}

function handlePeriodFromUpdate(value: string): void {
  periodFromError.value = '';
  periodRangeError.value = '';
  periodFromValidation.value = null;
  emit('update:periodFrom', value);
}

function handlePeriodToUpdate(value: string): void {
  periodToError.value = '';
  periodRangeError.value = '';
  periodToValidation.value = null;
  emit('update:periodTo', value);
}

function validate(): Period | null {
  periodFromError.value = '';
  periodToError.value = '';
  periodRangeError.value = '';

  const periodFrom = periodFromFieldRef.value?.validate() ?? periodFromValidation.value;
  const periodTo = periodToFieldRef.value?.validate() ?? periodToValidation.value;

  if (!periodFrom) {
    periodFromError.value = periodDateErrorMessages.required('Start date');
  } else {
    periodFromError.value = getPeriodDateError(periodFrom, 'Start date');
  }

  if (!periodTo) {
    periodToError.value = periodDateErrorMessages.required('End date');
  } else {
    periodToError.value = getPeriodDateError(periodTo, 'End date');
  }

  if (periodFrom && periodTo && !periodFromError.value && !periodToError.value) {
    periodRangeError.value = getPeriodRangeError(periodFrom, periodTo);
  }

  if (
    periodFromError.value ||
    periodToError.value ||
    periodRangeError.value ||
    !periodFrom?.isoDate ||
    !periodTo?.isoDate
  ) {
    return null;
  }

  return {
    from: periodFrom.isoDate,
    to: periodTo.isoDate,
  };
}

defineExpose({
  validate,
});
</script>

<template>
  <fieldset
    class="period-fieldset"
    :aria-invalid="periodRangeError ? 'true' : undefined"
    :aria-describedby="periodRangeError ? `${idPrefix}-error` : `${idPrefix}-hint`"
    aria-label="Period"
  >
    <div class="period-fields">
      <FormControl
        :id="`${idPrefix}-from`"
        label="Start Date"
        required
        :invalid="Boolean(periodFromError || periodRangeError)"
      >
        <template #default="{ id, invalid, describedBy }">
          <DateField
            :id="id"
            ref="periodFromFieldRef"
            :model-value="periodFrom"
            required
            :disabled="disabled"
            :invalid="invalid"
            :described-by="describedBy"
            :placeholder="dateFormatPlaceholder"
            @update:model-value="handlePeriodFromUpdate"
            @validate="handlePeriodFromValidate"
          />
        </template>
        <template #error-content>
          {{ periodFromError }}
        </template>
      </FormControl>
      <FormControl
        :id="`${idPrefix}-to`"
        label="End Date"
        required
        :invalid="Boolean(periodToError || periodRangeError)"
      >
        <template #default="{ id, invalid, describedBy }">
          <DateField
            :id="id"
            ref="periodToFieldRef"
            :model-value="periodTo"
            required
            :disabled="disabled"
            :invalid="invalid"
            :described-by="describedBy"
            :placeholder="dateFormatPlaceholder"
            @update:model-value="handlePeriodToUpdate"
            @validate="handlePeriodToValidate"
          />
        </template>
        <template #error-content>
          {{ periodToError }}
        </template>
      </FormControl>
    </div>
    <FormFieldFeedback
      :hint-id="`${idPrefix}-hint`"
      :error-id="`${idPrefix}-error`"
      :invalid="Boolean(periodRangeError)"
      hint-text="Select the date range this data covers"
      :error-text="periodRangeError"
      error-hint-text="Adjust the dates to define a valid reporting period"
    />
  </fieldset>
</template>

<style lang="scss" scoped>
.period-fieldset {
  @apply border-0
    flex
    flex-col
    gap-1.5
    m-0
    p-0;
}

.period-fields {
  @apply gap-x-8
    gap-y-4
    grid
    grid-cols-1;

  @include cq-up(cq-320, 'form') {
    @apply grid-cols-2;
  }
}
</style>
