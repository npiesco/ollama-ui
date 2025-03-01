// /ollama-ui/src/app/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Welcome to Ollama UI</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              A modern interface for interacting with your Ollama models
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Use the sidebar navigation to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Chat with your models</li>
              <li>Manage your model collection</li>
              <li>Monitor running models</li>
              <li>Generate embeddings</li>
              <li>And more...</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Quick Start
            </CardTitle>
            <CardDescription>
              Start chatting with your models in seconds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Click the Start Server button if the server is not running</li>
              <li>Navigate to Chat in the sidebar</li>
              <li>Select a model from the dropdown</li>
              <li>Start your conversation!</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
