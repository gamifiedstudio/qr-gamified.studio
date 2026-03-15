import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'avatars.githubusercontent.com' },
    ],
  },
  serverExternalPackages: ['qrcode'],
  async redirects() {
    return [
      {
        source: '/blog/building-tools-is-easier-than-you-think',
        destination: '/blog/hello-world',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
