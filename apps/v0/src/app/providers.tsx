"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { ClerkProvider } from "@clerk/nextjs"
import { ConvexProvider, ConvexReactClient } from "convex/react"

export function Providers({ children }: { children: React.ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!convexUrl) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL environment variable.")
  }
  const convex = new ConvexReactClient(convexUrl)

  return (
    <ThemeProvider>
      <ClerkProvider>
        <ConvexProvider client={convex}>{children}</ConvexProvider>
      </ClerkProvider>
    </ThemeProvider>
  )
}
