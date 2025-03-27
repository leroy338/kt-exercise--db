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

export function formatDate(date: Date, timezone: string): string {
  // Create a formatter that uses the specified timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  })

  return formatter.format(date)
}

export function convertToUserTimezone(date: Date, timezone: string): Date {
  return new Date(date.toLocaleString('en-US', { timeZone: timezone }))
}

export function convertToUTC(date: Date, timezone: string): Date {
  const utcDate = new Date()
  const targetDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
  const offset = targetDate.getTime() - date.getTime()
  utcDate.setTime(date.getTime() - offset)
  return utcDate
}

export function getStartOfDay(date: Date, timezone: string): Date {
  const userDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
  userDate.setHours(0, 0, 0, 0)
  return convertToUTC(userDate, timezone)
}

export function getEndOfDay(date: Date, timezone: string): Date {
  const userDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
  userDate.setHours(23, 59, 59, 999)
  return convertToUTC(userDate, timezone)
}

export function isSameDay(date1: Date, date2: Date, timezone: string): boolean {
  const d1 = new Date(date1.toLocaleString('en-US', { timeZone: timezone }))
  const d2 = new Date(date2.toLocaleString('en-US', { timeZone: timezone }))
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
} 