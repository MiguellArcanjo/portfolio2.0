import { Home } from '@/components/home';
import { getPublishedContent } from '@/lib/content-server';
import './editorial.css';
import './portrait-intro.css';
import './experience.css';

// Prerendered with the content from Supabase; saving in /admin regenerates it immediately (revalidatePath).
export const revalidate = 3600;

export default async function Page() {
  const content = await getPublishedContent();
  return <Home content={content}/>;
}
