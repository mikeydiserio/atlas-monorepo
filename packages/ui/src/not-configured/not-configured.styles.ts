import { Link } from '@/components/ui/link'
import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  padding: calc(80 / 375 * 100vw) calc(20 / 375 * 100vw);

  @media (width >= 800px) {
    padding: calc(120 / 1440 * 100vw) 0;
  }
`

export const Panel = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: calc(460 / 375 * 100vw);
  background: var(--surface);
  border: 1px solid var(--line-strong);
  border-radius: calc(6 / 375 * 100vw);
  overflow: hidden;

  @media (width >= 800px) {
    max-width: calc(560 / 1440 * 100vw);
    border-radius: calc(6 / 1440 * 100vw);
  }
`

export const Meta = styled.div`
  padding: calc(28 / 375 * 100vw) calc(24 / 375 * 100vw);
  border-bottom: 1px solid var(--line);

  @media (width >= 800px) {
    padding: calc(36 / 1440 * 100vw) calc(32 / 1440 * 100vw);
  }
`

export const Label = styled.div`
  font-family: var(--font-mono);
  font-size: calc(9 / 375 * 100vw);
  font-weight: 400;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  opacity: 0.45;
  margin-bottom: calc(10 / 375 * 100vw);

  @media (width >= 800px) {
    font-size: calc(11 / 1440 * 100vw);
    margin-bottom: calc(12 / 1440 * 100vw);
  }
`

export const Title = styled.h1`
  font-family: var(--font-mono);
  font-size: calc(22 / 375 * 100vw);
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1;
  color: var(--color-secondary);
  margin-bottom: calc(10 / 375 * 100vw);

  @media (width >= 800px) {
    font-size: calc(32 / 1440 * 100vw);
    margin-bottom: calc(12 / 1440 * 100vw);
  }
`

export const Accent = styled.span`
  color: var(--color-contrast);
`

export const Description = styled.p`
  font-family: var(--font-mono);
  font-size: calc(11 / 375 * 100vw);
  line-height: 1.6;
  opacity: 0.45;

  @media (width >= 800px) {
    font-size: calc(12 / 1440 * 100vw);
  }
`

export const Instructions = styled.div`
  padding: calc(24 / 375 * 100vw) calc(24 / 375 * 100vw);
  border-bottom: 1px solid var(--line);

  @media (width >= 800px) {
    padding: calc(28 / 1440 * 100vw) calc(32 / 1440 * 100vw);
  }
`

export const InstructionsLabel = styled.div`
  font-family: var(--font-mono);
  font-size: calc(9 / 375 * 100vw);
  font-weight: 400;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-contrast);
  margin-bottom: calc(14 / 375 * 100vw);

  @media (width >= 800px) {
    font-size: calc(10 / 1440 * 100vw);
    margin-bottom: calc(16 / 1440 * 100vw);
  }
`

export const Steps = styled.ol`
  list-style: decimal;
  padding-left: calc(18 / 375 * 100vw);
  margin: 0;
  font-family: var(--font-mono);
  font-size: calc(11 / 375 * 100vw);
  line-height: 1.6;
  opacity: 0.7;

  @media (width >= 800px) {
    padding-left: calc(20 / 1440 * 100vw);
    font-size: calc(12 / 1440 * 100vw);
  }

  li {
    margin-bottom: calc(8 / 375 * 100vw);

    @media (width >= 800px) {
      margin-bottom: calc(8 / 1440 * 100vw);
    }
  }
`

export const StepsAfter = styled.ol`
  list-style: decimal;
  padding-left: calc(18 / 375 * 100vw);
  margin: 0;
  font-family: var(--font-mono);
  font-size: calc(11 / 375 * 100vw);
  line-height: 1.6;
  opacity: 0.7;
  margin-top: calc(10 / 375 * 100vw);

  @media (width >= 800px) {
    padding-left: calc(20 / 1440 * 100vw);
    font-size: calc(12 / 1440 * 100vw);
    margin-top: calc(12 / 1440 * 100vw);
  }
`

export const Code = styled.code`
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--surface-2);
  padding: 0.1em 0.3em;
  border-radius: 2px;
  border: 1px solid var(--line);
`

export const EnvBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: calc(4 / 375 * 100vw);
  margin-top: calc(10 / 375 * 100vw);
  padding: calc(12 / 375 * 100vw) calc(14 / 375 * 100vw);
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: calc(4 / 375 * 100vw);

  @media (width >= 800px) {
    gap: calc(5 / 1440 * 100vw);
    margin-top: calc(10 / 1440 * 100vw);
    padding: calc(14 / 1440 * 100vw) calc(16 / 1440 * 100vw);
    border-radius: calc(4 / 1440 * 100vw);
  }
`

export const EnvVar = styled.div`
  font-family: var(--font-mono);
  font-size: calc(10 / 375 * 100vw);
  color: var(--color-contrast);

  @media (width >= 800px) {
    font-size: calc(12 / 1440 * 100vw);
  }
`

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(16 / 375 * 100vw);
  padding: calc(18 / 375 * 100vw) calc(24 / 375 * 100vw);
  background: var(--surface-2);

  @media (width >= 800px) {
    padding: calc(20 / 1440 * 100vw) calc(32 / 1440 * 100vw);
  }
`

export const Hint = styled.div`
  font-family: var(--font-mono);
  font-size: calc(10 / 375 * 100vw);
  opacity: 0.45;
  line-height: 1.5;

  @media (width >= 800px) {
    font-size: calc(11 / 1440 * 100vw);
  }
`

export const DocsLink = styled(Link)`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: calc(5 / 375 * 100vw);
  font-family: var(--font-mono);
  font-size: calc(10 / 375 * 100vw);
  font-weight: 400;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-secondary);
  opacity: 0.7;
  transition: opacity var(--duration-fast) ease;

  &:hover {
    opacity: 1;
  }

  @media (width >= 800px) {
    gap: calc(6 / 1440 * 100vw);
    font-size: calc(11 / 1440 * 100vw);
  }
`
