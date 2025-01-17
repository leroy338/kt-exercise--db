import { Sidebar } from "@/components/sidebar"
import { HeaderAuth } from "@/components/header-auth"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <HeaderAuth className="hidden md:block" />
      <Sidebar />
      <main className="lg:pl-64 pt-14">
        {children}
      </main>
    </div>
  )
} 