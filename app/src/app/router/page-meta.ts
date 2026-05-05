import type { RouteLocationNormalizedLoaded } from 'vue-router';

const DEFAULT_PAGE_TITLE = 'Marketing Campaign Dashboard';
const DEFAULT_PAGE_DESCRIPTION =
  'AI-powered marketing intelligence platform for performance analysis, budget optimization, and executive summaries';

type PageMeta = {
  title?: string;
  description?: string;
};

type PageRouteMeta = {
  page?: PageMeta;
};

function getNamedMeta(name: string): HTMLMetaElement {
  const existingMeta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);

  if (existingMeta) {
    return existingMeta;
  }

  const meta = document.createElement('meta');
  meta.name = name;
  document.head.appendChild(meta);

  return meta;
}

export function applyPageMeta(route: RouteLocationNormalizedLoaded): void {
  const meta = route.meta as PageRouteMeta;
  const pageMeta = meta.page;

  document.title = pageMeta?.title ?? DEFAULT_PAGE_TITLE;
  getNamedMeta('description').content = pageMeta?.description ?? DEFAULT_PAGE_DESCRIPTION;
}
