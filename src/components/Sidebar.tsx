// ollama-ui/src/components/Sidebar.tsx
"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  MessageSquare,
  Settings,
  Plus,
  Copy,
  Upload,
  Play,
  Info,
  Binary,
  Database,
  Trash,
  Download,
  List,
  FolderInput,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const navigationItems = [
  { name: 'Chat', path: '/chat', icon: MessageSquare, description: 'Chat with AI models using text and images' },
  { name: 'Create Model', path: '/create-model', icon: Plus, description: 'Create a new custom model' },
  { name: 'Copy Model', path: '/copy-model', icon: Copy, description: 'Create a copy of an existing model' },
  { name: 'Push Model', path: '/push-model', icon: Upload, description: 'Push a model to a remote registry' },
  { name: 'Running Models', path: '/running-models', icon: Play, description: 'View and manage running model instances' },
  { name: 'Version Info', path: '/version', icon: Info, description: 'View system and model version information' },
  { name: 'Generate Embeddings', path: '/embeddings', icon: Binary, description: 'Generate vector embeddings from text' },
  { name: 'Model Information', path: '/model-info', icon: Database, description: 'View detailed model information' },
  { name: 'Delete Model', path: '/delete-model', icon: Trash, description: 'Remove models from the system' },
  { name: 'Pull Model', path: '/pull-model', icon: Download, description: 'Download models from a registry' },
  { name: 'List Models', path: '/list-models', icon: List, description: 'View all available models' },
  { name: 'Blob Management', path: '/blobs', icon: FolderInput, description: 'Manage model blob storage' },
  { name: 'Settings', path: '/settings', icon: Settings, description: 'Configure application settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleDescription = (path: string) => {
    setExpandedItems(prev => 
      prev.includes(path) 
        ? prev.filter(item => item !== path)
        : [...prev, path]
    )
  }

  return (
    <div className={cn(
      "relative pb-12 border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-[-20px] top-2 h-8 w-8 rounded-full border shadow-md bg-background"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="mb-4 flex items-center space-x-2">
            <Image
              src="/llama.png"
              alt="Ollama"
              width={24}
              height={24}
              className="rounded"
            />
            {!isCollapsed && <span className="text-lg font-semibold">Ollama UI</span>}
          </div>
          <div className="space-y-1.5">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isExpanded = expandedItems.includes(item.path)
              const isActive = pathname === item.path
              return (
                <div key={item.path} className="flex flex-col">
                  <div className="flex items-center group">
                    <Link
                      href={item.path}
                      className={cn(
                        "flex-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200",
                        isActive 
                          ? "border border-primary text-primary bg-primary/5" 
                          : "border border-transparent hover:border-primary/20 hover:bg-primary/5",
                        "relative overflow-hidden"
                      )}
                    >
                      <Icon className={cn(
                        "h-4 w-4 shrink-0 transition-colors duration-200",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                      )} />
                      {!isCollapsed && (
                        <span className={cn(
                          "transition-colors duration-200",
                          isActive ? "text-primary font-medium" : "text-muted-foreground group-hover:text-primary"
                        )}>
                          {item.name}
                        </span>
                      )}
                    </Link>
                    {!isCollapsed && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8 ml-1 transition-colors",
                          isExpanded ? "text-primary" : "text-muted-foreground hover:text-primary"
                        )}
                        onClick={() => toggleDescription(item.path)}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {!isCollapsed && isExpanded && (
                    <div className="ml-9 mr-2 mt-1.5 text-xs text-muted-foreground bg-muted/50 p-2 rounded-md transition-all duration-200 border border-muted">
                      {item.description}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
} 