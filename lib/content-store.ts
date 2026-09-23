'use client';

import { defaultContent, type SiteContent } from './content';
import { mergeContent } from './content-merge';
import { createClient } from './supabase/client';
import { revalidateSite } from '@/app/admin/actions';

// Content lives in the Supabase table `site_content` (single row 'main').
// Reads are public; writes need a logged-in session (RLS). After saving, the public page is regenerated.
const ROW = 'main';
const LEGACY_KEY = 'portfolio-content-v1';

export async function loadContent(): Promise<SiteContent> {
  const { data, error } = await createClient().from('site_content').select('content').eq('id', ROW).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mergeContent(data.content) : defaultContent;
}

export async function saveContent(content: SiteContent): Promise<SiteContent> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sessão expirada. Entre novamente.');
  const saved = { ...content, updatedAt: new Date().toISOString() };
  const { error } = await supabase.from('site_content').upsert({ id: ROW, content: saved, updated_at: saved.updatedAt, updated_by: user.id });
  if (error) throw new Error(error.message.includes('site_content') ? 'A tabela site_content não existe. Rode supabase/schema.sql no SQL Editor.' : error.message);
  // The data is already stored at this point; if regenerating the page fails, the site still refreshes within the hour.
  try { await revalidateSite(); } catch (reason) { console.warn('[content] salvo, mas a página não foi regenerada agora:', reason); }
  return saved;
}

export async function resetContent(): Promise<SiteContent> {
  return saveContent(defaultContent);
}

export const parseContent = (json: string): SiteContent => mergeContent(JSON.parse(json));

// Content saved by the earlier localStorage mock, offered once as an import into the database.
export function readLegacyContent(): SiteContent | null {
  try { const raw = localStorage.getItem(LEGACY_KEY); return raw ? mergeContent(JSON.parse(raw)) : null; } catch { return null; }
}
export function clearLegacyContent() {
  try { localStorage.removeItem(LEGACY_KEY); } catch {}
}
