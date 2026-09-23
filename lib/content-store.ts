'use client';

import { defaultContent, type SiteContent } from './content';
import { mergeContent } from './content-merge';
import { translateContent } from './content-translate';
import { contentRow, defaultLocale, type Locale } from './locales';
import { isLocale } from './locale-detect';
import { createClient } from './supabase/client';
import { revalidateSite } from '@/app/admin/actions';

// Content lives in the Supabase table `site_content`: one row per language ('main' = Portuguese, 'en', 'es').
// Reads are public; writes need a logged-in session (RLS). After saving, the public pages are regenerated.
const LEGACY_KEY = 'portfolio-content-v1';

async function readRow(locale: Locale): Promise<SiteContent | null> {
  const { data, error } = await createClient().from('site_content').select('content').eq('id', contentRow(locale)).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mergeContent(data.content) : null;
}

// `published` is false when the language has no version of its own yet: the content returned is then
// the Portuguese version pre-translated, which is also what the public site shows for that language.
export async function loadContent(locale: Locale = defaultLocale): Promise<{ content: SiteContent; published: boolean }> {
  const own = await readRow(locale);
  if (own) return { content: own, published: true };
  if (locale === defaultLocale) return { content: defaultContent, published: false };
  return { content: translateContent((await readRow(defaultLocale)) ?? defaultContent, locale), published: false };
}

// Fresh copy of the Portuguese content, pre-translated, to realign another language after structural edits.
export async function loadTranslatedFromPortuguese(locale: Locale): Promise<SiteContent> {
  return translateContent((await readRow(defaultLocale)) ?? defaultContent, locale);
}

export async function saveContent(content: SiteContent, locale: Locale = defaultLocale): Promise<SiteContent> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sessão expirada. Entre novamente.');
  const saved = { ...content, updatedAt: new Date().toISOString() };
  const { error } = await supabase.from('site_content').upsert({ id: contentRow(locale), content: saved, updated_at: saved.updatedAt, updated_by: user.id });
  if (error) throw new Error(error.message.includes('site_content') ? 'A tabela site_content não existe. Rode supabase/schema.sql no SQL Editor.' : error.message);
  // The data is already stored at this point; if regenerating the page fails, the site still refreshes within the hour.
  try { await revalidateSite(); } catch (reason) { console.warn('[content] salvo, mas a página não foi regenerada agora:', reason); }
  return saved;
}

export async function resetContent(locale: Locale = defaultLocale): Promise<SiteContent> {
  return saveContent(translateContent(defaultContent, locale), locale);
}

// Exported/imported files carry the language they belong to, so a Spanish file can't land in Portuguese.
export function parseContent(json: string): { content: SiteContent; locale: Locale | null } {
  const { _locale, ...stored } = JSON.parse(json);
  return { content: mergeContent(stored), locale: isLocale(_locale) ? _locale : null };
}
export const serializeContent = (content: SiteContent, locale: Locale) => JSON.stringify({ _locale: locale, ...content }, null, 2);

// Content saved by the earlier localStorage mock, offered once as an import into the database.
export function readLegacyContent(): SiteContent | null {
  try { const raw = localStorage.getItem(LEGACY_KEY); return raw ? mergeContent(JSON.parse(raw)) : null; } catch { return null; }
}
export function clearLegacyContent() {
  try { localStorage.removeItem(LEGACY_KEY); } catch {}
}
