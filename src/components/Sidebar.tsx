// ollama-ui/src/components/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
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
  type LucideIcon,
  Github,
  Linkedin,
  ChevronDown,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/store/sidebar';

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
] as const;

const ManagementSection = ({ items, isCollapsed, pathname }: { items: NavigationItem[], isCollapsed: boolean, pathname: string }) => {
  const { isManagementOpen, setManagementOpen } = useSidebarStore();

  return (
    <Collapsible
      className="space-y-0.5"
      open={isManagementOpen}
      onOpenChange={setManagementOpen}
    >
      <div className="flex items-center justify-between px-2 py-1">
        {!isCollapsed && (
          <span className="text-xs font-medium text-muted-foreground">
            Model Management
          </span>
        )}
        <CollapsibleTrigger asChild>
          <Button
            className={cn(
              'h-5 w-5 p-0',
              isCollapsed && 'w-full'
            )}
            size="sm"
            variant="ghost"
          >
            <ChevronDown
              className={cn(
                'h-3 w-3 text-muted-foreground transition-transform',
                isManagementOpen && 'rotate-180'
              )}
            />
            <span className="sr-only">Toggle Model Management section</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-0.5">
        {items.map((item) => (
          <NavigationItem isCollapsed={isCollapsed} item={item} key={item.path} pathname={pathname} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

const SettingsSection = ({ items, isCollapsed, pathname }: { items: NavigationItem[], isCollapsed: boolean, pathname: string }) => {
  const { isSettingsOpen, setSettingsOpen } = useSidebarStore();

  return (
    <Collapsible
      className="space-y-0.5"
      open={isSettingsOpen}
      onOpenChange={setSettingsOpen}
    >
      <div className="flex items-center justify-between px-2 py-1">
        {!isCollapsed && (
          <span className="text-xs font-medium text-muted-foreground">
            Settings & Info
          </span>
        )}
        <CollapsibleTrigger asChild>
          <Button
            className={cn(
              'h-5 w-5 p-0',
              isCollapsed && 'w-full'
            )}
            size="sm"
            variant="ghost"
          >
            <ChevronDown
              className={cn(
                'h-3 w-3 text-muted-foreground transition-transform',
                isSettingsOpen && 'rotate-180'
              )}
            />
            <span className="sr-only">Toggle Settings section</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-0.5">
        {items.map((item) => (
          <NavigationItem isCollapsed={isCollapsed} item={item} key={item.path} pathname={pathname} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Try to get persisted state from cookie
    if (typeof window !== 'undefined') {
      const cookie = document.cookie.split(';').find(c => c.trim().startsWith('sidebar_state='));
      return cookie ? cookie.split('=')[1] === 'true' : false;
    }
    return false;
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setIsCollapsed(prev => {
          const newState = !prev;
          // Persist state in cookie
          document.cookie = `sidebar_state=${newState}; path=/; max-age=31536000`;
          return newState;
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleCollapse = () => {
    setIsCollapsed(prev => {
      const newState = !prev;
      // Persist state in cookie
      document.cookie = `sidebar_state=${newState}; path=/; max-age=31536000`;
      return newState;
    });
  };

  const mainItems = navigationItems.filter(item => item.section === 'main');
  const managementItems = navigationItems.filter(item => item.section === 'management');
  const settingsItems = navigationItems.filter(item => item.section === 'settings');
  const socialItems = navigationItems.filter(item => item.section === 'social');

  const SidebarContent = () => (
    <div
      className={cn(
        'h-screen pb-4 border-r transition-all duration-300 relative flex flex-col',
        isCollapsed ? 'w-14' : 'w-56'
      )}
    >
      {!isMobile && (
        <Button
          className="absolute right-[-16px] top-2 h-6 w-6 rounded-full border shadow-md bg-background z-50"
          size="icon"
          variant="ghost"
          onClick={handleCollapse}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
          <span className="sr-only">Toggle Sidebar (⌘B)</span>
        </Button>
      )}

      <div className="flex flex-col h-full">
        {/* Main Content - Scrollable */}
        <div className="flex-1 space-y-2 py-2 overflow-y-auto">
          <div className="px-2 py-1">
            <div className="mb-2">
              <Link 
                className="flex items-center gap-2 group px-2 py-1.5 rounded-lg hover:bg-primary/5 transition-all duration-200 border border-muted/85 hover:border-primary/30" 
                href="/"
              >
                <Image
                  alt="Home"
                  className="rounded group-hover:scale-105 transition-transform dark:invert dark:brightness-90"
                  height={28}
                  src="/llama.svg"
                  width={28}
                />
                {!isCollapsed && (
                  <div className="flex flex-col">
                    <span className="text-base font-semibold group-hover:text-primary transition-colors">Ollama UI</span>
                    <span className="text-[10px] text-muted-foreground group-hover:text-primary/80 italic">
                      Return to Home
                    </span>
                  </div>
                )}
              </Link>
            </div>
            <div className="space-y-1">
              {/* Main Section */}
              <div className="space-y-0.5">
                {mainItems.map((item) => (
                  <NavigationItem isCollapsed={isCollapsed} item={item} key={item.path} pathname={pathname} />
                ))}
              </div>

              {/* Divider */}
              {!isCollapsed && (
                <div className="my-2 px-2">
                  <div className="h-px bg-border" />
                </div>
              )}

              {/* Management Section */}
              <ManagementSection isCollapsed={isCollapsed} items={managementItems} pathname={pathname} />

              {/* Divider */}
              {!isCollapsed && (
                <div className="my-2 px-2">
                  <div className="h-px bg-border" />
                </div>
              )}

              {/* Settings Section */}
              <SettingsSection isCollapsed={isCollapsed} items={settingsItems} pathname={pathname} />
            </div>
          </div>
        </div>

        {/* Social Links - Fixed at Bottom */}
        <div className="p-2 border-t bg-background">
          <div
            className={cn(
              'grid gap-1',
              isCollapsed ? 'grid-cols-1' : 'grid-cols-2'
            )}
          >
            {socialItems.map((item) => (
              <NavigationItem isCollapsed={isCollapsed} item={item} key={item.path} pathname={pathname} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile sidebar with improved Sheet animation
  if (isMobile) {
    return (
      <>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="md:hidden fixed left-4 top-4 z-40"
              size="icon"
              variant="ghost"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="p-0 w-64 transition-transform duration-300" side="left">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop sidebar
  return <SidebarContent />;
}

// Update NavigationItem to be more compact
function NavigationItem({ item, isCollapsed, pathname }: NavigationItemProps) {
  const Icon = item.icon;
  const isActive = pathname === item.path;
  const isExternal = item.path.startsWith('http');

  const LinkComponent = isExternal ? 'a' : Link;
  const linkProps = isExternal ? { 
    href: item.path,
    target: '_blank',
    rel: 'noopener noreferrer'
  } : { 
    href: item.path 
  };

  return (
    <div className="flex flex-col">
      <div className="group relative">
        <LinkComponent
          {...linkProps}
          className={cn(
            'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-all duration-200',
            isActive 
              ? 'border border-primary text-primary bg-primary/5' 
              : 'border border-transparent hover:border-primary/20 hover:bg-primary/5',
            'relative overflow-hidden'
          )}
        >
          <Icon
            className={cn(
              'h-3.5 w-3.5 shrink-0 transition-colors duration-200',
              isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
            )}
          />
          {!isCollapsed && (
            <>
              <span
                className={cn(
                  'transition-colors duration-200',
                  isActive ? 'text-primary font-medium' : 'text-muted-foreground group-hover:text-primary'
                )}
              >
                {item.name}
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center px-2 py-1.5 bg-muted/95">
                <span className="text-[9px] text-muted-foreground line-clamp-2">
                  {item.description}
                </span>
              </div>
            </>
          )}
          {isCollapsed && (
            <div className="absolute left-full ml-1.5 px-1.5 py-1 bg-popover text-popover-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 text-[9px]">
              {item.name}
            </div>
          )}
        </LinkComponent>
      </div>
    </div>
  );
} 