// src/app/list-models/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { config } from '@/lib/config'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

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
      const response = await fetch(`${config.OLLAMA_API_HOST}/api/tags`)
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
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Available Models</CardTitle>
          <Button 
            onClick={fetchModels} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Refresh'
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading models...
            </div>
          ) : models.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              No models found
            </div>
          ) : (
            <div className="grid gap-4">
              {models.map((model) => (
                <Card key={model.digest} className="card-hover">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-semibold">{model.name}</h2>
                      <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                        {formatSize(model.size)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                      <div>
                        <p className="text-muted-foreground">
                          Modified: {new Date(model.modified_at).toLocaleString()}
                        </p>
                        <p className="text-muted-foreground">
                          Digest: {model.digest.substring(0, 12)}...
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <p>
                          <span className="font-medium">Format:</span>{" "}
                          <span className="text-muted-foreground">{model.details.format}</span>
                        </p>
                        <p>
                          <span className="font-medium">Family:</span>{" "}
                          <span className="text-muted-foreground">{model.details.family}</span>
                        </p>
                        <p>
                          <span className="font-medium">Parameters:</span>{" "}
                          <span className="text-muted-foreground">{model.details.parameter_size}</span>
                        </p>
                        <p>
                          <span className="font-medium">Quantization:</span>{" "}
                          <span className="text-muted-foreground">{model.details.quantization_level}</span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 