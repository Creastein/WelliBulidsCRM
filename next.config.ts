import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  reactStrictMode: true,
  transpilePackages: ['@shadergradient/react'],
  async redirects() {
    return [
      {
        source: '/en',
        destination: '/',
        permanent: false,
      },
      {
        source: '/en/:path*',
        destination: '/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
