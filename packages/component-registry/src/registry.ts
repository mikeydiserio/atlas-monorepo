import type { ComponentCategory, ComponentDefinition } from './types'

/**
 * The component registry (ADR-0005). The editor palette, the renderer, and prop
 * validation all discover components from here. No switch statements, no
 * hard-coded mappings — adding a component is registration only.
 */

// biome-ignore lint/suspicious/noExplicitAny: prop types are erased at the registry boundary; every use re-validates via the entry's own schema.
type AnyComponentDefinition = ComponentDefinition<any>

const components = new Map<string, AnyComponentDefinition>()

export function registerComponent(def: AnyComponentDefinition): void {
  if (components.has(def.id)) {
    throw new Error(
      `Component '${def.id}' is already registered. Component ids are stable public ` +
        `contracts referenced by page definitions — pick a new id instead.`
    )
  }
  if (def.version < 1) {
    throw new Error(`Component '${def.id}' must have version >= 1.`)
  }
  components.set(def.id, def)
}

export function getComponent(id: string): AnyComponentDefinition | undefined {
  return components.get(id)
}

export function hasComponent(id: string): boolean {
  return components.has(id)
}

/** Sorted for stable palette ordering. */
export function listComponents(category?: ComponentCategory): AnyComponentDefinition[] {
  const all = [...components.values()].sort((a, b) => a.id.localeCompare(b.id))
  return category ? all.filter((c) => c.category === category) : all
}

/** Test-only escape hatch; production code must never unregister components. */
export function clearComponentRegistryForTesting(): void {
  components.clear()
}
