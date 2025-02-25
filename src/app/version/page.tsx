"use client"

import { useEffect, useState } from "react"
import { toast } from "@/components/ui/use-toast"

interface VersionInfo {
  version: string
  build: string
}

export default function Version() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)

  useEffect(() => {
    const fetchVersionInfo = async () => {
      try {
        const response = await fetch("http://localhost:11434/api/version")
        if (!response.ok) throw new Error("Failed to fetch version information")
        const data = await response.json()
        setVersionInfo(data)
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch version information", variant: "destructive" })
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

