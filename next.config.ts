// /ollama-ui/next.config.ts
import { NextConfig } from 'next'

const config: NextConfig = {
  output: 'standalone',
  env: {
    OLLAMA_API_HOST: process.env.OLLAMA_API_HOST || 'http://localhost:11434',
    NODE_ENV: process.env.NODE_ENV || 'development',
    DOCKER_CONTAINER: process.env.DOCKER_CONTAINER || 'false',
  },
  reactStrictMode: true,
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
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001'],
    },
  },
};

export default config;