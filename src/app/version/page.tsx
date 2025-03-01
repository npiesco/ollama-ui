// /ollama-ui/src/app/version/page.tsx
"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { config } from '@/lib/config'

interface VersionInfo {
  version: string
  build: string
}

export default function Version() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)

  useEffect(() => {
    const fetchVersionInfo = async () => {
      try {
        const response = await fetch(`${config.OLLAMA_API_HOST}/api/version`)
        if (!response.ok) throw new Error("Failed to fetch version information")
        const data = await response.json()
        setVersionInfo(data)
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : "Failed to fetch version information"
        toast.error(error)
      }
    }

    fetchVersionInfo()
  }, [])

  if (!versionInfo) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Version Information</h2>
      <p>
        <strong>Version:</strong> {versionInfo.version}
      </p>
      <p>
        <strong>Build:</strong> {versionInfo.build}
      </p>
    </div>
  )
}

