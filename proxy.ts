import { NextResponse, type NextRequest } from 'next/server';
import { LOCALE_COOKIE, isCrawler, isLocale, localeFromAcceptLanguage, localeFromCountry } from '@/lib/locale-detect';
import { defaultLocale, localePath } from '@/lib/locales';

// Opens the home page in the visitor's language. Order: their own earlier choice (cookie), the country
// reported by the host (Vercel / Cloudflare header), then the browser language. Crawlers are never
// redirected so every language version gets indexed; /en and /es links are always respected.
export function proxy(request: NextRequest) {
  if (isCrawler(request.headers.get('user-agent'))) return NextResponse.next();

  const chosen = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(chosen) ? chosen
    : localeFromCountry(request.headers.get('x-vercel-ip-country') ?? request.headers.get('cf-ipcountry'))
      ?? localeFromAcceptLanguage(request.headers.get('accept-language'))
      ?? defaultLocale;

  if (locale === defaultLocale) return NextResponse.next();
  const target = request.nextUrl.clone();
  target.pathname = localePath(locale);
  const response = NextResponse.redirect(target, 307);
  // The redirect depends on who is asking: never share it through a CDN cache.
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Vary', 'Cookie, Accept-Language');
  return response;
}

export const config = {
  matcher: '/',
};
