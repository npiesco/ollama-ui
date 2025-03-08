// /ollama-ui/next.config.ts
import { NextConfig } from 'next'

const isDevelopment = process.env.NODE_ENV === 'development'
const isDocker = process.env.DOCKER_CONTAINER === 'true'

const config: NextConfig = {
  output: 'standalone',
  env: {
    OLLAMA_API_HOST: isDevelopment || !isDocker
      ? 'http://localhost:11434'
      : (process.env.OLLAMA_API_HOST || 'http://ollama:11434'),
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