import { SitePage, siteMetadata } from '@/components/site-page';

export const revalidate = 3600;
export const metadata = siteMetadata('en');

export default function Page() {
  return <SitePage locale="en"/>;
}
