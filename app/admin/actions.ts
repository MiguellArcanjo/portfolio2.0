'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { locales, localePath } from '@/lib/locales';

// Regenerates the prerendered public pages right after the admin saves content.
export async function revalidateSite() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado.');
  // Every language is refreshed: untranslated languages derive their content from Portuguese.
  locales.forEach(locale => revalidatePath(localePath(locale)));
}
