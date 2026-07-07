import { z } from 'zod'
import { defineComponent } from '../types'
import { hasComponent, registerComponent } from '../registry'

/**
 * Reference components. Semantic, theme-agnostic markup that proves the
 * registry pattern end to end: schema-driven props, derived field editors,
 * defaults, and version migration. The full presentational library (Stage 7)
 * layers styled-components + theme tokens on top of the same definitions —
 * business/props contracts never change for styling.
 *
 * `hero` is deliberately at version 2 with a v1→v2 migration (`title` →
 * `heading`) so the migration path is exercised from day one, not discovered
 * the first time production needs it.
 */

const heroSchema = z.object({
  heading: z.string().min(1).describe('Main headline'),
  subheading: z.string().optional().describe('Supporting line under the headline'),
  align: z.enum(['left', 'center']).default('center'),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
})

export const hero = defineComponent<z.infer<typeof heroSchema>>({
  id: 'hero',
  name: 'Hero',
  icon: 'sparkles',
  category: 'marketing',
  version: 2,
  schema: heroSchema,
  defaultProps: { heading: 'Headline', align: 'center' },
  fields: {
    heading: { inline: true, group: 'Content' },
    subheading: { inline: true, group: 'Content' },
    align: { group: 'Appearance' },
    ctaLabel: { group: 'Call to action' },
    ctaHref: { control: 'url', group: 'Call to action' },
  },
  migrations: {
    // v1 used `title`; v2 renamed it to `heading`.
    1: (props) => {
      const { title, ...rest } = props
      return { ...rest, heading: title ?? rest.heading }
    },
  },
  description: 'Large headline banner with optional CTA.',
  render: (props) => (
    <header data-atlas-component="hero" data-align={props.align}>
      <h1>{props.heading}</h1>
      {props.subheading ? <p>{props.subheading}</p> : null}
      {props.ctaLabel && props.ctaHref ? <a href={props.ctaHref}>{props.ctaLabel}</a> : null}
    </header>
  ),
})

const richTextSchema = z.object({
  /** Portable-text/HTML-safe content arrives pre-sanitised from the CMS layer. */
  html: z.string().default(''),
})

export const richText = defineComponent<z.infer<typeof richTextSchema>>({
  id: 'rich-text',
  name: 'Rich Text',
  icon: 'text',
  category: 'content',
  version: 1,
  schema: richTextSchema,
  defaultProps: { html: '' },
  fields: { html: { control: 'richtext', inline: true } },
  description: 'Free-form formatted text.',
  render: (props) => (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: content is sanitised upstream in @atlas/cms before it ever reaches a page definition.
    <div data-atlas-component="rich-text" dangerouslySetInnerHTML={{ __html: props.html }} />
  ),
})

const ctaSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  variant: z.enum(['primary', 'secondary', 'ghost']).default('primary'),
})

export const cta = defineComponent<z.infer<typeof ctaSchema>>({
  id: 'cta',
  name: 'CTA',
  icon: 'mouse-pointer-click',
  category: 'marketing',
  version: 1,
  schema: ctaSchema,
  defaultProps: { label: 'Learn more', href: '#', variant: 'primary' },
  fields: {
    label: { inline: true },
    href: { control: 'url' },
  },
  description: 'Call-to-action button.',
  render: (props) => (
    <a data-atlas-component="cta" data-variant={props.variant} href={props.href}>
      {props.label}
    </a>
  ),
})

const imageSchema = z.object({
  src: z.string().min(1).describe('Asset URL'),
  alt: z.string().default('').describe('Accessible description; empty for decorative images'),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
})

export const image = defineComponent<z.infer<typeof imageSchema>>({
  id: 'image',
  name: 'Image',
  icon: 'image',
  category: 'media',
  version: 1,
  schema: imageSchema,
  defaultProps: { src: '', alt: '' },
  fields: { src: { control: 'image' } },
  description: 'A single image from the asset library.',
  render: (props) =>
    props.src ? (
      <img
        data-atlas-component="image"
        src={props.src}
        alt={props.alt}
        width={props.width}
        height={props.height}
        loading="lazy"
        decoding="async"
      />
    ) : null,
})

const BASIC = [hero, richText, cta, image] as const

/** Register the reference set. Idempotent. */
export function registerBasicComponents(): void {
  for (const component of BASIC) {
    if (!hasComponent(component.id)) registerComponent(component)
  }
}
