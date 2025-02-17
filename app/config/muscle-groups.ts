export interface MuscleGroup {
  id: string
  label: string
  color: string
}

export const muscleGroups: MuscleGroup[] = [
  { id: 'chest', label: 'Chest', color: 'bg-red-900' },
  { id: 'back', label: 'Back', color: 'bg-blue-900' },
  { id: 'shoulders', label: 'Shoulders', color: 'bg-yellow-900' },
  { id: 'biceps', label: 'Biceps', color: 'bg-purple-900' },
  { id: 'triceps', label: 'Triceps', color: 'bg-pink-900' },
  { id: 'legs', label: 'Legs', color: 'bg-green-900' },
  { id: 'core', label: 'Core', color: 'bg-orange-900' },
  { id: 'forearms', label: 'Forearms', color: 'bg-indigo-900' },
  { id: 'traps', label: 'Traps', color: 'bg-teal-900' }
] 