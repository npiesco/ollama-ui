import { z } from 'zod'

const envSchema = z.object({
  OLLAMA_API_HOST: z.string().url().default('http://localhost:11434'),
})

type EnvSchema = z.infer<typeof envSchema>

export function getConfig(): EnvSchema {
  try {
    return envSchema.parse({
      OLLAMA_API_HOST: process.env.OLLAMA_API_HOST,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid environment variables: ${error.errors.map((e) => e.message).join(', ')}`
      )
    }
    throw error
  }
}

export const config = getConfig() 