// /ollama-ui/src/app/blobs/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

export default function BlobsPage() {
  const [blobs, setBlobs] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [digest, setDigest] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const fetchBlobs = async () => {
    try {
      const response = await fetch('/api/blobs')
      if (!response.ok) throw new Error('Failed to fetch blobs')
      const data = await response.json()
      setBlobs(data)
    } catch {
      toast.error('Failed to fetch blobs')
    } finally {
      setIsLoading(false)
    }
  }

  const uploadBlob = async () => {
    if (!file || !digest) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('digest', digest)

      const response = await fetch('/api/blobs/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to upload blob')
      toast.success('Blob uploaded successfully')
      fetchBlobs()
    } catch {
      toast.error('Failed to upload blob')
    }
  }

  const deleteBlob = async (digest: string) => {
    try {
      const response = await fetch('/api/blobs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ digest })
      })

      if (!response.ok) throw new Error('Failed to delete blob')
      toast.success('Blob deleted successfully')
      fetchBlobs()
    } catch {
      toast.error('Failed to delete blob')
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Blobs</h1>
        <Link href="/chat">
          <Button variant="outline">Go to Chat</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Blob</CardTitle>
          <CardDescription>Upload a new blob with its SHA256 digest</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="SHA256 Digest"
                value={digest}
                onChange={(e) => setDigest(e.target.value)}
              />
              <Button 
                onClick={uploadBlob}
                disabled={!file || !digest}
              >
                Upload
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {blobs.length === 0 && !isLoading && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Blobs Found</AlertTitle>
          <AlertDescription>
            Upload a blob using the form above.
          </AlertDescription>
        </Alert>
      )}

      {blobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Installed Blobs</CardTitle>
            <CardDescription>Your currently installed blobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {blobs.map((blob) => (
                <div key={blob} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <code className="text-sm bg-gray-100 p-1 rounded">
                      {blob}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => deleteBlob(blob)}
                    >
                      <AlertCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 