import { Sidebar } from "@/components/sidebar"
import { HeaderAuth } from "@/components/header-auth"
import { Analytics } from "@vercel/analytics/react"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <HeaderAuth />
      <Sidebar />
      <main className="w-full pt-14 px-4 md:px-6 lg:pl-64">
        <div className="max-w-full mx-auto">
          {children}
        </div>
      </main>
      <Analytics />
    </div>
  )
} 