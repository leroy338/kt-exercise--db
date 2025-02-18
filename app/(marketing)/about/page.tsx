import { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: "About Biohackrr",
  description: "Track your fitness journey and optimize your workouts with Biohackrr",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">About Biohackrr</h1>
          <p className="text-xl text-muted-foreground">
            Empowering your fitness journey through data-driven insights
          </p>
        </div>

        {/* Mission Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            Biohackrr was created with a simple goal: to help people optimize their fitness journey 
            through intelligent workout tracking and data analysis. We believe that understanding your 
            body's response to different training methods is key to achieving your fitness goals.
          </p>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Smart Workout Tracking</h3>
            <p className="text-muted-foreground">
              Create and customize workout templates, track your progress, and analyze your 
              performance over time.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Data-Driven Insights</h3>
            <p className="text-muted-foreground">
              Get detailed analytics about your workouts, helping you understand what works 
              best for your body.
            </p>
          </div>
        </section>

        {/* Team/Contact Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Get in Touch</h2>
          <p className="text-muted-foreground">
            Have questions or suggestions? We'd love to hear from you. Reach out to us at{' '}
            <a 
              href="mailto:contact@biohackrr.com" 
              className="text-primary hover:underline"
            >
              contact@biohackrr.com
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
