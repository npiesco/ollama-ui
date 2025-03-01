// /ollama-ui/src/app/models/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ModelResponse } from '@/types/ollama'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from "@/lib/utils"

const RECOMMENDED_MODELS = [
  {
    name: 'llama2',
    description: 'A general-purpose model good for chat and text generation',
    recommended: true
  },
  {
    name: 'mistral',
    description: 'High-performance model with strong reasoning capabilities',
    recommended: true
  },
  {
    name: 'codellama',
    description: 'Specialized for code completion and programming tasks',
    recommended: false
  },
  {
    name: 'deepseek-r1',
    description: 'Reasoning-centric AI model, built for tasks requiring logical thinking, self-verification, and reflection',
    recommended: true
  },
  {
    name: 'deepseek-coder',
    description: 'A specialized language model focused on generating and completing code',
    recommended: true
  },
  {
    name: 'llava',
    description: 'Multimodal model that can understand and discuss images',
    recommended: false
  }
]

export default function ModelsPage() {
  const [models, setModels] = useState<ModelResponse[]>([])
  const [isPulling, setPulling] = useState(false)
  const [modelToPull, setModelToPull] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models')
      if (!response.ok) throw new Error('Failed to fetch models')
      const data = await response.json()
      console.log('Fetched models:', data)
      setModels(data || [])
    } catch (error) {
      console.error('Error fetching models:', error)
      toast.error('Failed to fetch models')
      setModels([])
    } finally {
      setIsLoading(false)
    }
  }

  const pullModel = async (modelName: string) => {
    if (!modelName || isModelInstalled(modelName)) return
    
    setPulling(true)
    setModelToPull(modelName)

    try {
      const response = await fetch('/api/models/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName })
      })

      if (!response.ok) throw new Error('Failed to pull model')
      toast.success(`Successfully pulled ${modelName}`)
      await fetchModels() // Wait for models to refresh
    } catch (error) {
      console.error('Error pulling model:', error)
      toast.error(`Failed to pull ${modelName}`)
    } finally {
      setPulling(false)
      setModelToPull("")
    }
  }

  const isModelInstalled = (modelName: string) => {
    if (!models || models.length === 0) return false
    
    const normalizedName = modelName.split(':')[0].toLowerCase()
    const isInstalled = models.some(model => {
      const installedName = (model.name || '').split(':')[0].toLowerCase()
      return installedName === normalizedName
    })
    
    console.log(`Checking if ${modelName} is installed:`, isInstalled, 'Current models:', models)
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

      <div className="grid md:grid-cols-2 gap-4">
        {RECOMMENDED_MODELS.map((model) => (
          <Card key={model.name} className={cn(
            model.recommended ? 'border-primary' : '',
            isModelInstalled(model.name) ? 'bg-primary/5' : ''
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
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isModelInstalled(model.name) ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Installed</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => pullModel(model.name)}
                      disabled={isPulling || isModelInstalled(model.name)}
                      variant="outline"
                    >
                      {modelToPull === model.name ? 'Pulling...' : 'Install Model'}
                    </Button>
                  )}
                </div>
                {isModelInstalled(model.name) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteModel(model.name)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 