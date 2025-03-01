// src/app/embeddings/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { config } from '@/lib/config'

export default function Embeddings() {
  const [input, setInput] = useState("")
  const [embeddings, setEmbeddings] = useState<number[][]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`${config.OLLAMA_API_HOST}/api/embed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "all-minilm",
          input: input,
        }),
      })
      if (!response.ok) throw new Error("Failed to generate embeddings")
      const data = await response.json()
      setEmbeddings(data.embeddings)
      toast.success("Embeddings generated successfully")
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Failed to generate embeddings"
      toast.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Generate Embeddings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Enter text to generate embeddings..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[100px]"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Embeddings"}
        </Button>
      </form>
      
      {embeddings.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Generated Embeddings:</h2>
          <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-[400px]">
            <pre className="text-sm">{JSON.stringify(embeddings, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
} 