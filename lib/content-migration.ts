import legacy from './legacy-content.json';
import { defaultContent, type SiteContent } from './content';

// Refresh only unchanged template fields. User-authored values and array order survive.
function upgrade(value: unknown, previous: unknown, next: unknown): unknown {
  if (JSON.stringify(value) === JSON.stringify(previous)) return next;
  if (Array.isArray(value) && Array.isArray(previous) && Array.isArray(next)) {
    return value.map((entry, index) => {
      const id = entry && typeof entry === 'object' ? entry.id : undefined;
      const oldIndex = id ? previous.findIndex(item => item?.id === id) : index;
      const newIndex = id ? next.findIndex(item => item?.id === id) : index;
      if (oldIndex < 0 || newIndex < 0 || oldIndex >= previous.length || newIndex >= next.length) return entry;
      return upgrade(entry, previous[oldIndex], next[newIndex]);
    });
  }
  if (value && previous && next && typeof value === 'object' && typeof previous === 'object' && typeof next === 'object') {
    const oldFields = previous as Record<string, unknown>;
    const newFields = next as Record<string, unknown>;
    return Object.fromEntries(Object.entries(value).map(([key, field]) => [key,
      key in oldFields && key in newFields ? upgrade(field, oldFields[key], newFields[key]) : field,
    ]));
  }
  return value;
}

export function upgradeTemplateContent(stored: Partial<SiteContent>): Partial<SiteContent> {
  return upgrade(stored, legacy, defaultContent) as Partial<SiteContent>;
}
