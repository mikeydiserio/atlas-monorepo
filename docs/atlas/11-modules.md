# Atlas — Modules

> Stage 10 deliverable. The optional-module engines as pure, headless logic —
> 12 runtime-verified checks; Vitest mirrors in each package. Persistence and
> transport are injected seams; the Stage-2 tables are the storage contracts.

## @atlas/forms — dynamic form engine

- **Schema → validator compilation** (`validator.ts`): the authored `FormSchema`
  compiles to Zod per field type (email, number min/max, string
  minLength/maxLength/pattern, enum-locked select/radio/multiselect, date, checkbox
  coercion). One compiled validator serves browser (RHF resolver) and server.
- **Conditional fields** (`conditions.ts`): `visibleWhen` operators
  `eq/neq/in/notin/truthy/falsy`. Hidden fields are skipped in validation *and their
  values discarded* — a hidden required field never blocks submit, a stale hidden value
  never persists.
- **Submission pipeline** (`submit.ts`): honeypot (any value in the hidden field →
  `spam`, no persistence, indistinguishable response) → validate visible → `persist`
  seam → `notify('form.submitted')` into the event bus.

## @atlas/booking — availability + lifecycle

- **Availability engine** (`availability.ts`): expands weekly `availability_rules` +
  `availability_exceptions` (holidays close a date; altered hours *replace* the weekly
  rules) into concrete UTC slots. A candidate's **padded interval**
  `[start − bufferBefore, end + bufferAfter]` must fit the working window and not
  overlap any existing booking — buffers guarantee prep/cleanup on both sides.
- **Reservation lifecycle** (`reservation.ts`): the state machine over
  `bookings.status` — `pending → confirmed → completed`; cancel from pending/confirmed;
  `no_show` from confirmed; cancelled/completed terminal. `reschedule()` additionally
  guards interval sanity and a notice-period floor.

## @atlas/notifications + @atlas/email + @atlas/sms — event-driven comms

- **Event bus** (`bus.ts`): `emit(event, ctx)` fans out to subscribers; each returns
  **outbox rows** (the Stage-2 `notifications` table shape, Zod-validated per row —
  a bad subscriber cannot poison the outbox). Nothing sends synchronously;
  `apps/worker` drains `(status, scheduled_for)`.
- **Reference chain** (`booking-defaults.ts`) — the brief's canonical flow:
  `booking.created` → confirmation **email** (now) → reminder **SMS** (scheduled
  `startsAt − 24h`, skipped without a phone or when the lead time has passed) →
  **internal** notification.
- **Providers**: `EmailProvider`/`SmsProvider` interfaces with memory implementations
  for dev/test; adapters (Resend/SES, Twilio/…) plug in at worker config.
  `renderTemplate` (in `@atlas/shared`) interpolates tenant-authored
  `{{variable}}`/`{{nested.path}}` templates; missing vars render empty, never raw
  syntax. SMS bodies are truncated at 3 segments.

## @atlas/analytics — capture + aggregation

`createTracker(sink)` validates events (tenant UUID, name ≤ 64, ISO `occurredAt`
defaulted) before the sink (Supabase insert in production). `countByName` /
`dailySeries` are the pure dashboard aggregations; heavy reporting stays in SQL.

## The seam pattern (platform-wide)

Every engine takes its I/O as injected functions (`persist`, `notify`, `sink`,
providers) shaped exactly like the future `@atlas/cms`/worker implementations over the
Stage-2 schema. That is why all of Stage 10 is verifiable headlessly today, and why
Supabase wiring is configuration, not rework. Remaining production wiring:
`@atlas/cms` + `@atlas/authentication` over the Supabase client, `apps/worker`'s outbox
drain loop, and `apps/api`'s Route Handlers — all consumers of contracts that now exist
and are tested.
