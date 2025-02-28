// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Toaster } from "sonner";
import { ServerControl } from "@/components/ServerControl";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ollama UI",
  description: "A modern UI for Ollama",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <Tabs defaultValue="chat" className="w-[400px]">
              <TabsList>
                <Link href="/chat">
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                </Link>
                <Link href="/blobs">
                  <TabsTrigger value="blobs">Blobs</TabsTrigger>
                </Link>
                <Link href="/models">
                  <TabsTrigger value="models">Models</TabsTrigger>
                </Link>
              </TabsList>
            </Tabs>
            <ServerControl />
          </div>
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
