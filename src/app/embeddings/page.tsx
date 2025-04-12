// src/app/embeddings/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { config } from '@/lib/config'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Binary } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Embeddings() {
  const router = useRouter()
  const [input, setInput] = useState("")
  const [embeddings, setEmbeddings] = useState<number[][]>([])
  const [loading, setLoading] = useState(false)
  const [isModelInstalled, setIsModelInstalled] = useState(false)
  const [checkingModel, setCheckingModel] = useState(true)

  useEffect(() => {
    checkModelInstallation()

    // Check model installation when page gains focus
    const handleFocus = () => {
      checkModelInstallation()
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const checkModelInstallation = async () => {
    try {
      const response = await fetch(`${config.OLLAMA_API_HOST}/api/tags`)
      if (!response.ok) throw new Error('Failed to fetch installed models')
      const data = await response.json()
      setIsModelInstalled((data.models || []).some((model: { name: string }) => {
        const modelName = model.name.toLowerCase();
        return modelName === 'nomic-embed-text' || modelName.startsWith('nomic-embed-text:');
      }))
    } catch (error) {
      console.error('Error checking model:', error)
      toast.error('Failed to check model installation')
    } finally {
      setCheckingModel(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(`${config.OLLAMA_API_HOST}/api/embed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "nomic-embed-text",
          input: input,
        }),
      })
      if (!response.ok) {
        const error = await response.json()
        if (error.error?.includes('not found')) {
          setIsModelInstalled(false)
          throw new Error('Model not installed')
        }
        throw new Error("Failed to generate embeddings")
      }
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

  const navigateToModel = () => {
    // Store the model name in sessionStorage to help the models page focus on it
    sessionStorage.setItem('focusModel', 'nomic-embed-text')
    router.push('/models')
  }

  if (checkingModel) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              Checking model availability...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isModelInstalled) {
    return (
      <div className="container mx-auto p-8 space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Model Required</AlertTitle>
          <AlertDescription>
            The nomic-embed-text model is required for generating embeddings.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Binary className="h-12 w-12 text-primary" />
              <div className="text-center">
                <h2 className="text-lg font-semibold">Install Required Model</h2>
                <p className="text-muted-foreground mt-2">
                  To generate embeddings, you&apos;ll need to install the nomic-embed-text model first.
                </p>
              </div>
              <Button onClick={navigateToModel}>
                Install nomic-embed-text Model
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Generate Embeddings</h1>
        <Link href="/models">
          <Button variant="outline">Go to Models</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Text to Embeddings</CardTitle>
          <CardDescription>
            Convert text into vector embeddings using the nomic-embed-text model.
            These embeddings can be used for semantic search, text similarity, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Enter text to generate embeddings... (Press Enter to generate, Shift+Enter for new line)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[100px] font-mono"
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              {loading ? "Generating..." : "Generate Embeddings"}
            </Button>
          </form>
          
          {embeddings.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Generated Embeddings:</h2>
              <div className="bg-muted/50 p-4 rounded-lg overflow-auto max-h-[400px]">
                <pre className="text-sm font-mono">{JSON.stringify(embeddings, null, 2)}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 