# Architecture Decision Records

Each ADR captures one significant decision: its context, the decision, and its
consequences. ADRs are immutable once accepted — to change a decision, add a new ADR that
supersedes the old one.

| # | Title | Status |
|---|---|---|
| [0001](./0001-additive-monorepo.md) | Additive monorepo on top of Satūs | Accepted |
| [0002](./0002-supabase-no-orm.md) | Supabase client, no additional ORM | Accepted |
| [0003](./0003-rls-tenant-isolation.md) | Shared schema with RLS for tenant isolation | Accepted |
| [0004](./0004-pages-as-data.md) | Pages are data (JSON), rendered client-side | Accepted |
| [0005](./0005-registry-driven.md) | Registry-driven layouts and components | Accepted |
| [0006](./0006-zod-source-of-truth.md) | Zod schemas as the single source of truth | Accepted |

## Template

```md
# ADR-NNNN: Title

- **Status:** Proposed | Accepted | Superseded by ADR-XXXX
- **Date:** YYYY-MM-DD

## Context
What forces are at play? What problem must be solved?

## Decision
What we will do.

## Consequences
What becomes easier, what becomes harder, what we accept as a trade-off.

## Alternatives considered
What else was on the table and why it lost.
```
