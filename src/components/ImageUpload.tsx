import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface ImageUploadProps {
  onImageUpload: (file: File) => void
}

export function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      onImageUpload(file)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
      <Button onClick={handleButtonClick}>Upload Image</Button>
      {preview && (
        <div className="mt-2">
          <Image
            src={preview}
            alt="Upload preview"
            width={200}
            height={200}
            className="max-w-full h-auto"
          />
        </div>
      )}
    </div>
  )
}

