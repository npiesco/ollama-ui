// src/app/delete-model/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { config } from '@/lib/config'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Loader2, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Model {
  name: string
  modified_at: string
  size: number
  digest: string
}

export default function DeleteModel() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(false)
  const [deletingModel, setDeletingModel] = useState<string | null>(null)

  const fetchModels = async () => {
    try {
      const response = await fetch(`${config.OLLAMA_API_HOST}/api/tags`)
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
    setLoading(true)
    setDeletingModel(modelName)
    try {
      const response = await fetch(`${config.OLLAMA_API_HOST}/api/delete`, {
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
      setDeletingModel(null)
    }
  }

  const formatSize = (bytes: number) => {
    const gb = bytes / 1024 / 1024 / 1024
    const mb = bytes / 1024 / 1024
    return gb >= 1 ? `${gb.toFixed(2)} GB` : `${mb.toFixed(2)} MB`
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Delete Models</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {models.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No models found
              </div>
            ) : (
              models.map((model) => (
                <Card key={model.digest} className="card-hover">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold">{model.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Modified: {new Date(model.modified_at).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Size: {formatSize(model.size)}
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={loading && deletingModel === model.name}
                          >
                            {loading && deletingModel === model.name ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Model</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {model.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(model.name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 