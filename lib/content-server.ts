import { createClient } from '@supabase/supabase-js';
import { defaultContent, type SiteContent } from './content';
import { mergeContent } from './content-merge';

// Public read for the site render. No cookies involved, so the page can be prerendered and revalidated.
export async function getPublishedContent(): Promise<SiteContent> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return defaultContent;
  try {
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await supabase.from('site_content').select('content').eq('id', 'main').maybeSingle();
    if (error) { console.error('[content] leitura do Supabase falhou:', error.message); return defaultContent; }
    return data ? mergeContent(data.content) : defaultContent;
  } catch (error) {
    console.error('[content] Supabase indisponível:', error);
    return defaultContent;
  }
}
