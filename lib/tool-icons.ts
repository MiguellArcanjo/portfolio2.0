import * as simpleIcons from 'simple-icons';
import type { SiteContent } from './content';

// A brand logo for a tool: the SVG path (24x24) and the color it is drawn in.
export type ToolIcon = { path: string; color: string };
export type ToolIcons = Record<string, ToolIcon>;

// Names people write that differ from the simple-icons slug, or brands that left the set.
const aliases: Record<string, string> = { expressdotjs: 'express', java: 'openjdk', jwt: 'jsonwebtokens', nextjs: 'nextdotjs', nodejs: 'nodedotjs', socketio: 'socketdotio', postgres: 'postgresql', tailwind: 'tailwindcss', html: 'html5', css: 'css', kali: 'kalilinux' };

// Same rule simple-icons uses to turn a title into a slug.
const toSlug = (value: string) => value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/\+/g, 'plus').replace(/\./g, 'dot').replace(/&/g, 'and').replace(/#/g, 'sharp').replace(/[^a-z0-9]/g, '');

// Brand colors close to black disappear on the dark page; those fall back to the text color.
const tooDark = (hex: string) => {
  const [r, g, b] = [0, 2, 4].map(at => parseInt(hex.slice(at, at + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.22;
};

function find(slug: string) {
  const key = `si${slug.charAt(0).toUpperCase()}${slug.slice(1)}` as keyof typeof simpleIcons;
  const icon = simpleIcons[key] as { path?: string; hex?: string } | undefined;
  return icon?.path ? { path: icon.path, color: tooDark(icon.hex ?? '000000') ? '' : `#${icon.hex}` } : null;
}

// Resolved on the server so the client only receives the few logos the page shows, not the whole set.
export function resolveToolIcons(toolkit: SiteContent['toolkit']): ToolIcons {
  const icons: ToolIcons = {};
  for (const tool of toolkit.areas.flatMap(area => area.tools)) {
    const slug = toSlug(tool.icon?.trim() || tool.name);
    if (!slug || icons[tool.name]) continue;
    const icon = find(aliases[slug] ?? slug);
    if (icon) icons[tool.name] = icon;
  }
  return icons;
}
