// /ollama-ui/src/app/models/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ModelResponse } from '@/types/ollama'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { InfoIcon, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react'
import Link from 'next/link'

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
  const [isLoading, setIsLoading] = useState(true)
  const [isPulling, setPulling] = useState(false)
  const [modelToPull, setModelToPull] = useState("")
  const [currentStatus, setCurrentStatus] = useState("")

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models')
      if (!response.ok) throw new Error('Failed to fetch models')
      const data = await response.json()
      setModels(data)
    } catch (error) {
      toast.error('Failed to fetch models')
    } finally {
      setIsLoading(false)
    }
  }

  const pullModel = async (modelName: string) => {
    if (!modelName) return
    
    setPulling(true)
    setModelToPull(modelName)
    try {
      const response = await fetch('/api/models/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName })
      })

      if (!response.ok) throw new Error('Failed to pull model')

      // Stream the pull progress
      const reader = response.body?.getReader()
      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\\n")
        lines.forEach(line => {
          if (line.trim()) {
            try {
              const data = JSON.parse(line)
              if (data.status) {
                setCurrentStatus(data.status)
                if (data.status.includes('downloading')) {
                  const match = data.status.match(/(\d+)%/)
                  if (match) {
                    toast.info(`Downloading ${modelName}: ${match[1]}%`)
                  }
                }
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        })
      }

      toast.success(`Successfully pulled ${modelName}`)
      fetchModels()
    } catch (error) {
      toast.error(`Failed to pull ${modelName}`)
    } finally {
      setPulling(false)
      setModelToPull("")
      setCurrentStatus("")
    }
  }

  const isModelInstalled = (modelName: string) => {
    return models.some(m => m.name === modelName)
  }

  const deleteModel = async (modelName: string) => {
    try {
      const response = await fetch('/api/models/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName })
      })

      if (!response.ok) throw new Error('Failed to delete model')
      toast.success(`Successfully deleted ${modelName}`)
      fetchModels()
    } catch (error) {
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
            To get started, you'll need to install at least one model. We recommend starting with Llama 2 or Mistral.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {RECOMMENDED_MODELS.map((model) => (
          <Card key={model.name} className={model.recommended ? 'border-primary' : ''}>
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
              <div className="flex items-center gap-2">
                {isModelInstalled(model.name) ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Installed</span>
                  </div>
                ) : (
                  <Button
                    onClick={() => pullModel(model.name)}
                    disabled={isPulling}
                    variant="outline"
                  >
                    {modelToPull === model.name ? 'Pulling...' : 'Install Model'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Advanced</CardTitle>
          <CardDescription>Install a specific model or version</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Model name (e.g., llama2:latest)"
              value={modelToPull}
              onChange={(e) => setModelToPull(e.target.value)}
            />
            <Button 
              onClick={() => pullModel(modelToPull)}
              disabled={isPulling || !modelToPull}
            >
              {isPulling ? "Pulling..." : "Install"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {currentStatus && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>{currentStatus}</AlertDescription>
        </Alert>
      )}

      {models.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Installed Models</CardTitle>
            <CardDescription>Your currently installed models</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {models.map((model) => (
                <div key={model.name} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium flex items-center gap-2">
                      {model.name}
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => deleteModel(model.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500 mt-2 grid grid-cols-2 gap-2">
                    <p>Format: {model.details.format}</p>
                    <p>Family: {model.details.family}</p>
                    <p>Size: {model.details.parameter_size}</p>
                    <p>Quantization: {model.details.quantization_level}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 