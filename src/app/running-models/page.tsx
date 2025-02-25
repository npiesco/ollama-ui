"use client"

import { useEffect, useState } from "react"
import { toast } from "@/components/ui/use-toast"

interface RunningModel {
  model: string
  created_at: string
  total_duration: number
  prompt_eval_duration: number
}

export default function RunningModels() {
  const [models, setModels] = useState<RunningModel[]>([])

  useEffect(() => {
    const fetchRunningModels = async () => {
      try {
        const response = await fetch("http://localhost:11434/api/ps")
        if (!response.ok) throw new Error("Failed to fetch running models")
        const data = await response.json()
        setModels(data.models)
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch running models", variant: "destructive" })
      }
    }

    fetchRunningModels()
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Running Models</h2>
      {models.map((model, index) => (
        <div key={index} className="border p-4 rounded-md">
          <p>
            <strong>Model:</strong> {model.model}
          </p>
          <p>
            <strong>Created at:</strong> {new Date(model.created_at).toLocaleString()}
          </p>
          <p>
            <strong>Total duration:</strong> {model.total_duration}ms
          </p>
          <p>
            <strong>Prompt eval duration:</strong> {model.prompt_eval_duration}ms
          </p>
        </div>
      ))}
    </div>
  )
}

