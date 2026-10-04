import type { Metadata } from 'next';
import { DM_Sans, Manrope, IBM_Plex_Mono, Instrument_Serif } from 'next/font/google';
import { siteUrl } from '@/lib/site-url';
import '@/app/globals.css';

// Shared by the three root layouts (app/(pt), app/en, app/es). Each language has its own root layout
// so the server-rendered <html lang> is right for search engines, not just corrected in the browser.

// Self-hosted and preloaded by next/font: no render-blocking request to Google Fonts.
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });
// Serif italic for the big statement lines of the project pages.
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono', display: 'swap' });

export const fontClasses = `${dmSans.variable} ${manrope.variable} ${plexMono.variable} ${serif.variable}`;

export const rootMetadata: Metadata = {
  metadataBase: siteUrl,
  twitter: { card: 'summary_large_image' },
};

export function RootDocument({ lang, children }: { lang: string; children: React.ReactNode }) {
  // Browser extensions (e.g. Google Tag Assistant) add attributes to <html> before hydration;
  // this silences that mismatch on <html> only, children are still checked.
  return <html lang={lang} suppressHydrationWarning className={fontClasses}><body>{children}</body></html>;
}
