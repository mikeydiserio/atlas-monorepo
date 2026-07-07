import type { LayoutDefinition } from './types'

/**
 * The layout registry (ADR-0005). Adding a layout to the platform is
 * registration only — the renderer and editor discover everything they need
 * from the definition. No editor logic ever changes for a new layout.
 */

// biome-ignore lint/suspicious/noExplicitAny: heterogeneous option types are erased at the registry boundary; entries re-validate options via their own schema at use time.
type AnyLayoutDefinition = LayoutDefinition<any>

const layouts = new Map<string, AnyLayoutDefinition>()

export function registerLayout(def: AnyLayoutDefinition): void {
  if (layouts.has(def.id)) {
    throw new Error(
      `Layout '${def.id}' is already registered. Layout ids are stable public contracts — ` +
        `pick a new id instead of re-registering.`
    )
  }
  layouts.set(def.id, def)
}

export function getLayout(id: string): AnyLayoutDefinition | undefined {
  return layouts.get(id)
}

export function hasLayout(id: string): boolean {
  return layouts.has(id)
}

/** Sorted for stable palette ordering in the editor. */
export function listLayouts(): AnyLayoutDefinition[] {
  return [...layouts.values()].sort((a, b) => a.id.localeCompare(b.id))
}

/** Test-only escape hatch; production code must never unregister layouts. */
export function clearLayoutRegistryForTesting(): void {
  layouts.clear()
}
