/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    },
  },
  output: 'standalone',
  transpilePackages: ['jsonwebtoken'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '11434',
        pathname: '/**',
      },
      // Add any other domains you need to support
    ],
    domains: ['localhost'],
  },
};

export default config;
