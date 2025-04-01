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

interface LibraryModel {
  name: string
  description: string
  parameterSizes: string[]
  capabilities: string[]
  pullCount: string
  tagCount: string
  lastUpdated: string
}

export default function ModelsPage() {
  const [models, setModels] = useState<ModelResponse[]>([])
  const [libraryModels, setLibraryModels] = useState<LibraryModel[]>([])
  const [isPulling, setPulling] = useState(false)
  const [modelToPull, setModelToPull] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({})
  const [focusedModel, setFocusedModel] = useState<string | null>(null)

  useEffect(() => {
    fetchModels()
    fetchLibraryModels()
    // Check if we should focus on a specific model
    const modelToFocus = sessionStorage.getItem('focusModel')
    if (modelToFocus) {
      setFocusedModel(modelToFocus)
      sessionStorage.removeItem('focusModel')
    }
  }, [])

  const fetchLibraryModels = async () => {
    try {
      const response = await fetch('/api/models/library')
      if (!response.ok) throw new Error('Failed to fetch library models')
      const data = await response.json()
      setLibraryModels(data.models || [])
    } catch (error) {
      console.error('Error fetching library models:', error)
      toast.error('Failed to fetch library models')
      setLibraryModels([])
    }
  }

  // Scroll to focused model when the carousel is ready
  useEffect(() => {
    if (focusedModel) {
      const modelIndex = libraryModels.findIndex(model => model.name === focusedModel)
      if (modelIndex !== -1) {
        // Find the carousel item
        const carouselItem = document.querySelector(`[data-model="${focusedModel}"]`) as HTMLElement
        if (carouselItem) {
          carouselItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          carouselItem.classList.add('ring-2', 'ring-primary', 'ring-offset-2')
          setTimeout(() => {
            carouselItem.classList.remove('ring-2', 'ring-primary', 'ring-offset-2')
          }, 3000)
        }
      }
    }
  }, [focusedModel, libraryModels])

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
            To get started, you&apos;ll need to install at least one model. Browse the available models below.
          </AlertDescription>
        </Alert>
      )}

      <div className="w-full max-w-5xl mx-auto relative">
        <Carousel
          opts={{
            align: "center",
            loop: true,
            startIndex: focusedModel ? libraryModels.findIndex(model => model.name === focusedModel) : 0
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4 carousel-content">
            {libraryModels.map((model) => (
              <CarouselItem 
                key={model.name} 
                className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3"
                data-model={model.name}
              >
                <div className="h-full">
                  <Card className={cn(
                    'h-full flex flex-col',
                    isModelInstalled(`${model.name}:${selectedSizes[model.name] || model.parameterSizes[0]}`) ? 'bg-primary/5' : ''
                  )}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {model.name}
                        {model.capabilities.includes('tools') && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            Tools
                          </span>
                        )}
                        {model.capabilities.includes('vision') && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            Vision
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>{model.description}</CardDescription>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>👥 {model.pullCount}</span>
                        <span>🏷️ {model.tagCount}</span>
                        <span>🕒 {model.lastUpdated}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow flex flex-col justify-end">
                      {model.parameterSizes.length > 0 && (
                        <Select
                          value={selectedSizes[model.name] || model.parameterSizes[0]}
                          onValueChange={(value) => setSelectedSizes(prev => ({ ...prev, [model.name]: value }))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {model.parameterSizes.map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                          {isModelInstalled(`${model.name}:${selectedSizes[model.name] || model.parameterSizes[0]}`) ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Installed</span>
                            </div>
                          ) : (
                            <Button
                              onClick={() => pullModel(model.name, selectedSizes[model.name] || model.parameterSizes[0])}
                              disabled={isPulling}
                              variant="outline"
                            >
                              {modelToPull === `${model.name}:${selectedSizes[model.name] || model.parameterSizes[0]}` ? 'Pulling...' : 'Install Model'}
                            </Button>
                          )}
                        </div>
                        {isModelInstalled(`${model.name}:${selectedSizes[model.name] || model.parameterSizes[0]}`) && (
                          <Button
                            variant="destructive"
                            onClick={() => deleteModel(`${model.name}:${selectedSizes[model.name] || model.parameterSizes[0]}`)}
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
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