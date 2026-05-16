<script setup lang="ts">
import { Button, Card, ChevronIcon, Disclosure } from '@/ui';

import type { ProviderHelpStep } from '../../providers/utils';

defineProps<{
  instructions: { title: string; steps: ProviderHelpStep[]; note?: string };
}>();

function hasLink(step: ProviderHelpStep): boolean {
  return Boolean(step.linkText && step.href);
}
</script>

<template>
  <Disclosure>
    <template #trigger="{ open, toggle, contentId }">
      <Button
        variant="text-only"
        class="self-start w-full !px-2 !justify-start !border-b !border"
        type="button"
        :aria-expanded="open"
        :aria-controls="contentId"
        @click="toggle"
      >
        <ChevronIcon
          class="chevron"
          :class="{ 'chevron-open': open }"
        />
        How to get your key?
      </Button>
    </template>
    <Card variant="secondary">
      <h5 class="card-title text-primary-lighter">{{ instructions.title }}</h5>
      <ol class="help-steps">
        <li
          v-for="step in instructions.steps"
          :key="step.href ?? step.text"
        >
          <template v-if="hasLink(step)">
            {{ step.text.split('{link}')[0]
            }}<a
              class="link help-link"
              :href="step.href"
              target="_blank"
              rel="noopener noreferrer"
              >{{ step.linkText }}</a
            >{{ step.text.split('{link}')[1] }}
          </template>
          <template v-else>
            {{ step.text }}
          </template>
        </li>
      </ol>
      <p
        v-if="instructions.note"
        class="help-note"
      >
        {{ instructions.note }}
      </p>
      <p class="text-sm">Keep your API key private and never share it publicly</p>
    </Card>
  </Disclosure>
</template>

<style lang="scss" scoped>
.help-steps {
  @apply leading-5
  	list-decimal
  	list-inside
  	px-1
  	text-sm
  	text-typography-subtle;

  > li {
    @apply py-1;
  }
}

.help-link {
  @apply font-semibold;
}

.chevron {
  @apply -rotate-90
  	duration-200
  	mr-1
  	transition-transform;
}

.chevron-open {
  @apply rotate-0;
}
</style>
