import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Let the dev server be opened through an ngrok tunnel.
  allowedDevOrigins: ['*.ngrok-free.dev', '*.ngrok-free.app', '*.ngrok.app'],
  // The browser calls /api on this app and Next forwards it to the backend (see src/lib/api.ts).
  async rewrites() {
    const backend = (process.env.BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');
    return [{ source: '/api/:path*', destination: `${backend}/api/:path*` }];
  },
  // "Halmeoni suggests" became the Mood screen.
  async redirects() {
    return [{ source: '/suggest', destination: '/mood', permanent: true }];
  },
};

export default nextConfig;
