// /ollama-ui/src/app/models/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ModelResponse } from '@/types/ollama'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Trash2, Code2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from "@/lib/utils"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface RecommendedModel {
  name: string
  description: string
  recommended: boolean
  parameterSizes: Array<{
    size: string
    isTools?: boolean
    isVision?: boolean
  }>
  usage?: string
  apiExamples?: {
    rest?: string
    python?: string
    javascript?: string
  }
}

const RECOMMENDED_MODELS: RecommendedModel[] = [
  {
    name: 'deepseek-r1',
    description: "DeepSeek's first-generation of reasoning models with comparable performance to OpenAI-o1, including six dense models distilled from DeepSeek-R1 based on Llama and Qwen.",
    recommended: true,
    parameterSizes: [
      { size: '1.5b' },
      { size: '7b' },
      { size: '8b' },
      { size: '14b' },
      { size: '32b' },
      { size: '70b' },
      { size: '671b' }
    ]
  },
  {
    name: 'phi4-mini',
    description: 'Phi-4-mini brings significant enhancements in multilingual support, reasoning, and mathematics, and now, the long-awaited function calling feature is finally supported. The model supports 128K token context length and is optimized for memory/compute constrained environments and latency bound scenarios.',
    recommended: true,
    parameterSizes: [
      { size: '3.8b', isTools: true }
    ]
  },
  {
    name: 'llama3.2',
    description: "Meta's Llama 3.2 goes small with 1B and 3B models.",
    recommended: true,
    parameterSizes: [
      { size: '1b' },
      { size: '3b' }
    ]
  },
  {
    name: 'llama3.1',
    description: 'Llama 3.1 is a new state-of-the-art model from Meta available in 8B, 70B and 405B parameter sizes.',
    recommended: true,
    parameterSizes: [
      { size: '8b' },
      { size: '70b' },
      { size: '405b' }
    ]
  },
  {
    name: 'nomic-embed-text',
    description: 'A high-performing open embedding model with a large token context window.',
    recommended: false,
    parameterSizes: [{ size: 'default' }],
    usage: 'This model is an embedding model, meaning it can only be used to generate embeddings.',
    apiExamples: {
      rest: 'curl http://localhost:11434/api/embeddings -d \'{\n  "model": "nomic-embed-text",\n  "prompt": "The sky is blue because of Rayleigh scattering"\n}\'',
      python: 'ollama.embeddings(model=\'nomic-embed-text\', prompt=\'The sky is blue because of rayleigh scattering\')',
      javascript: 'ollama.embeddings({ model: \'nomic-embed-text\', prompt: \'The sky is blue because of rayleigh scattering\' })'
    }
  },
  {
    name: 'mistral',
    description: 'The 7B model released by Mistral AI, updated to version 0.3.',
    recommended: true,
    parameterSizes: [{ size: '7b' }]
  },
  {
    name: 'qwen2.5',
    description: 'Qwen2.5 models are pretrained on Alibaba\'s latest large-scale dataset, encompassing up to 18 trillion tokens. The model supports up to 128K tokens and has multilingual support.',
    recommended: true,
    parameterSizes: [
      { size: '0.5b', isTools: true },
      { size: '1.5b', isTools: true },
      { size: '3b', isTools: true },
      { size: '7b', isTools: true },
      { size: '14b', isTools: true },
      { size: '32b', isTools: true },
      { size: '72b', isTools: true }
    ]
  },
  {
    name: 'gemma',
    description: 'Gemma is a family of lightweight, state-of-the-art open models built by Google DeepMind. Updated to version 1.1',
    recommended: true,
    parameterSizes: [{ size: '2b' }]
  },
  {
    name: 'qwen2.5-coder',
    description: 'The latest series of Code-Specific Qwen models, with significant improvements in code generation, code reasoning, and code fixing.',
    recommended: true,
    parameterSizes: [
      { size: '0.5b', isTools: true },
      { size: '1.5b', isTools: true },
      { size: '3b', isTools: true },
      { size: '7b', isTools: true },
      { size: '14b', isTools: true }
    ]
  },
  {
    name: 'llava',
    description: 'LLaVA is a novel end-to-end trained large multimodal model that combines a vision encoder and Vicuna for general-purpose visual and language understanding. Updated to version 1.6.',
    recommended: false,
    parameterSizes: [
      { size: '7b', isVision: true },
      { size: '13b', isVision: true },
      { size: '34b', isVision: true }
    ]
  },
  {
    name: 'codellama',
    description: 'A large language model that can use text prompts to generate and discuss code.',
    recommended: false,
    parameterSizes: [
      { size: '7b' },
      { size: '13b' },
      { size: '34b' },
      { size: '70b' }
    ]
  },
  {
    name: 'deepseek-coder',
    description: 'DeepSeek Coder is a capable coding model trained on two trillion code and natural language tokens.',
    recommended: true,
    parameterSizes: [
      { size: '1.3b' },
      { size: '6.7b' },
      { size: '33b' }
    ]
  }
]

