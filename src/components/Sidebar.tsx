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
  ChevronRight,
  LucideIcon
} from 'lucide-react'

type NavigationSection = 'main' | 'management'

interface NavigationItem {
  name: string
  path: string
  icon: LucideIcon
  description: string
  section: NavigationSection
}

interface NavigationItemProps {
  item: NavigationItem
  isCollapsed: boolean
  pathname: string
}

const navigationItems: NavigationItem[] = [
  // Main Section
  { 
    name: 'Chat', 
    path: '/chat', 
    icon: MessageSquare, 
    description: 'Chat with AI models using text and images',
    section: 'main'
  },
  { 
    name: 'Popular Models', 
    path: '/models', 
    icon: Database, 
    description: 'View and manage recommended AI models',
    section: 'main'
  },
  { 
    name: 'Running Models', 
    path: '/running-models', 
    icon: Play, 
    description: 'View and manage running model instances',
    section: 'main'
  },
  // Model Management Section
  { 
    name: 'Create Model', 
    path: '/create-model', 
    icon: Plus, 
    description: 'Create a new custom model',
    section: 'management'
  },
  { 
    name: 'Copy Model', 
    path: '/copy-model', 
    icon: Copy, 
    description: 'Create a copy of an existing model',
    section: 'management'
  },
  { 
    name: 'Push Model', 
    path: '/push-model', 
    icon: Upload, 
    description: 'Push a model to a remote registry',
    section: 'management'
  },
  { 
    name: 'Version Info', 
    path: '/version', 
    icon: Info, 
    description: 'View system and model version information',
    section: 'management'
  },
  { 
    name: 'Generate Embeddings', 
    path: '/embeddings', 
    icon: Binary, 
    description: 'Generate vector embeddings from text',
    section: 'management'
  },
  { 
    name: 'Model Information', 
    path: '/model-info', 
    icon: Database, 
    description: 'View detailed model information',
    section: 'management'
  },
  { 
    name: 'Delete Model', 
    path: '/delete-model', 
    icon: Trash, 
    description: 'Remove models from the system',
    section: 'management'
  },
  { 
    name: 'Pull Model', 
    path: '/pull-model', 
    icon: Download, 
    description: 'Download models from a registry',
    section: 'management'
  },
  { 
    name: 'List Models', 
    path: '/list-models', 
    icon: List, 
    description: 'View all available models',
    section: 'management'
  },
  { 
    name: 'Blob Management', 
    path: '/blobs', 
    icon: FolderInput, 
    description: 'Manage model blob storage',
    section: 'management'
  },
  { 
    name: 'Settings', 
    path: '/settings', 
    icon: Settings, 
    description: 'Configure application settings',
    section: 'management'
  },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const mainItems = navigationItems.filter(item => item.section === 'main')
  const managementItems = navigationItems.filter(item => item.section === 'management')

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
          <div className="mb-4">
            <Link 
              href="/" 
              className="flex items-center gap-3 group px-3 py-2 rounded-lg hover:bg-primary/5 transition-all duration-200 border-2 border-muted/85 hover:border-primary/30"
            >
              <Image
                src="/llama.svg"
                alt="Home"
                width={40}
                height={40}
                className="rounded group-hover:scale-105 transition-transform dark:invert dark:brightness-90"
              />
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-lg font-semibold group-hover:text-primary transition-colors">Ollama UI</span>
                  <span className="text-xs text-muted-foreground group-hover:text-primary/80 italic">
                    Return to Home
                  </span>
                </div>
              )}
            </Link>
          </div>
          <div className="space-y-1.5">
            {/* Main Section */}
            <div className="space-y-1">
              {mainItems.map((item) => (
                <NavigationItem key={item.path} item={item} isCollapsed={isCollapsed} pathname={pathname} />
              ))}
            </div>

            {/* Divider */}
            {!isCollapsed && (
              <div className="my-4 px-3">
                <div className="h-px bg-border" />
              </div>
            )}

            {/* Management Section */}
            <div className="space-y-1">
              {managementItems.map((item) => (
                <NavigationItem key={item.path} item={item} isCollapsed={isCollapsed} pathname={pathname} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Navigation Item Component
function NavigationItem({ item, isCollapsed, pathname }: NavigationItemProps) {
  const Icon = item.icon
  const isActive = pathname === item.path

  return (
    <div className="flex flex-col">
      <div className="group relative">
        <Link
          href={item.path}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200",
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
            <>
              <span className={cn(
                "transition-colors duration-200",
                isActive ? "text-primary font-medium" : "text-muted-foreground group-hover:text-primary"
              )}>
                {item.name}
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center px-3 py-2 bg-muted/95">
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              </div>
            </>
          )}
        </Link>
      </div>
    </div>
  )
} 