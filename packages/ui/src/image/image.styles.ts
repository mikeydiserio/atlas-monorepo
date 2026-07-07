import styled from 'styled-components'
import NextImage from 'next/image'

export const StyledImage = styled(NextImage)<{ $block?: boolean }>`
  ${({ $block }) =>
    $block &&
    `
    width: auto;
    height: auto;
    display: block;
  `}
`
