<script setup lang="ts">
import { computed, useSlots } from 'vue';

const props = withDefaults(
  defineProps<{
    hintId: string;
    errorId: string;
    errorHintId?: string;
    invalid?: boolean;
    hintText?: string;
    errorText?: string;
    errorHintText?: string;
  }>(),
  {
    errorHintId: '',
    invalid: false,
    hintText: '',
    errorText: '',
    errorHintText: '',
  },
);

const slots = useSlots();

const hasError = computed(
  () => props.invalid && Boolean(props.errorText || slots.error || slots['error-content']),
);
const hasHint = computed(
  () => !props.invalid && Boolean(props.hintText || slots.hint || slots['hint-content']),
);
const hasErrorHint = computed(
  () =>
    props.invalid &&
    Boolean(props.errorHintText || slots['error-hint'] || slots['error-hint-content']),
);
const hasFeedback = computed(() => hasHint.value || hasError.value);
</script>

<template>
  <div
    v-if="hasFeedback"
    class="field-message"
  >
    <div class="field-message-content">
      <slot
        v-if="hasHint"
        name="hint"
        :hint-id="hintId"
      >
        <p
          :id="hintId"
          class="field-error-hint"
        >
          <slot name="hint-content">
            {{ hintText }}
          </slot>
        </p>
      </slot>
      <Transition name="field-message">
        <div
          v-if="hasError"
          class="field-message-animated"
        >
          <div class="field-message-content">
            <slot
              name="error"
              :error-id="errorId"
              :error-text="errorText"
            >
              <p
                :id="errorId"
                class="field-error"
                role="alert"
              >
                <slot name="error-content">
                  {{ errorText }}
                </slot>
              </p>
            </slot>
            <slot
              v-if="hasErrorHint"
              name="error-hint"
              :error-hint-id="errorHintId"
            >
              <p
                :id="errorHintId"
                class="field-error-hint"
              >
                <slot name="error-hint-content">
                  {{ errorHintText }}
                </slot>
              </p>
            </slot>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
%_theme-transition {
  @apply transition-colors duration-300 ease-linear;
}

.field-error {
  @extend %_theme-transition;
  @apply text-sm text-danger m-0;
}

.field-error-hint {
  @extend %_theme-transition;
  @apply text-sm text-typography-subtle;
}

:slotted(.field-error) {
  @extend %_theme-transition;
  @apply text-sm text-danger m-0;
}

:slotted(.field-error-hint) {
  @extend %_theme-transition;
  @apply text-sm text-typography-subtle;
}

.field-message {
  @apply flex flex-col gap-1;
}

.field-message-animated {
  @apply grid overflow-hidden [grid-template-rows:1fr];
}

.field-message-content {
  @apply flex min-h-0 flex-col gap-1 overflow-hidden;
}

.field-message-enter-active,
.field-message-leave-active {
  @apply transition-[grid-template-rows] duration-300 ease-out will-change-[grid-template-rows];
}

.field-message-leave-active {
  @apply ease-in;
}

.field-message-enter-from,
.field-message-leave-to {
  @apply [grid-template-rows:0fr];
}

.field-message-enter-active .field-message-content,
.field-message-leave-active .field-message-content {
  @apply transition-[opacity,transform] duration-300 ease-out will-change-[opacity,transform];
}

.field-message-leave-active .field-message-content {
  @apply ease-in;
}

.field-message-enter-from .field-message-content,
.field-message-leave-to .field-message-content {
  @apply -translate-y-1 scale-[0.98] opacity-0;
}
</style>
