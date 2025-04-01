// /ollama-ui/src/app/models/page.tsx
"use client"

import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Trash2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { ModelResponse } from '@/types/ollama'
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import Link from 'next/link'
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface LibraryModel {
  name: string
  description: string
  parameterSizes: string[]
  capabilities: string[]
  pullCount: string
  tagCount: string
  lastUpdated: string
}

const ModelsPage: React.FC = (): React.ReactElement => {
  const [models, setModels] = React.useState<ModelResponse[]>([])
  const [libraryModels, setLibraryModels] = React.useState<LibraryModel[]>([])
  const [isPulling, setPulling] = React.useState(false)
  const [modelToPull, setModelToPull] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedSizes, setSelectedSizes] = React.useState<Record<string, string>>({})
  const [focusedModel, setFocusedModel] = React.useState<string | null>(null)
  const [selectedTab, setSelectedTab] = React.useState("all")
  const [showAdvanced, setShowAdvanced] = React.useState<Record<string, boolean>>({})
  const [modelConfig, setModelConfig] = React.useState<Record<string, string>>({})
  const [error, setError] = React.useState<string | null>(null)
  const [newModelName, setNewModelName] = React.useState("")

  const fetchModels = React.useCallback(async () => {
    try {
      const response = await fetch("/api/models")
      if (!response.ok) {
        throw new Error("Failed to fetch models")
      }
      const data = await response.json()
      setModels(data.models)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch models")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchLibraryModels = async () => {
    try {
      const response = await fetch('/api/models/library')
      if (!response.ok) throw new Error('Failed to fetch library models')
      const data = await response.json()
      console.log('Library models capabilities:', data.models?.map((m: LibraryModel) => ({ name: m.name, capabilities: m.capabilities })))
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

  useEffect(() => {
    fetchModels()
    fetchLibraryModels()
    // Check if we should focus on a specific model
    const modelToFocus = sessionStorage.getItem('focusModel')
    if (modelToFocus) {
      setFocusedModel(modelToFocus)
      sessionStorage.removeItem('focusModel')
    }
  }, [fetchModels])

  const pullModel = async (modelName: string, parameterSize: string, config: string) => {
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
        body: JSON.stringify({ name: fullModelName, config: config })
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

  // Group models by capability
  const modelsByCapability = {
    all: libraryModels,
    chat: libraryModels.filter(m => m.capabilities.includes('chat') || m.capabilities.includes('tools')),
    code: libraryModels.filter(m => m.capabilities.includes('tools')),
    vision: libraryModels.filter(m => m.capabilities.includes('vision')),
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-md mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return <div>Error: {error}</div>
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

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="vision">Vision</TabsTrigger>
        </TabsList>

        {Object.entries(modelsByCapability).map(([category, models]) => (
          <TabsContent key={category} value={category} className="mt-6">
            <ScrollArea className="w-full max-w-5xl mx-auto h-[calc(100vh-300px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {models.map((model) => (
                  <Card key={model.name} className={cn(
                    'h-full flex flex-col',
                    isModelInstalled(`${model.name}:${selectedSizes[model.name] || model.parameterSizes[0]}`) ? 'bg-primary/5' : ''
                  )}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {model.name}
                        {model.capabilities.map(cap => (
                          <span key={cap} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {cap}
                          </span>
                        ))}
                      </CardTitle>
                      <CardDescription>{model.description}</CardDescription>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>👥 {model.pullCount}</span>
                        <span>🏷️ {model.tagCount}</span>
                        <span>🕒 {model.lastUpdated}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 flex-grow">
                      <div className="flex items-center justify-between">
                        <Label>Advanced Configuration</Label>
                        <Switch
                          checked={showAdvanced[model.name] || false}
                          onCheckedChange={(checked) => {
                            setShowAdvanced(prev => ({ ...prev, [model.name]: checked }))
                          }}
                        />
                      </div>

                      {showAdvanced[model.name] && (
                        <>
                          <Separator className="my-4" />
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Model Parameters</Label>
                              <Textarea
                                placeholder="Enter model parameters in JSON format..."
                                value={modelConfig[model.name] || ''}
                                onChange={(e) => setModelConfig(prev => ({
                                  ...prev,
                                  [model.name]: e.target.value
                                }))}
                                className="h-24"
                              />
                            </div>
                          </div>
                        </>
                      )}

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
                    </CardContent>

                    <CardFooter className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        {isModelInstalled(`${model.name}:${selectedSizes[model.name] || model.parameterSizes[0]}`) ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Installed</span>
                          </div>
                        ) : (
                          <Button
                            onClick={() => pullModel(
                              model.name,
                              selectedSizes[model.name] || model.parameterSizes[0],
                              modelConfig[model.name]
                            )}
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
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>

      {focusedModel === 'nomic-embed-text' && !isModelInstalled('nomic-embed-text') && (
        <Alert className="max-w-5xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Install Required Model</AlertTitle>
          <AlertDescription>
            The nomic-embed-text model is required for generating embeddings. Please install it to use the embeddings feature.
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={async () => {
          if (!newModelName.trim()) {
            toast.error("Please enter a model name")
            return
          }

          try {
            const response = await fetch("/api/pull-model", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name: newModelName.trim() }),
            })

            if (!response.ok) {
              throw new Error("Failed to pull model")
            }

            toast.success("Model pulled successfully")
            setNewModelName("")
            fetchModels()
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to pull model")
          }
        }}
      >
        Pull Model
      </Button>
      <Button
        onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
          const name = e.currentTarget.getAttribute('data-model-name')
          if (!name) return

          try {
            const response = await fetch("/api/delete-model", {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name }),
            })

            if (!response.ok) {
              throw new Error("Failed to delete model")
            }

            toast.success("Model deleted successfully")
            fetchModels()
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete model")
          }
        }}
        data-model-name={newModelName}
      >
        Delete Model
      </Button>
    </div>
  )
}

export default ModelsPage 