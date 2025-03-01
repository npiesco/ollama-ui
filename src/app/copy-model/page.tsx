// /ollama-ui/src/app/copy-model/page.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { api } from "@/lib/api"

export default function CopyModel() {
  const [source, setSource] = useState("")
  const [destination, setDestination] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.copyModel({ source, destination })
      toast.success("Model copied successfully")
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Failed to copy model"
      toast.error(error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input placeholder="Source model" value={source} onChange={(e) => setSource(e.target.value)} />
      <Input placeholder="Destination model" value={destination} onChange={(e) => setDestination(e.target.value)} />
      <Button type="submit">Copy Model</Button>
    </form>
  )
}

