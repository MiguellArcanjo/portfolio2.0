import { ogContentType, ogSize, projectOgImage } from '@/lib/og-image';

export const revalidate = 3600;
export const alt = 'Miguel Arcanjo — Portafolio';
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  return projectOgImage('es', (await params).id);
}
