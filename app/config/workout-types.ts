export interface WorkoutType {
  id: string
  label: string
  color: string
}

export const workoutTypes: WorkoutType[] = [
  { id: 'muscle-group', label: 'Muscle Group', color: 'blue-600' },
  { id: 'push-pull', label: 'Push/Pull', color: 'green-600' },
  { id: 'upper-lower', label: 'Upper/Lower', color: 'purple-600' },
  { id: 'full-body', label: 'Full Body', color: 'red-600' },
  { id: 'yoga', label: 'Yoga', color: 'teal-600' },
  { id: 'cardio', label: 'Cardio', color: 'orange-600' },
  { id: 'wod', label: 'WOD', color: 'yellow-600' },
  { id: 'hiit', label: 'HIIT', color: 'pink-600' },
  { id: 'other', label: 'Other', color: 'gray-600' }
]

export function getWorkoutType(id: string) {
  return workoutTypes.find(type => type.id === id) || workoutTypes[0]
} 