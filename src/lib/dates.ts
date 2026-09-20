/**
 * Format a Date as YYYY-MM-DD using LOCAL date parts.
 *
 * Never use `toISOString()` for this: it converts to UTC first, so in any
 * timezone ahead of UTC (Portugal in summer, for example) a local midnight
 * rolls back to 23:00 the previous day and every date shifts one day early.
 */
function toISODate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Parse a YYYY-MM-DD string as local midnight (not UTC midnight) */
function fromISODate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

/** Returns the Monday of the week containing `date` as YYYY-MM-DD */
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // shift to Monday
  d.setDate(d.getDate() + diff)
  return toISODate(d)
}

/** Adds `weeks` weeks to a YYYY-MM-DD date string */
export function addWeeks(weekStart: string, weeks: number): string {
  const d = fromISODate(weekStart)
  d.setDate(d.getDate() + weeks * 7)
  return toISODate(d)
}

/** Format a YYYY-MM-DD as "Apr 7" */
export function formatShort(dateStr: string): string {
  return fromISODate(dateStr).toLocaleDateString('en-GB', {
    month: 'short', day: 'numeric',
  })
}

/** Returns an array of 7 date strings (Mon–Sun) for a given weekStart */
export function weekDays(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = fromISODate(weekStart)
    d.setDate(d.getDate() + i)
    return toISODate(d)
  })
}
