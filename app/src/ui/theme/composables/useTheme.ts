import { onMounted, onUnmounted, type Ref, ref } from 'vue';

import type { AppTheme } from '../types';

const THEME_ATTRIBUTE = 'data-theme';
const DEFAULT_THEME: AppTheme = 'dark';

function readTheme(): AppTheme {
  const value = document.documentElement.getAttribute(THEME_ATTRIBUTE);
  return (value as AppTheme) ?? DEFAULT_THEME;
}

export function useTheme(): {
  currentTheme: Ref<AppTheme>;
} {
  const currentTheme = ref<AppTheme>(readTheme());

  let observer: MutationObserver | null = null;

  onMounted(() => {
    observer = new MutationObserver(() => {
      currentTheme.value = readTheme();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [THEME_ATTRIBUTE],
    });
  });

  onUnmounted(() => {
    observer?.disconnect();
    observer = null;
  });

  return { currentTheme };
}
