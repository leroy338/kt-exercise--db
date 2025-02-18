import { Metadata } from "next"
import { 
  Dumbbell, 
  Users, 
  Calendar, 
  BarChart3, 
  ScrollText,
  Apple
} from "lucide-react"

export const metadata: Metadata = {
  title: "Features - Biohackrr",
  description: "Discover all the powerful features Biohackrr offers for your fitness journey",
}

const features = [
  {
    title: "Workouts",
    description: "Create custom workout templates, track sets and reps, and monitor your progress over time.",
    icon: Dumbbell,
    items: [
      "Customizable workout templates",
      "Exercise library with proper form guides",
      "Set and rep tracking",
      "Rest timer",
      "Progress tracking"
    ]
  },
  {
    title: "Meal Planning",
    description: "Plan and track your nutrition with our comprehensive meal planning tools.",
    icon: Apple,
    items: [
      "Meal template creation",
      "Macro tracking",
      "Nutrition analytics",
      "Recipe library",
      "Shopping list generator"
    ]
  },
  {
    title: "Team Management",
    description: "Collaborate with trainers and workout partners to achieve your fitness goals.",
    icon: Users,
    items: [
      "Client management",
      "Workout sharing",
      "Progress monitoring",
      "Team analytics",
      "Communication tools"
    ]
  },
  {
    title: "Planner",
    description: "Schedule and organize your workouts with our intuitive planning tools.",
    icon: Calendar,
    items: [
      "Workout scheduling",
      "Calendar integration",
      "Recurring workouts",
      "Reminders and notifications",
      "Workout history"
    ]
  },
  {
    title: "News Feed",
    description: "Stay connected with your fitness community and share your progress.",
    icon: ScrollText,
    items: [
      "Activity feed",
      "Progress sharing",
      "Community interaction",
      "Achievement badges",
      "Workout inspiration"
    ]
  },
  {
    title: "Analytics",
    description: "Gain insights into your performance with detailed analytics and tracking.",
    icon: BarChart3,
    items: [
      "Performance metrics",
      "Progress visualization",
      "Workout analysis",
      "Goal tracking",
      "Custom reports"
    ]
  }
]

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="text-center space-y-4 mb-16">
        <h1 className="text-4xl font-bold">Powerful Features for Your Fitness Journey</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Everything you need to track, analyze, and improve your fitness routine
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div 
            key={feature.title} 
            className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <feature.icon className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">{feature.title}</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              {feature.description}
            </p>
            <ul className="space-y-2">
              {feature.items.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
