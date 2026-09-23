import type { Metadata } from 'next';
import { DM_Sans, Manrope, IBM_Plex_Mono } from 'next/font/google';
import { siteUrl } from '@/lib/site-url';
import './globals.css';

// Self-hosted and preloaded by next/font: no render-blocking request to Google Fonts.
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: 'Cyber / FullStack — Portfólio',
  description: 'Desenvolvimento full stack e cibersegurança. Interfaces, sistemas e segurança por design.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" className={`${dmSans.variable} ${manrope.variable} ${plexMono.variable}`}><body>{children}</body></html>;
}
