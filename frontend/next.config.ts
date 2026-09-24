import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // "Halmeoni suggests" became the Mood screen.
  async redirects() {
    return [{ source: '/suggest', destination: '/mood', permanent: true }];
  },
};

export default nextConfig;
