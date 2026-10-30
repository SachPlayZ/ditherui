import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';
import { components } from '@/registry/meta';

// Component pages also index their category and modes, so "feedback" or "ascii" finds them.
// Exported once at build and searched in the browser: a per-isolate index build blew the Worker CPU limit.
export const revalidate = false;
export const { staticGET: GET } = createFromSource(source, {
  async buildIndex(page) {
    const { structuredData } = page.data;
    const meta = components.find((c) => page.url === `/docs/components/${c.name}`);
    return {
      id: page.url,
      url: page.url,
      title: page.data.title,
      description: page.data.description,
      structuredData: meta
        ? { ...structuredData, contents: [...structuredData.contents, { heading: undefined, content: `${meta.category} · ${meta.modes.join(' ')}` }] }
        : structuredData,
    };
  },
});
