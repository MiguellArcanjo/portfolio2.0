import type { Metadata } from 'next';
import { fontClasses } from '@/components/root-document';

// With one root layout per language there is no single layout to wrap a 404, so unmatched URLs land here.
export const metadata: Metadata = {
  title: '404 — Página não encontrada',
  robots: { index: false, follow: true },
};

const links: [string, string, string][] = [['/', 'pt-BR', 'Voltar ao início'], ['/en', 'en', 'Back to home'], ['/es', 'es', 'Volver al inicio']];

export default function GlobalNotFound() {
  return <html lang="pt-BR" className={fontClasses}>
    <body style={{ margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#121416', color: '#f0eee8', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <main style={{ padding: 24, textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-plex-mono), monospace', fontSize: 12, letterSpacing: '.08em', color: '#a0a3a4' }}>404</p>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 500, letterSpacing: '-.05em', margin: '12px 0 28px' }}>Página não encontrada.</h1>
        <nav style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', fontSize: 14 }}>
          {links.map(([href, lang, label]) => <a key={href} href={href} hrefLang={lang} lang={lang} style={{ color: '#9baeff' }}>{label}</a>)}
        </nav>
      </main>
    </body>
  </html>;
}
