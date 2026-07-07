import styled from 'styled-components'

export const Scrollbar = styled.div`
  position: fixed;
  right: 0;
  bottom: 0;
  top: 0;
  z-index: 2;

  @media (width <= 799.98px) {
    display: none;
  }
`

export const Inner = styled.div`
  height: 100%;
  position: relative;
`

export const Thumb = styled.div`
  height: 80px;
  width: 8px;
  background-color: var(--color-blue);
  position: absolute;
  right: 0;
  border-radius: 4px;
  cursor: grab;
`
