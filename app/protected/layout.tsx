import { Sidebar } from "@/components/sidebar"
import { HeaderAuth } from "@/components/header-auth"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <HeaderAuth />
      <div className="pt-14">
        <Sidebar />
        <main className="pl-64">
          {children}
        </main>
      </div>
    </div>
  )
} 