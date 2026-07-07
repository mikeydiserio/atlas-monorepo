# ADR-0002: Supabase client, no additional ORM

- **Status:** Accepted
- **Date:** 2026-07-06

## Context

Atlas needs a data layer over PostgreSQL. A common reflex is to add an ORM (Prisma,
Drizzle) for ergonomics and migrations. But the isolation model depends on Row Level
Security, and ORMs vary in how faithfully they respect Postgres session context and
policies. The brief also warns against unnecessary dependencies.

## Decision

Use the **official Supabase client** and lean on PostgreSQL features directly. No
additional ORM. Migrations are plain SQL under `supabase/migrations`. Query and mutation
access is centralised in `packages/cms` so the rest of the platform depends on a typed
domain API, not on raw client calls scattered everywhere.

Types are generated from the database (`supabase gen types`) and reconciled with the Zod
schemas in `packages/shared` (ADR-0006), which remain the authoring source of truth.

## Consequences

- RLS is honoured naturally: the client runs queries in the authenticated session, so
  policies apply without an ORM translation layer to second-guess.
- One fewer large dependency to maintain for ten years.
- We write SQL for migrations and complex queries. Accepted: SQL is the durable skill and
  the most faithful expression of Postgres capabilities (RLS, generated columns,
  triggers, RPC).
- `packages/cms` becomes the one place data access is defined and tested.

## Alternatives considered

- **Prisma** — great DX, but historically awkward with RLS/session GUCs and adds a heavy
  codegen/runtime layer. Rejected.
- **Drizzle** — lighter, SQL-like. Reasonable, but still a second source of schema truth
  competing with SQL migrations and Zod. Rejected to keep exactly one place per concern.
