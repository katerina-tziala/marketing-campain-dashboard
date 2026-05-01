<script setup lang="ts">
import { ref, computed, useSlots, Comment } from "vue";
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
  }>(),
  {
    autocomplete: "off",
  },
);

defineEmits<{ "update:modelValue": [value: string] }>();

const slots = useSlots();
const visible = ref(false);

const hasError = computed(() => {
  if (!slots.error) return false;
  return slots.error().some((vnode) => vnode.type !== Comment);
});

const errorId = computed(() => (props.id ? `${props.id}-error` : undefined));
</script>

<template>
  <div
    class="password-input"
    :class="{ 'password-input-error': hasError, disabled: disabled }"
  >
    <input
      :id="id"
      :value="modelValue"
      :type="visible ? 'text' : 'password'"
      class="form-control input-field"
      :class="{ 'input-error': hasError }"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :disabled="disabled"
      spellcheck="false"
      :aria-invalid="hasError ? 'true' : undefined"
      :aria-describedby="hasError && errorId ? errorId : undefined"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    />
    <Button
      class="text-only no-ring toggle-btn"
      type="button"
      :disabled="disabled"
      :aria-label="visible ? 'Hide password' : 'Show password'"
      @click="visible = !visible"
    >
      <EyeOffIcon v-if="visible" />
      <EyeIcon v-else />
    </Button>
  </div>
  <div :id="errorId">
    <slot name="error" />
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
