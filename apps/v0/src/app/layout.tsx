import { Providers } from "@/app/providers"
import { AppSidebar } from "@/components/app-sidebar"
import { api } from "@/lib/convex/_generated/api"
import { auth } from "@clerk/nextjs/server"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import "@workspace/ui/globals.css"
import { preloadQuery } from "convex/nextjs"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "v0-demo",
  description: "A v0-demo experiment.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { userId } = await auth()

  const preloadedProjects = userId
    ? await preloadQuery(api.projects.getProjects, { ownerId: userId })
    : null

  return (
    <html
      className={`${geistSans.variable} ${geistMono.variable} h-full font-sans antialiased`}
      lang="en"
      suppressHydrationWarning
    >
      <body className="flex h-full flex-col overflow-hidden">
        <Providers>
          {userId && preloadedProjects ? (
            <SidebarProvider>
              <AppSidebar preloadedProjects={preloadedProjects} />
              <SidebarInset>{children}</SidebarInset>
            </SidebarProvider>
          ) : (
            children
          )}
        </Providers>
      </body>
    </html>
  )
}
