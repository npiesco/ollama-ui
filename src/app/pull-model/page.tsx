// src/app/pull-model/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { config } from '@/lib/config'

interface PullStatus {
  status: string
  digest?: string
  total?: number
  completed?: number
}

export default function PullModel() {
  const [modelName, setModelName] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<PullStatus | null>(null)

  const handlePull = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch(`${config.OLLAMA_API_HOST}/api/pull`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelName }),
      })

      if (!response.ok) throw new Error("Failed to initiate model pull")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("Failed to read response stream")

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Convert the received chunk to text and parse as JSON
        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())
        
        for (const line of lines) {
          try {
            const status: PullStatus = JSON.parse(line)
            setStatus(status)
            
            if (status.status === "success") {
              toast.success("Model pulled successfully")
              setStatus(null)
              break
            }
          } catch (e) {
            console.error("Failed to parse status:", e)
          }
        }
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Failed to pull model"
      toast.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressPercentage = () => {
    if (!status?.total || !status?.completed) return 0
    return Math.round((status.completed / status.total) * 100)
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Pull Model</h1>
      
      <form onSubmit={handlePull} className="space-y-4">
        <Input
          placeholder="Enter model name (e.g., llama2:latest)"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Pulling..." : "Pull Model"}
        </Button>
      </form>

      {status && (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="font-semibold">Status: {status.status}</p>
            {status.digest && <p className="text-sm text-gray-600">Digest: {status.digest}</p>}
            {status.total && status.completed && (
              <div className="mt-2">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {getProgressPercentage()}% - 
                  {(status.completed / 1024 / 1024).toFixed(2)}MB / 
                  {(status.total / 1024 / 1024).toFixed(2)}MB
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 