// /ollama-ui/src/app/page.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Ollama UI</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/chat">
          <Button className="w-full h-32">Chat</Button>
        </Link>
        <Link href="/create-model">
          <Button className="w-full h-32">Create Model</Button>
        </Link>
        <Link href="/copy-model">
          <Button className="w-full h-32">Copy Model</Button>
        </Link>
        <Link href="/push-model">
          <Button className="w-full h-32">Push Model</Button>
        </Link>
        <Link href="/running-models">
          <Button className="w-full h-32">Running Models</Button>
        </Link>
        <Link href="/version">
          <Button className="w-full h-32">Version Info</Button>
        </Link>
        <Link href="/embeddings">
          <Button className="w-full h-32">Generate Embeddings</Button>
        </Link>
        <Link href="/model-info">
          <Button className="w-full h-32">Model Information</Button>
        </Link>
        <Link href="/delete-model">
          <Button className="w-full h-32">Delete Model</Button>
        </Link>
        <Link href="/pull-model">
          <Button className="w-full h-32">Pull Model</Button>
        </Link>
        <Link href="/list-models">
          <Button className="w-full h-32">List Models</Button>
        </Link>
        <Link href="/blobs">
          <Button className="w-full h-32">Blob Management</Button>
        </Link>
      </div>
    </div>
  )
}
