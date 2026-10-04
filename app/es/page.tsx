import { SitePage, siteMetadata } from '@/components/site-page';

export const revalidate = 3600;
export const generateMetadata = () => siteMetadata('es');

export default function Page() {
  return <SitePage locale="es"/>;
}