export default function ModelsPage() {
  const [models, setModels] = useState<ModelResponse[]>([])
  const [isPulling, setPulling] = useState(false)
  const [modelToPull, setModelToPull] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({})
  const [focusedModel, setFocusedModel] = useState<string | null>(null)

  useEffect(() => {
    fetchModels()
    // Check if we should focus on a specific model
    const modelToFocus = sessionStorage.getItem('focusModel')
    if (modelToFocus) {
      setFocusedModel(modelToFocus)
      sessionStorage.removeItem('focusModel')
    }
  }, [])

  // Scroll to focused model when the carousel is ready
  useEffect(() => {
    if (focusedModel) {
      const modelIndex = RECOMMENDED_MODELS.findIndex(model => model.name === focusedModel)
      if (modelIndex !== -1) {
        // Find the carousel item
        const carouselItem = document.querySelector(`[data-model="${focusedModel}"]`) as HTMLElement
        if (carouselItem) {
          // Calculate the center position
          const container = carouselItem.closest('.carousel-content') as HTMLElement
          if (container) {
            const containerWidth = container.clientWidth
            const itemWidth = carouselItem.clientWidth
            const scrollLeft = carouselItem.offsetLeft - (containerWidth / 2) + (itemWidth / 2)
            container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
          }
          // Highlight the card temporarily
          carouselItem.classList.add('ring-2', 'ring-primary', 'ring-offset-2')
          setTimeout(() => {
            carouselItem.classList.remove('ring-2', 'ring-primary', 'ring-offset-2')
          }, 3000)
        }
      }
    }
  }, [focusedModel, isLoading])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models')
      if (!response.ok) throw new Error('Failed to fetch models')
      const data = await response.json()
      console.log('Fetched models:', data)
      setModels(data.models || [])
    } catch (error) {
      console.error('Error fetching models:', error)
      toast.error('Failed to fetch models')
      setModels([])
    } finally {
      setIsLoading(false)
    }
  }

  const pullModel = async (modelName: string, parameterSize: string) => {
    // For models with 'default' size, don't append the size
    const fullModelName = parameterSize === 'default' ? modelName : `${modelName}:${parameterSize}`
    if (!modelName || isModelInstalled(fullModelName)) return
    
    setPulling(true)
    setModelToPull(fullModelName)
    toast.info(`Starting download of ${fullModelName}...`)

    try {
      const response = await fetch('/api/models/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullModelName })
      })

      if (!response.ok) throw new Error('Failed to pull model')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('Failed to read response stream')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Convert the received chunk to text and parse as JSON
        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())
        
        for (const line of lines) {
          try {
            const status = JSON.parse(line)
            if (status.status === "success") {
              toast.success(`Successfully downloaded ${fullModelName}`)
              await fetchModels() // Refresh the models list
              break
            }
          } catch (e) {
            console.error("Failed to parse status:", e)
          }
        }
      }
    } catch (error) {
      console.error('Error pulling model:', error)
      toast.error(`Failed to pull ${fullModelName}`)
    } finally {
      setPulling(false)
      setModelToPull("")
    }
  }

  const isModelInstalled = (modelName: string) => {
    if (!models || models.length === 0) return false
    
    const normalizedName = modelName.toLowerCase()
    const isInstalled = models.some(model => {
      const installedName = (model.name || '').toLowerCase()
      return installedName === normalizedName
    })
    
    return isInstalled
  }

  const deleteModel = async (modelName: string) => {
    if (!modelName || !isModelInstalled(modelName)) return

    try {
      const response = await fetch('/api/models/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName })
      })

      if (!response.ok) throw new Error('Failed to delete model')
      toast.success(`Successfully deleted ${modelName}`)
      await fetchModels() // Wait for models to refresh
    } catch (error) {
      console.error('Error deleting model:', error)
      toast.error(`Failed to delete ${modelName}`)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Models</h1>
        <Link href="/chat">
          <Button variant="outline">Go to Chat</Button>
        </Link>
      </div>

      {models.length === 0 && !isLoading && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Welcome to Ollama UI!</AlertTitle>
          <AlertDescription>
            To get started, you&apos;ll need to install at least one model. We recommend starting with Llama 2 or Mistral.
          </AlertDescription>
        </Alert>
      )}

      <div className="w-full max-w-5xl mx-auto relative">
        <Carousel
          opts={{
            align: "center",
            loop: true,
            startIndex: focusedModel ? RECOMMENDED_MODELS.findIndex(model => model.name === focusedModel) : 0
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4 carousel-content">
            {RECOMMENDED_MODELS.map((model) => (
              <CarouselItem 
                key={model.name} 
                className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3"
                data-model={model.name}
              >
                <div className="h-full">
                  <Card className={cn(
                    'h-full flex flex-col',
                    model.recommended ? 'border-primary' : '',
                    isModelInstalled(`${model.name}:${selectedSizes[model.name] || model.parameterSizes[0].size}`) ? 'bg-primary/5' : ''
                  )}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {model.name}
                        {model.recommended && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            Recommended
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>{model.description}</CardDescription>
                      {model.usage && (
                        <CardDescription className="mt-2 text-yellow-600">
                          {model.usage}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow flex flex-col justify-end">
                      {model.parameterSizes.length > 1 && (
                        <Select
                          value={selectedSizes[model.name] || model.parameterSizes[0].size}
                          onValueChange={(value) => setSelectedSizes(prev => ({ ...prev, [model.name]: value }))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {model.parameterSizes.map((param) => (
                              <SelectItem key={param.size} value={param.size}>
                                {param.size}
                                {param.isTools && " (+ tools)"}
                                {param.isVision && " (+ vision)"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                          {isModelInstalled(`${model.name}:${selectedSizes[model.name] || model.parameterSizes[0].size}`) ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Installed</span>
                            </div>
                          ) : (
                            <Button
                              onClick={() => pullModel(model.name, selectedSizes[model.name] || model.parameterSizes[0].size)}
                              disabled={isPulling}
                              variant="outline"
                            >
                              {modelToPull === `${model.name}:${selectedSizes[model.name] || model.parameterSizes[0].size}` ? 'Pulling...' : 'Install Model'}
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {model.apiExamples && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <Code2 className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[400px] space-y-2">
                                <p className="font-medium text-sm">API Examples:</p>
                                {model.apiExamples.rest && (
                                  <div>
                                    <p className="text-xs font-medium mb-1">REST API</p>
                                    <pre className="text-xs bg-secondary/50 p-2 rounded overflow-x-auto">
                                      {model.apiExamples.rest}
                                    </pre>
                                  </div>
                                )}
                                {model.apiExamples.python && (
                                  <div>
                                    <p className="text-xs font-medium mb-1">Python</p>
                                    <pre className="text-xs bg-secondary/50 p-2 rounded overflow-x-auto">
                                      {model.apiExamples.python}
                                    </pre>
                                  </div>
                                )}
                                {model.apiExamples.javascript && (
                                  <div>
                                    <p className="text-xs font-medium mb-1">JavaScript</p>
                                    <pre className="text-xs bg-secondary/50 p-2 rounded overflow-x-auto">
                                      {model.apiExamples.javascript}
                                    </pre>
                                  </div>
                                )}
                              </PopoverContent>
                            </Popover>
                          )}
                          {isModelInstalled(`${model.name}:${selectedSizes[model.name] || model.parameterSizes[0].size}`) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteModel(`${model.name}:${selectedSizes[model.name] || model.parameterSizes[0].size}`)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute -left-12 hover:bg-secondary/80 active:bg-secondary/90 transition-colors" />
          <CarouselNext className="absolute -right-12 hover:bg-secondary/80 active:bg-secondary/90 transition-colors" />
        </Carousel>
      </div>

      {focusedModel === 'nomic-embed-text' && !isModelInstalled('nomic-embed-text') && (
        <Alert className="max-w-5xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Install Required Model</AlertTitle>
          <AlertDescription>
            The nomic-embed-text model is required for generating embeddings. Please install it to use the embeddings feature.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
} 