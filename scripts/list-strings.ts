// Dev helper: prints every translatable string of the default content (run with `npx tsx scripts/list-strings.ts`).
import { defaultContent } from '../lib/content';

const seen = new Set<string>();
const walk = (value: unknown, path: string) => {
  if (typeof value === 'string') {
    if (value && !/^https?:|^#|^[a-z0-9-]+$|^\d+% \d+%$/.test(value) && !seen.has(value)) { seen.add(value); console.log(JSON.stringify(value)); }
  } else if (Array.isArray(value)) value.forEach((item, index) => walk(item, `${path}[${index}]`));
  else if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) if (!['id', 'icon', 'color', 'kind', 'photo', 'code', 'file', 'mark', 'updatedAt'].includes(key)) walk(item, `${path}.${key}`);
};
walk(defaultContent, '');
