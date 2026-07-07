import * as S from './not-configured.styles'

interface NotConfiguredProps {
  /**
   * Name of the integration (e.g., 'Sanity', 'Shopify', 'HubSpot')
   */
  integration: string
  /**
   * Optional description of what the integration does
   */
  description?: string
  /**
   * Link to the integration's documentation or setup guide
   */
  docsUrl?: string
  /**
   * Environment variables required for this integration
   */
  envVars?: string[]
  /**
   * Additional CSS classes
   */
  className?: string
}

const INTEGRATION_INFO: Record<
  string,
  { description: string; docsUrl: string; envVars: string[] }
> = {
  Sanity: {
    description: 'Headless CMS with visual editing and real-time collaboration',
    docsUrl: 'https://www.sanity.io/docs',
    envVars: [
      'NEXT_PUBLIC_SANITY_PROJECT_ID',
      'NEXT_PUBLIC_SANITY_DATASET',
      'NEXT_PUBLIC_SANITY_API_READ_TOKEN',
    ],
  },
  Shopify: {
    description: 'E-commerce platform with cart and checkout functionality',
    docsUrl: 'https://shopify.dev/docs/storefronts/headless',
    envVars: ['SHOPIFY_STORE_DOMAIN', 'SHOPIFY_STOREFRONT_ACCESS_TOKEN'],
  },
  HubSpot: {
    description: 'Marketing forms and newsletter integration',
    docsUrl: 'https://developers.hubspot.com/docs/api/overview',
    envVars: ['HUBSPOT_ACCESS_TOKEN', 'NEXT_PUBLIC_HUBSPOT_PORTAL_ID'],
  },
  Mailchimp: {
    description: 'Email marketing and newsletter subscriptions',
    docsUrl: 'https://mailchimp.com/developer/',
    envVars: [
      'MAILCHIMP_API_KEY',
      'MAILCHIMP_SERVER_PREFIX',
      'MAILCHIMP_AUDIENCE_ID',
    ],
  },
}

/**
 * Displays a friendly message when an integration is not configured.
 *
 * Use this in example pages to show helpful setup instructions instead of crashing.
 *
 * @example
 * ```tsx
 * import { isConfigured } from '@/integrations/registry'
 * import { NotConfigured } from '@/components/ui/not-configured'
 *
 * export default function SanityPage() {
 *   if (!isConfigured('sanity')) {
 *     return <NotConfigured integration="Sanity" />
 *   }
 *   // ... rest of page
 * }
 * ```
 */
export function NotConfigured({
  integration,
  description,
  docsUrl,
  envVars,
  className,
}: NotConfiguredProps) {
  const info = INTEGRATION_INFO[integration]
  const finalDescription = description ?? info?.description
  const finalDocsUrl = docsUrl ?? info?.docsUrl
  const finalEnvVars = envVars ?? info?.envVars ?? []

  return (
    <S.Container className={className}>
      <S.Panel>
        <S.Meta>
          <S.Label>Not Configured</S.Label>
          <S.Title>
            <S.Accent>{integration}</S.Accent>
          </S.Title>
          {finalDescription && (
            <S.Description>{finalDescription}</S.Description>
          )}
        </S.Meta>

        <S.Instructions>
          <S.InstructionsLabel>Setup</S.InstructionsLabel>
          <S.Steps>
            <li>
              Copy <S.Code>.env.example</S.Code> to{' '}
              <S.Code>.env.local</S.Code>
            </li>
            <li>Add the required environment variables:</li>
          </S.Steps>

          {finalEnvVars.length > 0 && (
            <S.EnvBlock>
              {finalEnvVars.map((envVar) => (
                <S.EnvVar key={envVar}>
                  <code>{envVar}</code>
                </S.EnvVar>
              ))}
            </S.EnvBlock>
          )}

          <S.StepsAfter start={3}>
            <li>Restart the development server</li>
          </S.StepsAfter>
        </S.Instructions>

        <S.Footer>
          <S.Hint>
            Run <S.Code>bun run setup:project</S.Code> to remove
            unused integrations.
          </S.Hint>
          {finalDocsUrl && (
            <S.DocsLink href={finalDocsUrl}>
              View {integration} Docs
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M7 17L17 7M7 7h10v10" />
              </svg>
            </S.DocsLink>
          )}
        </S.Footer>
      </S.Panel>
    </S.Container>
  )
}
