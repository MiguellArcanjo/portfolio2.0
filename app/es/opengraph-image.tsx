import { homeOgImage, ogContentType, ogSize } from '@/lib/og-image';

export const revalidate = 3600;
export const alt = 'Miguel Arcanjo — Portafolio';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return homeOgImage('es');
}
