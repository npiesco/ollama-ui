// /ollama-ui/src/components/ServerControl.tsx
"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Play } from 'lucide-react'
import { api } from '@/lib/api'

export function ServerControl() {
  const [isRunning, setIsRunning] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkServerStatus()
  }, [])

  const checkServerStatus = async () => {
    try {
      const isRunning = await api.checkServer()
      setIsRunning(isRunning)
    } catch {
      setIsRunning(false)
    } finally {
      setIsLoading(false)
    }
  }

  const startServer = async () => {
    try {
      const response = await fetch('/api/server/start', { method: 'POST' })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start server')
      }
      
      toast.success(data.message || 'Ollama server started')
      setIsRunning(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start Ollama server'
      toast.error(message)
    }
  }

  if (isLoading) {
    return <Button disabled>Checking server...</Button>
  }

  if (isRunning) {
    return <Button disabled>Server Running</Button>
  }

  return (
    <Button onClick={startServer}>
      <Play className="h-4 w-4 mr-2" />
      Start Server
    </Button>
  )
} 