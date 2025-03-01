// src/app/settings/page.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"

export default function Settings() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-bold">Settings</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how Ollama UI looks and feels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Dark Mode</Label>
              <div className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
              <Moon className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 