// src/app/list-models/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ModelDetails {
  format: string
  family: string
  families: string[] | null
  parameter_size: string
  quantization_level: string
}

interface Model {
  name: string
  modified_at: string
  size: number
  digest: string
  details: ModelDetails
}

export default function ListModels() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)

  const fetchModels = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:11434/api/tags")
      if (!response.ok) throw new Error("Failed to fetch models")
      const data = await response.json()
      setModels(data.models)
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Failed to fetch models"
      toast.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModels()
  }, [])

  const formatSize = (bytes: number) => {
    const gb = bytes / 1024 / 1024 / 1024
    const mb = bytes / 1024 / 1024
    return gb >= 1 ? `${gb.toFixed(2)} GB` : `${mb.toFixed(2)} MB`
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Available Models</h1>
        <Button 
          onClick={fetchModels} 
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading models...</div>
      ) : models.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No models found
        </div>
      ) : (
        <div className="grid gap-4">
          {models.map((model) => (
            <div 
              key={model.digest}
              className="bg-gray-100 p-6 rounded-lg space-y-2"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold">{model.name}</h2>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {formatSize(model.size)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">
                    Modified: {new Date(model.modified_at).toLocaleString()}
                  </p>
                  <p className="text-gray-600">
                    Digest: {model.digest.substring(0, 12)}...
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">Format:</span> {model.details.format}
                  </p>
                  <p>
                    <span className="font-medium">Family:</span> {model.details.family}
                  </p>
                  <p>
                    <span className="font-medium">Parameters:</span> {model.details.parameter_size}
                  </p>
                  <p>
                    <span className="font-medium">Quantization:</span> {model.details.quantization_level}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 