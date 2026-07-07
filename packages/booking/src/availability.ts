/**
 * The availability engine. Expands weekly recurring rules + date exceptions
 * (holidays / altered hours) into concrete bookable slots for a date range,
 * honouring service duration, buffer times, and collisions with existing
 * bookings. Pure and timezone-explicit: all instants are UTC ISO strings; all
 * clock times are the tenant's business hours expressed as HH:MM.
 *
 * Mirrors the Stage-2 tables: availability_rules, availability_exceptions,
 * services (duration/buffers), bookings.
 */

export interface AvailabilityRule {
  staffId: string
  /** 0 = Sunday … 6 = Saturday (matches the DB check constraint). */
  weekday: number
  /** 'HH:MM' 24h. */
  startTime: string
  endTime: string
}

export interface AvailabilityException {
  staffId: string
  /** 'YYYY-MM-DD'. */
  onDate: string
  isClosed: boolean
  startTime?: string
  endTime?: string
}

export interface ExistingBooking {
  staffId: string
  /** UTC ISO instants. */
  startsAt: string
  endsAt: string
}

export interface BookableService {
  durationMin: number
  bufferBeforeMin: number
  bufferAfterMin: number
}

export interface Slot {
  staffId: string
  startsAt: string
  endsAt: string
}

export interface ComputeSlotsInput {
  service: BookableService
  rules: AvailabilityRule[]
  exceptions: AvailabilityException[]
  bookings: ExistingBooking[]
  /** Inclusive 'YYYY-MM-DD' range. */
  fromDate: string
  toDate: string
  /** Candidate start-time step; defaults to the service duration. */
  slotStepMin?: number
}

const MS = 60_000

function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

function dateAtUtc(date: string, minutes: number): number {
  return Date.parse(`${date}T00:00:00Z`) + minutes * MS
}

function* eachDate(from: string, to: string): Generator<string> {
  for (let t = Date.parse(`${from}T00:00:00Z`); t <= Date.parse(`${to}T00:00:00Z`); t += 24 * 60 * MS) {
    yield new Date(t).toISOString().slice(0, 10)
  }
}

interface Window {
  start: number
  end: number
}

/** Effective working windows for one staff member on one date. */
export function windowsForDate(
  staffId: string,
  date: string,
  rules: AvailabilityRule[],
  exceptions: AvailabilityException[]
): Window[] {
  const exception = exceptions.find((e) => e.staffId === staffId && e.onDate === date)
  if (exception) {
    if (exception.isClosed || !exception.startTime || !exception.endTime) return []
    // Altered hours replace the weekly rules for that date.
    return [{ start: dateAtUtc(date, minutesOf(exception.startTime)), end: dateAtUtc(date, minutesOf(exception.endTime)) }]
  }
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay()
  return rules
    .filter((r) => r.staffId === staffId && r.weekday === weekday)
    .map((r) => ({ start: dateAtUtc(date, minutesOf(r.startTime)), end: dateAtUtc(date, minutesOf(r.endTime)) }))
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd
}

/**
 * Compute bookable slots. A candidate is valid when its PADDED interval
 * [start - bufferBefore, end + bufferAfter] fits inside a working window and
 * does not overlap any existing booking for that staff member — buffers
 * guarantee prep/cleanup time on both sides.
 */
export function computeSlots(input: ComputeSlotsInput): Slot[] {
  const { service, rules, exceptions, bookings, fromDate, toDate } = input
  const step = (input.slotStepMin ?? service.durationMin) * MS
  const duration = service.durationMin * MS
  const padBefore = service.bufferBeforeMin * MS
  const padAfter = service.bufferAfterMin * MS

  const staffIds = [...new Set(rules.map((r) => r.staffId))]
  const slots: Slot[] = []

  for (const staffId of staffIds) {
    const staffBookings = bookings
      .filter((b) => b.staffId === staffId)
      .map((b) => ({ start: Date.parse(b.startsAt), end: Date.parse(b.endsAt) }))

    for (const date of eachDate(fromDate, toDate)) {
      for (const window of windowsForDate(staffId, date, rules, exceptions)) {
        for (let start = window.start + padBefore; start + duration + padAfter <= window.end; start += step) {
          const paddedStart = start - padBefore
          const paddedEnd = start + duration + padAfter
          const collides = staffBookings.some((b) => overlaps(paddedStart, paddedEnd, b.start, b.end))
          if (!collides) {
            slots.push({
              staffId,
              startsAt: new Date(start).toISOString(),
              endsAt: new Date(start + duration).toISOString(),
            })
          }
        }
      }
    }
  }

  return slots.sort((a, b) => a.startsAt.localeCompare(b.startsAt) || a.staffId.localeCompare(b.staffId))
}
