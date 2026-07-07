import styled from 'styled-components'

export const Marquee = styled.section`
  display: flex;
  overflow-x: clip;
`

export const Inner = styled.div`
  display: flex;
  white-space: nowrap;
  transform: translate3d(0, 0, 0);

  > * {
    flex-shrink: 0;
  }
`
