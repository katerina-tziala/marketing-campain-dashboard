<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';

import type { ButtonSize, ButtonVariant } from './button.types';

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    iconOnly?: boolean;
    noRing?: boolean;
  }>(),
  {
    variant: 'primary',
    size: 'default',
    iconOnly: false,
    noRing: false,
  },
);

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const buttonRef = ref<HTMLButtonElement>();
const buttonClasses = computed(() => [
  props.variant,
  props.size,
  props.iconOnly ? 'icon-only' : undefined,
  props.noRing ? 'no-ring' : undefined,
]);
const buttonTitle = computed(() => {
  if (typeof attrs.title === 'string') {
    return attrs.title;
  }
  const ariaLabel = attrs['aria-label'];
  return props.iconOnly && typeof ariaLabel === 'string' ? ariaLabel : undefined;
});

function getRootEl(): HTMLButtonElement | undefined {
  return buttonRef.value;
}

defineExpose({
  getRootEl,
});
</script>

<template>
  <button
    ref="buttonRef"
    v-bind="$attrs"
    class="btn"
    :class="buttonClasses"
    :title="buttonTitle"
  >
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.btn {
  @apply border
  	border-transparent
  	cursor-pointer
  	duration-150
  	ease-in-out
  	font-medium
  	gap-1.5
  	h-10
  	inline-flex
  	items-center
  	justify-center
  	leading-none
  	opacity-85
  	outline-none
  	overflow-hidden
  	px-4
  	py-3
  	relative
  	rounded-md
  	text-base
  	text-center
  	tracking-wide
  	transition
  	whitespace-nowrap;

  &:deep(svg) {
    @apply text-xl;
  }

  &:disabled {
    @apply cursor-not-allowed
    	opacity-50;
  }

  &:active {
    @apply opacity-75;
  }

  /* variant small */
  &.btn.small {
    @apply h-9
    	leading-4
    	px-3
    	py-0
    	text-sm;
  }

  /* variant smaller */
  &.btn.smaller {
    @apply h-7
    	leading-none
    	px-2.5
    	py-0
    	text-xs;
  }
}

/* variant icon-only */
.btn.icon-only {
  @apply p-0
  	size-10;

  &:deep(svg) {
    @apply text-2xl;
  }

  &.btn.small {
    @apply p-0
    	size-9;

    &:deep(svg) {
      @apply text-xl;
    }
  }
}

/* variant primary */
.btn.primary {
  @apply bg-primary-darker
  	text-typography-strong;

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply bg-primary-deep
      	text-typography-inverse;
    }

    &:not(.no-ring):focus-visible {
      @apply ring-2
      	ring-offset-1
      	ring-offset-background
      	ring-primary-light;
    }
  }
}

/* variant text-only */
.btn.text-only {
  @apply border-transparent
  	text-primary-lighter/80;

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply bg-primary-light/10
      	text-primary-light;
    }

    &:not(.no-ring):focus-visible {
      @apply ring-2
      	ring-offset-1
      	ring-offset-background
      	ring-primary-light;
    }
  }
}

/* variant outline */
.btn.outline {
  @apply bg-surface
  	border-primary-light
  	text-primary-light;

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply border-primary-lighter
      	text-primary-lighter;
    }

    &:not(.no-ring):focus-visible {
      @apply ring-2
      	ring-offset-1
      	ring-offset-background
      	ring-primary-light;
    }
  }
}

/* variant accent-outline */
.btn.accent-outline {
  @apply bg-surface
  	border-accent-dark
  	text-accent-light;

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply border-accent
      	text-accent-lighter;
    }

    &:not(.no-ring):focus-visible {
      @apply ring-2
      	ring-accent
      	ring-offset-1
      	ring-offset-background;
    }
  }
}

/* variant info-text-only */
.btn.info-text-only {
  @apply bg-transparent
  	border
  	border-transparent
  	text-typography-subtle;

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply bg-surface
      	text-info;
    }

    &:not(.no-ring):focus-visible {
      @apply ring-2
      	ring-info-dark
      	ring-offset-1
      	ring-offset-background;
    }
  }
}

/* variant ghost */
.btn.ghost {
  @apply border-transparent
  	text-typography-subtle;

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply bg-typography/[8%]
      	text-typography;
    }

    &:not(.no-ring):focus-visible {
      @apply ring-2
      	ring-offset-1
      	ring-offset-background
      	ring-primary-lighter;
    }
  }
}

/* variant ghost-outline */
.btn.ghost-outline {
  @apply border-typography-subtle
  	text-typography-subtle;

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply bg-typography/[8%]
      	border-typography-soft
      	text-typography;
    }

    &:not(.no-ring):focus-visible {
      @apply ring-2
      	ring-offset-1
      	ring-offset-background
      	ring-primary-lighter;
    }
  }
}

/* variant info-outline */
.btn.info-outline {
  @apply bg-surface
  	border-info-dark
  	text-info;

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply bg-info-dark
      	text-info
      	text-primary-ink;
    }

    &:not(.no-ring):focus-visible {
      @apply ring-2
      	ring-info
      	ring-offset-1
      	ring-offset-background;
    }
  }
}

/* variant destructive */
.btn.destructive {
  @apply border-transparent
  	font-normal
  	text-typography-subtle;

  &:not(:disabled) {
    &:hover,
    &:focus-visible {
      @apply bg-danger-darker/10
      	text-danger;
    }

    &:not(.no-ring):focus-visible {
      @apply ring-2
      	ring-danger/60
      	ring-offset-1
      	ring-offset-background;
    }
  }
}
</style>
