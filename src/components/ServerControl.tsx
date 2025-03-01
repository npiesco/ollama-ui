// /ollama-ui/src/components/ServerControl.tsx
"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Play, Square } from 'lucide-react'

export function ServerControl() {
  const [isRunning, setIsRunning] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkServerStatus()
  }, [])

  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags')
      setIsRunning(response.ok)
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

  const stopServer = async () => {
    try {
      const response = await fetch('/api/server/stop', { method: 'POST' })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to stop server')
      }
      
      toast.success(data.message || 'Ollama server stopped')
      setIsRunning(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to stop Ollama server'
      toast.error(message)
    }
  }

  if (isLoading) {
    return <Button disabled>Checking server...</Button>
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="default"
        onClick={startServer}
        disabled={isRunning}
        className="flex items-center gap-2"
      >
        <Play className="h-4 w-4" />
        Start Server
      </Button>
      <Button
        variant="destructive"
        onClick={stopServer}
        disabled={!isRunning}
        className="flex items-center gap-2"
      >
        <Square className="h-4 w-4" />
        Stop Server
      </Button>
    </div>
  )
} 