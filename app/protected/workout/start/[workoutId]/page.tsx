"use client"

import { WorkoutForm } from "./workout-form"
import { useParams } from "next/navigation"

export default function StartWorkout() {
  const params = useParams()
  const workoutId = params.workoutId as string

  return <WorkoutForm workoutId={workoutId} />
} 