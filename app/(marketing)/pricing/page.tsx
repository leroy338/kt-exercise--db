import { Metadata } from "next"
import { Check } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Pricing - Biohackrr",
  description: "Simple, transparent pricing for everyone",
}

const plans = [
  {
    name: "Personal",
    price: "$9",
    description: "Perfect for individual fitness enthusiasts",
    features: [
      "Unlimited workout templates",
      "5 Person Team workspace",
      "Progress tracking",
      "Basic analytics",
      "Mobile app access",
      "Export workouts"
    ],
    cta: "Start Free Trial"
  },
  {
    name: "Trainer",
    price: "$49",
    description: "Ideal for personal trainers and coaches",
    features: [
      "Everything in Personal",
      "Client management",
      "Workout sharing",
      "Priority support"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Team",
    price: "$249",
    description: "Great for fitness studios and small gyms",
    features: [
      "Everything in Trainer",
      "Up to 5 trainers",
      "Team analytics",
      "Bulk client import",
      "Team workspace"
    ],
    cta: "Contact Sales"
  },
  {
    name: "Business",
    price: "$299",
    description: "For growing fitness businesses",
    features: [
      "Everything in Team",
      "Up to 15 trainers",
      "Unlimited Team members",
      "Advanced analytics",
      "API access",
      "Dedicated support"
    ],
    cta: "Contact Sales"
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Custom solutions for large organizations",
    features: [
      "Everything in Business",
      "Unlimited trainers",
      "Custom integrations",
      "SLA support",
      "Dedicated success manager"
    ],
    cta: "Contact Sales"
  }
]

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the perfect plan for your fitness journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.name}
            className={`p-6 flex flex-col ${
              plan.popular ? 'border-primary shadow-lg' : ''
            }`}
          >
            {plan.popular && (
              <div className="px-3 py-1 text-sm text-primary border border-primary rounded-full w-fit mb-4">
                Most Popular
              </div>
            )}
            
            <h3 className="text-2xl font-bold">{plan.name}</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-3xl font-bold">{plan.price}</span>
              {plan.price !== "Custom" && <span className="text-muted-foreground ml-2">/month</span>}
            </div>
            
            <p className="mt-4 text-muted-foreground">
              {plan.description}
            </p>

            <div className="mt-6 space-y-4 flex-grow">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <Button 
              className="mt-8 w-full"
              variant={plan.popular ? "default" : "outline"}
            >
              {plan.cta}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
