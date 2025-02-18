import Image from "next/image"
import Link from "next/link"
import { WaitlistForm } from "./waitlist-form"

export function Footer() {
  return (
    <footer className="border-t bg-background/80 backdrop-blur-sm">
      <div className="container px-4 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
          {/* Logo and Description */}
          <div className="space-y-4 lg:max-w-xs">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/Logo-Transparent.png" 
                alt="Biohackrr Logo" 
                width={32} 
                height={32}
                className="rounded-full"
              />
              <span className="font-semibold">Biohackrr</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Track your fitness journey with data-driven insights and personalized analytics.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-16">
            <div className="space-y-4">
              <h4 className="font-semibold">Product</h4>
              <ul className="space-y-3">
                <li><Link href="/features" className="text-sm text-muted-foreground hover:text-primary">Features</Link></li>
                <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary">Pricing</Link></li>
                <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary">About</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">Blog</Link></li>
                <li><Link href="/careers" className="text-sm text-muted-foreground hover:text-primary">Careers</Link></li>
                <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy</Link></li>
                <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Terms</Link></li>
              </ul>
            </div>
          </div>

          {/* Waitlist Form */}
          <div className="w-full lg:max-w-sm space-y-4">
            <h4 className="font-semibold">Join the Waitlist</h4>
            <p className="text-sm text-muted-foreground">
              Be the first to know when we launch new features.
            </p>
            <WaitlistForm />
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center md:text-left text-sm text-muted-foreground">
          © {new Date().getFullYear()} Biohackrr. All rights reserved.
        </div>
      </div>
    </footer>
  )
} 