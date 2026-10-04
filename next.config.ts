import type { NextConfig } from 'next';

const config: NextConfig = {
  turbopack: { root: process.cwd() },
  // Needed for app/global-not-found.tsx: each language has its own root layout, so there is no shared one for 404s.
  experimental: { globalNotFound: true },
};

export default config;
