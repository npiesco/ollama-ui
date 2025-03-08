import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const config = {
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
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  publicExternalAssets: ['/.well-known/apple-app-site-association'],
  manifest: {
    name: 'Ollama UI',
    short_name: 'Ollama',
    description: 'A modern UI for Ollama - Local AI Workbench',
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
    start_url: '/',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ],
    theme_color: '#000000',
    background_color: '#ffffff'
  }
})(config);
