// src/app/model-info/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { config } from '@/lib/config'

interface ModelInfo {
  modelfile: string
  parameters: string
  template: string
  details: {
    format: string
    family: string
    families: string[]
    parameter_size: string
    quantization_level: string
  }
}

export default function ModelInfo() {
  const [modelName, setModelName] = useState("")
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`${config.OLLAMA_API_HOST}/api/show`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelName }),
      })
      if (!response.ok) throw new Error("Failed to fetch model information")
      const data = await response.json()
      setModelInfo(data)
      toast.success("Model information retrieved successfully")
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Failed to fetch model information"
      toast.error(error)
      setModelInfo(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Model Information</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Enter model name..."
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Get Model Info"}
        </Button>
      </form>

      {modelInfo && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Details</h2>
            <div className="bg-muted p-4 rounded-lg">
              <p>Format: {modelInfo.details.format}</p>
              <p>Family: {modelInfo.details.family}</p>
              <p>Parameter Size: {modelInfo.details.parameter_size}</p>
              <p>Quantization: {modelInfo.details.quantization_level}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Modelfile</h2>
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[200px] text-sm">
              {modelInfo.modelfile}
            </pre>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Template</h2>
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[200px] text-sm">
              {modelInfo.template}
            </pre>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Parameters</h2>
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[200px] text-sm">
              {modelInfo.parameters}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
} 