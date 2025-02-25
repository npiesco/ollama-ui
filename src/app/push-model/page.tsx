"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

export default function PushModel() {
  const [name, setName] = useState("")
  const [insecure, setInsecure] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:11434/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, insecure }),
      })
      if (!response.ok) throw new Error("Failed to push model")
      toast({ title: "Success", description: "Model pushed successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to push model", variant: "destructive" })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input placeholder="Model name" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="insecure" checked={insecure} onChange={(e) => setInsecure(e.target.checked)} />
        <label htmlFor="insecure">Insecure</label>
      </div>
      <Button type="submit">Push Model</Button>
    </form>
  )
}

