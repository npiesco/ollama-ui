import { config } from './config'

export interface ModelInfo {
  name: string
  size: number
  digest: string
  details: {
    format: string
    family: string
    families: string[] | null
    parameter_size: string
    quantization_level: string
  }
}

export interface ModelTagsResponse {
  models: ModelInfo[]
}

/**
 * Verifies if a model is installed by checking the Ollama API
 * @param modelName The name of the model to check (can include tag)
 * @returns Promise<boolean> True if the model is installed, false otherwise
 */
export async function isModelInstalled(modelName: string): Promise<boolean> {
  try {
    const response = await fetch(`${config.OLLAMA_API_HOST}/api/tags`)
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`)
    }

    const data: ModelTagsResponse = await response.json()
    const normalizedModelName = modelName.toLowerCase()

    return data.models.some(model => {
      const installedName = model.name.toLowerCase()
      return installedName === normalizedModelName || 
             installedName.startsWith(normalizedModelName + ':')
    })
  } catch (error) {
    console.error('Error checking model installation:', error)
    return false
  }
}

/**
 * CLI utility to check if a model is installed
 * Usage: node -e "require('./src/lib/model-verification').checkModelCLI('model-name')"
 */
export async function checkModelCLI(modelName: string): Promise<void> {
  try {
    const isInstalled = await isModelInstalled(modelName)
    console.log(`Model "${modelName}" is ${isInstalled ? 'installed' : 'not installed'}`)
    process.exit(isInstalled ? 0 : 1)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

// Allow direct CLI execution
if (require.main === module) {
  const modelName = process.argv[2]
  if (!modelName) {
    console.error('Usage: node model-verification.js <model-name>')
    process.exit(1)
  }
  checkModelCLI(modelName)
} 