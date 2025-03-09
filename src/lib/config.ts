import { z } from 'zod'

const envSchema = z.object({
  OLLAMA_API_HOST: z.string().url().default('http://localhost:11434'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

type EnvSchema = z.infer<typeof envSchema>

function determineOllamaHost(): string {
  // In development or test, always use localhost
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    return 'http://localhost:11434'
  }

  // In production with Docker, use Docker host
  if (process.env.NODE_ENV === 'production' && process.env.DOCKER_CONTAINER === 'true') {
    return 'http://ollama:11434'
  }

  // Allow override through environment variable
  return process.env.OLLAMA_API_HOST || 'http://localhost:11434'
}

function normalizeNodeEnv(env: string | undefined): 'development' | 'production' | 'test' {
  if (!env || !['development', 'production', 'test'].includes(env)) {
    console.warn(`Warning: Non-standard NODE_ENV value "${env}". Using "development".`)
    return 'development'
  }
  return env as 'development' | 'production' | 'test'
}

export function getConfig(): EnvSchema {
  try {
    const ollamaHost = determineOllamaHost()
    const nodeEnv = normalizeNodeEnv(process.env.NODE_ENV)
    
    console.log('Environment Configuration:', {
      OLLAMA_API_HOST: ollamaHost,
      NODE_ENV: nodeEnv,
      IS_DOCKER: process.env.DOCKER_CONTAINER === 'true'
    })
    
    return envSchema.parse({
      OLLAMA_API_HOST: ollamaHost,
      NODE_ENV: nodeEnv,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Config validation error:', error.errors)
      throw new Error(
        `Invalid environment variables: ${error.errors.map((e) => e.message).join(', ')}`
      )
    }
    throw error
  }
}

export const config = getConfig() 