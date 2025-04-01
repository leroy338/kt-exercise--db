export interface WorkoutType {
  id: string
  label: string
  color: string
  builder: 'sets' | 'time' | 'circuit'
}

export const workoutTypes: WorkoutType[] = [
  { id: 'muscle-group', label: 'Muscle Group', color: 'blue-600', builder: 'sets' },
  { id: 'push-pull', label: 'Push/Pull', color: 'green-600', builder: 'sets' },
  { id: 'upper-lower', label: 'Upper/Lower', color: 'purple-600', builder: 'sets' },
  { id: 'full-body', label: 'Full Body', color: 'red-600', builder: 'sets' },
  { id: 'yoga', label: 'Yoga', color: 'teal-600', builder: 'time' },
  { id: 'cardio', label: 'Cardio', color: 'orange-600', builder: 'time' },
  { id: 'wod', label: 'WOD', color: 'yellow-600', builder: 'circuit' },
  { id: 'hiit', label: 'HIIT', color: 'pink-600', builder: 'circuit' },
  { id: 'other', label: 'Other', color: 'gray-600', builder: 'sets' },
  { id: 'tabata', label: 'Tabata', color: 'green-600', builder: 'circuit' },
]

export function getWorkoutType(id: string) {
  return workoutTypes.find(type => type.id === id) || workoutTypes[0]
} 