import { SitePage, siteMetadata } from '@/components/site-page';

// Prerendered with the content from Supabase; saving in /admin regenerates it immediately (revalidatePath).
export const revalidate = 3600;
export const metadata = siteMetadata('pt');

export default function Page() {
  return <SitePage locale="pt"/>;
}
