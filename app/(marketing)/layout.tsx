import { HeaderAuth } from "@/components/header-auth"
import { GridBackground } from "./components/grid-background"
import { Footer } from "./components/footer"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <GridBackground />
      <HeaderAuth />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
} 