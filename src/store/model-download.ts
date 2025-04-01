import { create } from 'zustand'
import { toast } from 'sonner'

interface DownloadState {
  isDownloading: boolean
  currentModel: string | null
  progress: number
  status: 'idle' | 'pulling' | 'downloading' | 'success' | 'error'
  error: string | null
  startDownload: (modelName: string) => void
  updateProgress: (progress: number) => void
  setStatus: (status: DownloadState['status']) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useModelDownload = create<DownloadState>((set) => ({
  isDownloading: false,
  currentModel: null,
  progress: 0,
  status: 'idle',
  error: null,

  startDownload: (modelName: string) => {
    set({
      isDownloading: true,
      currentModel: modelName,
      progress: 0,
      status: 'pulling',
      error: null
    })
    toast.info(`Starting download of ${modelName}...`, {
      position: 'top-right',
      duration: 3000,
      dismissible: true
    })
  },

  updateProgress: (progress: number) => {
    set({ progress })
  },

  setStatus: (status: DownloadState['status']) => {
    set({ status })
    const { currentModel } = useModelDownload.getState()
    
    if (!currentModel) return

    switch (status) {
      case 'success':
        toast.success(`Successfully downloaded ${currentModel}`, {
          position: 'top-right',
          duration: 3000,
          dismissible: true
        })
        break
      case 'error':
        toast.error(`Failed to download ${currentModel}`, {
          position: 'top-right',
          duration: 3000,
          dismissible: true
        })
        break
    }
  },

  setError: (error: string | null) => {
    set({ error })
    if (error) {
      toast.error(error, {
        position: 'top-right',
        duration: 3000,
        dismissible: true
      })
    }
  },

  reset: () => {
    set({
      isDownloading: false,
      currentModel: null,
      progress: 0,
      status: 'idle',
      error: null
    })
  }
})) 