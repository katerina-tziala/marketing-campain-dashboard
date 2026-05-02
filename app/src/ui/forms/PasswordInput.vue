<script setup lang="ts">
import { ref } from "vue";
import Button from "../primitives/Button.vue";
import EyeIcon from "../icons/EyeIcon.vue";
import EyeOffIcon from "../icons/EyeOffIcon.vue";

const props = withDefaults(
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
    autocomplete: "off",
    invalid: false,
    describedBy: undefined,
  },
);

defineEmits<{ "update:modelValue": [value: string] }>();

const visible = ref(false);
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
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    />
    <Button
      variant="text-only"
      icon-only
      no-ring
      class="toggle-btn"
      type="button"
      :disabled="disabled"
      :aria-label="visible ? 'Hide password' : 'Show password'"
      @click="visible = !visible"
    >
      <EyeOffIcon v-if="visible" />
      <EyeIcon v-else />
    </Button>
  </div>
</template>

<style lang="scss" scoped>
.password-input {
  @apply relative flex items-center overflow-hidden;

  &:not(.disabled) {
    &:hover > .form-control,
    &:focus-within > .form-control {
      @apply border-primary-light;
    }
  }
}

.toggle-btn {
  @apply absolute
    right-0
    w-9
    h-full
    border
    border-transparent
    mr-[1px]
    rounded-l-none
    rounded-r-md;
}

.input-field {
  @apply pr-11;
}
</style>
