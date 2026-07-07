[![SATUS](https://assets.darkroom.engineering/satus/banner.gif)](https://github.com/darkroomengineering/satus)

# Satūs

A modern Next.js 16 starter with React 19, Tailwind CSS v4, and optional WebGL. *Satūs* means "beginning" in Latin.

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/darkroomengineering/satus)

> **Note**: This README is for template developers. For client handoff, see [PROD-README.md](PROD-README.md).

Run `bun dev` and open [localhost:3000](http://localhost:3000) — the landing page is a step-by-step manual that walks you from a fresh clone to a shippable site. The rest of this README is the reference version.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/darkroomengineering/satus&project-name=satus&repository-name=satus)

> After deploying, set `NEXT_PUBLIC_BASE_URL` to your domain in the project's environment variables — it drives SEO, canonical URLs, sitemaps, and social cards.

## Monorepo (Atlas)

This repository is now the **Atlas** monorepo — pnpm workspaces orchestrated by [Nx](https://nx.dev). Everything from the "Features" section down documents the original Satūs starter, which lives on as [`apps/nextjs-starter`](apps/nextjs-starter). Atlas architecture docs are in [`docs/atlas`](docs/atlas).

```
apps/
  dashboard/          Agency + tenant admin, hosts the page editor  (@atlas/dashboard, port 3001)
  website/            Multi-tenant renderer                         (@atlas/website,   port 3002)
  nextjs-starter/     The original Satūs starter, preserved
packages/
  shared/             Zod schemas, domain types, pure utils — depends on nothing
  ui/ theme-engine/ layout-engine/ component-registry/ page-builder/ …
```

### Requirements

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | >= 22 | pinned in `.nvmrc` |
| pnpm | 11.x | pinned via `packageManager` in `package.json` — `corepack enable` installs it |

### Everyday commands

```bash
pnpm install                          # install all workspace dependencies

# Start an app in dev mode
pnpm nx dev @atlas/dashboard          # dashboard → http://localhost:3001
pnpm nx dev @atlas/website            # website   → http://localhost:3002
pnpm dev:dashboard                    # shorthand scripts in the root package.json
pnpm dev:website

# Build / typecheck
pnpm nx build @atlas/website          # one app (dependencies build first, results cached)
pnpm build                            # everything (nx run-many -t build)
pnpm typecheck                        # everything (nx run-many -t typecheck)

# Only what changed
pnpm nx affected -t typecheck build   # projects affected vs. main — same as CI

# Explore the workspace
pnpm nx graph                         # interactive project dependency graph
pnpm nx show projects                 # every project Nx sees
```

Nx infers targets from each project's `package.json` scripts — no `project.json` files needed. Cached targets (`build`, `typecheck`, `lint`, `test`) replay instantly when inputs haven't changed; cache config lives in `nx.json`.

### Creating a new shareable package

1. **Scaffold the folder and manifest:**

   ```bash
   mkdir -p packages/my-package/src
   ```

   `packages/my-package/package.json`:

   ```json
   {
     "name": "@atlas/my-package",
     "version": "0.0.0",
     "private": true,
     "description": "One-line responsibility statement.",
     "type": "module",
     "exports": { ".": "./src/index.ts" },
     "main": "./src/index.ts",
     "types": "./src/index.ts",
     "dependencies": {
       "@atlas/shared": "workspace:*"
     }
   }
   ```

2. **Add a barrel:** `packages/my-package/src/index.ts` — everything public exports from here.

3. **Respect the tiers.** Dependencies only point downward — `shared` imports nothing internal; apps may import anything. See [`docs/atlas/01-architecture.md`](docs/atlas/01-architecture.md) §3.

4. **Consume it:** add `"@atlas/my-package": "workspace:*"` to the consumer's dependencies, then run `pnpm install` to link it.

Packages are consumed **as source** (`exports` points at `src/index.ts`) — no build step; the consuming Next.js apps transpile them. Nx discovers the new package automatically; verify with `pnpm nx show projects`.

---

## Features

- **Next.js 16 + React 19** — App Router with React 19.2 and strict TypeScript out of the box
- **Tailwind v4** — Tailwind CSS v4 alongside CSS Modules
- **Components in Storybook** — every UI primitive is catalogued in Storybook, isolated with controls and docs
- **Opt-in integrations** — Sanity, Shopify, HubSpot, and WebGL stay isolated under `lib/integrations` until you configure them
- **Interactive setup** — strip the integrations you don't need from a fresh clone
- **One-command handoff** — strips branding, swaps in the prod README, and generates a component inventory
- **Modern tooling** — Bun, Biome, and Turbopack

## Requirements

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | >= 22.0.0 | Required for native fetch and modern APIs |
| Bun | >= 1.3.5 | Package manager & runtime |

## Quick Start

```bash
bun install
cp .env.example .env.local   # set NEXT_PUBLIC_BASE_URL
bun dev                      # open localhost:3000 for the manual
```

Trim what you don't need: `bun run setup:project` strips unused integrations (code, deps, env) interactively.

## Components live in Storybook

UI primitives are catalogued in Storybook rather than on an in-app page — isolated, with controls and autodocs. Source lives in `components/ui`; add a `*.stories.tsx` next to any new component.

```bash
bun storybook
```

**Hosting it (optional).** Storybook is its own static build, not a Next route. To serve it at `/storybook` on a deployment, create a second Vercel project from this repo (build command `bun run build-storybook`, output directory `storybook-static`), then set `NEXT_PUBLIC_STORYBOOK_URL` to its URL on the **Preview** environment. The app proxies `/storybook` to it there, and keeps the route disabled in Production by design.

## Integrations are opt-in plugins

Satūs keeps integrations — Sanity, Shopify, HubSpot, WebGL — isolated under `lib/integrations` (and `lib/webgl`). They only activate once you set their env vars, and each folder carries a `// USAGE` note showing how to wire it in. None is surfaced in the default app.

- **Use one** — set its env vars (see `lib/env.ts`) and follow the `// USAGE` reference in its folder.
- **Drop the ones you don't need** — `bun run setup:project`.
- **Add one back later** — `bun run satus add <plugin>` restores it into a living project.

### Plugins

The public satus repo is the registry: `satus add` pulls an integration's source payload from it and re-wires shared files (`next.config.ts`, barrels, env stubs) through idempotent AST operations — adding twice is a no-op.

```bash
bun run satus list           # All plugins and their installed status
bun run satus add <plugin>   # Restore one (resolves `requires` transitively)
```

`satus add` flags:

| Flag | Effect |
|------|--------|
| `--from <path>` | Use a local satus checkout as the payload source |
| `--ref <gitRef>` | Fetch the GitHub tarball at this ref |
| `--dry-run` | Print what would happen without writing anything |
| `--force` | Overwrite existing / locally modified files |
| `--yes` | Skip confirmation prompts (CI) |
| `--skip-install` | Write package.json but do not run `bun install` |

Payloads are version-matched: a successful `setup:project` run records the git HEAD sha into package.json as `"satus": { "ref": … }`, and `satus add` fetches that pinned ref by default (`--ref` overrides it; without either it falls back to `main`).

`setup:project` is also drivable non-interactively (CI): `--preset <key>` or `--keep <id,id,...>` selects the integration set, `--yes` confirms it, `--clean-homepage` swaps in a blank starter homepage, and `--skip-install` skips the lockfile update.

When setup completes it removes its own machinery from the project (the setup script and the CLI's test suites) — `satus add`, `generate`, `doctor`, and `dev` stay.

## Tech Stack

| Category | Technologies |
|----------|--------------|
| Framework | Next.js 16, React 19.2, TypeScript |
| Styling | Tailwind CSS v4, CSS Modules |
| Catalogue | Storybook |
| Optional | React Three Fiber, GSAP, Sanity, Shopify, HubSpot |
| Tooling | Bun, Biome, Turbopack |

> **Note**: `hamo` and `tempus` are Darkroom-owned packages published on a `dev` pre-release dist-tag. They do not follow semver guarantees — pin exact versions and review changes when bumping.

## Project Structure

```
app/                    # Next.js pages and routes (page.tsx is the manual)
components/             # UI components (catalogued in Storybook)
lib/                    # Everything non-UI
  ├── hooks/           # Custom React hooks
  ├── integrations/    # Opt-in plugins (Sanity, Shopify, HubSpot…)
  ├── styles/          # CSS & Tailwind
  ├── webgl/           # 3D graphics (opt-in)
  └── dev/             # Debug tools (optional)
```

> **Mental model:** UI → `components/`, everything else → `lib/`. Integrations are opt-in plugins, not baked-in defaults.

## Documentation

| Area | Documentation |
|------|---------------|
| Engineering Standards | [AGENTS.md](AGENTS.md) - Canonical rules for all AI tools and contributors |
| Architecture | [ARCHITECTURE.md](ARCHITECTURE.md) - Key decisions, patterns, customization |
| Component Catalogue | Storybook (`bun storybook`) - Isolated UI primitives with docs |
| Component Inventory | [COMPONENTS.md](COMPONENTS.md) - Auto-generated component/hook/utility manifest |
| Changelog | [CHANGELOG.md](CHANGELOG.md) - Release history and versioning policy |
| App Router | [app/README.md](app/README.md) - Pages, layouts, routing |
| Components | [components/README.md](components/README.md) - UI reference |
| Library | [lib/README.md](lib/README.md) - Hooks, utils, integrations |
| Integrations | [lib/integrations/README.md](lib/integrations/README.md) - Sanity, Shopify, etc. |

## Scripts

```bash
bun dev              # Development server
bun build            # Production build
bun storybook        # Component catalogue
bun lint             # Biome linter
bun run generate     # Generate pages/components
bun run setup:project  # Strip integrations you don't need
bun run satus list   # Plugins and their installed status
bun run satus add <plugin>  # Restore an integration from the satus repo
bun run handoff      # Prepare for client delivery
```

## Client Handoff

Prepare the codebase for client delivery:

```bash
bun run handoff
```

This interactive script:
- Removes Satūs branding
- Swaps README with the production version
- Generates a component inventory
- Updates package.json with the project name

## Key Conventions

- **Images**: Use `@/components/ui/image` (never `next/image` directly)
- **Links**: Use `@/components/ui/link` (auto-handles external links)
- **CSS Modules**: Import as `s` → `import s from './component.module.css'`
- **Debug Tools**: Toggle with `Cmd/Ctrl + O`

## Deployment

```bash
vercel
```

**Required GitHub Secret**: `VERCEL_TOKEN` for Lighthouse CI workflow.

See [ARCHITECTURE.md](ARCHITECTURE.md) for deployment checklist and cache strategies.

## License

MIT - Built by [darkroom.engineering](https://darkroom.engineering)
