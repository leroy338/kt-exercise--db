import { muscleGroups } from "./muscle-groups"

export const exercises = [
  {
    name: "Bench Press",
    type: "muscle-group",
    muscleGroups: ["chest", "triceps", "shoulders"],
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Squat",
    type: "muscle-group",
    muscleGroups: ["legs", "core"],
    defaultSets: 3,
    defaultReps: 8,
    defaultRest: 120
  },
  {
    name: "Deadlift",
    type: "muscle-group",
    muscleGroups: ["back", "legs", "core"],
    defaultSets: 3,
    defaultReps: 8,
    defaultRest: 120
  },
  {
    name: "Pull-ups",
    type: "muscle-group",
    muscleGroups: ["back", "biceps"],
    defaultSets: 3,
    defaultReps: 8,
    defaultRest: 90
  },
  {
    name: "Shoulder Press",
    type: "muscle-group",
    muscleGroups: ["shoulders", "triceps"],
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Bicep Curls",
    type: "muscle-group",
    muscleGroups: ["biceps"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Incline Bench Press",
    type: "muscle-group",
    muscleGroups: ["chest", "shoulders", "triceps"],
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Decline Bench Press",
    type: "muscle-group",
    muscleGroups: ["chest", "triceps"],
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Dumbbell Flyes",
    type: "muscle-group",
    muscleGroups: ["chest"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Cable Flyes",
    type: "muscle-group",
    muscleGroups: ["chest"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Push-Ups",
    type: "muscle-group",
    muscleGroups: ["chest", "triceps", "shoulders"],
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 60
  },
  {
    name: "Dips",
    type: "muscle-group",
    muscleGroups: ["chest", "triceps"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 90
  },
  {
    name: "Dumbbell Bench Press",
    type: "muscle-group",
    muscleGroups: ["chest", "triceps", "shoulders"],
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Dumbbell Shoulder Press",
    type: "muscle-group",
    muscleGroups: ["shoulders", "triceps"],
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Dumbbell Rows",
    type: "muscle-group",
    muscleGroups: ["back", "biceps"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Dumbbell Lunges",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Kettlebell Swings",
    type: "muscle-group",
    muscleGroups: ["legs", "back", "core"],
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 60
  },
  {
    name: "Kettlebell Clean and Press",
    type: "muscle-group",
    muscleGroups: ["shoulders", "legs", "core"],
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Kettlebell Turkish Get-Up",
    type: "muscle-group",
    muscleGroups: ["shoulders", "core", "legs"],
    defaultSets: 3,
    defaultReps: 5,
    defaultRest: 120
  },
  {
    name: "Kettlebell Goblet Squats",
    type: "muscle-group",
    muscleGroups: ["legs", "core"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 90
  },
  {
    name: "Kettlebell Rows",
    type: "muscle-group",
    muscleGroups: ["back", "biceps"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Cable Chest Press",
    type: "muscle-group",
    muscleGroups: ["chest", "triceps"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Cable Tricep Pushdown",
    type: "muscle-group",
    muscleGroups: ["triceps"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Cable Bicep Curls",
    type: "muscle-group",
    muscleGroups: ["biceps"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Cable Face Pulls",
    type: "muscle-group",
    muscleGroups: ["shoulders", "back"],
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 60
  },
  {
    name: "Cable Lateral Raises",
    type: "muscle-group",
    muscleGroups: ["shoulders"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Cable Rows",
    type: "muscle-group",
    muscleGroups: ["back", "biceps"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Cable Pulldowns",
    type: "muscle-group",
    muscleGroups: ["back", "biceps"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Cable Wood Chops",
    type: "muscle-group",
    muscleGroups: ["core"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Dumbbell Bent Over Rows",
    type: "muscle-group",
    muscleGroups: ["back", "biceps"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Dumbbell Reverse Flyes",
    type: "muscle-group",
    muscleGroups: ["back", "shoulders"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Dumbbell Pullover",
    type: "muscle-group",
    muscleGroups: ["back", "chest"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Kettlebell Single Arm Row",
    type: "muscle-group",
    muscleGroups: ["back", "biceps"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Kettlebell Racked Carries",
    type: "muscle-group",
    muscleGroups: ["back", "core", "shoulders"],
    defaultSets: 3,
    defaultReps: 1,
    defaultRest: 90
  },
  {
    name: "Cable Straight Arm Pulldown",
    type: "muscle-group",
    muscleGroups: ["back", "triceps"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Cable Single Arm Row",
    type: "muscle-group",
    muscleGroups: ["back", "biceps"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Landmine Row",
    type: "muscle-group",
    muscleGroups: ["back", "biceps"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Landmine Meadows Row",
    type: "muscle-group",
    muscleGroups: ["back"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Landmine T-Bar Row",
    type: "muscle-group",
    muscleGroups: ["back", "biceps"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Barbell Pendlay Row",
    type: "muscle-group",
    muscleGroups: ["back", "biceps"],
    defaultSets: 3,
    defaultReps: 8,
    defaultRest: 90
  },
  {
    name: "Meadows Row",
    type: "muscle-group",
    muscleGroups: ["back", "biceps"],
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 60
  },
  {
    name: "Seal Row",
    type: "muscle-group",
    muscleGroups: ["back", "biceps"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Chest Supported Row",
    type: "muscle-group",
    muscleGroups: ["back", "biceps"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Single Arm Lat Pulldown",
    type: "muscle-group",
    muscleGroups: ["back", "biceps"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Wide Grip Pulldown",
    type: "muscle-group",
    muscleGroups: ["back", "biceps"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Close Grip Pulldown",
    type: "muscle-group",
    muscleGroups: ["back", "biceps"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Rack Pulls",
    type: "muscle-group",
    muscleGroups: ["back", "legs"],
    defaultSets: 3,
    defaultReps: 8,
    defaultRest: 120
  },
  {
    name: "Good Mornings",
    type: "muscle-group",
    muscleGroups: ["back", "legs"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 90
  },
  {
    name: "Back Extensions",
    type: "muscle-group",
    muscleGroups: ["back"],
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 60
  },
  {
    name: "Front Squat",
    type: "muscle-group",
    muscleGroups: ["legs", "core"],
    defaultSets: 3,
    defaultReps: 8,
    defaultRest: 120
  },
  {
    name: "Romanian Deadlift",
    type: "muscle-group",
    muscleGroups: ["legs", "back"],
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Bulgarian Split Squat",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 90
  },
  {
    name: "Walking Lunges",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 20,
    defaultRest: 90
  },
  {
    name: "Leg Press",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 90
  },
  {
    name: "Hack Squat",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Leg Extensions",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 60
  },
  {
    name: "Lying Leg Curls",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Seated Calf Raises",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 45
  },
  {
    name: "Standing Calf Raises",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 45
  },
  {
    name: "Dumbbell Step Ups",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Kettlebell Front Rack Squats",
    type: "muscle-group",
    muscleGroups: ["legs", "core"],
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Kettlebell Single Leg Deadlift",
    type: "muscle-group",
    muscleGroups: ["legs", "back"],
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 60
  },
  {
    name: "Cable Pull Through",
    type: "muscle-group",
    muscleGroups: ["legs", "back"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Landmine Reverse Lunges",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Box Jumps",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 8,
    defaultRest: 90
  },
  {
    name: "Sissy Squats",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Belt Squats",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 90
  },
  {
    name: "Nordic Hamstring Curls",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 8,
    defaultRest: 90
  },
  {
    name: "Glute Ham Raises",
    type: "muscle-group",
    muscleGroups: ["legs", "back"],
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Seated Leg Curls",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Single Leg Extensions",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 45
  },
  {
    name: "Single Leg Curls",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 45
  },
  {
    name: "Standing Single Leg Curls",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 45
  },
  {
    name: "Military Press",
    type: "muscle-group",
    muscleGroups: ["shoulders", "triceps"],
    defaultSets: 3,
    defaultReps: 8,
    defaultRest: 90
  },
  {
    name: "Arnold Press",
    type: "muscle-group",
    muscleGroups: ["shoulders", "triceps"],
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Dumbbell Lateral Raises",
    type: "muscle-group",
    muscleGroups: ["shoulders"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Front Raises",
    type: "muscle-group",
    muscleGroups: ["shoulders"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Upright Rows",
    type: "muscle-group",
    muscleGroups: ["shoulders", "traps"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Reverse Pec Deck",
    type: "muscle-group",
    muscleGroups: ["shoulders", "back"],
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 60
  },
  {
    name: "Plate Front Raises",
    type: "muscle-group",
    muscleGroups: ["shoulders"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Landmine Press",
    type: "muscle-group",
    muscleGroups: ["shoulders", "triceps"],
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Single Arm Landmine Press",
    type: "muscle-group",
    muscleGroups: ["shoulders", "triceps"],
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 60
  },
  {
    name: "Behind the Neck Press",
    type: "muscle-group",
    muscleGroups: ["shoulders", "triceps"],
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Bradford Press",
    type: "muscle-group",
    muscleGroups: ["shoulders", "triceps"],
    defaultSets: 3,
    defaultReps: 8,
    defaultRest: 90
  },
  {
    name: "Z Press",
    type: "muscle-group",
    muscleGroups: ["shoulders", "core"],
    defaultSets: 3,
    defaultReps: 8,
    defaultRest: 90
  },
  {
    name: "Kettlebell Bottoms Up Press",
    type: "muscle-group",
    muscleGroups: ["shoulders", "triceps"],
    defaultSets: 3,
    defaultReps: 8,
    defaultRest: 90
  },
  {
    name: "Cable Y Raises",
    type: "muscle-group",
    muscleGroups: ["shoulders"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Dumbbell Around the World",
    type: "muscle-group",
    muscleGroups: ["shoulders"],
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 60
  },
  {
    name: "Seated Behind Neck Press",
    type: "muscle-group",
    muscleGroups: ["shoulders", "triceps"],
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 90
  },
  {
    name: "Machine Shoulder Press",
    type: "muscle-group",
    muscleGroups: ["shoulders", "triceps"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Lateral Raise Machine",
    type: "muscle-group",
    muscleGroups: ["shoulders"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Band Face Pulls",
    type: "muscle-group",
    muscleGroups: ["shoulders", "back"],
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 45
  },
  {
    name: "Plate Raises",
    type: "muscle-group",
    muscleGroups: ["shoulders"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Plank",
    type: "muscle-group",
    muscleGroups: ["core"],
    defaultSets: 3,
    defaultReps: 1,
    defaultRest: 60
  },
  {
    name: "Ab Wheel Rollouts",
    type: "muscle-group",
    muscleGroups: ["core"],
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 60
  },
  {
    name: "Cable Crunches",
    type: "muscle-group",
    muscleGroups: ["core"],
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 45
  },
  {
    name: "Hanging Leg Raises",
    type: "muscle-group",
    muscleGroups: ["core"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Russian Twists",
    type: "muscle-group",
    muscleGroups: ["core"],
    defaultSets: 3,
    defaultReps: 20,
    defaultRest: 45
  },
  {
    name: "Pallof Press",
    type: "muscle-group",
    muscleGroups: ["core"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 45
  },
  {
    name: "Dragon Flags",
    type: "muscle-group",
    muscleGroups: ["core"],
    defaultSets: 3,
    defaultReps: 8,
    defaultRest: 90
  },
  {
    name: "Decline Bench Crunches",
    type: "muscle-group",
    muscleGroups: ["core"],
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 45
  },
  {
    name: "Side Planks",
    type: "muscle-group",
    muscleGroups: ["core"],
    defaultSets: 3,
    defaultReps: 1,
    defaultRest: 45
  },
  {
    name: "Medicine Ball Slams",
    type: "muscle-group",
    muscleGroups: ["core"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Landmine Rotations",
    type: "muscle-group",
    muscleGroups: ["core"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 45
  },
  {
    name: "Copenhagen Plank",
    type: "muscle-group",
    muscleGroups: ["core"],
    defaultSets: 3,
    defaultReps: 1,
    defaultRest: 60
  },
  {
    name: "Dead Bug",
    type: "muscle-group",
    muscleGroups: ["core"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 45
  },
  {
    name: "Bird Dog",
    type: "muscle-group",
    muscleGroups: ["core"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 45
  },
  {
    name: "Windshield Wipers",
    type: "muscle-group",
    muscleGroups: ["core"],
    defaultSets: 3,
    defaultReps: 10,
    defaultRest: 60
  },
  {
    name: "Renegade Rows",
    type: "muscle-group",
    muscleGroups: ["core", "back"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Turkish Get-Up",
    type: "muscle-group",
    muscleGroups: ["core", "shoulders"],
    defaultSets: 3,
    defaultReps: 5,
    defaultRest: 90
  },
  {
    name: "L-Sits",
    type: "muscle-group",
    muscleGroups: ["core"],
    defaultSets: 3,
    defaultReps: 1,
    defaultRest: 60
  },
  {
    name: "Farmers Walk",
    type: "muscle-group",
    muscleGroups: ["core", "back"],
    defaultSets: 3,
    defaultReps: 1,
    defaultRest: 90
  },
  {
    name: "Suitcase Carries",
    type: "muscle-group",
    muscleGroups: ["core"],
    defaultSets: 3,
    defaultReps: 1,
    defaultRest: 90
  },
  {
    name: "Donkey Calf Raises",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 4,
    defaultReps: 15,
    defaultRest: 45
  },
  {
    name: "Single Leg Calf Raises",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 45
  },
  {
    name: "Smith Machine Calf Raises",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 45
  },
  {
    name: "Hip Thrusts",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 90
  },
  {
    name: "Single Leg Hip Thrusts",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Cable Pull Throughs",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 60
  },
  {
    name: "Glute Bridges",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 45
  },
  {
    name: "Frog Pumps",
    type: "muscle-group",
    muscleGroups: ["legs"],
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 45
  },
  {
    name: "Barbell Wrist Curls",
    type: "muscle-group",
    muscleGroups: ["forearms"],
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 45
  },
  {
    name: "Reverse Wrist Curls",
    type: "muscle-group",
    muscleGroups: ["forearms"],
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 45
  },
  {
    name: "Plate Pinches",
    type: "muscle-group",
    muscleGroups: ["forearms"],
    defaultSets: 3,
    defaultReps: 1,
    defaultRest: 60
  },
  {
    name: "Farmers Walk on Toes",
    type: "muscle-group",
    muscleGroups: ["legs", "forearms"],
    defaultSets: 3,
    defaultReps: 1,
    defaultRest: 90
  },
  {
    name: "Behind Body Wrist Curls",
    type: "muscle-group",
    muscleGroups: ["forearms"],
    defaultSets: 3,
    defaultReps: 15,
    defaultRest: 45
  },
  {
    name: "Cable Wrist Rotations",
    type: "muscle-group",
    muscleGroups: ["forearms"],
    defaultSets: 3,
    defaultReps: 12,
    defaultRest: 45
  },
  {
    name: "Dead Hangs",
    type: "muscle-group",
    muscleGroups: ["forearms"],
    defaultSets: 3,
    defaultReps: 1,
    defaultRest: 90
  }
]

// Add type for exercise
export type Exercise = typeof exercises[0] 