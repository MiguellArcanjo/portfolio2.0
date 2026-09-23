// Absolute origin of the site, used for canonical and hreflang URLs (search engines require absolute URLs).
// Set NEXT_PUBLIC_SITE_URL to the final domain; on Vercel the production domain is used automatically.
export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL
    ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000'),
);
