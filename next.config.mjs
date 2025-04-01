import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  // Service worker configuration
  swSrc: "src/lib/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  // Serwist configuration
  cacheOnNavigation: true,
  reloadOnOnline: true
});

/** @type {import('next').NextConfig} */
const config = withSerwist({
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001']
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
  env: {
    OLLAMA_API_HOST: process.env.OLLAMA_API_HOST,
    AUTH_ENABLED: process.env.AUTH_ENABLED,
    IS_DOCKER: String(process.env.IS_DOCKER || 'false'),
  },
  publicRuntimeConfig: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src'],
  },
  typescript: {
    ignoreBuildErrors: false,
  }
});

export default config;
