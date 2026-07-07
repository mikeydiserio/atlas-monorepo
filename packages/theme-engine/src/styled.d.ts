import type { AtlasTheme } from './theme'

/**
 * styled-components module augmentation: every `${({ theme }) => …}` in the
 * platform is typed as AtlasTheme. One declaration, platform-wide inference.
 */
declare module 'styled-components' {
  // biome-ignore lint/suspicious/noEmptyInterface: interface-extends is the documented styled-components augmentation pattern.
  export interface DefaultTheme extends AtlasTheme {}
}
