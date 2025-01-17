export interface WorkoutType {
  id: string
  label: string
  color: string
}

export const workoutTypes: WorkoutType[] = [
  { id: 'muscle-group', label: 'Muscle Group', color: 'blue-500' },
  { id: 'push-pull', label: 'Push/Pull', color: 'green-500' },
  { id: 'upper-lower', label: 'Upper/Lower', color: 'purple-500' },
  { id: 'full-body', label: 'Full Body', color: 'red-500' },
  { id: 'yoga', label: 'Yoga', color: 'teal-500' },
  { id: 'cardio', label: 'Cardio', color: 'orange-500' },
  { id: 'wod', label: 'WOD', color: 'yellow-500' },
  { id: 'hiit', label: 'HIIT', color: 'pink-500' },
  { id: 'other', label: 'Other', color: 'gray-500' }
]

export function getWorkoutType(id: string) {
  return workoutTypes.find(type => type.id === id) || workoutTypes[0]
} 