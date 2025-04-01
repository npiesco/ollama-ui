// /ollama-ui/src/app/login/page.tsx
"use client"

import { type FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      if (!response.ok) throw new Error("Login failed")
      router.push("/")
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Login failed"
      toast.error(error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button type="submit">Login</Button>
    </form>
  )
}

