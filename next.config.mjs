import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const config = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: false,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.ollama\.ai\/.*$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'ollama-api-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        },
        networkTimeoutSeconds: 10
      }
    }
  ]
})({
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
  }
});

export default config;
