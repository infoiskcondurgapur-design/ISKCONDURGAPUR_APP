const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ─── Image Optimisation ───────────────────────────────────────────────────
  images: {
    // Remove `unoptimized: true` so Next.js compresses & resizes images
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      { protocol: 'https', hostname: '**' }, // allow any https image src
    ],
  },

  // ─── Compiler / Tree-shaking ──────────────────────────────────────────────
  // Reduces JS bundle by only importing the icons/modules actually used
  experimental: {
    optimizePackageImports: ['react-icons', 'framer-motion'],
  },

  // ─── HTTP Headers ─────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        // Cache static assets for 1 year
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache public images for 30 days
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ],
      },
      {
        // Security headers on all routes
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },


  // ─── Build output compression ─────────────────────────────────────────────
  compress: true,
  poweredByHeader: false,
};

module.exports = withPWA(nextConfig);