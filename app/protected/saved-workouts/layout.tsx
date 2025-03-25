export const metadata = {
  title: 'Saved Workouts',
  description: 'View and manage your saved workouts'
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
}

export default function SavedWorkoutsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 