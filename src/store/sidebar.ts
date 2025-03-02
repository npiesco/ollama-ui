// ollama-ui/src/store/sidebar.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  isManagementOpen: boolean
  setManagementOpen: (open: boolean) => void
  isSettingsOpen: boolean
  setSettingsOpen: (open: boolean) => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isManagementOpen: true, // default state
      setManagementOpen: (open) => set({ isManagementOpen: open }),
      isSettingsOpen: true, // default state
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),
    }),
    {
      name: 'sidebar-storage', // unique name for localStorage
    }
  )
) 