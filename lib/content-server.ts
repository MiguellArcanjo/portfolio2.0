import { createClient } from '@supabase/supabase-js';
import { defaultContent, type SiteContent } from './content';
import { mergeContent } from './content-merge';
import { translateContent } from './content-translate';
import { contentRow, defaultLocale, type Locale } from './locales';

// Public read for the site render. No cookies involved, so the page can be prerendered and revalidated.
// A language without its own saved version falls back to the Portuguese content, pre-translated.
export async function getPublishedContent(locale: Locale = defaultLocale): Promise<SiteContent> {
  const fallback = () => translateContent(defaultContent, locale);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return fallback();
  try {
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const rows = [...new Set([contentRow(locale), contentRow(defaultLocale)])];
    const { data, error } = await supabase.from('site_content').select('id, content').in('id', rows);
    if (error) { console.error('[content] leitura do Supabase falhou:', error.message, error.details ? `\n${error.details}` : ''); return fallback(); }
    const own = data?.find(row => row.id === contentRow(locale));
    if (own) return mergeContent(own.content);
    const base = data?.find(row => row.id === contentRow(defaultLocale));
    return translateContent(base ? mergeContent(base.content) : defaultContent, locale);
  } catch (error) {
    console.error('[content] Supabase indisponível:', error);
    return fallback();
  }
}
