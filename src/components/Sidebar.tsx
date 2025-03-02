// ollama-ui/src/components/Sidebar.tsx
"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useSidebarStore } from '@/store/sidebar'
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
  Menu,
  LucideIcon,
  Github,
  Linkedin,
  ChevronDown,
} from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

type NavigationSection = 'main' | 'management' | 'settings' | 'social'

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
    name: 'Pull Model', 
    path: '/pull-model', 
    icon: Download, 
    description: 'Download models from a registry',
    section: 'management'
  },
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
    name: 'User Settings', 
    path: '/settings', 
    icon: Settings, 
    description: 'Configure application settings',
    section: 'settings'
  },
  { 
    name: 'Version Info', 
    path: '/version', 
    icon: Info, 
    description: 'View system and model version information',
    section: 'settings'
  },
  // Social Links
  { 
    name: 'LinkedIn', 
    path: 'https://www.linkedin.com/in/nicholas-g-piesco-7aba7b106/', 
    icon: Linkedin, 
    description: 'Connect with me on LinkedIn',
    section: 'social'
  },
  { 
    name: 'GitHub', 
    path: 'https://github.com/npiesco', 
    icon: Github, 
    description: 'View my GitHub profile',
    section: 'social'
  },
] as const

const ManagementSection = ({ items, isCollapsed, pathname }: { items: NavigationItem[], isCollapsed: boolean, pathname: string }) => {
  const { isManagementOpen, setManagementOpen } = useSidebarStore()

  return (
    <Collapsible
      open={isManagementOpen}
      onOpenChange={setManagementOpen}
      className="space-y-1"
    >
      <div className="flex items-center justify-between px-3 py-2">
        {!isCollapsed && (
          <span className="text-sm font-medium text-muted-foreground">
            Model Management
          </span>
        )}
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-6 w-6 p-0",
              isCollapsed && "w-full"
            )}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                isManagementOpen && "rotate-180"
              )}
            />
            <span className="sr-only">Toggle Model Management section</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-1">
        {items.map((item) => (
          <NavigationItem key={item.path} item={item} isCollapsed={isCollapsed} pathname={pathname} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

const SettingsSection = ({ items, isCollapsed, pathname }: { items: NavigationItem[], isCollapsed: boolean, pathname: string }) => {
  const { isSettingsOpen, setSettingsOpen } = useSidebarStore()

  return (
    <Collapsible
      open={isSettingsOpen}
      onOpenChange={setSettingsOpen}
      className="space-y-1"
    >
      <div className="flex items-center justify-between px-3 py-2">
        {!isCollapsed && (
          <span className="text-sm font-medium text-muted-foreground">
            Settings & Info
          </span>
        )}
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-6 w-6 p-0",
              isCollapsed && "w-full"
            )}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                isSettingsOpen && "rotate-180"
              )}
            />
            <span className="sr-only">Toggle Settings section</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-1">
        {items.map((item) => (
          <NavigationItem key={item.path} item={item} isCollapsed={isCollapsed} pathname={pathname} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Try to get persisted state from cookie
    if (typeof window !== 'undefined') {
      const cookie = document.cookie.split(';').find(c => c.trim().startsWith('sidebar_state='))
      return cookie ? cookie.split('=')[1] === 'true' : false
    }
    return false
  })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        setIsCollapsed(prev => {
          const newState = !prev
          // Persist state in cookie
          document.cookie = `sidebar_state=${newState}; path=/; max-age=31536000`
          return newState
        })
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const handleCollapse = () => {
    setIsCollapsed(prev => {
      const newState = !prev
      // Persist state in cookie
      document.cookie = `sidebar_state=${newState}; path=/; max-age=31536000`
      return newState
    })
  }

  const mainItems = navigationItems.filter(item => item.section === 'main')
  const managementItems = navigationItems.filter(item => item.section === 'management')
  const settingsItems = navigationItems.filter(item => item.section === 'settings')
  const socialItems = navigationItems.filter(item => item.section === 'social')

  const SidebarContent = () => (
    <div className={cn(
      "h-screen pb-12 border-r transition-all duration-300 relative flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-[-20px] top-2 h-8 w-8 rounded-full border shadow-md bg-background z-50"
          onClick={handleCollapse}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle Sidebar (⌘B)</span>
        </Button>
      )}

      <div className="flex flex-col h-full">
        {/* Main Content - Scrollable */}
        <div className="flex-1 space-y-4 py-4 overflow-y-auto">
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
              <ManagementSection items={managementItems} isCollapsed={isCollapsed} pathname={pathname} />

              {/* Divider */}
              {!isCollapsed && (
                <div className="my-4 px-3">
                  <div className="h-px bg-border" />
                </div>
              )}

              {/* Settings Section */}
              <SettingsSection items={settingsItems} isCollapsed={isCollapsed} pathname={pathname} />
            </div>
          </div>
        </div>

        {/* Social Links - Fixed at Bottom */}
        <div className="p-4 border-t bg-background">
          <div className={cn(
            "grid gap-2",
            isCollapsed ? "grid-cols-1" : "grid-cols-2"
          )}>
            {socialItems.map((item) => (
              <NavigationItem key={item.path} item={item} isCollapsed={isCollapsed} pathname={pathname} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // Mobile sidebar with improved Sheet animation
  if (isMobile) {
    return (
      <>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden fixed left-4 top-4 z-40"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 transition-transform duration-300">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </>
    )
  }

  // Desktop sidebar
  return <SidebarContent />
}

// Update NavigationItem to improve hover descriptions
function NavigationItem({ item, isCollapsed, pathname }: NavigationItemProps) {
  const Icon = item.icon
  const isActive = pathname === item.path
  const isExternal = item.path.startsWith('http')

  const LinkComponent = isExternal ? 'a' : Link
  const linkProps = isExternal ? { 
    href: item.path,
    target: "_blank",
    rel: "noopener noreferrer"
  } : { 
    href: item.path 
  }

  return (
    <div className="flex flex-col">
      <div className="group relative">
        <LinkComponent
          {...linkProps}
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
                <span className="text-[10px] text-muted-foreground line-clamp-2">
                  {item.description}
                </span>
              </div>
            </>
          )}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 text-[10px]">
              {item.name}
            </div>
          )}
        </LinkComponent>
      </div>
    </div>
  )
} 