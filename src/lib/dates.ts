/** Returns the Monday of the week containing `date` as YYYY-MM-DD */
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // shift to Monday
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

/** Adds `weeks` weeks to a YYYY-MM-DD date string */
export function addWeeks(weekStart: string, weeks: number): string {
  const d = new Date(weekStart)
  d.setDate(d.getDate() + weeks * 7)
  return d.toISOString().split('T')[0]
}

/** Format a YYYY-MM-DD as "Apr 7" */
export function formatShort(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    month: 'short', day: 'numeric',
  })
}

/** Returns an array of 7 date strings (Mon–Sun) for a given weekStart */
export function weekDays(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart + 'T00:00:00')
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}
