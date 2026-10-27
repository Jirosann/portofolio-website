import type { NextConfig } from "next";

const dev = process.env.NODE_ENV === 'development';
// Deployment preview Vercel menyuntikkan toolbar dari vercel.live; produksi tidak.
const preview = process.env.VERCEL_ENV === 'preview';
const vercelLive = preview ? ' https://vercel.live' : '';

// Skrip inline (payload RSC Next, next-themes, skrip hold-render di layout) butuh 'unsafe-inline'. CSP berbasis nonce
// memaksa setiap halaman dirender per request, jadi tidak dipakai. Satu-satunya pihak ketiga: iframe video Google Drive
// (public/video-facade.js) yang baru dibuat saat diklik. Dev: React butuh eval untuk debugging.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}${vercelLive}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${vercelLive}`,
  "font-src 'self'",
  `connect-src 'self'${vercelLive}`,
  `frame-src https://drive.google.com${vercelLive}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(dev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    unoptimized: true, // Manual WebP optimization via Sharp
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
