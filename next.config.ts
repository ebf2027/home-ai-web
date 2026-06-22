import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : "*.supabase.co";

const cspHeader = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://s.pinimg.com https://accounts.google.com`,
  `style-src 'self' 'unsafe-inline' https://accounts.google.com`,
  // Permite chamadas de rede ao Supabase (Auth, DB, Storage) e Google OAuth
  `connect-src 'self' https://${supabaseHost} https://*.supabase.co https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com https://region1.google-analytics.com https://analytics.google.com`,
  `img-src 'self' blob: data: https://ct.pinterest.com https://${supabaseHost} https://*.supabase.co https://lh3.googleusercontent.com`,
  `font-src 'self'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self' https://accounts.google.com`,
  `frame-src https://accounts.google.com`,
  `frame-ancestors 'none'`,
  `upgrade-insecure-requests`,
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // CORREÇÃO CRÍTICA: 'same-origin' quebrava o OAuth do Google (popup não conseguia
          // se comunicar com a janela pai). 'same-origin-allow-popups' resolve isso.
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ]
  },
};

export default nextConfig;