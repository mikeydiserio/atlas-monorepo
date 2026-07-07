# ADR-0001: Additive monorepo on top of Satūs

- **Status:** Accepted
- **Date:** 2026-07-06

## Context

Atlas must be a monorepo of many apps and packages. The starting point is the Satūs
Next.js 16 starter as a single application at the repo root — and that app currently
carries a large in-flight migration (Tailwind → styled-components). Rewriting the working
starter into a monorepo layout in place, mid-migration, would entangle Atlas with an
unrelated diff and risk breaking a working app.

The repo's own recent history is explicitly *additive* ("additive setup", "additive
plugin CLI", "self-pruning machinery").

## Decision

Build Atlas **additively**: introduce `packages/*`, `apps/*`, and `docs/atlas/*`
alongside the existing root application rather than rewriting it. The existing root app is
the seed of `apps/website` and will be migrated into the workspace deliberately, as its
own stage (Stage 9), not as a prerequisite.

pnpm workspaces are enabled by extending `pnpm-workspace.yaml` with `packages/*` and
`apps/*` globs. New packages carry their own `package.json`.

## Consequences

- Every step is reversible; the working starter keeps building throughout.
- Atlas work never collides with the in-flight styled-components migration.
- Temporary duplication: the root app and a future `apps/website` coexist until Stage 9
  consolidates them. Accepted as the price of non-destructive progress.

## Alternatives considered

- **In-place transformation** — move root app to `apps/website` immediately. Rejected:
  destructive, entangles with the in-flight diff, breaks reversibility.
- **Separate repository** — build Atlas fresh elsewhere. Rejected: loses the Satūs
  component library, tooling, and conventions that Atlas should reuse.
