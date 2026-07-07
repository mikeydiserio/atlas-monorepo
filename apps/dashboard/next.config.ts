import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  compiler: {
    // SSR-friendly styled-components (display names, deterministic class hashes).
    styledComponents: true,
  },
  // Platform packages ship TypeScript source; Next transpiles them in-app.
  transpilePackages: [
    '@atlas/shared',
    '@atlas/theme-engine',
    '@atlas/ui',
    '@atlas/layout-engine',
    '@atlas/component-registry',
    '@atlas/page-builder',
  ],
}

export default nextConfig
