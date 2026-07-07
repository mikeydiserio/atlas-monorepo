# ADR-0004: Pages are data (JSON), rendered client-side

- **Status:** Accepted
- **Date:** 2026-07-06

## Context

The platform is headless and must serve any future surface (web, mobile, kiosk, digital
signage) from one content model. If the API returned HTML, it would bake in the web
renderer and lock out every other surface, and it would couple content to presentation.

## Decision

A page is a **structured JSON document** — a `PageDefinition`: metadata, SEO, a layout
tree of `LayoutNode`s and `ComponentNode`s, and publishing state. The API returns page
definitions and never returns HTML. Rendering happens entirely in the consuming frontend
(`apps/website` for web) by walking the tree and resolving nodes against the layout and
component registries.

## Consequences

- The same page definition renders on any surface that implements the registries for its
  medium. Web is the first consumer, not the only possible one.
- Content and presentation are cleanly separated; a redesign is a renderer change, not a
  content migration.
- The page model becomes a public contract that must be versioned carefully (component
  instances record the schema `version` they were authored against — see ADR-0005/0006).
- Rendering is the frontend's job; the API stays thin and cacheable.

## Alternatives considered

- **Server-rendered HTML from the API** — simplest for web, fatal for headless. Rejected.
- **Markdown/portable-text documents** — good for prose, insufficient for a
  layout/region/component composition model with typed props. Rejected as the primary
  model (rich-text *within* a component still uses portable text).
