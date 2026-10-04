import { RootDocument, rootMetadata } from '@/components/root-document';

export const metadata = rootMetadata;

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootDocument lang="es">{children}</RootDocument>;
}
