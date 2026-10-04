import { ImageResponse } from 'next/og';
import type { Locale } from './locales';
import { publishedContent, seoCopy } from './seo';
import { siteUrl } from './site-url';

// Share cards (LinkedIn, WhatsApp, X…) in the site's look: dark background, accent glow, big type.
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

const colors = { bg: '#121416', fg: '#f0eee8', muted: '#a0a3a4', accent: '#9baeff', border: '#343638' };
const projectLabel: Record<Locale, string> = { pt: 'Projeto', en: 'Project', es: 'Proyecto' };

function Card({ kicker, title, subtitle, footer }: { kicker: string; title: string; subtitle: string; footer: string }) {
  return <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px', backgroundColor: colors.bg, backgroundImage: 'radial-gradient(circle at 88% 8%, rgba(155,174,255,0.24) 0%, rgba(155,174,255,0) 42%)', color: colors.fg }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 22, letterSpacing: 3, textTransform: 'uppercase', color: colors.muted }}>
      <div style={{ width: 12, height: 12, borderRadius: 12, background: colors.accent, display: 'flex' }}/>
      {kicker}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ fontSize: title.length > 28 ? 70 : 92, fontWeight: 600, letterSpacing: -3, lineHeight: 1.02, display: 'flex' }}>{title}</div>
      <div style={{ fontSize: 32, lineHeight: 1.35, color: colors.muted, maxWidth: 980, display: 'flex' }}>{subtitle}</div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${colors.border}`, paddingTop: 26, fontSize: 24, color: colors.muted }}>
      <div style={{ display: 'flex' }}>{footer}</div>
      <div style={{ display: 'flex', color: colors.accent }}>{siteUrl.host}</div>
    </div>
  </div>;
}

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

export async function homeOgImage(locale: Locale) {
  const { profile } = await publishedContent(locale);
  const { role, portfolio } = seoCopy(locale);
  return new ImageResponse(<Card kicker={portfolio} title={profile.name} subtitle={role} footer={profile.role}/>, ogSize);
}

export async function projectOgImage(locale: Locale, id: string) {
  const content = await publishedContent(locale);
  const project = content.projects.find(item => item.id === id);
  const { role } = seoCopy(locale);
  if (!project) return homeOgImage(locale);
  return new ImageResponse(<Card kicker={[projectLabel[locale], project.category].filter(Boolean).join(' · ')} title={clip(project.title, 48)} subtitle={clip(project.description, 150)} footer={`${content.profile.name} — ${role}`}/>, ogSize);
}
