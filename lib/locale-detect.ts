import { locales, type Locale } from './locales';

export const LOCALE_COOKIE = 'NEXT_LOCALE';

// ISO 3166-1 alpha-2 codes of countries where Portuguese or Spanish is the main language.
const portuguese = new Set(['BR', 'PT', 'AO', 'MZ', 'CV', 'GW', 'ST', 'TL']);
const spanish = new Set(['ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'PR', 'GQ']);

export const isLocale = (value: unknown): value is Locale => typeof value === 'string' && (locales as readonly string[]).includes(value);

export function localeFromCountry(country: string | null): Locale | null {
  if (!country || country === 'XX' || country === 'T1') return null; // unknown / Tor, as reported by Vercel and Cloudflare
  const code = country.toUpperCase();
  return portuguese.has(code) ? 'pt' : spanish.has(code) ? 'es' : 'en';
}

// First supported language in the browser's preference list, e.g. "es-AR,es;q=0.9,en;q=0.8" → es.
export function localeFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const ranked = header.split(',')
    .map(part => { const [tag, ...params] = part.trim().split(';'); const q = params.find(p => p.trim().startsWith('q=')); return { base: tag.toLowerCase().split('-')[0], q: q ? Number(q.split('=')[1]) || 0 : 1 }; })
    .filter(entry => entry.q > 0)
    .sort((a, b) => b.q - a.q);
  return ranked.map(entry => entry.base).find(isLocale) ?? null;
}

const crawler = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|lighthouse|headless/i;
export const isCrawler = (userAgent: string | null) => !!userAgent && crawler.test(userAgent);
