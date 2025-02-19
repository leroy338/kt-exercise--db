export interface MuscleGroup {
  id: string
  label: string
  color: string
  svgPath: string
}

export const muscleGroups: MuscleGroup[] = [
  {
    id: 'chest',
    label: 'Chest',
    color: 'bg-red-500/50',
    svgPath: `
      M35,45 
      C40,40 60,40 65,45
      C60,55 50,58 40,55
      C35,52 35,48 35,45
      Z
    `
  },
  {
    id: 'shoulders',
    label: 'Shoulders',
    color: 'bg-blue-500/50',
    svgPath: `
      M25,40 Q35,35 45,40
      M55,40 Q65,35 75,40
    `
  },
  {
    id: 'back',
    label: 'Back',
    color: 'bg-blue-900',
    svgPath: `
      M35,45
      C40,42 60,42 65,45
      L65,85
      C60,88 40,88 35,85
      Z
    `
  },
  {
    id: 'biceps',
    label: 'Biceps',
    color: 'bg-purple-900',
    svgPath: `
      M20,45 C15,55 18,65 25,75
      M80,45 C85,55 82,65 75,75
    `
  },
  {
    id: 'triceps',
    label: 'Triceps',
    color: 'bg-pink-900',
    svgPath: `
      M25,45 C20,55 23,65 30,75
      M75,45 C80,55 77,65 70,75
    `
  },
  {
    id: 'legs',
    label: 'Legs',
    color: 'bg-green-900',
    svgPath: `
      M30,90 C25,110 30,130 35,150
      M70,90 C75,110 70,130 65,150
    `
  },
  {
    id: 'core',
    label: 'Core',
    color: 'bg-orange-900',
    svgPath: `
      M35,60
      Q50,58 65,60
      L65,90
      Q50,95 35,90
      Z
    `
  },
  {
    id: 'forearms',
    label: 'Forearms',
    color: 'bg-indigo-900',
    svgPath: 'M38,65 C35,70 35,75 38,80 M62,65 C65,70 65,75 62,80'
  },
  {
    id: 'traps',
    label: 'Traps',
    color: 'bg-teal-900',
    svgPath: `
      M40,25
      C45,20 55,20 60,25
      C55,35 45,35 40,25
    `
  }
]

// Wider body outline
export const bodyOutlinePath = `
  M50,15
  C65,15 75,25 75,35
  C75,45 85,55 85,65
  C85,85 80,105 75,125
  C70,145 65,150 60,150
  L40,150
  C35,150 30,145 25,125
  C20,105 15,85 15,65
  C15,55 25,45 25,35
  C25,25 35,15 50,15
  Z
` 