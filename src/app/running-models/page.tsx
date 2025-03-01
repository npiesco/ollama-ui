// /ollama-ui/src/app/running-models/page.tsx
"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RunningModel {
  name: string
  model: string
  size: number
  digest: string
  details: {
    parent_model: string
    format: string
    family: string
    families: string[]
    parameter_size: string
    quantization_level: string
  }
  expires_at: string
  size_vram: number
}

function formatSize(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024)
  return `${gb.toFixed(2)} GB`
}

function RunningModelsList() {
  const [models, setModels] = useState<RunningModel[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkRunningModels = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ps")
      if (!response.ok) throw new Error("Failed to fetch running models")
      const data = await response.json()
      console.log('API Response:', data)
      setModels(data.models || [])
    } catch (error) {
      console.error('Failed to check running models:', error)
      setError('Could not connect to Ollama server')
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-red-500">
            <AlertCircle className="h-8 w-8" />
            <p>{error}</p>
            <Button onClick={checkRunningModels} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={checkRunningModels} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Check Running Models
        </Button>
      </div>

      {models.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-gray-500">
              <MessageSquare className="h-8 w-8" />
              <p>No models are currently running</p>
              <p className="text-sm">Models will appear here when they are loaded</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {models.map((model, index) => (
            <Card key={`${model.model}-${index}`}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p><strong>Model:</strong> {model.name}</p>
                  <p><strong>Size:</strong> {formatSize(model.size)}</p>
                  <p><strong>Format:</strong> {model.details.format}</p>
                  <p><strong>Family:</strong> {model.details.family}</p>
                  <p><strong>Parameters:</strong> {model.details.parameter_size}</p>
                  <p><strong>Quantization:</strong> {model.details.quantization_level}</p>
                  <p><strong>Expires:</strong> {new Date(model.expires_at).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RunningModels() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-bold">Running Models</h2>
      <RunningModelsList />
    </div>
  )
}

