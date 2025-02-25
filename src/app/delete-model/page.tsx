// src/app/delete-model/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Model {
  name: string
  modified_at: string
  size: number
  digest: string
}

export default function DeleteModel() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(false)

  const fetchModels = async () => {
    try {
      const response = await fetch("http://localhost:11434/api/tags")
      if (!response.ok) throw new Error("Failed to fetch models")
      const data = await response.json()
      setModels(data.models)
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Failed to fetch models"
      toast.error(error)
    }
  }

  useEffect(() => {
    fetchModels()
  }, [])

  const handleDelete = async (modelName: string) => {
    if (!confirm(`Are you sure you want to delete ${modelName}?`)) return

    setLoading(true)
    try {
      const response = await fetch("http://localhost:11434/api/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelName }),
      })
      
      if (!response.ok) throw new Error("Failed to delete model")
      
      toast.success(`Model ${modelName} deleted successfully`)
      fetchModels() // Refresh the list
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Failed to delete model"
      toast.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Delete Models</h1>
      
      <div className="grid gap-4">
        {models.length === 0 ? (
          <p className="text-gray-500">No models found</p>
        ) : (
          models.map((model) => (
            <div 
              key={model.digest}
              className="bg-gray-100 p-4 rounded-lg flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold">{model.name}</h3>
                <p className="text-sm text-gray-600">
                  Modified: {new Date(model.modified_at).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Size: {(model.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button 
                variant="destructive"
                disabled={loading}
                onClick={() => handleDelete(model.name)}
              >
                Delete
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 