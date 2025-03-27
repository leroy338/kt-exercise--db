import { createClient } from "@/utils/supabase/client"

export async function getUserTimezone(): Promise<string> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('user_id', user.id)
    .single()

  return profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function convertToUserTimezone(date: Date, timezone: string): Date {
  // Create a new date object from the input date
  const userDate = new Date(date)
  
  // Get the timezone offset in minutes
  const tzOffset = new Date().toLocaleString('en-US', { timeZone: timezone, timeZoneName: 'short' })
    .split(' ')[1]
    .replace(/[^0-9-]/g, '')
  
  // Convert offset to milliseconds
  const offsetMs = parseInt(tzOffset) * 60 * 1000
  
  // Adjust the date by the timezone offset
  userDate.setTime(userDate.getTime() + offsetMs)
  
  return userDate
}

export function convertToUTC(date: Date, timezone: string): Date {
  // Create a new date object from the input date
  const utcDate = new Date(date)
  
  // Get the timezone offset in minutes
  const tzOffset = new Date().toLocaleString('en-US', { timeZone: timezone, timeZoneName: 'short' })
    .split(' ')[1]
    .replace(/[^0-9-]/g, '')
  
  // Convert offset to milliseconds
  const offsetMs = parseInt(tzOffset) * 60 * 1000
  
  // Adjust the date by subtracting the timezone offset
  utcDate.setTime(utcDate.getTime() - offsetMs)
  
  return utcDate
}

export function formatDate(date: Date, timezone: string): string {
  return new Date(date).toLocaleString('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  })
}

export function getStartOfDay(date: Date, timezone: string): Date {
  const userDate = new Date(date)
  userDate.setHours(0, 0, 0, 0)
  return convertToUTC(userDate, timezone)
}

export function getEndOfDay(date: Date, timezone: string): Date {
  const userDate = new Date(date)
  userDate.setHours(23, 59, 59, 999)
  return convertToUTC(userDate, timezone)
}

export function isSameDay(date1: Date, date2: Date, timezone: string): boolean {
  const startOfDay1 = getStartOfDay(date1, timezone)
  const startOfDay2 = getStartOfDay(date2, timezone)
  return startOfDay1.getTime() === startOfDay2.getTime()
} 