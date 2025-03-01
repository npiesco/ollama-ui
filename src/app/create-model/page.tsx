// /ollama-ui/src/app/create-model/page.tsx
"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { api } from "@/lib/api"

export default function CreateModel() {
  const [name, setName] = useState("")
  const [modelfile, setModelfile] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createModel({ name, modelfile })
      toast.success("Model created successfully")
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Failed to create model"
      toast.error(error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input placeholder="Model name" value={name} onChange={(e) => setName(e.target.value)} />
      <Textarea placeholder="Modelfile content" value={modelfile} onChange={(e) => setModelfile(e.target.value)} />
      <Button type="submit">Create Model</Button>
    </form>
  )
}

