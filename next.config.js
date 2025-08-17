/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for containerization
  output: 'standalone',
  
  // Image optimization configuration
  images: {
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
  
  // Rewrites for API routes (if needed)
  async rewrites() {
    return [
      // Add any URL rewrites here if needed
    ];
  },
  
  // Environment variable validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Experimental features
  experimental: {
    // Enable server components (updated for Next.js 15)
  },
  
  // External packages (moved from experimental in Next.js 15)
  serverExternalPackages: ['@prisma/client'],
  
  // Webpack configuration for production optimizations
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // Typescript configuration
  typescript: {
    // Disable type checking during build (use separate CI step)
    ignoreBuildErrors: true,
  },
  
  // ESLint configuration
  eslint: {
    // Disable ESLint during builds (use separate CI step)
    ignoreDuringBuilds: true,
  },
  
  // Compression and caching
  compress: true,
  
  // Power features
  poweredByHeader: false,
  
  // Redirects for common routes
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/admin',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
