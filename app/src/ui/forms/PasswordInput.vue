<script setup lang="ts">
import { ref } from 'vue';

import EyeIcon from '../icons/EyeIcon.vue';
import EyeOffIcon from '../icons/EyeOffIcon.vue';
import Button from '../primitives/Button.vue';

withDefaults(
  defineProps<{
    modelValue: string;
    id?: string;
    placeholder?: string;
    disabled?: boolean;
    autocomplete?: string;
    invalid?: boolean;
    describedBy?: string;
  }>(),
  {
    id: undefined,
    placeholder: undefined,
    autocomplete: 'off',
    invalid: false,
    describedBy: undefined,
  },
);

defineEmits<{
  'update:modelValue': [value: string];
  blur: [];
}>();

const visible = ref(false);
const toggleButtonRef = ref<InstanceType<typeof Button> | null>(null);
const activatedByPointer = ref(false);

function handleTogglePointerDown(): void {
  activatedByPointer.value = true;
}

function handleToggleClick(): void {
  visible.value = !visible.value;

  if (activatedByPointer.value) {
    toggleButtonRef.value?.$el?.blur();
    activatedByPointer.value = false;
  }
}
</script>

<template>
  <div
    class="password-input"
    :class="{ 'password-input-error': invalid, disabled: disabled }"
  >
    <input
      :id="id"
      :value="modelValue"
      :type="visible ? 'text' : 'password'"
      class="form-control input-field"
      :class="{ 'input-error': invalid }"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :disabled="disabled"
      spellcheck="false"
      :aria-invalid="invalid ? 'true' : undefined"
      :aria-describedby="describedBy"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="$emit('blur')"
    />
    <Button
      ref="toggleButtonRef"
      variant="text-only"
      icon-only
      no-ring
      class="toggle-btn"
      type="button"
      :disabled="disabled"
      :aria-label="visible ? 'Hide password' : 'Show password'"
      @pointerdown="handleTogglePointerDown"
      @click="handleToggleClick"
    >
      <EyeOffIcon
        v-if="visible"
        class="!text-xl"
      />
      <EyeIcon
        v-else
        class="!text-xl"
      />
    </Button>
  </div>
</template>

<style lang="scss" scoped>
.password-input {
  @apply flex
    items-center
    overflow-hidden
    relative;

  &:not(.disabled) {
    &:hover > .form-control,
    &:focus-within > .form-control {
      @apply border-primary-lighter
        text-primary-lighter;
    }
  }
}

.toggle-btn {
  @apply absolute
    border
    border-transparent
    h-full
    mr-[1px]
    right-0
    rounded-l-none
    rounded-r-md
    w-9;
}

.input-field {
  @apply pr-11;
}
</style>
