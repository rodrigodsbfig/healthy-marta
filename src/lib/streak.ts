/**
 * Streak maths for the workout calendar.
 *
 * A streak counts consecutive days trained ending today. Training yesterday
 * but not yet today still counts — the streak is only broken once a full day
 * has passed untrained, so opening the app in the morning does not show a
 * streak of zero before she has been to the gym.
 */

/** YYYY-MM-DD from local date parts. Never toISOString — see lib/dates.ts. */
function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function currentStreak(dates: Set<string>, today: Date = new Date()): number {
  const cursor = new Date(today)
  // If today is not yet trained, start counting from yesterday.
  if (!dates.has(iso(cursor))) cursor.setDate(cursor.getDate() - 1)

  let streak = 0
  while (dates.has(iso(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** Every day of `month` laid out Mon–Sun, with leading blanks for alignment. */
export function monthGrid(year: number, month: number): Array<string | null> {
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // getDay(): 0=Sun. Shift so Monday is column 0, matching the rest of the app.
  const lead = (first.getDay() + 6) % 7

  const cells: Array<string | null> = Array(lead).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(iso(new Date(year, month, d)))
  return cells
}

export { iso as isoDate }
