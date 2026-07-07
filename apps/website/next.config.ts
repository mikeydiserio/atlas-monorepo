import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  transpilePackages: [
    '@atlas/shared',
    '@atlas/theme-engine',
    '@atlas/ui',
    '@atlas/layout-engine',
    '@atlas/component-registry',
  ],
}

export default nextConfig
