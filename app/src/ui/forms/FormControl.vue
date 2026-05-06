<script setup lang="ts">
import { computed, useSlots } from 'vue';

import type { FormControlElement } from './form.types';
import FormFieldFeedback from './FormFieldFeedback.vue';

const props = withDefaults(
  defineProps<{
    id: string;
    label: string;
    as?: FormControlElement;
    required?: boolean;
    invalid?: boolean;
    hintText?: string;
    errorText?: string;
    errorHintText?: string;
  }>(),
  {
    as: 'div',
    required: false,
    invalid: undefined,
    hintText: '',
    errorText: '',
    errorHintText: '',
  },
);

const slots = useSlots();

const invalid = computed(() => props.invalid ?? Boolean(props.errorText));
const errorId = computed(() => `${props.id}-error`);
const hintId = computed(() => `${props.id}-hint`);
const errorHintId = computed(() => `${props.id}-error-hint`);
const feedbackProps = computed(() => ({
  hintId: hintId.value,
  errorId: errorId.value,
  errorHintId: errorHintId.value,
  invalid: invalid.value,
  hintText: props.hintText,
  errorText: props.errorText,
  errorHintText: props.errorHintText,
}));
const hasError = computed(
  () => invalid.value && Boolean(props.errorText || slots.error || slots['error-content']),
);
const hasHint = computed(
  () => !invalid.value && Boolean(props.hintText || slots.hint || slots['hint-content']),
);
const hasErrorHint = computed(
  () =>
    invalid.value &&
    Boolean(props.errorHintText || slots['error-hint'] || slots['error-hint-content']),
);
const describedBy = computed(() => {
  const ids = [
    hasHint.value ? hintId.value : null,
    hasError.value ? errorId.value : null,
    hasErrorHint.value ? errorHintId.value : null,
  ].filter(Boolean);

  return ids.length ? ids.join(' ') : undefined;
});
</script>

<template>
  <component
    :is="as"
    class="field"
  >
    <legend
      v-if="as === 'fieldset'"
      class="field-label"
      :class="{ 'is-required': required }"
    >
      {{ label }}
      <slot name="label-suffix" />
    </legend>
    <label
      v-else
      class="field-label"
      :class="{ 'is-required': required }"
      :for="id"
    >
      {{ label }}
      <slot name="label-suffix" />
    </label>
    <slot
      :id="id"
      :invalid="invalid"
      :described-by="describedBy"
      :hint-id="hintId"
      :error-id="errorId"
      :error-hint-id="errorHintId"
    />
    <FormFieldFeedback v-bind="feedbackProps">
      <template
        v-if="$slots.hint"
        #hint="{ hintId: slotHintId }"
      >
        <slot
          name="hint"
          :hint-id="slotHintId"
        />
      </template>
      <template
        v-if="$slots['hint-content']"
        #hint-content
      >
        <slot name="hint-content" />
      </template>
      <template
        v-if="$slots.error"
        #error="{ errorId: slotErrorId, errorText: slotErrorText }"
      >
        <slot
          name="error"
          :error-id="slotErrorId"
          :error-text="slotErrorText"
        />
      </template>
      <template
        v-if="$slots['error-content']"
        #error-content
      >
        <slot name="error-content" />
      </template>
      <template
        v-if="$slots['error-hint']"
        #error-hint="{ errorHintId: slotErrorHintId }"
      >
        <slot
          name="error-hint"
          :error-hint-id="slotErrorHintId"
        />
      </template>
      <template
        v-if="$slots['error-hint-content']"
        #error-hint-content
      >
        <slot name="error-hint-content" />
      </template>
    </FormFieldFeedback>
  </component>
</template>

<style lang="scss" scoped>
%_theme-transition {
  @apply duration-300
    ease-linear
    transition-colors;
}

.field {
  @apply flex
    flex-col
    gap-2;

  &[as='fieldset'],
  &:is(fieldset) {
    @apply border-0
      m-0
      p-0;
  }
}

.field-label {
  @extend %_theme-transition;
  @apply font-medium
    inline-block
    text-primary-lighter
    text-sm
    tracking-wide
    w-fit;
}

.field-label.is-required::after {
  @extend %_theme-transition;
  @apply content-["*"]
    inline-block
    leading-none
    text-primary-lighter/70
    text-xl
    translate-y-0.5;
}

:deep(.form-control) {
  @apply bg-background/60
    block
    border
    border-primary-light/60
    duration-300
    ease-out
    min-h-10
    outline-none
    px-3
    rounded-md
    text-primary-light
    text-sm
    tracking-wider
    transition-colors
    w-full;

  &::placeholder {
    @apply text-typography-faint;
  }

  &:not(:disabled) {
    &:focus,
    &:focus-within,
    &:hover {
      @apply border-primary-lighter
        text-primary-lighter;
    }
  }

  &:disabled {
    @apply cursor-not-allowed
      opacity-80;
  }
}

:deep(.input-error) {
  @extend %_theme-transition;
  @apply border-danger
    text-danger;

  &:not(:disabled) {
    &:focus,
    &:focus-within,
    &:hover {
      @apply border-primary-lighter
        text-primary-lighter;
    }
  }
}
</style>
