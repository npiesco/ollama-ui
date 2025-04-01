"use client"

import { useModelDownload } from '@/store/model-download'

export function ProgressTracker() {
  const { isDownloading, currentModel, progress } = useModelDownload()

  if (!isDownloading) return null

  return (
    <div className="fixed bottom-4 right-4 bg-background p-4 rounded-lg shadow-lg border z-50">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Downloading {currentModel}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
} 