// src/components/MultimodalInput.tsx
import { ImageIcon, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useRef, useEffect } from "react"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"

interface MultimodalInputProps {
  onImageSelect: (file: File | null, index?: number) => void
  imagePreview: string | null
  images: string[]
  maxImages?: number
}

export function MultimodalInput({ 
  onImageSelect, 
  imagePreview, 
  images,
  maxImages = 4 
}: MultimodalInputProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredImage, setHoveredImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/') && images.length < maxImages) {
        onImageSelect(file)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0 && images.length < maxImages) {
      onImageSelect(files[0])
    }
  }

  const handlePaste = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items || images.length >= maxImages) return

    const itemsArray = Array.from(items)
    for (const item of itemsArray) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) {
          onImageSelect(file)
        }
        break
      }
    }
  }

  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [images.length])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <ContextMenu>
            <ContextMenuTrigger>
              <div
                className={`relative ${isDragging ? 'bg-accent' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 px-3 flex items-center gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= maxImages}
                >
                  <ImageIcon className="h-4 w-4" />
                  <span className="text-xs">Add Image</span>
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={images.length >= maxImages}
                />
                {images.length > 0 && (
                  <div className="absolute -top-6 left-0 text-xs text-muted-foreground">
                    {images.length}/{maxImages} images
                  </div>
                )}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem 
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= maxImages}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </ContextMenuItem>
              <ContextMenuItem disabled={images.length >= maxImages}>
                <ImageIcon className="mr-2 h-4 w-4" />
                Paste Image (Ctrl+V)
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add images (max {maxImages})</p>
        </TooltipContent>
      </Tooltip>

      {images.length > 0 && (
        <div className="mt-2 flex gap-2">
          {images.map((image, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div 
                  className="relative h-16 w-16 rounded-md border bg-background"
                  onMouseEnter={() => setHoveredImage(image)}
                  onMouseLeave={() => setHoveredImage(null)}
                >
                  <Image
                    src={image}
                    alt={`Image ${index + 1}`}
                    fill
                    className="rounded-md object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -right-2 -top-2 h-5 w-5"
                    onClick={() => onImageSelect(null, index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to remove</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      )}
    </TooltipProvider>
  )
} 