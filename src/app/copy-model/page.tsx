"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

export default function CopyModel() {
  const [source, setSource] = useState("")
  const [destination, setDestination] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:11434/api/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, destination }),
      })
      if (!response.ok) throw new Error("Failed to copy model")
      toast({ title: "Success", description: "Model copied successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to copy model", variant: "destructive" })
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

