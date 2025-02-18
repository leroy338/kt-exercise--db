import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

interface HeroProps {
  title: string
  subtitle: string
  image: string
  primaryCta?: {
    text: string
    href: string
  }
  secondaryCta?: {
    text: string
    href: string
  }
}

export function Hero({ 
  title, 
  subtitle, 
  image,
  primaryCta = { text: "Get Started", href: "/signup" },
  secondaryCta = { text: "Learn More", href: "/about" }
}: HeroProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-8">
          {/* Image */}
          <div className="relative w-48 h-48 mx-auto mb-8">
            <Image
              src={image}
              alt="Hero image"
              fill
              className="object-contain drop-shadow-xl"
            />
          </div>

          {/* Text Content */}
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
              {title}
            </h1>
            <p className="text-xl text-muted-foreground">
              {subtitle}
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="min-w-[140px]">
              <Link href={primaryCta.href}>
                {primaryCta.text}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-[140px]">
              <Link href={secondaryCta.href}>
                {secondaryCta.text}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 